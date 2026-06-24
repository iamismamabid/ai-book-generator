"use client";

import React, { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import { 
  Type, Square, Circle as CircleIcon, Star, Ruler, 
  Trash2, Undo2, Redo2, Loader2, Download, Check, Settings,
  Sparkles, Shapes, Upload, LayoutTemplate, Grid, ChevronUp, ChevronDown, AlignLeft, AlignCenter, AlignRight,
  Plus
} from "lucide-react";
import { jsPDF } from "jspdf";
import { calculateKdpLayout, KdpSpecs, KdpLayoutResult } from "@/app/utils/kdpLayout";
import { initFabricSnapping } from "@/hooks/useFabricSnap";

const FONT_FAMILIES = ["Arial", "Georgia", "Times New Roman", "Courier New", "Impact", "Comic Sans MS", "Trebuchet MS"];

const CLIPARTS = [
  { name: "Geometric Frame", src: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=300&q=80" },
  { name: "Mandala Flower", src: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=300&q=80" },
  { name: "Floral Frame", src: "https://images.unsplash.com/photo-1525498128493-380d1990a112?auto=format&fit=crop&w=300&q=80" },
  { name: "Golden Pattern", src: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80" },
  { name: "Retro Starburst", src: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=300&q=80" }
];

const BACKGROUNDS = [
  { name: "Midnight Space", back: "#05070F", front: "#0F172A", type: 'gradient', backStart: '#020617', backEnd: '#0f172a', frontStart: '#0f172a', frontEnd: '#1e1b4b' },
  { name: "Watercolor Sunset", back: "#FEF08A", front: "#FECDD3", type: 'gradient', backStart: '#fef08a', backEnd: '#fde047', frontStart: '#fde047', frontEnd: '#fecdd3' },
  { name: "Botanical Forest", back: "#064E3B", front: "#022C22", type: 'gradient', backStart: '#064e3b', backEnd: '#022c22', frontStart: '#022c22', frontEnd: '#022c22' },
  { name: "Vintage Cream", back: "#FEF3C7", front: "#FDE68A", type: 'solid', backStart: '#FEF3C7', backEnd: '#FEF3C7', frontStart: '#FDE68A', frontEnd: '#FDE68A' },
  { name: "Cyberpunk Glow", back: "#030712", front: "#3B0764", type: 'gradient', backStart: '#030712', backEnd: '#111827', frontStart: '#111827', frontEnd: '#3b0764' }
];

const TRIM_SIZES = [
  { label: '6" x 9" (Novel)', w: 6, h: 9 },
  { label: '8.5" x 11" (Letter)', w: 8.5, h: 11 },
  { label: '5.5" x 8.5" (Compact)', w: 5.5, h: 8.5 }
];

interface FabricCoverStudioProps {
  trimSize: { label: string; w: number; h: number };
  setTrimSize: (size: any) => void;
  pageCount: number;
  setPageCount: (cnt: number) => void;
  
  backCoverColor: string;
  setBackCoverColor: (color: string) => void;
  backCoverType: 'solid' | 'gradient';
  setBackCoverType: (type: 'solid' | 'gradient') => void;
  backCoverGradientStart: string;
  setBackCoverGradientStart: (color: string) => void;
  backCoverGradientEnd: string;
  setBackCoverGradientEnd: (color: string) => void;

  frontCoverColor: string;
  setFrontCoverColor: (color: string) => void;
  frontCoverType: 'solid' | 'gradient';
  setFrontCoverType: (type: 'solid' | 'gradient') => void;
  frontCoverGradientStart: string;
  setFrontCoverGradientStart: (color: string) => void;
  frontCoverGradientEnd: string;
  setFrontCoverGradientEnd: (color: string) => void;

  showKdpGuides: boolean;
  setShowKdpGuides: (show: boolean) => void;
  snapToGrid: boolean;
  setSnapToGrid: (snap: boolean) => void;
  initialElements: any[];
  onSaveWorkspace: (serializedJson: any) => void;
}

const serializeToLegacyElements = (fCanvas: fabric.Canvas): any[] => {
  return fCanvas.getObjects().map((obj: any) => {
    let type = '';
    if (obj.type === 'i-text' || obj.type === 'text') {
      type = 'text';
    } else if (obj.type === 'rect') {
      type = 'rect';
    } else if (obj.type === 'circle') {
      type = 'circle';
    } else if (obj.type === 'line') {
      type = 'line';
    } else if (obj.type === 'image') {
      type = 'clipart';
    } else if (obj.type === 'polygon') {
      type = 'star';
    }

    const base: any = {
      id: obj.id || `${type}-${Date.now()}-${Math.round(Math.random() * 1000)}`,
      type,
      x: obj.left,
      y: obj.top,
      rotation: obj.angle || 0,
      opacity: obj.opacity ?? 1,
      fill: typeof obj.fill === 'string' ? obj.fill : undefined,
      stroke: obj.stroke,
      strokeWidth: obj.strokeWidth
    };

    // Set the id back on the object so it stays consistent
    obj.id = base.id;

    if (type === 'text') {
      base.text = obj.text;
      base.fontSize = Math.round((obj.fontSize || 24) * (obj.scaleX || 1));
      base.scaleX = 1;
      base.scaleY = 1;
      base.fontFamily = obj.fontFamily;
      base.fontStyle = obj.fontStyle;
      base.align = obj.textAlign;
    } else if (type === 'rect') {
      base.width = (obj.width || 100) * (obj.scaleX || 1);
      base.height = (obj.height || 100) * (obj.scaleY || 1);
      base.scaleX = 1;
      base.scaleY = 1;
      base.cornerRadius = obj.rx;
    } else if (type === 'circle') {
      base.radius = (obj.radius || 50) * (obj.scaleX || 1);
      base.scaleX = 1;
      base.scaleY = 1;
    } else if (type === 'clipart') {
      base.src = obj.getSrc ? obj.getSrc() : obj._element?.src || '';
      base.width = (obj.width || 150) * (obj.scaleX || 1);
      base.height = (obj.height || 150) * (obj.scaleY || 1);
      base.scaleX = 1;
      base.scaleY = 1;
    } else if (type === 'line') {
      base.points = [obj.x1, obj.y1, obj.x2, obj.y2];
      base.scaleX = 1;
      base.scaleY = 1;
    } else if (type === 'star') {
      base.points = obj.points;
    }

    return base;
  });
};

export default function FabricCoverStudio({
  trimSize,
  setTrimSize,
  pageCount,
  setPageCount,
  backCoverColor,
  setBackCoverColor,
  backCoverType,
  setBackCoverType,
  backCoverGradientStart,
  setBackCoverGradientStart,
  backCoverGradientEnd,
  setBackCoverGradientEnd,
  frontCoverColor,
  setFrontCoverColor,
  frontCoverType,
  setFrontCoverType,
  frontCoverGradientStart,
  setFrontCoverGradientStart,
  frontCoverGradientEnd,
  setFrontCoverGradientEnd,
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
  const [activeToolTab, setActiveToolTab] = useState<'elements' | 'graphics' | 'presets' | 'uploads' | 'settings'>('elements');

  // History Undo/Redo States
  const [history, setHistory] = useState<string[]>([]);
  const [historyStep, setHistoryStep] = useState(-1);
  const isUpdatingHistory = useRef(false);

  // Graphics panel states
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState('');

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
      
      const legacyElements = serializeToLegacyElements(fCanvas);
      onSaveWorkspace(legacyElements);
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
      
      // 1. Draw Back Cover background
      if (backCoverType === 'gradient') {
        const grad = ctx.createLinearGradient(0, 0, layout.spineLeftPx, 0);
        grad.addColorStop(0, backCoverGradientStart);
        grad.addColorStop(1, backCoverGradientEnd);
        ctx.fillStyle = grad;
      } else {
        ctx.fillStyle = backCoverColor;
      }
      ctx.fillRect(0, 0, layout.spineLeftPx, layout.canvasHeight);

      // 2. Draw Spine background
      ctx.fillStyle = backCoverColor;
      ctx.fillRect(layout.spineLeftPx, 0, layout.spineWidthPx, layout.canvasHeight);

      // 3. Draw Front Cover background
      if (frontCoverType === 'gradient') {
        const grad = ctx.createLinearGradient(layout.spineRightPx, 0, layout.canvasWidth, 0);
        grad.addColorStop(0, frontCoverGradientStart);
        grad.addColorStop(1, frontCoverGradientEnd);
        ctx.fillStyle = grad;
      } else {
        ctx.fillStyle = frontCoverColor;
      }
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
  }, [
    canvas, backCoverColor, backCoverType, backCoverGradientStart, backCoverGradientEnd,
    frontCoverColor, frontCoverType, frontCoverGradientStart, frontCoverGradientEnd,
    showKdpGuides, isGenerating, layout
  ]);

  // Import Legacy Elements Translation helper
  const importLegacyElements = (fCanvas: fabric.Canvas, elements: any[], kdp: KdpLayoutResult) => {
    if (!elements || elements.length === 0) return;

    elements.forEach(el => {
      let obj: fabric.Object | null = null;

      if (el.type === 'text') {
        obj = new fabric.IText(el.text, {
          id: el.id,
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
        } as any);
      } else if (el.type === 'rect') {
        obj = new fabric.Rect({
          id: el.id,
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
        } as any);
      } else if (el.type === 'circle') {
        obj = new fabric.Circle({
          id: el.id,
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
        } as any);
      } else if (el.type === 'line') {
        obj = new fabric.Line(el.points || [0, 0, 100, 0], {
          id: el.id,
          left: el.x,
          top: el.y,
          stroke: el.stroke || '#FFFFFF',
          strokeWidth: el.strokeWidth || 4,
          scaleX: el.scaleX || 1,
          scaleY: el.scaleY || 1,
          angle: el.rotation || 0,
          opacity: el.opacity ?? 1
        } as any);
      } else if (el.type === 'clipart') {
        fabric.Image.fromURL(el.src, (img) => {
          img.set({
            id: el.id,
            left: el.x,
            top: el.y,
            width: el.width || 150,
            height: el.height || 150,
            scaleX: el.scaleX || 1,
            scaleY: el.scaleY || 1,
            angle: el.rotation || 0,
            opacity: el.opacity ?? 1
          } as any);
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

  const applyPresetColors = (back: string, front: string, type?: string, backStart?: string, backEnd?: string, frontStart?: string, frontEnd?: string) => {
    if (type === 'gradient' && backStart && backEnd && frontStart && frontEnd) {
      setBackCoverType('gradient');
      setBackCoverGradientStart(backStart);
      setBackCoverGradientEnd(backEnd);
      setFrontCoverType('gradient');
      setFrontCoverGradientStart(frontStart);
      setFrontCoverGradientEnd(frontEnd);
    } else {
      setBackCoverType('solid');
      setBackCoverColor(back);
      setFrontCoverType('solid');
      setFrontCoverColor(front);
    }
  };

  const handleGenerateCover = async () => {
    if (!canvas) return;
    setIsGenerating(true);
    canvas.discardActiveObject();
    canvas.requestRenderAll();
    
    setTimeout(() => {
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
    <div className="flex flex-1 overflow-hidden h-full">
      {/* 1. Far Left Tool Picker Toolbar */}
      <div className="w-16 bg-slate-950 flex flex-col items-center py-6 gap-5 border-r border-slate-900 z-20 text-slate-400">
        <button 
          onClick={() => setActiveToolTab('elements')} 
          title="Shapes & Text"
          className={`p-3 rounded-xl transition-all ${
            activeToolTab === 'elements' ? 'bg-amber-500 text-slate-950 font-bold shadow-md' : 'hover:bg-slate-900 hover:text-white'
          }`}
        >
          <Plus className="w-5 h-5"/>
        </button>
        <button 
          onClick={() => setActiveToolTab('graphics')} 
          title="Clipart Library"
          className={`p-3 rounded-xl transition-all ${
            activeToolTab === 'graphics' ? 'bg-amber-500 text-slate-950 font-bold shadow-md' : 'hover:bg-slate-900 hover:text-white'
          }`}
        >
          <Shapes className="w-5 h-5"/>
        </button>
        <button 
          onClick={() => setActiveToolTab('presets')} 
          title="Background Presets"
          className={`p-3 rounded-xl transition-all ${
            activeToolTab === 'presets' ? 'bg-amber-500 text-slate-950 font-bold shadow-md' : 'hover:bg-slate-900 hover:text-white'
          }`}
        >
          <Sparkles className="w-5 h-5"/>
        </button>
        <button 
          onClick={() => setActiveToolTab('uploads')} 
          title="Upload Custom Graphics"
          className={`p-3 rounded-xl transition-all ${
            activeToolTab === 'uploads' ? 'bg-amber-500 text-slate-950 font-bold shadow-md' : 'hover:bg-slate-900 hover:text-white'
          }`}
        >
          <Upload className="w-5 h-5"/>
        </button>
        <button 
          onClick={() => setActiveToolTab('settings')} 
          title="Cover Specs"
          className={`p-3 rounded-xl transition-all ${
            activeToolTab === 'settings' ? 'bg-amber-500 text-slate-950 font-bold shadow-md' : 'hover:bg-slate-900 hover:text-white'
          }`}
        >
          <Settings className="w-5 h-5"/>
        </button>

        <div className="mt-auto flex flex-col gap-4 border-t border-slate-900 pt-5 w-full px-2">
          <button 
            onClick={() => setShowKdpGuides(!showKdpGuides)} 
            title="Toggle KDP Layout Guides"
            className={`p-3 mx-auto rounded-xl transition-all ${
              showKdpGuides ? 'text-pink-400 bg-pink-500/10 border border-pink-500/20' : 'text-slate-500 hover:text-white'
            }`}
          >
            <LayoutTemplate className="w-5 h-5"/>
          </button>
          <button 
            onClick={handleGenerateCover} 
            disabled={isGenerating} 
            title="Compile & Download PDF Cover"
            className="p-3 mx-auto rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 transition-all shadow-md shadow-indigo-600/25 active:scale-95 disabled:opacity-50"
          >
            {isGenerating ? <Loader2 className="w-5 h-5 animate-spin"/> : <Download className="w-5 h-5"/>}
          </button>
        </div>
      </div>

      {/* 2. Left Configuration Panel */}
      <div className="w-68 bg-slate-50 border-r border-slate-200 flex flex-col p-5 z-10 overflow-y-auto">
        
        {activeToolTab === 'elements' && (
          <div className="space-y-5">
            <div className="flex justify-between items-center">
              <h3 className="font-black text-[10px] uppercase tracking-widest text-slate-400">Library Assets</h3>
              <div className="flex gap-1.5">
                <button 
                  onClick={handleUndo} 
                  disabled={historyStep <= 0} 
                  title="Undo" 
                  className="p-1.5 rounded bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30"
                >
                  <Undo2 className="w-3.5 h-3.5"/>
                </button>
                <button 
                  onClick={handleRedo} 
                  disabled={historyStep === history.length - 1} 
                  title="Redo" 
                  className="p-1.5 rounded bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30"
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
                  className="w-full p-2.5 bg-red-50 text-red-600 text-xs font-black rounded-xl border border-red-100 hover:bg-red-100 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-4 h-4"/> Delete Layer
                </button>
              </div>
            )}

            <div className="pt-4 border-t border-slate-200">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={snapToGrid} 
                  onChange={(e) => setSnapToGrid(e.target.checked)}
                  className="rounded text-amber-500 accent-amber-500 cursor-pointer"
                />
                <span className="text-xs font-black text-slate-700 flex items-center gap-1">Snap to Grid (10px)</span>
              </label>
            </div>
          </div>
        )}

        {activeToolTab === 'graphics' && (
          <div className="space-y-4">
            <h3 className="font-black text-[10px] uppercase tracking-widest text-slate-400">BookBolt Clipart</h3>
            <div className="grid grid-cols-2 gap-2">
              {CLIPARTS.map((clip, i) => (
                <button 
                  key={i} 
                  onClick={() => addClipart(clip.src)}
                  className="group relative aspect-square rounded-xl border border-slate-200 bg-white overflow-hidden hover:border-amber-400 hover:shadow-sm transition-all p-1"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={clip.src} alt={clip.name} className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-300" />
                  <span className="absolute bottom-1 left-1 right-1 bg-black/60 text-[8px] text-white text-center font-bold px-1 py-0.5 rounded truncate">{clip.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeToolTab === 'presets' && (
          <div className="space-y-4">
            <h3 className="font-black text-[10px] uppercase tracking-widest text-slate-400">Cover Styles</h3>
            <div className="space-y-2">
              {BACKGROUNDS.map((bg, i) => (
                <button 
                  key={i} 
                  onClick={() => applyPresetColors(bg.back, bg.front, bg.type, bg.backStart, bg.backEnd, bg.frontStart, bg.frontEnd)}
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl hover:border-amber-400 hover:shadow-sm transition-all text-left flex items-center justify-between group"
                >
                  <div>
                    <p className="text-xs font-black text-slate-700">{bg.name}</p>
                    <div className="flex gap-1.5 mt-1.5">
                      <span className="w-4 h-4 rounded border border-slate-200 block" style={{ backgroundColor: bg.type === 'gradient' ? bg.backStart : bg.back }} />
                      <span className="w-4 h-4 rounded border border-slate-200 block" style={{ backgroundColor: bg.type === 'gradient' ? bg.frontEnd : bg.front }} />
                      <span className="text-[9px] text-slate-400 font-bold uppercase self-center">{bg.type}</span>
                    </div>
                  </div>
                  <Check className="w-4 h-4 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>
        )}

        {activeToolTab === 'uploads' && (
          <div className="space-y-5">
            <h3 className="font-black text-[10px] uppercase tracking-widest text-slate-400">Custom Graphics</h3>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 block">Upload Local Image</label>
              <label className="w-full p-3 bg-white border border-dashed border-slate-300 rounded-xl text-xs font-black flex flex-col items-center justify-center gap-2 hover:border-amber-400 hover:bg-slate-50/50 cursor-pointer transition-all text-slate-600">
                <Upload className="w-5 h-5 text-indigo-500"/>
                <span>Choose Image File</span>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event: any) => {
                        setUploadedImages(prev => [...prev, event.target.result]);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="hidden" 
                />
              </label>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 block">Add Image by URL</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Paste image URL..."
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  className="flex-1 text-xs font-semibold p-2 border border-slate-200 rounded-xl focus:border-amber-400 outline-none"
                />
                <button 
                  onClick={() => {
                    if (imageUrlInput.trim()) {
                      setUploadedImages(prev => [...prev, imageUrlInput.trim()]);
                      setImageUrlInput('');
                    }
                  }}
                  className="px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black font-sans"
                >
                  Add
                </button>
              </div>
            </div>

            {uploadedImages.length > 0 && (
              <div className="space-y-3 pt-3 border-t border-slate-200">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Uploaded Assets</p>
                <div className="grid grid-cols-2 gap-2">
                  {uploadedImages.map((src, i) => (
                    <button 
                      key={i} 
                      onClick={() => addClipart(src)}
                      className="group relative aspect-square rounded-xl border border-slate-200 bg-white overflow-hidden hover:border-amber-400 hover:shadow-sm transition-all p-1"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="UploadedAsset" className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-300" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeToolTab === 'settings' && (
          <div className="space-y-5">
            <h3 className="font-black text-[10px] uppercase tracking-widest text-slate-400">Layout Canvas Specs</h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Book Trim Size</label>
                <select 
                  value={trimSize.label} 
                  onChange={(e) => {
                    const size = TRIM_SIZES.find(s => s.label === e.target.value);
                    if (size) setTrimSize(size);
                  }}
                  className="w-full text-xs font-bold p-2.5 bg-white border border-slate-200 rounded-xl"
                >
                  {TRIM_SIZES.map((sz, i) => (
                    <option key={i} value={sz.label}>{sz.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Interior Pages Count ({pageCount})</label>
                <input 
                  type="range" 
                  min="24" 
                  max="600" 
                  value={pageCount} 
                  onChange={(e) => setPageCount(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-ew-resize bg-slate-200 rounded"
                />
                <p className="text-[10px] text-slate-400 font-semibold mt-1">Spine size: {layout.spineWidth.toFixed(4)}" inches</p>
              </div>

              <div className="h-px bg-slate-200 my-4" />

              {/* Back Cover Customization */}
              <div className="space-y-2 border-b border-slate-200 pb-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-600 block">Back Cover Background</label>
                  <div className="flex bg-slate-200/80 p-0.5 rounded-lg border border-slate-300/40 text-[9px] font-black uppercase">
                    <button 
                      onClick={() => setBackCoverType('solid')}
                      className={`px-2 py-1 rounded-md transition-all ${backCoverType === 'solid' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}
                    >
                      Solid
                    </button>
                    <button 
                      onClick={() => setBackCoverType('gradient')}
                      className={`px-2 py-1 rounded-md transition-all ${backCoverType === 'gradient' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}
                    >
                      Gradient
                    </button>
                  </div>
                </div>

                {backCoverType === 'solid' ? (
                  <div className="flex gap-2">
                    <input 
                      type="color" 
                      value={backCoverColor} 
                      onChange={(e) => setBackCoverColor(e.target.value)} 
                      className="w-9 h-9 rounded-xl cursor-pointer border border-slate-200 p-0.5 bg-white shadow-sm" 
                    />
                    <input 
                      type="text" 
                      value={backCoverColor} 
                      onChange={(e) => setBackCoverColor(e.target.value)} 
                      className="flex-1 text-xs font-bold uppercase p-2 border border-slate-200 rounded-xl text-center font-mono" 
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 bg-white p-2 border rounded-xl">
                    <div>
                      <label className="text-[9px] font-bold text-slate-400 block mb-0.5 uppercase">Color 1</label>
                      <div className="flex gap-1 items-center">
                        <input 
                          type="color" 
                          value={backCoverGradientStart} 
                          onChange={(e) => setBackCoverGradientStart(e.target.value)} 
                          className="w-7 h-7 rounded-lg cursor-pointer border border-slate-200 p-0.5 bg-white" 
                        />
                        <span className="text-[9px] font-black text-slate-400 uppercase truncate">{backCoverGradientStart}</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-slate-400 block mb-0.5 uppercase">Color 2</label>
                      <div className="flex gap-1 items-center">
                        <input 
                          type="color" 
                          value={backCoverGradientEnd} 
                          onChange={(e) => setBackCoverGradientEnd(e.target.value)} 
                          className="w-7 h-7 rounded-lg cursor-pointer border border-slate-200 p-0.5 bg-white" 
                        />
                        <span className="text-[9px] font-black text-slate-400 uppercase truncate">{backCoverGradientEnd}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Front Cover Customization */}
              <div className="space-y-2 pt-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-600 block">Front Cover Background</label>
                  <div className="flex bg-slate-200/80 p-0.5 rounded-lg border border-slate-300/40 text-[9px] font-black uppercase">
                    <button 
                      onClick={() => setFrontCoverType('solid')}
                      className={`px-2 py-1 rounded-md transition-all ${frontCoverType === 'solid' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}
                    >
                      Solid
                    </button>
                    <button 
                      onClick={() => setFrontCoverType('gradient')}
                      className={`px-2 py-1 rounded-md transition-all ${frontCoverType === 'gradient' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}
                    >
                      Gradient
                    </button>
                  </div>
                </div>

                {frontCoverType === 'solid' ? (
                  <div className="flex gap-2">
                    <input 
                      type="color" 
                      value={frontCoverColor} 
                      onChange={(e) => setFrontCoverColor(e.target.value)} 
                      className="w-9 h-9 rounded-xl cursor-pointer border border-slate-200 p-0.5 bg-white shadow-sm" 
                    />
                    <input 
                      type="text" 
                      value={frontCoverColor} 
                      onChange={(e) => setFrontCoverColor(e.target.value)} 
                      className="flex-1 text-xs font-bold uppercase p-2 border border-slate-200 rounded-xl text-center font-mono" 
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 bg-white p-2 border rounded-xl">
                    <div>
                      <label className="text-[9px] font-bold text-slate-400 block mb-0.5 uppercase">Color 1</label>
                      <div className="flex gap-1 items-center">
                        <input 
                          type="color" 
                          value={frontCoverGradientStart} 
                          onChange={(e) => setFrontCoverGradientStart(e.target.value)} 
                          className="w-7 h-7 rounded-lg cursor-pointer border border-slate-200 p-0.5 bg-white" 
                        />
                        <span className="text-[9px] font-black text-slate-400 uppercase truncate">{frontCoverGradientStart}</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-slate-400 block mb-0.5 uppercase">Color 2</label>
                      <div className="flex gap-1 items-center">
                        <input 
                          type="color" 
                          value={frontCoverGradientEnd} 
                          onChange={(e) => setFrontCoverGradientEnd(e.target.value)} 
                          className="w-7 h-7 rounded-lg cursor-pointer border border-slate-200 p-0.5 bg-white" 
                        />
                        <span className="text-[9px] font-black text-slate-400 uppercase truncate">{frontCoverGradientEnd}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. FABRIC WORKSPACE */}
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
      </div>
    </div>
  );
}
