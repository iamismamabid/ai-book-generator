"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Download, Grid3x3, Settings, Eye, EyeOff, BookOpen, Loader2, Palette, Type, LayoutTemplate, MousePointer2, Plus, Image as ImageIcon, ArrowUpToLine, ArrowDownToLine, SlidersHorizontal, Square, Circle, Layers, Magnet, ScanBarcode, FileText, Lock, Sparkles } from "lucide-react";
import CoverStudioCTA from "@/components/CoverStudioCTA";
import SaveToNotebookButton from "@/app/components/SaveToNotebookButton";
import { generatePuzzleGrid, WordSearchShape } from "../../utils/puzzleEngine";
import { WORD_SEARCH_THEMES, WORD_SEARCH_THEME_CATEGORIES } from "@/lib/wordSearchThemes";
import ExportInteriorModal from "@/components/ExportInteriorModal";
import { useRouter } from "next/navigation";
import { checkPremiumStatus, getNotebookEntryData } from "@/app/actions";

const WORD_SEARCH_SHAPES: { id: WordSearchShape; label: string }[] = [
    { id: "square", label: "Square" },
    { id: "circle", label: "Circle" },
    { id: "heart", label: "Heart" },
    { id: "diamond", label: "Diamond" },
    { id: "star", label: "Star" },
];

const TRIM_SIZES = [
    { label: '8.5" x 11" (Letter)', w: 8.5, h: 11 },
    { label: '6" x 9" (Novel)', w: 6, h: 9 },
    { label: '8" x 10" (Workbook)', w: 8, h: 10 }
];

