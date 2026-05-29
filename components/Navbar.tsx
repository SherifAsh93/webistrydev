"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";

const links = [
  { label: "Portfolio", href: "#portfolio" },
  { label: "Services", href: "#services" },
  { label: "Pricing", href: "#pricing" },
  { label: "How It Works", href: "#how-it-works" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const clickCountRef = useRef(0);
  const lastClickRef = useRef(0);
  const router = useRouter();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  function handleLogoClick(e: React.MouseEvent) {
    e.preventDefault();
    const now = Date.now();
    if (now - lastClickRef.current > 700) clickCountRef.current = 0;
    clickCountRef.current += 1;
    lastClickRef.current = now;
    if (clickCountRef.current >= 3) {
      clickCountRef.current = 0;
      router.push("/admin");
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4">
      <nav
        className={`w-full max-w-5xl rounded-2xl px-5 py-3 flex items-center justify-between gap-4 transition-all duration-300 ${
          scrolled ? "nav-glass" : "bg-transparent"
        }`}
      >
        {/* Logo — 3 clicks → /admin */}
        <button
          onClick={handleLogoClick}
          className="flex items-center gap-2.5 shrink-0 hover:opacity-80 transition-opacity"
          aria-label="Web Corner home"
        >
          <Logo size={32} />
          <div className="flex flex-col -space-y-0.5">
            <span className="font-extrabold text-slate-900 text-base leading-tight tracking-tight">
              Web<span className="text-gradient">Corner</span>
            </span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.18em]">
              Web Developer
            </span>
          </div>
        </button>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-7">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="text-sm text-slate-500 hover:text-violet-700 transition-colors font-semibold"
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* CTA + mobile toggle */}
        <div className="flex items-center gap-3">
          <a
            href="#start-project"
            className="btn-primary hidden md:flex items-center gap-1.5 px-5 py-2.5 text-sm"
          >
            <span>Hire Me</span>
            <span className="opacity-70">→</span>
          </a>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="md:hidden w-9 h-9 flex flex-col items-center justify-center gap-1.5 rounded-xl border border-violet-100 bg-white shadow-sm"
            aria-label="Toggle menu"
          >
            <span className={`block w-4 h-0.5 bg-slate-600 rounded-full transition-all ${menuOpen ? "rotate-45 translate-y-1.5" : ""}`} />
            <span className={`block w-4 h-0.5 bg-slate-600 rounded-full transition-all ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`block w-4 h-0.5 bg-slate-600 rounded-full transition-all ${menuOpen ? "-rotate-45 -translate-y-1.5" : ""}`} />
          </button>
        </div>
      </nav>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="absolute top-20 left-4 right-4 bg-white rounded-2xl p-5 flex flex-col gap-2 shadow-2xl shadow-violet-100 border border-violet-100 md:hidden">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="text-sm font-semibold text-slate-600 hover:text-violet-700 py-2.5 border-b border-slate-50 last:border-0 transition-colors"
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
