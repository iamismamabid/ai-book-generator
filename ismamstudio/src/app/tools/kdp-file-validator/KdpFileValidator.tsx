"use client";

import { useRef, useState } from "react";
import ToolShell from "@/components/tools/ToolShell";
import { CheckCircle2, XCircle, AlertTriangle, Upload, FileCheck, Info, Loader2 } from "lucide-react";

// Standard KDP trim sizes (inches)
const KDP_TRIMS: [number, number][] = [
  [5, 8], [5.06, 7.81], [5.25, 8], [5.5, 8.5], [6, 9], [6.14, 9.21],
  [6.69, 9.61], [7, 10], [7.44, 9.69], [7.5, 9.25], [8, 10], [8.25, 6],
  [8.25, 8.25], [8.5, 8.5], [8.5, 11], [8.27, 11.69],
];

const BLEED_W = 0.125;
const BLEED_H = 0.25; // 0.125" top + 0.125" bottom

type Status = "pass" | "warn" | "fail";

interface CheckResult {
  status: Status;
  title: string;
  detail: string;
}

const STATUS_META: Record<Status, { icon: typeof CheckCircle2; cls: string; border: string }> = {
  pass: { icon: CheckCircle2, cls: "text-emerald-400", border: "border-emerald-500/20 bg-emerald-500/5" },
  warn: { icon: AlertTriangle, cls: "text-amber-400", border: "border-amber-500/20 bg-amber-500/5" },
  fail: { icon: XCircle, cls: "text-rose-400", border: "border-rose-500/20 bg-rose-500/5" },
};

function isClose(a: number, b: number, tol = 0.02): boolean {
  return Math.abs(a - b) <= tol;
}

