import { fabric } from 'fabric';

export interface SnapGuides {
  x: { value: number; name: string }[];
  y: { value: number; name: string }[];
}

/**
 * Initializes precision snapping alignment on a Fabric.js canvas.
 * Spawns dynamic green dashed guidelines when objects align within snapTolerance of guides.
 * 
 * @param canvas Fabric.js canvas instance
 * @param getGuides Callback returning X and Y coordinates to snap to
 * @param snapTolerance Proximity in pixels to trigger a snap (default: 10)
 * @returns Detach function to clean up event listeners
 */
export function initFabricSnapping(
  canvas: fabric.Canvas, 
  getGuides: () => SnapGuides, 
  snapTolerance: number = 10
) {
  let activeGuides: { x: number | null; y: number | null } = { x: null, y: null };

  const handleMoving = (e: fabric.IEvent) => {
    const obj = e.target;
    if (!obj) return;

    const guides = getGuides();
    const rect = obj.getBoundingRect(true, true); // Use actual bounding rect considering transformations
    
    const objLeft = rect.left;
    const objTop = rect.top;
    const objRight = rect.left + rect.width;
    const objBottom = rect.top + rect.height;
    const objCenterX = rect.left + rect.width / 2;
    const objCenterY = rect.top + rect.height / 2;

    let snapX: number | null = null;
    let snapY: number | null = null;
    let deltaX = 0;
    let deltaY = 0;

    // Reset active guides
    activeGuides = { x: null, y: null };

    // 1. Check X Guides (Snapping horizontally)
    for (const guide of guides.x) {
      // Check left edge
      if (Math.abs(objLeft - guide.value) < snapTolerance) {
        snapX = guide.value;
        deltaX = guide.value - objLeft;
        break;
      }
      // Check right edge
      if (Math.abs(objRight - guide.value) < snapTolerance) {
        snapX = guide.value;
        deltaX = guide.value - objRight;
        break;
      }
      // Check center
      if (Math.abs(objCenterX - guide.value) < snapTolerance) {
        snapX = guide.value;
        deltaX = guide.value - objCenterX;
        break;
      }
    }

    // 2. Check Y Guides (Snapping vertically)
    for (const guide of guides.y) {
      // Check top edge
      if (Math.abs(objTop - guide.value) < snapTolerance) {
        snapY = guide.value;
        deltaY = guide.value - objTop;
        break;
      }
      // Check bottom edge
      if (Math.abs(objBottom - guide.value) < snapTolerance) {
        snapY = guide.value;
        deltaY = guide.value - objBottom;
        break;
      }
      // Check center
      if (Math.abs(objCenterY - guide.value) < snapTolerance) {
        snapY = guide.value;
        deltaY = guide.value - objCenterY;
        break;
      }
    }

    // Apply Snapping by adjusting position coords
    if (snapX !== null) {
      obj.set({ left: obj.left! + deltaX });
      activeGuides.x = snapX;
    }

    if (snapY !== null) {
      obj.set({ top: obj.top! + deltaY });
      activeGuides.y = snapY;
    }

    canvas.requestRenderAll();
  };

  const handleAfterRender = () => {
    const ctx = canvas.getSelectionContext();
    if (!ctx) return;

    ctx.save();
    
    // Snapping guidelines formatting: Emerald green, thin dashed lines
    ctx.strokeStyle = '#10B981';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 4]);

    // Draw vertical snapping guideline
    if (activeGuides.x !== null) {
      ctx.beginPath();
      ctx.moveTo(activeGuides.x, 0);
      ctx.lineTo(activeGuides.x, canvas.height || 800);
      ctx.stroke();
    }

    // Draw horizontal snapping guideline
    if (activeGuides.y !== null) {
      ctx.beginPath();
      ctx.moveTo(0, activeGuides.y);
      ctx.lineTo(canvas.width || 800, activeGuides.y);
      ctx.stroke();
    }

    ctx.restore();
  };

  const handleMouseUp = () => {
    activeGuides = { x: null, y: null };
    canvas.requestRenderAll();
  };

  // Register Event Handlers
  canvas.on('object:moving', handleMoving);
  canvas.on('after:render', handleAfterRender);
  canvas.on('mouse:up', handleMouseUp);

  // Return Cleanup Handler
  return () => {
    canvas.off('object:moving', handleMoving);
    canvas.off('after:render', handleAfterRender);
    canvas.off('mouse:up', handleMouseUp);
  };
}
