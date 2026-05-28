import { services } from "@/lib/data";

export default function Services() {
  return (
    <section id="services" className="py-28 px-4 md:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="section-label justify-center mb-4">Services</p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            What I Build
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            From landing pages to full-scale applications — every product is engineered for performance, designed for people.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service, i) => (
            <div
              key={i}
              className="glass glass-hover rounded-2xl p-7 flex flex-col gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center text-2xl shrink-0">
                {service.icon}
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white mb-2">{service.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{service.description}</p>
              </div>
              <a
                href="#start-project"
                className="mt-auto text-xs font-bold text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1"
              >
                Get a quote →
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
