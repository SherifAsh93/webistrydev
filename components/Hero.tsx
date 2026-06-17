"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "@/lib/language-context";

export default function Hero() {
  const [wordIdx, setWordIdx] = useState(0);
  const { t } = useLang();
  const words = t.hero.rotating;

  useEffect(() => {
    setWordIdx(0);
  }, [words]);

  useEffect(() => {
    const timer = setInterval(() => setWordIdx((i) => (i + 1) % words.length), 2800);
    return () => clearInterval(timer);
  }, [words]);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-6 pt-28 pb-10">
      {/* Subtle aurora blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <div
          className="absolute -top-40 -left-20 w-[600px] h-[600px] rounded-full blur-3xl animate-aurora opacity-30"
          style={{ background: "radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)" }}
        />
        <div
          className="absolute top-1/3 -right-40 w-[500px] h-[500px] rounded-full blur-3xl animate-aurora-alt opacity-20"
          style={{ background: "radial-gradient(circle, rgba(14,165,233,0.15) 0%, transparent 70%)", animationDelay: "3s" }}
        />
        <div
          className="absolute -bottom-40 left-1/4 w-[400px] h-[400px] rounded-full blur-3xl animate-aurora opacity-15"
          style={{ background: "radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%)", animationDelay: "6s" }}
        />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{ backgroundImage: "radial-gradient(#7c3aed 1px, transparent 1px)", backgroundSize: "32px 32px" }}
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        {/* Available badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-violet-200 bg-violet-50 text-sm text-violet-700 mb-8 font-semibold shadow-sm"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-dot" />
          {t.hero.badge}
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-extrabold tracking-tight leading-[1.15] text-slate-900">
            {t.hero.titlePre}{" "}
            <span className="inline-block overflow-visible">
              <AnimatePresence mode="wait">
                <motion.span
                  key={wordIdx}
                  initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -20, filter: "blur(8px)" }}
                  transition={{ duration: 0.45 }}
                  className="text-gradient inline-block"
                >
                  {words[wordIdx]}
                </motion.span>
              </AnimatePresence>
            </span>
            <br />
            <span className="text-gradient-gold">{t.hero.titlePost}</span>
          </h1>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-12 leading-relaxed font-medium"
        >
          {t.hero.desc}
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
        >
          <a href="#start-project" className="btn-primary flex items-center justify-center gap-2 px-9 py-4 text-base">
            {t.hero.cta1} →
          </a>
          <a
            href="#portfolio"
            className="flex items-center justify-center gap-2 px-9 py-4 text-base font-bold text-slate-700 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-violet-200 hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            {t.hero.cta2} ↓
          </a>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto"
        >
          {t.hero.stats.map((s, i) => (
            <div key={i} className="card rounded-2xl py-4 px-3 text-center">
              <div className="text-xl md:text-2xl font-extrabold text-violet-700 mb-1">{s.number}</div>
              <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
        <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-semibold">{t.hero.scroll}</span>
        <div className="w-px h-8 bg-gradient-to-b from-violet-300 to-transparent" />
      </div>
    </section>
  );
}
