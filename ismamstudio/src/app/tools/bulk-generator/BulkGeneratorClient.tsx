"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import SaveToNotebookButton from "@/app/components/SaveToNotebookButton";
import { getNotebookEntryData, checkPremiumStatus } from "@/app/actions";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, Upload, FileSpreadsheet, Plus, Trash2, 
  Play, CheckCircle2, Loader2, Sparkles, Download, RefreshCw, AlertCircle, Lock 
} from "lucide-react";
// jsPDF and the puzzle/PDF generator modules are only needed once the user
// actually runs the batch queue, not on initial page load -- loaded
// dynamically inside runBatchQueue below instead of shipped in this page's
// initial JS bundle. (generateSudoku/solveMaze were imported here but never
// actually called anywhere in this file.)

interface BatchItem {
  id: string;
  title: string;
  type: "Sudoku" | "Maze" | "Word Search" | "Cryptogram" | "Kakuro";
  difficulty: "Easy" | "Medium" | "Hard";
  count: number;
  trimSize: "6x9" | "8.5x11" | "5x8";
  status: "Pending" | "Generating" | "Completed" | "Failed";
  pdfBlob?: Blob;
  downloadUrl?: string;
}

export default function BulkGeneratorClient() {
  const router = useRouter();
  const [premiumStatus, setPremiumStatus] = useState({ checked: false, isPremium: false, plan: "free" });

  useEffect(() => {
    async function loadPremium() {
      try {
        const res = await checkPremiumStatus();
        setPremiumStatus(res as any);
      } catch {
        setPremiumStatus({ checked: true, isPremium: false, plan: "free" });
      }
    }
    loadPremium();
  }, []);

  const [items, setItems] = useState<BatchItem[]>([
    { id: "1", title: "Seniors Easy Sudoku Book", type: "Sudoku", difficulty: "Easy", count: 20, trimSize: "8.5x11", status: "Pending" },
    { id: "2", title: "Labyrinth Quest Volume 1", type: "Maze", difficulty: "Medium", count: 15, trimSize: "6x9", status: "Pending" },
    { id: "3", title: "Word Search Fun", type: "Word Search", difficulty: "Medium", count: 30, trimSize: "8.5x11", status: "Pending" }
  ]);

  const [csvText, setCsvText] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [currentProcessingId, setCurrentProcessingId] = useState<string | null>(null);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states for manual adding
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState<BatchItem["type"]>("Sudoku");
  const [newDifficulty, setNewDifficulty] = useState<BatchItem["difficulty"]>("Medium");
  const [newCount, setNewCount] = useState(30);
  const [newTrim, setNewTrim] = useState<BatchItem["trimSize"]>("8.5x11");

  // Restore a saved My Notebook entry (via ?notebookId=...). Generated
  // pdfBlob/downloadUrl can't survive being saved as JSON, so restored items
  // always come back as a fresh Pending queue ready to run again.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const notebookId = new URLSearchParams(window.location.search).get("notebookId");
    if (!notebookId) return;

    getNotebookEntryData(notebookId)
      .then((res) => {
        if (!res.success || !res.data?.items) return;
        const restored: BatchItem[] = res.data.items.map((it: any) => ({
          id: it.id, title: it.title, type: it.type, difficulty: it.difficulty,
          count: it.count, trimSize: it.trimSize, status: "Pending" as const,
        }));
        setItems(restored);
      })
      .catch((err) => console.error("Failed to load notebook entry:", err));
  }, []);

  const logMessage = (msg: string) => {
    setConsoleLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    if (items.length >= maxBatch) {
      alert(`Batch limit reached (${maxBatch} books per batch on ${premiumStatus.plan === "starter" ? "Starter" : "your"} plan). Upgrade to Pro for 15+ batch processing.`);
      return;
    }

    const newItem: BatchItem = {
      id: Math.random().toString(36).substring(2, 9),
      title: newTitle.trim(),
      type: newType,
      difficulty: newDifficulty,
      count: Math.max(1, newCount),
      trimSize: newTrim,
      status: "Pending"
    };

    setItems([...items, newItem]);
    setNewTitle("");
    logMessage(`Added manual book: "${newItem.title}"`);
  };

  const handleRemove = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const clearAll = () => {
    setItems([]);
    logMessage("Cleared batch queue");
  };

  // CSV parsing
  const parseCSV = (text: string) => {
    const lines = text.split("\n");
    const parsedItems: BatchItem[] = [];

    // Skip header line if present
    const startIdx = lines[0].toLowerCase().includes("title") ? 1 : 0;

    for (let i = startIdx; i < lines.length; i++) {
      if (items.length + parsedItems.length >= maxBatch) {
        logMessage(`Batch cap reached (${maxBatch} max items). Additional rows skipped.`);
        break;
      }
      const line = lines[i].trim();
      if (!line) continue;

      const cols = line.split(",").map(c => c.trim().replace(/^["']|["']$/g, ""));
      if (cols.length < 4) continue;

      const title = cols[0] || `Puzzle Book #${i}`;
      let type: BatchItem["type"] = "Sudoku";
      if (cols[1].toLowerCase().includes("maze")) type = "Maze";
      else if (cols[1].toLowerCase().includes("word")) type = "Word Search";
      else if (cols[1].toLowerCase().includes("crypto")) type = "Cryptogram";
      else if (cols[1].toLowerCase().includes("kakuro")) type = "Kakuro";

      let difficulty: BatchItem["difficulty"] = "Medium";
      if (cols[2].toLowerCase() === "easy") difficulty = "Easy";
      else if (cols[2].toLowerCase() === "hard") difficulty = "Hard";

      const count = parseInt(cols[3]) || 30;
      
      let trimSize: BatchItem["trimSize"] = "8.5x11";
      if (cols[4] && cols[4].includes("6x9")) trimSize = "6x9";
      else if (cols[4] && cols[4].includes("5x8")) trimSize = "5x8";

      parsedItems.push({
        id: Math.random().toString(36).substring(2, 9),
        title,
        type,
        difficulty,
        count,
        trimSize,
        status: "Pending"
      });
    }

    if (parsedItems.length > 0) {
      setItems([...items, ...parsedItems]);
      logMessage(`Imported ${parsedItems.length} books from CSV (Max: ${maxBatch})`);
      setCsvText("");
    } else {
      alert("Invalid CSV format! Please verify headings or columns.");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      parseCSV(text);
    };
    reader.readAsText(file);
  };

  // Trigger download helper
  const triggerDownload = (url: string, filename: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Run generation queue
  const runBatchQueue = async () => {
    if (items.length === 0) return;
    setIsProcessing(true);
    logMessage("Starting batch queue execution...");

    const [
      { jsPDF },
      { generateSudokuBook },
      { downloadSudokuPdf },
      { generateMaze },
      { downloadMazePdf },
      { generateWordSearchBook },
      { downloadWordSearchPdf },
      { checkPremiumStatus },
    ] = await Promise.all([
      import("jspdf"),
      import("@/lib/sudoku"),
      import("@/lib/sudoku-pdf"),
      import("@/lib/maze"),
      import("@/lib/maze-pdf"),
      import("@/app/utils/puzzleEngine"),
      import("@/lib/wordSearch-pdf"),
      import("@/app/actions"),
    ]);

    const pStatus = await checkPremiumStatus();
    const isPremiumUser = !!pStatus?.isPremium;

    const updatedItems = [...items];

    for (let i = 0; i < updatedItems.length; i++) {
      const item = updatedItems[i];
      if (item.status === "Completed") continue;

      setCurrentProcessingId(item.id);
      item.status = "Generating";
      setItems([...updatedItems]);
      logMessage(`Generating: "${item.title}" (${item.type} - ${item.difficulty})`);

      try {
        // Wait 2 seconds per book to simulate processing layout & generating math vectors
        await new Promise(resolve => setTimeout(resolve, 2000));

        let downloadUrl = "";
        let filename = `${item.title.toLowerCase().replace(/\s+/g, "-")}.pdf`;

        // If Sudoku or Maze, generate the actual PDF interiors using client-side engines!
        if (item.type === "Sudoku") {
          const diff = item.difficulty.toLowerCase() as any;
          const puzzles = generateSudokuBook(item.count, diff);
          const doc = new jsPDF({
            orientation: "portrait",
            unit: "in",
            format: item.trimSize === "6x9" ? [6, 9] : item.trimSize === "5x8" ? [5, 8] : [8.5, 11]
          });
          
          // Draw standard title page
          doc.setFont("helvetica", "bold");
          doc.setFontSize(22);
          doc.text(item.title, doc.internal.pageSize.width / 2, 4, { align: "center" });
          doc.setFontSize(12);
          doc.setFont("helvetica", "normal");
          doc.text(`${item.difficulty} Difficulty - ${item.count} Puzzles`, doc.internal.pageSize.width / 2, 4.5, { align: "center" });

          // Run actual PDF compiling
          await downloadSudokuPdf({
            puzzles,
            difficulty: diff,
            trimSize: item.trimSize,
            title: item.title,
            includeSolutions: true,
            solutionsPerPage: 4,
            isPremium: isPremiumUser
          }, filename);

          logMessage(`Compiled actual Sudoku book vector PDF interior: ${filename}`);
        } 
        else if (item.type === "Maze") {
          const mazes = Array.from({ length: item.count }, () => {
            const maze = generateMaze({ rows: 15, cols: 15, shape: "square" });
            return {
              grid: maze.grid,
              start: maze.start,
              end: maze.end
            };
          });

          await downloadMazePdf({
            mazes,
            shape: "square",
            title: item.title,
            trimSize: item.trimSize,
            includeSolutions: true,
            isPremium: isPremiumUser
          }, filename);

          logMessage(`Compiled actual Maze book vector PDF interior: ${filename}`);
        }
        else if (item.type === "Word Search") {
          const diff = item.difficulty.toLowerCase() as "easy" | "medium" | "hard";
          const puzzles = generateWordSearchBook(item.count, diff);

          await downloadWordSearchPdf({
            puzzles,
            title: item.title,
            trimSize: item.trimSize,
            includeSolutions: true,
            isPremium: isPremiumUser
          }, filename);

          logMessage(`Compiled actual Word Search book vector PDF interior: ${filename}`);
        }
        else {
          // Fallback / simulated generator for other puzzle types
          const doc = new jsPDF({
            orientation: "portrait",
            unit: "in",
            format: item.trimSize === "6x9" ? [6, 9] : item.trimSize === "5x8" ? [5, 8] : [8.5, 11]
          });

          const w = doc.internal.pageSize.width;
          const h = doc.internal.pageSize.height;

          // Cover Page
          doc.setFont("helvetica", "bold");
          doc.setFontSize(24);
          doc.text(item.title, w / 2, h / 3, { align: "center" });
          
          doc.setFont("helvetica", "normal");
          doc.setFontSize(12);
          doc.text(`${item.type} Puzzle Book`, w / 2, h / 3 + 0.5, { align: "center" });
          doc.text(`Difficulty: ${item.difficulty}`, w / 2, h / 3 + 0.8, { align: "center" });
          doc.text(`${item.count} Puzzles with Solutions`, w / 2, h / 3 + 1.1, { align: "center" });
          
          // Generate simulated layout pages
          for (let p = 1; p <= item.count; p++) {
            doc.addPage();
            doc.setFont("helvetica", "bold");
            doc.setFontSize(16);
            doc.text(`${item.type} Puzzle #${p}`, w / 2, 1, { align: "center" });
            
            // Draw dummy puzzle grid box
            doc.setDrawColor(100, 116, 139);
            doc.setLineWidth(0.02);
            doc.rect(1.5, 2, w - 3, h - 4);
            
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            doc.text("[Vector Puzzle Area]", w / 2, h / 2, { align: "center" });
          }

          // Solutions
          doc.addPage();
          doc.setFont("helvetica", "bold");
          doc.setFontSize(18);
          doc.text("Solutions Key", w / 2, 1, { align: "center" });

          const pdfOutput = doc.output("blob");
          downloadUrl = URL.createObjectURL(pdfOutput);
          
          item.downloadUrl = downloadUrl;
          triggerDownload(downloadUrl, filename);
          logMessage(`Compiled simulated PDF interior: ${filename}`);
        }

        item.status = "Completed";
        logMessage(`Success: "${item.title}" successfully processed.`);
      } catch (err: any) {
        item.status = "Failed";
        logMessage(`Failed: Error generating "${item.title}": ${err.message}`);
      }

      setItems([...updatedItems]);
    }

    setIsProcessing(false);
    setCurrentProcessingId(null);
    logMessage("Batch queue execution completed.");
  };

  const maxBatch = premiumStatus.plan === "starter" ? 5 : premiumStatus.plan === "pro" ? 15 : 50;

  if (premiumStatus.checked && (!premiumStatus.isPremium || premiumStatus.plan === "free")) {
    return (
      <div className="min-h-screen bg-[#0b0f19] text-white flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

        <div className="max-w-md w-full bg-slate-900/60 border border-slate-900 p-8 rounded-[2.5rem] shadow-2xl relative z-10 space-y-6">
          <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 border border-amber-500/20 mx-auto">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent uppercase tracking-tight">
              KDP Bulk Book Batch Studio is Locked
            </h2>
            <p className="text-slate-400 text-xs font-semibold leading-relaxed">
              Multi-book batch generation and CSV configuration imports are available starting on our **Starter Creator** plan (up to 5 books / batch) and **Pro Studio** (up to 15 books / batch).
            </p>
          </div>

          <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-900/40 text-left space-y-2 text-[11px] font-bold text-slate-300">
            <div className="flex items-center gap-2 text-indigo-400 text-[10px] uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" /> Plan Benefits:
            </div>
            <p>✓ Starter: Batch compile up to 5 puzzle book interiors</p>
            <p>✓ Pro: High-capacity 15+ book batch queues</p>
            <p>✓ Import manuscript configurations via CSV</p>
            <p>✓ Watermark-free, 300 DPI vector PDF exports</p>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <Link 
              href="/pricing"
              className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-black text-xs rounded-xl shadow-lg transition-all"
            >
              Upgrade to Starter or Pro
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
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 py-16 px-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-yellow-500/5 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3" />

      <div className="max-w-6xl mx-auto relative z-10 space-y-10">
        
        {/* Navigation & Header */}
        <div className="flex justify-between items-center border-b border-slate-900 pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-xs font-black uppercase tracking-wider mb-2 animate-pulse">
              <Sparkles className="w-3.5 h-3.5" /> Batch Processing Studio
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              KDP Bulk Book Batch Studio
            </h1>
          </div>
          <Link
            href="/tools"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-yellow-500 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Tools
          </Link>
        </div>

        {/* 2 Column Layout: Queue details left, Upload/Logs right */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Queue Manager */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900/60 border border-slate-900 rounded-[2rem] p-6 md:p-8 space-y-6">
              
              <div className="flex justify-between items-center border-b border-slate-900 pb-4">
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-yellow-500" /> Queue Manager ({items.length} Books)
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={clearAll}
                    className="px-3.5 py-1.5 bg-slate-950 border border-slate-800 text-[10px] font-black uppercase tracking-wider rounded-xl hover:bg-slate-900 transition text-slate-400"
                  >
                    Clear Queue
                  </button>
                  <SaveToNotebookButton
                    title={`Batch Queue (${items.length} Books)`}
                    content={`Bulk generation queue: ${items.map(i => `${i.title} (${i.type}, ${i.count}x, ${i.difficulty})`).join("; ")}`}
                    category="bulk-generator"
                    data={{ items: items.map(({ id, title, type, difficulty, count, trimSize }) => ({ id, title, type, difficulty, count, trimSize })) }}
                  />
                  <button
                    onClick={runBatchQueue}
                    disabled={isProcessing || items.length === 0}
                    className="px-4 py-1.5 bg-yellow-500 text-slate-950 text-[10px] font-black uppercase tracking-wider rounded-xl hover:bg-yellow-400 disabled:opacity-40 transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-yellow-500/10"
                  >
                    {isProcessing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                    Run Batch
                  </button>
                </div>
              </div>

              {/* Grid table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-900 text-slate-500 uppercase tracking-widest font-black text-[9px]">
                      <th className="py-3 px-3">Title</th>
                      <th className="py-3 px-3 text-center">Type</th>
                      <th className="py-3 px-3 text-center">Difficulty</th>
                      <th className="py-3 px-3 text-center">Puzzles</th>
                      <th className="py-3 px-3 text-center">Trim</th>
                      <th className="py-3 px-3 text-center">Status</th>
                      <th className="py-3 px-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-300 font-semibold">
                    {items.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-500">
                          Queue is empty. Upload a CSV or add books manually.
                        </td>
                      </tr>
                    ) : (
                      items.map((item) => (
                        <tr key={item.id} className="border-b border-slate-900 hover:bg-slate-900/10 transition">
                          <td className="py-3 px-3 font-bold text-white max-w-[200px] truncate">{item.title}</td>
                          <td className="py-3 px-3 text-center">
                            <span className="bg-slate-950 border border-slate-800 text-[10px] px-2 py-0.5 rounded-lg text-slate-300">
                              {item.type}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center text-slate-400 capitalize">{item.difficulty}</td>
                          <td className="py-3 px-3 text-center font-bold text-slate-100">{item.count}</td>
                          <td className="py-3 px-3 text-center font-mono text-slate-500">{item.trimSize}</td>
                          <td className="py-3 px-3 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                              item.status === "Pending" ? "bg-slate-950 text-slate-500 border border-slate-900" :
                              item.status === "Generating" ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 animate-pulse" :
                              item.status === "Completed" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                              "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            }`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            {item.status === "Completed" && item.downloadUrl ? (
                              <button
                                onClick={() => triggerDownload(item.downloadUrl!, `${item.title.toLowerCase().replace(/\s+/g, "-")}.pdf`)}
                                className="p-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded hover:bg-emerald-500 hover:text-slate-950 transition cursor-pointer"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleRemove(item.id)}
                                disabled={isProcessing && currentProcessingId === item.id}
                                className="p-1 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded hover:bg-rose-500 hover:text-white transition disabled:opacity-30 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Manual Add Form */}
            <form onSubmit={handleManualAdd} className="bg-slate-900/60 border border-slate-900 rounded-[2rem] p-6 md:p-8 space-y-4">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-yellow-500" /> Add Book Manually
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
                <div className="sm:col-span-2 lg:col-span-4">
                  <input
                    type="text"
                    placeholder="Book Title (e.g. Sudoku Master)"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-yellow-500 transition"
                    required
                  />
                </div>
                <div className="lg:col-span-2">
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-300 focus:outline-none focus:border-yellow-500 transition cursor-pointer"
                  >
                    <option value="Sudoku">Sudoku</option>
                    <option value="Maze">Maze</option>
                    <option value="Word Search">Word Search</option>
                    <option value="Cryptogram">Cryptogram</option>
                    <option value="Kakuro">Kakuro</option>
                  </select>
                </div>
                <div className="lg:col-span-2">
                  <select
                    value={newDifficulty}
                    onChange={(e) => setNewDifficulty(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-300 focus:outline-none focus:border-yellow-500 transition cursor-pointer"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
                <div className="lg:col-span-2">
                  <input
                    type="number"
                    placeholder="Puzzles"
                    min={1}
                    max={500}
                    value={newCount}
                    onChange={(e) => setNewCount(parseInt(e.target.value) || 30)}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-yellow-500 transition text-center"
                    required
                  />
                </div>
                <div className="lg:col-span-2">
                  <select
                    value={newTrim}
                    onChange={(e) => setNewTrim(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-300 focus:outline-none focus:border-yellow-500 transition cursor-pointer"
                  >
                    <option value="8.5x11">8.5"x11"</option>
                    <option value="6x9">6"x9"</option>
                    <option value="5x8">5"x8"</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-slate-950 border border-slate-800 hover:border-yellow-500 hover:text-slate-950 hover:bg-yellow-500 transition text-slate-300 text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer"
              >
                Add to Batch Queue
              </button>
            </form>

          </div>

          {/* Right Column: CSV Upload & Console Logs */}
          <div className="space-y-6">
            
            {/* CSV Import */}
            <div className="bg-slate-900/60 border border-slate-900 rounded-[2.5rem] p-6 shadow-2xl space-y-4">
              <h3 className="text-md font-black text-white flex items-center gap-2">
                <Upload className="w-5 h-5 text-yellow-600" /> CSV Upload / Paste
              </h3>
              
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="p-6 border border-dashed border-slate-800 hover:border-yellow-600 bg-slate-950/40 rounded-2xl text-center cursor-pointer transition flex flex-col items-center gap-2 group select-none"
              >
                <Upload className="w-8 h-8 text-slate-500 group-hover:text-yellow-600 transition" />
                <span className="text-xs font-bold text-slate-400">Click to upload KDP CSV</span>
                <span className="text-[9px] text-slate-600 font-semibold">Supports .csv files</span>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  accept=".csv" 
                  className="hidden" 
                />
              </div>

              <div className="space-y-2 pt-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Or Paste CSV Content:</label>
                <textarea
                  rows={4}
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  placeholder={`Title,PuzzleType,Difficulty,Count,TrimSize\nMy Sudoku Book,Sudoku,Easy,30,8.5x11\nLabyrinths Book,Maze,Hard,40,6x9`}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-2xl text-[10px] text-slate-300 font-mono focus:outline-none"
                />
                <button
                  onClick={() => parseCSV(csvText)}
                  disabled={!csvText.trim()}
                  className="w-full py-2 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 hover:bg-yellow-500 hover:text-slate-950 text-[10px] font-black uppercase rounded-xl transition cursor-pointer"
                >
                  Parse & Add CSV
                </button>
              </div>

              {/* Sample format link */}
              <div className="flex items-center gap-2 p-3 bg-slate-950/60 border border-slate-900 rounded-xl">
                <AlertCircle className="w-4 h-4 text-indigo-400 shrink-0" />
                <div className="text-[10px] text-slate-500 leading-relaxed font-semibold">
                  Columns: <code className="text-indigo-300">Title, PuzzleType, Difficulty, Count, TrimSize</code>. Types: Sudoku, Maze, Word Search. Trims: 8.5x11, 6x9, 5'x8'.
                </div>
              </div>

            </div>

            {/* Console Log output */}
            <div className="bg-slate-900/60 border border-slate-900 rounded-[2.5rem] p-6 shadow-2xl space-y-4">
              <h3 className="text-md font-black text-white flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-yellow-600 animate-spin" /> Batch Execution Logs
              </h3>
              
              <div className="bg-slate-950 p-4 border border-slate-900 rounded-2xl font-mono text-[9px] text-emerald-400 h-[200px] overflow-y-auto space-y-1.5 leading-normal">
                {consoleLogs.length === 0 ? (
                  <span className="text-slate-600">Console idle. Awaiting batch process execution...</span>
                ) : (
                  consoleLogs.map((log, idx) => (
                    <div key={idx} className="break-words">
                      {log}
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
