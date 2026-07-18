"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { Sparkles, Zap, Shield, ChevronRight } from "lucide-react";

export default function PremiumLanding() {
  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#050505] text-white selection:bg-indigo-500/30 overflow-hidden relative">
      {/* 🌌 Premium Ambient Background */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[150px] pointer-events-none mix-blend-screen"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[150px] pointer-events-none mix-blend-screen"></div>
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>

      <div className="max-w-7xl mx-auto px-6 py-24 relative z-10 flex flex-col items-center text-center">
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-slate-300 text-sm font-medium mb-8 backdrop-blur-md">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>Introducing the Next Generation of AI Writing</span>
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-6xl md:text-8xl font-black tracking-tighter leading-[1.1] mb-8">
          Write Masterpieces. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-white">
            At the Speed of Thought.
          </span>
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-xl text-slate-400 max-w-2xl font-light leading-relaxed mb-12">
          An elite writing assistant in your pocket. Generate complete chapter outlines and write full-text book chapters in minutes with our powerful writing engine.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex gap-6">
          <Link href="/generate" className="group relative px-8 py-4 bg-white text-black rounded-full font-bold text-lg overflow-hidden transition-all hover:scale-105 flex items-center gap-2">
            <span className="relative z-10">Start Creating</span>
            <ChevronRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="/dashboard" className="px-8 py-4 rounded-full font-bold text-lg text-white border border-white/10 bg-white/5 hover:bg-white/10 backdrop-blur-md transition-all">
            View Library
          </Link>
        </motion.div>
      </div>
    </div>
  );
}