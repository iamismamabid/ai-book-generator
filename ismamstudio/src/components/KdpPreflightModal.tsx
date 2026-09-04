"use client";

import React, { useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { 
  X, AlertTriangle, AlertOctagon, CheckCircle2, Info, 
  Sparkles, Download, ArrowRight, Wrench, ShieldCheck, 
  Layers, Eye, ExternalLink, HelpCircle
} from "lucide-react";
import { fabric } from "fabric";
import { KdpLayoutResult } from "@/app/utils/kdpLayout";

export interface PreflightFinding {
  id: string;
  severity: "critical" | "warning" | "info";
  category: "spine" | "margin" | "barcode" | "resolution" | "bleed";
  title: string;
  message: string;
  recommendation: string;
  object?: fabric.Object;
  objectLabel?: string;
  autoFixLabel?: string;
  autoFix?: () => void;
}

interface KdpPreflightModalProps {
  isOpen: boolean;
  onClose: () => void;
  canvas: fabric.Canvas | null;
  layout: KdpLayoutResult;
  specs: {
    trimWidth: number;
    trimHeight: number;
    pageCount: number;
    paperType: string;
  };
  onSelectObject?: (obj: fabric.Object) => void;
  onProceedDownload?: () => void;
}

export function runKdpPreflightChecks(
  canvas: fabric.Canvas | null,
  layout: KdpLayoutResult,
  specs: { trimWidth: number; trimHeight: number; pageCount: number; paperType: string }
): PreflightFinding[] {
  if (!canvas) return [];

  const findings: PreflightFinding[] = [];
  const objects = canvas.getObjects().filter((o: any) => !o.excludeFromExport);

  // -------------------------------------------------------------
  // 1. Spine Text Check (< 80 pages is Hard KDP Rejection)
  // -------------------------------------------------------------
  const spineTextObjects: fabric.Object[] = [];

  objects.forEach((obj: any) => {
    if (obj.type === "i-text" || obj.type === "text" || obj.type === "textbox") {
      const rect = obj.getBoundingRect();
      const centerX = rect.left + rect.width / 2;
      const isTaggedSpine = obj.id?.startsWith("spine");
      const isOverSpine = centerX >= layout.spineLeftPx && centerX <= layout.spineRightPx;

      if (isTaggedSpine || isOverSpine) {
        spineTextObjects.push(obj);
      }
    }
  });

  if (specs.pageCount < 80 && spineTextObjects.length > 0) {
    spineTextObjects.forEach((obj, idx) => {
      findings.push({
        id: `spine-pages-low-${idx}`,
        severity: "critical",
        category: "spine",
        title: "Spine Text Prohibited (< 80 Pages)",
        message: `Amazon KDP requires a minimum of 80 pages to print spine text. Your book has ${specs.pageCount} pages, so the spine is too thin to bind with lettering. KDP automated pre-flight will reject this cover file.`,
        recommendation: "Remove spine text or increase your interior page count to 80+ pages.",
        object: obj,
        objectLabel: (obj as any).text ? `"${(obj as any).text.slice(0, 16)}..."` : "Spine Text",
        autoFixLabel: "Remove Spine Text",
        autoFix: () => {
          canvas.remove(obj);
          canvas.discardActiveObject();
          canvas.requestRenderAll();
        }
      });
    });
  } else if (specs.pageCount >= 80 && spineTextObjects.length > 0) {
    // Check for spine fold safety margin (0.0625" inside each fold)
    const spineSafeMarginPx = 0.0625 * layout.scale;
    const safeLeft = layout.spineLeftPx + spineSafeMarginPx;
    const safeRight = layout.spineRightPx - spineSafeMarginPx;

    spineTextObjects.forEach((obj, idx) => {
      const rect = obj.getBoundingRect();
      if (rect.left < safeLeft - 1 || rect.left + rect.width > safeRight + 1) {
        findings.push({
          id: `spine-fold-margin-${idx}`,
          severity: "warning",
          category: "spine",
          title: "Spine Text Near Fold Margin",
          message: `Spine text extends closer than 0.0625" (1/16") to the spine fold edges. Print variation during binding may cause text to wrap onto the front or back cover.`,
          recommendation: "Keep spine text centered with at least 0.0625\" clearance from the folds.",
          object: obj,
          objectLabel: (obj as any).text ? `"${(obj as any).text.slice(0, 16)}..."` : "Spine Text",
          autoFixLabel: "Center on Spine",
          autoFix: () => {
            obj.set({
              left: layout.spineCenterPx,
              originX: "center",
              dirty: true
            });
            canvas.requestRenderAll();
          }
        });
      }
    });
  }

  // -------------------------------------------------------------
  // 2. Safe Live Area Margins (Cut-off Risk)
  // -------------------------------------------------------------
  objects.forEach((obj: any, idx) => {
    // Only check text and important graphics/badges, ignore full backgrounds
    if (obj.type === "i-text" || obj.type === "text" || obj.type === "textbox") {
      const rect = obj.getBoundingRect();
      const centerX = rect.left + rect.width / 2;

      // Skip spine text (already handled in check 1)
      if (centerX >= layout.spineLeftPx && centerX <= layout.spineRightPx) return;
      if (obj.id?.startsWith("spine")) return;

      const isFront = centerX > layout.spineRightPx;
      const textSnippet = obj.text ? `"${obj.text.slice(0, 20)}..."` : "Text Box";

      if (isFront) {
        const outLeft = rect.left < layout.frontLiveLeftPx - 2;
        const outRight = rect.left + rect.width > layout.frontLiveRightPx + 2;
        const outTop = rect.top < layout.frontLiveTopPx - 2;
        const outBottom = rect.top + rect.height > layout.frontLiveBottomPx + 2;

        if (outLeft || outRight || outTop || outBottom) {
          findings.push({
            id: `margin-front-${idx}`,
            severity: "warning",
            category: "margin",
            title: "Front Text Extends Past Safe Margin",
            message: `${textSnippet} crosses into the 0.25" cut hazard zone. Amazon's mechanical paper trimmers can slice through this text during printing.`,
            recommendation: "Shift text inward so it rests comfortably within the orange dashed safe zone.",
            object: obj,
            objectLabel: textSnippet,
            autoFixLabel: "Nudge to Safe Area",
            autoFix: () => {
              let newLeft = obj.left ?? 0;
              let newTop = obj.top ?? 0;
              const curRect = obj.getBoundingRect();
              if (curRect.left < layout.frontLiveLeftPx) {
                newLeft += (layout.frontLiveLeftPx - curRect.left + 6);
              }
              if (curRect.left + curRect.width > layout.frontLiveRightPx) {
                newLeft -= (curRect.left + curRect.width - layout.frontLiveRightPx + 6);
              }
              if (curRect.top < layout.frontLiveTopPx) {
                newTop += (layout.frontLiveTopPx - curRect.top + 6);
              }
              if (curRect.top + curRect.height > layout.frontLiveBottomPx) {
                newTop -= (curRect.top + curRect.height - layout.frontLiveBottomPx + 6);
              }
              obj.set({ left: newLeft, top: newTop, dirty: true });
              canvas.requestRenderAll();
            }
          });
        }
      } else {
        // Back Cover
        const outLeft = rect.left < layout.backLiveLeftPx - 2;
        const outRight = rect.left + rect.width > layout.backLiveRightPx + 2;
        const outTop = rect.top < layout.backLiveTopPx - 2;
        const outBottom = rect.top + rect.height > layout.backLiveBottomPx + 2;

        if (outLeft || outRight || outTop || outBottom) {
          findings.push({
            id: `margin-back-${idx}`,
            severity: "warning",
            category: "margin",
            title: "Back Cover Text Near Trim Edge",
            message: `${textSnippet} crosses into the back cover cut hazard zone. Words placed here may be trimmed off.`,
            recommendation: "Reposition text inside the back cover safe margin.",
            object: obj,
            objectLabel: textSnippet,
            autoFixLabel: "Nudge to Safe Area",
            autoFix: () => {
              let newLeft = obj.left ?? 0;
              let newTop = obj.top ?? 0;
              const curRect = obj.getBoundingRect();
              if (curRect.left < layout.backLiveLeftPx) {
                newLeft += (layout.backLiveLeftPx - curRect.left + 6);
              }
              if (curRect.left + curRect.width > layout.backLiveRightPx) {
                newLeft -= (curRect.left + curRect.width - layout.backLiveRightPx + 6);
              }
              if (curRect.top < layout.backLiveTopPx) {
                newTop += (layout.backLiveTopPx - curRect.top + 6);
              }
              if (curRect.top + curRect.height > layout.backLiveBottomPx) {
                newTop -= (curRect.top + curRect.height - layout.backLiveBottomPx + 6);
              }
              obj.set({ left: newLeft, top: newTop, dirty: true });
              canvas.requestRenderAll();
            }
          });
        }
      }
    }
  });

  // -------------------------------------------------------------
  // 3. KDP Barcode Exclusion Zone Check
  // -------------------------------------------------------------
  // Barcode box: 2.0" wide by 1.2" high on bottom back cover
  const bcW = 2.0 * layout.scale;
  const bcH = 1.2 * layout.scale;
  const bcMargin = 0.375 * layout.scale;
  // Lower-left back cover zone
  const bcBoxLeft = layout.trimLeftPx + bcMargin;
  const bcBoxTop = layout.trimBottomPx - bcMargin - bcH;
  const bcBoxRight = bcBoxLeft + bcW;
  const bcBoxBottom = bcBoxTop + bcH;

  objects.forEach((obj: any, idx) => {
    // Don't flag the barcode placeholder itself or canvas background
    if (obj.id?.startsWith("barcode")) return;
    if (obj.id === "spine-band") return;
    if (obj.type === "rect" && obj.width >= layout.canvasWidth * 0.8) return;

    const rect = obj.getBoundingRect();
    const overlaps = !(
      rect.left > bcBoxRight ||
      rect.left + rect.width < bcBoxLeft ||
      rect.top > bcBoxBottom ||
      rect.top + rect.height < bcBoxTop
    );

    if (overlaps) {
      const isText = obj.type === "i-text" || obj.type === "text" || obj.type === "textbox";
      findings.push({
        id: `barcode-collision-${idx}`,
        severity: isText ? "critical" : "warning",
        category: "barcode",
        title: "Element in KDP Barcode Zone",
        message: `Amazon prints the official retail barcode (2.0" x 1.2") on the lower back cover. Content placed here will be covered or trigger KDP submission rejection.`,
        recommendation: "Keep the lower corner of the back cover clear of text, icons, and logos.",
        object: obj,
        objectLabel: isText ? `"${(obj as any).text?.slice(0, 16)}..."` : "Graphic Object",
        autoFixLabel: "Move Above Barcode",
        autoFix: () => {
          const newTop = bcBoxTop - rect.height - 10;
          obj.set({ top: newTop, dirty: true });
          canvas.requestRenderAll();
        }
      });
    }
  });

  // -------------------------------------------------------------
  // 4. Image Resolution / DPI Check
  // -------------------------------------------------------------
  objects.forEach((obj: any, idx) => {
    if (obj.type === "image") {
      const img = obj as fabric.Image;
      const el = img.getElement() as HTMLImageElement;
      if (el && el.naturalWidth) {
        const renderWidthInches = (obj.getScaledWidth()) / layout.scale;
        const effectiveDPI = Math.round(el.naturalWidth / Math.max(0.1, renderWidthInches));

        if (effectiveDPI < 200) {
          findings.push({
            id: `dpi-low-${idx}`,
            severity: "warning",
            category: "resolution",
            title: `Low Resolution Image (${effectiveDPI} DPI)`,
            message: `This image renders at ~${effectiveDPI} DPI. Amazon KDP requires 300 DPI for crisp print results (200 DPI minimum). It may print visibly blurred or pixelated.`,
            recommendation: "Use higher-resolution source artwork or reduce the image display dimensions.",
            object: obj,
            objectLabel: `Image (${el.naturalWidth}x${el.naturalHeight}px)`
          });
        }
      }
    }
  });

  // -------------------------------------------------------------
  // 5. Positive Guidance Checks (If everything is clear)
  // -------------------------------------------------------------
  if (findings.length === 0) {
    findings.push({
      id: "all-clear",
      severity: "info",
      category: "bleed",
      title: "100% KDP Print Compliant",
      message: `All trim borders, spine safety offsets, and safe live areas match official Amazon KDP paperback print specifications for ${specs.trimWidth}" x ${specs.trimHeight}" (${specs.pageCount} pages).`,
      recommendation: "Your cover file is ready for PDF export and KDP upload!"
    });
  }

  return findings;
}

export default function KdpPreflightModal({
  isOpen,
  onClose,
  canvas,
  layout,
  specs,
  onSelectObject,
  onProceedDownload,
}: KdpPreflightModalProps) {
  const [mounted, setMounted] = useState(false);
  const [findings, setFindings] = useState<PreflightFinding[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const results = runKdpPreflightChecks(canvas, layout, specs);
    setFindings(results);
  }, [isOpen, canvas, layout, specs, refreshTrigger]);

  const criticalCount = findings.filter((f) => f.severity === "critical").length;
  const warningCount = findings.filter((f) => f.severity === "warning").length;
  const isAllClear = criticalCount === 0 && warningCount === 0;

  const handleSelectObject = (obj?: fabric.Object) => {
    if (!obj || !canvas) return;
    canvas.setActiveObject(obj);
    canvas.requestRenderAll();
    onSelectObject?.(obj);
    onClose();
  };

  const handleAutoFix = (fixFn?: () => void) => {
    if (!fixFn) return;
    fixFn();
    setRefreshTrigger((prev) => prev + 1);
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-800 rounded-[2rem] shadow-2xl max-w-2xl w-full p-6 relative max-h-[90vh] flex flex-col overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
          title="Close Inspector"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-1">
          <div className={`p-2.5 rounded-2xl ${
            criticalCount > 0 
              ? "bg-rose-500/20 text-rose-400 border border-rose-500/30" 
              : warningCount > 0 
              ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" 
              : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
          }`}>
            {criticalCount > 0 ? (
              <AlertOctagon className="w-5 h-5" />
            ) : warningCount > 0 ? (
              <AlertTriangle className="w-5 h-5" />
            ) : (
              <ShieldCheck className="w-5 h-5" />
            )}
          </div>
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              KDP Pre-Flight Inspector
              <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                Official Specs
              </span>
            </h2>
            <p className="text-slate-400 text-xs font-semibold">
              Amazon KDP Paperback Print Verification Engine
            </p>
          </div>
        </div>

        {/* Specs Overview Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-4 p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 text-center">
          <div>
            <span className="text-[9px] font-black text-slate-500 uppercase block">Trim Size</span>
            <span className="text-xs font-bold text-slate-200">{specs.trimWidth}" × {specs.trimHeight}"</span>
          </div>
          <div>
            <span className="text-[9px] font-black text-slate-500 uppercase block">Page Count</span>
            <span className="text-xs font-bold text-slate-200">{specs.pageCount} Pages</span>
          </div>
          <div>
            <span className="text-[9px] font-black text-slate-500 uppercase block">Spine Width</span>
            <span className="text-xs font-bold text-indigo-400">{layout.spineWidth.toFixed(3)}"</span>
          </div>
          <div>
            <span className="text-[9px] font-black text-slate-500 uppercase block">Paper / Bleed</span>
            <span className="text-xs font-bold text-slate-200 capitalize">{specs.paperType} / 0.125"</span>
          </div>
        </div>

        {/* Status Banner */}
        <div className={`p-3 rounded-xl mb-3 flex items-center justify-between text-xs font-bold ${
          criticalCount > 0
            ? "bg-rose-950/50 border border-rose-800/60 text-rose-300"
            : warningCount > 0
            ? "bg-amber-950/50 border border-amber-800/60 text-amber-300"
            : "bg-emerald-950/50 border border-emerald-800/60 text-emerald-300"
        }`}>
          <div className="flex items-center gap-2">
            {criticalCount > 0 ? (
              <AlertOctagon className="w-4 h-4 shrink-0 text-rose-400" />
            ) : warningCount > 0 ? (
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            )}
            <span>
              {criticalCount > 0
                ? `${criticalCount} Critical issue${criticalCount > 1 ? "s" : ""} must be fixed before submission to avoid rejection.`
                : warningCount > 0
                ? `${warningCount} Warning${warningCount > 1 ? "s" : ""} detected. Review cut hazards and resolution.`
                : "All print guidelines passed! Ready for KDP paperback upload."}
            </span>
          </div>
          <button
            onClick={() => setRefreshTrigger((p) => p + 1)}
            className="text-[10px] font-black uppercase text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800/60 cursor-pointer"
          >
            Re-scan
          </button>
        </div>

        {/* Findings List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {findings.map((finding) => (
            <div
              key={finding.id}
              className={`p-4 rounded-2xl border transition-all ${
                finding.severity === "critical"
                  ? "bg-rose-900/10 border-rose-500/30 hover:border-rose-500/50"
                  : finding.severity === "warning"
                  ? "bg-amber-900/10 border-amber-500/30 hover:border-amber-500/50"
                  : "bg-emerald-900/10 border-emerald-500/30 hover:border-emerald-500/50"
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      finding.severity === "critical"
                        ? "bg-rose-500 text-white"
                        : finding.severity === "warning"
                        ? "bg-amber-500 text-slate-950"
                        : "bg-emerald-500 text-slate-950"
                    }`}
                  >
                    {finding.severity}
                  </span>
                  <h3 className="text-xs font-black text-white">{finding.title}</h3>
                </div>
                {finding.objectLabel && (
                  <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-lg">
                    {finding.objectLabel}
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-300 font-medium leading-relaxed mb-2">
                {finding.message}
              </p>

              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 bg-slate-950/50 p-2 rounded-xl mb-3 border border-slate-800/60">
                <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>{finding.recommendation}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-800/60">
                {finding.object && (
                  <button
                    onClick={() => handleSelectObject(finding.object)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Select Object</span>
                  </button>
                )}
                {finding.autoFix && (
                  <button
                    onClick={() => handleAutoFix(finding.autoFix)}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-sm shadow-indigo-600/30"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>{finding.autoFixLabel || "Auto-Fix"}</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between gap-3">
          <div className="text-[10px] text-slate-400 font-medium hidden sm:block">
            Standard: Amazon KDP Print On Demand (POD)
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-black uppercase tracking-wider cursor-pointer transition-colors"
            >
              Back to Canvas
            </button>
            {onProceedDownload && (
              <button
                onClick={() => {
                  onClose();
                  onProceedDownload();
                }}
                className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all shadow-md ${
                  criticalCount > 0
                    ? "bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/20"
                    : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30"
                }`}
              >
                <Download className="w-4 h-4" />
                <span>{criticalCount > 0 ? "Download Anyway" : "Download PDF Cover"}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
