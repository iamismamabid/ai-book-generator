"use client";
import { useState, useRef, useEffect } from "react";
import { Search,Download, Grid3x3, Settings, Eye, EyeOff, BookOpen, Loader2, Palette, Type, LayoutTemplate, MousePointer2, Plus, Image as ImageIcon, ArrowUpToLine, ArrowDownToLine, Square, Circle, Layers, Magnet, ScanBarcode, FileText, Box, Sparkles, Shapes, Save, Copy, Pencil, Eraser, Undo2, Redo2 } from "lucide-react";
import { jsPDF } from "jspdf";
import { Stage, Layer, Rect, Circle as KonvaCircle, Text as KonvaText, Image as KonvaImage, Transformer, Line } from 'react-konva';
import useImage from 'use-image';

// ---------------------------------------------------------
// 🧠 1. The Advanced Puzzle Algorithm (INTERIOR)
// ---------------------------------------------------------
function generatePuzzleGrid(wordList: string[], size: number, textCase: string) {
    const grid = Array(size).fill(null).map(() => Array(size).fill(''));
    const mask = Array(size).fill(null).map(() => Array(size).fill(false)); 
    const directions = [[0, 1], [1, 0], [1, 1], [-1, 1]];
    const placedWords: any[] = [];
    wordList.forEach(word => {
        let placed = false; let attempts = 0;
        const targetWord = textCase === 'lowercase' ? word.toLowerCase() : word.toUpperCase();
        while (!placed && attempts < 200) { 
            const dir = directions[Math.floor(Math.random() * directions.length)];
            const minRow = dir[0] === -1 ? targetWord.length - 1 : 0; const maxRow = dir[0] === 1 ? size - targetWord.length : size - 1;
            const minCol = 0; const maxCol = dir[1] === 1 ? size - targetWord.length : size - 1;
            const row = Math.floor(Math.random() * (maxRow - minRow + 1)) + minRow;
            const col = Math.floor(Math.random() * (maxCol - minCol + 1)) + minCol;
            let canPlace = true;
            for (let i = 0; i < targetWord.length; i++) {
                const r = row + (dir[0] * i); const c = col + (dir[1] * i);
                if (r < 0 || r >= size || c < 0 || c >= size || (grid[r][c] !== '' && grid[r][c] !== targetWord[i])) { canPlace = false; break; }
            }
            if (canPlace) {
                for (let i = 0; i < targetWord.length; i++) {
                    const r = row + (dir[0] * i); const c = col + (dir[1] * i);
                    grid[r][c] = targetWord[i]; mask[r][c] = true; 
                }
                placed = true;
                placedWords.push({ text: targetWord, startR: row, startC: col, endR: row + (dir[0] * (targetWord.length - 1)), endC: col + (dir[1] * (targetWord.length - 1)) });
            }
            attempts++;
        }
    });
    const alphabet = textCase === 'lowercase' ? "abcdefghijklmnopqrstuvwxyz" : "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) if (grid[r][c] === '') grid[r][c] = alphabet[Math.floor(Math.random() * alphabet.length)]; 
    return { grid, words: placedWords, mask };
}

const TRIM_SIZES = [
    { label: '8.5" x 11" (Letter)', w: 8.5, h: 11 },
    { label: '6" x 9" (Novel)', w: 6, h: 9 },
    { label: '8" x 10" (Workbook)', w: 8, h: 10 }
];

