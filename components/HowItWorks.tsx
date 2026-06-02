"use client";
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
    <section id="how-it-works" className="py-28 px-4 md:px-6 bg-[#f7f6ff]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
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

        <div className="relative">
          <div className="hidden md:block absolute top-10 left-[calc(12.5%+20px)] right-[calc(12.5%+20px)] h-px bg-gradient-to-r from-transparent via-violet-200 to-transparent" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
