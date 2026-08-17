"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  MessageSquare,
  X,
  Send,
  Loader2,
  Headphones,
  Bot,
  User,
  ChevronRight,
  RotateCcw,
  Minus,
  Maximize2,
} from "lucide-react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const QUICK_QUESTIONS = [
  "How do I redeem my AppSumo code?",
  "What is the difference between Tier 1, 2, and 3?",
  "How do I calculate KDP cover spine thickness?",
  "Can I create shape-masked mazes (Hearts, Circles)?",
];

export default function GeminiSupportAssistant() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "👋 Hi! I'm the **KDPage Virtual Assistant**. Ask me anything about KDP publishing, book cover dimensions, puzzle generation, or AppSumo lifetime deals!",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-compact on full-canvas studio pages (/studio, /maze, /sudoku) to prevent overlaying bottom editor buttons
  useEffect(() => {
    if (
      pathname?.includes("/studio") ||
      pathname?.includes("/maze") ||
      pathname?.includes("/sudoku") ||
      pathname?.includes("/book/")
    ) {
      setIsCompact(true);
    }
  }, [pathname]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const newMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: query },
    ];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/support-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await res.json();
      if (res.ok && data.reply) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.reply },
        ]);
      } else {
        setMessages([
          {
            role: "assistant",
            content:
              data.error ||
              "Sorry, I had trouble connecting. You can also talk to our human support team using the live chat below!",
          },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Connection error. Please check your internet or reach out via live chat.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenTawk = () => {
    if (typeof window !== "undefined" && (window as any).Tawk_API) {
      if (typeof (window as any).Tawk_API.showWidget === "function") {
        (window as any).Tawk_API.showWidget();
      }
      if (typeof (window as any).Tawk_API.maximize === "function") {
        (window as any).Tawk_API.maximize();
      }
      setIsOpen(false);
    } else {
      window.location.href = "mailto:help@kdpage.com";
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        role: "assistant",
        content:
          "👋 Hi! I'm the **KDPage Virtual Assistant**. Ask me anything about KDP publishing, book cover dimensions, puzzle generation, or AppSumo lifetime deals!",
      },
    ]);
  };

  return (
    <>
      {/* Floating Trigger Widget with Minimize / Compact Toggle */}
      <div className="fixed bottom-5 right-5 z-40 flex items-center gap-1.5 select-none">
        {isCompact ? (
          /* Compact Glowing Circular Icon (Zero screen blockage) */
          <div className="relative group">
            <button
              onClick={() => {
                setIsOpen(true);
              }}
              className="w-11 h-11 rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-purple-600 text-white flex items-center justify-center shadow-[0_8px_25px_rgba(79,70,229,0.45)] border border-indigo-400/40 transition-all duration-300 transform hover:scale-110 active:scale-95"
              aria-label="Open 24/7 Virtual Assistant"
              title="Open 24/7 Virtual Assistant"
            >
              <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-slate-900 rounded-full animate-ping" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-slate-900 rounded-full" />
            </button>

            {/* Expand Pill Hover Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsCompact(false);
              }}
              className="absolute -left-7 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 w-5 h-5 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center text-[10px] shadow transition-all"
              title="Expand to Full Pill"
            >
              <Maximize2 className="w-2.5 h-2.5" />
            </button>
          </div>
        ) : (
          /* Full Pill Badge with quick Minimize button */
          <div className="flex items-center bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white rounded-full shadow-[0_8px_30px_rgba(79,70,229,0.4)] border border-indigo-400/30 overflow-hidden transition-all duration-300 transform hover:scale-102">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-2 px-4 py-2.5 hover:from-indigo-500 hover:to-purple-600 transition-colors"
              aria-label="Open Virtual Assistant"
            >
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              <span className="text-xs font-black tracking-wide uppercase font-sans">
                Virtual Assistant
              </span>
              <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full font-bold">
                24/7
              </span>
            </button>

            {/* Minimize Pill to Tiny Circle Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsCompact(true);
              }}
              title="Minimize to small icon (avoids blocking editor buttons)"
              className="px-2.5 py-3 hover:bg-black/20 text-white/70 hover:text-white border-l border-white/15 transition-colors"
              aria-label="Minimize button"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Chat Dialog Popover */}
      {isOpen && (
        <div className="fixed bottom-20 sm:bottom-22 right-4 sm:right-6 w-[92vw] sm:w-[400px] h-[520px] max-h-[80vh] bg-white dark:bg-slate-900 rounded-3xl shadow-[0_20px_60px_rgba(15,23,42,0.3)] border border-slate-200 dark:border-slate-800 z-50 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 p-4 text-white flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20">
                <Bot className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h3 className="text-sm font-black tracking-tight leading-tight flex items-center gap-1.5">
                  KDPage Virtual Assistant
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                </h3>
                <p className="text-[10px] text-indigo-100 font-medium">
                  Instant 24/7 KDP & AppSumo Assistance
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleResetChat}
                title="Restart chat"
                className="p-1.5 text-indigo-100 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsCompact(true);
                }}
                title="Minimize chat"
                className="p-1.5 text-indigo-100 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close chat"
                className="p-1.5 text-indigo-100 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50 dark:bg-slate-950/40 text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${
                  m.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {m.role === "assistant" && (
                  <div className="w-6 h-6 rounded-lg bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`max-w-[82%] rounded-2xl p-3 leading-relaxed ${
                    m.role === "user"
                      ? "bg-indigo-600 text-white rounded-br-sm shadow-sm"
                      : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-sm shadow-sm whitespace-pre-line"
                  }`}
                >
                  {m.content}
                </div>
                {m.role === "user" && (
                  <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2.5 items-center text-slate-400 text-xs py-1">
                <Bot className="w-4 h-4 text-indigo-600 animate-spin" />
                <span className="italic">Thinking...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Question Pills (Show if 1 message) */}
          {messages.length === 1 && (
            <div className="px-3 py-2 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap gap-1.5">
              {QUICK_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(q)}
                  className="text-[10px] font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 dark:hover:text-indigo-400 px-2.5 py-1 rounded-full border border-slate-200/60 dark:border-slate-700 transition-all text-left flex items-center gap-1"
                >
                  <ChevronRight className="w-2.5 h-2.5 shrink-0 opacity-60" />
                  <span>{q}</span>
                </button>
              ))}
            </div>
          )}

          {/* Human Hand-off Bar */}
          <div className="px-3 py-1.5 bg-indigo-50/60 dark:bg-indigo-950/30 border-t border-indigo-100/60 dark:border-indigo-900/30 flex items-center justify-between text-[11px]">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Headphones className="w-3 h-3 text-indigo-500" />
              Need human help?
            </span>
            <button
              onClick={handleOpenTawk}
              className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
            >
              Open Live Chat &rarr;
            </button>
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-2.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about KDPage..."
              disabled={isLoading}
              className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs px-3.5 py-2.5 rounded-xl border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white rounded-xl transition-all shadow-sm shrink-0"
              aria-label="Send message"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
