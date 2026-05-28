"use client";
import { useState, useEffect } from "react";

const links = [
  { label: "Portfolio", href: "#portfolio" },
  { label: "Services", href: "#services" },
  { label: "Pricing", href: "#pricing" },
  { label: "How It Works", href: "#how-it-works" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4">
      <nav
        className={`w-full max-w-5xl rounded-2xl px-5 py-3 flex items-center justify-between gap-4 transition-all duration-300 ${
          scrolled
            ? "glass shadow-2xl shadow-black/50"
            : "bg-transparent"
        }`}
      >
        {/* Logo */}
        <a href="#" className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <span className="text-white font-black text-sm leading-none">W</span>
          </div>
          <span className="font-extrabold text-white text-base tracking-tight">
            Web Corner
          </span>
        </a>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-7">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="text-sm text-slate-400 hover:text-white transition-colors font-semibold"
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* CTA + Mobile Toggle */}
        <div className="flex items-center gap-3">
          <a
            href="#start-project"
            className="btn-primary hidden md:flex items-center gap-1.5 px-5 py-2.5 text-sm"
          >
            <span>Hire Me</span>
            <span className="text-violet-300">→</span>
          </a>

          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="md:hidden w-9 h-9 flex flex-col items-center justify-center gap-1.5 glass rounded-xl"
            aria-label="Toggle menu"
          >
            <span
              className={`block w-4.5 h-0.5 bg-white rounded-full transition-all ${menuOpen ? "rotate-45 translate-y-2" : ""}`}
            />
            <span
              className={`block w-4.5 h-0.5 bg-white rounded-full transition-all ${menuOpen ? "opacity-0" : ""}`}
            />
            <span
              className={`block w-4.5 h-0.5 bg-white rounded-full transition-all ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`}
            />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="absolute top-20 left-4 right-4 glass rounded-2xl p-5 flex flex-col gap-3 shadow-2xl shadow-black/60 md:hidden">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="text-sm font-semibold text-slate-300 hover:text-white py-2 border-b border-white/5 last:border-0 transition-colors"
            >
              {l.label}
            </a>
          ))}
          <a
            href="#start-project"
            onClick={() => setMenuOpen(false)}
            className="btn-primary mt-2 flex items-center justify-center gap-2 py-3 text-sm"
          >
            Hire Me →
          </a>
        </div>
      )}
    </header>
  );
}
