"use client";
import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLang } from "@/lib/language-context";
import { services } from "@/lib/data";

export default function Services() {
  const { t } = useLang();
  const icons = services.map((s) => s.icon);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const total = t.services.items.length;

  function slide(dir: 1 | -1) {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.offsetWidth * 0.8, behavior: "smooth" });
  }

  function onScroll() {
    const el = scrollRef.current;
    if (!el) return;
    const cardW = el.scrollWidth / total;
    setActiveIdx(Math.min(Math.round(el.scrollLeft / cardW), total - 1));
  }

  return (
    <section id="services" className="py-10 bg-[#f7f6ff]">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <div className="text-center mb-8">
          <p className="section-label justify-center mb-4">{t.services.sectionLabel}</p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">{t.services.title}</h2>
          <p className="text-slate-500 text-lg max-w-xl mx-auto">{t.services.desc}</p>
        </div>
      </div>

      {/* Mobile: horizontal scroll */}
      <div className="md:hidden px-4">
        <div className="relative">
          <button
            onClick={() => slide(-1)}
            className="absolute left-0 top-[45%] -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/95 border border-violet-100 shadow-md flex items-center justify-center text-violet-600 hover:bg-violet-50 transition"
          >
            <ChevronLeft size={16} />
          </button>

          <div
            ref={scrollRef}
            dir="ltr"
            onScroll={onScroll}
            className="flex gap-3 overflow-x-auto snap-x snap-mandatory px-4 pb-4 hide-scrollbar"
          >
            {t.services.items.map((service, i) => (
              <div key={i} className="snap-start shrink-0 w-[72vw] card rounded-2xl p-6 flex flex-col gap-4">
                <div className="w-12 h-12 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center text-2xl shrink-0">
                  {icons[i]}
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-extrabold text-slate-900 mb-2">{service.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{service.description}</p>
                </div>
                <a href="#start-project" className="text-xs font-bold text-violet-600 hover:text-violet-800 transition-colors flex items-center gap-1">
                  {t.services.quote}
                </a>
              </div>
            ))}
          </div>

          <button
            onClick={() => slide(1)}
            className="absolute right-0 top-[45%] -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/95 border border-violet-100 shadow-md flex items-center justify-center text-violet-600 hover:bg-violet-50 transition"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="flex gap-1.5 items-center justify-center mt-3">
          {[...Array(total)].map((_, i) => (
            <div key={i} className={`rounded-full transition-all duration-300 ${i === activeIdx ? "w-5 h-1.5 bg-violet-500" : "w-1.5 h-1.5 bg-slate-200"}`} />
          ))}
        </div>
      </div>

      {/* Desktop: 3-column grid */}
      <div className="hidden md:grid max-w-6xl mx-auto px-6 grid-cols-3 gap-5">
        {t.services.items.map((service, i) => (
          <div key={i} className="card card-hover rounded-2xl p-7 flex flex-col gap-4">
            <div className="w-12 h-12 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center text-2xl shrink-0">
              {icons[i]}
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 mb-2">{service.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{service.description}</p>
            </div>
            <a href="#start-project" className="mt-auto text-xs font-bold text-violet-600 hover:text-violet-800 transition-colors flex items-center gap-1">
              {t.services.quote}
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
