"use client";
import { Code2, Languages, Wrench } from "lucide-react";
import { motion } from "framer-motion";
import { useLang } from "@/lib/language-context";

const icons = [Code2, Languages, Wrench];

export default function WhyChooseMe() {
  const { t } = useLang();
  const w = t.whyChooseMe;

  return (
    <section className="py-10 px-4 md:px-6 bg-[#f7f6ff]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <p className="section-label justify-center mb-4">{w.sectionLabel}</p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">
            {w.title1} <span className="text-gradient">{w.title2}</span>
          </h2>
          <p className="text-slate-500 text-lg max-w-xl mx-auto">{w.desc}</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-5"
        >
          {w.items.map((item, i) => {
            const Icon = icons[i];
            return (
              <div key={i} className="card card-hover rounded-2xl p-7 flex flex-col gap-4 bg-white">
                <div className="w-12 h-12 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center shrink-0">
                  <Icon size={22} className="text-violet-600" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{item.description}</p>
                </div>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
