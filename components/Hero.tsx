"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ROTATING_WORDS = ["Websites", "Web Apps", "E-Commerce", "Digital Products"];

const stats = [
  { number: "6+", label: "Projects Shipped" },
  { number: "3+", label: "Years of Experience" },
  { number: "Next.js", label: "Primary Stack" },
  { number: "100%", label: "On-Time Delivery" },
];

export default function Hero() {
  const [wordIdx, setWordIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setWordIdx((i) => (i + 1) % ROTATING_WORDS.length);
    }, 2800);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-6 pt-28 pb-16">
      {/* Aurora background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <div
          className="absolute -top-48 -left-32 w-[700px] h-[700px] rounded-full blur-3xl animate-aurora opacity-40"
          style={{ background: "radial-gradient(circle, rgba(139,92,246,0.5) 0%, transparent 70%)" }}
        />
        <div
          className="absolute top-1/3 -right-48 w-[600px] h-[600px] rounded-full blur-3xl animate-aurora-alt opacity-30"
          style={{ background: "radial-gradient(circle, rgba(6,182,212,0.4) 0%, transparent 70%)", animationDelay: "3s" }}
        />
        <div
          className="absolute -bottom-48 left-1/4 w-[500px] h-[500px] rounded-full blur-3xl animate-aurora opacity-25"
          style={{ background: "radial-gradient(circle, rgba(245,158,11,0.35) 0%, transparent 70%)", animationDelay: "6s" }}
        />
        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        {/* Available badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full glass text-sm text-slate-300 mb-8 font-medium"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-dot" />
          Available for new projects worldwide
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-extrabold tracking-tight leading-[1.05] text-white">
            I Build{" "}
            <span className="inline-block min-w-[3ch] text-left">
              <AnimatePresence mode="wait">
                <motion.span
                  key={wordIdx}
                  initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -20, filter: "blur(8px)" }}
                  transition={{ duration: 0.45 }}
                  className="text-gradient inline-block"
                >
                  {ROTATING_WORDS[wordIdx]}
                </motion.span>
              </AnimatePresence>
            </span>
            <br />
            <span className="text-white">That </span>
            <span className="text-gradient-gold">Win.</span>
          </h1>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed font-medium"
        >
          Full-Stack Web Developer specializing in{" "}
          <span className="text-violet-400 font-semibold">Next.js</span>,{" "}
          <span className="text-cyan-400 font-semibold">React</span> &{" "}
          <span className="text-amber-400 font-semibold">modern web applications</span>.
          I turn your vision into fast, elegant digital products — available to clients worldwide.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-20"
        >
          <a
            href="#start-project"
            className="btn-primary flex items-center justify-center gap-2 px-9 py-4 text-base"
          >
            <span>Start a Project</span>
            <span>→</span>
          </a>
          <a
            href="#portfolio"
            className="flex items-center justify-center gap-2 px-9 py-4 text-base font-bold text-white glass rounded-2xl transition-all hover:-translate-y-0.5 hover:bg-white/5"
          >
            See My Work
            <span className="text-slate-400">↓</span>
          </a>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto"
        >
          {stats.map((s, i) => (
            <div
              key={i}
              className="glass rounded-2xl py-4 px-3 text-center"
            >
              <div className="text-xl md:text-2xl font-extrabold text-white mb-1">{s.number}</div>
              <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30">
        <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-semibold">Scroll</span>
        <div className="w-px h-10 bg-gradient-to-b from-slate-500 to-transparent" />
      </div>
    </section>
  );
}
