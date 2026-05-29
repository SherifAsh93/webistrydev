"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { CheckCircle2, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { projects } from "@/lib/data";
import { submitInquiry } from "@/app/actions/submit-inquiry";

const PROJECT_TYPES = [
  { id: "ecommerce", label: "E-Commerce Store", icon: "🛍" },
  { id: "fashion", label: "Fashion / Brand", icon: "👗" },
  { id: "clinic", label: "Medical / Clinic", icon: "🏥" },
  { id: "web-app", label: "Web Application", icon: "⚙️" },
  { id: "corporate", label: "Corporate Site", icon: "💼" },
  { id: "landing", label: "Landing Page", icon: "🚀" },
];

const BUDGET_OPTIONS = [
  "Under 12,000 EGP (~$300)",
  "12,000 – 38,000 EGP ($300–$800)",
  "38,000 – 75,000 EGP ($800–$1,600)",
  "Over 75,000 EGP ($1,600+)",
  "International rates (USD)",
  "I'm flexible — let's discuss",
];

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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    const t = params.get("type");
    if (ref) setReference(ref);
    if (t) setType(t);
  }, []);

  const filteredRefs =
    type && type !== "corporate" && type !== "landing"
      ? projects.filter((p) => p.category === type)
      : projects;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !type || !message.trim()) return;
    if (!phone.trim() && !email.trim()) return;
    setStatus("sending");
    await submitInquiry({ name, email, phone, projectType: type, reference, budget, message });
    setStatus("success");
  }

  if (status === "success") {
    return (
      <section id="start-project" className="py-28 px-4 md:px-6 bg-white">
        <div className="max-w-xl mx-auto text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center gap-6"
          >
            <div className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
              <CheckCircle2 size={36} className="text-emerald-500" />
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900">Message Sent!</h2>
            <p className="text-slate-500 leading-relaxed">
              Thanks <strong className="text-slate-800">{name}</strong>! I&apos;ve received your project request and will get back to you within 24 hours.
            </p>
            <p className="text-sm text-slate-400">I&apos;ll reach out via the contact details you provided.</p>
            <button
              onClick={() => {
                setStatus("idle");
                setType(""); setReference(""); setName(""); setPhone(""); setEmail(""); setBudget(""); setMessage("");
              }}
              className="text-sm font-bold text-violet-600 hover:text-violet-800 underline"
            >
              Submit another request
            </button>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section id="start-project" className="py-28 px-4 md:px-6 bg-white">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-14">
          <p className="section-label justify-center mb-4">Start a Project</p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">
            Tell Me About
            <br />
            <span className="text-gradient">Your Idea</span>
          </h2>
          <p className="text-slate-500 text-lg">
            Fill in the details below and I&apos;ll get back to you within 24 hours with a plan and estimate.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Step 1 */}
          <div className="card rounded-2xl p-6">
            <p className="text-xs font-extrabold uppercase tracking-widest text-violet-600 mb-4">
              Step 1 — What type of project?
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {PROJECT_TYPES.map((pt) => (
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
                  Step 2 — Pick a reference (optional)
                </p>
                <p className="text-xs text-slate-400 mb-4">
                  Choose a project from my portfolio as inspiration — or skip and describe from scratch.
                </p>
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
                    Clear selection
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step 3 */}
          <div className="card rounded-2xl p-6">
            <p className="text-xs font-extrabold uppercase tracking-widest text-violet-600 mb-4">
              Step 3 — Describe your idea
            </p>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={5}
              placeholder="Tell me what you're building, who your audience is, what features you need, and anything else that helps me understand your vision..."
              className="field w-full rounded-xl px-4 py-3 text-sm resize-none"
            />
            <div className="mt-3">
              <label className="text-xs text-slate-500 font-semibold block mb-2">Budget range</label>
              <select
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="field w-full rounded-xl px-4 py-2.5 text-sm"
              >
                <option value="">Select a budget range (optional)</option>
                {BUDGET_OPTIONS.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Step 4 */}
          <div className="card rounded-2xl p-6">
            <p className="text-xs font-extrabold uppercase tracking-widest text-violet-600 mb-4">
              Step 4 — How to reach you
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-500 font-semibold block mb-2">
                  Your Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Full name"
                  className="field w-full rounded-xl px-4 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 font-semibold block mb-2">WhatsApp / Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+20 100 000 0000"
                  className="field w-full rounded-xl px-4 py-2.5 text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-slate-500 font-semibold block mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="field w-full rounded-xl px-4 py-2.5 text-sm"
                />
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-3">* Provide at least one contact method (phone or email).</p>
          </div>

          <button
            type="submit"
            disabled={status === "sending" || !type || !name || !message || (!phone && !email)}
            className="btn-primary flex items-center justify-center gap-2.5 py-4 text-base w-full disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            {status === "sending" ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send size={18} />
                Send My Project Request
              </>
            )}
          </button>
        </form>
      </div>
    </section>
  );
}
