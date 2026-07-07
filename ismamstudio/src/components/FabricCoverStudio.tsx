"use client";

import React, { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import { 
  Type, Square, Circle as CircleIcon, Star, Ruler, 
  Trash2, Undo2, Redo2, Loader2, Download, Check, Settings,
  Sparkles, Shapes, Upload, LayoutTemplate, Grid, ChevronUp, ChevronDown, AlignLeft, AlignCenter, AlignRight,
  Plus, Eraser, Lock, Unlock, Copy, Scissors, Clipboard, ChevronsUp, ChevronsDown
} from "lucide-react";
import { jsPDF } from "jspdf";
import { calculateKdpLayout, KdpSpecs, KdpLayoutResult } from "@/app/utils/kdpLayout";
import { initFabricSnapping } from "@/hooks/useFabricSnap";

const FONT_FAMILIES = ["Arial", "Georgia", "Times New Roman", "Courier New", "Impact", "Comic Sans MS", "Trebuchet MS", "Outfit", "Inter"];

const CLIPARTS = [
  { name: "Quantum Propulsion", src: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=300&q=80" },
  { name: " containment field", src: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=300&q=80" },
  { name: "Warp Schematic", src: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80" },
  { name: "Magnetic Coil", src: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=300&q=80" },
  { name: "FAA Flight Orbit", src: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=300&q=80" }
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
  
  coverBackground: {
    backCoverColor: string;
    backCoverType: 'solid' | 'gradient';
    backCoverGradientStart: string;
    backCoverGradientEnd: string;
    frontCoverColor: string;
    frontCoverType: 'solid' | 'gradient';
    frontCoverGradientStart: string;
    frontCoverGradientEnd: string;
    backCoverImage: string;
    frontCoverImage: string;
    fullCoverImage: string;
  };
  setCoverBackground: React.Dispatch<React.SetStateAction<{
    backCoverColor: string;
    backCoverType: 'solid' | 'gradient';
    backCoverGradientStart: string;
    backCoverGradientEnd: string;
    frontCoverColor: string;
    frontCoverType: 'solid' | 'gradient';
    frontCoverGradientStart: string;
    frontCoverGradientEnd: string;
    backCoverImage: string;
    frontCoverImage: string;
    fullCoverImage: string;
  }>>;

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
    if (obj.type === 'i-text' || obj.type === 'text' || obj.type === 'textbox') {
      type = obj.type === 'textbox' ? 'textbox' : 'text';
    } else if (obj.type === 'rect') {
      type = 'rect';
    } else if (obj.type === 'circle') {
      type = 'circle';
    } else if (obj.type === 'line') {
      type = 'line';
    } else if (obj.type === 'image') {
      type = 'clipart';
    } else if (obj.type === 'triangle') {
      type = 'triangle';
    } else if (obj.type === 'polygon' && obj.isHexagon) {
      type = 'hexagon';
    } else if (obj.type === 'polygon' && obj.isPentagon) {
      type = 'pentagon';
    } else if (obj.type === 'polygon' && obj.isOctagon) {
      type = 'octagon';
    } else if (obj.type === 'polygon' && obj.isDiamond) {
      type = 'diamond';
    } else if (obj.type === 'polygon' && obj.isTrapezoid) {
      type = 'trapezoid';
    } else if (obj.type === 'ellipse') {
      type = 'ellipse';
    } else if (obj.type === 'polygon') {
      type = 'star';
    } else if (obj.type === 'path' && obj.isHeart) {
      type = 'heart';
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
      strokeWidth: obj.strokeWidth,
      isLocked: !!obj.isLocked
    };

    // Set the id back on the object so it stays consistent
    obj.id = base.id;

    if (type === 'text' || type === 'textbox') {
      base.text = obj.text;
      base.fontSize = Math.round((obj.fontSize || 24) * (obj.scaleX || 1));
      base.scaleX = 1;
      base.scaleY = 1;
      base.fontFamily = obj.fontFamily;
      base.fontStyle = obj.fontStyle;
      base.align = obj.textAlign;
      base.width = (obj.width || 240) * (obj.scaleX || 1);
      if (type === 'textbox') {
        base.isTextbox = true;
      }
    } else if (type === 'rect' || type === 'triangle' || type === 'hexagon' || type === 'star' || type === 'heart' || type === 'pentagon' || type === 'octagon' || type === 'ellipse' || type === 'diamond' || type === 'trapezoid') {
      base.width = (obj.width || 100) * (obj.scaleX || 1);
      base.height = (obj.height || 100) * (obj.scaleY || 1);
      base.scaleX = 1;
      base.scaleY = 1;
      if (type === 'rect') {
        base.cornerRadius = obj.rx;
      } else if (type === 'star' || type === 'pentagon' || type === 'octagon' || type === 'diamond' || type === 'trapezoid') {
        base.points = obj.points;
      }
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
    }

    return base;
  });
};

export default function FabricCoverStudio({
  trimSize,
  setTrimSize,
  pageCount,
  setPageCount,
  coverBackground,
  setCoverBackground,
  showKdpGuides,
  setShowKdpGuides,
  snapToGrid,
  setSnapToGrid,
  initialElements,
  onSaveWorkspace
}: FabricCoverStudioProps) {
  // Destructure coverBackground properties locally to maintain full compatibility with existing code
  const {
    backCoverColor,
    backCoverType,
    backCoverGradientStart,
    backCoverGradientEnd,
    frontCoverColor,
    frontCoverType,
    frontCoverGradientStart,
    frontCoverGradientEnd,
    backCoverImage,
    frontCoverImage,
    fullCoverImage
  } = coverBackground;

  // Keep a ref to coverBackground to prevent stale closure inside saveState and ensure instant rendering
  const coverBackgroundRef = useRef(coverBackground);
  useEffect(() => {
    coverBackgroundRef.current = coverBackground;
  }, [coverBackground]);

  // Local helper setters that update the combined coverBackground state object and the ref for instant sync
  const setBackCoverColor = (val: string) => {
    coverBackgroundRef.current = { ...coverBackgroundRef.current, backCoverColor: val };
    setCoverBackground(prev => ({ ...prev, backCoverColor: val }));
    if (canvas) canvas.renderAll();
  };
  const setBackCoverType = (val: 'solid' | 'gradient') => {
    coverBackgroundRef.current = { ...coverBackgroundRef.current, backCoverType: val };
    setCoverBackground(prev => ({ ...prev, backCoverType: val }));
    if (canvas) canvas.renderAll();
  };
  const setBackCoverGradientStart = (val: string) => {
    coverBackgroundRef.current = { ...coverBackgroundRef.current, backCoverGradientStart: val };
    setCoverBackground(prev => ({ ...prev, backCoverGradientStart: val }));
    if (canvas) canvas.renderAll();
  };
  const setBackCoverGradientEnd = (val: string) => {
    coverBackgroundRef.current = { ...coverBackgroundRef.current, backCoverGradientEnd: val };
    setCoverBackground(prev => ({ ...prev, backCoverGradientEnd: val }));
    if (canvas) canvas.renderAll();
  };
  const setFrontCoverColor = (val: string) => {
    coverBackgroundRef.current = { ...coverBackgroundRef.current, frontCoverColor: val };
    setCoverBackground(prev => ({ ...prev, frontCoverColor: val }));
    if (canvas) canvas.renderAll();
  };
  const setFrontCoverType = (val: 'solid' | 'gradient') => {
    coverBackgroundRef.current = { ...coverBackgroundRef.current, frontCoverType: val };
    setCoverBackground(prev => ({ ...prev, frontCoverType: val }));
    if (canvas) canvas.renderAll();
  };
  const setFrontCoverGradientStart = (val: string) => {
    coverBackgroundRef.current = { ...coverBackgroundRef.current, frontCoverGradientStart: val };
    setCoverBackground(prev => ({ ...prev, frontCoverGradientStart: val }));
    if (canvas) canvas.renderAll();
  };
  const setFrontCoverGradientEnd = (val: string) => {
    coverBackgroundRef.current = { ...coverBackgroundRef.current, frontCoverGradientEnd: val };
    setCoverBackground(prev => ({ ...prev, frontCoverGradientEnd: val }));
    if (canvas) canvas.renderAll();
  };
  const setBackCoverImage = (val: string) => {
    coverBackgroundRef.current = { ...coverBackgroundRef.current, backCoverImage: val };
    setCoverBackground(prev => ({ ...prev, backCoverImage: val }));
    if (canvas) canvas.renderAll();
  };
  const setFrontCoverImage = (val: string) => {
    coverBackgroundRef.current = { ...coverBackgroundRef.current, frontCoverImage: val };
    setCoverBackground(prev => ({ ...prev, frontCoverImage: val }));
    if (canvas) canvas.renderAll();
  };
  const setFullCoverImage = (val: string) => {
    coverBackgroundRef.current = { ...coverBackgroundRef.current, fullCoverImage: val };
    setCoverBackground(prev => ({ ...prev, fullCoverImage: val }));
    if (canvas) canvas.renderAll();
  };

  // Ref to hold saveState function to call it when coverBackground updates
  const saveStateRef = useRef<() => void>(() => {});
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scaleRatio, setScaleRatio] = useState(1);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeObject, setActiveObject] = useState<fabric.Object | null>(null);
  const [clipboard, setClipboard] = useState<any>(null);
  const [isObjectLocked, setIsObjectLocked] = useState(false);
  const [activeToolTab, setActiveToolTab] = useState<'elements' | 'graphics' | 'presets' | 'uploads' | 'settings'>('elements');

  // History Undo/Redo States
  const [history, setHistory] = useState<string[]>([]);
  const [historyStep, setHistoryStep] = useState(-1);
  const historyRef = useRef<string[]>([]);
  const historyStepRef = useRef<number>(-1);
  const isUpdatingHistory = useRef(false);

  // Unsplash search states
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  // Active object editing states
  const [objectColor, setObjectColor] = useState("#FFFFFF");
  const [objectStrokeColor, setObjectStrokeColor] = useState("#FFFFFF");
  const [objectStrokeWidth, setObjectStrokeWidth] = useState(0);
  const [objectText, setObjectText] = useState("");
  const [objectFontSize, setObjectFontSize] = useState(32);
  const [objectFontFamily, setObjectFontFamily] = useState("Arial");

  // Spine Text Alignment States
  const [spineTextVAlign, setSpineTextVAlign] = useState<'top' | 'center' | 'bottom'>('center');
  const [spineTextRotation, setSpineTextRotation] = useState<90 | 270>(90);

  // Typography & Effects States
  const [objectCharSpacing, setObjectCharSpacing] = useState(0);
  const [objectLineHeight, setObjectLineHeight] = useState(1.16);
  const [objectOpacity, setObjectOpacity] = useState(1);
  const [objectHasShadow, setObjectHasShadow] = useState(false);
  const [objectShadowColor, setObjectShadowColor] = useState("rgba(0,0,0,0.5)");
  const [objectShadowBlur, setObjectShadowBlur] = useState(10);
  const [objectShadowOffsetX, setObjectShadowOffsetX] = useState(5);
  const [objectShadowOffsetY, setObjectShadowOffsetY] = useState(5);

  // Layer list state for UI rendering
  const [layers, setLayers] = useState<fabric.Object[]>([]);

  // Background Image refs
  const backCoverImageEl = useRef<HTMLImageElement | null>(null);
  const frontCoverImageEl = useRef<HTMLImageElement | null>(null);
  const fullCoverImageEl = useRef<HTMLImageElement | null>(null);

  // Background Image loaders
  useEffect(() => {
    if (fullCoverImage) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = fullCoverImage;
      img.onload = () => {
        fullCoverImageEl.current = img;
        canvas?.requestRenderAll();
      };
      img.onerror = () => {
        fullCoverImageEl.current = null;
      };
    } else {
      fullCoverImageEl.current = null;
      canvas?.requestRenderAll();
    }
  }, [fullCoverImage, canvas]);

  useEffect(() => {
    if (backCoverImage) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = backCoverImage;
      img.onload = () => {
        backCoverImageEl.current = img;
        canvas?.requestRenderAll();
      };
      img.onerror = () => {
        backCoverImageEl.current = null;
      };
    } else {
      backCoverImageEl.current = null;
      canvas?.requestRenderAll();
    }
  }, [backCoverImage, canvas]);

  useEffect(() => {
    if (frontCoverImage) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = frontCoverImage;
      img.onload = () => {
        frontCoverImageEl.current = img;
        canvas?.requestRenderAll();
      };
      img.onerror = () => {
        frontCoverImageEl.current = null;
      };
    } else {
      frontCoverImageEl.current = null;
      canvas?.requestRenderAll();
    }
  }, [frontCoverImage, canvas]);

  // Sync active object properties to states
  useEffect(() => {
    if (!activeObject) return;
    setObjectColor(activeObject.fill as string || "#FFFFFF");
    setObjectStrokeColor(activeObject.stroke || "#FFFFFF");
    setObjectStrokeWidth(activeObject.strokeWidth || 0);
    setObjectOpacity(activeObject.opacity ?? 1);
    setIsObjectLocked(!!(activeObject as any).isLocked);

    // Sync shadow properties if any
    const shadow = activeObject.shadow as fabric.Shadow | undefined;
    if (shadow) {
      setObjectHasShadow(true);
      setObjectShadowColor(shadow.color || "rgba(0,0,0,0.5)");
      setObjectShadowBlur(shadow.blur || 10);
      setObjectShadowOffsetX(shadow.offsetX || 5);
      setObjectShadowOffsetY(shadow.offsetY || 5);
    } else {
      setObjectHasShadow(false);
    }

    if (activeObject.type === 'i-text' || activeObject.type === 'text') {
      const textObj = activeObject as fabric.IText;
      setObjectText(textObj.text || "");
      setObjectFontSize(textObj.fontSize || 32);
      setObjectFontFamily(textObj.fontFamily || "Arial");
      setObjectCharSpacing(textObj.charSpacing || 0);
      setObjectLineHeight(textObj.lineHeight || 1.16);
    }
  }, [activeObject]);

  const updateActiveObjectProperty = (property: string, value: any, saveHistory = true) => {
    if (!canvas || !activeObject) return;
    activeObject.set({ [property]: value });
    canvas.requestRenderAll();
    if (saveHistory) {
      canvas.fire("object:modified", { target: activeObject });
    }
  };

  const updateActiveObjectShadow = (hasShadow: boolean, color: string, blur: number, ox: number, oy: number, saveHistory = true) => {
    if (!canvas || !activeObject) return;
    if (hasShadow) {
      activeObject.set({
        shadow: new fabric.Shadow({
          color: color,
          blur: blur,
          offsetX: ox,
          offsetY: oy
        })
      });
    } else {
      activeObject.set({ shadow: undefined });
    }
    canvas.requestRenderAll();
    if (saveHistory) {
      canvas.fire("object:modified", { target: activeObject });
    }
  };

  // Keyboard Shortcuts via stable handler refs (initialized empty to avoid TDZ errors)
  const handlersRef = useRef<any>({});

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }

      const key = e.key.toLowerCase();
      if ((e.ctrlKey || e.metaKey) && key === 'z') {
        e.preventDefault();
        handlersRef.current.handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && key === 'y') {
        e.preventDefault();
        handlersRef.current.handleRedo();
      } else if ((e.ctrlKey || e.metaKey) && key === 'c') {
        e.preventDefault();
        handlersRef.current.copySelected();
      } else if ((e.ctrlKey || e.metaKey) && key === 'x') {
        e.preventDefault();
        handlersRef.current.cutSelected();
      } else if ((e.ctrlKey || e.metaKey) && key === 'v') {
        e.preventDefault();
        handlersRef.current.pasteSelected();
      } else if ((e.ctrlKey || e.metaKey) && key === 'd') {
        e.preventDefault();
        handlersRef.current.duplicateSelected();
      } else if ((e.ctrlKey || e.metaKey) && key === 'l') {
        e.preventDefault();
        handlersRef.current.toggleLockSelected();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        handlersRef.current.deleteSelected();
      } else if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
        e.preventDefault();
        handlersRef.current.handleNudge(e.key, e.shiftKey);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);


  // Paper Type Selection ('white' | 'cream' | 'color')
  const [paperType, setPaperType] = useState<'white' | 'cream' | 'color'>('white');

  // Helper for KDP interior margin guidelines
  const getKdpGutterReference = (pages: number) => {
    if (pages <= 150) return { gutter: '0.375" (9.6 mm)', outsideNoBleed: '0.25" (6.4 mm)', outsideBleed: '0.375" (9.6 mm)' };
    if (pages <= 300) return { gutter: '0.500" (12.7 mm)', outsideNoBleed: '0.25" (6.4 mm)', outsideBleed: '0.375" (9.6 mm)' };
    if (pages <= 500) return { gutter: '0.625" (15.9 mm)', outsideNoBleed: '0.25" (6.4 mm)', outsideBleed: '0.375" (9.6 mm)' };
    if (pages <= 700) return { gutter: '0.750" (19.1 mm)', outsideNoBleed: '0.25" (6.4 mm)', outsideBleed: '0.375" (9.6 mm)' };
    return { gutter: '0.875" (22.3 mm)', outsideNoBleed: '0.25" (6.4 mm)', outsideBleed: '0.375" (9.6 mm)' };
  };

  // Graphics panel states
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState('');

  // KDP specs calculations
  const layout = calculateKdpLayout({
    trimWidth: trimSize.w,
    trimHeight: trimSize.h,
    pageCount: pageCount,
    paperType: paperType
  }, 800);

  // Resize observer to calculate dynamic scale factor relative to container space
  useEffect(() => {
    if (!containerRef.current) return;

    const updateScale = () => {
      if (!containerRef.current) return;
      const parentWidth = containerRef.current.clientWidth;
      const parentHeight = containerRef.current.clientHeight;
      if (parentWidth && parentHeight) {
        const ratioX = parentWidth / layout.canvasWidth;
        const ratioY = parentHeight / layout.canvasHeight;
        // Apply a padding margin of 0.95 so it fits with some breathing room
        const ratio = Math.min(ratioX, ratioY) * 0.95;
        setScaleRatio(ratio);
      }
    };

    const observer = new ResizeObserver(() => {
      updateScale();
    });

    observer.observe(containerRef.current);
    updateScale();

    return () => {
      observer.disconnect();
    };
  }, [layout.canvasWidth, layout.canvasHeight]);

  // Initialize Fabric Canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    // Create Fabric instance
    const fCanvas = new fabric.Canvas(canvasRef.current, {
      width: layout.canvasWidth,
      height: layout.canvasHeight,
      backgroundColor: 'transparent',
      preserveObjectStacking: true
    });

    // Override getPointer to account for CSS transform scaling of parent container
    fCanvas.getPointer = function (this: any, e: any, ignoreZoom?: boolean) {
      const rect = this.upperCanvasEl.getBoundingClientRect();
      const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
      const clientY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
      
      const scaleX = this.width ? rect.width / this.width : 1;
      const scaleY = this.height ? rect.height / this.height : 1;
      
      const x = (clientX - rect.left) / (scaleX || 1);
      const y = (clientY - rect.top) / (scaleY || 1);
      
      return { x, y };
    };

    setCanvas(fCanvas);

    // Initial history step
    const initialJson = JSON.stringify({
      canvasJson: fCanvas.toJSON(),
      background: coverBackgroundRef.current
    });
    historyRef.current = [initialJson];
    historyStepRef.current = 0;
    setHistory([initialJson]);
    setHistoryStep(0);

    // Sync layers list helper
    const updateLayers = () => {
      setLayers([...fCanvas.getObjects()].reverse());
    };

    // Selection events
    fCanvas.on("selection:created", (e) => {
      setActiveObject(e.selected ? e.selected[0] : null);
    });
    fCanvas.on("selection:updated", (e) => {
      setActiveObject(e.selected ? e.selected[0] : null);
    });
    fCanvas.on("selection:cleared", () => {
      setActiveObject(null);
    });

    // Save history on changes
    const saveState = () => {
      if (isUpdatingHistory.current) return;
      const stateObj = {
        canvasJson: fCanvas.toJSON(),
        background: coverBackgroundRef.current
      };
      const json = JSON.stringify(stateObj);
      
      const currentHistory = historyRef.current;
      const currentStep = historyStepRef.current;
      const sliced = currentHistory.slice(0, currentStep + 1);
      const nextHistory = [...sliced, json];
      const nextStep = nextHistory.length - 1;

      historyRef.current = nextHistory;
      historyStepRef.current = nextStep;
      setHistory(nextHistory);
      setHistoryStep(nextStep);
      
      const legacyElements = serializeToLegacyElements(fCanvas);
      onSaveWorkspace(legacyElements);
      updateLayers();
    };

    saveStateRef.current = saveState;

    fCanvas.on("object:added", saveState);
    fCanvas.on("object:modified", saveState);
    fCanvas.on("object:removed", saveState);

    // Initial elements import (translation from Konva element nodes to Fabric objects)
    importLegacyElements(fCanvas, initialElements, layout);

    // Initial layers load
    updateLayers();

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

  // Background painting and KDP Guides rendering in Fabric's before:render and after:render
  useEffect(() => {
    if (!canvas) return;

    // Remove legacy render listeners
    canvas.off("before:render");
    canvas.off("after:render");

    // Paint backgrounds BEFORE drawing objects (so they sit behind all elements)
    canvas.on("before:render", () => {
      const ctx = canvas.getContext();
      if (!ctx) return;

      ctx.save();
      
      const bg = coverBackgroundRef.current;
      
      // 1. Draw Back Cover background
      if (bg.backCoverType === 'gradient') {
        const grad = ctx.createLinearGradient(0, 0, layout.spineLeftPx, 0);
        grad.addColorStop(0, bg.backCoverGradientStart);
        grad.addColorStop(1, bg.backCoverGradientEnd);
        ctx.fillStyle = grad;
      } else {
        ctx.fillStyle = bg.backCoverColor;
      }
      ctx.fillRect(0, 0, layout.spineLeftPx, layout.canvasHeight);

      // 2. Draw Spine background (smooth connecting gradient or solid color)
      if (bg.backCoverType === 'gradient' && bg.frontCoverType === 'gradient') {
        const grad = ctx.createLinearGradient(layout.spineLeftPx, 0, layout.spineRightPx, 0);
        grad.addColorStop(0, bg.backCoverGradientEnd);
        grad.addColorStop(1, bg.frontCoverGradientStart);
        ctx.fillStyle = grad;
      } else {
        ctx.fillStyle = bg.backCoverColor;
      }
      ctx.fillRect(layout.spineLeftPx, 0, layout.spineWidthPx, layout.canvasHeight);

      // 3. Draw Front Cover background
      if (bg.frontCoverType === 'gradient') {
        const grad = ctx.createLinearGradient(layout.spineRightPx, 0, layout.canvasWidth, 0);
        grad.addColorStop(0, bg.frontCoverGradientStart);
        grad.addColorStop(1, bg.frontCoverGradientEnd);
        ctx.fillStyle = grad;
      } else {
        ctx.fillStyle = bg.frontCoverColor;
      }
      ctx.fillRect(layout.spineRightPx, 0, layout.canvasWidth - layout.spineRightPx, layout.canvasHeight);

      // 4. Overlay Background Images if loaded
      if (fullCoverImageEl.current) {
        ctx.drawImage(fullCoverImageEl.current, 0, 0, layout.canvasWidth, layout.canvasHeight);
      }
      if (backCoverImageEl.current) {
        ctx.drawImage(backCoverImageEl.current, 0, 0, layout.spineLeftPx, layout.canvasHeight);
      }
      if (frontCoverImageEl.current) {
        ctx.drawImage(frontCoverImageEl.current, layout.spineRightPx, 0, layout.canvasWidth - layout.spineRightPx, layout.canvasHeight);
      }

      ctx.restore();
    });

    // Draw Guidelines AFTER drawing objects (so they sit on top)
    canvas.on("after:render", () => {
      const ctx = canvas.getContext();
      if (!ctx) return;

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

        // 2b. Draw Spine Text Safety Boundaries (dashed amber lines, 0.0625" inside spine folds)
        if (layout.spineWidth > 0.125) {
          const spineSafeMarginPx = 0.0625 * layout.scale;
          ctx.strokeStyle = "#EAB308"; // amber-500
          ctx.lineWidth = 1;
          ctx.setLineDash([2, 4]);
          ctx.beginPath();
          ctx.moveTo(layout.spineLeftPx + spineSafeMarginPx, 0);
          ctx.lineTo(layout.spineLeftPx + spineSafeMarginPx, layout.canvasHeight);
          ctx.moveTo(layout.spineRightPx - spineSafeMarginPx, 0);
          ctx.lineTo(layout.spineRightPx - spineSafeMarginPx, layout.canvasHeight);
          ctx.stroke();
        }

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

    canvas.renderAll();
  }, [
    canvas,
    fullCoverImage, backCoverImage, frontCoverImage,
    showKdpGuides, isGenerating, layout
  ]);

  // Import Legacy Elements Translation helper
  const importLegacyElements = (fCanvas: fabric.Canvas, elements: any[], kdp: KdpLayoutResult) => {
    if (!elements || elements.length === 0) return;

    elements.forEach(el => {
      let obj: fabric.Object | null = null;

      if (el.type === 'text' || el.type === 'textbox') {
        const textOptions = {
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
        };

        if (el.isTextbox || el.type === 'textbox') {
          obj = new fabric.Textbox(el.text, {
            ...textOptions,
            width: el.width || 240
          } as any);
        } else {
          obj = new fabric.IText(el.text, textOptions as any);
        }
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
      } else if (el.type === 'triangle') {
        obj = new fabric.Triangle({
          id: el.id,
          left: el.x,
          top: el.y,
          width: el.width || 100,
          height: el.height || 100,
          fill: el.fill || '#10B981',
          stroke: el.stroke,
          strokeWidth: el.strokeWidth || 0,
          scaleX: el.scaleX || 1,
          scaleY: el.scaleY || 1,
          angle: el.rotation || 0,
          opacity: el.opacity ?? 1
        } as any);
      } else if (el.type === 'hexagon') {
        const points = [
          { x: 50, y: 0 },
          { x: 100, y: 25 },
          { x: 100, y: 75 },
          { x: 50, y: 100 },
          { x: 0, y: 75 },
          { x: 0, y: 25 }
        ];
        obj = new fabric.Polygon(points, {
          id: el.id,
          left: el.x,
          top: el.y,
          fill: el.fill || '#8B5CF6',
          stroke: el.stroke,
          strokeWidth: el.strokeWidth || 0,
          scaleX: (el.width || 100) / 100,
          scaleY: (el.height || 100) / 100,
          angle: el.rotation || 0,
          opacity: el.opacity ?? 1
        } as any);
        (obj as any).isHexagon = true;
      } else if (el.type === 'star') {
        obj = new fabric.Polygon(el.points || [], {
          id: el.id,
          left: el.x,
          top: el.y,
          fill: el.fill || '#10B981',
          stroke: el.stroke,
          strokeWidth: el.strokeWidth || 0,
          scaleX: (el.width || 238) / 238,
          scaleY: (el.height || 226) / 226,
          angle: el.rotation || 0,
          opacity: el.opacity ?? 1
        } as any);
      } else if (el.type === 'heart') {
        const heartPath = "M 10,30 A 20,20 0,0,1 50,30 A 20,20 0,0,1 90,30 Q 90,60 50,90 Q 10,60 10,30 z";
        obj = new fabric.Path(heartPath, {
          id: el.id,
          left: el.x,
          top: el.y,
          fill: el.fill || '#EF4444',
          stroke: el.stroke,
          strokeWidth: el.strokeWidth || 0,
          scaleX: (el.width || 80) / 80,
          scaleY: (el.height || 80) / 80,
          angle: el.rotation || 0,
          opacity: el.opacity ?? 1
        } as any);
        (obj as any).isHeart = true;
      } else if (el.type === 'pentagon') {
        const points = [
          { x: 50, y: 0 },
          { x: 100, y: 38 },
          { x: 81, y: 100 },
          { x: 19, y: 100 },
          { x: 0, y: 38 }
        ];
        obj = new fabric.Polygon(points, {
          id: el.id,
          left: el.x,
          top: el.y,
          fill: el.fill || 'transparent',
          stroke: el.stroke,
          strokeWidth: el.strokeWidth || 0,
          scaleX: (el.width || 100) / 100,
          scaleY: (el.height || 100) / 100,
          angle: el.rotation || 0,
          opacity: el.opacity ?? 1
        } as any);
        (obj as any).isPentagon = true;
      } else if (el.type === 'octagon') {
        const points = [
          { x: 29, y: 0 },
          { x: 71, y: 0 },
          { x: 100, y: 29 },
          { x: 100, y: 71 },
          { x: 71, y: 100 },
          { x: 29, y: 100 },
          { x: 0, y: 71 },
          { x: 0, y: 29 }
        ];
        obj = new fabric.Polygon(points, {
          id: el.id,
          left: el.x,
          top: el.y,
          fill: el.fill || 'transparent',
          stroke: el.stroke,
          strokeWidth: el.strokeWidth || 0,
          scaleX: (el.width || 100) / 100,
          scaleY: (el.height || 100) / 100,
          angle: el.rotation || 0,
          opacity: el.opacity ?? 1
        } as any);
        (obj as any).isOctagon = true;
      } else if (el.type === 'ellipse') {
        obj = new fabric.Ellipse({
          id: el.id,
          left: el.x,
          top: el.y,
          rx: (el.width || 100) / 2,
          ry: (el.height || 60) / 2,
          fill: el.fill || 'transparent',
          stroke: el.stroke,
          strokeWidth: el.strokeWidth || 0,
          scaleX: el.scaleX || 1,
          scaleY: el.scaleY || 1,
          angle: el.rotation || 0,
          opacity: el.opacity ?? 1
        } as any);
      } else if (el.type === 'diamond') {
        const points = [
          { x: 50, y: 0 },
          { x: 100, y: 50 },
          { x: 50, y: 100 },
          { x: 0, y: 50 }
        ];
        obj = new fabric.Polygon(points, {
          id: el.id,
          left: el.x,
          top: el.y,
          fill: el.fill || 'transparent',
          stroke: el.stroke,
          strokeWidth: el.strokeWidth || 0,
          scaleX: (el.width || 100) / 100,
          scaleY: (el.height || 100) / 100,
          angle: el.rotation || 0,
          opacity: el.opacity ?? 1
        } as any);
        (obj as any).isDiamond = true;
      } else if (el.type === 'trapezoid') {
        const points = [
          { x: 25, y: 0 },
          { x: 75, y: 0 },
          { x: 100, y: 100 },
          { x: 0, y: 100 }
        ];
        obj = new fabric.Polygon(points, {
          id: el.id,
          left: el.x,
          top: el.y,
          fill: el.fill || 'transparent',
          stroke: el.stroke,
          strokeWidth: el.strokeWidth || 0,
          scaleX: (el.width || 100) / 100,
          scaleY: (el.height || 100) / 100,
          angle: el.rotation || 0,
          opacity: el.opacity ?? 1
        } as any);
        (obj as any).isTrapezoid = true;
      } else if (el.type === 'clipart') {
        const secureSrc = el.src.includes('?') 
          ? `${el.src}&ts=${Date.now()}` 
          : `${el.src}?ts=${Date.now()}`;
          
        fabric.Image.fromURL(secureSrc, (img) => {
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
        if (el.isLocked) {
          obj.set({
            lockMovementX: true,
            lockMovementY: true,
            lockScalingX: true,
            lockScalingY: true,
            lockRotation: true,
            hasControls: false,
            isLocked: true
          } as any);
        }
        fCanvas.add(obj);
      }
    });

    fCanvas.requestRenderAll();
  };

  // Undo / Redo Actions
  const handleUndo = () => {
    if (historyStepRef.current > 0 && canvas) {
      isUpdatingHistory.current = true;
      const prevStep = historyStepRef.current - 1;
      const stateObj = JSON.parse(historyRef.current[prevStep]);
      
      const canvasData = stateObj.canvasJson || stateObj;
      const bgData = stateObj.background;
      
      if (bgData) {
        setCoverBackground(bgData);
      }

      canvas.loadFromJSON(canvasData, () => {
        canvas.requestRenderAll();
        historyStepRef.current = prevStep;
        setHistoryStep(prevStep);
        isUpdatingHistory.current = false;
      });
    }
  };

  const handleRedo = () => {
    if (historyStepRef.current < historyRef.current.length - 1 && canvas) {
      isUpdatingHistory.current = true;
      const nextStep = historyStepRef.current + 1;
      const stateObj = JSON.parse(historyRef.current[nextStep]);
      
      const canvasData = stateObj.canvasJson || stateObj;
      const bgData = stateObj.background;
      
      if (bgData) {
        setCoverBackground(bgData);
      }

      canvas.loadFromJSON(canvasData, () => {
        canvas.requestRenderAll();
        historyStepRef.current = nextStep;
        setHistoryStep(nextStep);
        isUpdatingHistory.current = false;
      });
    }
  };

  // Ref to store the previous cover background state to avoid duplicate saves
  const prevBgRef = useRef(coverBackground);

  // Effect to watch changes in coverBackground and push to undo/redo history (debounced)
  useEffect(() => {
    if (!canvas) return;
    if (isUpdatingHistory.current) {
      prevBgRef.current = coverBackground;
      return;
    }

    // Check if the background state actually changed
    if (JSON.stringify(prevBgRef.current) !== JSON.stringify(coverBackground)) {
      const handler = setTimeout(() => {
        if (saveStateRef.current) {
          saveStateRef.current();
        }
        prevBgRef.current = coverBackground;
      }, 300); // 300ms debounce

      return () => {
        clearTimeout(handler);
      };
    }
  }, [coverBackground, canvas]);

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

  const addHeading = () => {
    if (!canvas) return;
    const heading = new fabric.IText("Add Heading", {
      left: layout.frontCoverCenterPx - 120,
      top: layout.canvasHeight / 2 - 30,
      fontFamily: "Arial",
      fontSize: 48,
      fontWeight: "bold",
      fill: "#FFFFFF",
      textAlign: "center"
    });
    canvas.add(heading);
    canvas.setActiveObject(heading);
    canvas.requestRenderAll();
  };

  const addMultilineText = () => {
    if (!canvas) return;
    const textbox = new fabric.Textbox("Add paragraph text here. Resize the box to wrap text automatically, and format it.", {
      left: layout.frontCoverCenterPx - 150,
      top: layout.canvasHeight / 2 - 40,
      width: 300,
      fontFamily: "Arial",
      fontSize: 20,
      fill: "#E2E8F0",
      textAlign: "left"
    });
    canvas.add(textbox);
    canvas.setActiveObject(textbox);
    canvas.requestRenderAll();
  };

  const addRectangle = () => {
    if (!canvas) return;
    const rect = new fabric.Rect({
      left: layout.frontCoverCenterPx - 50,
      top: layout.canvasHeight / 2 - 50,
      width: 100,
      height: 100,
      fill: "transparent",
      stroke: "#4F46E5",
      strokeWidth: 3
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
      fill: "transparent",
      stroke: "#4F46E5",
      strokeWidth: 3
    });
    canvas.add(circle);
    canvas.setActiveObject(circle);
    canvas.requestRenderAll();
  };

  const addTriangle = () => {
    if (!canvas) return;
    const triangle = new fabric.Triangle({
      left: layout.frontCoverCenterPx - 50,
      top: layout.canvasHeight / 2 - 50,
      width: 100,
      height: 100,
      fill: "transparent",
      stroke: "#4F46E5",
      strokeWidth: 3
    });
    canvas.add(triangle);
    canvas.setActiveObject(triangle);
    canvas.requestRenderAll();
  };

  const addHexagon = () => {
    if (!canvas) return;
    const points = [
      { x: 50, y: 0 },
      { x: 100, y: 25 },
      { x: 100, y: 75 },
      { x: 50, y: 100 },
      { x: 0, y: 75 },
      { x: 0, y: 25 }
    ];
    const hexagon = new fabric.Polygon(points, {
      left: layout.frontCoverCenterPx - 50,
      top: layout.canvasHeight / 2 - 50,
      fill: "transparent",
      stroke: "#4F46E5",
      strokeWidth: 3
    });
    (hexagon as any).isHexagon = true;
    hexagon.scaleToWidth(100);
    canvas.add(hexagon);
    canvas.setActiveObject(hexagon);
    canvas.requestRenderAll();
  };

  const addHeart = () => {
    if (!canvas) return;
    const heartPath = "M 10,30 A 20,20 0,0,1 50,30 A 20,20 0,0,1 90,30 Q 90,60 50,90 Q 10,60 10,30 z";
    const heart = new fabric.Path(heartPath, {
      left: layout.frontCoverCenterPx - 50,
      top: layout.canvasHeight / 2 - 50,
      fill: "transparent",
      stroke: "#4F46E5",
      strokeWidth: 3
    });
    (heart as any).isHeart = true;
    heart.scaleToWidth(100);
    canvas.add(heart);
    canvas.setActiveObject(heart);
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
      fill: "transparent",
      stroke: "#4F46E5",
      strokeWidth: 3
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
      stroke: "#4F46E5",
      strokeWidth: 4
    });
    canvas.add(line);
    canvas.setActiveObject(line);
    canvas.requestRenderAll();
  };

  const addPentagon = () => {
    if (!canvas) return;
    const points = [
      { x: 50, y: 0 },
      { x: 100, y: 38 },
      { x: 81, y: 100 },
      { x: 19, y: 100 },
      { x: 0, y: 38 }
    ];
    const pentagon = new fabric.Polygon(points, {
      left: layout.frontCoverCenterPx - 50,
      top: layout.canvasHeight / 2 - 50,
      fill: "transparent",
      stroke: "#4F46E5",
      strokeWidth: 3
    });
    (pentagon as any).isPentagon = true;
    pentagon.scaleToWidth(100);
    canvas.add(pentagon);
    canvas.setActiveObject(pentagon);
    canvas.requestRenderAll();
  };

  const addOctagon = () => {
    if (!canvas) return;
    const points = [
      { x: 29, y: 0 },
      { x: 71, y: 0 },
      { x: 100, y: 29 },
      { x: 100, y: 71 },
      { x: 71, y: 100 },
      { x: 29, y: 100 },
      { x: 0, y: 71 },
      { x: 0, y: 29 }
    ];
    const octagon = new fabric.Polygon(points, {
      left: layout.frontCoverCenterPx - 50,
      top: layout.canvasHeight / 2 - 50,
      fill: "transparent",
      stroke: "#4F46E5",
      strokeWidth: 3
    });
    (octagon as any).isOctagon = true;
    octagon.scaleToWidth(100);
    canvas.add(octagon);
    canvas.setActiveObject(octagon);
    canvas.requestRenderAll();
  };

  const addEllipse = () => {
    if (!canvas) return;
    const ellipse = new fabric.Ellipse({
      left: layout.frontCoverCenterPx - 50,
      top: layout.canvasHeight / 2 - 30,
      rx: 50,
      ry: 30,
      fill: "transparent",
      stroke: "#4F46E5",
      strokeWidth: 3
    });
    canvas.add(ellipse);
    canvas.setActiveObject(ellipse);
    canvas.requestRenderAll();
  };

  const addDiamond = () => {
    if (!canvas) return;
    const points = [
      { x: 50, y: 0 },
      { x: 100, y: 50 },
      { x: 50, y: 100 },
      { x: 0, y: 50 }
    ];
    const diamond = new fabric.Polygon(points, {
      left: layout.frontCoverCenterPx - 50,
      top: layout.canvasHeight / 2 - 50,
      fill: "transparent",
      stroke: "#4F46E5",
      strokeWidth: 3
    });
    (diamond as any).isDiamond = true;
    diamond.scaleToWidth(100);
    canvas.add(diamond);
    canvas.setActiveObject(diamond);
    canvas.requestRenderAll();
  };

  const addTrapezoid = () => {
    if (!canvas) return;
    const points = [
      { x: 25, y: 0 },
      { x: 75, y: 0 },
      { x: 100, y: 100 },
      { x: 0, y: 100 }
    ];
    const trapezoid = new fabric.Polygon(points, {
      left: layout.frontCoverCenterPx - 50,
      top: layout.canvasHeight / 2 - 50,
      fill: "transparent",
      stroke: "#4F46E5",
      strokeWidth: 3
    });
    (trapezoid as any).isTrapezoid = true;
    trapezoid.scaleToWidth(100);
    canvas.add(trapezoid);
    canvas.setActiveObject(trapezoid);
    canvas.requestRenderAll();
  };

  const addClipart = (src: string) => {
    if (!canvas) return;
    // Add unique cache buster query parameter to bypass browser CORS cache issue
    const secureSrc = src.includes('?') 
      ? `${src}&ts=${Date.now()}` 
      : `${src}?ts=${Date.now()}`;
      
    fabric.Image.fromURL(secureSrc, (img) => {
      const imgW = img.width || 150;
      const imgH = img.height || 150;
      
      // Scale image to fit within a 200x200 bounding box proportionally
      const maxW = 200;
      const maxH = 200;
      const scale = Math.min(maxW / imgW, maxH / imgH);
      
      img.set({
        left: layout.frontCoverCenterPx - (imgW * scale) / 2,
        top: layout.canvasHeight / 2 - (imgH * scale) / 2,
        scaleX: scale,
        scaleY: scale
      });
      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.requestRenderAll();
    }, { crossOrigin: 'anonymous' });
  };

  const bringToFront = () => {
    if (!canvas || !activeObject) return;
    activeObject.bringToFront();
    canvas.requestRenderAll();
    canvas.fire("object:modified", { target: activeObject });
  };

  const sendToBack = () => {
    if (!canvas || !activeObject) return;
    activeObject.sendToBack();
    canvas.requestRenderAll();
    canvas.fire("object:modified", { target: activeObject });
  };

  const bringForward = () => {
    if (!canvas || !activeObject) return;
    activeObject.bringForward();
    canvas.requestRenderAll();
    canvas.fire("object:modified", { target: activeObject });
  };

  const sendBackward = () => {
    if (!canvas || !activeObject) return;
    (activeObject as any).sendBackwards();
    canvas.requestRenderAll();
    canvas.fire("object:modified", { target: activeObject });
  };

  const toggleLockSelected = () => {
    if (!canvas || !activeObject) return;
    const lock = !(activeObject as any).isLocked;
    activeObject.set({
      lockMovementX: lock,
      lockMovementY: lock,
      lockScalingX: lock,
      lockScalingY: lock,
      lockRotation: lock,
      hasControls: !lock,
      isLocked: lock
    } as any);
    setIsObjectLocked(lock);
    canvas.discardActiveObject();
    canvas.setActiveObject(activeObject);
    canvas.requestRenderAll();
    canvas.fire("object:modified", { target: activeObject });
  };

  const copySelected = () => {
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (!active) return;
    active.clone((cloned: any) => {
      setClipboard(cloned);
    });
  };

  const cutSelected = () => {
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (!active) return;
    active.clone((cloned: any) => {
      setClipboard(cloned);
      canvas.remove(active);
      canvas.discardActiveObject();
      canvas.requestRenderAll();
    });
  };

  const pasteSelected = () => {
    if (!canvas || !clipboard) return;
    clipboard.clone((cloned: any) => {
      canvas.discardActiveObject();
      cloned.set({
        left: (cloned.left || 0) + 15,
        top: (cloned.top || 0) + 15,
        id: `${cloned.type}-${Date.now()}`,
        evented: true,
      });
      if (cloned.type === 'activeSelection') {
        cloned.canvas = canvas;
        cloned.forEachObject((obj: any) => {
          canvas.add(obj);
        });
        cloned.setCoords();
      } else {
        canvas.add(cloned);
      }
      clipboard.top += 15;
      clipboard.left += 15;
      canvas.setActiveObject(cloned);
      canvas.requestRenderAll();
    });
  };

  const duplicateSelected = () => {
    if (!canvas || !activeObject) return;
    activeObject.clone((cloned: any) => {
      cloned.set({
        left: (activeObject.left || 0) + 25,
        top: (activeObject.top || 0) + 25,
        id: `${activeObject.type}-${Date.now()}`
      });
      canvas.add(cloned);
      canvas.setActiveObject(cloned);
      canvas.requestRenderAll();
    });
  };

  const handleSearchUnsplash = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSearchError("");
    try {
      const res = await fetch(`/api/generate/unsplash?query=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (res.ok) {
        if (data.results) {
          setSearchResults(data.results.map((item: any) => ({
            name: item.description || item.alt_description || "Photo",
            thumb: item.urls.small,
            full: item.urls.regular
          })));
        } else {
          setSearchResults([]);
        }
      } else {
        setSearchError(data.error || "Failed to search images");
      }
    } catch (err) {
      setSearchError("Failed to connect to search API");
    } finally {
      setIsSearching(false);
    }
  };

  const alignTextToSpine = (vAlignOverride?: 'top' | 'center' | 'bottom', rotOverride?: 90 | 270) => {
    if (!canvas || !activeObject) return;

    const vAlign = vAlignOverride || spineTextVAlign;
    const rot = rotOverride || spineTextRotation;
    
    // Safety margin of 0.0625" (1/16") inside spine fold on each side
    // Total reduction = 0.125" (1/8")
    const maxAllowedWidthPx = (layout.spineWidth - 0.125) * layout.scale; 

    // Set origin to center for exact centering on spine
    activeObject.set({
      originX: 'center',
      originY: 'center',
      angle: rot
    });
    
    // Scale down if thickness exceeds safety boundaries
    let boundingBox = activeObject.getBoundingRect();
    if (boundingBox.width > maxAllowedWidthPx) {
      const scaleFactor = maxAllowedWidthPx / boundingBox.width;
      activeObject.set({
        scaleX: (activeObject.scaleX || 1) * scaleFactor,
        scaleY: (activeObject.scaleY || 1) * scaleFactor
      });
      // Re-calculate bounding box after scaling
      boundingBox = activeObject.getBoundingRect();
    }

    // Calculate vertical position (top, center, bottom)
    // Keep 0.75" safe margin from top/bottom trim borders
    const vMarginPx = 0.75 * layout.scale;
    const textHeightPx = boundingBox.height; // rotated height (the length of the text)
    
    let topPos = layout.canvasHeight / 2;
    if (vAlign === 'top') {
      topPos = layout.trimTopPx + vMarginPx + (textHeightPx / 2);
    } else if (vAlign === 'bottom') {
      topPos = layout.trimBottomPx - vMarginPx - (textHeightPx / 2);
    }

    activeObject.set({
      left: layout.spineCenterPx,
      top: topPos
    });

    canvas.requestRenderAll();
    canvas.fire("object:modified", { target: activeObject });
  };

  const addBarcodePlaceholder = () => {
    if (!canvas) return;
    
    // Barcode dimensions: 2.0" wide by 1.2" high
    const bcW = 2.0 * layout.scale;
    const bcH = 1.2 * layout.scale;
    
    // Bottom-left corner of the back cover, keeping 0.375" margin from trim borders
    const margin = 0.375 * layout.scale;
    const left = layout.trimLeftPx + margin;
    const top = layout.trimBottomPx - margin - bcH;
    
    // Clean, solid white rectangle of size 2" x 1.2" with sharp corners and a light dashed reference border.
    // It contains absolutely no text, no numbers, and no dummy lines so that Amazon KDP can print the barcode on it.
    const barcodeRect = new fabric.Rect({
      left,
      top,
      width: bcW,
      height: bcH,
      fill: '#FFFFFF',
      stroke: '#CBD5E1',
      strokeWidth: 1,
      strokeDashArray: [4, 4],
      rx: 0,
      ry: 0,
      id: `barcode-${Date.now()}`,
      lockScalingX: true,
      lockScalingY: true,
      lockRotation: true,
      hasControls: false // Lock controls to keep the KDP-standard size perfect
    } as any);
    
    canvas.add(barcodeRect);
    canvas.setActiveObject(barcodeRect);
    canvas.requestRenderAll();
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
    let newBg;
    if (type === 'gradient' && backStart && backEnd && frontStart && frontEnd) {
      newBg = {
        backCoverType: 'gradient' as const,
        backCoverGradientStart: backStart,
        backCoverGradientEnd: backEnd,
        frontCoverType: 'gradient' as const,
        frontCoverGradientStart: frontStart,
        frontCoverGradientEnd: frontEnd,
        backCoverColor: back,
        frontCoverColor: front,
        backCoverImage: '',
        frontCoverImage: '',
        fullCoverImage: ''
      };
    } else {
      newBg = {
        backCoverType: 'solid' as const,
        backCoverColor: back,
        backCoverGradientStart: back,
        backCoverGradientEnd: back,
        frontCoverType: 'solid' as const,
        frontCoverColor: front,
        frontCoverGradientStart: front,
        frontCoverGradientEnd: front,
        backCoverImage: '',
        frontCoverImage: '',
        fullCoverImage: ''
      };
    }
    coverBackgroundRef.current = newBg;
    setCoverBackground(newBg);
    if (canvas) canvas.renderAll();
  };

  const applyBackgroundImage = (url: string, target: 'full' | 'front' | 'back') => {
    if (!canvas) return;
    
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = url;
    img.onload = () => {
      if (target === 'full') {
        fullCoverImageEl.current = img;
        setFullCoverImage(url);
        setBackCoverImage('');
        setFrontCoverImage('');
        backCoverImageEl.current = null;
        frontCoverImageEl.current = null;
      } else if (target === 'front') {
        frontCoverImageEl.current = img;
        setFrontCoverImage(url);
        setFullCoverImage('');
        fullCoverImageEl.current = null;
      } else if (target === 'back') {
        backCoverImageEl.current = img;
        setBackCoverImage(url);
        setFullCoverImage('');
        fullCoverImageEl.current = null;
      }
      canvas.renderAll();
      canvas.fire("object:modified");
    };
  };

  const handleClearCanvas = () => {
    if (!canvas) return;
    if (confirm("Are you sure you want to clear all layers from the cover?")) {
      const objects = canvas.getObjects();
      while (objects.length > 0) {
        canvas.remove(objects[0]);
      }
      canvas.discardActiveObject();
      canvas.requestRenderAll();
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

  // Bind keyboard shortcut handler references
  handlersRef.current = { 
    handleUndo, 
    handleRedo, 
    deleteSelected,
    copySelected,
    cutSelected,
    pasteSelected,
    duplicateSelected,
    toggleLockSelected,
    handleNudge: (key: string, shiftKey: boolean) => {
      if (!canvas) return;
      const active = canvas.getActiveObject();
      if (!active) return;

      const nudgeAmount = shiftKey ? 10 : 1;
      const left = active.left || 0;
      const top = active.top || 0;

      const lowerKey = key.toLowerCase();
      if (lowerKey === 'arrowup') active.set({ top: top - nudgeAmount });
      if (lowerKey === 'arrowdown') active.set({ top: top + nudgeAmount });
      if (lowerKey === 'arrowleft') active.set({ left: left - nudgeAmount });
      if (lowerKey === 'arrowright') active.set({ left: left + nudgeAmount });

      canvas.requestRenderAll();
      canvas.fire("object:modified", { target: active });
    }
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
              <div className="flex items-center gap-1 text-[9px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                <svg className="w-2.5 h-2.5 animate-pulse" fill="currentColor" viewBox="0 0 8 8"><circle cx="4" cy="4" r="3"></circle></svg>
                <span>Autosave</span>
              </div>
            </div>

            <div className="space-y-4">
              {/* Text Layer */}
              <div>
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1.5">Text Styles</span>
                <div className="grid grid-cols-1 gap-2">
                  <button onClick={addHeading} className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-black flex items-center gap-2.5 hover:border-indigo-400 hover:shadow-sm transition-all text-slate-700 cursor-pointer">
                    <span className="text-sm font-black text-indigo-500 w-4 text-center">H</span>
                    <span>Add Heading (Large)</span>
                  </button>
                  <button onClick={addText} className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-black flex items-center gap-2.5 hover:border-indigo-400 hover:shadow-sm transition-all text-slate-700 cursor-pointer">
                    <Type className="w-4 h-4 text-indigo-500"/>
                    <span>Add Simple Text (Single Line)</span>
                  </button>
                  <button onClick={addMultilineText} className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-black flex items-center gap-2.5 hover:border-indigo-400 hover:shadow-sm transition-all text-slate-700 cursor-pointer">
                    <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h7" />
                    </svg>
                    <span>Add Paragraph (Multiline)</span>
                  </button>
                </div>
              </div>

              {/* Shapes Grid */}
              <div>
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1.5">Shapes</span>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={addRectangle} className="p-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-bold flex flex-col items-center gap-1.5 hover:border-amber-400 hover:shadow-sm transition-all text-slate-700">
                    <Square className="w-4 h-4 text-amber-500"/> Rect
                  </button>
                  <button onClick={addCircle} className="p-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-bold flex flex-col items-center gap-1.5 hover:border-amber-400 hover:shadow-sm transition-all text-slate-700">
                    <CircleIcon className="w-4 h-4 text-sky-500"/> Circle
                  </button>
                  <button onClick={addTriangle} className="p-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-bold flex flex-col items-center gap-1.5 hover:border-amber-400 hover:shadow-sm transition-all text-slate-700">
                    <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 2L2 22h20L12 2z" />
                    </svg>
                    Triangle
                  </button>
                  <button onClick={addHexagon} className="p-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-bold flex flex-col items-center gap-1.5 hover:border-amber-400 hover:shadow-sm transition-all text-slate-700">
                    <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 2l9 5.196v10.392l-9 5.196-9-5.196V7.196L12 2z" />
                    </svg>
                    Hexagon
                  </button>
                  <button onClick={addPentagon} className="p-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-bold flex flex-col items-center gap-1.5 hover:border-amber-400 hover:shadow-sm transition-all text-slate-700">
                    <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 2l9.5 6.9-3.6 11.1H6.1L2.5 8.9 12 2z" />
                    </svg>
                    Pentagon
                  </button>
                  <button onClick={addOctagon} className="p-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-bold flex flex-col items-center gap-1.5 hover:border-amber-400 hover:shadow-sm transition-all text-slate-700">
                    <svg className="w-4 h-4 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 2h8l6 6v8l-6 6H8l-6-6V8l6-6z" />
                    </svg>
                    Octagon
                  </button>
                  <button onClick={addEllipse} className="p-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-bold flex flex-col items-center gap-1.5 hover:border-amber-400 hover:shadow-sm transition-all text-slate-700">
                    <svg className="w-4 h-4 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <ellipse cx="12" cy="12" rx="10" ry="6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
                    </svg>
                    Ellipse
                  </button>
                  <button onClick={addDiamond} className="p-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-bold flex flex-col items-center gap-1.5 hover:border-amber-400 hover:shadow-sm transition-all text-slate-700">
                    <svg className="w-4 h-4 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 2L2 12l10 10 10-10L12 2z" />
                    </svg>
                    Diamond
                  </button>
                  <button onClick={addTrapezoid} className="p-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-bold flex flex-col items-center gap-1.5 hover:border-amber-400 hover:shadow-sm transition-all text-slate-700">
                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 4h12l4 16H2L6 4z" />
                    </svg>
                    Trapezoid
                  </button>
                  <button onClick={addStar} className="p-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-bold flex flex-col items-center gap-1.5 hover:border-amber-400 hover:shadow-sm transition-all text-slate-700">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500/20"/> Star
                  </button>
                  <button onClick={addHeart} className="p-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-bold flex flex-col items-center gap-1.5 hover:border-amber-400 hover:shadow-sm transition-all text-slate-700">
                    <svg className="w-4 h-4 text-red-500 fill-red-500/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    Heart
                  </button>
                </div>
              </div>

              {/* Utility / Barcode */}
              <div>
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1.5">Utilities</span>
                <div className="space-y-2">
                  <button onClick={addLine} className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-black flex items-center gap-2.5 hover:border-amber-400 hover:shadow-sm transition-all text-slate-700">
                    <Ruler className="w-4 h-4 text-rose-500"/> Add Line Divider
                  </button>
                  <button onClick={addBarcodePlaceholder} className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-black flex items-center gap-2.5 hover:border-amber-400 hover:shadow-sm transition-all text-slate-700">
                    <Grid className="w-4 h-4 text-slate-500"/> Add Barcode Placeholder
                  </button>

                  {/* KDP Barcode Guidelines Help Card */}
                  <div className="p-3 bg-amber-50/60 border border-amber-200/50 rounded-xl space-y-2 mt-2">
                    <span className="text-[9px] font-black text-amber-800 uppercase tracking-wider block">KDP Barcode Guidelines:</span>
                    <ul className="list-disc pl-3.5 text-[9px] font-semibold text-slate-600 space-y-1 leading-normal">
                      <li>
                        <strong>Clear Barcode Space:</strong> Keep the lower-right corner of the back cover completely clear (blank 2.0″ wide by 1.2″ high).
                      </li>
                      <li>
                        <strong>No-Design Zone:</strong> Avoid placing logos, text, or shapes in this zone. You can use the barcode placeholder to align your design.
                      </li>
                      <li>
                        <strong>Single Cover PDF:</strong> Export your final cover as a single combined PDF (back, spine, and front).
                      </li>
                      <li>
                        <strong>KDP Settings:</strong> When uploading to KDP, select <strong>"No, my cover file does not include a barcode"</strong> so KDP prints it automatically.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>


            {activeObject && (
              <div className="pt-4 border-t border-slate-200 space-y-4">
                <h4 className="font-black text-[10px] uppercase tracking-widest text-slate-400">Object Settings</h4>
                
                {/* Text Specific Editing */}
                {(activeObject.type === 'i-text' || activeObject.type === 'text') && (
                  <div className="space-y-3 bg-white p-3 rounded-xl border border-slate-200">
                    <div>
                      <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Text Content</label>
                      <textarea
                        value={objectText}
                        onChange={(e) => {
                          setObjectText(e.target.value);
                          updateActiveObjectProperty("text", e.target.value);
                        }}
                        className="w-full text-xs font-semibold p-2 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 font-sans"
                        rows={2}
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Font Family</label>
                      <select
                        value={objectFontFamily}
                        onChange={(e) => {
                          setObjectFontFamily(e.target.value);
                          updateActiveObjectProperty("fontFamily", e.target.value);
                        }}
                        className="w-full text-xs font-bold p-2 bg-white border border-slate-200 rounded-lg"
                      >
                        {FONT_FAMILIES.map((font, idx) => (
                          <option key={idx} value={font}>{font}</option>
                        ))}
                      </select>
                    </div>
                     <div>
                      <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Font Size ({objectFontSize}px)</label>
                      <input
                        type="range"
                        min="10"
                        max="120"
                        value={objectFontSize}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          setObjectFontSize(val);
                          updateActiveObjectProperty("fontSize", val, false);
                        }}
                        onMouseUp={() => {
                          if (canvas && activeObject) canvas.fire("object:modified", { target: activeObject });
                        }}
                        onTouchEnd={() => {
                          if (canvas && activeObject) canvas.fire("object:modified", { target: activeObject });
                        }}
                        onBlur={() => {
                          if (canvas && activeObject) canvas.fire("object:modified", { target: activeObject });
                        }}
                        className="w-full accent-indigo-650 cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Letter Spacing ({objectCharSpacing})</label>
                      <input
                        type="range"
                        min="-50"
                        max="300"
                        step="5"
                        value={objectCharSpacing}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          setObjectCharSpacing(val);
                          updateActiveObjectProperty("charSpacing", val, false);
                        }}
                        onMouseUp={() => {
                          if (canvas && activeObject) canvas.fire("object:modified", { target: activeObject });
                        }}
                        onTouchEnd={() => {
                          if (canvas && activeObject) canvas.fire("object:modified", { target: activeObject });
                        }}
                        onBlur={() => {
                          if (canvas && activeObject) canvas.fire("object:modified", { target: activeObject });
                        }}
                        className="w-full accent-indigo-650 cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Line Height ({objectLineHeight.toFixed(2)})</label>
                      <input
                        type="range"
                        min="0.5"
                        max="2.5"
                        step="0.05"
                        value={objectLineHeight}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          setObjectLineHeight(val);
                          updateActiveObjectProperty("lineHeight", val, false);
                        }}
                        onMouseUp={() => {
                          if (canvas && activeObject) canvas.fire("object:modified", { target: activeObject });
                        }}
                        onTouchEnd={() => {
                          if (canvas && activeObject) canvas.fire("object:modified", { target: activeObject });
                        }}
                        onBlur={() => {
                          if (canvas && activeObject) canvas.fire("object:modified", { target: activeObject });
                        }}
                        className="w-full accent-indigo-650 cursor-pointer"
                      />
                    </div>
                    
                    <div className="pt-2 border-t border-slate-100 space-y-2">
                      <span className="text-[9px] font-black text-slate-400 uppercase block">Spine Text Alignment</span>
                      {pageCount < 80 ? (
                        <p className="text-[8px] font-black text-amber-600 bg-amber-50/50 p-2 rounded-lg border border-amber-200/50 leading-normal">
                          ⚠️ KDP Alert: Spine text is only allowed for books with 80+ pages. (Current page count: {pageCount})
                        </p>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex gap-1">
                            {(['top', 'center', 'bottom'] as const).map((align) => (
                              <button
                                key={align}
                                onClick={() => {
                                  setSpineTextVAlign(align);
                                  alignTextToSpine(align, spineTextRotation);
                                }}
                                className={`flex-1 py-1 text-[9px] font-black rounded capitalize border transition-all ${
                                  spineTextVAlign === align 
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' 
                                    : 'bg-white border-slate-200 text-slate-655 hover:bg-slate-50'
                                }`}
                              >
                                {align}
                              </button>
                            ))}
                          </div>
                          <div className="flex gap-1 items-center">
                            <span className="text-[9px] font-black text-slate-400 uppercase flex-1">Rotation:</span>
                            <button
                              onClick={() => {
                                setSpineTextRotation(90);
                                alignTextToSpine(spineTextVAlign, 90);
                              }}
                              className={`px-2 py-0.5 text-[9px] font-black rounded border transition-all ${
                                spineTextRotation === 90
                                  ? 'bg-indigo-600 text-white border-indigo-600'
                                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              90°
                            </button>
                            <button
                              onClick={() => {
                                setSpineTextRotation(270);
                                alignTextToSpine(spineTextVAlign, 270);
                              }}
                              className={`px-2 py-0.5 text-[9px] font-black rounded border transition-all ${
                                spineTextRotation === 270
                                  ? 'bg-indigo-600 text-white border-indigo-600'
                                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              270°
                            </button>
                            <button
                              onClick={() => alignTextToSpine()}
                              className="ml-auto py-0.5 px-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[9px] rounded uppercase tracking-wider transition-colors shadow-sm"
                            >
                              Align
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Color & Border Settings (Applicable to shapes and text) */}
                <div className="space-y-3 bg-white p-3 rounded-xl border border-slate-200">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase">Fill Color</label>
                      <button
                        onClick={() => {
                          const isTrans = objectColor === "transparent";
                          const newVal = isTrans ? "#FFFFFF" : "transparent";
                          setObjectColor(newVal);
                          updateActiveObjectProperty("fill", newVal, true);
                        }}
                        className={`text-[9px] font-black uppercase px-2 py-0.5 rounded transition cursor-pointer ${
                          objectColor === "transparent" 
                            ? "bg-indigo-600 text-white" 
                            : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                        }`}
                      >
                        No Fill
                      </button>
                    </div>
                    {objectColor !== "transparent" && (
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={objectColor.startsWith("#") ? objectColor : "#FFFFFF"}
                          onChange={(e) => {
                            setObjectColor(e.target.value);
                            updateActiveObjectProperty("fill", e.target.value, false);
                          }}
                          onBlur={() => {
                            if (canvas && activeObject) canvas.fire("object:modified", { target: activeObject });
                          }}
                          className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200 p-0.5 bg-white"
                        />
                        <input
                          type="text"
                          value={objectColor}
                          onChange={(e) => {
                            setObjectColor(e.target.value);
                            updateActiveObjectProperty("fill", e.target.value, false);
                          }}
                          onBlur={() => {
                            if (canvas && activeObject) canvas.fire("object:modified", { target: activeObject });
                          }}
                          className="flex-1 text-xs font-bold uppercase p-1.5 border border-slate-200 rounded-lg text-center font-mono"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Stroke Color</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={objectStrokeColor}
                        onChange={(e) => {
                          setObjectStrokeColor(e.target.value);
                          updateActiveObjectProperty("stroke", e.target.value, false);
                        }}
                        onBlur={() => {
                          if (canvas && activeObject) canvas.fire("object:modified", { target: activeObject });
                        }}
                        className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200 p-0.5 bg-white"
                      />
                      <input
                        type="text"
                        value={objectStrokeColor}
                        onChange={(e) => {
                          setObjectStrokeColor(e.target.value);
                          updateActiveObjectProperty("stroke", e.target.value, false);
                        }}
                        onBlur={() => {
                          if (canvas && activeObject) canvas.fire("object:modified", { target: activeObject });
                        }}
                        className="flex-1 text-xs font-bold uppercase p-1.5 border border-slate-200 rounded-lg text-center font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Stroke Width ({objectStrokeWidth}px)</label>
                    <input
                      type="range"
                      min="0"
                      max="15"
                      value={objectStrokeWidth}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setObjectStrokeWidth(val);
                        updateActiveObjectProperty("strokeWidth", val, false);
                      }}
                      onMouseUp={() => {
                        if (canvas && activeObject) canvas.fire("object:modified", { target: activeObject });
                      }}
                      onTouchEnd={() => {
                        if (canvas && activeObject) canvas.fire("object:modified", { target: activeObject });
                      }}
                      onBlur={() => {
                        if (canvas && activeObject) canvas.fire("object:modified", { target: activeObject });
                      }}
                      className="w-full accent-indigo-650 cursor-pointer"
                    />
                  </div>

                  {/* Opacity slider */}
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Layer Opacity ({Math.round(objectOpacity * 100)}%)</label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={objectOpacity}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setObjectOpacity(val);
                        updateActiveObjectProperty("opacity", val, false);
                      }}
                      onMouseUp={() => {
                        if (canvas && activeObject) canvas.fire("object:modified", { target: activeObject });
                      }}
                      onTouchEnd={() => {
                        if (canvas && activeObject) canvas.fire("object:modified", { target: activeObject });
                      }}
                      onBlur={() => {
                        if (canvas && activeObject) canvas.fire("object:modified", { target: activeObject });
                      }}
                      className="w-full accent-indigo-650 cursor-pointer"
                    />
                  </div>

                  {/* Shadow settings */}
                  <div className="space-y-2 pt-2 border-t border-slate-150">
                    <label className="flex items-center gap-1.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={objectHasShadow}
                        onChange={(e) => {
                          setObjectHasShadow(e.target.checked);
                          updateActiveObjectShadow(e.target.checked, objectShadowColor, objectShadowBlur, objectShadowOffsetX, objectShadowOffsetY);
                        }}
                        className="rounded text-indigo-500 accent-indigo-500 cursor-pointer"
                      />
                      <span className="text-[9px] font-black text-slate-400 uppercase">Enable Layer Shadow</span>
                    </label>
                    
                    {objectHasShadow && (
                      <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <div className="col-span-2">
                          <label className="text-[8px] font-black text-slate-400 block mb-0.5 uppercase">Shadow Color</label>
                          <div className="flex gap-1.5">
                            <input
                              type="color"
                              value={objectShadowColor.startsWith('rgba') ? '#000000' : objectShadowColor}
                              onChange={(e) => {
                                setObjectShadowColor(e.target.value);
                                updateActiveObjectShadow(true, e.target.value, objectShadowBlur, objectShadowOffsetX, objectShadowOffsetY, false);
                              }}
                              onBlur={() => {
                                if (canvas && activeObject) canvas.fire("object:modified", { target: activeObject });
                              }}
                              className="w-5 h-5 rounded cursor-pointer border border-slate-200"
                            />
                            <input
                              type="text"
                              value={objectShadowColor}
                              onChange={(e) => {
                                setObjectShadowColor(e.target.value);
                                updateActiveObjectShadow(true, e.target.value, objectShadowBlur, objectShadowOffsetX, objectShadowOffsetY, false);
                              }}
                              onBlur={() => {
                                if (canvas && activeObject) canvas.fire("object:modified", { target: activeObject });
                              }}
                              className="flex-1 text-[8px] font-bold p-0.5 border border-slate-250 rounded font-mono text-center"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-[8px] font-black text-slate-400 block mb-0.5 uppercase">Blur ({objectShadowBlur}px)</label>
                          <input
                            type="range"
                            min="0"
                            max="30"
                            value={objectShadowBlur}
                            onChange={(e) => {
                              const val = parseInt(e.target.value);
                              setObjectShadowBlur(val);
                              updateActiveObjectShadow(true, objectShadowColor, val, objectShadowOffsetX, objectShadowOffsetY, false);
                            }}
                            onMouseUp={() => {
                              if (canvas && activeObject) canvas.fire("object:modified", { target: activeObject });
                            }}
                            onTouchEnd={() => {
                              if (canvas && activeObject) canvas.fire("object:modified", { target: activeObject });
                            }}
                            onBlur={() => {
                              if (canvas && activeObject) canvas.fire("object:modified", { target: activeObject });
                            }}
                            className="w-full accent-indigo-650 cursor-pointer"
                          />
                        </div>
                        <div>
                          <label className="text-[8px] font-black text-slate-400 block mb-0.5 uppercase">Offset X ({objectShadowOffsetX}px)</label>
                          <input
                            type="range"
                            min="-15"
                            max="15"
                            value={objectShadowOffsetX}
                            onChange={(e) => {
                              const val = parseInt(e.target.value);
                              setObjectShadowOffsetX(val);
                              updateActiveObjectShadow(true, objectShadowColor, objectShadowBlur, val, objectShadowOffsetY, false);
                            }}
                            onMouseUp={() => {
                              if (canvas && activeObject) canvas.fire("object:modified", { target: activeObject });
                            }}
                            onTouchEnd={() => {
                              if (canvas && activeObject) canvas.fire("object:modified", { target: activeObject });
                            }}
                            onBlur={() => {
                              if (canvas && activeObject) canvas.fire("object:modified", { target: activeObject });
                            }}
                            className="w-full accent-indigo-650 cursor-pointer"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="text-[8px] font-black text-slate-400 block mb-0.5 uppercase">Offset Y ({objectShadowOffsetY}px)</label>
                          <input
                            type="range"
                            min="-15"
                            max="15"
                            value={objectShadowOffsetY}
                            onChange={(e) => {
                              const val = parseInt(e.target.value);
                              setObjectShadowOffsetY(val);
                              updateActiveObjectShadow(true, objectShadowColor, objectShadowBlur, objectShadowOffsetX, val, false);
                            }}
                            onMouseUp={() => {
                              if (canvas && activeObject) canvas.fire("object:modified", { target: activeObject });
                            }}
                            onTouchEnd={() => {
                              if (canvas && activeObject) canvas.fire("object:modified", { target: activeObject });
                            }}
                            onBlur={() => {
                              if (canvas && activeObject) canvas.fire("object:modified", { target: activeObject });
                            }}
                            className="w-full accent-indigo-650 cursor-pointer"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Alignment Actions */}
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase block">Align to Front Cover</label>
                  <div className="flex gap-1.5">
                    <button 
                      onClick={() => handleAlignment('left')} 
                      className="flex-1 py-1.5 bg-white border border-slate-200 text-[10px] font-black rounded-lg hover:border-indigo-500 hover:bg-slate-50"
                    >
                      Left
                    </button>
                    <button 
                      onClick={() => handleAlignment('center')} 
                      className="flex-1 py-1.5 bg-white border border-slate-200 text-[10px] font-black rounded-lg hover:border-indigo-500 hover:bg-slate-50"
                    >
                      Center
                    </button>
                    <button 
                      onClick={() => handleAlignment('right')} 
                      className="flex-1 py-1.5 bg-white border border-slate-200 text-[10px] font-black rounded-lg hover:border-indigo-500 hover:bg-slate-50"
                    >
                      Right
                    </button>
                  </div>
                </div>
                <div className="space-y-2 pt-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase block">Layer Security</label>
                  <button 
                    onClick={toggleLockSelected}
                    className={`w-full p-2.5 rounded-xl text-xs font-black border flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      isObjectLocked 
                        ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' 
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {isObjectLocked ? (
                      <>
                        <Lock className="w-4 h-4 text-amber-600" />
                        <span>Unlock Layer (Locked)</span>
                      </>
                    ) : (
                      <>
                        <Unlock className="w-4 h-4 text-slate-400" />
                        <span>Lock Layer (Editable)</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Edit & Clipboard Actions */}
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase block">Edit Actions</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button 
                      onClick={copySelected}
                      disabled={isObjectLocked}
                      className="py-2 bg-white border border-slate-200 text-[9px] font-black rounded-lg hover:border-indigo-500 hover:bg-slate-50 uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40"
                    >
                      <Copy className="w-3 h-3 text-indigo-500" /> Copy
                    </button>
                    <button 
                      onClick={cutSelected}
                      disabled={isObjectLocked}
                      className="py-2 bg-white border border-slate-200 text-[9px] font-black rounded-lg hover:border-indigo-500 hover:bg-slate-50 uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40"
                    >
                      <Scissors className="w-3 h-3 text-indigo-500" /> Cut
                    </button>
                    <button 
                      onClick={duplicateSelected}
                      disabled={isObjectLocked}
                      className="py-2 bg-white border border-slate-200 text-[9px] font-black rounded-lg hover:border-indigo-500 hover:bg-slate-50 uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40"
                    >
                      <Plus className="w-3 h-3 text-indigo-500" /> Duplicate
                    </button>
                    <button 
                      onClick={deleteSelected}
                      className="py-2 bg-red-50 hover:bg-red-100 border border-red-100 text-red-650 text-[9px] font-black rounded-lg uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
                  </div>
                </div>

                {/* Layer Arrangement (Depth Control) */}
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase block">Layer depth & arrangement</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button 
                      onClick={bringToFront}
                      disabled={isObjectLocked}
                      className="py-2 bg-white border border-slate-200 text-[9px] font-black rounded-lg hover:border-indigo-500 hover:bg-slate-50 uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40"
                      title="Bring all the way to front"
                    >
                      <ChevronsUp className="w-3 h-3 text-slate-500" /> To Front
                    </button>
                    <button 
                      onClick={bringForward}
                      disabled={isObjectLocked}
                      className="py-2 bg-white border border-slate-200 text-[9px] font-black rounded-lg hover:border-indigo-500 hover:bg-slate-50 uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40"
                      title="Bring one layer forward"
                    >
                      <ChevronUp className="w-3 h-3 text-slate-500" /> Forward
                    </button>
                    <button 
                      onClick={sendBackward}
                      disabled={isObjectLocked}
                      className="py-2 bg-white border border-slate-200 text-[9px] font-black rounded-lg hover:border-indigo-500 hover:bg-slate-50 uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40"
                      title="Send one layer backward"
                    >
                      <ChevronDown className="w-3 h-3 text-slate-500" /> Backward
                    </button>
                    <button 
                      onClick={sendToBack}
                      disabled={isObjectLocked}
                      className="py-2 bg-white border border-slate-200 text-[9px] font-black rounded-lg hover:border-indigo-500 hover:bg-slate-50 uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40"
                      title="Send all the way to back"
                    >
                      <ChevronsDown className="w-3 h-3 text-slate-500" /> To Back
                    </button>
                  </div>
                </div>
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

            {/* Canvas Layers Manager */}
            <div className="pt-4 border-t border-slate-200 space-y-2.5">
              <h4 className="font-black text-[10px] uppercase tracking-widest text-slate-400">Canvas Layers ({layers.length})</h4>
              {layers.length === 0 ? (
                <p className="text-[10px] text-slate-400 italic">No layers added yet.</p>
              ) : (
                <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                  {layers.map((layer: any, idx) => {
                    const isSelected = activeObject === layer;
                    let icon = "📝";
                    let label = "Layer";
                    
                    if (layer.type === 'i-text' || layer.type === 'text') {
                      icon = "🔤";
                      label = layer.text ? (layer.text.length > 15 ? `${layer.text.substring(0, 15)}...` : layer.text) : "Text";
                    } else if (layer.type === 'rect') {
                      if (layer.id?.startsWith('barcode')) {
                        icon = "📊";
                        label = "Barcode Placeholder";
                      } else {
                        icon = "⏹️";
                        label = "Rectangle";
                      }
                    } else if (layer.type === 'circle') {
                      icon = "⚪";
                      label = "Circle";
                    } else if (layer.type === 'line') {
                      icon = "➖";
                      label = "Line Divider";
                    } else if (layer.type === 'polygon' || layer.type === 'star') {
                      icon = "⭐";
                      label = "Star Shape";
                    } else if (layer.type === 'image') {
                      icon = "🖼️";
                      label = "Image/Clipart";
                    } else if (layer.type === 'group') {
                      if (layer.id?.startsWith('barcode')) {
                        icon = "📊";
                        label = "Barcode Placeholder";
                      } else {
                        icon = "📦";
                        label = "Group";
                      }
                    }
                    
                    return (
                      <div 
                        key={idx}
                        className={`flex items-center gap-1.5 p-1.5 rounded-lg border transition-all text-xs font-semibold ${
                          isSelected 
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-950 shadow-sm' 
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span className="text-sm select-none">{icon}</span>
                        <span 
                          onClick={() => {
                            if (canvas) {
                              canvas.setActiveObject(layer);
                              canvas.requestRenderAll();
                            }
                          }}
                          className="flex-1 truncate cursor-pointer select-none leading-none pr-1"
                          title={label}
                        >
                          {label}
                        </span>
                        
                        <div className="flex gap-0.5">
                          <button
                            onClick={() => {
                              if (canvas) {
                                layer.bringForward();
                                canvas.requestRenderAll();
                                canvas.fire("object:modified", { target: layer });
                              }
                            }}
                            title="Move Up"
                            className="p-1 rounded hover:bg-slate-200 text-slate-500 hover:text-slate-900 active:scale-95"
                          >
                            <ChevronUp className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => {
                              if (canvas) {
                                layer.sendBackwards();
                                canvas.requestRenderAll();
                                canvas.fire("object:modified", { target: layer });
                              }
                            }}
                            title="Move Down"
                            className="p-1 rounded hover:bg-slate-200 text-slate-500 hover:text-slate-900 active:scale-95"
                          >
                            <ChevronDown className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => {
                              if (canvas) {
                                canvas.remove(layer);
                                if (activeObject === layer) {
                                  canvas.discardActiveObject();
                                  setActiveObject(null);
                                }
                                canvas.requestRenderAll();
                                canvas.fire("object:modified", { target: layer });
                              }
                            }}
                            title="Delete Layer"
                            className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-655 active:scale-95"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {activeToolTab === 'graphics' && (
          <div className="space-y-4">
            <div>
              <h3 className="font-black text-[10px] uppercase tracking-widest text-slate-400 mb-2">Unsplash Image Search</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search covers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchUnsplash()}
                  className="flex-1 text-xs font-semibold p-2.5 border border-slate-200 rounded-xl focus:border-amber-400 outline-none bg-white"
                />
                <button
                  onClick={handleSearchUnsplash}
                  disabled={isSearching}
                  className="px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black"
                >
                  {isSearching ? "..." : "Search"}
                </button>
              </div>
              {searchError && (
                <p className="text-[9px] text-red-500 font-semibold mt-1 bg-red-55/40 p-2 rounded-lg leading-normal">
                  {searchError}
                </p>
              )}
            </div>

            {/* Display Unsplash Results if Search matches */}
            {searchResults.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <h3 className="font-black text-[10px] uppercase tracking-widest text-slate-400">Search Results</h3>
                <div className="grid grid-cols-2 gap-2 max-h-[250px] overflow-y-auto pr-1">
                  {searchResults.map((clip, i) => (
                    <div
                      key={i}
                      className="group relative aspect-square rounded-xl border border-slate-200 bg-white overflow-hidden hover:border-amber-400 hover:shadow-sm transition-all p-1"
                    >
                      <img src={clip.thumb} alt={clip.name} crossOrigin="anonymous" className="w-full h-full object-cover rounded-lg" />
                      
                      {/* Hover Actions Menu */}
                      <div className="absolute inset-0 bg-slate-950/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center gap-1.5 p-2 z-10">
                        <button
                          onClick={() => addClipart(clip.full)}
                          className="w-full py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded text-[9px] font-black uppercase tracking-wider"
                        >
                          Add Layer
                        </button>
                        <button
                          onClick={() => applyBackgroundImage(clip.full, 'full')}
                          className="w-full py-1 bg-indigo-650 hover:bg-indigo-550 text-white rounded text-[9px] font-black uppercase tracking-wider"
                        >
                          Full BG
                        </button>
                        <button
                          onClick={() => applyBackgroundImage(clip.full, 'front')}
                          className="w-full py-1 bg-sky-600 hover:bg-sky-500 text-white rounded text-[9px] font-black uppercase tracking-wider"
                        >
                          Front BG
                        </button>
                        <button
                          onClick={() => applyBackgroundImage(clip.full, 'back')}
                          className="w-full py-1 bg-teal-650 hover:bg-teal-555 text-white rounded text-[9px] font-black uppercase tracking-wider"
                        >
                          Back BG
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-slate-200 space-y-2">
              <h3 className="font-black text-[10px] uppercase tracking-widest text-slate-400">Premium Schematics</h3>
              <div className="grid grid-cols-2 gap-2">
                {CLIPARTS.map((clip, i) => (
                  <div 
                    key={i} 
                    className="group relative aspect-square rounded-xl border border-slate-200 bg-white overflow-hidden hover:border-amber-400 hover:shadow-sm transition-all p-1"
                  >
                    <img src={clip.src} alt={clip.name} crossOrigin="anonymous" className="w-full h-full object-cover rounded-lg" />
                    <span className="absolute bottom-1 left-1 right-1 bg-black/60 text-[8px] text-white text-center font-bold px-1 py-0.5 rounded truncate group-hover:hidden">{clip.name}</span>
                    
                    {/* Hover Actions Menu */}
                    <div className="absolute inset-0 bg-slate-950/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center gap-1.5 p-2 z-10">
                      <button
                        onClick={() => addClipart(clip.src)}
                        className="w-full py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded text-[9px] font-black uppercase tracking-wider"
                      >
                        Add Layer
                      </button>
                      <button
                        onClick={() => applyBackgroundImage(clip.src, 'full')}
                        className="w-full py-1 bg-indigo-650 hover:bg-indigo-550 text-white rounded text-[9px] font-black uppercase tracking-wider"
                      >
                        Full BG
                      </button>
                      <button
                        onClick={() => applyBackgroundImage(clip.src, 'front')}
                        className="w-full py-1 bg-sky-600 hover:bg-sky-500 text-white rounded text-[9px] font-black uppercase tracking-wider"
                      >
                        Front BG
                      </button>
                      <button
                        onClick={() => applyBackgroundImage(clip.src, 'back')}
                        className="w-full py-1 bg-teal-650 hover:bg-teal-555 text-white rounded text-[9px] font-black uppercase tracking-wider"
                      >
                        Back BG
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeToolTab === 'presets' && (
          <div className="space-y-4">
            <h3 className="font-black text-[10px] uppercase tracking-widest text-slate-400">Preset Styles</h3>
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

            <div className="h-px bg-slate-200 my-4" />

            <div className="space-y-4">
              <h3 className="font-black text-[10px] uppercase tracking-widest text-slate-400">Custom Gradient & Colors</h3>
              
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
                    <div 
                      key={i} 
                      className="group relative aspect-square rounded-xl border border-slate-200 bg-white overflow-hidden hover:border-amber-400 hover:shadow-sm transition-all p-1"
                    >
                      <img src={src} alt="UploadedAsset" className="w-full h-full object-cover rounded-lg" />
                      
                      {/* Hover Actions Menu */}
                      <div className="absolute inset-0 bg-slate-950/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center gap-1.5 p-2 z-10">
                        <button
                          onClick={() => addClipart(src)}
                          className="w-full py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded text-[9px] font-black uppercase tracking-wider"
                        >
                          Add Layer
                        </button>
                        <button
                          onClick={() => applyBackgroundImage(src, 'full')}
                          className="w-full py-1 bg-indigo-650 hover:bg-indigo-550 text-white rounded text-[9px] font-black uppercase tracking-wider"
                        >
                          Full BG
                        </button>
                        <button
                          onClick={() => applyBackgroundImage(src, 'front')}
                          className="w-full py-1 bg-sky-600 hover:bg-sky-500 text-white rounded text-[9px] font-black uppercase tracking-wider"
                        >
                          Front BG
                        </button>
                        <button
                          onClick={() => applyBackgroundImage(src, 'back')}
                          className="w-full py-1 bg-teal-650 hover:bg-teal-555 text-white rounded text-[9px] font-black uppercase tracking-wider"
                        >
                          Back BG
                        </button>
                      </div>
                    </div>
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
                <label className="text-xs font-bold text-slate-600 block mb-1">Paper Type (Spine Factor)</label>
                <select 
                  value={paperType} 
                  onChange={(e) => setPaperType(e.target.value as any)}
                  className="w-full text-xs font-bold p-2.5 bg-white border border-slate-200 rounded-xl"
                >
                  <option value="white">White Paper (0.002252"/pg)</option>
                  <option value="cream">Cream Paper (0.002500"/pg)</option>
                  <option value="color">Color Paper (0.002347"/pg)</option>
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

              {/* KDP Gutter Reference Card */}
              <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-250/50 space-y-1.5 mt-2">
                <span className="text-[9px] font-black text-amber-800 uppercase block tracking-wider">📐 KDP Interior Guidelines</span>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[9px] text-slate-650 font-semibold leading-normal">
                  <span>Page Count:</span>
                  <span className="font-bold text-slate-800">{pageCount} pages</span>
                  
                  <span>Inside Gutter:</span>
                  <span className="font-bold text-slate-800">{getKdpGutterReference(pageCount).gutter}</span>
                  
                  <span>Outside (No Bleed):</span>
                  <span className="font-bold text-slate-800">{getKdpGutterReference(pageCount).outsideNoBleed}</span>
                  
                  <span>Outside (With Bleed):</span>
                  <span className="font-bold text-slate-800">{getKdpGutterReference(pageCount).outsideBleed}</span>
                </div>
              </div>

              {/* Active Background Images Clear Actions */}
              {(backCoverImage || frontCoverImage || fullCoverImage) && (
                <div className="space-y-2 border-b border-slate-200 pb-3">
                  <label className="text-xs font-bold text-slate-600 block">Active Image Backgrounds</label>
                  <div className="space-y-1.5">
                    {fullCoverImage && (
                      <div className="flex justify-between items-center bg-indigo-50 p-2 rounded-lg border border-indigo-100 text-[10px]">
                        <span className="font-semibold text-indigo-950 truncate max-w-[150px]">Full Cover BG Image</span>
                        <button onClick={() => setFullCoverImage('')} className="text-red-500 hover:text-red-750 font-bold uppercase transition-colors">Clear</button>
                      </div>
                    )}
                    {backCoverImage && (
                      <div className="flex justify-between items-center bg-indigo-50 p-2 rounded-lg border border-indigo-100 text-[10px]">
                        <span className="font-semibold text-indigo-950 truncate max-w-[150px]">Back Cover BG Image</span>
                        <button onClick={() => setBackCoverImage('')} className="text-red-500 hover:text-red-755 font-bold uppercase transition-colors">Clear</button>
                      </div>
                    )}
                    {frontCoverImage && (
                      <div className="flex justify-between items-center bg-indigo-50 p-2 rounded-lg border border-indigo-100 text-[10px]">
                        <span className="font-semibold text-indigo-950 truncate max-w-[150px]">Front Cover BG Image</span>
                        <button onClick={() => setFrontCoverImage('')} className="text-red-500 hover:text-red-755 font-bold uppercase transition-colors">Clear</button>
                      </div>
                    )}
                  </div>
                </div>
              )}

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

        {/* Global Canvas Control Bar */}
        <div className="mb-4 flex items-center gap-3 bg-white py-2 px-4 rounded-full border border-slate-200 shadow-sm z-10 select-none">
          <button 
            onClick={handleUndo} 
            disabled={historyStep <= 0} 
            title="Undo (Ctrl+Z)" 
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-30 transition-all flex items-center gap-1.5"
          >
            <Undo2 className="w-4 h-4"/>
            <span className="text-[10px] font-black uppercase tracking-wider">Undo</span>
          </button>
          
          <button 
            onClick={handleRedo} 
            disabled={historyStep === history.length - 1} 
            title="Redo (Ctrl+Y)" 
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-30 transition-all flex items-center gap-1.5"
          >
            <Redo2 className="w-4 h-4"/>
            <span className="text-[10px] font-black uppercase tracking-wider">Redo</span>
          </button>

          <div className="w-px h-5 bg-slate-200 mx-1" />

          <button 
            onClick={deleteSelected} 
            disabled={!activeObject}
            title="Erase / Delete Selected Layer (Delete)" 
            className="p-2 rounded-lg text-red-650 hover:bg-red-50 disabled:opacity-30 transition-all flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4"/>
            <span className="text-[10px] font-black uppercase tracking-wider">Erase</span>
          </button>

          <button 
            onClick={handleClearCanvas} 
            disabled={layers.length === 0}
            title="Clear All Layers" 
            className="p-2 rounded-lg text-slate-600 hover:bg-red-50 hover:text-red-700 disabled:opacity-30 transition-all flex items-center gap-1.5"
          >
            <Eraser className="w-4 h-4"/>
            <span className="text-[10px] font-black uppercase tracking-wider">Clear All</span>
          </button>
        </div>

        {/* Responsive parent container to calculate scale */}
        <div ref={containerRef} className="flex-1 w-full h-full min-h-0 overflow-hidden flex items-center justify-center relative">
          {/* Scaled canvas container */}
          <div 
            style={{
              transform: `scale(${scaleRatio})`,
              transformOrigin: 'center center',
              transition: 'transform 0.1s ease'
            }}
            className="relative shadow-[0_15px_50px_rgba(0,0,0,0.15)] bg-white rounded-sm ring-1 ring-slate-300 overflow-hidden cursor-default flex-shrink-0"
          >
            <canvas ref={canvasRef} />
          </div>
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
