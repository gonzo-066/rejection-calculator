"use client";

import { useState, useRef } from "react";

const FREQUENCY_OPTIONS = [
  { value: 1, label: "1× per year" },
  { value: 2, label: "2× per year" },
  { value: 3, label: "3× per year" },
  { value: 4, label: "4× per year" },
  { value: 5, label: "5× per year" },
  { value: 6, label: "6× per year" },
  { value: 10, label: "10× per year" },
  { value: 12, label: "12× per year (monthly)" },
];

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function Tooltip({ text }: { text: string }) {
  const [visible, setVisible] = useState(false);
  return (
    <span className="relative inline-flex items-center ml-1.5">
      <button
        type="button"
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
        className="w-4 h-4 rounded-full bg-gray-300 text-gray-600 text-[10px] font-bold flex items-center justify-center hover:bg-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-400"
        aria-label="More information"
      >
        ?
      </button>
      {visible && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 bg-gray-800 text-white text-xs rounded-lg px-3 py-2 shadow-lg z-10 leading-relaxed">
          {text}
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
        </span>
      )}
    </span>
  );
}

function InputField({
  label,
  id,
  value,
  onChange,
  prefix,
  tooltip,
  placeholder,
}: {
  label: string;
  id: string;
  value: string;
  onChange: (v: string) => void;
  prefix?: string;
  tooltip?: string;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-sm font-semibold text-gray-700 flex items-center"
      >
        {label}
        {tooltip && <Tooltip text={tooltip} />}
      </label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-sm pointer-events-none">
            {prefix}
          </span>
        )}
        <input
          id={id}
          type="number"
          min="0"
          step="any"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? "0"}
          className={`w-full border border-gray-200 rounded-xl bg-gray-50 py-2.5 text-gray-900 font-medium text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#0b0f1a] focus:border-transparent hover:border-gray-300 ${prefix ? "pl-8 pr-4" : "px-4"}`}
        />
      </div>
    </div>
  );
}

type RiskLevel = "HIGH" | "MEDIUM" | "LOW";

function getRiskLevel(annualizedLoss: number): RiskLevel {
  if (annualizedLoss > 100000) return "HIGH";
  if (annualizedLoss >= 30000) return "MEDIUM";
  return "LOW";
}

const RISK_CONFIG: Record<
  RiskLevel,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  HIGH: {
    label: "HIGH RISK",
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    dot: "bg-red-500",
  },
  MEDIUM: {
    label: "MEDIUM RISK",
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    border: "border-yellow-200",
    dot: "bg-yellow-500",
  },
  LOW: {
    label: "LOW RISK",
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
    dot: "bg-green-500",
  },
};

