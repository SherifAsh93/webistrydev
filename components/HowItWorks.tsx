const steps = [
  {
    number: "01",
    title: "We Talk",
    description:
      "Tell me about your vision, goals, and budget. We agree on scope, timeline, and a clear plan.",
    icon: "💬",
    color: "from-violet-500/20 to-violet-600/10",
    border: "border-violet-500/20",
  },
  {
    number: "02",
    title: "Design & Approve",
    description:
      "I create a detailed mockup or prototype. You review, give feedback, and approve before any code is written.",
    icon: "🎨",
    color: "from-cyan-500/20 to-cyan-600/10",
    border: "border-cyan-500/20",
  },
  {
    number: "03",
    title: "Build & Test",
    description:
      "Full development begins. I build, test on all devices, and keep you updated throughout the process.",
    icon: "⚙️",
    color: "from-amber-500/20 to-amber-600/10",
    border: "border-amber-500/20",
  },
  {
    number: "04",
    title: "Launch & Support",
    description:
      "Your site goes live. I handle deployment, monitor for issues, and provide post-launch support.",
    icon: "🚀",
    color: "from-emerald-500/20 to-emerald-600/10",
    border: "border-emerald-500/20",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-28 px-4 md:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="section-label justify-center mb-4">Process</p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            How We Work
            <br />
            <span className="text-gradient">Together</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            A clear, predictable process — so you always know where your project stands.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connector line (desktop) */}
          <div className="hidden md:block absolute top-12 left-[calc(12.5%+8px)] right-[calc(12.5%+8px)] h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center gap-5">
                {/* Icon + number */}
                <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} border ${step.border} flex items-center justify-center text-2xl shrink-0`}>
                  {step.icon}
                  <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[#030712] border border-white/10 text-[9px] font-black text-slate-400 flex items-center justify-center">
                    {step.number}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-extrabold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <a
            href="#start-project"
            className="btn-primary inline-flex items-center gap-2 px-10 py-4 text-base"
          >
            Start the Process →
          </a>
        </div>
      </div>
    </section>
  );
}
