"use client";
import { CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import { pricing } from "@/lib/data";
import { useLang } from "@/lib/language-context";

export default function Pricing() {
  const { t } = useLang();

  return (
    <section id="pricing" className="py-10 bg-white">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <div className="text-center mb-8">
          <p className="section-label justify-center mb-4">{t.pricing.sectionLabel}</p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">
            {t.pricing.title1}
            <br />
            <span className="text-gradient">{t.pricing.title2}</span>
          </h2>
          <p className="text-slate-500 text-lg max-w-xl mx-auto">
            {t.pricing.desc}
          </p>
        </div>
      </div>

      {/* Mobile: horizontal scroll */}
      <div className="md:hidden px-4">
        <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-4 hide-scrollbar">
          {t.pricing.tiers.map((tier, i) => (
            <div
              key={i}
              className={`snap-start shrink-0 w-[82vw] relative card rounded-2xl p-6 flex flex-col gap-4 ${
                pricing[i].popular ? "border-violet-400 shadow-xl shadow-violet-100" : ""
              }`}
            >
              {pricing[i].popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-200 whitespace-nowrap">
                    {t.pricing.popular}
                  </span>
                </div>
              )}

              <div>
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${pricing[i].color} mb-3 shadow-md`}>
                  <span className="text-white font-black">{i + 1}</span>
                </div>
                <h3 className="text-lg font-extrabold text-slate-900 mb-1">{tier.name}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{tier.description}</p>
              </div>

              <div className="border-y border-slate-100 py-3">
                <div className="text-xl font-extrabold text-slate-900 mb-0.5">
                  {pricing[i].egp}{" "}
                  <span className="text-slate-400 font-semibold text-sm">{t.pricing.egpLabel}</span>
                </div>
                <div className="text-sm font-bold text-slate-500">
                  {pricing[i].usd}{" "}
                  <span className="text-slate-400 font-normal">{t.pricing.usdLabel}</span>
                </div>
                <div className="mt-1.5 text-[10px] font-bold text-violet-600 uppercase tracking-wider">
                  ⏱ {tier.timeline}
                </div>
              </div>

              <ul className="flex flex-col gap-2 flex-1">
                {tier.features.map((f, fi) => (
                  <li key={fi} className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <a
                href="#start-project"
                className={`mt-2 flex items-center justify-center gap-1.5 py-3 rounded-xl text-sm font-bold transition-all ${
                  pricing[i].popular
                    ? "btn-primary"
                    : "bg-slate-50 hover:bg-violet-50 border border-slate-200 hover:border-violet-200 text-slate-700 hover:text-violet-700"
                }`}
              >
                {t.pricing.cta}
              </a>
            </div>
          ))}
        </div>

        {/* Animated swipe indicator */}
        <div className="flex items-center justify-center gap-3 mt-1">
          <ChevronLeft size={18} className="text-violet-400 animate-bounce-left" />
          <div className="flex gap-1.5 items-center">
            {[...Array(t.pricing.tiers.length)].map((_, i) => (
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
      <div className="hidden md:grid max-w-6xl mx-auto px-6 grid-cols-4 gap-5">
        {t.pricing.tiers.map((tier, i) => (
          <div
            key={i}
            className={`relative card card-hover rounded-2xl p-7 flex flex-col gap-5 ${
              pricing[i].popular ? "border-violet-400 shadow-xl shadow-violet-100" : ""
            }`}
          >
            {pricing[i].popular && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="px-4 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-200 whitespace-nowrap">
                  {t.pricing.popular}
                </span>
              </div>
            )}

            <div>
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${pricing[i].color} mb-4 shadow-md`}>
                <span className="text-white font-black">{i + 1}</span>
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 mb-1">{tier.name}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{tier.description}</p>
            </div>

            <div className="border-y border-slate-100 py-4">
              <div className="text-xl font-extrabold text-slate-900 mb-0.5">
                {pricing[i].egp}{" "}
                <span className="text-slate-400 font-semibold text-sm">{t.pricing.egpLabel}</span>
              </div>
              <div className="text-sm font-bold text-slate-500">
                {pricing[i].usd}{" "}
                <span className="text-slate-400 font-normal">{t.pricing.usdLabel}</span>
              </div>
              <div className="mt-2 text-[10px] font-bold text-violet-600 uppercase tracking-wider">
                ⏱ {tier.timeline}
              </div>
            </div>

            <ul className="flex flex-col gap-2.5 flex-1">
              {tier.features.map((f, fi) => (
                <li key={fi} className="flex items-start gap-2 text-sm text-slate-600">
                  <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            <a
              href="#start-project"
              className={`mt-2 flex items-center justify-center gap-1.5 py-3 rounded-xl text-sm font-bold transition-all ${
                pricing[i].popular
                  ? "btn-primary"
                  : "bg-slate-50 hover:bg-violet-50 border border-slate-200 hover:border-violet-200 text-slate-700 hover:text-violet-700"
              }`}
            >
              {t.pricing.cta}
            </a>
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-slate-400 mt-8 px-4">
        {t.pricing.footerNote}{" "}
        <a href="#start-project" className="text-violet-600 hover:underline font-semibold">
          {t.pricing.footerLink}
        </a>
      </p>
    </section>
  );
}
