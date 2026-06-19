"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Download, Grid3x3, Settings, Loader2, Palette, Type, LayoutTemplate, MousePointer2, Plus, Image as ImageIcon, ArrowUpToLine, ArrowDownToLine, Square, Circle, Layers, Box, Sparkles, Shapes, Save, Copy, Pencil, Eraser, Undo2, Redo2 } from "lucide-react";
import { jsPDF } from "jspdf";
import { Stage, Layer, Rect, Circle as KonvaCircle, Text as KonvaText, Image as KonvaImage, Transformer, Line } from 'react-konva';
import useImage from 'use-image';

// Import our BookBuilder component!
import BookBuilder from "@/components/BookBuilder";

const TRIM_SIZES = [
    { label: '8.5" x 11" (Letter)', w: 8.5, h: 11 },
    { label: '6" x 9" (Novel)', w: 6, h: 9 }
];

const URLImage = ({ imageInfo, isSelected, onSelect, onChange }: any) => {
    const [img] = useImage(imageInfo.src, 'anonymous');
    return (
        <KonvaImage
            image={img} id={imageInfo.id} name={imageInfo.name} x={imageInfo.x} y={imageInfo.y}
            width={imageInfo.width} height={imageInfo.height} rotation={imageInfo.rotation || 0}
            scaleX={imageInfo.scaleX || 1} scaleY={imageInfo.scaleY || 1} draggable={isSelected}
            onClick={onSelect} onTap={onSelect}
            onDragEnd={(e) => onChange({ ...imageInfo, x: e.target.x(), y: e.target.y() })}
            onTransformEnd={(e) => {
                const node = e.target;
                onChange({ ...imageInfo, x: node.x(), y: node.y(), scaleX: node.scaleX(), scaleY: node.scaleY(), rotation: node.rotation() });
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

    // Cover Studio States
    const stageRef = useRef<any>(null);
    const trRef = useRef<any>(null);
    
    const [backCoverColor, setBackCoverColor] = useState('#0F172A'); 
    const [frontCoverColor, setFrontCoverColor] = useState('#1E293B'); 
    const [coverElements, setCoverElements] = useState<any[]>([]);
    const [activeElementId, setActiveElementId] = useState<string | null>(null);
    const [showKdpGuides, setShowKdpGuides] = useState(true);
    const [activeToolTab, setActiveToolTab] = useState<'elements' | 'graphics' | 'ai' | 'layers' | 'settings' | 'gallery'>('elements');

    const [toolMode, setToolMode] = useState<'select' | 'pencil' | 'eraser'>('select');
    const [history, setHistory] = useState<any[][]>([[]]);
    const [historyStep, setHistoryStep] = useState(0);

    // Cover Math
    const totalPuzzles = 100;
    const spineWidth = (totalPuzzles * 2) * 0.002252; 
    const bleed = 0.125;
    const coverTotalWidthInches = (trimSize.w * 2) + spineWidth + (bleed * 2);
    const coverTotalHeightInches = trimSize.h + (bleed * 2);
    const CANVAS_WIDTH = 800;
    const CANVAS_HEIGHT = CANVAS_WIDTH * (coverTotalHeightInches / coverTotalWidthInches);
    const centerFrontX = CANVAS_WIDTH * 0.75;
    const centerY = CANVAS_HEIGHT / 2;
    const spineWidthPx = (spineWidth / coverTotalWidthInches) * CANVAS_WIDTH;
    const bleedPx = (bleed / coverTotalWidthInches) * CANVAS_WIDTH;

    useEffect(() => {
        if (activeElementId && trRef.current && toolMode === 'select') {
            const node = trRef.current.getStage().findOne('#' + activeElementId);
            if (node) { trRef.current.nodes([node]); trRef.current.getLayer().batchDraw(); }
        } else if (trRef.current) {
            trRef.current.nodes([]);
        }
    }, [activeElementId, coverElements, toolMode]);

    const saveToHistory = (newElements: any[]) => {
        const newHist = history.slice(0, historyStep + 1);
        newHist.push(newElements);
        setHistory(newHist); setHistoryStep(newHist.length - 1);
        setCoverElements(newElements);
    };

    const updateElement = (newAttrs: any) => {
        const newEls = coverElements.map(el => el.id === newAttrs.id ? newAttrs : el);
        setCoverElements(newEls); saveToHistory(newEls);
    };

    const addNewText = () => { const id = `t-${Date.now()}`; saveToHistory([...coverElements, { id, type: 'text', text: 'NEW TITLE', x: centerFrontX, y: centerY, fontSize: 40, fill: '#FFFFFF', fontWeight: 'bold', fontFamily: 'Arial', name: 'Text' }]); setActiveElementId(id); setToolMode('select'); };

    const handleGenerateCover = async () => {
        if (!stageRef.current) return;
        setIsGenerating(true);
        setShowKdpGuides(false); setActiveElementId(null);
        
        setTimeout(() => {
            const dataURL = stageRef.current.toDataURL({ pixelRatio: 3 });
            const doc = new jsPDF({ orientation: "landscape", unit: "in", format: [coverTotalWidthInches, coverTotalHeightInches] });
            doc.addImage(dataURL, 'PNG', 0, 0, coverTotalWidthInches, coverTotalHeightInches);
            doc.save(`KDP_Cover_${trimSize.w}x${trimSize.h}.pdf`);
            setShowKdpGuides(true); setIsGenerating(false);
        }, 500);
    };

    if (!isMounted) return <div className="min-h-screen flex items-center justify-center text-indigo-600"><Loader2 className="w-8 h-8 animate-spin"/></div>;

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 font-sans text-slate-900 flex flex-col overflow-hidden">
            
            {/* APP HEADER */}
            <header className="mb-6 flex justify-between items-center max-w-[1600px] mx-auto w-full">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg">AI</div>
                    <h1 className="text-2xl font-black tracking-tight">KDP Master Studio</h1>
                </div>
                
                {/* TAB SWITCHER */}
                <div className="flex bg-slate-200 p-1 rounded-full shadow-inner">
                    <button onClick={() => setActiveTab('interior')} className={`px-6 py-2 rounded-full font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'interior' ? 'bg-white shadow-md text-slate-900' : 'text-slate-500 hover:bg-slate-300/50'}`}><Grid3x3 className="w-4 h-4"/> Book Builder</button>
                    <button onClick={() => setActiveTab('cover')} className={`px-6 py-2 rounded-full font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'cover' ? 'bg-white shadow-md text-slate-900' : 'text-slate-500 hover:bg-slate-300/50'}`}><Palette className="w-4 h-4"/> Cover Studio</button>
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
                    <div className="flex h-[calc(100vh-140px)] rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm animate-in fade-in duration-500">
                        {/* Toolbar Left */}
                        <div className="w-16 bg-slate-900 flex flex-col items-center py-4 gap-4 border-r border-slate-800 z-20 text-slate-400">
                            <button onClick={() => setActiveToolTab('elements')} className={`p-3 rounded-xl transition-all ${activeToolTab === 'elements' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'}`}><Plus className="w-5 h-5"/></button>
                            <button onClick={() => setActiveToolTab('settings')} className={`p-3 rounded-xl transition-all ${activeToolTab === 'settings' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'}`}><Settings className="w-5 h-5"/></button>
                            <div className="mt-auto flex flex-col gap-4 border-t border-slate-800 pt-4 w-full px-2">
                                <button onClick={() => setShowKdpGuides(!showKdpGuides)} className={`p-3 mx-auto rounded-xl transition-all ${showKdpGuides ? 'text-pink-400 bg-pink-900/30' : 'text-slate-400'}`}><LayoutTemplate className="w-5 h-5"/></button>
                                <button onClick={handleGenerateCover} disabled={isGenerating} className="p-3 mx-auto rounded-xl bg-indigo-600 text-white hover:bg-indigo-500">{isGenerating ? <Loader2 className="w-5 h-5 animate-spin"/> : <Download className="w-5 h-5"/>}</button>
                            </div>
                        </div>

                        {/* Menu Panel */}
                        <div className="w-64 bg-slate-50 border-r border-slate-200 flex flex-col p-4 z-10 overflow-y-auto">
                            {activeToolTab === 'elements' && (
                                <div className="space-y-4 animate-in slide-in-from-left-4">
                                    <h3 className="font-bold text-[10px] uppercase tracking-widest text-slate-400">Elements</h3>
                                    <button onClick={addNewText} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm font-bold flex items-center gap-2 hover:border-indigo-500"><Type className="w-4 h-4"/> Heading Text</button>
                                </div>
                            )}
                            {activeToolTab === 'settings' && (
                                <div className="space-y-4 animate-in slide-in-from-left-4">
                                    <h3 className="font-bold text-[10px] uppercase tracking-widest text-slate-400">Canvas Base</h3>
                                    <div><label className="text-xs font-bold text-slate-600 block mb-1">Back Cover & Spine</label><input type="color" value={backCoverColor} onChange={(e) => setBackCoverColor(e.target.value)} className="w-full h-10 rounded-lg cursor-pointer border-0 p-1 bg-white shadow-sm ring-1 ring-slate-200" /></div>
                                    <div><label className="text-xs font-bold text-slate-600 block mb-1">Front Cover</label><input type="color" value={frontCoverColor} onChange={(e) => setFrontCoverColor(e.target.value)} className="w-full h-10 rounded-lg cursor-pointer border-0 p-1 bg-white shadow-sm ring-1 ring-slate-200" /></div>
                                </div>
                            )}
                            {/* Properties editor */}
                            {activeElementId && (
                                <div className="mt-auto pt-5 border-t border-slate-200 animate-in slide-in-from-bottom-2">
                                    <h3 className="font-bold text-[10px] uppercase tracking-widest text-slate-400 mb-3 flex items-center justify-between">Properties</h3>
                                    <button onClick={() => { saveToHistory(coverElements.filter(e => e.id !== activeElementId)); setActiveElementId(null); }} className="w-full px-4 py-2 bg-red-50 text-red-600 text-xs font-bold rounded-lg border border-red-100 hover:bg-red-100">Delete Selected</button>
                                </div>
                            )}
                        </div>

                        {/* KONVA CANVAS */}
                        <div className="flex-1 bg-slate-200/50 flex items-center justify-center p-8 relative overflow-hidden shadow-inner">
                            <div className="relative shadow-[0_10px_40px_rgba(0,0,0,0.15)] bg-white rounded-sm ring-1 ring-slate-300 overflow-hidden cursor-default">
                                <Stage width={CANVAS_WIDTH} height={CANVAS_HEIGHT} ref={stageRef} onMouseDown={(e) => { if(e.target === e.target.getStage() || e.target.name() === 'background') setActiveElementId(null); }} style={{ width: '100%', height: '100%', maxWidth: '800px', maxHeight: `${800 * (CANVAS_HEIGHT/CANVAS_WIDTH)}px` }}>
                                    <Layer>
                                        <Rect name="background" x={0} y={0} width={CANVAS_WIDTH/2 - spineWidthPx/2} height={CANVAS_HEIGHT} fill={backCoverColor} />
                                        <Rect name="background" x={CANVAS_WIDTH/2 - spineWidthPx/2} y={0} width={spineWidthPx} height={CANVAS_HEIGHT} fill={backCoverColor} />
                                        <Rect name="background" x={CANVAS_WIDTH/2 + spineWidthPx/2} y={0} width={CANVAS_WIDTH/2 - spineWidthPx/2} height={CANVAS_HEIGHT} fill={frontCoverColor} />

                                        {showKdpGuides && (
                                            <>
                                                <Rect x={bleedPx} y={bleedPx} width={CANVAS_WIDTH - bleedPx*2} height={CANVAS_HEIGHT - bleedPx*2} stroke="#3B82F6" strokeWidth={2} dash={[10, 10]} listening={false} />
                                                <Rect x={CANVAS_WIDTH/2 - spineWidthPx/2} y={0} width={spineWidthPx} height={CANVAS_HEIGHT} fill="rgba(236, 72, 153, 0.2)" stroke="#EC4899" strokeWidth={2} listening={false} />
                                            </>
                                        )}

                                        {coverElements.map((el) => {
                                            const isSelected = activeElementId === el.id;
                                            if (el.type === 'text') return <KonvaText key={el.id} id={el.id} name={el.name} text={el.text} x={el.x} y={el.y} fontSize={el.fontSize} fill={el.fill} fontFamily={el.fontFamily} fontStyle={el.fontWeight} draggable={isSelected} onClick={() => setActiveElementId(el.id)} onTap={() => setActiveElementId(el.id)} onDragEnd={(e) => updateElement({...el, x: e.target.x(), y: e.target.y()})} />;
                                            return null;
                                        })}

                                        {activeElementId && <Transformer ref={trRef} />}
                                    </Layer>
                                </Stage>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}