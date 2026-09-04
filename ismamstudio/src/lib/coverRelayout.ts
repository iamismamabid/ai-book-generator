import { KdpLayoutResult } from "@/app/utils/kdpLayout";

// Smart resize: remap a saved design from one KDP layout to another when the
// trim size, page count or paper type changes.
//
// A wraparound cover isn't one canvas — it's three regions (back cover, spine,
// front cover) whose widths change by different amounts. Scaling everything by
// a single global factor would slide front-cover artwork onto the spine, so
// each element is remapped within whichever region it currently sits in.

type Region = "back" | "spine" | "front";

function regionBounds(layout: KdpLayoutResult, region: Region): [number, number] {
  if (region === "back") return [0, layout.spineLeftPx];
  if (region === "spine") return [layout.spineLeftPx, layout.spineRightPx];
  return [layout.spineRightPx, layout.canvasWidth];
}

function regionOf(centerX: number, layout: KdpLayoutResult): Region {
  if (centerX < layout.spineLeftPx) return "back";
  if (centerX <= layout.spineRightPx) return "spine";
  return "front";
}

export function layoutsDiffer(a: KdpLayoutResult, b: KdpLayoutResult): boolean {
  return (
    a.canvasWidth !== b.canvasWidth ||
    a.canvasHeight !== b.canvasHeight ||
    a.spineLeftPx !== b.spineLeftPx ||
    a.spineRightPx !== b.spineRightPx
  );
}

/**
 * Returns a copy of the legacy element list with positions and sizes remapped
 * from `from` to `to`. Operates on the serialized element data rather than live
 * fabric objects so that asynchronously loaded elements (images) are covered by
 * the same transform as everything else.
 */
export function relayoutLegacyElements(
  elements: any[],
  from: KdpLayoutResult,
  to: KdpLayoutResult
): any[] {
  if (!elements || elements.length === 0) return elements;

  // Check if trim dimensions (height in inches) are the same.
  // When only page count or paper type changes, the book trim is identical (e.g. 8.5x11),
  // so ONLY the spine width changes. In this case, NEVER rescale font sizes or element dimensions!
  const isSpineOnlyChange =
    Math.abs(from.coverHeightInches - to.coverHeightInches) < 0.001;

  if (isSpineOnlyChange) {
    const deltaSpineRight = to.spineRightPx - from.spineRightPx;
    const deltaSpineCenter = to.spineCenterPx - from.spineCenterPx;

    return elements.map((el) => {
      if (!el || typeof el.x !== "number" || typeof el.y !== "number") return el;

      const scaleX = el.scaleX ?? 1;
      const width = (el.width ?? 0) * scaleX;
      const centerX = el.originX === "center" ? el.x : el.x + width / 2;
      const region = regionOf(centerX, from);

      const next: any = { ...el };

      if (region === "back") {
        next.x = el.x;
        next.y = el.y;
      } else if (region === "spine") {
        next.x = el.x + deltaSpineCenter;
        next.y = el.y;
      } else {
        next.x = el.x + deltaSpineRight;
        next.y = el.y;
      }

      return next;
    });
  }

  const fromHeight = Math.max(from.canvasHeight, 1);
  const heightRatio = to.canvasHeight / fromHeight;

  return elements.map((el) => {
    if (!el || typeof el.x !== "number" || typeof el.y !== "number") return el;

    const scaleX = el.scaleX ?? 1;
    const scaleY = el.scaleY ?? 1;
    const width = (el.width ?? 0) * scaleX;
    const height = (el.height ?? 0) * scaleY;

    // Elements are stored top-left anchored unless they carry an explicit
    // centered origin (spine text does).
    const centerX = el.originX === "center" ? el.x : el.x + width / 2;
    const centerY = el.originY === "center" ? el.y : el.y + height / 2;

    const region = regionOf(centerX, from);
    const [fromA, fromB] = regionBounds(from, region);
    const [toA, toB] = regionBounds(to, region);
    const fromWidth = Math.max(fromB - fromA, 1);
    const toWidth = Math.max(toB - toA, 1);

    // Uniform scaling (the smaller of the two axes) keeps artwork undistorted
    // and guarantees it still fits the region it's being moved into.
    const sizeFactor = Math.min(toWidth / fromWidth, heightRatio);

    const tX = (centerX - fromA) / fromWidth;
    const tY = centerY / fromHeight;
    const newCenterX = toA + tX * toWidth;
    const newCenterY = tY * to.canvasHeight;

    const next: any = { ...el };

    if (typeof el.width === "number") next.width = el.width * sizeFactor;
    if (typeof el.height === "number") next.height = el.height * sizeFactor;
    if (typeof el.fontSize === "number") next.fontSize = el.fontSize * sizeFactor;
    if (typeof el.radius === "number") next.radius = el.radius * sizeFactor;
    if (typeof el.strokeWidth === "number") next.strokeWidth = el.strokeWidth * sizeFactor;
    if (el.curvedTextData) {
      next.curvedTextData = {
        ...el.curvedTextData,
        fontSize: (el.curvedTextData.fontSize ?? 40) * sizeFactor,
        radius: (el.curvedTextData.radius ?? 100) * sizeFactor,
      };
    }

    // Recompute the anchor from the new center using the new size.
    const newWidth = (next.width ?? 0) * scaleX;
    const newHeight = (next.height ?? 0) * scaleY;
    next.x = el.originX === "center" ? newCenterX : newCenterX - newWidth / 2;
    next.y = el.originY === "center" ? newCenterY : newCenterY - newHeight / 2;

    return next;
  });
}
