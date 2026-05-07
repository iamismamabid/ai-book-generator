"use client";
import { useState, useRef } from "react";
import { Download, Grid3x3, Settings, Eye, EyeOff, BookOpen, Loader2, Palette, Type, LayoutTemplate, MousePointer2, Plus, Image as ImageIcon, ArrowUpToLine, ArrowDownToLine, SlidersHorizontal, Square, Circle, Layers, Magnet, ScanBarcode, FileText, Box } from "lucide-react";
import { jsPDF } from "jspdf";

// 🧠 1. The Advanced Puzzle Algorithm
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
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) { 
            if (grid[r][c] === '') grid[r][c] = alphabet[Math.floor(Math.random() * alphabet.length)]; 
        }
    }
    return { grid, words: placedWords, mask };
}

const TRIM_SIZES = [
    { label: '8.5" x 11" (Letter)', w: 8.5, h: 11 },
    { label: '6" x 9" (Novel)', w: 6, h: 9 },
    { label: '8" x 10" (Workbook)', w: 8, h: 10 }
];

export default function WordSearchStudio() {
    const [activeTab, setActiveTab] = useState<'interior' | 'cover'>('interior'); 
    const [isGenerating, setIsGenerating] = useState(false);
    
    // 🚨 INTERIOR SETTINGS STATES 🚨
    const [trimSize, setTrimSize] = useState(TRIM_SIZES[0]);
    const [paperType, setPaperType] = useState<'white' | 'cream'>('white'); 
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

    // 🚨 COVER & 3D MOCKUP STATES 🚨
    const canvasRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [backCoverColor, setBackCoverColor] = useState('#0F172A'); 
    const [frontCoverColor, setFrontCoverColor] = useState('#1E293B'); 
    const [coverElements, setCoverElements] = useState<any[]>([]);
    const [activeElementId, setActiveElementId] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [showKdpGuides, setShowKdpGuides] = useState(true);
    const [snapToGrid, setSnapToGrid] = useState(true);
    const [activeToolTab, setActiveToolTab] = useState<'elements' | 'layers' | 'settings'>('elements');
    const [show3DMockup, setShow3DMockup] = useState(false); // 3D Mockup Trigger

    // Dynamic Cover Math
    const spineWidth = (totalPuzzles * 2) * (paperType === 'white' ? 0.002252 : 0.0025); 
    const bleed = 0.125;
    const coverTotalWidth = (trimSize.w * 2) + spineWidth + (bleed * 2);
    const coverTotalHeight = trimSize.h + (bleed * 2);
    const backCoverPercentage = (((trimSize.w + bleed + spineWidth) / coverTotalWidth) * 100).toFixed(2);
    const frontCenterPercent = (((trimSize.w + bleed + spineWidth + (trimSize.w / 2)) / coverTotalWidth) * 100);
    const backCenterPercent = (((bleed + (trimSize.w / 2)) / coverTotalWidth) * 100);

    // 📁 CSV Parser Logic
    const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]; if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            const parsed = text.replace(/,/g, '\n').replace(/\r/g, '');
            setWords(parsed);
        };
        reader.readAsText(file);
    };

    const getCleanMasterList = () => {
        let lines = words.split('\n').map(w => w.trim()).filter(w => w.length > 2);
        let titleText = "";
        if (useFirstLineAsTitle && lines.length > 0) {
            titleText = lines[0];
            lines = lines.slice(1);
        }
        const cleanedWords = lines.map(w => w.replace(/[^a-zA-Z]/g, ''));
        return { cleanedWords, titleText };
    };

    // 🖱️ Canva Drag & Drop Handlers (Cover)
    const handlePointerDown = (e: React.PointerEvent, id: string) => {
        e.stopPropagation(); setActiveElementId(id); setIsDragging(true); (e.target as HTMLElement).setPointerCapture(e.pointerId);
    };
    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isDragging || !activeElementId || !canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        let xPercent = ((e.clientX - rect.left) / rect.width) * 100;
        let yPercent = ((e.clientY - rect.top) / rect.height) * 100;

        if (snapToGrid) {
            if (Math.abs(xPercent - 50) < 1.5) xPercent = 50; 
            if (Math.abs(xPercent - frontCenterPercent) < 1.5) xPercent = frontCenterPercent; 
            if (Math.abs(xPercent - backCenterPercent) < 1.5) xPercent = backCenterPercent; 
            if (Math.abs(yPercent - 50) < 1.5) yPercent = 50; 
        }

        xPercent = Math.max(0, Math.min(100, xPercent)); yPercent = Math.max(0, Math.min(100, yPercent));
        setCoverElements(prev => prev.map(el => el.id === activeElementId ? { ...el, x: xPercent, y: yPercent } : el));
    };
    const handlePointerUp = (e: React.PointerEvent) => {
        setIsDragging(false); (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    };

    const addNewText = () => {
        const newEl = { id: `text-${Date.now()}`, type: 'text', text: 'NEW TEXT', x: frontCenterPercent, y: 50, fontSize: 30, color: '#FFFFFF', fontWeight: 'bold', fontFamily: 'helvetica', opacity: 1, name: 'Text Layer' };
        setCoverElements([...coverElements, newEl]); setActiveElementId(newEl.id);
    };
    const addNewShape = (shapeType: 'rect' | 'circle') => {
        const newEl = { id: `shape-${Date.now()}`, type: 'shape', shapeType: shapeType, x: frontCenterPercent, y: 50, width: 20, height: 20, color: '#4F46E5', opacity: 1, name: `${shapeType === 'rect' ? 'Square' : 'Circle'} Layer` };
        setCoverElements([...coverElements, newEl]); setActiveElementId(newEl.id);
    };
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]; if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image(); img.src = event.target?.result as string;
            img.onload = () => {
                const newEl = { id: `img-${Date.now()}`, type: 'image', src: img.src, x: frontCenterPercent, y: 50, width: 30, aspectRatio: img.height / img.width, opacity: 1, name: 'Image Layer' };
                setCoverElements([...coverElements, newEl]); setActiveElementId(newEl.id);
            }
        }; reader.readAsDataURL(file);
    };
    const moveLayer = (direction: 'up' | 'down') => {
        if (!activeElementId) return;
        const index = coverElements.findIndex(e => e.id === activeElementId);
        if (direction === 'up' && index < coverElements.length - 1) {
            const newArr = [...coverElements]; [newArr[index], newArr[index + 1]] = [newArr[index + 1], newArr[index]]; setCoverElements(newArr);
        } else if (direction === 'down' && index > 0) {
            const newArr = [...coverElements]; [newArr[index], newArr[index - 1]] = [newArr[index - 1], newArr[index]]; setCoverElements(newArr);
        }
    };

    // 🖨️ INTERIOR PDF ZONE MATHEMATICS
    const getZones = (itemsPerPage: number, safeW: number, safeH: number, margin: number) => {
        if (itemsPerPage === 1) return [{ x: margin, y: margin, w: safeW, h: safeH }];
        if (itemsPerPage === 2) return [
            { x: margin, y: margin, w: safeW, h: safeH/2 - 0.25 },
            { x: margin, y: margin + (safeH/2) + 0.25, w: safeW, h: safeH/2 - 0.25 }
        ];
        if (itemsPerPage === 4) return [
            { x: margin, y: margin, w: safeW/2 - 0.1, h: safeH/2 - 0.1 },
            { x: margin + safeW/2 + 0.1, y: margin, w: safeW/2 - 0.1, h: safeH/2 - 0.1 },
            { x: margin, y: margin + safeH/2 + 0.1, w: safeW/2 - 0.1, h: safeH/2 - 0.1 },
            { x: margin + safeW/2 + 0.1, y: margin + safeH/2 + 0.1, w: safeW/2 - 0.1, h: safeH/2 - 0.1 }
        ];
        return [{ x: margin, y: margin, w: safeW, h: safeH }];
    };

    const handleGeneratePreview = () => {
        const { cleanedWords, titleText } = getCleanMasterList();
        if (cleanedWords.length < wordsPerPage) return alert(`Need at least ${wordsPerPage} words!`);
        let randomSubset = [...cleanedWords].sort(() => 0.5 - Math.random()).slice(0, wordsPerPage);
        if (wordsSort === 'alphabetical') randomSubset.sort((a,b) => a.localeCompare(b));
        if (wordsSort === 'length') randomSubset.sort((a,b) => a.length - b.length || a.localeCompare(b));

        const { grid, words: cleanWords, mask } = generatePuzzleGrid(randomSubset, gridSize, textCase);
        setPreviewGrid(grid); setCleanWordsList(cleanWords.map(cw => ({...cw, title: titleText}))); setAnswerMask(mask); setShowAnswers(false); 
    };

    const handleGenerateInterior = async () => {
        setIsGenerating(true);
        const { cleanedWords, titleText } = getCleanMasterList();
        if (cleanedWords.length < wordsPerPage) { alert(`Add more words!`); setIsGenerating(false); return; }
        await new Promise(resolve => setTimeout(resolve, 100));

        const doc = new jsPDF({ orientation: "portrait", unit: "in", format: [trimSize.w, trimSize.h] });
        const margin = 0.5; const safeWidth = trimSize.w - (margin * 2); const safeHeight = trimSize.h - (margin * 2);

        const bookPuzzles = [];
        for (let i = 0; i < totalPuzzles; i++) {
            let subset = [...cleanedWords].sort(() => 0.5 - Math.random()).slice(0, wordsPerPage);
            if (wordsSort === 'alphabetical') subset.sort((a,b) => a.localeCompare(b));
            if (wordsSort === 'length') subset.sort((a,b) => a.length - b.length || a.localeCompare(b));
            bookPuzzles.push(generatePuzzleGrid(subset, gridSize, textCase));
        }

        // ================= FRONT SECTION =================
        const puzZones = getZones(puzzlesPerPage, safeWidth, safeHeight, margin);
        const totalPuzPages = Math.ceil(totalPuzzles / puzzlesPerPage);

        for (let p = 0; p < totalPuzPages; p++) {
            if (p > 0) doc.addPage();
            for (let z = 0; z < puzzlesPerPage; z++) {
                const puzIndex = (p * puzzlesPerPage) + z;
                if (puzIndex >= totalPuzzles) break;
                const zone = puzZones[z];
                const { grid, words: pageWords } = bookPuzzles[puzIndex];

                const titleSpace = 0.4; const wordListSpace = puzzlesPerPage === 4 ? 0.8 : 1.5;
                const gridDrawSize = Math.min(zone.w, zone.h - titleSpace - wordListSpace);
                const cellSize = gridDrawSize / gridSize;

                let startX = zone.x;
                if (puzzleAlign === 'center') startX = zone.x + (zone.w - gridDrawSize)/2;
                if (puzzleAlign === 'right') startX = zone.x + zone.w - gridDrawSize;
                const startY = zone.y + titleSpace;

                doc.setFont(lettersFont, "bold"); doc.setFontSize(16); doc.setTextColor('#000000');
                const displayTitle = useFirstLineAsTitle ? `${titleText} #${puzIndex + 1}` : `Puzzle #${puzIndex + 1}`;
                doc.text(displayTitle, zone.x + zone.w/2, zone.y + 0.2, { align: "center" });

                doc.setLineWidth(lineWidth * 0.01); doc.setDrawColor(borderColor);
                
                for (let r = 0; r < gridSize; r++) {
                    for (let c = 0; c < gridSize; c++) {
                        const cellX = startX + (c * cellSize); const cellY = startY + (r * cellSize);
                        if (cellColor !== '#FFFFFF' || lineWidth > 0) {
                            doc.setFillColor(cellColor); doc.rect(cellX, cellY, cellSize, cellSize, lineWidth > 0 ? "FD" : "F");
                        }
                        doc.setFont(lettersFont, "bold"); doc.setFontSize(letterTextSize * (gridDrawSize / 6.5)); doc.setTextColor('#000000');
                        doc.text(grid[r][c], cellX + (cellSize/2), cellY + (cellSize/2), { align: "center", baseline: "middle" });
                    }
                }

                const listTop = startY + gridDrawSize + 0.2; 
                doc.setFont(wordFont, "bold"); doc.setFontSize(wordTextSize); doc.setTextColor(wordTextColor);
                doc.text("Words:", zone.x, listTop);
                doc.setFont(wordFont, "normal"); 
                const cols = puzzlesPerPage === 4 ? 2 : 4; 
                const colW = zone.w / cols; 
                
                pageWords.forEach((wordObj, idx) => {
                    const c = idx % cols; const r = Math.floor(idx / cols); 
                    const xPos = zone.x + (c * colW) + (wordTextAlign === 'center' ? colW/2 : 0);
                    const yPos = listTop + 0.20 + (r * 0.18);
                    doc.text(wordObj.text, xPos, yPos, { align: wordTextAlign === 'center' ? 'center' : 'left' });
                });
            }
        }

        // ================= BACK SECTION (SOLUTIONS) =================
        const solZones = getZones(solutionsPerPage, safeWidth, safeHeight, margin);
        const totalSolPages = Math.ceil(totalPuzzles / solutionsPerPage);

        for (let p = 0; p < totalSolPages; p++) {
            doc.addPage();
            for (let z = 0; z < solutionsPerPage; z++) {
                const solIndex = (p * solutionsPerPage) + z;
                if (solIndex >= totalPuzzles) break;
                const zone = solZones[z];
                const { grid, words: pageWords, mask } = bookPuzzles[solIndex];

                const titleSpace = 0.4; 
                const gridDrawSize = Math.min(zone.w, zone.h - titleSpace);
                const cellSize = gridDrawSize / gridSize;

                let startX = zone.x;
                if (solutionAlign === 'center') startX = zone.x + (zone.w - gridDrawSize)/2;
                if (solutionAlign === 'right') startX = zone.x + zone.w - gridDrawSize;
                const startY = zone.y + titleSpace;

                doc.setFont(lettersFont, "bold"); doc.setFontSize(16); doc.setTextColor('#000000');
                doc.text(`Answer #${solIndex + 1}`, zone.x + zone.w/2, zone.y + 0.2, { align: "center" });

                if (solutionHighlighter === 'apple') {
                    doc.setLineWidth(cellSize * 0.08); doc.setDrawColor(120, 120, 120); doc.setLineJoin("round"); 
                    pageWords.forEach(w => {
                        const sX = startX + (w.startC * cellSize) + (cellSize / 2); const sY = startY + (w.startR * cellSize) + (cellSize / 2);
                        const eX = startX + (w.endC * cellSize) + (cellSize / 2); const eY = startY + (w.endR * cellSize) + (cellSize / 2);
                        const a = Math.atan2(eY - sY, eX - sX); const p = cellSize * 0.40; 
                        const c = [{x:-p,y:-p},{x:Math.hypot(eX-sX,eY-sY)+p,y:-p},{x:Math.hypot(eX-sX,eY-sY)+p,y:p},{x:-p,y:p}].map(pt => ({x: sX + (pt.x*Math.cos(a) - pt.y*Math.sin(a)), y: sY + (pt.x*Math.sin(a) + pt.y*Math.cos(a))}));
                        doc.lines([[c[1].x-c[0].x, c[1].y-c[0].y], [c[2].x-c[1].x, c[2].y-c[1].y], [c[3].x-c[2].x, c[3].y-c[2].y]], c[0].x, c[0].y, [1, 1], 'S', true);
                    });
                }

                doc.setFontSize(letterTextSize * (gridDrawSize / 6.5));
                for (let r = 0; r < gridSize; r++) {
                    for (let c = 0; c < gridSize; c++) {
                        const cellX = startX + (c * cellSize); const cellY = startY + (r * cellSize);
                        if (solutionHighlighter === 'fill' && mask[r][c]) {
                            doc.setFillColor('#E2E8F0'); doc.rect(cellX, cellY, cellSize, cellSize, "F");
                        }
                        if (mask[r][c]) { 
                            doc.setFont(lettersFont, "bold"); doc.setTextColor(0, 0, 0); 
                        } else { 
                            doc.setFont(lettersFont, "normal"); doc.setTextColor(solutionHighlighter === 'fade' || solutionHighlighter === 'apple' ? 210 : 0); 
                        }
                        doc.text(grid[r][c], cellX + (cellSize / 2), cellY + (cellSize / 2), { align: "center", baseline: "middle" });
                    }
                }
            }
        }
        doc.save(`KDP_Interior_${trimSize.w}x${trimSize.h}.pdf`);
        setIsGenerating(false);
    };

    // 🖨️ PRO COVER PDF GENERATOR
    const handleGenerateCover = async () => {
        setIsGenerating(true);
        await new Promise(resolve => setTimeout(resolve, 100));
        const doc = new jsPDF({ orientation: "landscape", unit: "in", format: [coverTotalWidth, coverTotalHeight] });

        doc.setFillColor(backCoverColor); doc.rect(0, 0, bleed + trimSize.w + spineWidth, coverTotalHeight, "F");
        doc.setFillColor(frontCoverColor); doc.rect(bleed + trimSize.w + spineWidth, 0, trimSize.w + bleed, coverTotalHeight, "F");

        coverElements.forEach(el => {
            const actualX = (el.x / 100) * coverTotalWidth; const actualY = (el.y / 100) * coverTotalHeight;
            doc.setGState(new doc.GState({ opacity: el.opacity || 1 }));

            if (el.type === 'shape') {
                doc.setFillColor(el.color);
                const sW = (el.width / 100) * coverTotalWidth; const sH = (el.height / 100) * coverTotalHeight; 
                if (el.shapeType === 'rect') doc.rect(actualX - (sW/2), actualY - (sH/2), sW, sH, "F");
                else if (el.shapeType === 'circle') doc.circle(actualX, actualY, sW/2, "F");
            }
            else if (el.type === 'image') {
                const iW = (el.width / 100) * coverTotalWidth; const iH = iW * el.aspectRatio;
                doc.addImage(el.src, 'PNG', actualX - (iW/2), actualY - (iH/2), iW, iH);
            } 
            else if (el.type === 'text') {
                doc.setTextColor(el.color); doc.setFont(el.fontFamily || "helvetica", el.fontWeight);
                doc.setFontSize(el.fontSize * (coverTotalWidth / 20)); 
                el.text.split('\n').forEach((line: string, index: number) => {
                    doc.text(line, actualX, actualY + (index * (el.fontSize * 0.015 * (coverTotalWidth/20))), { align: "center", baseline: "middle" });
                });
            }
        });
        doc.setGState(new doc.GState({ opacity: 1 }));
        doc.save(`KDP_Pro_Cover_${trimSize.w}x${trimSize.h}.pdf`);
        setIsGenerating(false);
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 font-sans text-slate-900 flex flex-col">
            
            <header className="mb-6 flex justify-between items-center max-w-[1600px] mx-auto w-full">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black">AI</div>
                    <h1 className="text-2xl font-black tracking-tight">KDP Master Studio</h1>
                </div>
                <div className="flex bg-slate-200 p-1 rounded-full">
                    <button onClick={() => setActiveTab('interior')} className={`px-6 py-2 rounded-full font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'interior' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}><Grid3x3 className="w-4 h-4"/> Interior Generator</button>
                    <button onClick={() => setActiveTab('cover')} className={`px-6 py-2 rounded-full font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'cover' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}><Palette className="w-4 h-4"/> Cover Studio</button>
                </div>
                <button onClick={activeTab === 'interior' ? handleGenerateInterior : handleGenerateCover} disabled={isGenerating} className="bg-indigo-600 text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-2">
                    {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Download PDF
                </button>
            </header>

            <div className="flex-1 max-w-[1600px] w-full mx-auto">
                {/* ================= INTERIOR STUDIO UI ================= */}
                {activeTab === 'interior' && (
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-140px)] animate-in fade-in duration-300">
                        <div className="col-span-1 lg:col-span-1 bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden">
                            <h2 className="font-bold text-sm uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2 shrink-0"><Settings className="w-4 h-4" /> Global Settings</h2>
                            
                            <div className="space-y-6 overflow-y-auto flex-1 pr-2 custom-scrollbar">
                               {/* 1. Page Layout */}
                                <div className="space-y-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                    <h3 className="font-bold text-xs text-indigo-600 uppercase">Layout & Pages</h3>
                                    
                                    {/* Trim Size এবং Paper Type এর জন্য Grid */}
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-500 uppercase">Trim Size</label>
                                            <select value={`${trimSize.w}x${trimSize.h}`} onChange={(e) => setTrimSize(TRIM_SIZES.find(t => `${t.w}x${t.h}` === e.target.value) || TRIM_SIZES[0])} className="w-full mt-1 border border-slate-200 rounded p-1.5 text-xs bg-white">
                                                {TRIM_SIZES.map(t => <option key={t.label} value={`${t.w}x${t.h}`}>{t.label}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-500 uppercase">Paper Type</label>
                                            <select value={paperType} onChange={(e) => setPaperType(e.target.value as 'white' | 'cream')} className="w-full mt-1 border border-slate-200 rounded p-1.5 text-xs bg-white">
                                                <option value="white">White</option>
                                                <option value="cream">Cream</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* অন্যান্য সেটিংস এর জন্য Grid */}
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-500 uppercase">Total Puzzles</label>
                                            <input type="number" value={totalPuzzles} onChange={(e) => setTotalPuzzles(Number(e.target.value))} className="w-full mt-1 border border-slate-200 rounded p-1.5 text-xs bg-white" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-500 uppercase">Words/Puz</label>
                                            <input type="number" value={wordsPerPage} onChange={(e) => setWordsPerPage(Number(e.target.value))} className="w-full mt-1 border border-slate-200 rounded p-1.5 text-xs bg-white" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-500 uppercase">Puz/Page</label>
                                            <select value={puzzlesPerPage} onChange={(e) => setPuzzlesPerPage(Number(e.target.value))} className="w-full mt-1 border border-slate-200 rounded p-1.5 text-xs bg-white">
                                                <option value={1}>1</option>
                                                <option value={2}>2</option>
                                                <option value={4}>4</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-500 uppercase">Align</label>
                                            <select value={puzzleAlign} onChange={(e) => setPuzzleAlign(e.target.value as any)} className="w-full mt-1 border border-slate-200 rounded p-1.5 text-xs bg-white">
                                                <option value="left">Left</option>
                                                <option value="center">Center</option>
                                                <option value="right">Right</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* 3. Words List Style */}
                                <div className="space-y-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                    <h3 className="font-bold text-xs text-indigo-600 uppercase">Words List</h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div><label className="text-[10px] font-bold text-slate-500 uppercase">Sort</label><select value={wordsSort} onChange={(e) => setWordsSort(e.target.value as any)} className="w-full mt-1 border border-slate-200 rounded p-1.5 text-xs"><option value="random">Random</option><option value="alphabetical">A to Z</option><option value="length">Length</option></select></div>
                                        <div><label className="text-[10px] font-bold text-slate-500 uppercase">Text Size</label><input type="number" value={wordTextSize} onChange={(e) => setWordTextSize(Number(e.target.value))} className="w-full mt-1 border border-slate-200 rounded p-1.5 text-xs" /></div>
                                        <div className="col-span-2"><label className="text-[10px] font-bold text-slate-500 uppercase">Text Color</label><input type="color" value={wordTextColor} onChange={(e) => setWordTextColor(e.target.value)} className="w-full mt-1 h-6 border border-slate-200 rounded cursor-pointer" /></div>
                                    </div>
                                </div>

                                {/* 4. Solution Section */}
                                <div className="space-y-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                    <h3 className="font-bold text-xs text-indigo-600 uppercase">Solutions</h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div><label className="text-[10px] font-bold text-slate-500 uppercase">Sol/Page</label><select value={solutionsPerPage} onChange={(e) => setSolutionsPerPage(Number(e.target.value))} className="w-full mt-1 border border-slate-200 rounded p-1.5 text-xs"><option value={1}>1</option><option value={2}>2</option><option value={4}>4</option></select></div>
                                        <div className="col-span-2"><label className="text-[10px] font-bold text-slate-500 uppercase">Highlighter</label><select value={solutionHighlighter} onChange={(e) => setSolutionHighlighter(e.target.value as any)} className="w-full mt-1 border border-slate-200 rounded p-1.5 text-xs"><option value="apple">Apple (Rounded)</option><option value="fill">Fill Color</option><option value="fade">Fade Out</option></select></div>
                                    </div>
                                </div>

                                {/* 5. Data & Title */}
                                <div className="space-y-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                    <h3 className="font-bold text-xs text-indigo-600 uppercase flex justify-between items-center">Data & Title
                                        <button onClick={() => csvInputRef.current?.click()} className="flex items-center gap-1 text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded shadow-sm hover:bg-indigo-700"><FileText className="w-3 h-3"/> UPLOAD CSV</button>
                                        <input type="file" accept=".csv,.txt" ref={csvInputRef} onChange={handleCsvUpload} className="hidden" />
                                    </h3>
                                    <div className="flex items-center gap-2 mb-1">
                                        <input type="checkbox" checked={useFirstLineAsTitle} onChange={(e) => setUseFirstLineAsTitle(e.target.checked)} className="w-3 h-3 rounded text-indigo-600"/>
                                        <label className="text-[11px] font-semibold text-slate-600">Use First Line as Title</label>
                                    </div>
                                    <textarea value={words} onChange={(e) => setWords(e.target.value)} className="w-full h-24 border border-slate-200 rounded p-2 text-xs font-mono focus:ring-1 focus:ring-indigo-500 outline-none resize-none" placeholder="Paste words here..."/>
                                </div>
                            </div>
                            
                            <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 shrink-0">
                                <button onClick={handleGeneratePreview} className="w-full flex items-center justify-center gap-2 bg-slate-800 text-white px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-slate-700 transition-all active:scale-95 shadow-sm">
                                    <Eye className="w-4 h-4" /> GENERATE PREVIEW
                                </button>
                            </div>
                        </div>
                        
                        <div className="col-span-1 lg:col-span-3 bg-slate-100 rounded-xl shadow-inner border border-slate-200 flex flex-col items-center justify-center p-4 relative overflow-y-auto">
                            {previewGrid && answerMask ? (
                                <div className="bg-white p-6 shadow-2xl rounded-sm w-full max-w-lg aspect-[8.5/11] flex flex-col relative transition-all duration-500 border border-slate-200">
                                    <button onClick={() => setShowAnswers(!showAnswers)} className="absolute top-4 right-4 bg-indigo-50 p-2 rounded-full text-indigo-600 hover:bg-indigo-100 z-20 shadow-sm border border-indigo-200">
                                        {showAnswers ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                                    </button>
                                    
                                    <h3 className="font-black text-lg mb-4 uppercase tracking-widest text-slate-800" style={{ textAlign: puzzleAlign, fontFamily: lettersFont }}>
                                        {useFirstLineAsTitle && cleanWordsList.length > 0 ? `${cleanWordsList[0].title} #1` : 'Puzzle #1'}
                                    </h3>
                                    
                                    <div className="relative flex-1 w-full mx-auto max-h-[65%] flex flex-col justify-center">
                                        <div className="absolute inset-0 grid z-10" style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}>
                                            {previewGrid.map((row, r) => row.map((letter, c) => (
                                                <div key={`${r}-${c}`} className="flex items-center justify-center text-xs md:text-sm font-bold border-collapse" 
                                                    style={{ backgroundColor: (showAnswers && solutionHighlighter === 'fill' && answerMask[r][c]) ? '#E0E7FF' : cellColor, border: lineWidth > 0 ? `${lineWidth}px solid ${borderColor}` : 'none', fontFamily: lettersFont, color: (showAnswers && (solutionHighlighter === 'fade' || solutionHighlighter === 'apple') && !answerMask[r][c]) ? '#E2E8F0' : '#1E293B' }}>
                                                    {letter}
                                                </div>
                                            )))}
                                        </div>
                                        {showAnswers && solutionHighlighter === 'apple' && (
                                            <svg viewBox={`0 0 ${gridSize} ${gridSize}`} className="absolute inset-0 w-full h-full pointer-events-none z-0">
                                                {cleanWordsList.map((w, i) => {
                                                    const len = Math.hypot(w.endC - w.startC, w.endR - w.startR); const ang = Math.atan2(w.endR - w.startR, w.endC - w.startC) * (180 / Math.PI);
                                                    return <rect key={i} x={w.startC + 0.12} y={w.startR + 0.12} width={len + 0.76} height={0.76} rx="0.25" transform={`rotate(${ang}, ${w.startC + 0.5}, ${w.startR + 0.5})`} fill="rgba(79, 70, 229, 0.08)" stroke="#4F46E5" strokeWidth="0.08" />
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
                            ) : (
                                <div className="text-slate-400 flex flex-col items-center animate-pulse">
                                    <BookOpen className="w-16 h-16 mb-4 opacity-20" />
                                    <p className="font-bold text-lg">Interior Preview</p>
                                    <p className="text-xs">Adjust settings and click Generate Preview</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ================= PRO COVER STUDIO (BOOKBOLT STYLE + 3D MOCKUP) ================= */}
                {activeTab === 'cover' && (
                    <div className="flex h-[calc(100vh-140px)] rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm animate-in fade-in duration-300">
                        
                        <div className="w-16 bg-slate-900 flex flex-col items-center py-4 gap-4 border-r border-slate-800 z-20 text-slate-400">
                            <button onClick={() => setActiveToolTab('elements')} className={`p-3 rounded-xl transition-all ${activeToolTab === 'elements' ? 'bg-indigo-600 text-white' : 'hover:text-white'}`} title="Add Elements"><Plus className="w-5 h-5" /></button>
                            <button onClick={() => setActiveToolTab('layers')} className={`p-3 rounded-xl transition-all ${activeToolTab === 'layers' ? 'bg-indigo-600 text-white' : 'hover:text-white'}`} title="Layers"><Layers className="w-5 h-5" /></button>
                            <button onClick={() => setActiveToolTab('settings')} className={`p-3 rounded-xl transition-all ${activeToolTab === 'settings' ? 'bg-indigo-600 text-white' : 'hover:text-white'}`} title="Settings"><Settings className="w-5 h-5" /></button>
                            <div className="mt-auto flex flex-col gap-4">
                                <button onClick={() => setShow3DMockup(!show3DMockup)} className={`p-3 rounded-xl transition-all ${show3DMockup ? 'bg-amber-500 text-white animate-pulse' : 'hover:text-white'}`} title="3D Mockup Viewer"><Box className="w-5 h-5"/></button>
                                <button onClick={() => setSnapToGrid(!snapToGrid)} className={`p-3 rounded-xl transition-all ${snapToGrid ? 'text-emerald-400' : 'hover:text-white'}`} title="Toggle Snapping"><Magnet className="w-5 h-5" /></button>
                                <button onClick={() => setShowKdpGuides(!showKdpGuides)} className={`p-3 rounded-xl transition-all ${showKdpGuides ? 'text-pink-400' : 'hover:text-white'}`} title="Toggle KDP Guides"><LayoutTemplate className="w-5 h-5" /></button>
                            </div>
                        </div>

                        <div className="w-64 bg-slate-50 border-r border-slate-200 flex flex-col p-4 z-10 overflow-y-auto">
                            {activeToolTab === 'elements' && (
                                <div className="space-y-4">
                                    <h3 className="font-bold text-xs uppercase tracking-widest text-slate-400">Add to Canvas</h3>
                                    <button onClick={addNewText} className="w-full p-3 bg-white border border-slate-200 rounded-lg hover:border-indigo-500 text-sm font-bold flex items-center gap-2"><Type className="w-4 h-4"/> Heading Text</button>
                                    <button onClick={() => fileInputRef.current?.click()} className="w-full p-3 bg-white border border-slate-200 rounded-lg hover:border-indigo-500 text-sm font-bold flex items-center gap-2"><ImageIcon className="w-4 h-4"/> Upload Image</button>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button onClick={() => addNewShape('rect')} className="p-3 bg-white border border-slate-200 rounded-lg hover:border-indigo-500 text-sm font-bold flex items-center justify-center"><Square className="w-4 h-4"/></button>
                                        <button onClick={() => addNewShape('circle')} className="p-3 bg-white border border-slate-200 rounded-lg hover:border-indigo-500 text-sm font-bold flex items-center justify-center"><Circle className="w-4 h-4"/></button>
                                    </div>
                                    <input type="file" accept="image/png, image/jpeg" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
                                </div>
                            )}

                            {activeToolTab === 'layers' && (
                                <div className="space-y-2">
                                    <h3 className="font-bold text-xs uppercase tracking-widest text-slate-400 mb-4">Layers</h3>
                                    {[...coverElements].reverse().map((el) => (
                                        <div key={el.id} onClick={() => setActiveElementId(el.id)} className={`p-2 text-xs font-semibold rounded cursor-pointer border ${activeElementId === el.id ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'}`}>
                                            {el.name || el.type}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeToolTab === 'settings' && (
                                <div className="space-y-4">
                                    <h3 className="font-bold text-xs uppercase tracking-widest text-slate-400">Canvas Settings</h3>
                                    <div><label className="block text-xs font-bold text-slate-600 mb-1">Back Cover Color</label><input type="color" value={backCoverColor} onChange={(e) => setBackCoverColor(e.target.value)} className="w-full h-8 rounded border border-slate-200" /></div>
                                    <div><label className="block text-xs font-bold text-slate-600 mb-1">Front Cover Color</label><input type="color" value={frontCoverColor} onChange={(e) => setFrontCoverColor(e.target.value)} className="w-full h-8 rounded border border-slate-200" /></div>
                                </div>
                            )}

                            {activeElementId && (
                                <div className="mt-auto pt-4 border-t border-slate-200">
                                    <h3 className="font-bold text-xs uppercase tracking-widest text-slate-400 mb-2">Properties</h3>
                                    {coverElements.find(e => e.id === activeElementId)?.type === 'text' && (
                                        <textarea value={coverElements.find(e => e.id === activeElementId)?.text} onChange={(e) => setCoverElements(prev => prev.map(el => el.id === activeElementId ? { ...el, text: e.target.value } : el))} className="w-full p-2 text-xs rounded border border-slate-300 mb-2 focus:outline-none focus:border-indigo-500" rows={2}/>
                                    )}
                                    <div className="flex gap-2 mb-2">
                                        <input type="color" value={coverElements.find(e => e.id === activeElementId)?.color || '#000000'} onChange={(e) => setCoverElements(prev => prev.map(el => el.id === activeElementId ? { ...el, color: e.target.value } : el))} className="w-1/2 h-8 rounded border border-slate-300" title="Color"/>
                                        <input type="number" value={coverElements.find(e => e.id === activeElementId)?.width || coverElements.find(e => e.id === activeElementId)?.fontSize} onChange={(e) => setCoverElements(prev => prev.map(el => el.id === activeElementId ? { ...el, width: Number(e.target.value), fontSize: Number(e.target.value) } : el))} className="w-1/2 p-1 text-xs rounded border border-slate-300" title="Size"/>
                                    </div>
                                    <div className="flex justify-between mt-4">
                                        <div className="flex gap-1">
                                            <button onClick={() => moveLayer('up')} className="p-1.5 bg-slate-200 rounded hover:bg-slate-300" title="Bring Forward"><ArrowUpToLine className="w-3 h-3" /></button>
                                            <button onClick={() => moveLayer('down')} className="p-1.5 bg-slate-200 rounded hover:bg-slate-300" title="Send Backward"><ArrowDownToLine className="w-3 h-3" /></button>
                                        </div>
                                        <button onClick={() => { setCoverElements(prev => prev.filter(e => e.id !== activeElementId)); setActiveElementId(null); }} className="px-3 py-1.5 bg-red-100 text-red-600 text-xs font-bold rounded hover:bg-red-200">Delete</button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex-1 bg-slate-100 flex items-center justify-center p-8 relative overflow-hidden">
                            {!show3DMockup ? (
                                <div 
                                    className="relative w-full max-w-3xl shadow-2xl transition-all duration-300 select-none bg-white"
                                    style={{ background: `linear-gradient(to right, ${backCoverColor} 0%, ${backCoverColor} ${backCoverPercentage}%, ${frontCoverColor} ${backCoverPercentage}%, ${frontCoverColor} 100%)`, aspectRatio: `${coverTotalWidth} / ${coverTotalHeight}` }}
                                    ref={canvasRef} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerLeave={handlePointerUp} onClick={() => setActiveElementId(null)}
                                >
                                    {showKdpGuides && (
                                        <div className="absolute inset-0 pointer-events-none z-40">
                                            <div className="absolute inset-0 border-[0.25cqi] border-pink-500/80"></div>
                                            <div className="absolute inset-[0.25cqi] border-[0.1cqi] border-blue-400/80 border-dashed"></div>
                                            <div className="absolute top-0 bottom-0 left-[50%] bg-pink-500/20 border-x border-pink-500/80 flex items-center justify-center" style={{ width: `${(spineWidth / coverTotalWidth) * 100}%`, transform: 'translateX(-50%)' }}>
                                                <span className="text-[0.5cqi] text-pink-800 -rotate-90 whitespace-nowrap font-bold">SPINE SAFE AREA</span>
                                            </div>
                                            <div className="absolute bottom-[3%] left-[10%] w-[10%] h-[12%] bg-yellow-300/80 border-2 border-yellow-500 flex flex-col items-center justify-center text-yellow-900 overflow-hidden">
                                                <ScanBarcode className="w-[2cqi] h-[2cqi] mb-1" />
                                                <span className="text-[0.4cqi] font-bold text-center leading-tight">Barcode<br/>Location</span>
                                            </div>
                                        </div>
                                    )}

                                    {coverElements.map((el, index) => {
                                        const isSelected = activeElementId === el.id;
                                        const commonStyles: React.CSSProperties = { position: 'absolute', left: `${el.x}%`, top: `${el.y}%`, transform: 'translate(-50%, -50%)', zIndex: index + 10, opacity: el.opacity || 1, cursor: 'move' };

                                        if (el.type === 'text') {
                                            return <div key={el.id} onPointerDown={(e) => handlePointerDown(e, el.id)} className={`flex flex-col items-center justify-center text-center whitespace-pre-wrap leading-tight ${isSelected ? 'ring-2 ring-blue-500 bg-white/10' : 'hover:ring-1 ring-white/50'}`} style={{ ...commonStyles, color: el.color, fontWeight: el.fontWeight, fontFamily: el.fontFamily, fontSize: `calc(${el.fontSize} * 0.08cqi)` }}>{el.text}</div>
                                        } else if (el.type === 'image') {
                                            return <div key={el.id} onPointerDown={(e) => handlePointerDown(e, el.id)} className={`${isSelected ? 'ring-2 ring-blue-500' : 'hover:ring-1 ring-white/50'}`} style={{ ...commonStyles, width: `${el.width}%` }}><img src={el.src} alt="Graphic" className="w-full h-auto pointer-events-none" /></div>
                                        } else if (el.type === 'shape') {
                                            return <div key={el.id} onPointerDown={(e) => handlePointerDown(e, el.id)} className={`${isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : 'hover:ring-1 ring-white/50'}`} style={{ ...commonStyles, width: `${el.width}%`, aspectRatio: '1/1', backgroundColor: el.color, borderRadius: el.shapeType === 'circle' ? '50%' : '0%' }}></div>
                                        }
                                    })}
                                </div>
                            ) : (
                                /* 🚨 3D BOOK MOCKUP ENGINE 🚨 */
                                <div className="perspective-2000 animate-in zoom-in-95 duration-500 h-full flex items-center justify-center">
                                    <div className="book-3d-wrapper relative w-[300px] h-[400px] transition-transform duration-700 preserve-3d cursor-grab active:cursor-grabbing hover:rotate-y-[-20deg]">
                                        <div className="absolute top-0 bottom-0 left-0 w-8 origin-left rotate-y-[-90deg] translate-x-[-100%] shadow-inner border-y border-l border-slate-900" style={{ backgroundColor: backCoverColor }}></div>
                                        <div className="absolute inset-0 shadow-2xl rounded-r-sm overflow-hidden border border-slate-800" style={{ backgroundColor: frontCoverColor }}>
                                            <div className="relative w-full h-full">
                                                {coverElements.filter(e => e.x > 50).map((el) => (
                                                    <div key={el.id} className="absolute transform -translate-x-1/2 -translate-y-1/2 text-center" style={{ left: `${((el.x - 52) / 48) * 100}%`, top: `${el.y}%` }}>
                                                        {el.type === 'text' && <div style={{ color: el.color, fontSize: `calc(${el.fontSize} * 0.25px)`, fontWeight: 'bold' }}>{el.text}</div>}
                                                        {el.type === 'image' && <img src={el.src} style={{ width: `${el.width * 2}px` }} />}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="absolute top-[2%] bottom-[2%] right-[-10px] w-4 bg-slate-50 rotate-y-[90deg] origin-left border-l border-slate-200"></div>
                                    </div>
                                    <div className="absolute bottom-10 bg-white px-6 py-3 rounded-full shadow-xl border border-indigo-100 text-indigo-600 font-bold flex items-center gap-2 z-50">
                                        <Box className="w-5 h-5" /> 3D Preview Active: Rotate with Hover
                                        <button onClick={() => setShow3DMockup(false)} className="ml-4 text-xs bg-slate-100 px-3 py-1 rounded-full text-slate-500 hover:bg-slate-200 uppercase tracking-tighter">Close</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
            
            {/* 🚨 3D Perspective CSS Hack */}
            <style jsx global>{`
                .perspective-2000 { perspective: 2000px; }
                .preserve-3d { transform-style: preserve-3d; }
                .rotate-y-[-20deg] { transform: rotateY(-25deg) rotateX(5deg); }
                .book-3d-wrapper { transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1); }
            `}</style>
        </div>
    );
}
