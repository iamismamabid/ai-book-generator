export type KdpBindingType = 'paperback' | 'hardcover';
export type KdpInteriorType = 'black_white' | 'standard_color' | 'premium_color';
export type KdpPaperType = 'white' | 'cream';

export interface KdpSpecs {
  trimWidth: number;
  trimHeight: number;
  pageCount: number;
  paperType?: 'white' | 'cream' | 'color' | 'standard_color' | 'premium_color';
  interiorType?: KdpInteriorType;
  bindingType?: KdpBindingType;
}

export interface KdpMeasurementItem {
  id: number;
  description: string;
  width: number;
  height: number;
}

export interface KdpMeasurementsTable {
  fullCover: KdpMeasurementItem;       // #1
  frontCover: KdpMeasurementItem;      // #2
  safeArea: KdpMeasurementItem;        // #3
  bleed: KdpMeasurementItem;           // #4
  margin: KdpMeasurementItem;          // #5
  spine: KdpMeasurementItem;           // #6
  spineSafeArea: KdpMeasurementItem;   // #7
  spineMargin: KdpMeasurementItem;     // #8
  barcodeMargin: KdpMeasurementItem;   // #9
  items: KdpMeasurementItem[];
}

export interface KdpLayoutResult {
  spineWidth: number;
  bleed: number;
  coverWidthInches: number;
  coverHeightInches: number;
  
  // Pixel coordinates scaled to current canvas width
  canvasWidth: number;
  canvasHeight: number;
  scale: number; // px per inch
  
  spineWidthPx: number;
  bleedPx: number;
  
  // Key alignment guidelines (in Px)
  spineLeftPx: number;
  spineRightPx: number;
  spineCenterPx: number;
  
  // Safe margins / live area (in Px)
  safeMarginPx: number; // 0.125" standard safety margin
  
  backCoverCenterPx: number;
  frontCoverCenterPx: number;
  
  // Outer boundaries
  trimTopPx: number;
  trimBottomPx: number;
  trimLeftPx: number;
  trimRightPx: number;
  
  // Live Area bounds (Safety boundaries)
  backLiveLeftPx: number;
  backLiveRightPx: number;
  backLiveTopPx: number;
  backLiveBottomPx: number;
  
  frontLiveLeftPx: number;
  frontLiveRightPx: number;
  frontLiveTopPx: number;
  frontLiveBottomPx: number;

  // Complete official Amazon KDP measurements (#1 through #9)
  measurements: KdpMeasurementsTable;
  bindingType: KdpBindingType;
  interiorType: KdpInteriorType;
  paperType: KdpPaperType;
  canHaveSpineText: boolean;
}

/**
 * Returns exact official Amazon KDP page thickness multiplier (inches per page).
 */
export function getKdpSpineMultiplier(
  interiorType: KdpInteriorType = 'black_white',
  paperType: KdpPaperType = 'white'
): number {
  if (interiorType === 'standard_color') {
    // 0.00225" per page (White paper only)
    return 0.00225;
  }
  if (interiorType === 'premium_color') {
    // 0.002347" per page (White paper only)
    return 0.002347;
  }
  // Black & white
  if (paperType === 'cream') {
    // 0.0025" per page
    return 0.0025;
  }
  // 0.002252" per page
  return 0.002252;
}

