"use client";
import { useLang } from "@/lib/language-context";
import { services } from "@/lib/data";

export default function Services() {
  const { t } = useLang();
  const icons = services.map((s) => s.icon);

  return (
    <section id="services" className="py-16 px-4 md:px-6 bg-[#f7f6ff]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="section-label justify-center mb-4">{t.services.sectionLabel}</p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">
            {t.services.title}
          </h2>
          <p className="text-slate-500 text-lg max-w-xl mx-auto">
            {t.services.desc}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {t.services.items.map((service, i) => (
            <div key={i} className="card card-hover rounded-2xl p-7 flex flex-col gap-4">
              <div className="w-12 h-12 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center text-2xl shrink-0">
                {icons[i]}
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 mb-2">{service.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{service.description}</p>
              </div>
              <a
                href="#start-project"
                className="mt-auto text-xs font-bold text-violet-600 hover:text-violet-800 transition-colors flex items-center gap-1"
              >
                {t.services.quote}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
