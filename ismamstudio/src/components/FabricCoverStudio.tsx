"use client";

import React, { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import { 
  Type, Square, Circle as CircleIcon, Star, Ruler, 
  Trash2, Undo2, Redo2, Loader2, Download, Check, Settings,
  Sparkles, Shapes, Upload, LayoutTemplate, Grid, ChevronUp, ChevronDown
} from "lucide-react";
import { jsPDF } from "jspdf";
import { calculateKdpLayout, KdpSpecs, KdpLayoutResult } from "@/app/utils/kdpLayout";
import { initFabricSnapping } from "@/hooks/useFabricSnap";

// Presets
const FONT_FAMILIES = ["Arial", "Georgia", "Times New Roman", "Courier New", "Impact", "Comic Sans MS", "Trebuchet MS"];

interface FabricCoverStudioProps {
  trimSize: { label: string; w: number; h: number };
  pageCount: number;
  backCoverColor: string;
  setBackCoverColor: (color: string) => void;
  frontCoverColor: string;
  setFrontCoverColor: (color: string) => void;
  showKdpGuides: boolean;
  setShowKdpGuides: (show: boolean) => void;
  snapToGrid: boolean;
  setSnapToGrid: (snap: boolean) => void;
  initialElements: any[];
  onSaveWorkspace: (serializedJson: any) => void;
}

export default function FabricCoverStudio({
  trimSize,
  pageCount,
  backCoverColor,
  setBackCoverColor,
  frontCoverColor,
  setFrontCoverColor,
  showKdpGuides,
  setShowKdpGuides,
  snapToGrid,
  setSnapToGrid,
  initialElements,
  onSaveWorkspace
}: FabricCoverStudioProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeObject, setActiveObject] = useState<fabric.Object | null>(null);
  
  // History Undo/Redo States
  const [history, setHistory] = useState<string[]>([]);
  const [historyStep, setHistoryStep] = useState(-1);
  const isUpdatingHistory = useRef(false);

  // KDP specs calculations
  const layout = calculateKdpLayout({
    trimWidth: trimSize.w,
    trimHeight: trimSize.h,
    pageCount: pageCount,
    paperType: 'white'
  }, 800);

  // Initialize Fabric Canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    // Create Fabric instance
    const fCanvas = new fabric.Canvas(canvasRef.current, {
      width: layout.canvasWidth,
      height: layout.canvasHeight,
      backgroundColor: backCoverColor,
      preserveObjectStacking: true
    });

    setCanvas(fCanvas);

    // Initial history step
    const initialJson = JSON.stringify(fCanvas.toJSON());
    setHistory([initialJson]);
    setHistoryStep(0);

    // Selection events
    fCanvas.on("selection:created", (e) => setActiveObject(e.selected ? e.selected[0] : null));
    fCanvas.on("selection:updated", (e) => setActiveObject(e.selected ? e.selected[0] : null));
    fCanvas.on("selection:cleared", () => setActiveObject(null));

    // Save history on changes
    const saveState = () => {
      if (isUpdatingHistory.current) return;
      const json = JSON.stringify(fCanvas.toJSON());
      
      setHistory(prev => {
        const sliced = prev.slice(0, historyStep + 1);
        return [...sliced, json];
      });
      setHistoryStep(prev => prev + 1);
      onSaveWorkspace(fCanvas.toJSON());
    };

    fCanvas.on("object:added", saveState);
    fCanvas.on("object:modified", saveState);
    fCanvas.on("object:removed", saveState);

    // Initial elements import (translation from Konva element nodes to Fabric objects)
    importLegacyElements(fCanvas, initialElements, layout);

    return () => {
      fCanvas.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layout.canvasWidth, layout.canvasHeight]);

  // Handle snap-to-grid & guides alignment
  useEffect(() => {
    if (!canvas) return;

    // Snap target list
    const getGuides = () => ({
      x: [
        { value: layout.canvasWidth / 2, name: "Spine Center" },
        { value: layout.spineLeftPx, name: "Spine Left" },
        { value: layout.spineRightPx, name: "Spine Right" },
        { value: layout.backCoverCenterPx, name: "Back Cover Center" },
        { value: layout.frontCoverCenterPx, name: "Front Cover Center" },
        { value: layout.trimLeftPx, name: "Trim Left" },
        { value: layout.trimRightPx, name: "Trim Right" }
      ],
      y: [
        { value: layout.canvasHeight / 2, name: "Canvas Middle" },
        { value: layout.trimTopPx, name: "Trim Top" },
        { value: layout.trimBottomPx, name: "Trim Bottom" }
      ]
    });

    const snapTolerance = snapToGrid ? 10 : 0;
    const cleanupSnap = initFabricSnapping(canvas, getGuides, snapTolerance);

    return () => {
      cleanupSnap();
    };
  }, [canvas, snapToGrid, layout]);

  // Background painting and KDP Guides rendering in Fabric's after:render
  useEffect(() => {
    if (!canvas) return;

    // Remove legacy after-render listeners
    canvas.off("after:render");

    canvas.on("after:render", () => {
      const ctx = canvas.getContext();
      if (!ctx) return;

      // Draw background layout splits
      ctx.save();
      // Back Cover (left)
      ctx.fillStyle = backCoverColor;
      ctx.fillRect(0, 0, layout.spineLeftPx, layout.canvasHeight);

      // Spine (center)
      ctx.fillStyle = backCoverColor;
      ctx.fillRect(layout.spineLeftPx, 0, layout.spineWidthPx, layout.canvasHeight);

      // Front Cover (right)
      ctx.fillStyle = frontCoverColor;
      ctx.fillRect(layout.spineRightPx, 0, layout.canvasWidth - layout.spineRightPx, layout.canvasHeight);
      ctx.restore();

      // Draw Guidelines if toggled
      if (showKdpGuides && !isGenerating) {
        ctx.save();
        
        // 1. Draw Bleed / Trim borders
        ctx.strokeStyle = "#3B82F6"; // blue-500
        ctx.lineWidth = 1.2;
        ctx.setLineDash([6, 6]);
        ctx.strokeRect(
          layout.bleedPx, 
          layout.bleedPx, 
          layout.canvasWidth - layout.bleedPx * 2, 
          layout.canvasHeight - layout.bleedPx * 2
        );

        // 2. Draw Spine Region Borders
        ctx.fillStyle = "rgba(244, 63, 94, 0.12)"; // light rose
        ctx.fillRect(layout.spineLeftPx, 0, layout.spineWidthPx, layout.canvasHeight);

        ctx.strokeStyle = "#F43F5E"; // rose-500
        ctx.lineWidth = 1;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(layout.spineLeftPx, 0);
        ctx.lineTo(layout.spineLeftPx, layout.canvasHeight);
        ctx.moveTo(layout.spineRightPx, 0);
        ctx.lineTo(layout.spineRightPx, layout.canvasHeight);
        ctx.stroke();

        // 3. Draw Live Safety Area Lines (Orange dash)
        ctx.strokeStyle = "#F97316"; // orange-500
        ctx.setLineDash([4, 4]);
        
        // Back Cover Live bounds
        ctx.strokeRect(
          layout.backLiveLeftPx,
          layout.backLiveTopPx,
          layout.backLiveRightPx - layout.backLiveLeftPx,
          layout.backLiveBottomPx - layout.backLiveTopPx
        );

        // Front Cover Live bounds
        ctx.strokeRect(
          layout.frontLiveLeftPx,
          layout.frontLiveTopPx,
          layout.frontLiveRightPx - layout.frontLiveLeftPx,
          layout.frontLiveBottomPx - layout.frontLiveTopPx
        );

        // Labels
        ctx.font = "bold 9px sans-serif";
        ctx.fillStyle = "rgba(244, 63, 94, 0.6)";
        ctx.fillText("SPINE AREA", layout.spineLeftPx + 4, 15);
        ctx.fillStyle = "rgba(59, 130, 246, 0.6)";
        ctx.fillText("TRIM LINE", layout.bleedPx + 4, layout.bleedPx - 4);
        ctx.fillStyle = "rgba(249, 115, 22, 0.6)";
        ctx.fillText("SAFETY ZONE", layout.frontLiveLeftPx + 4, layout.frontLiveTopPx - 4);

        ctx.restore();
      }
    });

    canvas.requestRenderAll();
  }, [canvas, backCoverColor, frontCoverColor, showKdpGuides, isGenerating, layout]);

  // Import Legacy Elements Translation helper
  const importLegacyElements = (fCanvas: fabric.Canvas, elements: any[], kdp: KdpLayoutResult) => {
    if (!elements || elements.length === 0) return;

    elements.forEach(el => {
      let obj: fabric.Object | null = null;

      if (el.type === 'text') {
        obj = new fabric.IText(el.text, {
          left: el.x,
          top: el.y,
          fontSize: el.fontSize || 24,
          fill: el.fill || '#FFFFFF',
          fontFamily: el.fontFamily || 'Arial',
          fontStyle: el.fontStyle || 'normal',
          textAlign: el.align || 'center',
          scaleX: el.scaleX || 1,
          scaleY: el.scaleY || 1,
          angle: el.rotation || 0,
          opacity: el.opacity ?? 1
        });
      } else if (el.type === 'rect') {
        obj = new fabric.Rect({
          left: el.x,
          top: el.y,
          width: el.width || 100,
          height: el.height || 100,
          fill: el.fill || '#F59E0B',
          stroke: el.stroke,
          strokeWidth: el.strokeWidth || 0,
          rx: el.cornerRadius || 0,
          ry: el.cornerRadius || 0,
          scaleX: el.scaleX || 1,
          scaleY: el.scaleY || 1,
          angle: el.rotation || 0,
          opacity: el.opacity ?? 1
        });
      } else if (el.type === 'circle') {
        obj = new fabric.Circle({
          left: el.x,
          top: el.y,
          radius: el.radius || 50,
          fill: el.fill || '#3B82F6',
          stroke: el.stroke,
          strokeWidth: el.strokeWidth || 0,
          scaleX: el.scaleX || 1,
          scaleY: el.scaleY || 1,
          angle: el.rotation || 0,
          opacity: el.opacity ?? 1
        });
      } else if (el.type === 'line') {
        obj = new fabric.Line(el.points || [0, 0, 100, 0], {
          left: el.x,
          top: el.y,
          stroke: el.stroke || '#FFFFFF',
          strokeWidth: el.strokeWidth || 4,
          scaleX: el.scaleX || 1,
          scaleY: el.scaleY || 1,
          angle: el.rotation || 0,
          opacity: el.opacity ?? 1
        });
      } else if (el.type === 'clipart') {
        fabric.Image.fromURL(el.src, (img) => {
          img.set({
            left: el.x,
            top: el.y,
            width: el.width || 150,
            height: el.height || 150,
            scaleX: el.scaleX || 1,
            scaleY: el.scaleY || 1,
            angle: el.rotation || 0,
            opacity: el.opacity ?? 1
          });
          fCanvas.add(img);
          fCanvas.requestRenderAll();
        }, { crossOrigin: 'anonymous' });
        return;
      }

      if (obj) {
        fCanvas.add(obj);
      }
    });

    fCanvas.requestRenderAll();
  };

  // Undo / Redo Actions
  const handleUndo = () => {
    if (historyStep > 0 && canvas) {
      isUpdatingHistory.current = true;
      const prevStep = historyStep - 1;
      canvas.loadFromJSON(JSON.parse(history[prevStep]), () => {
        canvas.requestRenderAll();
        setHistoryStep(prevStep);
        isUpdatingHistory.current = false;
      });
    }
  };

  const handleRedo = () => {
    if (historyStep < history.length - 1 && canvas) {
      isUpdatingHistory.current = true;
      const nextStep = historyStep + 1;
      canvas.loadFromJSON(JSON.parse(history[nextStep]), () => {
        canvas.requestRenderAll();
        setHistoryStep(nextStep);
        isUpdatingHistory.current = false;
      });
    }
  };

  // Add Element Helpers
  const addText = () => {
    if (!canvas) return;
    const text = new fabric.IText("BOOK TITLE", {
      left: layout.frontCoverCenterPx - 80,
      top: layout.canvasHeight / 2 - 20,
      fontFamily: "Arial",
      fontSize: 32,
      fill: "#FFFFFF",
      textAlign: "center"
    });
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.requestRenderAll();
  };

  const addRectangle = () => {
    if (!canvas) return;
    const rect = new fabric.Rect({
      left: layout.frontCoverCenterPx - 50,
      top: layout.canvasHeight / 2 - 50,
      width: 100,
      height: 100,
      fill: "#F59E0B",
      stroke: "#FFFFFF",
      strokeWidth: 2
    });
    canvas.add(rect);
    canvas.setActiveObject(rect);
    canvas.requestRenderAll();
  };

  const addCircle = () => {
    if (!canvas) return;
    const circle = new fabric.Circle({
      left: layout.frontCoverCenterPx - 50,
      top: layout.canvasHeight / 2 - 50,
      radius: 50,
      fill: "#3B82F6",
      stroke: "#FFFFFF",
      strokeWidth: 2
    });
    canvas.add(circle);
    canvas.setActiveObject(circle);
    canvas.requestRenderAll();
  };

  const addStar = () => {
    if (!canvas) return;
    // Create standard Fabric star path
    const points = [
      { x: 350, y: 75 },
      { x: 379, y: 161 },
      { x: 469, y: 161 },
      { x: 397, y: 215 },
      { x: 423, y: 301 },
      { x: 350, y: 250 },
      { x: 277, y: 301 },
      { x: 303, y: 215 },
      { x: 231, y: 161 },
      { x: 321, y: 161 }
    ];
    const star = new fabric.Polygon(points, {
      left: layout.frontCoverCenterPx - 50,
      top: layout.canvasHeight / 2 - 50,
      fill: "#10B981",
      stroke: "#FFFFFF",
      strokeWidth: 2
    });
    star.scaleToWidth(100);
    canvas.add(star);
    canvas.setActiveObject(star);
    canvas.requestRenderAll();
  };

  const addLine = () => {
    if (!canvas) return;
    const line = new fabric.Line([0, 0, 150, 0], {
      left: layout.frontCoverCenterPx - 75,
      top: layout.canvasHeight / 2,
      stroke: "#FFFFFF",
      strokeWidth: 4
    });
    canvas.add(line);
    canvas.setActiveObject(line);
    canvas.requestRenderAll();
  };

  const addClipart = (src: string) => {
    if (!canvas) return;
    fabric.Image.fromURL(src, (img) => {
      img.set({
        left: layout.frontCoverCenterPx - 75,
        top: layout.canvasHeight / 2 - 75,
        width: 150,
        height: 150
      });
      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.requestRenderAll();
    }, { crossOrigin: 'anonymous' });
  };

  const deleteSelected = () => {
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (active) {
      canvas.remove(active);
      canvas.discardActiveObject();
      canvas.requestRenderAll();
    }
  };

  const handleAlignment = (align: 'left' | 'center' | 'right') => {
    if (!canvas || !activeObject) return;
    
    const objWidth = activeObject.getBoundingRect().width;
    let targetX = 0;

    if (align === 'left') {
      targetX = layout.frontLiveLeftPx;
    } else if (align === 'center') {
      targetX = layout.frontCoverCenterPx - (objWidth / 2);
    } else if (align === 'right') {
      targetX = layout.frontLiveRightPx - objWidth;
    }

    activeObject.set({ left: targetX });
    canvas.requestRenderAll();
    canvas.fire("object:modified", { target: activeObject });
  };

  // Compile & export PDF
  const handleGenerateCover = async () => {
    if (!canvas) return;
    setIsGenerating(true);
    canvas.discardActiveObject();
    canvas.requestRenderAll();
    
    setTimeout(() => {
      // High-resolution export
      const dataURL = canvas.toDataURL({ 
        format: 'png', 
        multiplier: 3 
      });

      const doc = new jsPDF({ 
        orientation: "landscape", 
        unit: "in", 
        format: [layout.coverWidthInches, layout.coverHeightInches] 
      });

      doc.addImage(dataURL, 'PNG', 0, 0, layout.coverWidthInches, layout.coverHeightInches);
      doc.save(`KDP_Premium_Cover_${trimSize.w}x${trimSize.h}.pdf`);
      setIsGenerating(false);
    }, 300);
  };

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Sidebar Tool options */}
      <div className="w-68 bg-slate-50 border-r border-slate-200 flex flex-col p-5 z-10 overflow-y-auto">
        <div className="space-y-5">
          <div className="flex justify-between items-center">
            <h3 className="font-black text-[10px] uppercase tracking-widest text-slate-400">Library Assets</h3>
            <div className="flex gap-1.5">
              <button 
                onClick={handleUndo} 
                disabled={historyStep <= 0} 
                title="Undo" 
                className="p-1 rounded bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30"
              >
                <Undo2 className="w-3.5 h-3.5"/>
              </button>
              <button 
                onClick={handleRedo} 
                disabled={historyStep === history.length - 1} 
                title="Redo" 
                className="p-1 rounded bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30"
              >
                <Redo2 className="w-3.5 h-3.5"/>
              </button>
            </div>
          </div>

          <div className="space-y-2.5">
            <button onClick={addText} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-black flex items-center gap-2.5 hover:border-amber-400 hover:shadow-sm transition-all text-slate-700">
              <Type className="w-4 h-4 text-indigo-500"/> Add Text Layer
            </button>
            <button onClick={addRectangle} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-black flex items-center gap-2.5 hover:border-amber-400 hover:shadow-sm transition-all text-slate-700">
              <Square className="w-4 h-4 text-amber-500"/> Add Rectangle
            </button>
            <button onClick={addCircle} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-black flex items-center gap-2.5 hover:border-amber-400 hover:shadow-sm transition-all text-slate-700">
              <CircleIcon className="w-4 h-4 text-sky-500"/> Add Circle
            </button>
            <button onClick={addStar} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-black flex items-center gap-2.5 hover:border-amber-400 hover:shadow-sm transition-all text-slate-700">
              <Star className="w-4 h-4 text-emerald-500"/> Add Star Shape
            </button>
            <button onClick={addLine} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-black flex items-center gap-2.5 hover:border-amber-400 hover:shadow-sm transition-all text-slate-700">
              <Ruler className="w-4 h-4 text-rose-500"/> Add Line Divider
            </button>
          </div>

          {activeObject && (
            <div className="pt-4 border-t border-slate-200 space-y-4">
              <h4 className="font-black text-[10px] uppercase tracking-widest text-slate-400">Object Settings</h4>
              <div className="flex gap-1.5">
                <button 
                  onClick={() => handleAlignment('left')} 
                  className="flex-1 py-1.5 bg-white border border-slate-200 text-[10px] font-black rounded-lg hover:border-indigo-500"
                >
                  Align Left
                </button>
                <button 
                  onClick={() => handleAlignment('center')} 
                  className="flex-1 py-1.5 bg-white border border-slate-200 text-[10px] font-black rounded-lg hover:border-indigo-500"
                >
                  Align Center
                </button>
                <button 
                  onClick={() => handleAlignment('right')} 
                  className="flex-1 py-1.5 bg-white border border-slate-200 text-[10px] font-black rounded-lg hover:border-indigo-500"
                >
                  Align Right
                </button>
              </div>

              <button 
                onClick={deleteSelected} 
                className="w-full p-2.5 bg-red-50 text-red-600 text-xs font-black rounded-xl border border-red-100 hover:bg-red-100 flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4"/> Delete Layer
              </button>
            </div>
          )}

          <div className="pt-4 border-t border-slate-200 space-y-3">
            <h4 className="font-black text-[10px] uppercase tracking-widest text-slate-400">Cover Colors</h4>
            <div className="space-y-2">
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Back Cover Color</label>
                <div className="flex gap-2">
                  <input 
                    type="color" 
                    value={backCoverColor} 
                    onChange={(e) => setBackCoverColor(e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer border border-slate-200" 
                  />
                  <input 
                    type="text" 
                    value={backCoverColor} 
                    onChange={(e) => setBackCoverColor(e.target.value)}
                    className="flex-1 text-xs px-2 border border-slate-200 rounded font-mono" 
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Front Cover Color</label>
                <div className="flex gap-2">
                  <input 
                    type="color" 
                    value={frontCoverColor} 
                    onChange={(e) => setFrontCoverColor(e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer border border-slate-200" 
                  />
                  <input 
                    type="text" 
                    value={frontCoverColor} 
                    onChange={(e) => setFrontCoverColor(e.target.value)}
                    className="flex-1 text-xs px-2 border border-slate-200 rounded font-mono" 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FABRIC WORKSPACE */}
      <div className="flex-1 bg-slate-200/50 flex flex-col items-center justify-center p-8 relative overflow-hidden shadow-inner">
        {/* Spine details helper */}
        <div className="absolute top-4 bg-slate-950/80 px-4 py-2 rounded-full border border-slate-800 text-[10px] font-black uppercase text-amber-400 tracking-widest shadow-md z-15">
          Trim Size: {trimSize.w}" x {trimSize.h}" | Spine Width: {layout.spineWidth.toFixed(3)}"
        </div>

        {/* Canvas container */}
        <div className="relative shadow-[0_15px_50px_rgba(0,0,0,0.15)] bg-white rounded-sm ring-1 ring-slate-300 overflow-hidden cursor-default">
          <canvas ref={canvasRef} />
        </div>

        {/* Instructions Bar */}
        <div className="mt-4 flex gap-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white py-2 px-6 rounded-full border border-slate-200 shadow-sm">
          <span>Left: Back Cover</span>
          <span className="text-amber-500">Center: Spine</span>
          <span>Right: Front Cover</span>
        </div>

        {/* Global Action float buttons */}
        <div className="absolute bottom-4 right-4 flex gap-2">
          <button 
            onClick={() => setSnapToGrid(!snapToGrid)} 
            title="Toggle Snapping alignment"
            className={`p-3 rounded-full transition-all shadow-md ${
              snapToGrid ? 'bg-emerald-500 text-white' : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            <Grid className="w-5 h-5"/>
          </button>
          <button 
            onClick={() => setShowKdpGuides(!showKdpGuides)} 
            title="Toggle KDP Template Layout Guides"
            className={`p-3 rounded-full transition-all shadow-md ${
              showKdpGuides ? 'bg-pink-500 text-white' : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            <LayoutTemplate className="w-5 h-5"/>
          </button>
          <button 
            onClick={handleGenerateCover} 
            disabled={isGenerating} 
            title="Download PDF"
            className="p-3 rounded-full bg-indigo-600 text-white hover:bg-indigo-500 transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            {isGenerating ? <Loader2 className="w-5 h-5 animate-spin"/> : <Download className="w-5 h-5"/>}
          </button>
        </div>
      </div>
    </div>
  );
}