const GRAPHICS_LIBRARY = [
    { name: "Star", svg: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iY3VycmVudENvbG9yIj48cGF0aCBkPSJNMTIgMmwyLjQgNy40aDcuOGwtNi4zIDQuNiAyLjQgNy41LTYuMy00LjUtNi4zIDQuNSAyLjQtNy41LTYuMy00LjZoNy44eiIvPjwvc3ZnPg==" },
    { name: "Badge", svg: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iY3VycmVudENvbG9yIj48cGF0aCBkPSJNMTIgMmwyLjkgMi45aDQuMnY0LjJsMi45IDIuOS0yLjkgMi45djQuMmgtNC4yTDEyIDIyTDkuMSAxOS4xSDQuOXYtNC4yTDIgMTJsMi45LTIuOVY0LjlIOS4xTDEyIDJ6Ii8+PC9zdmc+" },
    { name: "Ribbon", svg: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iY3VycmVudENvbG9yIj48cGF0aCBkPSJNMCAyaDI0djdsLTQgNGw0IDR2N0gwdi03bDQtNGwtNC00VjJ6Ii8+PC9zdmc+" },
    { name: "Hexagon", svg: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iY3VycmVudENvbG9yIj48cGF0aCBkPSJNMTIgMmwtOC41IDV2MTBsOC41IDUgOC41LTVWN2wtOC41LTV6Ii8+PC9zdmc+" }
];

// ---------------------------------------------------------
// 🎨 2. External Image Helper for Konva Engine
// ---------------------------------------------------------
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
            draggable={isSelected}
            onClick={onSelect}
            onTap={onSelect}
            onDragEnd={(e) => onChange({ ...imageInfo, x: e.target.x(), y: e.target.y() })}
            onTransformEnd={(e) => {
                const node = e.target;
                onChange({ ...imageInfo, x: node.x(), y: node.y(), scaleX: node.scaleX(), scaleY: node.scaleY(), rotation: node.rotation() });
            }}
        />
    );
};

export default function WordSearchStudio() {
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => { setIsMounted(true); }, []);

    const [activeTab, setActiveTab] = useState<'interior' | 'cover'>('cover'); 
    const [isGenerating, setIsGenerating] = useState(false);
    
    // ---------------------------------------------------------
    // 🚨 INTERIOR STATES
    // ---------------------------------------------------------
    const [trimSize, setTrimSize] = useState(TRIM_SIZES[0]);
    const [totalPuzzles, setTotalPuzzles] = useState(10); 
    const [gridSize, setGridSize] = useState(12);
    const [wordsPerPage, setWordsPerPage] = useState(15); 
    const [puzzlesPerPage, setPuzzlesPerPage] = useState(1);
    const [puzzleAlign, setPuzzleAlign] = useState<'left' | 'center' | 'right'>('center');
    const [solutionsPerPage, setSolutionsPerPage] = useState(2);
    const [solutionAlign, setSolutionAlign] = useState<'left' | 'center' | 'right'>('center');
    const [lettersFont, setLettersFont] = useState('helvetica');
    const [letterTextSize, setLetterTextSize] = useState(16);
    const [lineWidth, setLineWidth] = useState(1);
    const [cellColor, setCellColor] = useState('#FFFFFF');
    const [borderColor, setBorderColor] = useState('#CCCCCC');
    const [textCase, setTextCase] = useState('UPPERCASE');
    const [wordsSort, setWordsSort] = useState<'random' | 'alphabetical' | 'length'>('random');
    const [wordTextAlign, setWordTextAlign] = useState<'left' | 'center'>('left');
    const [wordFont, setWordFont] = useState('helvetica');
    const [wordTextSize, setWordTextSize] = useState(10);
    const [wordTextColor, setWordTextColor] = useState('#000000');
    const [solutionHighlighter, setSolutionHighlighter] = useState<'apple' | 'fill' | 'grayout'>('apple');
    const [useFirstLineAsTitle, setUseFirstLineAsTitle] = useState(false);
    const [words, setWords] = useState("NEXTJS\nREACT\nPRISMA\nTAILWIND\nCODING\nJAVASCRIPT\nTYPESCRIPT\nDATABASE\nSERVER\nVERCEL\nGITHUB\nAPI\nJSON\nNODE\nFRONTEND\nBACKEND");
    const [previewGrid, setPreviewGrid] = useState<string[][] | null>(null);
    const [answerMask, setAnswerMask] = useState<boolean[][] | null>(null);
    const [cleanWordsList, setCleanWordsList] = useState<any[]>([]); 
    const [showAnswers, setShowAnswers] = useState(false); 
    const csvInputRef = useRef<HTMLInputElement>(null);

    // ---------------------------------------------------------
    // 🚨 COVER, MOCKUP & KONVA STATES
    // ---------------------------------------------------------
    const stageRef = useRef<any>(null);
    const trRef = useRef<any>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    


    const [searchQuery, setSearchQuery] = useState("");
    const [isSearchingUnsplash, setIsSearchingUnsplash] = useState(false);
    const [unsplashImages, setUnsplashImages] = useState<any[]>([]);




    const [backCoverColor, setBackCoverColor] = useState('#0F172A'); 
    const [frontCoverColor, setFrontCoverColor] = useState('#1E293B'); 
    const [coverElements, setCoverElements] = useState<any[]>([]);
    const [activeElementId, setActiveElementId] = useState<string | null>(null);
    const [showKdpGuides, setShowKdpGuides] = useState(true);
    const [activeToolTab, setActiveToolTab] = useState<'elements' | 'graphics' | 'ai' | 'layers' | 'settings' | 'gallery'>('elements');
    const [show3DMockup, setShow3DMockup] = useState(false); 
    const [mockupImageURL, setMockupImageURL] = useState<string | null>(null);
    const [aiGenerating, setAiGenerating] = useState(false);

    // Konva Tool Engine
    const [toolMode, setToolMode] = useState<'select' | 'pencil' | 'eraser'>('select');
    const [currentPath, setCurrentPath] = useState<number[] | null>(null);
    const [history, setHistory] = useState<any[][]>([[]]);
    const [historyStep, setHistoryStep] = useState(0);

    // Cover Mathematical Dimensions for Konva Stage
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

    // ---------------------------------------------------------
    // 🧠 KONVA TRANSFORMER & HISTORY ENGINE
    // ---------------------------------------------------------
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

    const handleUndo = () => { if (historyStep > 0) { setHistoryStep(historyStep - 1); setCoverElements(history[historyStep - 1]); } };
    const handleRedo = () => { if (historyStep < history.length - 1) { setHistoryStep(historyStep + 1); setCoverElements(history[historyStep + 1]); } };

    const updateElement = (newAttrs: any) => {
        const newEls = coverElements.map(el => el.id === newAttrs.id ? newAttrs : el);
        setCoverElements(newEls); saveToHistory(newEls);
    };

    // ---------------------------------------------------------
    // 🖱️ STAGE MOUSE HANDLERS (Drawing & Selection)
    // ---------------------------------------------------------
    const handleStageMouseDown = (e: any) => {
        if (toolMode === 'pencil') {
            const pos = e.target.getStage().getPointerPosition();
            setCurrentPath([pos.x, pos.y]);
        } else if (toolMode === 'select') {
            const clickedOnEmpty = e.target === e.target.getStage() || e.target.name() === 'background';
            if (clickedOnEmpty) setActiveElementId(null);
        } else if (toolMode === 'eraser') {
            if (e.target !== e.target.getStage() && e.target.name() !== 'background') {
                saveToHistory(coverElements.filter(el => el.id !== e.target.id()));
                setActiveElementId(null);
            }
        }
    };

    const handleStageMouseMove = (e: any) => {
        if (toolMode === 'pencil' && currentPath) {
            const pos = e.target.getStage().getPointerPosition();
            setCurrentPath([...currentPath, pos.x, pos.y]);
        }
    };

    const handleStageMouseUp = () => {
        if (toolMode === 'pencil' && currentPath) {
            const id = `path-${Date.now()}`;
            saveToHistory([...coverElements, { id, type: 'path', points: currentPath, color: '#000000', strokeWidth: 5, opacity: 1, name: 'Drawing' }]);
            setCurrentPath(null);
        }
    };

    // ---------------------------------------------------------
    // 🚀 ACTIONS & TOOLS
    // ---------------------------------------------------------
    const handleDuplicate = () => {
        const activeEl = coverElements.find(e => e.id === activeElementId);
        if (activeEl) { const newEl = { ...activeEl, id: `copy-${Date.now()}`, x: activeEl.x + 20, y: activeEl.y + 20 }; saveToHistory([...coverElements, newEl]); setActiveElementId(newEl.id); setToolMode('select'); }
    };

    const addNewText = () => { const id = `t-${Date.now()}`; saveToHistory([...coverElements, { id, type: 'text', text: 'NEW TEXT', x: centerFrontX, y: centerY, fontSize: 40, fill: '#FFFFFF', fontWeight: 'bold', fontFamily: 'Arial', name: 'Text' }]); setActiveElementId(id); setToolMode('select'); };
    
    // 🚨 UPDATE: Added "rounded-rect" for Apple iOS App shape
    const addNewShape = (shapeType: 'rect' | 'circle' | 'rounded-rect') => { 
        const id = `s-${Date.now()}`; 
        saveToHistory([...coverElements, { id, type: 'shape', shapeType, x: centerFrontX, y: centerY, width: 100, height: 100, fill: '#4F46E5', name: shapeType }]); 
        setActiveElementId(id); 
        setToolMode('select'); 
    };
    
    const addGraphic = (graphic: any) => { const id = `g-${Date.now()}`; saveToHistory([...coverElements, { id, type: 'image', src: graphic.svg, x: centerFrontX, y: centerY, width: 100, height: 100, name: graphic.name }]); setActiveElementId(id); setToolMode('select'); };
    
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]; if (!file) return;
        const reader = new FileReader(); reader.onload = (event) => {
            const img = new Image(); img.src = event.target?.result as string;
            img.onload = () => { const id = `img-${Date.now()}`; saveToHistory([...coverElements, { id, type: 'image', src: img.src, x: centerFrontX, y: centerY, width: 150, height: 150 * (img.height / img.width), name: 'Upload' }]); setActiveElementId(id); setToolMode('select'); }
        }; reader.readAsDataURL(file);
    };

    // 👇 NEW: Unsplash Integration Functions 👇
    const searchUnsplash = async () => {
        if (!searchQuery) return;
        setIsSearchingUnsplash(true);
        try {
            const res = await fetch(`/api/generate/unsplash?query=${encodeURIComponent(searchQuery)}`);
            
            // যদি ৪-৪ বা অন্য এরর আসে তবে এখানেই থেমে যাবে
            if (!res.ok) {
                const errorText = await res.text();
                console.error("Server returned an error:", errorText);
                try {
                    const errData = JSON.parse(errorText);
                    alert(`Search failed: ${errData.error}. Did you restart your server after adding the .env.local file?`);
                } catch {
                    alert("An error occurred while fetching images.");
                }
                setIsSearchingUnsplash(false);
                return;
            }

            const data = await res.json();
            setUnsplashImages(data.results || []);
        } catch (error) {
            console.error("Unsplash Client Error:", error);
        }
        setIsSearchingUnsplash(false);
    };

    // Helper to add the Unsplash image to the Konva Stage
    const addUnsplashImageToCanvas = (imageUrl: string) => {
        const id = `unsplash-${Date.now()}`;
        saveToHistory([...coverElements, { 
            id, 
            type: 'image', 
            src: imageUrl, 
            x: centerFrontX, 
            y: centerY, 
            width: 200, // Default width for stock images
            height: 300, 
            name: 'Unsplash Image' 
        }]);
        setActiveElementId(id);
        setToolMode('select');
    };













    const generateAiTitles = () => {
        setAiGenerating(true);
        setTimeout(() => {
            const titles = ["Brain Boost: Ultimate Word Search", "Mindful Puzzles", "The Mega Activity Book", "Relaxing Word Search", "Brain Teasers Vol 1"];
            let newEls = [...coverElements];
            titles.forEach((t, i) => { newEls.push({ id: `ai-${Date.now()}-${i}`, type: 'text', text: t, x: centerFrontX, y: 100 + (i * 60), fontSize: 35, fill: '#FFFFFF', fontWeight: 'bold', fontFamily: 'Arial', name: 'AI Title' }); });
            saveToHistory(newEls); setToolMode('select'); setAiGenerating(false);
        }, 1500);
    };

    const saveToGallery = () => { localStorage.setItem('kdp_konva_gallery', JSON.stringify({ elements: coverElements, bgBack: backCoverColor, bgFront: frontCoverColor })); alert("Design Saved to Local Gallery!"); };
    const loadFromGallery = () => {
        const data = localStorage.getItem('kdp_konva_gallery');
        if (data) { const { elements, bgBack, bgFront } = JSON.parse(data); setCoverElements(elements); setBackCoverColor(bgBack); setFrontCoverColor(bgFront); saveToHistory(elements); alert("Design Loaded!"); } else { alert("No saved design found."); }
    };

    const moveLayer = (direction: 'up' | 'down') => {
        if (!activeElementId) return;
        const index = coverElements.findIndex(e => e.id === activeElementId);
        if (direction === 'up' && index < coverElements.length - 1) { const newArr = [...coverElements]; [newArr[index], newArr[index + 1]] = [newArr[index + 1], newArr[index]]; saveToHistory(newArr); } 
        else if (direction === 'down' && index > 0) { const newArr = [...coverElements]; [newArr[index], newArr[index - 1]] = [newArr[index - 1], newArr[index]]; saveToHistory(newArr); }
    };

    const trigger3DMockup = () => {
        if (!show3DMockup && stageRef.current) {
            setShowKdpGuides(false); setActiveElementId(null);
            setTimeout(() => {
                const dataURL = stageRef.current.toDataURL({ x: CANVAS_WIDTH/2, y: 0, width: CANVAS_WIDTH/2, height: CANVAS_HEIGHT, pixelRatio: 2 });
                setMockupImageURL(dataURL); setShowKdpGuides(true); setShow3DMockup(true);
            }, 100);
        } else { setShow3DMockup(false); }
    };

    const getCleanMasterList = () => {
        let lines = words.split('\n').map(w => w.trim()).filter(w => w.length > 2);
        let titleText = useFirstLineAsTitle && lines.length > 0 ? lines[0] : "";
        if (useFirstLineAsTitle && lines.length > 0) lines = lines.slice(1);
        return { cleanedWords: lines.map(w => w.replace(/[^a-zA-Z]/g, '')), titleText };
    };

    const handleGeneratePreview = () => {
        const { cleanedWords, titleText } = getCleanMasterList();
        if (cleanedWords.length < wordsPerPage) return alert(`Need ${wordsPerPage} words!`);
        let subset = [...cleanedWords].sort(() => 0.5 - Math.random()).slice(0, wordsPerPage);
        if (wordsSort === 'alphabetical') subset.sort((a,b) => a.localeCompare(b));
        if (wordsSort === 'length') subset.sort((a,b) => a.length - b.length || a.localeCompare(b));
        const { grid, words: cleanWords, mask } = generatePuzzleGrid(subset, gridSize, textCase);
        setPreviewGrid(grid); setCleanWordsList(cleanWords.map(cw => ({...cw, title: titleText}))); setAnswerMask(mask); setShowAnswers(false); 
    };

    // ---------------------------------------------------------
    // 🖨️ PDF GENERATORS
    // ---------------------------------------------------------
    const handleGenerateInterior = async () => {
        try {
            setIsGenerating(true);
            const { cleanedWords, titleText } = getCleanMasterList();
            if (cleanedWords.length < wordsPerPage) { alert(`Please add at least ${wordsPerPage} words!`); setIsGenerating(false); return; }
            await new Promise(resolve => setTimeout(resolve, 100)); 

            const doc = new jsPDF({ orientation: "portrait", unit: "in", format: [trimSize.w, trimSize.h] });
            const margin = 0.5; const safeWidth = trimSize.w - (margin * 2); const safeHeight = trimSize.h - (margin * 2);

            const hexToRgb = (hex: string) => { const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex); return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : { r: 0, g: 0, b: 0 }; };
            const cColor = hexToRgb(cellColor); const bColor = hexToRgb(borderColor); const wColor = hexToRgb(wordTextColor);

            const bookPuzzles = [];
            for (let i = 0; i < totalPuzzles; i++) {
                let subset = [...cleanedWords].sort(() => 0.5 - Math.random()).slice(0, wordsPerPage);
                if (wordsSort === 'alphabetical') subset.sort((a, b) => a.localeCompare(b));
                bookPuzzles.push(generatePuzzleGrid(subset, gridSize, textCase));
            }

            const getZones = (itemsPerPage: number, safeW: number, safeH: number, margin: number) => {
                if (itemsPerPage === 1) return [{ x: margin, y: margin, w: safeW, h: safeH }];
                if (itemsPerPage === 2) return [{ x: margin, y: margin, w: safeW, h: safeH/2 - 0.25 }, { x: margin, y: margin + (safeH/2) + 0.25, w: safeW, h: safeH/2 - 0.25 }];
                return [{ x: margin, y: margin, w: safeW/2 - 0.1, h: safeH/2 - 0.1 }, { x: margin + (safeW/2) + 0.1, y: margin, w: safeW/2 - 0.1, h: safeH/2 - 0.1 }, { x: margin, y: margin + (safeH/2) + 0.1, w: safeW/2 - 0.1, h: safeH/2 - 0.1 }, { x: margin + (safeW/2) + 0.1, y: margin + (safeH/2) + 0.1, w: safeW/2 - 0.1, h: safeH/2 - 0.1 }];
            };

            const puzZones = getZones(puzzlesPerPage, safeWidth, safeHeight, margin);
            const totalPuzPages = Math.ceil(totalPuzzles / puzzlesPerPage);

            for (let p = 0; p < totalPuzPages; p++) {
                if (p > 0) doc.addPage();
                for (let z = 0; z < puzzlesPerPage; z++) {
                    const puzIndex = (p * puzzlesPerPage) + z; if (puzIndex >= totalPuzzles) break;
                    const zone = puzZones[z]; const { grid, words: pageWords } = bookPuzzles[puzIndex];
                    const titleSpace = 0.4; const wordListSpace = puzzlesPerPage === 4 ? 0.8 : 1.5; const gridDrawSize = Math.min(zone.w, zone.h - titleSpace - wordListSpace); const cellSize = gridDrawSize / gridSize;

                    let startX = zone.x; if (puzzleAlign === 'center') startX = zone.x + (zone.w - gridDrawSize) / 2; if (puzzleAlign === 'right') startX = zone.x + zone.w - gridDrawSize;
                    const startY = zone.y + titleSpace;

                    doc.setFont(lettersFont, "bold"); doc.setFontSize(16); doc.setTextColor(0, 0, 0);
                    const displayTitle = useFirstLineAsTitle && titleText ? `${titleText} #${puzIndex + 1}` : `Puzzle #${puzIndex + 1}`;
                    doc.text(displayTitle, zone.x + zone.w / 2, zone.y + 0.2, { align: "center" });

                    doc.setLineWidth(lineWidth * 0.01); doc.setDrawColor(bColor.r, bColor.g, bColor.b);

                    for (let r = 0; r < gridSize; r++) {
                        for (let c = 0; c < gridSize; c++) {
                            const cellX = startX + (c * cellSize); const cellY = startY + (r * cellSize);
                            if (cellColor !== '#FFFFFF' || lineWidth > 0) { doc.setFillColor(cColor.r, cColor.g, cColor.b); doc.rect(cellX, cellY, cellSize, cellSize, lineWidth > 0 ? "FD" : "F"); }
                            doc.setFont(lettersFont, "bold"); doc.setFontSize(letterTextSize * (gridDrawSize / 6.5)); doc.setTextColor(0, 0, 0); doc.text(grid[r][c], cellX + (cellSize / 2), cellY + (cellSize / 2), { align: "center", baseline: "middle" });
                        }
                    }

                    const listTop = startY + gridDrawSize + 0.2;
                    doc.setFont(wordFont, "bold"); doc.setFontSize(wordTextSize); doc.setTextColor(wColor.r, wColor.g, wColor.b); doc.text("Words:", zone.x, listTop);
                    doc.setFont(wordFont, "normal"); const cols = puzzlesPerPage === 4 ? 2 : 4; const colW = zone.w / cols;

                    pageWords.forEach((wordObj, idx) => {
                        const c = idx % cols; const r = Math.floor(idx / cols); const xPos = zone.x + (c * colW) + (wordTextAlign === 'center' ? colW / 2 : 0); const yPos = listTop + 0.20 + (r * 0.18);
                        doc.text(wordObj.text, xPos, yPos, { align: wordTextAlign === 'center' ? 'center' : 'left' });
                    });
                }
            }

            const solZones = getZones(solutionsPerPage, safeWidth, safeHeight, margin);
            const totalSolPages = Math.ceil(totalPuzzles / solutionsPerPage);

            for (let p = 0; p < totalSolPages; p++) {
                doc.addPage();
                for (let z = 0; z < solutionsPerPage; z++) {
                    const solIndex = (p * solutionsPerPage) + z;
                    if (solIndex >= totalPuzzles) break;
                    
                    const zone = solZones[z]; const { grid, words: pageWords, mask } = bookPuzzles[solIndex];
                    const titleSpace = 0.4; const gridDrawSize = Math.min(zone.w, zone.h - titleSpace); const cellSize = gridDrawSize / gridSize;

                    let startX = zone.x;
                    if (solutionAlign === 'center') startX = zone.x + (zone.w - gridDrawSize) / 2;
                    if (solutionAlign === 'right') startX = zone.x + zone.w - gridDrawSize;
                    const startY = zone.y + titleSpace;

                    doc.setFont(lettersFont, "bold"); doc.setFontSize(16); doc.setTextColor(0, 0, 0);
                    doc.text(`Answer #${solIndex + 1}`, zone.x + zone.w / 2, zone.y + 0.2, { align: "center" });

                    if (solutionHighlighter === 'apple') {
    // 🧠 SQUIRCLE MATH (iOS iPhone Style)
    const HW = cellSize * 0.28; // Total half-width of the squircle
    const R = cellSize * 0.12;  // Corner radius (adjust for more/less roundness)
    const hw = HW - R;          // Inner rectangle half-width
    const ext =  cellSize * 0.25;         // Extension past the first/last letters

    doc.setLineWidth(R * 2);
    doc.setDrawColor(230, 234, 240); // Soft iOS Stock Gray
    doc.setFillColor(230, 234, 240); 
    doc.setLineJoin('round');

    pageWords.forEach(w => {
        // Find absolute center coordinates of start and end letters
        const sX = startX + (w.startC * cellSize) + (cellSize / 2);
        const sY = startY + (w.startR * cellSize) + (cellSize / 2);
        const eX = startX + (w.endC * cellSize) + (cellSize / 2);
        const eY = startY + (w.endR * cellSize) + (cellSize / 2);

        // Calculate Directional Vectors
        const dx = eX - sX;
        const dy = eY - sY;
        const D = Math.hypot(dx, dy) || 1; // Prevent division by zero
        const ux = dx / D;
        const uy = dy / D;
        const px = -uy;
        const py = ux;

        // Calculate the 4 corners of the inner sharp rectangle
        const p0x = sX - ux * ext + px * hw;
        const p0y = sY - uy * ext + py * hw;
        
        const p1x = eX + ux * ext + px * hw;
        const p1y = eY + uy * ext + py * hw;
        
        const p2x = eX + ux * ext - px * hw;
        const p2y = eY + uy * ext - py * hw;
        
        const p3x = sX - ux * ext - px * hw;
        const p3y = sY - uy * ext - py * hw;

        // Draw as a closed polygon path ('FD' fills the inside and strokes the rounded corners outside)
        const vectors = [
            [p1x - p0x, p1y - p0y],
            [p2x - p1x, p2y - p1y],
            [p3x - p2x, p3y - p2y]
        ];
        
        doc.lines(vectors, p0x, p0y, [1, 1], 'FD', true); 
    });
                        doc.setLineJoin('miter'); 
                    }

                    doc.setFontSize(letterTextSize * (gridDrawSize / 6.5));
                    for (let r = 0; r < gridSize; r++) {
                        for (let c = 0; c < gridSize; c++) {
                            const cellX = startX + (c * cellSize); const cellY = startY + (r * cellSize);
                            if (solutionHighlighter === 'fill' && mask[r][c]) {
                                doc.setFillColor(224, 231, 255);
                                doc.rect(cellX, cellY, cellSize, cellSize, 'F');
                            }
                            if (solutionHighlighter === 'fade' && !mask[r][c]) doc.setTextColor(226, 232, 240);
                            else doc.setTextColor(0, 0, 0);
                            doc.text(grid[r][c], cellX + (cellSize / 2), cellY + (cellSize / 2), { align: "center", baseline: "middle" });
                        }
                    }
                }
            }

            
            doc.save(`KDP_Interior_${trimSize.w}x${trimSize.h}.pdf`);
            setIsGenerating(false);
        } catch (error) {
            console.error("Failed to generate PDF:", error);
            setIsGenerating(false);
        }
    };


    const handleGenerateCover = async () => {
        if (!stageRef.current) return;
        setIsGenerating(true);
        setShowKdpGuides(false); setActiveElementId(null);
        
        setTimeout(() => {
            const dataURL = stageRef.current.toDataURL({ pixelRatio: 3 });
            const doc = new jsPDF({ orientation: "landscape", unit: "in", format: [coverTotalWidthInches, coverTotalHeightInches] });
            doc.addImage(dataURL, 'PNG', 0, 0, coverTotalWidthInches, coverTotalHeightInches);
            doc.save(`KDP_Pro_Cover_${trimSize.w}x${trimSize.h}.pdf`);
            setShowKdpGuides(true); setIsGenerating(false);
        }, 500);
    };

    if (!isMounted) return <div className="min-h-screen flex items-center justify-center text-indigo-600"><Loader2 className="w-8 h-8 animate-spin"/></div>;

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 font-sans text-slate-900 flex flex-col overflow-hidden">
            <header className="mb-6 flex justify-between items-center max-w-[1600px] mx-auto w-full">
                <div className="flex items-center gap-3"><div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg">AI</div><h1 className="text-2xl font-black tracking-tight">KDP Master Studio (Konva)</h1></div>
                <div className="flex bg-slate-200 p-1 rounded-full shadow-inner">
                    <button onClick={() => setActiveTab('interior')} className={`px-6 py-2 rounded-full font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'interior' ? 'bg-white shadow-md text-slate-900' : 'text-slate-500 hover:bg-slate-300/50'}`}><Grid3x3 className="w-4 h-4"/> Interior Generator</button>
                    <button onClick={() => setActiveTab('cover')} className={`px-6 py-2 rounded-full font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'cover' ? 'bg-white shadow-md text-slate-900' : 'text-slate-500 hover:bg-slate-300/50'}`}><Palette className="w-4 h-4"/> Cover Studio</button>
                </div>
            </header>

            <div className="flex-1 max-w-[1600px] w-full mx-auto">
                {/* ================= INTERIOR STUDIO UI ================= */}
                {activeTab === 'interior' && (
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-140px)] animate-in fade-in duration-300">
                        <div className="col-span-1 lg:col-span-1 bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden">
                            <h2 className="font-bold text-sm uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2 shrink-0"><Settings className="w-4 h-4" /> Global Settings</h2>
                            <div className="space-y-6 overflow-y-auto flex-1 pr-2 custom-scrollbar">
                                <div className="space-y-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                    <h3 className="font-bold text-xs text-indigo-600 uppercase">Layout</h3>
                                    <div><label className="text-[10px] font-bold text-slate-500 uppercase">Trim Size</label><select value={`${trimSize.w}x${trimSize.h}`} onChange={(e) => setTrimSize(TRIM_SIZES.find(t => `${t.w}x${t.h}` === e.target.value) || TRIM_SIZES[0])} className="w-full mt-1 border border-slate-200 rounded p-1.5 text-xs bg-white">{TRIM_SIZES.map(t => <option key={t.label} value={`${t.w}x${t.h}`}>{t.label}</option>)}</select></div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div><label className="text-[10px] font-bold text-slate-500 uppercase">Total Puzzles</label><input type="number" value={totalPuzzles} onChange={(e) => setTotalPuzzles(Number(e.target.value))} className="w-full mt-1 border border-slate-200 rounded p-1.5 text-xs bg-white" /></div>
                                        <div><label className="text-[10px] font-bold text-slate-500 uppercase">Words/Puz</label><input type="number" value={wordsPerPage} onChange={(e) => setWordsPerPage(Number(e.target.value))} className="w-full mt-1 border border-slate-200 rounded p-1.5 text-xs bg-white" /></div>
                                        <div><label className="text-[10px] font-bold text-slate-500 uppercase">Puz/Page</label><select value={puzzlesPerPage} onChange={(e) => setPuzzlesPerPage(Number(e.target.value))} className="w-full mt-1 border border-slate-200 rounded p-1.5 text-xs bg-white"><option value={1}>1</option><option value={2}>2</option><option value={4}>4</option></select></div>
                                    </div>
                                </div>
                                <div className="space-y-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                    <h3 className="font-bold text-xs text-indigo-600 uppercase">Styling & Solutions</h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div><label className="text-[10px] font-bold text-slate-500 uppercase">Grid Size</label><input type="number" value={gridSize} onChange={(e) => setGridSize(Number(e.target.value))} className="w-full mt-1 border border-slate-200 rounded p-1.5 text-xs" /></div>
                                        <div><label className="text-[10px] font-bold text-slate-500 uppercase">Line Width</label><input type="number" step="0.5" value={lineWidth} onChange={(e) => setLineWidth(Number(e.target.value))} className="w-full mt-1 border border-slate-200 rounded p-1.5 text-xs" /></div>
                                        <div className="col-span-2"><label className="text-[10px] font-bold text-slate-500 uppercase">Highlighter</label><select value={solutionHighlighter} onChange={(e) => setSolutionHighlighter(e.target.value as any)} className="w-full mt-1 border border-slate-200 rounded p-1.5 text-xs"><option value="apple">Apple (Rounded)</option><option value="fill">Fill Color</option><option value="fade">Fade Out</option></select></div>
                                    </div>
                                </div>
                                <div className="space-y-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                    <h3 className="font-bold text-xs text-indigo-600 uppercase flex justify-between">Data <button onClick={() => csvInputRef.current?.click()} className="bg-indigo-600 text-white px-2 py-0.5 rounded text-[10px]">CSV</button></h3>
                                    <input type="file" ref={csvInputRef} onChange={(e) => { const file = e.target.files?.[0]; if (!file) return; const r = new FileReader(); r.onload = (ev) => setWords((ev.target?.result as string).replace(/,/g, '\n')); r.readAsText(file); }} className="hidden" />
                                    <textarea value={words} onChange={(e) => setWords(e.target.value)} className="w-full h-24 border border-slate-200 rounded p-2 text-xs font-mono resize-none focus:ring-1 focus:ring-indigo-500 outline-none" />
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 shrink-0">
                                <button onClick={handleGeneratePreview} className="w-full flex items-center justify-center gap-2 bg-slate-800 text-white px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-slate-700">PREVIEW</button>
                                <button onClick={handleGenerateInterior} disabled={isGenerating} className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-3 rounded-lg text-sm font-black hover:bg-indigo-700 shadow-md disabled:opacity-70">{isGenerating ? <Loader2 className="w-4 h-4 animate-spin"/> : <Download className="w-4 h-4"/>} EXPORT PDF</button>
                            </div>
                        </div>
                        <div className="col-span-1 lg:col-span-3 bg-slate-100 rounded-xl shadow-inner border border-slate-200 flex items-center justify-center p-4 relative overflow-y-auto">
                            {previewGrid && answerMask ? (
                                <div className="bg-white p-6 shadow-2xl rounded-sm w-full max-w-lg aspect-[8.5/11] flex flex-col relative transition-all duration-500 border border-slate-200">
                                    <button onClick={() => setShowAnswers(!showAnswers)} className="absolute top-4 right-4 bg-indigo-50 p-2 rounded-full text-indigo-600 z-20"><Eye className="w-4 h-4"/></button>
                                    
                                    <h3 className="font-black text-lg mb-4 uppercase tracking-widest text-slate-800" style={{ textAlign: puzzleAlign, fontFamily: lettersFont }}>
                                        {useFirstLineAsTitle && cleanWordsList.length > 0 ? `${cleanWordsList[0].title} #1` : 'Puzzle #1'}
                                    </h3>

                                    <div className="relative flex-1 w-full mx-auto max-h-[65%] flex flex-col justify-center">
                                        <div className="absolute inset-0 grid z-10" style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}>
                                            {previewGrid.map((row, r) => row.map((letter, c) => (
                                                <div key={`${r}-${c}`} className="flex items-center justify-center text-xs font-bold" style={{ border: `${lineWidth}px solid ${borderColor}`, backgroundColor: showAnswers && solutionHighlighter === 'fill' && answerMask[r][c] ? '#E0E7FF' : cellColor, color: showAnswers && (solutionHighlighter === 'fade' || solutionHighlighter === 'apple') && !answerMask[r][c] ? '#E2E8F0' : '#1E293B' }}>{letter}</div>
                                            )))}
                                        </div>
                                        {showAnswers && solutionHighlighter === 'apple' && (
                                            <svg viewBox={`0 0 ${gridSize} ${gridSize}`} className="absolute inset-0 w-full h-full pointer-events-none z-0">
                                                {cleanWordsList.map((w, i) => {
                                                    const len = Math.hypot(w.endC - w.startC, w.endR - w.startR); const ang = Math.atan2(w.endR - w.startR, w.endC - w.startC) * (180 / Math.PI);
                                                    return <rect key={i} x={w.startC + 0.10} y={w.startR + 0.10} width={len + 0.80} height={0.80} rx="0.15" transform={`rotate(${ang}, ${w.startC + 0.5}, ${w.startR + 0.5})`} fill="rgba(79, 70, 229, 0.15)" stroke="#4F46E5" strokeWidth="0.08" />
                                                })}
                                            </svg>
                                        )}
                                    </div>

                                    <div className="w-full mt-6 pt-4 border-t border-slate-100" style={{ textAlign: wordTextAlign, fontFamily: wordFont, color: wordTextColor }}>
                                        <h4 className="font-bold text-xs mb-2 uppercase text-slate-400 tracking-tighter">Words to Find:</h4>
                                        <div className="grid grid-cols-4 gap-x-2 gap-y-1 text-[10px] font-semibold">
                                            {cleanWordsList.map((w, i) => <span key={i} className="truncate">{w.text}</span>)}
                                        </div>
                                    </div>
                                </div>
                            ) : <div className="text-slate-400 flex flex-col items-center"><BookOpen className="w-16 h-16 mb-4 opacity-20"/>Generate Preview</div>}
                        </div>
                    </div>
                )}

                {/* ================= PRO COVER STUDIO (KONVA ENGINE) ================= */}
                {activeTab === 'cover' && (
                    <div className="flex h-[calc(100vh-140px)] rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm animate-in fade-in duration-500">
                        
                        <div className="w-16 bg-slate-900 flex flex-col items-center py-4 gap-4 border-r border-slate-800 z-20 text-slate-400 overflow-y-auto custom-scrollbar">
                            <div className="flex flex-col gap-3 mb-2 pb-4 border-b border-slate-800 w-full px-2">
                                <button onClick={() => setToolMode('select')} className={`p-2.5 mx-auto rounded-xl transition-all ${toolMode === 'select' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-slate-800 text-slate-400'}`} title="Select/Move"><MousePointer2 className="w-5 h-5"/></button>
                                <button onClick={() => setToolMode('pencil')} className={`p-2.5 mx-auto rounded-xl transition-all ${toolMode === 'pencil' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-slate-800 text-slate-400'}`} title="Pencil"><Pencil className="w-5 h-5"/></button>
                                <button onClick={() => setToolMode('eraser')} className={`p-2.5 mx-auto rounded-xl transition-all ${toolMode === 'eraser' ? 'bg-pink-600 text-white shadow-md' : 'hover:bg-slate-800 text-slate-400'}`} title="Eraser (Click to delete)"><Eraser className="w-5 h-5"/></button>
                                <div className="flex justify-center gap-1 mt-2">
                                    <button onClick={handleUndo} className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"><Undo2 className="w-4 h-4"/></button>
                                    <button onClick={handleRedo} className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"><Redo2 className="w-4 h-4"/></button>
                                </div>
                            </div>
                            <button onClick={() => setActiveToolTab('elements')} className={`p-3 rounded-xl transition-all ${activeToolTab === 'elements' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'}`}><Plus className="w-5 h-5"/></button>
                            <button onClick={() => setActiveToolTab('graphics')} className={`p-3 rounded-xl transition-all ${activeToolTab === 'graphics' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'}`}><Shapes className="w-5 h-5"/></button>
                            <button onClick={() => setActiveToolTab('ai')} className={`p-3 rounded-xl transition-all ${activeToolTab === 'ai' ? 'bg-purple-600 text-white' : 'hover:bg-slate-800'}`}><Sparkles className="w-5 h-5"/></button>
                            <button onClick={() => setActiveToolTab('layers')} className={`p-3 rounded-xl transition-all ${activeToolTab === 'layers' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'}`}><Layers className="w-5 h-5"/></button>
                            <button onClick={() => setActiveToolTab('gallery')} className={`p-3 rounded-xl transition-all ${activeToolTab === 'gallery' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'}`}><Save className="w-5 h-5"/></button>
                            <button onClick={() => setActiveToolTab('settings')} className={`p-3 rounded-xl transition-all ${activeToolTab === 'settings' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'}`}><Settings className="w-5 h-5"/></button>
                            
                            <div className="mt-auto flex flex-col gap-4 border-t border-slate-800 pt-4 w-full px-2">
                                <button onClick={trigger3DMockup} className={`p-3 mx-auto rounded-xl transition-all ${show3DMockup ? 'bg-amber-500 text-white' : 'hover:bg-slate-800 text-slate-400'}`}><Box className="w-5 h-5"/></button>
                                <button onClick={() => setShowKdpGuides(!showKdpGuides)} className={`p-3 mx-auto rounded-xl transition-all ${showKdpGuides ? 'text-pink-400 bg-pink-900/30' : 'text-slate-400'}`}><LayoutTemplate className="w-5 h-5"/></button>
                                <button onClick={handleGenerateCover} disabled={isGenerating} className="p-3 mx-auto rounded-xl bg-indigo-600 text-white hover:bg-indigo-500">{isGenerating ? <Loader2 className="w-5 h-5 animate-spin"/> : <Download className="w-5 h-5"/>}</button>
                            </div>
                        </div>

                        <div className="w-64 bg-slate-50 border-r border-slate-200 flex flex-col p-4 z-10 overflow-y-auto">
                            {activeToolTab === 'elements' && (
                                <div className="space-y-4 animate-in slide-in-from-left-4">
                                    <h3 className="font-bold text-[10px] uppercase tracking-widest text-slate-400">Basic Elements</h3>
                                    <button onClick={addNewText} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm font-bold flex items-center gap-2 hover:border-indigo-500"><Type className="w-4 h-4"/> Heading Text</button>
                                    <button onClick={() => fileInputRef.current?.click()} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm font-bold flex items-center gap-2 hover:border-indigo-500"><ImageIcon className="w-4 h-4"/> Custom Image</button>
                                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
                                    
                                    {/* 🚨 UPDATE: 3 SHAPE BUTTONS NOW INSTEAD OF 2 */}
                                    <div className="grid grid-cols-3 gap-2">
                                        <button onClick={() => addNewShape('rect')} className="p-3 bg-white border border-slate-200 rounded-lg hover:border-indigo-500 flex justify-center items-center"><Square className="w-5 h-5 text-indigo-600"/></button>
                                        <button onClick={() => addNewShape('rounded-rect')} className="p-3 bg-white border border-slate-200 rounded-lg hover:border-indigo-500 flex justify-center items-center"><div className="w-5 h-5 bg-indigo-600 rounded-md"></div></button>
                                        <button onClick={() => addNewShape('circle')} className="p-3 bg-white border border-slate-200 rounded-lg hover:border-indigo-500 flex justify-center items-center"><Circle className="w-5 h-5 text-indigo-600"/></button>
                                    </div>

                                    {/* 👇 NEW: Unsplash UI block 👇 */}
                                    <div className="pt-4 border-t border-slate-200">
                                        <h3 className="font-bold text-[10px] uppercase tracking-widest text-slate-400 mb-2">Stock Images</h3>
                                        <div className="flex gap-2 mb-3">
                                            <input 
                                                type="text" 
                                                placeholder="Search Unsplash..." 
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && searchUnsplash()}
                                                className="w-full p-2 text-xs border border-slate-200 rounded-lg outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                            />
                                            <button 
                                                onClick={searchUnsplash} 
                                                disabled={isSearchingUnsplash} 
                                                className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center shrink-0"
                                            >
                                                {isSearchingUnsplash ? <Loader2 className="w-4 h-4 animate-spin"/> : <Search className="w-4 h-4"/>}
                                            </button>
                                        </div>
                                        
                                        {/* Image Results Grid */}
                                        {unsplashImages.length > 0 && (
                                            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto custom-scrollbar p-1">
                                                {unsplashImages.map((img: any) => (
                                                    <img 
                                                        key={img.id}
                                                        src={img.urls.small} // Use 'small' for the preview thumbnail to save bandwidth
                                                        alt={img.alt_description || "Stock Image"}
                                                        onClick={() => addUnsplashImageToCanvas(img.urls.regular)} // Use 'regular' for better quality on the canvas
                                                        className="w-full h-20 object-cover rounded cursor-pointer hover:ring-2 hover:ring-indigo-500 transition-all shadow-sm"
                                                        title="Click to add to cover"
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    {/* 👆 END NEW 👆 */}
                                </div>
                            )}

















                            {activeToolTab === 'graphics' && (
                                <div className="space-y-4 animate-in slide-in-from-left-4">
                                    <h3 className="font-bold text-[10px] uppercase tracking-widest text-slate-400">Abstract Library</h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        {GRAPHICS_LIBRARY.map((g, i) => (
                                            <button key={i} onClick={() => addGraphic(g)} className="p-4 bg-white border border-slate-200 rounded-lg hover:border-indigo-500 flex flex-col items-center gap-2">
                                                <img src={g.svg} className="w-8 h-8 opacity-70" />
                                                <span className="text-[9px] font-bold text-slate-500 uppercase">{g.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeToolTab === 'ai' && (
                                <div className="space-y-4 animate-in slide-in-from-left-4">
                                    <h3 className="font-bold text-[10px] uppercase tracking-widest text-slate-400 flex items-center gap-1"><Sparkles className="w-3 h-3 text-purple-500"/> AI Niche Brain</h3>
                                    <button onClick={generateAiTitles} disabled={aiGenerating} className="w-full p-3 bg-purple-600 text-white rounded-lg text-sm font-bold flex justify-center items-center shadow-md hover:bg-purple-700 disabled:opacity-50">
                                        {aiGenerating ? <Loader2 className="w-5 h-5 animate-spin"/> : "Generate Magic Titles"}
                                    </button>
                                </div>
                            )}

                            {activeToolTab === 'gallery' && (
                                <div className="space-y-4 animate-in slide-in-from-left-4">
                                    <h3 className="font-bold text-[10px] uppercase tracking-widest text-slate-400">Local Storage</h3>
                                    <button onClick={saveToGallery} className="w-full p-2.5 bg-slate-800 text-white rounded-lg text-sm font-bold flex items-center gap-2 justify-center hover:bg-slate-900"><Save className="w-4 h-4"/> Save Template</button>
                                    <button onClick={loadFromGallery} className="w-full p-2.5 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-bold flex items-center gap-2 justify-center hover:border-slate-400"><Download className="w-4 h-4"/> Load Template</button>
                                </div>
                            )}

                            {activeToolTab === 'layers' && (
                                <div className="space-y-2 animate-in slide-in-from-left-4">
                                    <h3 className="font-bold text-[10px] uppercase tracking-widest text-slate-400 mb-4">Stack Order</h3>
                                    {[...coverElements].reverse().map((el) => (
                                        <div key={el.id} onClick={() => setActiveElementId(el.id)} className={`p-2.5 text-xs font-semibold rounded-lg cursor-pointer border ${activeElementId === el.id ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                                            {el.name || el.type.toUpperCase()}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeToolTab === 'settings' && (
                                <div className="space-y-4 animate-in slide-in-from-left-4">
                                    <h3 className="font-bold text-[10px] uppercase tracking-widest text-slate-400">Canvas Base</h3>
                                    <div><label className="text-xs font-bold text-slate-600 block mb-1">Back Cover & Spine</label><input type="color" value={backCoverColor} onChange={(e) => setBackCoverColor(e.target.value)} className="w-full h-10 rounded-lg cursor-pointer border-0 p-1 bg-white shadow-sm ring-1 ring-slate-200" /></div>
                                    <div><label className="text-xs font-bold text-slate-600 block mb-1">Front Cover</label><input type="color" value={frontCoverColor} onChange={(e) => setFrontCoverColor(e.target.value)} className="w-full h-10 rounded-lg cursor-pointer border-0 p-1 bg-white shadow-sm ring-1 ring-slate-200" /></div>
                                </div>
                            )}

                            {/* Properties Panel */}
                            {activeElementId && toolMode === 'select' && (
                                <div className="mt-auto pt-5 border-t border-slate-200 animate-in slide-in-from-bottom-2">
                                    <h3 className="font-bold text-[10px] uppercase tracking-widest text-slate-400 mb-3 flex items-center justify-between">Properties <button onClick={handleDuplicate} className="flex items-center gap-1 text-[10px] bg-slate-200 text-slate-600 px-2 py-1 rounded hover:bg-slate-300"><Copy className="w-3 h-3"/> Duplicate</button></h3>
                                    {coverElements.find(e => e.id === activeElementId)?.type === 'text' && (
                                        <textarea value={coverElements.find(e => e.id === activeElementId)?.text} onChange={(e) => updateElement({ ...coverElements.find(e => e.id === activeElementId), text: e.target.value })} className="w-full p-2.5 text-xs rounded-lg border border-slate-300 mb-3" rows={3}/>
                                    )}
                                    <div className="flex gap-2 mb-4">
                                        <div className="w-1/2"><label className="text-[9px] font-bold text-slate-400 uppercase mb-1 block">Color</label><input type="color" value={coverElements.find(e => e.id === activeElementId)?.fill || '#FFFFFF'} onChange={(e) => updateElement({ ...coverElements.find(e => e.id === activeElementId), fill: e.target.value })} className="w-full h-8 rounded-md cursor-pointer border-0 p-0.5 bg-white shadow-sm ring-1 ring-slate-200" /></div>
                                        <div className="w-1/2"><label className="text-[9px] font-bold text-slate-400 uppercase mb-1 block">Font Size</label><input type="number" value={Math.round(coverElements.find(e => e.id === activeElementId)?.fontSize || 30)} onChange={(e) => updateElement({ ...coverElements.find(e => e.id === activeElementId), fontSize: Number(e.target.value) })} className="w-full p-1.5 text-xs rounded-md border border-slate-300 text-center" /></div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div className="flex gap-1 bg-slate-200 p-1 rounded-lg">
                                            <button onClick={() => moveLayer('up')} className="p-1.5 bg-white rounded shadow-sm hover:text-indigo-600"><ArrowUpToLine className="w-3.5 h-3.5" /></button>
                                            <button onClick={() => moveLayer('down')} className="p-1.5 bg-white rounded shadow-sm hover:text-indigo-600"><ArrowDownToLine className="w-3.5 h-3.5" /></button>
                                        </div>
                                        <button onClick={() => { saveToHistory(coverElements.filter(e => e.id !== activeElementId)); setActiveElementId(null); }} className="px-4 py-2 bg-red-50 text-red-600 text-xs font-bold rounded-lg border border-red-100 hover:bg-red-100">Delete</button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 🚨 KONVA STAGE AREA */}
                        <div className="flex-1 bg-slate-200/50 flex items-center justify-center p-8 relative overflow-hidden shadow-inner">
                            {!show3DMockup ? (
                                <div className={`relative shadow-[0_10px_40px_rgba(0,0,0,0.15)] bg-white rounded-sm ring-1 ring-slate-300 overflow-hidden ${toolMode === 'pencil' ? 'cursor-crosshair' : toolMode === 'eraser' ? 'cursor-not-allowed' : 'cursor-default'}`}>
                                    <Stage width={CANVAS_WIDTH} height={CANVAS_HEIGHT} ref={stageRef} onMouseDown={handleStageMouseDown} onMouseMove={handleStageMouseMove} onMouseUp={handleStageMouseUp} onMouseLeave={handleStageMouseUp} onTouchStart={handleStageMouseDown} onTouchMove={handleStageMouseMove} onTouchEnd={handleStageMouseUp} style={{ width: '100%', height: '100%', maxWidth: '800px', maxHeight: `${800 * (CANVAS_HEIGHT/CANVAS_WIDTH)}px` }}>
                                        <Layer>
                                            <Rect name="background" x={0} y={0} width={CANVAS_WIDTH/2 - spineWidthPx/2} height={CANVAS_HEIGHT} fill={backCoverColor} />
                                            <Rect name="background" x={CANVAS_WIDTH/2 - spineWidthPx/2} y={0} width={spineWidthPx} height={CANVAS_HEIGHT} fill={backCoverColor} />
                                            <Rect name="background" x={CANVAS_WIDTH/2 + spineWidthPx/2} y={0} width={CANVAS_WIDTH/2 - spineWidthPx/2} height={CANVAS_HEIGHT} fill={frontCoverColor} />

                                            {showKdpGuides && (
                                                <>
                                                    <Rect x={bleedPx} y={bleedPx} width={CANVAS_WIDTH - bleedPx*2} height={CANVAS_HEIGHT - bleedPx*2} stroke="#3B82F6" strokeWidth={2} dash={[10, 10]} listening={false} />
                                                    <Rect x={CANVAS_WIDTH/2 - spineWidthPx/2} y={0} width={spineWidthPx} height={CANVAS_HEIGHT} fill="rgba(236, 72, 153, 0.2)" stroke="#EC4899" strokeWidth={2} listening={false} />
                                                    <Rect x={bleedPx + 40} y={CANVAS_HEIGHT - bleedPx - 100} width={120} height={80} fill="rgba(253, 224, 71, 0.6)" stroke="#EAB308" strokeWidth={2} listening={false} />
                                                </>
                                            )}

                                            {/* 🚨 UPDATE: Render rounded-rect */}
                                            {coverElements.map((el) => {
                                                const isSelected = activeElementId === el.id && toolMode === 'select';
                                                if (el.type === 'text') return <KonvaText key={el.id} id={el.id} name={el.name} text={el.text} x={el.x} y={el.y} fontSize={el.fontSize} fill={el.fill} fontFamily={el.fontFamily} fontStyle={el.fontWeight} draggable={isSelected} onClick={() => { if(toolMode === 'select') setActiveElementId(el.id); }} onTap={() => { if(toolMode === 'select') setActiveElementId(el.id); }} onDragEnd={(e) => updateElement({...el, x: e.target.x(), y: e.target.y()})} onTransformEnd={(e) => { const node = e.target; updateElement({...el, x: node.x(), y: node.y(), scaleX: node.scaleX(), scaleY: node.scaleY(), rotation: node.rotation()}); }} />;
                                                if (el.type === 'shape' && (el.shapeType === 'rect' || el.shapeType === 'rounded-rect')) return <Rect key={el.id} id={el.id} name={el.name} x={el.x} y={el.y} width={el.width} height={el.height} fill={el.fill} cornerRadius={el.shapeType === 'rounded-rect' ? Math.min(el.width, el.height) * 0.225 : 0} draggable={isSelected} onClick={() => { if(toolMode === 'select') setActiveElementId(el.id); }} onDragEnd={(e) => updateElement({...el, x: e.target.x(), y: e.target.y()})} onTransformEnd={(e) => { const node = e.target; node.scaleX(1); node.scaleY(1); updateElement({...el, x: node.x(), y: node.y(), width: Math.max(5, node.width() * node.scaleX()), height: Math.max(5, node.height() * node.scaleY()), rotation: node.rotation()}); }} />;
                                                if (el.type === 'shape' && el.shapeType === 'circle') return <KonvaCircle key={el.id} id={el.id} name={el.name} x={el.x} y={el.y} radius={el.width/2} fill={el.fill} draggable={isSelected} onClick={() => { if(toolMode === 'select') setActiveElementId(el.id); }} onDragEnd={(e) => updateElement({...el, x: e.target.x(), y: e.target.y()})} onTransformEnd={(e) => { const node = e.target; node.scaleX(1); node.scaleY(1); updateElement({...el, x: node.x(), y: node.y(), width: Math.max(5, node.width() * node.scaleX()), rotation: node.rotation()}); }} />;
                                                if (el.type === 'image') return <URLImage key={el.id} imageInfo={el} isSelected={isSelected} onSelect={() => { if(toolMode === 'select') setActiveElementId(el.id); }} onChange={updateElement} />;
                                                if (el.type === 'path') return <Line key={el.id} id={el.id} name={el.name} points={el.points} stroke={el.color} strokeWidth={el.strokeWidth} tension={0.5} lineCap="round" lineJoin="round" draggable={isSelected} onClick={() => { if(toolMode === 'select') setActiveElementId(el.id); }} onDragEnd={(e) => updateElement({...el, x: e.target.x(), y: e.target.y()})} />;
                                                return null;
                                            })}

                                            {currentPath && <Line points={currentPath} stroke="#000000" strokeWidth={5} tension={0.5} lineCap="round" lineJoin="round" />}
                                            {activeElementId && toolMode === 'select' && <Transformer ref={trRef} boundBoxFunc={(oldBox, newBox) => Math.abs(newBox.width) < 10 || Math.abs(newBox.height) < 10 ? oldBox : newBox} />}
                                        </Layer>
                                    </Stage>
                                </div>
                            ) : (
                                <div className="perspective-2000 animate-in zoom-in-95 duration-700 h-full flex items-center justify-center w-full">
                                    {mockupImageURL ? (
                                        <div className="book-3d-wrapper relative w-[300px] md:w-[400px] aspect-[8.5/11] transition-transform duration-[800ms] preserve-3d cursor-grab active:cursor-grabbing hover:rotate-y-[-25deg]">
                                            <div className="absolute top-0 bottom-0 left-0 w-10 origin-left rotate-y-[-90deg] translate-x-[-100%] shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] flex items-center justify-center overflow-hidden bg-slate-900"><span className="text-[12px] text-white/70 font-bold -rotate-90 whitespace-nowrap uppercase tracking-[0.2em]">KDP Edition</span></div>
                                            <div className="absolute inset-0 shadow-[20px_20px_40px_rgba(0,0,0,0.4)] rounded-r-sm overflow-hidden border-l border-white/10 bg-slate-200"><img src={mockupImageURL} className="w-full h-full object-cover" /><div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent w-8 mix-blend-overlay"></div></div>
                                            <div className="absolute top-[1%] bottom-[1%] right-[-14px] w-4 bg-gradient-to-r from-slate-50 to-slate-200 rotate-y-[90deg] origin-left border-y border-slate-300"><div className="w-full h-full" style={{ backgroundImage: 'repeating-linear-gradient(to bottom, transparent, transparent 2px, rgba(0,0,0,0.05) 2px, rgba(0,0,0,0.05) 4px)' }}></div></div>
                                        </div>
                                    ) : <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />}
                                    <div className="absolute bottom-6 bg-white/90 backdrop-blur-md px-6 py-3 rounded-full shadow-2xl border border-indigo-100 text-indigo-700 font-bold flex items-center gap-3 z-50">
                                        <span className="flex items-center gap-2"><Box className="w-5 h-5 text-indigo-500" /> 3D Mockup Active</span>
                                        <button onClick={() => setShow3DMockup(false)} className="ml-2 text-xs bg-slate-800 text-white px-4 py-1.5 rounded-full hover:bg-slate-900 uppercase tracking-widest transition-all">Exit 3D</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
            
            <style jsx global>{`
                .perspective-2000 { perspective: 2000px; }
                .preserve-3d { transform-style: preserve-3d; }
                .rotate-y-[-25deg] { transform: rotateY(-30deg) rotateX(5deg); }
                .book-3d-wrapper { transition: transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1); }
            `}</style>
        </div>
    );
}