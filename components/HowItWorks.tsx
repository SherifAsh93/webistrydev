const steps = [
  {
    number: "01",
    title: "We Talk",
    description: "Tell me about your vision, goals, and budget. We agree on scope, timeline, and a clear plan.",
    icon: "💬",
    bg: "bg-violet-50",
    border: "border-violet-200",
    text: "text-violet-700",
  },
  {
    number: "02",
    title: "Design & Approve",
    description: "I create a detailed mockup or prototype. You review, give feedback, and approve before any code is written.",
    icon: "🎨",
    bg: "bg-sky-50",
    border: "border-sky-200",
    text: "text-sky-700",
  },
  {
    number: "03",
    title: "Build & Test",
    description: "Full development begins. I build, test on all devices, and keep you updated throughout the process.",
    icon: "⚙️",
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
  },
  {
    number: "04",
    title: "Launch & Support",
    description: "Your site goes live. I handle deployment, monitor for issues, and provide post-launch support.",
    icon: "🚀",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-700",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-28 px-4 md:px-6 bg-[#f7f6ff]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="section-label justify-center mb-4">Process</p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">
            How We Work
            <br />
            <span className="text-gradient">Together</span>
          </h2>
          <p className="text-slate-500 text-lg max-w-xl mx-auto">
            A clear, predictable process — so you always know where your project stands.
          </p>
        </div>

        <div className="relative">
          <div className="hidden md:block absolute top-10 left-[calc(12.5%+20px)] right-[calc(12.5%+20px)] h-px bg-gradient-to-r from-transparent via-violet-200 to-transparent" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center gap-4">
                <div className={`relative w-16 h-16 rounded-2xl ${step.bg} border ${step.border} flex items-center justify-center text-2xl shrink-0 shadow-sm`}>
                  {step.icon}
                  <span className={`absolute -top-2 -right-2 w-5 h-5 rounded-full bg-white border ${step.border} text-[9px] font-black ${step.text} flex items-center justify-center`}>
                    {step.number}
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 text-center">
          <a href="#start-project" className="btn-primary inline-flex items-center gap-2 px-10 py-4 text-base">
            Start the Process →
          </a>
        </div>
      </div>
    </section>
  );
}
