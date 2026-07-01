"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import { Download, Grid3x3, Settings, Eye, EyeOff, BookOpen, Loader2, Palette, Type, LayoutTemplate, MousePointer2, Plus, Image as ImageIcon, ArrowUpToLine, ArrowDownToLine, SlidersHorizontal, Square, Circle, Layers, Magnet, ScanBarcode, FileText } from "lucide-react";
import { jsPDF } from "jspdf";
import CoverStudioCTA from "@/components/CoverStudioCTA";
import { drawCoverPagePart } from "../../utils/pdfExportService";

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
    const [activeTab, setActiveTab] = useState<'interior' | 'cover' | 'guide'>('interior'); 
    const [isGenerating, setIsGenerating] = useState(false);
    
    // 🚨 INTERIOR SETTINGS STATES 🚨
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
    
    const [solutionHighlighter, setSolutionHighlighter] = useState<'apple' | 'fill' | 'grayout' | 'fade'>('apple');
    const [useFirstLineAsTitle, setUseFirstLineAsTitle] = useState(false);
    const [includeCover, setIncludeCover] = useState(false);

    const [words, setWords] = useState("NEXTJS\nREACT\nPRISMA\nTAILWIND\nCODING\nJAVASCRIPT\nTYPESCRIPT\nDATABASE\nSERVER\nVERCEL\nGITHUB\nAPI\nJSON\nNODE\nFRONTEND\nBACKEND");
    const [previewGrid, setPreviewGrid] = useState<string[][] | null>(null);
    const [answerMask, setAnswerMask] = useState<boolean[][] | null>(null);
    const [cleanWordsList, setCleanWordsList] = useState<any[]>([]); 
    const [showAnswers, setShowAnswers] = useState(false); 
    const csvInputRef = useRef<HTMLInputElement>(null);

    // 🚨 COVER STUDIO PRO STATES 🚨
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

    // Dynamic Cover Math
    const spineWidth = (totalPuzzles * 2) * 0.002252; 
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
        e.stopPropagation(); setActiveElementId(id); setIsDragging(true); (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
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
        setIsDragging(false); 
        if ((e.currentTarget as HTMLElement).hasPointerCapture(e.pointerId)) {
            (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
        }
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

        let coverState = null;
        if (includeCover) {
            const saved = localStorage.getItem("kdp-cover-draft");
            if (saved) {
                try {
                    coverState = JSON.parse(saved);
                } catch (e) {
                    console.error("Error loading cover draft", e);
                }
            }
            if (!coverState) {
                alert("No saved cover found! Please design a cover in the Cover Studio first.");
                setIsGenerating(false);
                return;
            }
        }

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

        // 1. Draw Front Cover if integrated
        let firstPageAdded = false;
        if (includeCover && coverState) {
            await drawCoverPagePart(doc, coverState, 'front', trimSize.w, trimSize.h);
            firstPageAdded = true;
        }

        // ================= FRONT SECTION =================
        const puzZones = getZones(puzzlesPerPage, safeWidth, safeHeight, margin);
        const totalPuzPages = Math.ceil(totalPuzzles / puzzlesPerPage);

        for (let p = 0; p < totalPuzPages; p++) {
            if (firstPageAdded || p > 0) doc.addPage();
            firstPageAdded = true;
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
                const displayTitle = (useFirstLineAsTitle && titleText) ? `${titleText} #${puzIndex + 1}` : `Puzzle #${puzIndex + 1}`;
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

        // 3. Draw Back Cover if integrated
        if (includeCover && coverState) {
            doc.addPage();
            await drawCoverPagePart(doc, coverState, 'back', trimSize.w, trimSize.h);
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
            doc.setGState(new (doc as any).GState({ opacity: el.opacity || 1 }));

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
        doc.setGState(new (doc as any).GState({ opacity: 1 }));
        doc.save(`KDP_Pro_Cover_${trimSize.w}x${trimSize.h}.pdf`);
        setIsGenerating(false);
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0b0f19] p-4 md:p-8 font-sans text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-300">
            
            <header className="mb-6 flex justify-between items-center max-w-[1600px] mx-auto w-full">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-indigo-500/20">IS</div>
                    <h1 className="text-2xl font-black tracking-tight">Ismam Studio</h1>
                </div>
                <div className="flex bg-slate-200 dark:bg-slate-900 p-1 rounded-full border border-slate-300 dark:border-slate-800">
                    <button onClick={() => setActiveTab('interior')} className={`px-4 py-2 rounded-full font-bold text-xs md:text-sm transition-all flex items-center gap-1.5 ${activeTab === 'interior' ? 'bg-white dark:bg-slate-800 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}><Grid3x3 className="w-4 h-4"/> Interior</button>
                    <Link href="/studio?tab=cover" className="px-4 py-2 rounded-full font-bold text-xs md:text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1.5">
                        <Palette className="w-4 h-4"/> Cover Studio
                    </Link>
                    <button onClick={() => setActiveTab('guide')} className={`px-4 py-2 rounded-full font-bold text-xs md:text-sm transition-all flex items-center gap-1.5 ${activeTab === 'guide' ? 'bg-white dark:bg-slate-800 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}><BookOpen className="w-4 h-4"/> KDP Guide</button>
                </div>
            </header>

            <div className="flex-1 max-w-[1600px] w-full mx-auto">
                {/* ================= INTERIOR STUDIO UI ================= */}
                {activeTab === 'interior' && (
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-120px)]">
                        <div className="col-span-1 lg:col-span-1 bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden">
                            <h2 className="font-bold text-sm uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2 shrink-0"><Settings className="w-4 h-4" /> Global Settings</h2>
                            
                            <div className="space-y-6 overflow-y-auto flex-1 pr-2 custom-scrollbar">
                                {/* 1. Page Layout */}
                                <div className="space-y-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                    <h3 className="font-bold text-xs text-indigo-600 uppercase">Layout & Pages</h3>
                                    <div><label className="text-xs font-semibold text-slate-600">Trim Size</label><select value={`${trimSize.w}x${trimSize.h}`} onChange={(e) => setTrimSize(TRIM_SIZES.find(t => `${t.w}x${t.h}` === e.target.value) || TRIM_SIZES[0])} className="w-full mt-1 border border-slate-200 rounded p-1.5 text-xs">{TRIM_SIZES.map(t => <option key={t.label} value={`${t.w}x${t.h}`}>{t.label}</option>)}</select></div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div><label className="text-xs font-semibold text-slate-600">Total Puzzles</label><input type="number" value={totalPuzzles} onChange={(e) => setTotalPuzzles(Number(e.target.value))} className="w-full mt-1 border border-slate-200 rounded p-1.5 text-xs" /></div>
                                        <div><label className="text-xs font-semibold text-slate-600">Words/Puzzle</label><input type="number" value={wordsPerPage} onChange={(e) => setWordsPerPage(Number(e.target.value))} className="w-full mt-1 border border-slate-200 rounded p-1.5 text-xs" /></div>
                                        <div><label className="text-xs font-semibold text-slate-600">Puzzles/Page</label><select value={puzzlesPerPage} onChange={(e) => setPuzzlesPerPage(Number(e.target.value))} className="w-full mt-1 border border-slate-200 rounded p-1.5 text-xs"><option value={1}>1</option><option value={2}>2</option><option value={4}>4</option></select></div>
                                        <div><label className="text-xs font-semibold text-slate-600">Puzzle Align</label><select value={puzzleAlign} onChange={(e) => setPuzzleAlign(e.target.value as any)} className="w-full mt-1 border border-slate-200 rounded p-1.5 text-xs"><option value="left">Left</option><option value="center">Center</option><option value="right">Right</option></select></div>
                                    </div>
                                </div>

                                {/* 2. Grid Style */}
                                <div className="space-y-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                    <h3 className="font-bold text-xs text-indigo-600 uppercase">Puzzle Styling</h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div><label className="text-xs font-semibold text-slate-600">Grid Size</label><input type="number" value={gridSize} onChange={(e) => setGridSize(Number(e.target.value))} className="w-full mt-1 border border-slate-200 rounded p-1.5 text-xs" /></div>
                                        <div><label className="text-xs font-semibold text-slate-600">Letter Case</label><select value={textCase} onChange={(e) => setTextCase(e.target.value)} className="w-full mt-1 border border-slate-200 rounded p-1.5 text-xs"><option value="UPPERCASE">UPPERCASE</option><option value="lowercase">lowercase</option></select></div>
                                        <div><label className="text-xs font-semibold text-slate-600">Grid Font</label><select value={lettersFont} onChange={(e) => setLettersFont(e.target.value)} className="w-full mt-1 border border-slate-200 rounded p-1.5 text-xs"><option value="helvetica">Helvetica</option><option value="times">Times</option><option value="courier">Courier</option></select></div>
                                        <div><label className="text-xs font-semibold text-slate-600">Font Size</label><input type="number" value={letterTextSize} onChange={(e) => setLetterTextSize(Number(e.target.value))} className="w-full mt-1 border border-slate-200 rounded p-1.5 text-xs" /></div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <div><label className="text-xs font-semibold text-slate-600">Line Width</label><input type="number" min="0" step="0.5" value={lineWidth} onChange={(e) => setLineWidth(Number(e.target.value))} className="w-full mt-1 border border-slate-200 rounded p-1.5 text-xs" /></div>
                                        <div><label className="text-xs font-semibold text-slate-600">Cell Color</label><input type="color" value={cellColor} onChange={(e) => setCellColor(e.target.value)} className="w-full mt-1 h-8 border border-slate-200 rounded cursor-pointer" /></div>
                                        <div><label className="text-xs font-semibold text-slate-600">Border</label><input type="color" value={borderColor} onChange={(e) => setBorderColor(e.target.value)} className="w-full mt-1 h-8 border border-slate-200 rounded cursor-pointer" /></div>
                                    </div>
                                </div>

                                {/* 3. Words List Style */}
                                <div className="space-y-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                    <h3 className="font-bold text-xs text-indigo-600 uppercase">Words List</h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div><label className="text-xs font-semibold text-slate-600">Words Sort</label><select value={wordsSort} onChange={(e) => setWordsSort(e.target.value as any)} className="w-full mt-1 border border-slate-200 rounded p-1.5 text-xs"><option value="random">Random</option><option value="alphabetical">A to Z</option><option value="length">By Length</option></select></div>
                                        <div><label className="text-xs font-semibold text-slate-600">List Align</label><select value={wordTextAlign} onChange={(e) => setWordTextAlign(e.target.value as any)} className="w-full mt-1 border border-slate-200 rounded p-1.5 text-xs"><option value="left">Left</option><option value="center">Center</option></select></div>
                                        <div><label className="text-xs font-semibold text-slate-600">Text Font</label><select value={wordFont} onChange={(e) => setWordFont(e.target.value)} className="w-full mt-1 border border-slate-200 rounded p-1.5 text-xs"><option value="helvetica">Helvetica</option><option value="times">Times</option><option value="courier">Courier</option></select></div>
                                        <div><label className="text-xs font-semibold text-slate-600">Text Size</label><input type="number" value={wordTextSize} onChange={(e) => setWordTextSize(Number(e.target.value))} className="w-full mt-1 border border-slate-200 rounded p-1.5 text-xs" /></div>
                                        <div className="col-span-2"><label className="text-xs font-semibold text-slate-600">Text Color</label><input type="color" value={wordTextColor} onChange={(e) => setWordTextColor(e.target.value)} className="w-full mt-1 h-6 border border-slate-200 rounded cursor-pointer" /></div>
                                    </div>
                                </div>

                                {/* 4. Solution Section */}
                                <div className="space-y-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                    <h3 className="font-bold text-xs text-indigo-600 uppercase">Solutions Page</h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div><label className="text-xs font-semibold text-slate-600">Solutions/Page</label><select value={solutionsPerPage} onChange={(e) => setSolutionsPerPage(Number(e.target.value))} className="w-full mt-1 border border-slate-200 rounded p-1.5 text-xs"><option value={1}>1</option><option value={2}>2</option><option value={4}>4</option></select></div>
                                        <div><label className="text-xs font-semibold text-slate-600">Sol. Align</label><select value={solutionAlign} onChange={(e) => setSolutionAlign(e.target.value as any)} className="w-full mt-1 border border-slate-200 rounded p-1.5 text-xs"><option value="left">Left</option><option value="center">Center</option><option value="right">Right</option></select></div>
                                        <div className="col-span-2"><label className="text-xs font-semibold text-slate-600">Highlighter Style</label><select value={solutionHighlighter} onChange={(e) => setSolutionHighlighter(e.target.value as any)} className="w-full mt-1 border border-slate-200 rounded p-1.5 text-xs"><option value="apple">Apple Style (Rounded Line)</option><option value="fill">Cell Background Fill</option><option value="fade">Fade Out Non-Answers</option></select></div>
                                    </div>
                                </div>

                                {/* 5. Cover Section */}
                                <div className="space-y-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                    <h3 className="font-bold text-xs text-indigo-600 uppercase">Cover Settings</h3>
                                    <div className="flex items-center gap-2">
                                        <input type="checkbox" id="includeCover" checked={includeCover} onChange={(e) => setIncludeCover(e.target.checked)} className="w-4 h-4 rounded text-indigo-600" />
                                        <label htmlFor="includeCover" className="text-xs font-semibold text-slate-600 cursor-pointer select-none">Include Saved Cover Pages</label>
                                    </div>
                                </div>

                                {/* 5. Data & Title */}
                                <div className="space-y-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                    <h3 className="font-bold text-xs text-indigo-600 uppercase flex justify-between items-center">Data & Title
                                        <button onClick={() => csvInputRef.current?.click()} className="flex items-center gap-1 text-[10px] bg-indigo-100 text-indigo-700 px-2 py-1 rounded"><FileText className="w-3 h-3"/> CSV</button>
                                        <input type="file" accept=".csv,.txt" ref={csvInputRef} onChange={handleCsvUpload} className="hidden" />
                                    </h3>
                                    <div className="flex items-center gap-2 mb-2">
                                        <input type="checkbox" checked={useFirstLineAsTitle} onChange={(e) => setUseFirstLineAsTitle(e.target.checked)} className="w-4 h-4 rounded text-indigo-600"/>
                                        <label className="text-xs font-semibold text-slate-600">Use First Line as Title</label>
                                    </div>
                                    <textarea value={words} onChange={(e) => setWords(e.target.value)} className="w-full h-32 border border-slate-200 rounded p-2 text-xs font-mono focus:ring-2 outline-none resize-none" placeholder="Paste words or upload CSV..."/>
                                </div>
                            </div>
                            
                            <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 shrink-0">
                                <button onClick={handleGeneratePreview} className="w-full flex items-center justify-center gap-2 bg-slate-100 text-slate-700 px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-slate-200 transition-all border border-slate-200"><Eye className="w-4 h-4" /> Live Preview</button>
                                <button onClick={handleGenerateInterior} disabled={isGenerating} className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-3 rounded-lg text-sm font-bold hover:bg-indigo-700 shadow-md transition-all active:scale-95"><Download className="w-4 h-4" /> Download KDP PDF</button>
                                <CoverStudioCTA trimSize={`${trimSize.w}x${trimSize.h}`} />
                            </div>
                        </div>
                        
                        <div className="col-span-1 lg:col-span-3 bg-slate-100 rounded-xl shadow-inner border border-slate-200 flex flex-col items-center justify-center p-8 relative overflow-y-auto">
                            {previewGrid && answerMask ? (
                                <div className="bg-white p-8 shadow-xl rounded-sm w-full max-w-xl aspect-[8.5/11] flex flex-col relative" style={{ borderColor, borderWidth: `${lineWidth}px` }}>
                                    <button onClick={() => setShowAnswers(!showAnswers)} className="absolute top-4 right-4 bg-slate-100 p-2 rounded-full text-slate-600 hover:bg-slate-200 z-20">{showAnswers ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}</button>
                                    
                                    <h3 className="font-bold text-xl mb-4" style={{ textAlign: puzzleAlign, fontFamily: lettersFont }}>
                                        {useFirstLineAsTitle && cleanWordsList.length > 0 ? `${cleanWordsList[0].title} #1` : 'Puzzle #1'}
                                    </h3>
                                    
                                    <div className="relative flex-1 w-full mx-auto max-h-[60%] flex flex-col justify-center">
                                        <div className="absolute inset-0 grid z-10" style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}>
                                            {previewGrid.map((row, r) => row.map((letter, c) => (
                                                <div key={`${r}-${c}`} className="flex items-center justify-center font-bold" 
                                                    style={{ 
                                                        backgroundColor: (showAnswers && solutionHighlighter === 'fill' && answerMask[r][c]) ? '#E2E8F0' : cellColor, 
                                                        borderWidth: `${lineWidth}px`, borderColor, 
                                                        fontFamily: lettersFont, 
                                                        color: (showAnswers && solutionHighlighter === 'fade' && !answerMask[r][c]) ? '#D1D5DB' : '#000000'
                                                    }}>
                                                    {letter}
                                                </div>
                                            )))}
                                        </div>
                                        {showAnswers && solutionHighlighter === 'apple' && (
                                            <svg viewBox={`0 0 ${gridSize} ${gridSize}`} className="absolute inset-0 w-full h-full pointer-events-none z-0">
                                                {cleanWordsList.map((w, i) => {
                                                    const len = Math.hypot(w.endC - w.startC, w.endR - w.startR); const ang = Math.atan2(w.endR - w.startR, w.endC - w.startC) * (180 / Math.PI);
                                                    return <rect key={i} x={w.startC + 0.1} y={w.startR + 0.1} width={len + 0.8} height={0.8} rx="0.4" transform={`rotate(${ang}, ${w.startC + 0.5}, ${w.startR + 0.5})`} fill="transparent" stroke="#94A3B8" strokeWidth="0.08" />
                                                })}
                                            </svg>
                                        )}
                                    </div>
                                    <div className="w-full mt-6" style={{ textAlign: wordTextAlign, fontFamily: wordFont, color: wordTextColor }}>
                                        <h4 className="font-bold mb-2">Words to Find:</h4>
                                        <div className="grid grid-cols-4 gap-2 text-sm">
                                            {cleanWordsList.map((w, i) => <span key={i}>{w.text}</span>)}
                                        </div>
                                    </div>
                                </div>
                            ) : <div className="text-slate-400 flex flex-col items-center"><BookOpen className="w-12 h-12 mb-2 opacity-50" /><p>Adjust settings and click Live Preview</p></div>}
                        </div>
                    </div>
                )}



                {/* ================= KDP PUBLISHING GUIDE UI ================= */}
                {activeTab === 'guide' && (
                    <div className="bg-white dark:bg-slate-900/60 p-8 md:p-12 rounded-[2.5rem] border border-slate-200 dark:border-slate-850 space-y-8 animate-fade-in text-slate-600 dark:text-slate-350 text-sm leading-relaxed font-semibold max-w-4xl mx-auto mt-6 shadow-sm">
                        <section className="space-y-3">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-indigo-500 dark:text-indigo-400" /> KDP Word Search Specifications
                            </h3>
                            <p>
                                Word Search puzzle books are highly sought-after on Amazon KDP. To ensure your interior prints flawlessly, consider these settings:
                            </p>
                            <ul className="list-disc list-inside pl-4 space-y-2 text-slate-500 dark:text-slate-400">
                                <li>**8.5" x 11" (Standard Trim)**: This is the industry-standard dimension for Word Search collections. It provides ample space for both the letter grid and the word list below.</li>
                                <li>**Grid Size complexity**: 12x12 is ideal for children or casual solvers, while 15x15 to 20x20 is perfect for adults looking for a challenge.</li>
                                <li>**Gutter Safety margins**: Keep borders inside the 0.5-inch safety buffer. All PDF compilations generated by Ismam Studio automatically calculate margins so KDP review passes without error.</li>
                            </ul>
                        </section>

                        <section className="space-y-3">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-indigo-500 dark:text-indigo-400" /> Custom Word Lists & CSV Uploads
                            </h3>
                            <p>
                                Instead of generic words, create themed books (e.g. "Nature lovers Word Search", "90s Retro Movies"). 
                                You can upload a list of custom words via CSV, setting the **Words Per Puzzle** value on the Settings sidebar. 
                                The system will dynamically generate the layout and matching solution pages.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-indigo-500 dark:text-indigo-400" /> Export & Compile Checklist
                            </h3>
                            <ol className="list-decimal list-inside pl-4 space-y-2 text-slate-500 dark:text-slate-400 font-bold">
                                <li>Configure grid settings, paste or upload your words, and click **Export PDF** to get your interior pages.</li>
                                <li>Solution pages are automatically generated at the end of the document. Write down your final page count.</li>
                                <li>Switch to **Cover Studio** tab, input your page count to calculate the spine width, and design your cover layout using snap-to-grid tools.</li>
                                <li>Download KDP cover PDF and upload both files directly to Amazon KDP portal!</li>
                            </ol>
                        </section>
                    </div>
                )}
            </div>
        </div>
    );
}