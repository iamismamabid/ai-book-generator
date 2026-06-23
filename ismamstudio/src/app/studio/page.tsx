"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Search, Download, Grid3x3, Settings, Loader2, Palette, Type, LayoutTemplate, 
  MousePointer2, Plus, Image as ImageIcon, ArrowUpToLine, ArrowDownToLine, Square, 
  Circle as CircleIcon, Layers, Box, Sparkles, Shapes, Save, Copy, Pencil, 
  Eraser, Undo2, Redo2, Star, Trash2, ChevronUp, ChevronDown, Check,
  AlignLeft, AlignCenter, AlignRight, Ruler, Grid, Upload
} from "lucide-react";
import { jsPDF } from "jspdf";
import { Stage, Layer, Rect, Circle as KonvaCircle, Text as KonvaText, Image as KonvaImage, Transformer, Star as KonvaStar, Line as KonvaLine } from 'react-konva';
import useImage from 'use-image';

// Import our BookBuilder component!
import BookBuilder from "../../components/BookBuilder";

const TRIM_SIZES = [
  { label: '6" x 9" (Novel)', w: 6, h: 9 },
  { label: '8.5" x 11" (Letter)', w: 8.5, h: 11 },
  { label: '5.5" x 8.5" (Compact)', w: 5.5, h: 8.5 }
];

const FONT_FAMILIES = ["Arial", "Georgia", "Times New Roman", "Courier New", "Impact", "Comic Sans MS", "Trebuchet MS"];

