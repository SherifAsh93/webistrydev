"use client";
import { Code2, Rocket, Headphones } from "lucide-react";
import { motion } from "framer-motion";
import { useLang } from "@/lib/language-context";

const icons = [Code2, Rocket, Headphones];

export default function TrustSignals() {
  const { t } = useLang();
  const items = t.trustSignals.items;

  return (
    <section className="py-8 px-4 md:px-6 bg-white">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        {items.map((label, i) => {
          const Icon = icons[i];
          return (
            <div key={i} className="card rounded-2xl py-4 px-5 flex items-center justify-center gap-3 text-center">
              <div className="w-10 h-10 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center shrink-0">
                <Icon size={20} className="text-violet-600" />
              </div>
              <span className="text-sm font-bold text-slate-700">{label}</span>
            </div>
          );
        })}
      </motion.div>
    </section>
  );
}
