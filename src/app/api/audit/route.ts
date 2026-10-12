import Groq from "groq-sdk";

// Prioritize active vision models on Groq
const MULTIMODAL_MODELS = [
  "qwen/qwen3.8-27b",
  "llama-3.2-90b-vision-preview",
  "llama-3.2-11b-vision-preview",
];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { image, policy } = body as { image?: string; policy?: string };

    if (!image || !policy) {
      return Response.json(
        { error: "Both receipt image and expense policy are required." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: "GROQ_API_KEY is not configured in the server environment." },
        { status: 500 }
      );
    }

    const groq = new Groq({ apiKey });

    // Format data URL correctly if raw base64 was sent
    const imageUrl = image.startsWith("data:")
      ? image
      : `data:image/jpeg;base64,${image}`;

    const promptText = `You are a ruthless, expert forensic accountant and AI auditor. I am providing you with a company expense policy and an image of a receipt. 1. Read the receipt accurately. 2. Cross-reference every item, date, and total against the policy. 3. Look for hidden violations (e.g., alcohol, tips exceeding limits, weekend dates). Return STRICTLY valid JSON with no markdown wrapping. Format: { "status": "PASS" | "FLAG" | "REJECT", "extracted_total": "$XX.XX", "date": "YYYY-MM-DD", "violations": ["violation 1"], "auditor_notes": "Detailed reasoning" }

Company Expense Policy:
"""
${policy}
"""`;

    // Try available vision models, falling back gracefully
    let lastError: unknown = null;
    let content = "";

    for (const model of MULTIMODAL_MODELS) {
      try {
        const response = await groq.chat.completions.create({
          model,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: promptText,
                },
                {
                  type: "image_url",
                  image_url: {
                    url: imageUrl,
                  },
                },
              ],
            },
          ],
          temperature: 0.1,
          max_tokens: 800,
        });

        content = response.choices[0]?.message?.content?.trim() || "";
        if (content) break;
      } catch (err: unknown) {
        lastError = err;
        const errStr = String(err);
        // If decommissioned or model not found, try the next model
        if (
          errStr.includes("model_decommissioned") ||
          errStr.includes("not found") ||
          errStr.includes("deprecated")
        ) {
          continue;
        }
        throw err;
      }
    }

    if (!content && lastError) {
      throw lastError;
    }

    // Clean any accidental markdown code fences from the output
    let cleanedContent = content;
    if (cleanedContent.startsWith("```json")) {
      cleanedContent = cleanedContent.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
    } else if (cleanedContent.startsWith("```")) {
      cleanedContent = cleanedContent.replace(/^```\s*/, "").replace(/```$/, "").trim();
    }

    let parsedResult;
    try {
      parsedResult = JSON.parse(cleanedContent);
    } catch {
      // Fallback regex in case model included extraneous text
      const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error(`Failed to parse AI auditor response as JSON: ${content}`);
      }
    }

    return Response.json(parsedResult);
  } catch (error: unknown) {
    console.error("[AuditGuard API Error]:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal forensic audit processing error";
    return Response.json({ error: errorMessage }, { status: 500 });
  }
}
