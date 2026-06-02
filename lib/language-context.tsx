"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { translations, type Lang } from "./translations";

type T = (typeof translations)[Lang];
type LangCtx = { lang: Lang; toggle: () => void; t: T };

const LanguageContext = createContext<LangCtx | null>(null);

function detectLang(): Lang {
  try {
    const saved = localStorage.getItem("lang") as Lang | null;
    if (saved === "en" || saved === "ar") return saved;
    const langs = navigator.languages?.length ? navigator.languages : [navigator.language];
    const hasArabic = langs.some((l) => l?.toLowerCase().startsWith("ar"));
    if (hasArabic) return "ar";
  } catch {}
  return "en";
}

function applyLang(lang: Lang) {
  document.documentElement.lang = lang;
  document.documentElement.dir = translations[lang].dir;
  try { localStorage.setItem("lang", lang); } catch {}
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Lazy init runs on client only — picks up localStorage/browser lang instantly
  const [lang, setLang] = useState<Lang>(() => {
    if (typeof window === "undefined") return "en";
    return detectLang();
  });

  // Apply DOM attributes once on mount (catches SSR→client transition)
  useEffect(() => {
    applyLang(lang);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggle() {
    setLang((l) => {
      const next = l === "en" ? "ar" : "en";
      applyLang(next);
      return next;
    });
  }

  return (
    <LanguageContext.Provider value={{ lang, toggle, t: translations[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used within LanguageProvider");
  return ctx;
}
