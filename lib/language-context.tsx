"use client";
import { createContext, useContext, useState, useEffect, useSyncExternalStore, ReactNode } from "react";
import { translations, type Lang } from "./translations";

type T = (typeof translations)[Lang];
type LangCtx = { lang: Lang; toggle: () => void; t: T };

const LanguageContext = createContext<LangCtx | null>(null);

const subscribeToHydration = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

function detectLang(): Lang {
  try {
    const saved = localStorage.getItem("lang") as Lang | null;
    if (saved === "en" || saved === "ar") return saved;
    const langs = navigator.languages?.length ? navigator.languages : [navigator.language];
    const primary = langs[0];
    if (primary?.toLowerCase().startsWith("ar")) return "ar";
  } catch {}
  return "en";
}

function applyLang(lang: Lang) {
  document.documentElement.lang = lang;
  document.documentElement.dir = translations[lang].dir;
  try { localStorage.setItem("lang", lang); } catch {}
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Match the server's English HTML during hydration, then use the saved/browser language.
  const hydrated = useSyncExternalStore(subscribeToHydration, clientSnapshot, serverSnapshot);
  const [selectedLang, setSelectedLang] = useState<Lang | null>(null);
  const lang = hydrated ? selectedLang ?? detectLang() : "en";

  useEffect(() => {
    // Do not overwrite a saved Arabic preference with the server snapshot.
    if (hydrated) applyLang(lang);
  }, [hydrated, lang]);

  function toggle() {
    const next = lang === "en" ? "ar" : "en";
    applyLang(next);
    setSelectedLang(next);
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
