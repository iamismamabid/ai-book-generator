import Link from "next/link";
import { BookOpen, Palette, Grid3x3, Compass, CheckCircle2, ArrowRight, Sparkles, Download, Shield } from "lucide-react";
import PricingSection from "../components/PricingSection";

export default async function HomePage() {
  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 overflow-hidden relative">
      
      {/* 🔮 Background Glow Elements */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse-glow" />
      <div className="absolute top-1/3 right-0 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3 animate-pulse-glow" style={{ animationDelay: '-4s' }} />
      <div className="absolute bottom-0 left-1/3 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl translate-y-1/3 animate-pulse-glow" style={{ animationDelay: '-2s' }} />

      {/* 🚀 Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 border border-slate-800 text-indigo-400 text-xs font-black uppercase tracking-[0.2em] mb-8 animate-fade-in shadow-inner">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          The Ultimate KDP Interior & Cover Creator
        </div>
        
        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight leading-[1.1] mb-6 max-w-4xl mx-auto">
          Create Best-Selling <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-amber-300 bg-clip-text text-transparent">KDP Books</span> in Minutes
        </h1>
        
        <p className="text-slate-400 text-lg md:text-xl font-medium max-w-2xl mx-auto mb-10 leading-relaxed">
          Produce professional puzzle interiors, AI-assisted stories, shape-masked labyrinths, and gorgeous book covers—all in one place.
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <Link 
            href="/studio"
            className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-black text-lg hover:from-indigo-600 hover:to-purple-700 shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2"
          >
            Start Designing Free
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link 
            href="/dashboard"
            className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 font-black text-lg hover:bg-slate-800 transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2"
          >
            My Book Library
          </Link>
        </div>

        <div className="mt-8 flex justify-center animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <Link 
            href="#pricing"
            className="text-indigo-400 hover:text-indigo-300 text-sm font-black flex items-center gap-1.5 group transition-colors duration-300"
          >
            View Pricing Plans & Features
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* 🛠️ SaaS Features Grid */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-4">
            Professional KDP Creation Engines
          </h2>
          <p className="text-slate-400 text-base max-w-lg mx-auto font-semibold">
            Choose from a suite of specialized puzzle builders and cover editors.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* 1. Book Builder & Cover Studio */}
          <div className="group relative dark-glow-card rounded-[2.5rem] p-8 hover:-translate-y-2 duration-500 flex flex-col justify-between h-[360px]">
            <div>
              <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 mb-6 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300 shadow-inner">
                <Palette className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-black text-white mb-3">Book & Cover Studio</h3>
              <p className="text-slate-400 text-sm leading-relaxed font-semibold">
                Design custom crossword grids and word searches, drag & drop elements, and compile front/back covers in print-ready KDP dimensions.
              </p>
            </div>
            <Link 
              href="/studio"
              className="inline-flex items-center gap-2 text-sm font-black text-indigo-400 hover:text-indigo-300 mt-6"
            >
              Open Creator Studio <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* 2. AI Novel Writer */}
          <div className="group relative dark-glow-card rounded-[2.5rem] p-8 hover:-translate-y-2 duration-500 flex flex-col justify-between h-[360px]">
            <div>
              <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-400 mb-6 group-hover:bg-purple-500 group-hover:text-white transition-all duration-300 shadow-inner">
                <BookOpen className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-black text-white mb-3">AI Novel Writer</h3>
              <p className="text-slate-400 text-sm leading-relaxed font-semibold">
                Generate compelling story outlines and write book chapters instantly using advanced Llama 3.3 models on Groq.
              </p>
            </div>
            <Link 
              href="/generate"
              className="inline-flex items-center gap-2 text-sm font-black text-purple-400 hover:text-purple-300 mt-6"
            >
              Start Generating <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* 3. Shaped Labyrinth Designer */}
          <div className="group relative dark-glow-card rounded-[2.5rem] p-8 hover:-translate-y-2 duration-500 flex flex-col justify-between h-[360px]">
            <div>
              <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 mb-6 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300 shadow-inner">
                <Compass className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-black text-white mb-3">Labyrinth Designer</h3>
              <p className="text-slate-400 text-sm leading-relaxed font-semibold">
                Create shape-masked maze interiors (Square, Circle, Heart shapes) in clean standard trim sizing with automated solutions key generation.
              </p>
            </div>
            <Link 
              href="/maze"
              className="inline-flex items-center gap-2 text-sm font-black text-emerald-400 hover:text-emerald-300 mt-6"
            >
              Design Mazes <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* 4. Sudoku Generator */}
          <div className="group relative dark-glow-card rounded-[2.5rem] p-8 hover:-translate-y-2 duration-500 flex flex-col justify-between h-[360px]">
            <div>
              <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-400 mb-6 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300 shadow-inner">
                <Grid3x3 className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-black text-white mb-3">Sudoku Studio</h3>
              <p className="text-slate-400 text-sm leading-relaxed font-semibold">
                Compile print-ready Sudoku puzzle grids (Easy, Medium, and Hard) with mathematically guaranteed single-solution uniqueness.
              </p>
            </div>
            <Link 
              href="/sudoku"
              className="inline-flex items-center gap-2 text-sm font-black text-amber-400 hover:text-amber-300 mt-6"
            >
              Generate Sudokus <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* 5. Word Search Studio */}
          <div className="group relative dark-glow-card rounded-[2.5rem] p-8 hover:-translate-y-2 duration-500 flex flex-col justify-between h-[360px]">
            <div>
              <div className="w-14 h-14 bg-pink-500/10 rounded-2xl flex items-center justify-center text-pink-400 mb-6 group-hover:bg-pink-500 group-hover:text-white transition-all duration-300 shadow-inner">
                <Download className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-black text-white mb-3">Word Search Studio</h3>
              <p className="text-slate-400 text-sm leading-relaxed font-semibold">
                Import custom word lists or CSVs to build unique Word Search grids. Adjust fonts, highlighter options, and export interior sheets.
              </p>
            </div>
            <Link 
              href="/tools/word-search"
              className="inline-flex items-center gap-2 text-sm font-black text-pink-400 hover:text-pink-300 mt-6"
            >
              Open Word Search <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* 6. Complete Book Compilation */}
          <div className="group relative dark-glow-card rounded-[2.5rem] p-8 hover:-translate-y-2 duration-500 flex flex-col justify-between h-[360px]">
            <div>
              <div className="w-14 h-14 bg-cyan-500/10 rounded-2xl flex items-center justify-center text-cyan-400 mb-6 group-hover:bg-cyan-500 group-hover:text-white transition-all duration-300 shadow-inner">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-black text-white mb-3">KDP Interiors Merge</h3>
              <p className="text-slate-400 text-sm leading-relaxed font-semibold">
                Combine your custom puzzles, word searches, and AI-written chapters into a single PDF document formatted directly for KDP upload.
              </p>
            </div>
            <Link 
              href="/studio"
              className="inline-flex items-center gap-2 text-sm font-black text-cyan-400 hover:text-cyan-300 mt-6"
            >
              Start Assembling <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </section>

      {/* 💳 Pricing & FAQ Section */}
      <PricingSection />

      {/* 🔒 Trust Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20 border-t border-slate-900">
        <div className="bg-slate-900/50 backdrop-blur-md rounded-[3rem] border border-slate-800 p-12 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="max-w-xl text-center lg:text-left">
            <div className="inline-flex items-center gap-2 text-indigo-400 text-xs font-black uppercase tracking-[0.25em] mb-4">
              <Shield className="w-4 h-4" /> Secure & Compliant
            </div>
            <h3 className="text-3xl font-black text-white mb-4">Designed for Amazon KDP Specs</h3>
            <p className="text-slate-400 text-sm leading-relaxed font-semibold">
              All PDF exports automatically include precise gutters, safety bleed buffers, standard book sizes (6"x9", 8.5"x11"), and optimized vector paths ready for printing.
            </p>
          </div>
          <div className="flex gap-4">
            <Link 
              href="/studio"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-8 py-4 rounded-xl transition shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/25 flex items-center gap-2"
            >
              Create Now <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 👣 Footer */}
      <footer className="relative z-10 max-w-7xl mx-auto px-6 py-8 border-t border-slate-900/50 text-center text-slate-500 text-xs font-bold uppercase tracking-wider">
        © {new Date().getFullYear()} Ismam.AI — KDP Master Studio. All rights reserved.
      </footer>
    </div>
  );
}