"use client";
import { motion } from "framer-motion";
import { useLang } from "@/lib/language-context";
import { Sparkles } from "lucide-react";

export default function HireCTA() {
  const { t } = useLang();
  const c = (t as any).hireCTA;

  return (
    <section className="px-4 py-6 md:py-8">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55 }}
        className="max-w-3xl mx-auto rounded-3xl overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 50%, #5b21b6 100%)",
        }}
      >
        <div className="relative px-8 py-10 md:py-12 text-center overflow-hidden">
          {/* Background glow */}
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/5 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-white/5 blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 text-white/90 text-xs font-bold px-3 py-1.5 rounded-full mb-5 uppercase tracking-widest">
              <Sparkles size={11} />
              Available Now
            </div>

            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-3 leading-tight">
              {c.headline}
            </h2>
            <p className="text-violet-200 text-base md:text-lg max-w-lg mx-auto mb-8 leading-relaxed">
              {c.sub}
            </p>

            <a
              href="#start-project"
              className="inline-flex items-center gap-2 bg-white text-violet-700 font-extrabold px-8 py-4 rounded-2xl text-base shadow-2xl shadow-violet-900/40 hover:bg-violet-50 hover:-translate-y-0.5 hover:shadow-violet-900/60 transition-all"
            >
              {c.cta}
            </a>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
