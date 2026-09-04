export interface KdpSpecs {
  trimWidth: number;
  trimHeight: number;
  pageCount: number;
  paperType: 'white' | 'cream' | 'color';
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
  safeMarginPx: number; // standard 0.25" safety margin
  
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
}

export function calculateKdpLayout(specs: KdpSpecs, canvasWidth: number = 800): KdpLayoutResult {
  const trimWidth = typeof specs?.trimWidth === 'number' && !isNaN(specs.trimWidth) && specs.trimWidth > 0 ? specs.trimWidth : 8.5;
  const trimHeight = typeof specs?.trimHeight === 'number' && !isNaN(specs.trimHeight) && specs.trimHeight > 0 ? specs.trimHeight : 11;
  const pageCount = typeof specs?.pageCount === 'number' && !isNaN(specs.pageCount) && specs.pageCount >= 24 ? Math.min(1000, specs.pageCount) : 100;
  const paperType = specs?.paperType || 'white';
  const cWidth = typeof canvasWidth === 'number' && !isNaN(canvasWidth) && canvasWidth > 0 ? canvasWidth : 800;
  
  // 1. Spine Width calculation based on KDP guidelines
  // White: 0.002252" per page
  // Cream: 0.0025" per page
  // Color: 0.002347" per page
  let multiplier = 0.002252;
  if (paperType === 'cream') multiplier = 0.0025;
  else if (paperType === 'color') multiplier = 0.002347;
  
  const spineWidth = pageCount * multiplier;
  const bleed = 0.125; // 1/8" bleed
  const safeMargin = 0.25; // 1/4" safety margin inside trim line
  
  // Total dimensions in inches
  const coverWidthInches = (trimWidth * 2) + spineWidth + (bleed * 2);
  const coverHeightInches = trimHeight + (bleed * 2);
  
  // Scaling factors
  const scale = cWidth / coverWidthInches;
  const canvasHeight = coverHeightInches * scale;
  
  // Convert key guides to pixels
  const bleedPx = bleed * scale;
  const spineWidthPx = spineWidth * scale;
  const safeMarginPx = safeMargin * scale;
  
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
  
  // Live Area bounds (0.25" inside the trim lines, and 0.25" away from the spine edge)
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
    frontLiveBottomPx
  };
}
