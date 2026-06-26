"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLang } from "@/lib/language-context";

const stepStyles = [
  { bg: "bg-violet-50", border: "border-violet-200", text: "text-violet-700", icon: "💬" },
  { bg: "bg-sky-50", border: "border-sky-200", text: "text-sky-700", icon: "🎨" },
  { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", icon: "⚙️" },
  { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", icon: "🚀" },
];

const stepNumbers = ["01", "02", "03", "04"];

export default function HowItWorks() {
  const { t } = useLang();

  return (
    <section id="how-it-works" className="py-10 bg-[#f7f6ff]">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <div className="text-center mb-8">
          <p className="section-label justify-center mb-4">{t.howItWorks.sectionLabel}</p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">
            {t.howItWorks.title1}
            <br />
            <span className="text-gradient">{t.howItWorks.title2}</span>
          </h2>
          <p className="text-slate-500 text-lg max-w-xl mx-auto">
            {t.howItWorks.desc}
          </p>
        </div>
      </div>

      {/* Mobile: horizontal scroll */}
      <div className="md:hidden px-4">
        <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-4 hide-scrollbar">
          {t.howItWorks.steps.map((step, i) => {
            const s = stepStyles[i];
            return (
              <div
                key={i}
                className="snap-start shrink-0 w-[72vw] card rounded-2xl p-6 flex flex-col items-center text-center gap-5"
              >
                <div className={`relative w-16 h-16 rounded-2xl ${s.bg} border ${s.border} flex items-center justify-center text-3xl shrink-0 shadow-sm`}>
                  {s.icon}
                  <span className={`absolute -top-2 -right-2 w-5 h-5 rounded-full bg-white border ${s.border} text-[9px] font-black ${s.text} flex items-center justify-center`}>
                    {stepNumbers[i]}
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Animated swipe indicator */}
        <div className="flex items-center justify-center gap-3 mt-1">
          <ChevronLeft size={18} className="text-violet-400 animate-bounce-left" />
          <div className="flex gap-1.5 items-center">
            {[...Array(t.howItWorks.steps.length)].map((_, i) => (
              <div
                key={i}
                className={`rounded-full ${i === 0 ? "w-5 h-1.5 bg-violet-500" : "w-1.5 h-1.5 bg-slate-200"}`}
              />
            ))}
          </div>
          <ChevronRight size={18} className="text-violet-400 animate-bounce-right" />
        </div>
      </div>

      {/* Desktop: 4-column grid */}
      <div className="hidden md:block max-w-6xl mx-auto px-6">
        <div className="relative">
          <div className="absolute top-10 left-[calc(12.5%+20px)] right-[calc(12.5%+20px)] h-px bg-gradient-to-r from-transparent via-violet-200 to-transparent" />
          <div className="grid grid-cols-4 gap-6">
            {t.howItWorks.steps.map((step, i) => {
              const s = stepStyles[i];
              return (
                <div key={i} className="flex flex-col items-center text-center gap-4">
                  <div className={`relative w-16 h-16 rounded-2xl ${s.bg} border ${s.border} flex items-center justify-center text-2xl shrink-0 shadow-sm`}>
                    {s.icon}
                    <span className={`absolute -top-2 -right-2 w-5 h-5 rounded-full bg-white border ${s.border} text-[9px] font-black ${s.text} flex items-center justify-center`}>
                      {stepNumbers[i]}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 mb-2">{step.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
