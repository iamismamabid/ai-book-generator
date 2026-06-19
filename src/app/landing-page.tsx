"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Zap, BookOpen, Sparkles, Users, TrendingUp, Check } from "lucide-react";

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white overflow-hidden">
      {/* Navigation */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled ? "bg-slate-900/95 backdrop-blur border-b border-amber-500/20" : ""
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold">
            <span className="text-amber-500">Ismam</span>.AI
          </div>
          <div className="hidden sm:flex gap-8 items-center">
            <a href="#features" className="hover:text-amber-500 transition">
              Features
            </a>
            <a href="#pricing" className="hover:text-amber-500 transition">
              Pricing
            </a>
            <Link
              href="/generate"
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-6 py-2 rounded-lg transition"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-4xl mx-auto text-center">
          {/* Animated Badge */}
          <div className="inline-block mb-6 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30">
            <p className="text-amber-400 text-sm font-semibold flex items-center gap-2">
              <Zap size={16} /> Generate KDP books in minutes, not weeks
            </p>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black mb-6 leading-tight">
            Create{" "}
            <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              Puzzle Books
            </span>
            {" "}Your Readers Love
          </h1>

          {/* Subheadline */}
          <p className="text-xl sm:text-2xl text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            AI-powered Word Search, Crossword & Sudoku generation for KDP creators.
            Publish on Amazon in days. Automate the tedious part. Keep the creative
            control.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              href="/generate"
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-8 py-4 rounded-xl text-lg transition transform hover:scale-105 flex items-center justify-center gap-2"
            >
              Start Free <ArrowRight size={20} />
            </Link>
            <a
              href="#features"
              className="border-2 border-amber-500/50 hover:border-amber-500 text-white font-bold px-8 py-4 rounded-xl text-lg transition"
            >
              See How It Works
            </a>
          </div>

          {/* Social Proof */}
          <div className="text-slate-400 text-sm">
            💚 Join 500+ KDP creators making more books faster
          </div>
        </div>

        {/* Decorative element */}
        <div className="absolute top-20 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl -z-10"></div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-800/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">Why creators choose Ismam.AI</h2>
          <p className="text-center text-slate-400 mb-16 text-lg">
            Everything you need to scale your KDP business
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-2xl border border-slate-700 hover:border-amber-500/50 transition">
              <Zap className="text-amber-500 mb-4" size={32} />
              <h3 className="text-xl font-bold mb-2">Generate in seconds</h3>
              <p className="text-slate-300">
                Create puzzle books instantly. No design skills needed. Just pick your
                trim size and download.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-2xl border border-slate-700 hover:border-amber-500/50 transition">
              <Sparkles className="text-amber-500 mb-4" size={32} />
              <h3 className="text-xl font-bold mb-2">AI-powered word lists</h3>
              <p className="text-slate-300">
                Just describe a theme. Our AI generates perfect word lists automatically.
                No CSV uploads needed.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-2xl border border-slate-700 hover:border-amber-500/50 transition">
              <BookOpen className="text-amber-500 mb-4" size={32} />
              <h3 className="text-xl font-bold mb-2">All puzzle types</h3>
              <p className="text-slate-300">
                Word Search (free), Crossword, Sudoku, Maze. Every puzzle type KDP
                creators need.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-2xl border border-slate-700 hover:border-amber-500/50 transition">
              <TrendingUp className="text-amber-500 mb-4" size={32} />
              <h3 className="text-xl font-bold mb-2">KDP niche research</h3>
              <p className="text-slate-300">
                Find profitable niches on Amazon. Know what sells before you write a
                single word.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-2xl border border-slate-700 hover:border-amber-500/50 transition">
              <Users className="text-amber-500 mb-4" size={32} />
              <h3 className="text-xl font-bold mb-2">Bulk generation</h3>
              <p className="text-slate-300">
                Create 10 books at once. Build a whole series faster than your
                competition.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-2xl border border-slate-700 hover:border-amber-500/50 transition">
              <Check className="text-amber-500 mb-4" size={32} />
              <h3 className="text-xl font-bold mb-2">No watermarks</h3>
              <p className="text-slate-300">
                Professional PDFs ready for Amazon KDP. No logos, no markings. Publish
                straight away.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">How it works</h2>

          <div className="space-y-8">
            {[
              {
                step: 1,
                title: "Pick your puzzle type",
                desc: "Choose Word Search, Crossword, Sudoku, or Maze.",
              },
              {
                step: 2,
                title: "Enter your theme or word list",
                desc: "Type a topic. AI generates words. Or upload your own CSV.",
              },
              {
                step: 3,
                title: "Customize layout",
                desc: "Set trim size, puzzle count, difficulty. Match KDP requirements.",
              },
              {
                step: 4,
                title: "Download & publish",
                desc: "Get PDF. Upload to Amazon KDP. Start earning.",
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-12 h-12 bg-amber-500 text-slate-950 font-bold rounded-full flex items-center justify-center text-xl">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-slate-300">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-800/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">Simple pricing</h2>
          <p className="text-center text-slate-400 mb-16 text-lg">
            Start free. Upgrade when you need more.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Free Plan */}
            <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 flex flex-col">
              <h3 className="text-xl font-bold mb-2">Free</h3>
              <div className="mb-6">
                <span className="text-4xl font-black">$0</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1 text-slate-300">
                <li className="flex items-center gap-2">
                  <Check size={18} className="text-amber-500" /> 3 PDFs per month
                </li>
                <li className="flex items-center gap-2">
                  <Check size={18} className="text-amber-500" /> Word Search only
                </li>
                <li className="flex items-center gap-2">
                  <Check size={18} className="text-amber-500" /> Basic trim sizes
                </li>
              </ul>
              <Link
                href="/generate"
                className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-lg transition text-center"
              >
                Get Started
              </Link>
            </div>

            {/* Starter Plan (Featured) */}
            <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 p-8 rounded-2xl border-2 border-amber-500 flex flex-col relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-amber-500 text-slate-950 px-4 py-1 rounded-full text-sm font-bold">
                Most Popular
              </div>
              <h3 className="text-xl font-bold mb-2">Starter</h3>
              <div className="mb-6">
                <span className="text-4xl font-black">$9.99</span>
                <span className="text-slate-400 ml-2">/month</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1 text-slate-300">
                <li className="flex items-center gap-2">
                  <Check size={18} className="text-amber-500" /> Unlimited downloads
                </li>
                <li className="flex items-center gap-2">
                  <Check size={18} className="text-amber-500" /> Word Search + Crossword
                </li>
                <li className="flex items-center gap-2">
                  <Check size={18} className="text-amber-500" /> AI word list generator
                </li>
                <li className="flex items-center gap-2">
                  <Check size={18} className="text-amber-500" /> Save your books
                </li>
              </ul>
              <Link
                href="/pricing"
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-3 rounded-lg transition text-center"
              >
                Start Creating
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 flex flex-col">
              <h3 className="text-xl font-bold mb-2">Pro</h3>
              <div className="mb-6">
                <span className="text-4xl font-black">$19.99</span>
                <span className="text-slate-400 ml-2">/month</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1 text-slate-300">
                <li className="flex items-center gap-2">
                  <Check size={18} className="text-amber-500" /> Everything in Starter
                </li>
                <li className="flex items-center gap-2">
                  <Check size={18} className="text-amber-500" /> Sudoku + Maze
                </li>
                <li className="flex items-center gap-2">
                  <Check size={18} className="text-amber-500" /> Niche research tool
                </li>
                <li className="flex items-center gap-2">
                  <Check size={18} className="text-amber-500" /> Bulk generation (10x)
                </li>
              </ul>
              <Link
                href="/pricing"
                className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-lg transition text-center"
              >
                Go Pro
              </Link>
            </div>
          </div>

          <p className="text-center text-slate-400 text-sm mt-8">
            All plans include access to your book library. No credit card required for free plan.
          </p>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Loved by KDP creators</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                quote: "I went from 2 books/month to 8 books/month. Best $9.99 I spend.",
                author: "Sarah M.",
                role: "KDP Author",
              },
              {
                quote: "No more manual puzzle design. AI generates perfect word lists instantly.",
                author: "James P.",
                role: "Content Creator",
              },
              {
                quote: "It's like having a design team in your pocket. Unreal value.",
                author: "Amira K.",
                role: "Publishing Entrepreneur",
              },
              {
                quote: "Finally, someone building tools FOR creators, not against them.",
                author: "Ahmed R.",
                role: "Indie Publisher",
              },
            ].map((item, idx) => (
              <div key={idx} className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                <p className="text-slate-300 mb-4">"{item.quote}"</p>
                <div>
                  <p className="font-bold">{item.author}</p>
                  <p className="text-sm text-slate-400">{item.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to scale your KDP business?</h2>
          <p className="text-xl text-slate-300 mb-8">
            Create your first puzzle book in minutes. Upgrade anytime as you grow.
          </p>
          <Link
            href="/generate"
            className="inline-block bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-8 py-4 rounded-xl text-lg transition transform hover:scale-105"
          >
            Start Free Now →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <p className="font-bold mb-4">Product</p>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li>
                  <a href="/generate" className="hover:text-amber-500">
                    App
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-amber-500">
                    Pricing
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="font-bold mb-4">Community</p>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li>
                  <a href="#" className="hover:text-amber-500">
                    Twitter
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-amber-500">
                    Discord
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="font-bold mb-4">Legal</p>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li>
                  <a href="#" className="hover:text-amber-500">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-amber-500">
                    Terms
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="font-bold mb-4">Contact</p>
              <p className="text-slate-400 text-sm">
                Built by Ismam for KDP creators worldwide.
              </p>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 text-center text-slate-500 text-sm">
            © 2025 Ismam.AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