export default function KdpFileValidator() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");
  const [checks, setChecks] = useState<CheckResult[]>([]);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");

  const validate = async (file: File) => {
    setWorking(true);
    setError("");
    setChecks([]);
    setFileName(file.name);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const bytes = await file.arrayBuffer();
      const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const results: CheckResult[] = [];

      // 1. File size
      const mb = file.size / (1024 * 1024);
      results.push(
        mb <= 650
          ? {
              status: mb > 400 ? "warn" : "pass",
              title: "File size",
              detail: `${mb.toFixed(1)} MB — ${mb > 400 ? "under the 650 MB limit, but large files convert slowly. Consider compressing." : "well within KDP's 650 MB limit."}`,
            }
          : { status: "fail", title: "File size", detail: `${mb.toFixed(1)} MB exceeds KDP's 650 MB manuscript limit. Compress before uploading.` }
      );

      // 2. Page count
      const pageCount = doc.getPageCount();
      results.push(
        pageCount >= 24 && pageCount <= 828
          ? { status: "pass", title: "Page count", detail: `${pageCount} pages — within KDP's paperback range (24–828 for black ink on white paper).` }
          : pageCount < 24
            ? { status: "fail", title: "Page count", detail: `${pageCount} pages — KDP paperbacks need at least 24 pages. Add content or padding pages.` }
            : { status: "fail", title: "Page count", detail: `${pageCount} pages exceeds the 828-page maximum for standard paperbacks. Split into volumes.` }
      );

      // 3. Page size consistency
      const sizes = doc.getPages().map((p) => {
        const { width, height } = p.getSize();
        return [width / 72, height / 72] as [number, number];
      });
      const [firstW, firstH] = sizes[0];
      const inconsistent = sizes.findIndex(([w, h]) => !isClose(w, firstW) || !isClose(h, firstH));
      results.push(
        inconsistent === -1
          ? { status: "pass", title: "Consistent page size", detail: `All ${pageCount} pages are ${firstW.toFixed(2)}" × ${firstH.toFixed(2)}".` }
          : {
              status: "fail",
              title: "Consistent page size",
              detail: `Page ${inconsistent + 1} is ${sizes[inconsistent][0].toFixed(2)}" × ${sizes[inconsistent][1].toFixed(2)}" but page 1 is ${firstW.toFixed(2)}" × ${firstH.toFixed(2)}". KDP requires every page to be the same size.`,
            }
      );

      // 4. Trim size match
      const exactTrim = KDP_TRIMS.find(([w, h]) => isClose(firstW, w) && isClose(firstH, h));
      const bleedTrim = KDP_TRIMS.find(([w, h]) => isClose(firstW, w + BLEED_W) && isClose(firstH, h + BLEED_H));
      if (exactTrim) {
        results.push({
          status: "pass",
          title: "KDP trim size",
          detail: `Matches the standard ${exactTrim[0]}" × ${exactTrim[1]}" trim (no bleed). Select "No Bleed" when uploading.`,
        });
      } else if (bleedTrim) {
        results.push({
          status: "pass",
          title: "KDP trim size (with bleed)",
          detail: `Matches ${bleedTrim[0]}" × ${bleedTrim[1]}" trim with 0.125" bleed. Select "Bleed (PDF only)" when uploading.`,
        });
      } else {
        results.push({
          status: "warn",
          title: "KDP trim size",
          detail: `${firstW.toFixed(3)}" × ${firstH.toFixed(3)}" doesn't match a standard KDP trim size (with or without bleed). Custom trims are allowed within 4"–8.5" × 6"–11.69", but standard sizes ship faster.`,
        });
      }

      // 5. Encryption
      results.push(
        doc.isEncrypted
          ? { status: "fail", title: "Password protection", detail: "This PDF is encrypted. KDP rejects password-protected files — export an unprotected copy." }
          : { status: "pass", title: "Password protection", detail: "No encryption detected." }
      );

      // 6. Even page note
      results.push(
        pageCount % 2 === 0
          ? { status: "pass", title: "Even page count", detail: "Even number of pages — clean sheet layout for printing." }
          : { status: "warn", title: "Odd page count", detail: `${pageCount} pages is odd — KDP will add a blank page at the end automatically. Add your own final page if you want control over it.` }
      );

      setChecks(results);
    } catch {
      setError("Could not read this PDF. It may be corrupted or use unsupported features.");
    } finally {
      setWorking(false);
    }
  };

  const failCount = checks.filter((c) => c.status === "fail").length;
  const warnCount = checks.filter((c) => c.status === "warn").length;

  const faqs = [
    {
      q: "Does this guarantee KDP will accept my file?",
      a: "No — it checks the structural rules KDP enforces at upload (trim size, page count, consistency, encryption), but KDP's own online previewer performs additional checks like font embedding and image resolution after upload.",
    },
    {
      q: "What if my trim size doesn't match a standard KDP size?",
      a: "KDP allows custom trims within its supported range — the validator will warn rather than fail, since custom sizes are valid but ship slightly slower.",
    },
    {
      q: "Why does it flag an odd page count?",
      a: "KDP automatically adds a blank final page to make an odd page count even — the validator flags it so you can add your own final page if you want control over what's there.",
    },
  ];

  return (
    <ToolShell
      title="KDP File"
      highlight="Validator"
      subtitle="Pre-flight your interior PDF against Amazon KDP's requirements — trim size, page count, consistency, and file limits — before you upload."
      maxWidth="max-w-5xl"
      faqs={faqs}
    >
      <div className="space-y-8">
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border border-dashed border-slate-800 hover:border-indigo-500 rounded-[2rem] p-10 text-center bg-slate-900/35 cursor-pointer transition-all"
        >
          {working ? (
            <Loader2 className="w-10 h-10 text-yellow-500 mx-auto mb-3 animate-spin" />
          ) : (
            <Upload className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          )}
          <span className="text-sm text-slate-200 font-bold block">
            {working ? "Validating…" : fileName ? `Validated: ${fileName} — click to check another` : "Click to select your interior PDF"}
          </span>
          <span className="text-[10px] text-slate-600 block mt-1">
            Validation runs locally in your browser — your manuscript is never uploaded
          </span>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && validate(e.target.files[0])}
          />
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/25 rounded-2xl p-5 text-sm font-bold text-rose-300">
            {error}
          </div>
        )}

        {checks.length > 0 && (
          <>
            <div
              className={`rounded-[2rem] p-8 border flex items-center gap-4 ${
                failCount > 0
                  ? "bg-rose-500/10 border-rose-500/25"
                  : warnCount > 0
                    ? "bg-amber-500/10 border-amber-500/25"
                    : "bg-emerald-500/10 border-emerald-500/25"
              }`}
            >
              <FileCheck
                className={`w-10 h-10 shrink-0 ${
                  failCount > 0 ? "text-rose-400" : warnCount > 0 ? "text-amber-400" : "text-emerald-400"
                }`}
              />
              <div>
                <h3 className="text-xl font-black text-white">
                  {failCount > 0
                    ? `${failCount} Blocking Issue${failCount > 1 ? "s" : ""} Found`
                    : warnCount > 0
                      ? "Ready With Warnings"
                      : "Ready For KDP Upload"}
                </h3>
                <p className="text-xs font-bold text-slate-300">
                  {checks.filter((c) => c.status === "pass").length} passed · {warnCount} warnings ·{" "}
                  {failCount} failures
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {checks.map((c, i) => {
                const meta = STATUS_META[c.status];
                return (
                  <div key={i} className={`rounded-2xl p-5 border flex items-start gap-3 ${meta.border}`}>
                    <meta.icon className={`w-5 h-5 shrink-0 mt-0.5 ${meta.cls}`} />
                    <div>
                      <span className="text-sm font-black text-white block">{c.title}</span>
                      <span className="text-xs font-semibold text-slate-400 leading-relaxed">{c.detail}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        <div className="bg-slate-950/60 border border-slate-900 rounded-2xl p-4 flex items-start gap-3">
          <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
          <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
            This validator covers the structural checks KDP enforces at upload (dimensions, page
            counts, encryption). It can&apos;t verify font embedding or image DPI from the browser —
            KDP&apos;s own previewer flags those after upload, so always review the online proof.
          </p>
        </div>
      </div>
    </ToolShell>
  );
}
