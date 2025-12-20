"use client";
import { useState } from "react";
import { translations } from "@/lib/translations";
import { projects } from "@/lib/projects";
import ContactForm from "@/components/ContactForm";
import Logo from "@/components/Logo";
import {
  MapPin,
  ArrowRight,
  Code,
  ExternalLink,
  Languages,
  Cpu,
  Zap,
  Globe,
} from "lucide-react";

export default function WebCornerHome() {
  const [lang, setLang] = useState<"ar" | "en">("ar");
  const t = translations[lang];

  return (
    <main dir={t.dir} className="bg-white text-slate-900 font-sans">
      {/* --- NAVIGATION --- */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Logo lang={lang} />

          <div className="flex items-center gap-4 md:gap-8">
            <button
              onClick={() => setLang(lang === "ar" ? "en" : "ar")}
              className="flex items-center gap-2 text-sm font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-xl hover:bg-blue-600 hover:text-white transition-all"
            >
              <Languages size={18} />
              {lang === "ar" ? "English" : "العربية"}
            </button>
            <a
              href="#contact"
              className="hidden md:block bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-600 transition-all shadow-lg"
            >
              {t.nav.contact}
            </a>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="pt-20 pb-32 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full text-blue-700 text-xs font-black uppercase tracking-widest mb-8 border border-blue-100">
            <MapPin size={14} />
            {t.hero.location}
          </div>

          <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-[1.1] mb-8">
            {lang === "ar" ? (
              <>
                الركن الرقمي لـ{" "}
                <span className="text-blue-600 italic">نجاحك.</span>
              </>
            ) : (
              <>
                Your Vision, <br /> Our{" "}
                <span className="text-blue-600 italic">Corner.</span>
              </>
            )}
          </h1>

          <p className="text-xl md:text-2xl text-slate-500 max-w-3xl mb-12 leading-relaxed font-medium">
            {t.hero.desc}
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="#contact"
              className="bg-blue-600 text-white px-10 py-5 rounded-2xl font-black text-lg flex items-center gap-3 hover:bg-blue-700 hover:-translate-y-1 transition-all shadow-2xl shadow-blue-200"
            >
              {t.hero.cta_primary}{" "}
              <ArrowRight
                className={lang === "ar" ? "rotate-180" : ""}
                size={20}
              />
            </a>
            <a
              href="#work"
              className="bg-white text-slate-900 border-2 border-slate-100 px-10 py-5 rounded-2xl font-black text-lg hover:bg-slate-50 transition-all"
            >
              {t.hero.cta_secondary}
            </a>
          </div>
        </div>
      </section>

      {/* --- FEATURES (Quick Stats) --- */}
      <section className="pb-32 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
          {[
            {
              icon: <Zap className="text-amber-500" />,
              title: lang === "ar" ? "سرعة فائقة" : "Insane Speed",
              desc:
                lang === "ar"
                  ? "مواقع تفتح في لمح البصر"
                  : "Optimized for Core Web Vitals",
            },
            {
              icon: <Cpu className="text-blue-600" />,
              title: lang === "ar" ? "تقنيات حديثة" : "Modern Stack",
              desc:
                lang === "ar"
                  ? "نستخدم Next.js و Neon DB"
                  : "Built with Next.js & Neon DB",
            },
            {
              icon: <Globe className="text-emerald-500" />,
              title: lang === "ar" ? "توسع عالمي" : "Global Scale",
              desc:
                lang === "ar"
                  ? "من دمياط إلى العالم"
                  : "From Damietta to the World",
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="flex flex-col items-center p-8 bg-slate-50 rounded-[2rem] text-center border border-slate-100"
            >
              <div className="mb-4">{feature.icon}</div>
              <h4 className="text-xl font-bold mb-2">{feature.title}</h4>
              <p className="text-slate-500 text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- PORTFOLIO --- */}
      <section
        id="work"
        className="bg-slate-900 py-32 px-6 rounded-[3rem] mx-4 md:mx-10 text-white"
      >
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 text-center md:text-right">
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              {t.portfolio.title}
            </h2>
            <p className="text-slate-400 text-lg">{t.portfolio.desc}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {projects.map((project, index) => (
              <div
                key={index}
                className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-[2rem] border border-slate-700 hover:border-blue-500 transition-all group"
              >
                <div className="flex justify-between items-start mb-8">
                  <div className="p-4 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-900/20">
                    <Code size={24} />
                  </div>
                  <a
                    href={project.link}
                    target="_blank"
                    className="p-2 hover:bg-slate-700 rounded-full transition"
                  >
                    <ExternalLink className="text-slate-500 hover:text-white" />
                  </a>
                </div>
                <h3 className="text-2xl font-bold mb-3">
                  {lang === "ar" ? project.titleAr : project.title}
                </h3>
                <p className="text-slate-400 leading-relaxed mb-8 text-sm h-16 overflow-hidden">
                  {lang === "ar" ? project.descriptionAr : project.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-black bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg uppercase tracking-wider"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CONTACT --- */}
      <section id="contact" className="py-32 px-6">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-5xl font-black mb-6 italic">{t.contact.title}</h2>
          <p className="text-slate-500 mb-12 font-medium">{t.contact.desc}</p>
          <ContactForm lang={lang} t={t.contact} />
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-20 border-t border-slate-100 text-center bg-white">
        <div className="flex justify-center mb-8">
          <Logo lang={lang} />
        </div>
        <p className="text-slate-400 text-sm leading-loose">
          {t.footer.rights} <br />
          {t.footer.built}{" "}
          <span className="text-slate-900 font-bold underline"></span>
        </p>
      </footer>
    </main>
  );
}
