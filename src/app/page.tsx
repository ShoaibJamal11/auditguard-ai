"use client";

import React, { useState, useRef, useCallback } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  ScanLine,
  Upload,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
  DollarSign,
  Calendar,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  Receipt,
  Eye,
  Info,
} from "lucide-react";

interface AuditResponse {
  status: "PASS" | "FLAG" | "REJECT";
  extracted_total: string;
  date: string;
  violations: string[];
  auditor_notes: string;
  merchant?: string;
}

const DEFAULT_POLICY = `1. Maximum meal allowance is $50.
2. No reimbursement for alcoholic beverages.
3. Meals are only valid on weekdays (Monday-Friday).
4. Tips must not exceed 20%.`;

export default function AuditGuardPage() {
  const [policy, setPolicy] = useState(DEFAULT_POLICY);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AuditResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedJson, setCopiedJson] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to format file size
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  // Process uploaded image file
  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Invalid file format. Please upload an image (PNG, JPG, JPEG, WEBP).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Image file exceeds the 10MB forensic upload threshold.");
      return;
    }

    setError(null);
    setFileName(file.name);
    setFileSize(formatBytes(file.size));

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setImagePreview(dataUrl);
      setImageBase64(dataUrl);
    };
    reader.onerror = () => {
      setError("Failed to parse image file. Please try another image.");
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  // Generate quick test receipts using HTML5 canvas
  const loadDemoReceipt = (type: "violating" | "compliant") => {
    const canvas = document.createElement("canvas");
    canvas.width = 600;
    canvas.height = 800;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background receipt paper texture
    ctx.fillStyle = "#fafafa";
    ctx.fillRect(0, 0, 600, 800);

    // Subtle paper border
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 3;
    ctx.strokeRect(10, 10, 580, 780);

    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 26px monospace";
    ctx.textAlign = "center";

    if (type === "violating") {
      ctx.fillText("THE RED LION PUB & GRILL", 300, 60);
      ctx.font = "14px monospace";
      ctx.fillText("404 Silicon Alley, Suite 100", 300, 88);
      ctx.fillText("Tel: (555) 019-2834", 300, 108);

      ctx.font = "16px monospace";
      ctx.fillText("--------------------------------------------------", 300, 135);
      ctx.textAlign = "left";
      ctx.fillText("DATE: 2024-10-13 (SUNDAY)      TIME: 20:45", 40, 165);
      ctx.fillText("SERVER: Marcus H.              TABLE: 14", 40, 195);
      ctx.textAlign = "center";
      ctx.fillText("--------------------------------------------------", 300, 225);

      ctx.textAlign = "left";
      ctx.font = "16px monospace";
      ctx.fillText("1x Wagyu Bacon Burger             $26.00", 40, 265);
      ctx.fillText("1x Truffle Parmesan Fries          $12.50", 40, 305);
      ctx.fillText("2x Craft IPA Draft Beer           $18.00", 40, 345);
      ctx.fillText("1x Glenfiddich Single Malt Scotch  $22.00", 40, 385);

      ctx.textAlign = "center";
      ctx.fillText("--------------------------------------------------", 300, 425);
      ctx.textAlign = "left";
      ctx.fillText("SUBTOTAL:                         $78.50", 40, 460);
      ctx.fillText("TAX (8.875%):                      $6.97", 40, 495);
      ctx.fillText("TIP / GRATUITY (28.0%):           $22.00", 40, 530);
      ctx.font = "bold 20px monospace";
      ctx.fillText("TOTAL AMOUNT:                    $107.47", 40, 575);

      ctx.font = "14px monospace";
      ctx.textAlign = "center";
      ctx.fillText("==================================================", 300, 620);
      ctx.fillText("VISA Card ending in 9812", 300, 650);
      ctx.fillText("APPROVAL CODE: 839201", 300, 675);
      ctx.fillText("THANK YOU FOR YOUR PATRONAGE!", 300, 715);
      ctx.fillText("** CUSTOMER COPY **", 300, 745);

      setFileName("demo-receipt-violating.png");
    } else {
      ctx.fillText("METRO BISTRO & DELI", 300, 60);
      ctx.font = "14px monospace";
      ctx.fillText("120 Broadway Ave, Floor 1", 300, 88);
      ctx.fillText("Tel: (555) 782-9910", 300, 108);

      ctx.font = "16px monospace";
      ctx.fillText("--------------------------------------------------", 300, 135);
      ctx.textAlign = "left";
      ctx.fillText("DATE: 2024-10-16 (WEDNESDAY)   TIME: 12:30", 40, 165);
      ctx.fillText("SERVER: Sarah K.               ORDER: #4092", 40, 195);
      ctx.textAlign = "center";
      ctx.fillText("--------------------------------------------------", 300, 225);

      ctx.textAlign = "left";
      ctx.font = "16px monospace";
      ctx.fillText("1x Roasted Chicken Panini         $16.50", 40, 265);
      ctx.fillText("1x Mixed Greens Salad              $8.00", 40, 305);
      ctx.fillText("1x Sparkling Mineral Water         $4.50", 40, 345);

      ctx.textAlign = "center";
      ctx.fillText("--------------------------------------------------", 300, 395);
      ctx.textAlign = "left";
      ctx.fillText("SUBTOTAL:                         $29.00", 40, 435);
      ctx.fillText("TAX (8.5%):                        $2.47", 40, 470);
      ctx.fillText("TIP (18%):                         $5.22", 40, 505);
      ctx.font = "bold 20px monospace";
      ctx.fillText("TOTAL AMOUNT:                     $36.69", 40, 550);

      ctx.font = "14px monospace";
      ctx.textAlign = "center";
      ctx.fillText("==================================================", 300, 600);
      ctx.fillText("AMEX Card ending in 4104", 300, 635);
      ctx.fillText("APPROVAL CODE: 442190", 300, 660);
      ctx.fillText("THANK YOU FOR LUNCHING WITH US!", 300, 700);

      setFileName("demo-receipt-compliant.png");
    }

    const dataUrl = canvas.toDataURL("image/png");
    setImagePreview(dataUrl);
    setImageBase64(dataUrl);
    setFileSize("145 KB");
    setError(null);
    setResult(null);
  };

  // Trigger forensic audit
  const runForensicAudit = async () => {
    if (!imageBase64) {
      setError("Please upload or drag a receipt image before initiating audit.");
      return;
    }
    if (!policy.trim()) {
      setError("Corporate policy guidelines cannot be empty.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: imageBase64,
          policy: policy.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Server responded with status ${response.status}`);
      }

      setResult(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to execute forensic audit";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const copyJsonToClipboard = () => {
    if (!result) return;
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200 antialiased font-sans flex flex-col">
      {/* Top Enterprise Navigation Bar */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-md shadow-indigo-500/20 border border-indigo-400/30">
              <ShieldAlert className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-white">
                  AuditGuard<span className="text-indigo-400"> AI</span>
                </span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 font-semibold tracking-wider">
                  v2.4 Enterprise
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium hidden sm:block">
                Forensic T&amp;E Expense Policy &amp; Fraud Intelligence Engine
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 text-xs font-mono text-slate-400 bg-slate-950/60 px-3 py-1.5 rounded-md border border-slate-800">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Llama-3.2 Vision Preview Active</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Sub-header Banner */}
        <div className="mb-8 border-b border-slate-800/80 pb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Forensic Expense Audit Engine
          </h1>
          <p className="mt-1.5 text-sm text-slate-400 max-w-3xl">
            Automated deep receipt forensics cross-verifying line items, time of transaction,
            alcohol consumption, tip inflation, and policy thresholds with zero hallucination.
          </p>
        </div>

        {/* Two-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ========================================================= */}
          {/* LEFT COLUMN: Inputs (5 or 6 cols on lg)                  */}
          {/* ========================================================= */}
          <div className="lg:col-span-5 space-y-6">
            {/* Card 1: Corporate Expense Policy Textarea */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl shadow-black/40">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-indigo-400" />
                  Corporate Policy Rules
                </label>
                <button
                  onClick={() => setPolicy(DEFAULT_POLICY)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1 font-medium"
                  title="Reset to default strict policy"
                >
                  <RefreshCw className="h-3 w-3" />
                  Reset Defaults
                </button>
              </div>

              <div className="relative">
                <textarea
                  value={policy}
                  onChange={(e) => setPolicy(e.target.value)}
                  rows={6}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-200 placeholder-slate-600 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all resize-y leading-relaxed"
                  placeholder="Enter corporate expense guidelines..."
                />
              </div>

              <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between font-mono">
                <span>Rules: 4 strict parameters</span>
                <span>Enforced by Groq Forensic Model</span>
              </div>
            </div>

            {/* Card 2: Receipt Image Ingestion Zone */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl shadow-black/40">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-indigo-400" />
                  Receipt Ingestion Zone
                </label>
                {imagePreview && (
                  <button
                    onClick={() => {
                      setImagePreview(null);
                      setImageBase64(null);
                      setFileName(null);
                      setFileSize(null);
                    }}
                    className="text-xs text-rose-400 hover:text-rose-300 transition-colors font-medium"
                  >
                    Clear Image
                  </button>
                )}
              </div>

              {/* Upload Dropzone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 transition-all duration-200 cursor-pointer flex flex-col items-center justify-center text-center group ${
                  isDragging
                    ? "border-indigo-500 bg-indigo-950/20 shadow-inner"
                    : imagePreview
                    ? "border-slate-700 bg-slate-950/40 hover:border-slate-600"
                    : "border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-950"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/jpg"
                  className="hidden"
                  onChange={handleFileChange}
                />

                {imagePreview ? (
                  <div className="w-full flex flex-col items-center">
                    <div className="relative group/preview max-h-56 max-w-full overflow-hidden rounded-lg border border-slate-800 bg-slate-950">
                      <img
                        src={imagePreview}
                        alt="Receipt preview"
                        className="max-h-56 object-contain rounded-md"
                      />
                      <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center gap-2 text-xs font-medium text-white">
                        <Eye className="h-4 w-4" />
                        Click to change image
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-xs font-mono text-slate-300 bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700">
                      <FileText className="h-3.5 w-3.5 text-indigo-400" />
                      <span className="truncate max-w-[200px]">{fileName}</span>
                      <span className="text-slate-500">|</span>
                      <span className="text-slate-400">{fileSize}</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-4">
                    <div className="h-12 w-12 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-400 group-hover:text-indigo-400 group-hover:border-indigo-500/50 group-hover:bg-slate-800 transition-all mb-3 shadow-md">
                      <Upload className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-semibold text-slate-200">
                      Drag &amp; drop receipt here, or{" "}
                      <span className="text-indigo-400 group-hover:underline">browse files</span>
                    </p>
                    <p className="text-xs text-slate-500 mt-1 font-mono">
                      High-resolution PNG, JPG, WEBP (Max 10MB)
                    </p>
                  </div>
                )}
              </div>

              {/* Instant Demo Data Loaders */}
              <div className="mt-4 pt-3 border-t border-slate-800/80">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3 text-indigo-400" />
                  Load Sample Synthetic Receipt for Instant Testing:
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      loadDemoReceipt("violating");
                    }}
                    className="text-xs font-mono py-2 px-3 rounded-lg bg-rose-950/30 hover:bg-rose-900/40 border border-rose-800/40 text-rose-300 transition-colors flex items-center justify-center gap-1.5 font-medium"
                  >
                    <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
                    Load Violating Receipt
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      loadDemoReceipt("compliant");
                    }}
                    className="text-xs font-mono py-2 px-3 rounded-lg bg-emerald-950/30 hover:bg-emerald-900/40 border border-emerald-800/40 text-emerald-300 transition-colors flex items-center justify-center gap-1.5 font-medium"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    Load Clean Receipt
                  </button>
                </div>
              </div>
            </div>

            {/* Error Message Alert */}
            {error && (
              <div className="bg-rose-950/40 border border-rose-800/60 rounded-xl p-4 flex items-start gap-3 shadow-lg">
                <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-rose-200">Audit Engine Notice</p>
                  <p className="text-rose-300/90 mt-0.5 text-xs font-mono">{error}</p>
                </div>
              </div>
            )}

            {/* Primary Action Button */}
            <button
              onClick={runForensicAudit}
              disabled={loading || !imageBase64}
              className={`w-full py-4 px-6 rounded-xl font-bold text-sm tracking-wide transition-all duration-200 flex items-center justify-center space-x-3 shadow-xl ${
                loading
                  ? "bg-indigo-900/60 text-indigo-200 cursor-not-allowed border border-indigo-700/50"
                  : !imageBase64
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                  : "bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] text-white shadow-indigo-600/30 hover:shadow-indigo-500/40 border border-indigo-400/40 cursor-pointer"
              }`}
            >
              {loading ? (
                <>
                  <RefreshCw className="h-5 w-5 animate-spin text-indigo-300" />
                  <span>Cross-Examining Receipt Forensics...</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="h-5 w-5 text-indigo-200" />
                  <span>RUN FORENSIC AUDIT</span>
                  <ScanLine className="h-4 w-4 ml-1 opacity-75" />
                </>
              )}
            </button>
          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: Output / Report (7 cols on lg)              */}
          {/* ========================================================= */}
          <div className="lg:col-span-7">
            {/* Loading State Animation */}
            {loading && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 sm:p-12 shadow-2xl flex flex-col items-center justify-center text-center min-h-[460px] relative overflow-hidden">
                {/* Visual scanner bar animation */}
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent animate-pulse" />

                <div className="relative mb-6">
                  <div className="h-20 w-20 rounded-full border-2 border-indigo-500/30 flex items-center justify-center animate-spin">
                    <div className="h-16 w-16 rounded-full border-t-2 border-indigo-400" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ScanLine className="h-8 w-8 text-indigo-400 animate-pulse" />
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white tracking-tight">
                  AI Auditor analyzing receipt forensics...
                </h3>
                <p className="text-xs text-slate-400 mt-2 max-w-md font-mono">
                  Vision model extracting line items, querying policy bounds, calculating tips,
                  and assessing fraud probability.
                </p>

                {/* Progress Indicators */}
                <div className="mt-8 space-y-2.5 w-full max-w-sm text-left font-mono text-xs text-slate-400">
                  <div className="flex items-center gap-2 bg-slate-950/60 p-2.5 rounded border border-slate-800/80">
                    <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400 animate-pulse" />
                    <span>Optical text &amp; number extraction</span>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-950/60 p-2.5 rounded border border-slate-800/80">
                    <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400 animate-pulse" />
                    <span>Cross-referencing corporate rules</span>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-950/60 p-2.5 rounded border border-slate-800/80">
                    <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400 animate-pulse" />
                    <span>Synthesizing audit verdict</span>
                  </div>
                </div>
              </div>
            )}

            {/* Empty State / Initial Standby State */}
            {!loading && !result && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 sm:p-12 shadow-2xl flex flex-col items-center justify-center text-center min-h-[460px]">
                <div className="h-16 w-16 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-600 mb-4 shadow-inner">
                  <ShieldCheck className="h-8 w-8 text-slate-500" />
                </div>
                <h3 className="text-base font-bold text-slate-200">
                  Compliance Terminal Standby
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-md">
                  Upload an employee meal or travel receipt to run forensic fraud detection and
                  policy rule verification.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-2 text-[11px] font-mono text-slate-500">
                  <span className="bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
                    Alcohol Detection
                  </span>
                  <span className="bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
                    Weekend Filtering
                  </span>
                  <span className="bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
                    Tip Cap Calculation
                  </span>
                  <span className="bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
                    Per-Diem Verification
                  </span>
                </div>
              </div>
            )}

            {/* Audit Report Result View */}
            {!loading && result && (
              <div className="space-y-6">
                {/* Main Verdict Card */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl relative overflow-hidden">
                  {/* Subtle top indicator bar */}
                  <div
                    className={`absolute top-0 inset-x-0 h-1.5 ${
                      result.status === "PASS"
                        ? "bg-emerald-500"
                        : result.status === "FLAG"
                        ? "bg-amber-500"
                        : "bg-rose-500"
                    }`}
                  />

                  {/* Header & Status Badge */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-semibold">
                        Forensic Audit Verdict
                      </span>
                      <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                        {result.merchant ? result.merchant : "Receipt Evaluation"}
                      </h2>
                    </div>

                    {/* Shadcn-Style Badge */}
                    <div>
                      {result.status === "PASS" && (
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold font-mono tracking-wide bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm shadow-emerald-500/10">
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                          <span>STATUS: PASS (COMPLIANT)</span>
                        </div>
                      )}
                      {result.status === "FLAG" && (
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold font-mono tracking-wide bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-sm shadow-amber-500/10">
                          <AlertTriangle className="h-4 w-4 text-amber-400" />
                          <span>STATUS: FLAG (MANUAL REVIEW)</span>
                        </div>
                      )}
                      {result.status === "REJECT" && (
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold font-mono tracking-wide bg-rose-500/10 text-rose-400 border border-rose-500/30 shadow-sm shadow-rose-500/10">
                          <XCircle className="h-4 w-4 text-rose-400" />
                          <span>STATUS: REJECT (OUT OF POLICY)</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Key Metrics Grid */}
                  <div className="grid grid-cols-2 gap-4 py-5 border-b border-slate-800">
                    <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80">
                      <div className="flex items-center gap-2 text-slate-400 text-xs font-mono mb-1">
                        <DollarSign className="h-3.5 w-3.5 text-indigo-400" />
                        Extracted Total
                      </div>
                      <div className="text-2xl font-black text-white font-mono tracking-tight">
                        {result.extracted_total || "N/A"}
                      </div>
                    </div>

                    <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80">
                      <div className="flex items-center gap-2 text-slate-400 text-xs font-mono mb-1">
                        <Calendar className="h-3.5 w-3.5 text-indigo-400" />
                        Transaction Date
                      </div>
                      <div className="text-xl sm:text-2xl font-bold text-white font-mono tracking-tight">
                        {result.date || "N/A"}
                      </div>
                    </div>
                  </div>

                  {/* Violations Section */}
                  <div className="py-5 border-b border-slate-800">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-rose-400" />
                        Violations Detected ({result.violations?.length || 0})
                      </h4>
                    </div>

                    {result.violations && result.violations.length > 0 ? (
                      <ul className="space-y-2">
                        {result.violations.map((violation, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-3 p-3 rounded-lg bg-rose-950/20 border border-rose-900/30 text-rose-400 text-sm font-medium"
                          >
                            <XCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
                            <span>{violation}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-950/20 border border-emerald-900/30 text-emerald-400 text-sm">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                        <span>Zero corporate policy infractions identified. Fully compliant.</span>
                      </div>
                    )}
                  </div>

                  {/* Auditor Notes Block */}
                  <div className="pt-5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-2">
                      <Info className="h-4 w-4 text-slate-400" />
                      Forensic Auditor Notes
                    </h4>
                    <div className="bg-slate-950/90 border border-slate-800 rounded-lg p-4 font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                      {result.auditor_notes}
                    </div>
                  </div>
                </div>

                {/* Structured JSON Payload Viewer */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                      Structured Audit Payload (JSON)
                    </span>
                    <button
                      onClick={copyJsonToClipboard}
                      className="text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded border border-slate-700 flex items-center gap-1.5 transition-colors font-mono"
                    >
                      {copiedJson ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-400" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copy JSON</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-xs font-mono text-emerald-400 overflow-x-auto max-h-64 scrollbar-thin">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900/40 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500 font-mono">
          AuditGuard AI &bull; Enterprise Expense Risk &amp; Fraud Surveillance &bull; Powered by Groq Vision
        </div>
      </footer>
    </div>
  );
}