export function calculateKdpLayout(specs: KdpSpecs, canvasWidth: number = 800): KdpLayoutResult {
  const trimWidth = typeof specs?.trimWidth === 'number' && !isNaN(specs.trimWidth) && specs.trimWidth > 0 ? specs.trimWidth : 8.5;
  const trimHeight = typeof specs?.trimHeight === 'number' && !isNaN(specs.trimHeight) && specs.trimHeight > 0 ? specs.trimHeight : 11;
  const rawPageCount = typeof specs?.pageCount === 'number' && !isNaN(specs.pageCount) && specs.pageCount >= 24 ? Math.min(1000, specs.pageCount) : 100;
  
  // Amazon KDP physical paperback sheets require an even number of pages
  const pageCount = rawPageCount % 2 !== 0 ? rawPageCount + 1 : rawPageCount;
  
  // Resolve interiorType and paperType with backwards-compatibility
  let interiorType: KdpInteriorType = specs?.interiorType || 'black_white';
  let paperType: KdpPaperType = (specs?.paperType === 'cream') ? 'cream' : 'white';
  const bindingType: KdpBindingType = specs?.bindingType || 'paperback';

  if (!specs?.interiorType && specs?.paperType) {
    if (specs.paperType === 'color' || specs.paperType === 'premium_color') {
      interiorType = 'premium_color';
      paperType = 'white';
    } else if (specs.paperType === 'standard_color') {
      interiorType = 'standard_color';
      paperType = 'white';
    }
  }

  const multiplier = getKdpSpineMultiplier(interiorType, paperType);
  const isPaperback = bindingType === 'paperback';

  // Spine Calculation
  let spineWidth = Number((pageCount * multiplier).toFixed(4));
  if (!isPaperback) {
    // Hardcover includes additional spine board thickness allowance (0.060")
    spineWidth = Number((spineWidth + 0.060).toFixed(4));
  }

  // Bleed & Margins
  // Paperback: 0.125" bleed on all outer edges
  // Hardcover: 0.562" wrap on all outer edges
  const bleed = isPaperback ? 0.125 : 0.562;
  const margin = 0.125; // Standard safety margin
  const spineMargin = 0.062; // 0.062" (1/16") spine safety margin
  const barcodeMargin = 0.25; // 0.25" barcode margin

  // Total dimensions in inches
  const coverWidthInches = Number(((trimWidth * 2) + spineWidth + (bleed * 2)).toFixed(3));
  const coverHeightInches = Number((trimHeight + (bleed * 2)).toFixed(3));

  // Front & Safe Area dimensions
  const frontWidth = trimWidth;
  const frontHeight = trimHeight;
  const safeAreaWidth = Number((trimWidth - margin).toFixed(3));
  const safeAreaHeight = Number((trimHeight - (margin * 2)).toFixed(3));
  
  // Spine Safe Area
  const spineSafeWidth = Number(Math.max(0, spineWidth - (spineMargin * 2)).toFixed(3));
  const spineSafeHeight = safeAreaHeight;

  // Amazon KDP allows spine text if page count >= 79 (spine width >= 0.235")
  const canHaveSpineText = pageCount >= 79;

  // Build the 9 official measurements table
  const measurements: KdpMeasurementsTable = {
    fullCover: { id: 1, description: 'Full Cover', width: coverWidthInches, height: coverHeightInches },
    frontCover: { id: 2, description: 'Front Cover', width: frontWidth, height: frontHeight },
    safeArea: { id: 3, description: 'Safe Area', width: safeAreaWidth, height: safeAreaHeight },
    bleed: { id: 4, description: 'Bleed', width: bleed, height: bleed },
    margin: { id: 5, description: 'Margin', width: margin, height: margin },
    spine: { id: 6, description: 'Spine', width: Number(spineWidth.toFixed(3)), height: trimHeight },
    spineSafeArea: { id: 7, description: 'Spine Safe Area', width: spineSafeWidth, height: spineSafeHeight },
    spineMargin: { id: 8, description: 'Spine Margin', width: spineMargin, height: spineMargin },
    barcodeMargin: { id: 9, description: 'Barcode Margin', width: barcodeMargin, height: barcodeMargin },
    items: [],
  };
  measurements.items = [
    measurements.fullCover,
    measurements.frontCover,
    measurements.safeArea,
    measurements.bleed,
    measurements.margin,
    measurements.spine,
    measurements.spineSafeArea,
    measurements.spineMargin,
    measurements.barcodeMargin,
  ];

  // Scaling factors for UI canvas
  const cWidth = typeof canvasWidth === 'number' && !isNaN(canvasWidth) && canvasWidth > 0 ? canvasWidth : 800;
  const scale = cWidth / coverWidthInches;
  const canvasHeight = coverHeightInches * scale;

  // Convert key guides to pixels
  const bleedPx = bleed * scale;
  const spineWidthPx = spineWidth * scale;
  const safeMarginPx = margin * scale;

  // X positions (from left 0 to canvasWidth)
  const trimLeftPx = bleedPx;
  const trimRightPx = cWidth - bleedPx;

  const spineLeftPx = bleedPx + trimWidth * scale;
  const spineRightPx = spineLeftPx + spineWidthPx;
  const spineCenterPx = spineLeftPx + (spineWidthPx / 2);

  // Back Cover region is between trimLeftPx and spineLeftPx
  const backCoverWidthPx = trimWidth * scale;
  const backCoverCenterPx = trimLeftPx + (backCoverWidthPx / 2);

  // Front Cover region is between spineRightPx and trimRightPx
  const frontCoverWidthPx = trimWidth * scale;
  const frontCoverCenterPx = spineRightPx + (frontCoverWidthPx / 2);

  // Y positions
  const trimTopPx = bleedPx;
  const trimBottomPx = canvasHeight - bleedPx;

  // Live Area bounds (0.125" inside trim lines, and 0.125" away from spine edge)
  const backLiveLeftPx = trimLeftPx + safeMarginPx;
  const backLiveRightPx = spineLeftPx - safeMarginPx;
  const backLiveTopPx = trimTopPx + safeMarginPx;
  const backLiveBottomPx = trimBottomPx - safeMarginPx;

  const frontLiveLeftPx = spineRightPx + safeMarginPx;
  const frontLiveRightPx = trimRightPx - safeMarginPx;
  const frontLiveTopPx = trimTopPx + safeMarginPx;
  const frontLiveBottomPx = trimBottomPx - safeMarginPx;

  return {
    spineWidth,
    bleed,
    coverWidthInches,
    coverHeightInches,
    canvasWidth: cWidth,
    canvasHeight,
    scale,
    spineWidthPx,
    bleedPx,
    spineLeftPx,
    spineRightPx,
    spineCenterPx,
    safeMarginPx,
    backCoverCenterPx,
    frontCoverCenterPx,
    trimTopPx,
    trimBottomPx,
    trimLeftPx,
    trimRightPx,
    backLiveLeftPx,
    backLiveRightPx,
    backLiveTopPx,
    backLiveBottomPx,
    frontLiveLeftPx,
    frontLiveRightPx,
    frontLiveTopPx,
    frontLiveBottomPx,
    measurements,
    bindingType,
    interiorType,
    paperType,
    canHaveSpineText,
  };
}
