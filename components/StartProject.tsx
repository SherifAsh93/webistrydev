"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { CheckCircle2, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { projects } from "@/lib/data";
import { submitInquiry } from "@/app/actions/submit-inquiry";
import { useLang } from "@/lib/language-context";

type Status = "idle" | "sending" | "success";

export default function StartProject() {
  const [type, setType] = useState("");
  const [reference, setReference] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [budget, setBudget] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const { t } = useLang();
  const sp = t.startProject;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    const tp = params.get("type");
    if (ref) setReference(ref);
    if (tp) setType(tp);
  }, []);

  const filteredRefs = type ? projects : [];

  // Step 2 is conditional — renumber steps 3 & 4 when it's hidden
  const s3label = type ? sp.step3Label : sp.step3Label.replace(/\d+/, "2");
  const s4label = type ? sp.step4Label : sp.step4Label.replace(/\d+/, "3");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;
    if (!phone.trim() && !email.trim()) return;
    setStatus("sending");
    await submitInquiry({ name, email, phone, projectType: type, reference, budget, message });
    setStatus("success");
  }

  if (status === "success") {
    return (
      <section id="start-project" className="py-12 px-4 md:px-6 bg-white">
        <div className="max-w-xl mx-auto text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center gap-6"
          >
            <div className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
              <CheckCircle2 size={36} className="text-emerald-500" />
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900">{sp.successTitle}</h2>
            <p className="text-slate-500 leading-relaxed">
              {sp.successMessage.replace("{name}", name)}
            </p>
            <p className="text-sm text-slate-400">{sp.successNote}</p>
            <button
              onClick={() => {
                setStatus("idle");
                setType(""); setReference(""); setName(""); setPhone(""); setEmail(""); setBudget(""); setMessage("");
              }}
              className="text-sm font-bold text-violet-600 hover:text-violet-800 underline"
            >
              {sp.successAgain}
            </button>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section id="start-project" className="py-12 px-4 md:px-6 bg-white">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <p className="section-label justify-center mb-4">{sp.sectionLabel}</p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">
            {sp.title1}
            <br />
            <span className="text-gradient">{sp.title2}</span>
          </h2>
          <p className="text-slate-500 text-lg max-w-xl mx-auto">{sp.desc}</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Step 1 */}
          <div className="card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-extrabold uppercase tracking-widest text-violet-600">
                {sp.step1Label}
              </p>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{sp.step1Optional}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {sp.types.map((pt) => (
                <button
                  key={pt.id}
                  type="button"
                  onClick={() => { setType(pt.id); setReference(""); }}
                  className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-bold transition-all text-left ${
                    type === pt.id
                      ? "bg-violet-600 text-white border border-violet-600 shadow-md shadow-violet-200"
                      : "bg-slate-50 border border-slate-200 text-slate-600 hover:border-violet-300 hover:text-violet-700"
                  }`}
                >
                  <span className="text-base shrink-0">{pt.icon}</span>
                  <span className="leading-tight">{pt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2 — Reference picker */}
          <AnimatePresence>
            {type && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="card rounded-2xl p-6"
              >
                <p className="text-xs font-extrabold uppercase tracking-widest text-violet-600 mb-1">
                  {sp.step2Label}
                </p>
                <p className="text-xs text-slate-400 mb-4">{sp.step2Hint}</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {filteredRefs.map((proj) => (
                    <button
                      key={proj.id}
                      type="button"
                      onClick={() => setReference(reference === proj.id ? "" : proj.id)}
                      className={`relative rounded-xl overflow-hidden border-2 transition-all ${
                        reference === proj.id
                          ? "border-violet-500 shadow-md shadow-violet-100"
                          : "border-slate-200 hover:border-violet-300"
                      }`}
                    >
                      <div className="relative h-24 bg-slate-100">
                        <Image src={proj.screenshot} alt={proj.name} fill sizes="200px" className="object-cover object-top" />
                        {reference === proj.id && (
                          <div className="absolute inset-0 bg-violet-600/20 flex items-center justify-center">
                            <CheckCircle2 size={20} className="text-violet-600" />
                          </div>
                        )}
                      </div>
                      <div className="py-2 px-3 bg-white">
                        <p className="text-[11px] font-bold text-slate-700 truncate">{proj.name}</p>
                      </div>
                    </button>
                  ))}
                </div>
                {reference && (
                  <button type="button" onClick={() => setReference("")} className="mt-3 text-xs text-slate-400 hover:text-slate-600 underline">
                    {sp.clearRef}
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step 3 */}
          <div className="card rounded-2xl p-6">
            <p className="text-xs font-extrabold uppercase tracking-widest text-violet-600 mb-4">
              {s3label}
            </p>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={5}
              placeholder={sp.step3Placeholder}
              className="field w-full rounded-xl px-4 py-3 text-sm resize-none"
            />
            <div className="mt-3">
              <label className="text-xs text-slate-500 font-semibold block mb-2">{sp.budgetLabel}</label>
              <select
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="field w-full rounded-xl px-4 py-2.5 text-sm"
              >
                <option value="">{sp.budgetPlaceholder}</option>
                {sp.budgets.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Step 4 */}
          <div className="card rounded-2xl p-6">
            <p className="text-xs font-extrabold uppercase tracking-widest text-violet-600 mb-4">
              {s4label}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-500 font-semibold block mb-2">
                  {sp.nameLabel} <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder={sp.namePlaceholder}
                  className="field w-full rounded-xl px-4 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 font-semibold block mb-2">{sp.phoneLabel}</label>
                <input
                  type="tel"
                  dir="ltr"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={sp.phonePlaceholder}
                  className="field w-full rounded-xl px-4 py-2.5 text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-slate-500 font-semibold block mb-2">{sp.emailLabel}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={sp.emailPlaceholder}
                  className="field w-full rounded-xl px-4 py-2.5 text-sm"
                />
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-3">{sp.contactNote}</p>
          </div>

          <button
            type="submit"
            disabled={status === "sending" || !name || !message || (!phone && !email)}
            className="btn-primary flex items-center justify-center gap-2.5 py-4 text-base w-full disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            {status === "sending" ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {sp.sending}
              </>
            ) : (
              <>
                <Send size={18} />
                {sp.submit}
              </>
            )}
          </button>
        </form>
      </div>
    </section>
  );
}
