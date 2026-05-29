import { CheckCircle2 } from "lucide-react";
import { pricing } from "@/lib/data";

export default function Pricing() {
  return (
    <section id="pricing" className="py-28 px-4 md:px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="section-label justify-center mb-4">Pricing</p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">
            Transparent Pricing,
            <br />
            <span className="text-gradient">No Surprises</span>
          </h2>
          <p className="text-slate-500 text-lg max-w-xl mx-auto">
            All prices start from the ranges below and vary by complexity. Payment is 50% upfront, 50% on delivery.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {pricing.map((tier, i) => (
            <div
              key={i}
              className={`relative card card-hover rounded-2xl p-7 flex flex-col gap-5 ${
                tier.popular ? "border-violet-400 shadow-xl shadow-violet-100" : ""
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-200 whitespace-nowrap">
                    Most Popular
                  </span>
                </div>
              )}

              <div>
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${tier.color} mb-4 shadow-md`}>
                  <span className="text-white font-black">{i + 1}</span>
                </div>
                <h3 className="text-lg font-extrabold text-slate-900 mb-1">{tier.name}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{tier.description}</p>
              </div>

              <div className="border-y border-slate-100 py-4">
                <div className="text-xl font-extrabold text-slate-900 mb-0.5">
                  {tier.egp}{" "}
                  <span className="text-slate-400 font-semibold text-sm">EGP</span>
                </div>
                <div className="text-sm font-bold text-slate-500">
                  {tier.usd}{" "}
                  <span className="text-slate-400 font-normal">USD</span>
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
                  tier.popular
                    ? "btn-primary"
                    : "bg-slate-50 hover:bg-violet-50 border border-slate-200 hover:border-violet-200 text-slate-700 hover:text-violet-700"
                }`}
              >
                Get Started →
              </a>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-slate-400 mt-8">
          Prices are starting points and vary based on scope. Not sure which tier fits?{" "}
          <a href="#start-project" className="text-violet-600 hover:underline font-semibold">
            Request a free estimate →
          </a>
        </p>
      </div>
    </section>
  );
}