export default function WordSearchStudio() {
    const [premiumStatus, setPremiumStatus] = useState({ checked: false, isPremium: false, plan: "free" });
    const router = useRouter();

    useEffect(() => {
        async function loadPremium() {
            try {
                const res = await checkPremiumStatus();
                setPremiumStatus(res as any);
            } catch (err) {
                console.error(err);
            }
        }
        loadPremium();
    }, []);

    const [activeTab, setActiveTab] = useState<'interior' | 'cover' | 'guide'>('interior'); 
    const [isGenerating, setIsGenerating] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    
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

    // 🚨 SHAPE / THEME / HIDDEN MESSAGE STATES 🚨
    const [puzzleShape, setPuzzleShape] = useState<WordSearchShape>("square");
    const [selectedThemeId, setSelectedThemeId] = useState<string>("");
    const [hiddenMessage, setHiddenMessage] = useState<string>("");
    const [previewActive, setPreviewActive] = useState<boolean[][] | null>(null);
    const [previewHiddenMessageCells, setPreviewHiddenMessageCells] = useState<{ r: number; c: number }[] | null>(null);

    const handleThemeSelect = (themeId: string) => {
        setSelectedThemeId(themeId);
        if (!themeId) return;
        const theme = WORD_SEARCH_THEMES.find(t => t.id === themeId);
        if (theme) {
            setWords(theme.words.join("\n"));
            // Themes vary in size (12-20 words); never leave "words per page"
            // set higher than what the theme can actually supply.
            setWordsPerPage(prev => Math.min(prev, theme.words.length));
        }
    };

    // Restore a saved My Notebook entry (via /tools/word-search?notebookId=...)
    // back into these generator settings.
    useEffect(() => {
        if (typeof window === "undefined") return;
        const notebookId = new URLSearchParams(window.location.search).get("notebookId");
        if (!notebookId) return;

        getNotebookEntryData(notebookId).then((res) => {
            if (!res.success || !res.data) return;
            const d: any = res.data;

            if (d.trimSize) {
                const match = TRIM_SIZES.find(t => t.label === d.trimSize.label);
                if (match) setTrimSize(match);
            }
            if (typeof d.totalPuzzles === "number") setTotalPuzzles(d.totalPuzzles);
            if (typeof d.gridSize === "number") setGridSize(d.gridSize);
            if (typeof d.wordsPerPage === "number") setWordsPerPage(d.wordsPerPage);
            if (typeof d.puzzlesPerPage === "number") setPuzzlesPerPage(d.puzzlesPerPage);
            if (d.puzzleAlign) setPuzzleAlign(d.puzzleAlign);
            if (typeof d.solutionsPerPage === "number") setSolutionsPerPage(d.solutionsPerPage);
            if (d.solutionAlign) setSolutionAlign(d.solutionAlign);
            if (d.lettersFont) setLettersFont(d.lettersFont);
            if (typeof d.letterTextSize === "number") setLetterTextSize(d.letterTextSize);
            if (typeof d.lineWidth === "number") setLineWidth(d.lineWidth);
            if (d.cellColor) setCellColor(d.cellColor);
            if (d.borderColor) setBorderColor(d.borderColor);
            if (d.textCase) setTextCase(d.textCase);
            if (d.wordsSort) setWordsSort(d.wordsSort);
            if (d.wordTextAlign) setWordTextAlign(d.wordTextAlign);
            if (d.wordFont) setWordFont(d.wordFont);
            if (typeof d.wordTextSize === "number") setWordTextSize(d.wordTextSize);
            if (d.wordTextColor) setWordTextColor(d.wordTextColor);
            if (d.solutionHighlighter) setSolutionHighlighter(d.solutionHighlighter);
            if (typeof d.useFirstLineAsTitle === "boolean") setUseFirstLineAsTitle(d.useFirstLineAsTitle);
            if (typeof d.includeCover === "boolean") setIncludeCover(d.includeCover);
            if (typeof d.words === "string") setWords(d.words);
            if (d.puzzleShape) setPuzzleShape(d.puzzleShape);
            if (typeof d.selectedThemeId === "string") setSelectedThemeId(d.selectedThemeId);
            if (typeof d.hiddenMessage === "string") setHiddenMessage(d.hiddenMessage);
        }).catch((err) => console.error("Failed to load notebook entry:", err));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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

    // Caps how large an individual letter cell is allowed to render, in
    // inches. Without this, a small grid (few letters) stretches to fill
    // its whole zone just like a dense one, producing oversized, unbalanced
    // letters -- capping by grid dimension keeps cell size consistent with
    // standard published word search books regardless of letter count.
    const STANDARD_WORD_SEARCH_CELL_IN = 0.45;

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

        const { grid, words: cleanWords, mask, active, hiddenMessage: placedMessage } = generatePuzzleGrid(randomSubset, gridSize, textCase, { shape: puzzleShape, hiddenMessage });
        setPreviewGrid(grid); setCleanWordsList(cleanWords.map(cw => ({...cw, title: titleText}))); setAnswerMask(mask); setPreviewActive(active); setPreviewHiddenMessageCells(placedMessage?.cells || null); setShowAnswers(false);
    };

    const handleGenerateInterior = async (options: {
        includeCover: boolean;
        coverState: any;
        includeSolutions: boolean;
        trimSize: "6x9" | "8.5x11" | "5x8";
        isPremium?: boolean;
    }) => {
        const { includeCover: incCover, coverState, includeSolutions: incSol, trimSize: finalTrim, isPremium } = options;
        setIsGenerating(true);
        const { cleanedWords, titleText } = getCleanMasterList();
        if (cleanedWords.length < wordsPerPage) { alert(`Add more words!`); setIsGenerating(false); return; }

        await new Promise(resolve => setTimeout(resolve, 100));

        let finalW = 8.5;
        let finalH = 11;
        if (finalTrim === "6x9") {
            finalW = 6;
            finalH = 9;
        } else if (finalTrim === "5x8") {
            finalW = 5;
            finalH = 8;
        }

        const [{ jsPDF }, { drawCoverPagePart, drawWatermark, drawWordSearchGrid, drawWordSearchWordList }] = await Promise.all([
            import("jspdf"),
            import("../../utils/pdfExportService"),
        ]);
        const doc = new jsPDF({ orientation: "portrait", unit: "in", format: [finalW, finalH] });
        const margin = 0.5; const safeWidth = finalW - (margin * 2); const safeHeight = finalH - (margin * 2);

        const bookPuzzles = [];
        for (let i = 0; i < totalPuzzles; i++) {
            let subset = [...cleanedWords].sort(() => 0.5 - Math.random()).slice(0, wordsPerPage);
            if (wordsSort === 'alphabetical') subset.sort((a,b) => a.localeCompare(b));
            if (wordsSort === 'length') subset.sort((a,b) => a.length - b.length || a.localeCompare(b));
            bookPuzzles.push(generatePuzzleGrid(subset, gridSize, textCase, { shape: puzzleShape, hiddenMessage }));
        }

        // 1. Draw Front Cover if integrated
        let firstPageAdded = false;
        if (incCover && coverState) {
            await drawCoverPagePart(doc, coverState, 'front', finalW, finalH);
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
                const { grid, words: pageWords, mask, active } = bookPuzzles[puzIndex];

                const titleSpace = 0.4; const wordListSpace = puzzlesPerPage === 4 ? 0.8 : 1.5;
                const gridDrawSize = Math.min(zone.w, zone.h - titleSpace - wordListSpace, gridSize * STANDARD_WORD_SEARCH_CELL_IN);

                let startX = zone.x;
                if (puzzleAlign === 'center') startX = zone.x + (zone.w - gridDrawSize)/2;
                if (puzzleAlign === 'right') startX = zone.x + zone.w - gridDrawSize;
                const startY = zone.y + titleSpace;

                // Draw title
                doc.setFont(lettersFont, "bold"); doc.setFontSize(16); doc.setTextColor('#000000');
                const titleStr = useFirstLineAsTitle && titleText ? `${titleText} #${puzIndex + 1}` : `Puzzle #${puzIndex + 1}`;
                doc.text(titleStr, zone.x + zone.w/2, zone.y + 0.25, { align: "center" });

                // Draw grid + word bank via the shared word search PDF primitives
                // (also used by pdfExportService.ts and the bulk generator)
                drawWordSearchGrid(doc, { grid, words: pageWords, mask, active }, { x: startX, y: startY, size: gridDrawSize }, false, {
                    font: lettersFont,
                    letterFontSize: letterTextSize * (gridDrawSize / 6.5),
                    lineWidth: lineWidth * 0.01,
                    cellColor,
                    borderColor,
                    letterBold: false,
                });

                const wordRowStep = 0.22;
                const wordColumns = puzzlesPerPage === 4 ? 2 : 3;
                drawWordSearchWordList(doc, pageWords, { x: zone.x, y: startY + gridDrawSize + 0.3 - wordRowStep, w: zone.w }, {
                    style: { wordFont, wordFontSize: wordTextSize, wordTextColor, wordTextAlign, wordColumns, wordRowStep },
                });
            }
        }

        // ================= ANSWER KEYS SECTION =================
        if (incSol) {
            const solZones = getZones(solutionsPerPage, safeWidth, safeHeight, margin);
            const totalSolPages = Math.ceil(totalPuzzles / solutionsPerPage);

            for (let p = 0; p < totalSolPages; p++) {
                doc.addPage();
                for (let z = 0; z < solutionsPerPage; z++) {
                    const solIndex = (p * solutionsPerPage) + z;
                    if (solIndex >= totalPuzzles) break;
                    const zone = solZones[z];
                    const { grid, words: pageWords, mask, active, hiddenMessage: solHiddenMessage } = bookPuzzles[solIndex];

                    const titleSpace = 0.4;
                    const gridDrawSize = Math.min(zone.w, zone.h - titleSpace, gridSize * STANDARD_WORD_SEARCH_CELL_IN);

                    let startX = zone.x;
                    if (solutionAlign === 'center') startX = zone.x + (zone.w - gridDrawSize)/2;
                    if (solutionAlign === 'right') startX = zone.x + zone.w - gridDrawSize;
                    const startY = zone.y + titleSpace;

                    doc.setFont(lettersFont, "bold"); doc.setFontSize(16); doc.setTextColor('#000000');
                    doc.text(`Answer #${solIndex + 1}`, zone.x + zone.w/2, zone.y + 0.2, { align: "center" });

                    // Highlighted answer grid via the shared word search PDF primitive
                    // (also used by pdfExportService.ts and the bulk generator)
                    drawWordSearchGrid(doc, { grid, words: pageWords, mask, active, hiddenMessage: solHiddenMessage }, { x: startX, y: startY, size: gridDrawSize }, true, {
                        font: lettersFont,
                        letterFontSize: letterTextSize * (gridDrawSize / 6.5),
                        highlightColor: '#E2E8F0',
                        highlightTextColor: '#000000',
                        solutionHighlighter: solutionHighlighter === 'grayout' ? 'fade' : solutionHighlighter,
                        letterBold: false,
                    });
                }
            }
        }

        // 3. Draw Back Cover if integrated
        if (incCover && coverState) {
            doc.addPage();
            await drawCoverPagePart(doc, coverState, 'back', finalW, finalH);
        }

        // Apply watermark to all interior pages if not premium
        if (isPremium === false) {
            const totalPages = doc.getNumberOfPages();
            for (let i = 1; i <= totalPages; i++) {
                const isFrontCover = incCover && coverState && i === 1;
                const isBackCover = incCover && coverState && i === totalPages;
                if (!isFrontCover && !isBackCover) {
                    doc.setPage(i);
                    drawWatermark(doc, finalW, finalH);
                }
            }
        }

        doc.save(`KDP_Interior_${finalW}x${finalH}.pdf`);
        setIsGenerating(false);
    };

    // 🖨️ PRO COVER PDF GENERATOR
    const handleGenerateCover = async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        const { jsPDF } = await import("jspdf");
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

    if (premiumStatus.checked && (premiumStatus.plan === "free" || premiumStatus.plan === "starter")) {
        return (
            <div className="min-h-screen bg-[#0b0f19] text-white flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
                {/* Glow element */}
                <div className="absolute top-0 left-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

                <div className="max-w-md w-full bg-slate-900/60 border border-slate-900 p-8 rounded-[2.5rem] shadow-2xl relative z-10 space-y-6">
                    <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 border border-amber-500/20 mx-auto">
                        <Lock className="w-8 h-8" />
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-2xl font-black bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent uppercase tracking-tight">
                            Word Search Studio is Locked
                        </h2>
                        <p className="text-slate-400 text-xs font-semibold leading-relaxed">
                            Full Word Search board compiling and custom CSV list imports are premium features available on our **Pro Studio** and **Publisher Agency** plans.
                        </p>
                    </div>

                    <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-900/40 text-left space-y-2 text-[11px] font-bold text-slate-300">
                        <div className="flex items-center gap-2 text-indigo-400 text-[10px] uppercase tracking-wider mb-1">
                            <Sparkles className="w-3.5 h-3.5" /> Pro Plan Benefits:
                        </div>
                        <p>✓ High-capacity Word Search collections</p>
                        <p>✓ Watermark-free, print-ready PDF compile</p>
                        <p>✓ Bulk CSV upload to instantly build boards</p>
                        <p>✓ Access to Cover Studio & Interior Canvas Builder</p>
                    </div>

                    <div className="flex flex-col gap-2 pt-2">
                        <Link 
                            href="/pricing"
                            className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-black text-xs rounded-xl shadow-lg transition-all"
                        >
                            Upgrade to Pro Studio
                        </Link>
                        <button 
                            onClick={() => router.push("/")}
                            className="w-full py-4 bg-slate-950 hover:bg-slate-900 text-slate-400 border border-slate-900 font-black text-xs rounded-xl transition"
                        >
                            Back to Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0b0f19] p-4 md:p-8 font-sans text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-300">
            
            <header className="mb-6 flex justify-between items-center max-w-[1600px] mx-auto w-full">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-indigo-500/20">IS</div>
                    <h1 className="text-2xl font-black tracking-tight">KDPage</h1>
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

                                {/* Puzzle Shape, Theme & Hidden Message */}
                                <div className="space-y-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                    <h3 className="font-bold text-xs text-indigo-600 uppercase">Puzzle Shape & Extras</h3>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-600">Grid Shape</label>
                                        <div className="grid grid-cols-5 gap-1.5 mt-1">
                                            {WORD_SEARCH_SHAPES.map(({ id, label }) => (
                                                <button
                                                    key={id}
                                                    type="button"
                                                    onClick={() => setPuzzleShape(id)}
                                                    title={label}
                                                    className={`py-1.5 rounded text-[10px] font-bold border transition-all ${puzzleShape === id ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'}`}
                                                >
                                                    {label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-600">Themed Word List</label>
                                        <select
                                            value={selectedThemeId}
                                            onChange={(e) => handleThemeSelect(e.target.value)}
                                            className="w-full mt-1 border border-slate-200 rounded p-1.5 text-xs"
                                        >
                                            <option value="">— Custom (edit below) —</option>
                                            {WORD_SEARCH_THEME_CATEGORIES.map(category => (
                                                <optgroup key={category} label={category}>
                                                    {WORD_SEARCH_THEMES.filter(t => t.category === category).map(t => (
                                                        <option key={t.id} value={t.id}>{t.name}</option>
                                                    ))}
                                                </optgroup>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-600">Hidden Message (optional)</label>
                                        <input
                                            type="text"
                                            value={hiddenMessage}
                                            onChange={(e) => setHiddenMessage(e.target.value)}
                                            placeholder="e.g. HAPPY BIRTHDAY"
                                            className="w-full mt-1 border border-slate-200 rounded p-1.5 text-xs"
                                        />
                                        <p className="text-[10px] text-slate-400 mt-1">Leftover letters (after all words are found) spell this out — shown highlighted in amber on the answer page.</p>
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
                                <button onClick={() => setIsExportModalOpen(true)} disabled={isGenerating} className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-3 rounded-lg text-sm font-bold hover:bg-indigo-700 shadow-md transition-all active:scale-95"><Download className="w-4 h-4" /> Download KDP PDF</button>
                                <SaveToNotebookButton
                                    title={`Word Search Collection (${totalPuzzles} Puzzles)`}
                                    content={`Word Search interior with ${wordsPerPage} words per puzzle, ${puzzlesPerPage} puzzles per page, trim size ${trimSize.w}x${trimSize.h}`}
                                    category="word-search"
                                    data={{
                                        trimSize, totalPuzzles, gridSize, wordsPerPage,
                                        puzzlesPerPage, puzzleAlign, solutionsPerPage, solutionAlign,
                                        lettersFont, letterTextSize, lineWidth, cellColor, borderColor, textCase,
                                        wordsSort, wordTextAlign, wordFont, wordTextSize, wordTextColor,
                                        solutionHighlighter, useFirstLineAsTitle, includeCover,
                                        words, puzzleShape, selectedThemeId, hiddenMessage,
                                    }}
                                    className="w-full justify-center"
                                />
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
                                            {previewGrid.map((row, r) => row.map((letter, c) => {
                                                const isActiveCell = !previewActive || previewActive[r][c];
                                                const isMessageCell = showAnswers && previewHiddenMessageCells?.some(m => m.r === r && m.c === c);
                                                if (!isActiveCell) return <div key={`${r}-${c}`} style={{ visibility: "hidden" }} />;
                                                return (
                                                    <div key={`${r}-${c}`} className="flex items-center justify-center font-bold"
                                                        style={{
                                                            backgroundColor: isMessageCell ? '#FCD34D' : (showAnswers && solutionHighlighter === 'fill' && answerMask[r][c]) ? '#E2E8F0' : cellColor,
                                                            borderWidth: `${lineWidth}px`, borderColor,
                                                            fontFamily: lettersFont,
                                                            color: (showAnswers && solutionHighlighter === 'fade' && !answerMask[r][c] && !isMessageCell) ? '#D1D5DB' : '#000000'
                                                        }}>
                                                        {letter}
                                                    </div>
                                                );
                                            }))}
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
                    <div className="bg-white dark:bg-slate-900/60 p-8 md:p-12 rounded-[2.5rem] border border-slate-200 dark:border-slate-900 space-y-8 animate-fade-in text-slate-600 dark:text-slate-300 text-sm leading-relaxed font-semibold max-w-4xl mx-auto mt-6 shadow-sm">
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
                                <li>**Gutter Safety margins**: Keep borders inside the 0.5-inch safety buffer. All PDF compilations generated by KDPage automatically calculate margins so KDP review passes without error.</li>
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

            <ExportInteriorModal
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                defaultTrimSize="8.5x11"
                onExport={handleGenerateInterior}
            />
        </div>
    );
}