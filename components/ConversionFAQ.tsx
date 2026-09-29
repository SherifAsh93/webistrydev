"use client";

import { useLang } from "@/lib/language-context";

export default function ConversionFAQ() {
  const { t } = useLang();
  return (
    <section className="bg-[#f7f6ff] py-12 px-4 md:px-6" aria-labelledby="faq-heading">
      <div className="max-w-3xl mx-auto">
        <h2 id="faq-heading" className="text-2xl md:text-3xl font-extrabold text-slate-900 text-center mb-7">{t.conversionFaq.title}</h2>
        <div className="space-y-3">
          {t.conversionFaq.items.map((item) => <details key={item.question} className="card rounded-2xl bg-white p-5">
            <summary className="font-bold text-slate-800 cursor-pointer">{item.question}</summary>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">{item.answer}</p>
          </details>)}
        </div>
      </div>
    </section>
  );
}
