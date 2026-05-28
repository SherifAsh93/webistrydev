import { CheckCircle2 } from "lucide-react";
import { pricing } from "@/lib/data";

export default function Pricing() {
  return (
    <section id="pricing" className="py-28 px-4 md:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="section-label justify-center mb-4">Pricing</p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            Transparent Pricing,
            <br />
            <span className="text-gradient">No Surprises</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            All prices start from the ranges below and vary by complexity. Payment is 50% upfront, 50% on delivery.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {pricing.map((tier, i) => (
            <div
              key={i}
              className={`relative glass glass-hover rounded-2xl p-7 flex flex-col gap-5 ${
                tier.popular
                  ? "border border-violet-500/40 shadow-2xl shadow-violet-500/10"
                  : ""
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/30 whitespace-nowrap">
                    Most Popular
                  </span>
                </div>
              )}

              {/* Tier header */}
              <div>
                <div
                  className={`inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${tier.color} mb-4 shadow-lg`}
                >
                  <span className="text-white text-base font-black">{i + 1}</span>
                </div>
                <h3 className="text-lg font-extrabold text-white mb-1">{tier.name}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{tier.description}</p>
              </div>

              {/* Price */}
              <div className="border-y border-white/[0.06] py-4">
                <div className="text-xl font-extrabold text-white mb-0.5">
                  {tier.egp} <span className="text-slate-500 font-semibold text-sm">EGP</span>
                </div>
                <div className="text-sm font-bold text-slate-400">
                  {tier.usd} <span className="text-slate-600 font-normal">USD</span>
                </div>
                <div className="mt-2 flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-violet-400 uppercase tracking-wider">⏱ {tier.timeline}</span>
                </div>
              </div>

              {/* Features */}
              <ul className="flex flex-col gap-2.5 flex-1">
                {tier.features.map((f, fi) => (
                  <li key={fi} className="flex items-start gap-2 text-sm text-slate-300">
                    <CheckCircle2 size={14} className="text-emerald-400 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <a
                href="#start-project"
                className={`mt-2 flex items-center justify-center gap-1.5 py-3 rounded-xl text-sm font-bold transition-all ${
                  tier.popular
                    ? "btn-primary"
                    : "bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.07] text-white"
                }`}
              >
                Get Started →
              </a>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-slate-600 mt-8">
          Prices are starting points and vary based on project scope. Not sure which tier fits?{" "}
          <a href="#start-project" className="text-violet-400 hover:underline font-semibold">
            Request a free estimate →
          </a>
        </p>
      </div>
    </section>
  );
}