export default function Home() {
  const [boxes, setBoxes] = useState("");
  const [costPerBox, setCostPerBox] = useState("");
  const [freightCost, setFreightCost] = useState("");
  const [disposalCost, setDisposalCost] = useState("");
  const [frequency, setFrequency] = useState<number>(1);
  const [results, setResults] = useState<null | {
    totalDirectLoss: number;
    annualizedLoss: number;
    savings50: number;
    riskLevel: RiskLevel;
  }>(null);
  const [showDownload, setShowDownload] = useState(false);
  const [copied, setCopied] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    const b = parseFloat(boxes) || 0;
    const cpb = parseFloat(costPerBox) || 0;
    const fc = parseFloat(freightCost) || 0;
    const dc = parseFloat(disposalCost) || 0;

    const totalDirectLoss = b * cpb + fc + dc;
    const annualizedLoss = totalDirectLoss * frequency;
    const savings50 = annualizedLoss * 0.5;
    const riskLevel = getRiskLevel(annualizedLoss);

    setResults({ totalDirectLoss, annualizedLoss, savings50, riskLevel });
    setShowDownload(false);

    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const summaryText = results
    ? `REJECTION COST CALCULATOR RESULTS
Generated by Axarat — axarat.com
Date: ${new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })}
${"─".repeat(44)}

INPUT SUMMARY
  Rejected Boxes:        ${parseFloat(boxes) || 0} boxes
  Cost per Box:          ${formatCurrency(parseFloat(costPerBox) || 0)}
  Freight Cost:          ${formatCurrency(parseFloat(freightCost) || 0)}
  Disposal Cost:         ${formatCurrency(parseFloat(disposalCost) || 0)}
  Frequency:             ${frequency}× per year

RESULTS
  Total Direct Loss:     ${formatCurrency(results.totalDirectLoss)}
  Annualized Loss:       ${formatCurrency(results.annualizedLoss)}
  50% Reduction Saves:   ${formatCurrency(results.savings50)}
  Risk Level:            ${results.riskLevel}

${"─".repeat(44)}
Want to prevent this? Axarat gives fresh produce
importers real-time visibility into their
shipments.

Start your 15-day pilot: axarat.com/#contact
`
    : "";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hasAnyInput =
    parseFloat(boxes) > 0 ||
    parseFloat(freightCost) > 0 ||
    parseFloat(disposalCost) > 0;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" }}
    >
      {/* Top bar */}
      <div className="w-full py-2 px-6" style={{ backgroundColor: "#0b0f1a" }}>
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Axarat" style={{ height: "48px", width: "auto" }} />
            <span
              className="text-2xl tracking-widest"
              style={{ color: "#00e5c8", fontWeight: 800 }}
            >
              AXARAT
            </span>
          </div>
          <span className="text-white/60 text-xs hidden sm:block">
            Fresh Produce Intelligence
          </span>
        </div>
      </div>

      {/* Hero */}
      <div
        className="w-full py-6 px-6"
        style={{
          background:
            "linear-gradient(135deg, #0b0f1a 0%, #0d1220 60%, #0b0f1a 100%)",
        }}
      >
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-3 py-1 mb-3">
              <span className="w-2 h-2 rounded-full bg-[#00e5c8] animate-pulse" />
              <span className="text-white/90 text-xs font-semibold tracking-wide uppercase">
                Free Calculator Tool
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-2">
              How Much Did Your Last Rejection{" "}
              <span
                style={{
                  color: "#00e5c8",
                  textDecoration: "underline",
                  textDecorationColor: "#00e5c8",
                  textDecorationThickness: "3px",
                  textUnderlineOffset: "4px",
                }}
              >
                Really Cost?
              </span>
            </h1>
            <p className="text-white/80 text-base max-w-xl">
              Enter your numbers below to see your true loss — and what it&apos;s
              costing you every year.
            </p>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 w-full bg-gray-50 px-4 py-5">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Form card */}
          <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-5">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "#0b0f1a" }}
              >
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="font-bold text-gray-900 text-base">
                  Rejection Details
                </h2>
                <p className="text-xs text-gray-500">
                  Enter figures from your last rejection
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                label="Number of Rejected Boxes"
                id="boxes"
                value={boxes}
                onChange={setBoxes}
                placeholder="e.g. 500"
              />
              <InputField
                label="Cost per Box"
                id="costPerBox"
                value={costPerBox}
                onChange={setCostPerBox}
                prefix="$"
                placeholder="e.g. 18.00"
              />
              <InputField
                label="Freight Cost"
                id="freightCost"
                value={freightCost}
                onChange={setFreightCost}
                prefix="$"
                placeholder="e.g. 2400.00"
              />
              <InputField
                label="Disposal / Dumping Cost"
                id="disposalCost"
                value={disposalCost}
                onChange={setDisposalCost}
                prefix="$"
                placeholder="e.g. 800.00"
                tooltip="Include labor, trucking, and dumping fees"
              />
            </div>

            <div className="mt-4">
              <label
                htmlFor="frequency"
                className="text-sm font-semibold text-gray-700 block mb-1.5"
              >
                How often does this happen per year?
              </label>
              <select
                id="frequency"
                value={frequency}
                onChange={(e) => setFrequency(Number(e.target.value))}
                className="w-full border border-gray-200 rounded-xl bg-gray-50 px-4 py-2.5 text-gray-900 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#0b0f1a] focus:border-transparent hover:border-gray-300 transition-all cursor-pointer"
              >
                {FREQUENCY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleCalculate}
              disabled={!hasAnyInput}
              className="mt-5 w-full py-3 rounded-xl font-bold text-[#0b0f1a] text-base tracking-wide transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 active:scale-[0.98] shadow-md"
              style={{ backgroundColor: "#00e5c8" }}
            >
              Calculate My Loss →
            </button>

            <p className="text-center text-xs text-gray-400 mt-2">
              No data is stored. All calculations happen in your browser.
            </p>
          </div>

          {/* Right panel */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {/* How it works */}
            <div
              className="rounded-2xl p-5 border border-cyan-100"
              style={{ backgroundColor: "#ecfeff" }}
            >
              <h3 className="font-bold text-gray-800 text-sm mb-3">
                What This Calculates
              </h3>
              <ul className="space-y-2">
                {[
                  {
                    icon: "📦",
                    title: "Total Direct Loss",
                    desc: "Boxes + freight + disposal",
                  },
                  {
                    icon: "📅",
                    title: "Annualized Loss",
                    desc: "True yearly impact",
                  },
                  {
                    icon: "💡",
                    title: "Potential Savings",
                    desc: "What a 50% fix would save",
                  },
                  {
                    icon: "🚦",
                    title: "Risk Level",
                    desc: "LOW / MEDIUM / HIGH",
                  },
                ].map((item) => (
                  <li key={item.title} className="flex items-start gap-3">
                    <span className="text-lg leading-none mt-0.5">
                      {item.icon}
                    </span>
                    <div>
                      <span className="text-sm font-semibold text-gray-800">
                        {item.title}
                      </span>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Trust badge */}
            <div className="rounded-2xl p-5 bg-white border border-gray-100 shadow-sm">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
                Used By Buyers At
              </p>
              <div className="space-y-1.5">
                {[
                  "Major US grocery chains",
                  "Regional produce distributors",
                  "Import brokers & trading desks",
                ].map((t) => (
                  <div key={t} className="flex items-center gap-2">
                    <svg
                      className="w-3.5 h-3.5 flex-shrink-0"
                      style={{ color: "#0b0f1a" }}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-xs text-gray-600">{t}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sample numbers nudge */}
            <div className="rounded-2xl p-4 bg-white border border-gray-100 shadow-sm">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">
                Quick Example
              </p>
              <p className="text-xs text-gray-500 leading-relaxed">
                500 boxes at $18 + $2,400 freight + $800 disposal ={" "}
                <span className="font-semibold text-gray-700">
                  $12,200 per incident
                </span>
                . At 4× per year that&apos;s{" "}
                <span className="font-semibold" style={{ color: "#0b0f1a" }}>
                  $48,800/yr
                </span>{" "}
                at risk.
              </p>
            </div>
          </div>
        </div>

        {/* Results */}
        {results && (
          <div
            ref={resultsRef}
            className="max-w-5xl mx-auto mt-6 animate-fade-in-up"
          >
            {/* Results header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px flex-1 bg-gray-200" />
              <span className="text-sm font-bold text-gray-400 uppercase tracking-widest px-2">
                Your Rejection Impact Report
              </span>
              <div className="h-px flex-1 bg-gray-200" />
            </div>

            {/* Metrics grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              {/* Total Direct Loss */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-fade-in-up-delay-1">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
                  Total Direct Loss
                </p>
                <p className="text-3xl font-bold text-gray-900 mb-1">
                  {formatCurrency(results.totalDirectLoss)}
                </p>
                <p className="text-xs text-gray-500">Per rejection incident</p>
              </div>

              {/* Annualized Loss */}
              <div
                className="rounded-2xl p-6 animate-fade-in-up-delay-2"
                style={{ backgroundColor: "#0b0f1a" }}
              >
                <p className="text-xs font-semibold text-white/60 uppercase tracking-widest mb-1">
                  Annualized Loss
                </p>
                <p className="text-3xl font-bold text-white mb-1">
                  {formatCurrency(results.annualizedLoss)}
                </p>
                <p className="text-xs text-white/60">{frequency}× per year</p>
              </div>

              {/* 50% Reduction */}
              <div
                className="rounded-2xl p-6 animate-fade-in-up-delay-3"
                style={{
                  backgroundColor: "#e6fcf9",
                  border: "1px solid #99f0e4",
                }}
              >
                <p
                  className="text-xs font-semibold uppercase tracking-widest mb-1"
                  style={{ color: "#0f766e" }}
                >
                  50% Reduction Saves
                </p>
                <p
                  className="text-3xl font-bold mb-1"
                  style={{ color: "#0d9488" }}
                >
                  {formatCurrency(results.savings50)}
                </p>
                <p className="text-xs" style={{ color: "#0f766e" }}>
                  Per year back in your pocket
                </p>
              </div>
            </div>

            {/* Risk Level Bar */}
            <div
              className={`rounded-2xl p-5 border flex items-center gap-4 mb-4 animate-fade-in-up-delay-4 ${RISK_CONFIG[results.riskLevel].bg} ${RISK_CONFIG[results.riskLevel].border}`}
            >
              <div
                className={`w-3 h-3 rounded-full flex-shrink-0 ${RISK_CONFIG[results.riskLevel].dot}`}
              />
              <div className="flex-1">
                <span
                  className={`font-bold text-sm ${RISK_CONFIG[results.riskLevel].text}`}
                >
                  Risk Level:{" "}
                  <span className="text-base">
                    {RISK_CONFIG[results.riskLevel].label}
                  </span>
                </span>
                <p
                  className={`text-xs mt-0.5 ${RISK_CONFIG[results.riskLevel].text} opacity-80`}
                >
                  {results.riskLevel === "HIGH" &&
                    "Annualized loss exceeds $100,000 — immediate QC intervention recommended."}
                  {results.riskLevel === "MEDIUM" &&
                    "Annualized loss between $30,000–$100,000 — a structured QC program would pay for itself quickly."}
                  {results.riskLevel === "LOW" &&
                    "Annualized loss under $30,000 — still worth reviewing your QC process to protect margins."}
                </p>
              </div>
              <div
                className={`text-2xl font-black ${RISK_CONFIG[results.riskLevel].text} opacity-20 hidden sm:block`}
              >
                {results.riskLevel === "HIGH"
                  ? "!!!"
                  : results.riskLevel === "MEDIUM"
                    ? "!!"
                    : "!"}
              </div>
            </div>

            {/* CTA Box */}
            <div
              className="rounded-2xl p-7 mb-5"
              style={{
                background:
                  "linear-gradient(135deg, #0b0f1a 0%, #0d1220 100%)",
              }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                  <p className="text-white font-bold text-base mb-1.5">
                    Want to prevent this?
                  </p>
                  <p className="text-white/80 text-sm leading-relaxed">
                    Axarat gives fresh produce importers real-time visibility
                    into their shipments, so problems show up before the
                    rejection does. Visit{" "}
                    <span className="text-[#00e5c8] font-semibold">
                      axarat.com
                    </span>
                  </p>
                </div>
                <a
                  href="https://axarat.com/#contact"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 inline-block px-6 py-3 rounded-xl font-bold text-sm transition-all hover:brightness-110 active:scale-95 text-[#0b0f1a]"
                  style={{ backgroundColor: "#00e5c8" }}
                >
                  Start your 15-day pilot →
                </a>
              </div>
            </div>

            {/* Download Results */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-gray-800 text-sm">
                    Download Results
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Copy a formatted summary to share with your team
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowDownload((p) => !p)}
                    className="px-4 py-2 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    {showDownload ? "Hide" : "Show Summary"}
                  </button>
                  {showDownload && (
                    <button
                      onClick={handleCopy}
                      className="px-4 py-2 rounded-lg text-xs font-bold text-white transition-all hover:brightness-110"
                      style={{ backgroundColor: "#0b0f1a" }}
                    >
                      {copied ? "Copied ✓" : "Copy Text"}
                    </button>
                  )}
                </div>
              </div>
              {showDownload && (
                <textarea
                  readOnly
                  value={summaryText}
                  rows={18}
                  className="w-full font-mono text-xs bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-700 focus:outline-none resize-none"
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="w-full py-5 px-6" style={{ backgroundColor: "#0b0f1a" }}>
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Axarat" style={{ height: "32px", width: "auto" }} />
            <span
              className="text-lg tracking-widest"
              style={{ color: "#00e5c8", fontWeight: 800 }}
            >
              AXARAT
            </span>
          </div>
          <p className="text-xs text-white/60 text-center">
            Real-time visibility for fresh produce importers
          </p>
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} Axarat. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