// Clipart Presets
const CLIPARTS = [
  { name: "Geometric Frame", src: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=300&q=80" },
  { name: "Mandala Flower", src: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=300&q=80" },
  { name: "Floral Frame", src: "https://images.unsplash.com/photo-1525498128493-380d1990a112?auto=format&fit=crop&w=300&q=80" },
  { name: "Golden Pattern", src: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80" },
  { name: "Retro Starburst", src: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=300&q=80" }
];

// Cover Background Presets
const BACKGROUNDS = [
  { name: "Midnight Space", back: "#05070F", front: "#0F172A", type: 'gradient', backStart: '#020617', backEnd: '#0f172a', frontStart: '#0f172a', frontEnd: '#1e1b4b' },
  { name: "Watercolor Sunset", back: "#FEF08A", front: "#FECDD3", type: 'gradient', backStart: '#fef08a', backEnd: '#fde047', frontStart: '#fde047', frontEnd: '#fecdd3' },
  { name: "Botanical Forest", back: "#064E3B", front: "#022C22", type: 'gradient', backStart: '#064e3b', backEnd: '#022c22', frontStart: '#022c22', frontEnd: '#022c22' },
  { name: "Vintage Cream", back: "#FEF3C7", front: "#FDE68A", type: 'solid', backStart: '#FEF3C7', backEnd: '#FEF3C7', frontStart: '#FDE68A', frontEnd: '#FDE68A' },
  { name: "Cyberpunk Glow", back: "#030712", front: "#3B0764", type: 'gradient', backStart: '#030712', backEnd: '#111827', frontStart: '#111827', frontEnd: '#3b0764' }
];

const URLImage = ({ imageInfo, isSelected, onSelect, onChange }: any) => {
  const [img] = useImage(imageInfo.src, 'anonymous');
  return (
    <KonvaImage
      image={img}
      id={imageInfo.id}
      name={imageInfo.name}
      x={imageInfo.x}
      y={imageInfo.y}
      width={imageInfo.width}
      height={imageInfo.height}
      rotation={imageInfo.rotation || 0}
      scaleX={imageInfo.scaleX || 1}
      scaleY={imageInfo.scaleY || 1}
      opacity={imageInfo.opacity ?? 1}
      draggable={isSelected}
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={(e) => onChange({ ...imageInfo, x: e.target.x(), y: e.target.y() })}
      onTransformEnd={(e) => {
        const node = e.target;
        onChange({
          ...imageInfo,
          x: node.x(),
          y: node.y(),
          scaleX: node.scaleX(),
          scaleY: node.scaleY(),
          rotation: node.rotation()
        });
      }}
    />
  );
};

export default function MasterStudioApp() {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => { setIsMounted(true); }, []);

  const [activeTab, setActiveTab] = useState<'interior' | 'cover'>('interior'); 
  const [isGenerating, setIsGenerating] = useState(false);
  const [trimSize, setTrimSize] = useState(TRIM_SIZES[0]);
  const [pageCount, setPageCount] = useState(100);

  // Cover Studio States
  const stageRef = useRef<any>(null);
  const trRef = useRef<any>(null);
  
  const [backCoverColor, setBackCoverColor] = useState('#0F172A'); 
  const [backCoverType, setBackCoverType] = useState<'solid' | 'gradient'>('solid');
  const [backCoverGradientStart, setBackCoverGradientStart] = useState('#0F172A');
  const [backCoverGradientEnd, setBackCoverGradientEnd] = useState('#020617');
  
  const [frontCoverColor, setFrontCoverColor] = useState('#1E293B'); 
  const [frontCoverType, setFrontCoverType] = useState<'solid' | 'gradient'>('solid');
  const [frontCoverGradientStart, setFrontCoverGradientStart] = useState('#1E293B');
  const [frontCoverGradientEnd, setFrontCoverGradientEnd] = useState('#0F172A');

  const [coverElements, setCoverElements] = useState<any[]>([]);
  const [activeElementId, setActiveElementId] = useState<string | null>(null);
  const [showKdpGuides, setShowKdpGuides] = useState(true);
  const [activeToolTab, setActiveToolTab] = useState<'elements' | 'graphics' | 'presets' | 'settings' | 'uploads'>('elements');

  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [snapToGrid, setSnapToGrid] = useState(false);

  const [history, setHistory] = useState<any[][]>([[]]);
  const [historyStep, setHistoryStep] = useState(0);

  // Cover Math
  const spineWidth = pageCount * 0.002252; // KDP white paper spine width
  const bleed = 0.125;
  const coverTotalWidthInches = (trimSize.w * 2) + spineWidth + (bleed * 2);
  const coverTotalHeightInches = trimSize.h + (bleed * 2);
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = CANVAS_WIDTH * (coverTotalHeightInches / coverTotalWidthInches);
  const centerFrontX = CANVAS_WIDTH * 0.72;
  const centerY = CANVAS_HEIGHT / 2;
  const spineWidthPx = (spineWidth / coverTotalWidthInches) * CANVAS_WIDTH;
  const bleedPx = (bleed / coverTotalWidthInches) * CANVAS_WIDTH;

  useEffect(() => {
    if (activeElementId && trRef.current) {
      const node = trRef.current.getStage().findOne('#' + activeElementId);
      if (node) { 
        trRef.current.nodes([node]); 
        trRef.current.getLayer().batchDraw(); 
      }
    } else if (trRef.current) {
      trRef.current.nodes([]);
    }
  }, [activeElementId, coverElements]);

  const saveToHistory = (newElements: any[]) => {
    const newHist = history.slice(0, historyStep + 1);
    newHist.push(newElements);
    setHistory(newHist); 
    setHistoryStep(newHist.length - 1);
    setCoverElements(newElements);
  };

  const undo = () => {
    if (historyStep > 0) {
      setHistoryStep(historyStep - 1);
      setCoverElements(history[historyStep - 1]);
      setActiveElementId(null);
    }
  };

  const redo = () => {
    if (historyStep < history.length - 1) {
      setHistoryStep(historyStep + 1);
      setCoverElements(history[historyStep + 1]);
      setActiveElementId(null);
    }
  };

  const updateElement = (newAttrs: any) => {
    const newEls = coverElements.map(el => el.id === newAttrs.id ? newAttrs : el);
    setCoverElements(newEls); 
    saveToHistory(newEls);
  };

  const selectedElement = coverElements.find(el => el.id === activeElementId);

  // Element Adders
  const addNewText = () => { 
    const id = `t-${Date.now()}`; 
    saveToHistory([...coverElements, { 
      id, 
      type: 'text', 
      text: 'BOOK TITLE', 
      x: centerFrontX - 80, 
      y: centerY - 40, 
      fontSize: 32, 
      fill: '#FFFFFF', 
      fontFamily: 'Arial',
      fontStyle: 'normal',
      name: 'Text',
      opacity: 1,
      align: 'center',
      letterSpacing: 0,
      lineHeight: 1.1,
      shadowColor: '#000000',
      shadowBlur: 0,
      shadowOffsetX: 0,
      shadowOffsetY: 0,
      shadowOpacity: 0.5
    }]); 
    setActiveElementId(id); 
  };

  const addNewRectangle = () => {
    const id = `r-${Date.now()}`;
    saveToHistory([...coverElements, {
      id,
      type: 'rect',
      x: centerFrontX - 50,
      y: centerY - 50,
      width: 100,
      height: 100,
      fillType: 'solid',
      fill: '#F59E0B',
      fillGradientStartColor: '#F59E0B',
      fillGradientEndColor: '#EF4444',
      stroke: '#FFFFFF',
      strokeWidth: 2,
      opacity: 0.8,
      cornerRadius: 0,
      name: 'Rectangle'
    }]);
    setActiveElementId(id);
  };

  const addNewCircle = () => {
    const id = `c-${Date.now()}`;
    saveToHistory([...coverElements, {
      id,
      type: 'circle',
      x: centerFrontX,
      y: centerY,
      radius: 50,
      fillType: 'solid',
      fill: '#3B82F6',
      fillGradientStartColor: '#3B82F6',
      fillGradientEndColor: '#8B5CF6',
      stroke: '#FFFFFF',
      strokeWidth: 2,
      opacity: 0.8,
      name: 'Circle'
    }]);
    setActiveElementId(id);
  };

  const addNewStar = () => {
    const id = `s-${Date.now()}`;
    saveToHistory([...coverElements, {
      id,
      type: 'star',
      x: centerFrontX,
      y: centerY,
      numPoints: 5,
      innerRadius: 20,
      outerRadius: 40,
      fillType: 'solid',
      fill: '#10B981',
      fillGradientStartColor: '#10B981',
      fillGradientEndColor: '#059669',
      stroke: '#FFFFFF',
      strokeWidth: 2,
      opacity: 0.8,
      name: 'Star'
    }]);
    setActiveElementId(id);
  };

  const addNewLine = () => {
    const id = `l-${Date.now()}`;
    saveToHistory([...coverElements, {
      id,
      type: 'line',
      x: centerFrontX - 75,
      y: centerY,
      points: [0, 0, 150, 0],
      stroke: '#FFFFFF',
      strokeWidth: 4,
      dashEnabled: false,
      opacity: 0.9,
      name: 'Line Divider'
    }]);
    setActiveElementId(id);
  };

  const addClipart = (src: string) => {
    const id = `clip-${Date.now()}`;
    saveToHistory([...coverElements, {
      id,
      type: 'clipart',
      src: src,
      x: centerFrontX - 75,
      y: centerY - 75,
      width: 150,
      height: 150,
      opacity: 1,
      name: 'Clipart'
    }]);
    setActiveElementId(id);
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

  // Layer Z-Index arrangements
  const moveForward = () => {
    if (!activeElementId) return;
    const index = coverElements.findIndex(el => el.id === activeElementId);
    if (index < coverElements.length - 1) {
      const newEls = [...coverElements];
      const temp = newEls[index];
      newEls[index] = newEls[index + 1];
      newEls[index + 1] = temp;
      saveToHistory(newEls);
    }
  };

  const moveBackward = () => {
    if (!activeElementId) return;
    const index = coverElements.findIndex(el => el.id === activeElementId);
    if (index > 0) {
      const newEls = [...coverElements];
      const temp = newEls[index];
      newEls[index] = newEls[index - 1];
      newEls[index - 1] = temp;
      saveToHistory(newEls);
    }
  };

  const deleteSelected = () => {
    if (!activeElementId) return;
    saveToHistory(coverElements.filter(e => e.id !== activeElementId));
    setActiveElementId(null);
  };

  const handleGenerateCover = async () => {
    if (!stageRef.current) return;
    setIsGenerating(true);
    setShowKdpGuides(false); 
    setActiveElementId(null);
    
    setTimeout(() => {
      const dataURL = stageRef.current.toDataURL({ pixelRatio: 3 });
      const doc = new jsPDF({ 
        orientation: "landscape", 
        unit: "in", 
        format: [coverTotalWidthInches, coverTotalHeightInches] 
      });
      doc.addImage(dataURL, 'PNG', 0, 0, coverTotalWidthInches, coverTotalHeightInches);
      doc.save(`KDP_Cover_${trimSize.w}x${trimSize.h}.pdf`);
      setShowKdpGuides(true); 
      setIsGenerating(false);
    }, 500);
  };

  if (!isMounted) return <div className="min-h-screen flex items-center justify-center text-indigo-600"><Loader2 className="w-8 h-8 animate-spin"/></div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 font-sans text-slate-900 flex flex-col overflow-hidden">
      
      {/* APP HEADER */}
      <header className="mb-6 flex flex-col sm:flex-row justify-between items-center max-w-[1600px] mx-auto w-full gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg">AI</div>
          <div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight">KDP Master Studio</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Premium Cover & Interior Creator</p>
          </div>
        </div>
        
        {/* TAB SWITCHER */}
        <div className="flex bg-slate-200/80 p-1 rounded-full shadow-inner border border-slate-300/40">
          <button 
            onClick={() => setActiveTab('interior')} 
            className={`px-6 py-2.5 rounded-full font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === 'interior' ? 'bg-white shadow-md text-slate-900' : 'text-slate-500 hover:bg-slate-300/50'
            }`}
          >
            <Grid3x3 className="w-4 h-4"/> Book Builder
          </button>
          <button 
            onClick={() => setActiveTab('cover')} 
            className={`px-6 py-2.5 rounded-full font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === 'cover' ? 'bg-white shadow-md text-slate-900' : 'text-slate-500 hover:bg-slate-300/50'
            }`}
          >
            <Palette className="w-4 h-4"/> Cover Studio
          </button>
        </div>
      </header>

      <div className="flex-1 max-w-[1600px] w-full mx-auto">
        
        {/* ================= 1. INTERIOR COMPONENT ================= */}
        {activeTab === 'interior' && (
          <div className="animate-in fade-in duration-300 w-full h-full">
            <BookBuilder />
          </div>
        )}

        {/* ================= 2. COVER STUDIO COMPONENT ================= */}
        {activeTab === 'cover' && (
          <div className="flex h-[calc(100vh-140px)] rounded-3xl border border-slate-200 overflow-hidden bg-white shadow-sm animate-in fade-in duration-500">
            
            {/* Left Workspace Panel Toolbar */}
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
                title="AI Background Presets"
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
                  className="p-3 mx-auto rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 transition-all shadow-md shadow-indigo-600/25 active:scale-95"
                >
                  {isGenerating ? <Loader2 className="w-5 h-5 animate-spin"/> : <Download className="w-5 h-5"/>}
                </button>
              </div>
            </div>

            {/* Menu Panel Options */}
            <div className="w-68 bg-slate-50 border-r border-slate-200 flex flex-col p-5 z-10 overflow-y-auto">
              
              {activeToolTab === 'elements' && (
                <div className="space-y-5 animate-in slide-in-from-left-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-black text-[10px] uppercase tracking-widest text-slate-400">Library Assets</h3>
                    <div className="flex gap-1.5">
                      <button onClick={undo} disabled={historyStep === 0} title="Undo" className="p-1 rounded bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30"><Undo2 className="w-3.5 h-3.5"/></button>
                      <button onClick={redo} disabled={historyStep === history.length - 1} title="Redo" className="p-1 rounded bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30"><Redo2 className="w-3.5 h-3.5"/></button>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <button 
                      onClick={addNewText} 
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-black flex items-center gap-2.5 hover:border-amber-400 hover:shadow-sm transition-all text-slate-700"
                    >
                      <Type className="w-4 h-4 text-indigo-500"/> Add Text Layer
                    </button>
                    <button 
                      onClick={addNewRectangle} 
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-black flex items-center gap-2.5 hover:border-amber-400 hover:shadow-sm transition-all text-slate-700"
                    >
                      <Square className="w-4 h-4 text-amber-500 fill-amber-500/10"/> Add Rectangle
                    </button>
                    <button 
                      onClick={addNewCircle} 
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-black flex items-center gap-2.5 hover:border-amber-400 hover:shadow-sm transition-all text-slate-700"
                    >
                      <CircleIcon className="w-4 h-4 text-sky-500 fill-sky-500/10"/> Add Circle
                    </button>
                    <button 
                      onClick={addNewStar} 
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-black flex items-center gap-2.5 hover:border-amber-400 hover:shadow-sm transition-all text-slate-700"
                    >
                      <Star className="w-4 h-4 text-emerald-500 fill-emerald-500/10"/> Add Star Shape
                    </button>
                    <button 
                      onClick={addNewLine} 
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-black flex items-center gap-2.5 hover:border-amber-400 hover:shadow-sm transition-all text-slate-700"
                    >
                      <Ruler className="w-4 h-4 text-rose-500"/> Add Line Divider
                    </button>
                  </div>

                  <div className="pt-4 border-t border-slate-200">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={snapToGrid} 
                        onChange={(e) => setSnapToGrid(e.target.checked)}
                        className="rounded text-amber-500 accent-amber-500 cursor-pointer"
                      />
                      <span className="text-xs font-black text-slate-700 flex items-center gap-1"><Grid className="w-3.5 h-3.5 text-slate-500"/> Snap to Grid (15px)</span>
                    </label>
                  </div>
                </div>
              )}

              {activeToolTab === 'graphics' && (
                <div className="space-y-4 animate-in slide-in-from-left-4">
                  <h3 className="font-black text-[10px] uppercase tracking-widest text-slate-400 mb-2">BookBolt Clipart</h3>
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
                <div className="space-y-4 animate-in slide-in-from-left-4">
                  <h3 className="font-black text-[10px] uppercase tracking-widest text-slate-400">AI Cover Styles</h3>
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
                <div className="space-y-5 animate-in slide-in-from-left-4">
                  <h3 className="font-black text-[10px] uppercase tracking-widest text-slate-400">Custom Graphics</h3>
                  
                  {/* File Uploader */}
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

                  {/* Remote URL input */}
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
                        className="px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Gallery List */}
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
                <div className="space-y-5 animate-in slide-in-from-left-4">
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
                        className="w-full accent-amber-500 cursor-ew-resize"
                      />
                      <p className="text-[10px] text-slate-400 font-semibold mt-1">Spine size: {spineWidth.toFixed(4)}" inches</p>
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
                             className="flex-1 text-xs font-bold uppercase p-2 border border-slate-200 rounded-xl text-center" 
                           />
                         </div>
                       ) : (
                         <div className="grid grid-cols-2 gap-2">
                           <div>
                             <label className="text-[9px] font-bold text-slate-400 block mb-0.5 uppercase">Color 1</label>
                             <div className="flex gap-1 items-center">
                               <input 
                                 type="color" 
                                 value={backCoverGradientStart} 
                                 onChange={(e) => setBackCoverGradientStart(e.target.value)} 
                                 className="w-7 h-7 rounded-lg cursor-pointer border border-slate-200 p-0.5 bg-white" 
                               />
                               <span className="text-[9px] font-black text-slate-400 uppercase">{backCoverGradientStart}</span>
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
                               <span className="text-[9px] font-black text-slate-400 uppercase">{backCoverGradientEnd}</span>
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
                             className="flex-1 text-xs font-bold uppercase p-2 border border-slate-200 rounded-xl text-center" 
                           />
                         </div>
                       ) : (
                         <div className="grid grid-cols-2 gap-2">
                           <div>
                             <label className="text-[9px] font-bold text-slate-400 block mb-0.5 uppercase">Color 1</label>
                             <div className="flex gap-1 items-center">
                               <input 
                                 type="color" 
                                 value={frontCoverGradientStart} 
                                 onChange={(e) => setFrontCoverGradientStart(e.target.value)} 
                                 className="w-7 h-7 rounded-lg cursor-pointer border border-slate-200 p-0.5 bg-white" 
                               />
                               <span className="text-[9px] font-black text-slate-400 uppercase">{frontCoverGradientStart}</span>
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
                               <span className="text-[9px] font-black text-slate-400 uppercase">{frontCoverGradientEnd}</span>
                             </div>
                           </div>
                         </div>
                       )}
                     </div>
                  </div>
                </div>
              )}

              {/* Properties Editor Panel - Displays when any item is selected */}
              {selectedElement && (
                <div className="mt-auto pt-5 border-t border-slate-200 animate-in slide-in-from-bottom-4 space-y-4 max-h-[40%] overflow-y-auto pr-1">
                  <div className="flex justify-between items-center">
                    <h3 className="font-black text-[10px] uppercase tracking-widest text-slate-400">Layer Properties</h3>
                    <span className="text-[10px] font-black text-slate-500 uppercase bg-slate-200 px-2 py-0.5 rounded">{selectedElement.type}</span>
                  </div>
                  
                  {selectedElement.type === 'text' && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-bold text-slate-600 block mb-1">Edit Content</label>
                        <textarea 
                          value={selectedElement.text} 
                          onChange={(e) => updateElement({ ...selectedElement, text: e.target.value })}
                          className="w-full text-xs font-semibold p-2 border border-slate-200 rounded-lg min-h-[50px] focus:border-amber-400 outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-600 block mb-1">Font Family</label>
                        <select
                          value={selectedElement.fontFamily}
                          onChange={(e) => updateElement({ ...selectedElement, fontFamily: e.target.value })}
                          className="w-full text-xs font-semibold p-2 bg-white border border-slate-200 rounded-lg focus:border-amber-400 outline-none"
                        >
                          {FONT_FAMILIES.map((font, idx) => (
                            <option key={idx} value={font}>{font}</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex gap-2">
                        <div className="flex-1">
                          <label className="text-xs font-bold text-slate-600 block mb-1">Size</label>
                          <input 
                            type="number" 
                            value={selectedElement.fontSize}
                            onChange={(e) => updateElement({ ...selectedElement, fontSize: Number(e.target.value) })}
                            className="w-full text-xs font-semibold p-2 border border-slate-200 rounded-lg focus:border-amber-400 outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-600 block mb-1">Color</label>
                          <input 
                            type="color" 
                            value={selectedElement.fill}
                            onChange={(e) => updateElement({ ...selectedElement, fill: e.target.value })}
                            className="w-10 h-9 rounded-lg border cursor-pointer p-0.5 bg-white"
                          />
                        </div>
                      </div>

                      {/* Align & Style toggles */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-600 block">Typography Tools</label>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => updateElement({ ...selectedElement, fontStyle: selectedElement.fontStyle === 'bold' ? 'normal' : 'bold' })}
                            className={`flex-1 py-1.5 rounded-lg font-black text-xs border transition-all ${
                              selectedElement.fontStyle === 'bold' ? 'bg-slate-900 border-slate-900 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            Bold
                          </button>
                          <button 
                            onClick={() => updateElement({ ...selectedElement, fontStyle: selectedElement.fontStyle === 'italic' ? 'normal' : 'italic' })}
                            className={`flex-1 py-1.5 rounded-lg font-black text-xs border transition-all ${
                              selectedElement.fontStyle === 'italic' ? 'bg-slate-900 border-slate-900 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            Italic
                          </button>
                        </div>
                        <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                          <button 
                            onClick={() => updateElement({ ...selectedElement, align: 'left' })}
                            className={`flex-1 py-1 rounded-md flex justify-center ${selectedElement.align === 'left' ? 'bg-white shadow text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                          >
                            <AlignLeft className="w-4 h-4"/>
                          </button>
                          <button 
                            onClick={() => updateElement({ ...selectedElement, align: 'center' })}
                            className={`flex-1 py-1 rounded-md flex justify-center ${selectedElement.align === 'center' ? 'bg-white shadow text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                          >
                            <AlignCenter className="w-4 h-4"/>
                          </button>
                          <button 
                            onClick={() => updateElement({ ...selectedElement, align: 'right' })}
                            className={`flex-1 py-1 rounded-md flex justify-center ${selectedElement.align === 'right' ? 'bg-white shadow text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                          >
                            <AlignRight className="w-4 h-4"/>
                          </button>
                        </div>
                      </div>

                      {/* Letter Spacing & Line Height */}
                      <div>
                        <div className="flex justify-between">
                          <label className="text-xs font-bold text-slate-600 mb-1">Letter Spacing ({selectedElement.letterSpacing || 0})</label>
                        </div>
                        <input 
                          type="range" 
                          min="-2" 
                          max="20" 
                          value={selectedElement.letterSpacing || 0}
                          onChange={(e) => updateElement({ ...selectedElement, letterSpacing: Number(e.target.value) })}
                          className="w-full accent-amber-500 cursor-ew-resize"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between">
                          <label className="text-xs font-bold text-slate-600 mb-1">Line Height ({(selectedElement.lineHeight || 1.1).toFixed(1)})</label>
                        </div>
                        <input 
                          type="range" 
                          min="0.8" 
                          max="2.5" 
                          step="0.1"
                          value={selectedElement.lineHeight || 1.1}
                          onChange={(e) => updateElement({ ...selectedElement, lineHeight: Number(e.target.value) })}
                          className="w-full accent-amber-500 cursor-ew-resize"
                        />
                      </div>

                      {/* Glow / Shadow Effects */}
                      <div className="space-y-2 border-t border-slate-100 pt-2.5">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-wider text-[10px] block">Shadow & Glow Effect</label>
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <label className="text-[9px] font-bold text-slate-500 uppercase block">Shadow Color</label>
                            <input 
                              type="color" 
                              value={selectedElement.shadowColor || '#000000'}
                              onChange={(e) => updateElement({ ...selectedElement, shadowColor: e.target.value })}
                              className="w-10 h-7 rounded border cursor-pointer p-0.5 bg-white"
                            />
                          </div>
                          <div className="flex-1">
                            <label className="text-[9px] font-bold text-slate-500 uppercase block">Opacity ({(selectedElement.shadowOpacity ?? 0.5).toFixed(1)})</label>
                            <input 
                              type="range" 
                              min="0" 
                              max="1" 
                              step="0.1"
                              value={selectedElement.shadowOpacity ?? 0.5}
                              onChange={(e) => updateElement({ ...selectedElement, shadowOpacity: Number(e.target.value) })}
                              className="w-full accent-amber-500 cursor-ew-resize"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-slate-500 uppercase block">Blur Radius ({selectedElement.shadowBlur || 0})</label>
                          <input 
                            type="range" 
                            min="0" 
                            max="30" 
                            value={selectedElement.shadowBlur || 0}
                            onChange={(e) => updateElement({ ...selectedElement, shadowBlur: Number(e.target.value) })}
                            className="w-full accent-amber-500 cursor-ew-resize"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[9px] font-bold text-slate-500 uppercase block">Offset X ({selectedElement.shadowOffsetX || 0})</label>
                            <input 
                              type="range" 
                              min="-15" 
                              max="15" 
                              value={selectedElement.shadowOffsetX || 0}
                              onChange={(e) => updateElement({ ...selectedElement, shadowOffsetX: Number(e.target.value) })}
                              className="w-full accent-amber-500 cursor-ew-resize"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-bold text-slate-500 uppercase block">Offset Y ({selectedElement.shadowOffsetY || 0})</label>
                            <input 
                              type="range" 
                              min="-15" 
                              max="15" 
                              value={selectedElement.shadowOffsetY || 0}
                              onChange={(e) => updateElement({ ...selectedElement, shadowOffsetY: Number(e.target.value) })}
                              className="w-full accent-amber-500 cursor-ew-resize"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {(selectedElement.type === 'rect' || selectedElement.type === 'circle' || selectedElement.type === 'star') && (
                    <div className="space-y-3">
                      
                      {selectedElement.type === 'rect' && (
                        <div>
                          <label className="text-xs font-bold text-slate-600 block mb-1">Corner Rounding ({selectedElement.cornerRadius || 0})</label>
                          <input 
                            type="range" 
                            min="0" 
                            max="50" 
                            value={selectedElement.cornerRadius || 0}
                            onChange={(e) => updateElement({ ...selectedElement, cornerRadius: Number(e.target.value) })}
                            className="w-full accent-amber-500 cursor-ew-resize"
                          />
                        </div>
                      )}

                      {selectedElement.type === 'star' && (
                        <div className="space-y-2 bg-slate-100 p-2.5 rounded-xl border border-slate-200">
                          <div>
                            <label className="text-[9px] font-black text-slate-500 block uppercase">Points Count ({selectedElement.numPoints || 5})</label>
                            <input 
                              type="range" 
                              min="3" 
                              max="15" 
                              value={selectedElement.numPoints || 5}
                              onChange={(e) => updateElement({ ...selectedElement, numPoints: Number(e.target.value) })}
                              className="w-full accent-amber-500 cursor-ew-resize"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-black text-slate-500 block uppercase">Inner Radius ({selectedElement.innerRadius || 20})</label>
                            <input 
                              type="range" 
                              min="5" 
                              max="100" 
                              value={selectedElement.innerRadius || 20}
                              onChange={(e) => updateElement({ ...selectedElement, innerRadius: Number(e.target.value) })}
                              className="w-full accent-amber-500 cursor-ew-resize"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-black text-slate-500 block uppercase">Outer Radius ({selectedElement.outerRadius || 40})</label>
                            <input 
                              type="range" 
                              min="10" 
                              max="200" 
                              value={selectedElement.outerRadius || 40}
                              onChange={(e) => updateElement({ ...selectedElement, outerRadius: Number(e.target.value) })}
                              className="w-full accent-amber-500 cursor-ew-resize"
                            />
                          </div>
                        </div>
                      )}

                      {/* Fill Mode Solid / Gradient */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-xs font-bold text-slate-600">Fill Background</label>
                          <div className="flex bg-slate-200/80 p-0.5 rounded-lg border border-slate-300/40 text-[9px] font-black uppercase">
                            <button 
                              onClick={() => updateElement({ ...selectedElement, fillType: 'solid' })}
                              className={`px-2 py-0.5 rounded-md transition-all ${selectedElement.fillType !== 'gradient' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}
                            >
                              Solid
                            </button>
                            <button 
                              onClick={() => updateElement({ ...selectedElement, fillType: 'gradient' })}
                              className={`px-2 py-0.5 rounded-md transition-all ${selectedElement.fillType === 'gradient' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}
                            >
                              Gradient
                            </button>
                          </div>
                        </div>

                        {selectedElement.fillType !== 'gradient' ? (
                          <div className="flex gap-2 items-center">
                            <input 
                              type="color" 
                              value={selectedElement.fill}
                              onChange={(e) => updateElement({ ...selectedElement, fill: e.target.value })}
                              className="w-9 h-9 rounded-lg border cursor-pointer p-0.5 bg-white shadow-sm"
                            />
                            <span className="text-xs font-black text-slate-400 uppercase">{selectedElement.fill}</span>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2 border border-slate-200 rounded-xl">
                            <div>
                              <label className="text-[9px] font-bold text-slate-400 block mb-0.5 uppercase">Color 1</label>
                              <div className="flex gap-1.5 items-center">
                                <input 
                                  type="color" 
                                  value={selectedElement.fillGradientStartColor || '#FFFFFF'}
                                  onChange={(e) => updateElement({ ...selectedElement, fillGradientStartColor: e.target.value })}
                                  className="w-7 h-7 rounded border cursor-pointer p-0.5 bg-white"
                                />
                                <span className="text-[9px] font-bold text-slate-400 uppercase truncate">{selectedElement.fillGradientStartColor || '#FFF'}</span>
                              </div>
                            </div>
                            <div>
                              <label className="text-[9px] font-bold text-slate-400 block mb-0.5 uppercase">Color 2</label>
                              <div className="flex gap-1.5 items-center">
                                <input 
                                  type="color" 
                                  value={selectedElement.fillGradientEndColor || '#000000'}
                                  onChange={(e) => updateElement({ ...selectedElement, fillGradientEndColor: e.target.value })}
                                  className="w-7 h-7 rounded border cursor-pointer p-0.5 bg-white"
                                />
                                <span className="text-[9px] font-bold text-slate-400 uppercase truncate">{selectedElement.fillGradientEndColor || '#000'}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Stroke & Stroke Width */}
                      <div className="flex gap-2 pt-1 border-t border-slate-100">
                        <div className="flex-1">
                          <label className="text-xs font-bold text-slate-600 block mb-1">Border Color</label>
                          <div className="flex gap-1.5 items-center">
                            <input 
                              type="color" 
                              value={selectedElement.stroke || '#FFFFFF'}
                              onChange={(e) => updateElement({ ...selectedElement, stroke: e.target.value })}
                              className="w-9 h-9 rounded-lg border cursor-pointer p-0.5 bg-white"
                            />
                            <span className="text-[10px] font-bold text-slate-400 uppercase">{selectedElement.stroke || '#FFFFFF'}</span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <label className="text-xs font-bold text-slate-600 block mb-1">Thickness ({selectedElement.strokeWidth || 0})</label>
                          <input 
                            type="range" 
                            min="0" 
                            max="20" 
                            value={selectedElement.strokeWidth || 0}
                            onChange={(e) => updateElement({ ...selectedElement, strokeWidth: Number(e.target.value) })}
                            className="w-full accent-amber-500 cursor-ew-resize mt-2"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-600 block mb-1">Opacity ({Math.round((selectedElement.opacity ?? 1) * 100)}%)</label>
                        <input 
                          type="range" 
                          min="0" 
                          max="1" 
                          step="0.05"
                          value={selectedElement.opacity ?? 1}
                          onChange={(e) => updateElement({ ...selectedElement, opacity: Number(e.target.value) })}
                          className="w-full accent-amber-500 cursor-ew-resize"
                        />
                      </div>
                    </div>
                  )}

                  {selectedElement.type === 'line' && (
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <label className="text-xs font-bold text-slate-600 block mb-1">Line Color</label>
                          <div className="flex gap-1.5 items-center">
                            <input 
                              type="color" 
                              value={selectedElement.stroke || '#FFFFFF'}
                              onChange={(e) => updateElement({ ...selectedElement, stroke: e.target.value })}
                              className="w-9 h-9 rounded-lg border cursor-pointer p-0.5 bg-white shadow-sm"
                            />
                            <span className="text-xs font-black text-slate-400 uppercase">{selectedElement.stroke}</span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <label className="text-xs font-bold text-slate-600 block mb-1">Dashed Line</label>
                          <button 
                            onClick={() => updateElement({ ...selectedElement, dashEnabled: !selectedElement.dashEnabled })}
                            className={`w-full py-2 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all ${
                              selectedElement.dashEnabled ? 'bg-slate-900 border-slate-900 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-500'
                            }`}
                          >
                            {selectedElement.dashEnabled ? 'Enabled' : 'Disabled'}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-600 block mb-1">Line Thickness ({selectedElement.strokeWidth || 4})</label>
                        <input 
                          type="range" 
                          min="1" 
                          max="30" 
                          value={selectedElement.strokeWidth || 4}
                          onChange={(e) => updateElement({ ...selectedElement, strokeWidth: Number(e.target.value) })}
                          className="w-full accent-amber-500 cursor-ew-resize"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-600 block mb-1">Opacity ({Math.round((selectedElement.opacity ?? 1) * 100)}%)</label>
                        <input 
                          type="range" 
                          min="0" 
                          max="1" 
                          step="0.05"
                          value={selectedElement.opacity ?? 1}
                          onChange={(e) => updateElement({ ...selectedElement, opacity: Number(e.target.value) })}
                          className="w-full accent-amber-500 cursor-ew-resize"
                        />
                      </div>
                    </div>
                  )}

                  {selectedElement.type === 'clipart' && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-bold text-slate-600 block mb-1">Layer Opacity ({Math.round((selectedElement.opacity ?? 1) * 100)}%)</label>
                        <input 
                          type="range" 
                          min="0" 
                          max="1" 
                          step="0.05"
                          value={selectedElement.opacity ?? 1}
                          onChange={(e) => updateElement({ ...selectedElement, opacity: Number(e.target.value) })}
                          className="w-full accent-amber-500 cursor-ew-resize"
                        />
                      </div>
                    </div>
                  )}

                  {/* Z-Index Arrangements */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <label className="text-xs font-bold text-slate-600 block">Z-Index Layers</label>
                    <div className="flex gap-2">
                      <button 
                        onClick={moveBackward}
                        className="flex-1 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-[10px] font-black text-slate-600 flex items-center justify-center gap-1"
                      >
                        <ChevronDown className="w-3.5 h-3.5"/> Backward
                      </button>
                      <button 
                        onClick={moveForward}
                        className="flex-1 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-[10px] font-black text-slate-600 flex items-center justify-center gap-1"
                      >
                        <ChevronUp className="w-3.5 h-3.5"/> Forward
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button 
                      onClick={deleteSelected}
                      className="flex-1 px-4 py-2.5 bg-red-50 text-red-600 text-xs font-black rounded-xl border border-red-100 hover:bg-red-100 flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Trash2 className="w-4 h-4"/> Delete Layer
                    </button>
                  </div>

                </div>
              )}

            </div>

            {/* KONVA CANVAS DESK */}
            <div className="flex-1 bg-slate-200/50 flex flex-col items-center justify-center p-8 relative overflow-hidden shadow-inner">
              
              {/* Spine helper notification */}
              <div className="absolute top-4 bg-slate-950/80 px-4 py-2 rounded-full border border-slate-800 text-[10px] font-black uppercase text-amber-400 tracking-widest shadow-md z-15">
                Trim: {trimSize.w}" x {trimSize.h}" | Spine Width: {spineWidth.toFixed(3)}"
              </div>

              <div className="relative shadow-[0_15px_50px_rgba(0,0,0,0.15)] bg-white rounded-sm ring-1 ring-slate-300 overflow-hidden cursor-default">
                <Stage 
                  width={CANVAS_WIDTH} 
                  height={CANVAS_HEIGHT} 
                  ref={stageRef} 
                  onMouseDown={(e) => { 
                    if(e.target === e.target.getStage() || e.target.name() === 'background') {
                      setActiveElementId(null); 
                    }
                  }} 
                  style={{ width: '100%', height: '100%', maxWidth: '800px', maxHeight: `${800 * (CANVAS_HEIGHT/CANVAS_WIDTH)}px` }}
                >
                  <Layer>
                    {/* Back Cover solid/gradient */}
                    <Rect 
                      name="background" 
                      x={0} 
                      y={0} 
                      width={CANVAS_WIDTH/2 - spineWidthPx/2} 
                      height={CANVAS_HEIGHT} 
                      fill={backCoverType === 'gradient' ? undefined : backCoverColor}
                      fillLinearGradientStartPoint={{ x: 0, y: 0 }}
                      fillLinearGradientEndPoint={{ x: CANVAS_WIDTH/2 - spineWidthPx/2, y: CANVAS_HEIGHT }}
                      fillLinearGradientColorStops={backCoverType === 'gradient' ? [0, backCoverGradientStart, 1, backCoverGradientEnd] : undefined}
                    />
                    {/* Spine Cover solid/gradient */}
                    <Rect 
                      name="background" 
                      x={CANVAS_WIDTH/2 - spineWidthPx/2} 
                      y={0} 
                      width={spineWidthPx} 
                      height={CANVAS_HEIGHT} 
                      fill={backCoverType === 'gradient' ? undefined : backCoverColor}
                      fillLinearGradientStartPoint={{ x: 0, y: 0 }}
                      fillLinearGradientEndPoint={{ x: spineWidthPx, y: CANVAS_HEIGHT }}
                      fillLinearGradientColorStops={backCoverType === 'gradient' ? [0, backCoverGradientStart, 1, backCoverGradientEnd] : undefined}
                    />
                    {/* Front Cover solid/gradient */}
                    <Rect 
                      name="background" 
                      x={CANVAS_WIDTH/2 + spineWidthPx/2} 
                      y={0} 
                      width={CANVAS_WIDTH/2 - spineWidthPx/2} 
                      height={CANVAS_HEIGHT} 
                      fill={frontCoverType === 'gradient' ? undefined : frontCoverColor}
                      fillLinearGradientStartPoint={{ x: 0, y: 0 }}
                      fillLinearGradientEndPoint={{ x: CANVAS_WIDTH/2 - spineWidthPx/2, y: CANVAS_HEIGHT }}
                      fillLinearGradientColorStops={frontCoverType === 'gradient' ? [0, frontCoverGradientStart, 1, frontCoverGradientEnd] : undefined}
                    />

                    {/* KDP Template bleed/gutter border lines guides */}
                    {showKdpGuides && (
                      <>
                        {/* Trim area margin */}
                        <Rect x={bleedPx} y={bleedPx} width={CANVAS_WIDTH - bleedPx*2} height={CANVAS_HEIGHT - bleedPx*2} stroke="#3B82F6" strokeWidth={1} dash={[6, 6]} listening={false} />
                        {/* Spine boundaries highlight */}
                        <Rect x={CANVAS_WIDTH/2 - spineWidthPx/2} y={0} width={spineWidthPx} height={CANVAS_HEIGHT} fill="rgba(244, 63, 94, 0.15)" stroke="#F43F5E" strokeWidth={1} listening={false} />
                      </>
                    )}

                    {/* Render Canvas Elements */}
                    {coverElements.map((el) => {
                      const isSelected = activeElementId === el.id;
                      const dragBounds = snapToGrid ? (pos: any) => {
                        return {
                          x: Math.round(pos.x / 15) * 15,
                          y: Math.round(pos.y / 15) * 15
                        };
                      } : undefined;
                      
                      if (el.type === 'text') {
                        return (
                          <KonvaText 
                            key={el.id} 
                            id={el.id} 
                            name={el.name} 
                            text={el.text} 
                            x={el.x} 
                            y={el.y} 
                            fontSize={el.fontSize} 
                            fill={el.fill} 
                            fontFamily={el.fontFamily} 
                            fontStyle={el.fontStyle || 'normal'}
                            align={el.align || 'center'}
                            letterSpacing={el.letterSpacing || 0}
                            lineHeight={el.lineHeight || 1.1}
                            shadowColor={el.shadowColor}
                            shadowBlur={el.shadowBlur}
                            shadowOffset={el.shadowBlur > 0 ? { x: el.shadowOffsetX || 0, y: el.shadowOffsetY || 0 } : undefined}
                            shadowOpacity={el.shadowOpacity}
                            scaleX={el.scaleX || 1}
                            scaleY={el.scaleY || 1}
                            rotation={el.rotation || 0}
                            opacity={el.opacity ?? 1}
                            draggable={isSelected} 
                            dragBoundFunc={dragBounds}
                            onClick={() => setActiveElementId(el.id)} 
                            onTap={() => setActiveElementId(el.id)} 
                            onDragEnd={(e) => updateElement({...el, x: e.target.x(), y: e.target.y()})}
                            onTransformEnd={(e) => {
                              const node = e.target;
                              let newX = node.x();
                              let newY = node.y();
                              if (snapToGrid) {
                                newX = Math.round(newX / 15) * 15;
                                newY = Math.round(newY / 15) * 15;
                                node.x(newX);
                                node.y(newY);
                              }
                              updateElement({
                                ...el,
                                x: newX,
                                y: newY,
                                scaleX: node.scaleX(),
                                scaleY: node.scaleY(),
                                rotation: node.rotation()
                              });
                            }}
                          />
                        );
                      }

                      if (el.type === 'rect') {
                        return (
                          <Rect 
                            key={el.id} 
                            id={el.id} 
                            name={el.name} 
                            x={el.x} 
                            y={el.y} 
                            width={el.width} 
                            height={el.height} 
                            fill={el.fillType === 'gradient' ? undefined : el.fill}
                            fillLinearGradientStartPoint={{ x: 0, y: 0 }}
                            fillLinearGradientEndPoint={{ x: el.width || 100, y: el.height || 100 }}
                            fillLinearGradientColorStops={el.fillType === 'gradient' ? [0, el.fillGradientStartColor || '#FFFFFF', 1, el.fillGradientEndColor || '#000000'] : undefined}
                            stroke={el.stroke} 
                            strokeWidth={el.strokeWidth || 0}
                            cornerRadius={el.cornerRadius || 0}
                            scaleX={el.scaleX || 1}
                            scaleY={el.scaleY || 1}
                            rotation={el.rotation || 0}
                            opacity={el.opacity ?? 1}
                            draggable={isSelected} 
                            dragBoundFunc={dragBounds}
                            onClick={() => setActiveElementId(el.id)} 
                            onTap={() => setActiveElementId(el.id)} 
                            onDragEnd={(e) => updateElement({...el, x: e.target.x(), y: e.target.y()})}
                            onTransformEnd={(e) => {
                              const node = e.target;
                              let newX = node.x();
                              let newY = node.y();
                              if (snapToGrid) {
                                newX = Math.round(newX / 15) * 15;
                                newY = Math.round(newY / 15) * 15;
                                node.x(newX);
                                node.y(newY);
                              }
                              updateElement({
                                ...el,
                                x: newX,
                                y: newY,
                                scaleX: node.scaleX(),
                                scaleY: node.scaleY(),
                                rotation: node.rotation()
                              });
                            }}
                          />
                        );
                      }

                      if (el.type === 'circle') {
                        return (
                          <KonvaCircle 
                            key={el.id} 
                            id={el.id} 
                            name={el.name} 
                            x={el.x} 
                            y={el.y} 
                            radius={el.radius || 40} 
                            fill={el.fillType === 'gradient' ? undefined : el.fill}
                            fillLinearGradientStartPoint={{ x: -(el.radius || 40), y: -(el.radius || 40) }}
                            fillLinearGradientEndPoint={{ x: el.radius || 40, y: el.radius || 40 }}
                            fillLinearGradientColorStops={el.fillType === 'gradient' ? [0, el.fillGradientStartColor || '#FFFFFF', 1, el.fillGradientEndColor || '#000000'] : undefined}
                            stroke={el.stroke} 
                            strokeWidth={el.strokeWidth || 0}
                            scaleX={el.scaleX || 1}
                            scaleY={el.scaleY || 1}
                            rotation={el.rotation || 0}
                            opacity={el.opacity ?? 1}
                            draggable={isSelected} 
                            dragBoundFunc={dragBounds}
                            onClick={() => setActiveElementId(el.id)} 
                            onTap={() => setActiveElementId(el.id)} 
                            onDragEnd={(e) => updateElement({...el, x: e.target.x(), y: e.target.y()})}
                            onTransformEnd={(e) => {
                              const node = e.target;
                              let newX = node.x();
                              let newY = node.y();
                              if (snapToGrid) {
                                newX = Math.round(newX / 15) * 15;
                                newY = Math.round(newY / 15) * 15;
                                node.x(newX);
                                node.y(newY);
                              }
                              updateElement({
                                ...el,
                                x: newX,
                                y: newY,
                                scaleX: node.scaleX(),
                                scaleY: node.scaleY(),
                                rotation: node.rotation()
                              });
                            }}
                          />
                        );
                      }

                      if (el.type === 'star') {
                        return (
                          <KonvaStar 
                            key={el.id} 
                            id={el.id} 
                            name={el.name} 
                            x={el.x} 
                            y={el.y} 
                            numPoints={el.numPoints || 5}
                            innerRadius={el.innerRadius || 20}
                            outerRadius={el.outerRadius || 40}
                            fill={el.fillType === 'gradient' ? undefined : el.fill}
                            fillLinearGradientStartPoint={{ x: -(el.outerRadius || 40), y: -(el.outerRadius || 40) }}
                            fillLinearGradientEndPoint={{ x: el.outerRadius || 40, y: el.outerRadius || 40 }}
                            fillLinearGradientColorStops={el.fillType === 'gradient' ? [0, el.fillGradientStartColor || '#FFFFFF', 1, el.fillGradientEndColor || '#000000'] : undefined}
                            stroke={el.stroke} 
                            strokeWidth={el.strokeWidth || 0}
                            scaleX={el.scaleX || 1}
                            scaleY={el.scaleY || 1}
                            rotation={el.rotation || 0}
                            opacity={el.opacity ?? 1}
                            draggable={isSelected} 
                            dragBoundFunc={dragBounds}
                            onClick={() => setActiveElementId(el.id)} 
                            onTap={() => setActiveElementId(el.id)} 
                            onDragEnd={(e) => updateElement({...el, x: e.target.x(), y: e.target.y()})}
                            onTransformEnd={(e) => {
                              const node = e.target;
                              let newX = node.x();
                              let newY = node.y();
                              if (snapToGrid) {
                                newX = Math.round(newX / 15) * 15;
                                newY = Math.round(newY / 15) * 15;
                                node.x(newX);
                                node.y(newY);
                              }
                              updateElement({
                                ...el,
                                x: newX,
                                y: newY,
                                scaleX: node.scaleX(),
                                scaleY: node.scaleY(),
                                rotation: node.rotation()
                              });
                            }}
                          />
                        );
                      }

                      if (el.type === 'line') {
                        return (
                          <KonvaLine 
                            key={el.id} 
                            id={el.id} 
                            name={el.name} 
                            x={el.x} 
                            y={el.y} 
                            points={el.points || [0, 0, 100, 0]}
                            stroke={el.stroke || '#FFFFFF'} 
                            strokeWidth={el.strokeWidth || 4}
                            dash={el.dashEnabled ? [10, 10] : undefined}
                            scaleX={el.scaleX || 1}
                            scaleY={el.scaleY || 1}
                            rotation={el.rotation || 0}
                            opacity={el.opacity ?? 1}
                            draggable={isSelected} 
                            dragBoundFunc={dragBounds}
                            onClick={() => setActiveElementId(el.id)} 
                            onTap={() => setActiveElementId(el.id)} 
                            onDragEnd={(e) => updateElement({...el, x: e.target.x(), y: e.target.y()})}
                            onTransformEnd={(e) => {
                              const node = e.target;
                              let newX = node.x();
                              let newY = node.y();
                              if (snapToGrid) {
                                newX = Math.round(newX / 15) * 15;
                                newY = Math.round(newY / 15) * 15;
                                node.x(newX);
                                node.y(newY);
                              }
                              updateElement({
                                ...el,
                                x: newX,
                                y: newY,
                                scaleX: node.scaleX(),
                                scaleY: node.scaleY(),
                                rotation: node.rotation()
                              });
                            }}
                          />
                        );
                      }

                      if (el.type === 'clipart') {
                        return (
                          <URLImage 
                            key={el.id} 
                            imageInfo={el} 
                            isSelected={isSelected} 
                            onSelect={() => setActiveElementId(el.id)} 
                            onChange={(newAttrs: any) => {
                              if (snapToGrid) {
                                newAttrs.x = Math.round(newAttrs.x / 15) * 15;
                                newAttrs.y = Math.round(newAttrs.y / 15) * 15;
                              }
                              updateElement(newAttrs);
                            }} 
                          />
                        );
                      }

                      return null;
                    })}

                    {/* Resize handles box */}
                    {activeElementId && <Transformer ref={trRef} keepRatio={false} />}
                  </Layer>
                </Stage>
              </div>

              {/* Instructions Bar */}
              <div className="mt-4 flex gap-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white py-2 px-6 rounded-full border border-slate-200 shadow-sm">
                <span>Left: Back Cover</span>
                <span className="text-amber-500">Center: Spine</span>
                <span>Right: Front Cover</span>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}