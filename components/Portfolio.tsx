"use client";
import Image from "next/image";
import { ExternalLink, Smartphone, ArrowRight, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { projects } from "@/lib/data";
import { useLang } from "@/lib/language-context";

function buildLikeThis(projectId: string, category: string) {
  const params = new URLSearchParams(window.location.search);
  params.set("ref", projectId);
  params.set("type", category);
  window.history.replaceState({}, "", `?${params.toString()}`);
  document.getElementById("start-project")?.scrollIntoView({ behavior: "smooth" });
}

const container = { hidden: {}, show: { transition: { staggerChildren: 0.12 } } };
const item = { hidden: { opacity: 0, y: 32 }, show: { opacity: 1, y: 0, transition: { duration: 0.55 } } };

function CategoryBadge({ label, color }: { label: string; color: string }) {
  return (
    <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-widest text-white bg-gradient-to-r ${color} shadow-md`}>
      {label}
    </span>
  );
}

function TagList({ tags, dark = false }: { tags: string[]; dark?: boolean }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <span
          key={tag}
          className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
            dark
              ? "bg-white/10 border border-white/20 text-white/70"
              : "bg-violet-50 border border-violet-100 text-violet-600"
          }`}
        >
          {tag}
        </span>
      ))}
    </div>
  );
}

function ActionButtons({
  url, projectId, category, dark = false, liveSite, buildLikeLabel,
}: {
  url: string; projectId: string; category: string; dark?: boolean; liveSite: string; buildLikeLabel: string;
}) {
  return (
    <div className="flex gap-2">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition ${
          dark
            ? "text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40"
            : "text-slate-600 hover:text-violet-700 bg-slate-50 hover:bg-violet-50 border border-slate-200 hover:border-violet-200"
        }`}
      >
        <ExternalLink size={12} />
        {liveSite}
      </a>
      <button
        onClick={() => buildLikeThis(projectId, category)}
        className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
          dark
            ? "text-violet-300 hover:text-white bg-violet-900/50 hover:bg-violet-700 border border-violet-700/50 hover:border-violet-500"
            : "text-violet-700 hover:text-white bg-violet-50 hover:bg-violet-600 border border-violet-200 hover:border-violet-600"
        }`}
      >
        {buildLikeLabel}
      </button>
    </div>
  );
}

export default function Portfolio() {
  const { t } = useLang();
  const p = t.portfolio;

  const ahmed     = projects.find((proj) => proj.id === "ahmed-elakad")!;
  const furniture = projects.find((proj) => proj.id === "furniture-studio")!;
  const zahret    = projects.find((proj) => proj.id === "zahrtelkhlig")!;
  const batrawy   = projects.find((proj) => proj.id === "batrawy-clinic")!;
  const ameer     = projects.find((proj) => proj.id === "ameer-dental")!;
  const elghaly   = projects.find((proj) => proj.id === "elghaly-vr")!;

  return (
    <section id="portfolio" className="py-28 px-4 md:px-6 bg-white">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-16">
          <p className="section-label justify-center mb-4">{p.sectionLabel}</p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">
            {p.title1}
            <br />
            <span className="text-gradient">{p.title2}</span>
          </h2>
          <p className="text-slate-500 text-lg max-w-xl mx-auto">{p.desc}</p>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="space-y-5"
        >

          {/* ── 1. Ahmed El Akad — full-width hero ── */}
          <motion.div
            variants={item}
            className="group relative rounded-2xl overflow-hidden card card-hover cursor-pointer"
            style={{ height: "clamp(400px, 52vw, 520px)" }}
          >
            <Image
              src={ahmed.screenshot}
              alt={ahmed.name}
              fill
              sizes="100vw"
              className="object-cover object-top group-hover:scale-105 transition-transform duration-700"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

            <div className="absolute top-5 left-5">
              <CategoryBadge label={ahmed.categoryLabel} color={ahmed.categoryColor} />
            </div>

            <div className="absolute top-5 right-5 flex items-center gap-1.5 bg-white/15 backdrop-blur-sm border border-white/25 rounded-full px-3 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-bold text-white tracking-widest uppercase">{p.live}</span>
            </div>

            <div className="absolute bottom-0 inset-x-0 p-6 md:p-8">
              <div className="max-w-2xl">
                <h3 className="text-2xl md:text-3xl font-extrabold text-white mb-2 leading-tight">{ahmed.name}</h3>
                <p className="text-white/75 text-sm md:text-base leading-relaxed mb-4 max-w-lg">{ahmed.description}</p>
                <div className="flex flex-wrap items-center gap-3">
                  <TagList tags={ahmed.tags} dark />
                  <div className="flex gap-2 mr-auto mt-1 sm:mt-0">
                    <a
                      href={ahmed.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-white/15 hover:bg-white/25 border border-white/30 backdrop-blur-sm transition"
                    >
                      <ExternalLink size={12} />
                      {p.liveSite}
                    </a>
                    <button
                      onClick={() => buildLikeThis(ahmed.id, ahmed.category)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-violet-600/80 hover:bg-violet-600 border border-violet-500/50 backdrop-blur-sm transition cursor-pointer"
                    >
                      {p.buildLike}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── 2. Furniture Studio + Zahrtelkhlig — 2 col ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[furniture, zahret].map((project) => (
              <motion.div
                key={project.id}
                variants={item}
                className="group card card-hover rounded-2xl overflow-hidden flex flex-col cursor-pointer"
              >
                <div className="relative h-64 md:h-72 overflow-hidden bg-slate-50">
                  <Image
                    src={project.screenshot}
                    alt={project.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover object-top group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white/50 via-transparent to-transparent" />
                  <div className="absolute top-4 left-4">
                    <CategoryBadge label={project.categoryLabel} color={project.categoryColor} />
                  </div>
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-full px-2.5 py-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-slate-600 tracking-widest uppercase">{p.live}</span>
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-lg font-extrabold text-slate-900 mb-2">{project.name}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed mb-4 flex-1">{project.description}</p>
                  <TagList tags={project.tags} />
                  <div className="mt-4">
                    <ActionButtons url={project.url} projectId={project.id} category={project.category} liveSite={p.liveSite} buildLikeLabel={p.buildLike} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* ── 3. Business Management concept card ── */}
          <motion.div
            variants={item}
            className="rounded-2xl overflow-hidden card card-hover cursor-pointer"
            style={{ background: "linear-gradient(135deg, #0f172a 0%, #0d2137 60%, #0f2a1e 100%)" }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2">

              <div className="p-8 md:p-10 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center">
                    <Smartphone size={18} className="text-teal-400" />
                  </div>
                  <span className="text-[10px] font-extrabold text-teal-400 tracking-widest uppercase">{p.bizApps.badge}</span>
                </div>

                <h3 className="text-2xl md:text-3xl font-extrabold text-white leading-tight mb-4">
                  {p.bizApps.title1}
                  <br />
                  <span className="text-gradient">{p.bizApps.title2}</span>
                </h3>

                <p className="text-slate-400 text-sm leading-relaxed mb-6">{p.bizApps.desc}</p>

                <ul className="space-y-2 mb-7">
                  {p.bizApps.feats.map((feat) => (
                    <li key={feat} className="flex items-center gap-2 text-sm text-slate-300">
                      <CheckCircle2 size={14} className="text-teal-400 shrink-0" />
                      {feat}
                    </li>
                  ))}
                </ul>

                <div className="flex flex-wrap gap-2 mb-7">
                  {["Next.js", "PostgreSQL", "Mobile-First", "Web App"].map((tag) => (
                    <span key={tag} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-500/15 border border-teal-500/25 text-teal-300 uppercase tracking-wider">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex gap-2">
                  <a href="#start-project" className="btn-primary px-5 py-2.5 text-sm flex items-center gap-1.5">
                    {p.bizApps.cta}
                    <ArrowRight size={14} />
                  </a>
                </div>
              </div>

              <div className="bg-black/30 p-6 md:p-8 flex flex-col justify-center gap-4 border-t border-slate-700/40 md:border-t-0 md:border-r-0">
                <p className="text-[10px] font-extrabold text-slate-500 tracking-widest uppercase mb-1">{p.bizApps.builtFor}</p>
                {[batrawy, ameer].map((project) => (
                  <a
                    key={project.id}
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/proj flex gap-4 items-center bg-white/5 hover:bg-white/10 border border-white/10 hover:border-teal-500/40 rounded-xl p-4 transition-all"
                  >
                    <div className="relative w-20 h-14 rounded-lg overflow-hidden shrink-0 bg-slate-800">
                      <Image
                        src={project.screenshot}
                        alt={project.name}
                        fill
                        sizes="80px"
                        className="object-cover object-top group-hover/proj:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-extrabold text-white mb-0.5">{project.name}</p>
                      <p className="text-xs text-slate-400 leading-snug line-clamp-2">{project.description}</p>
                      <div className="flex items-center gap-1 mt-2 text-teal-400 text-[11px] font-bold">
                        <ExternalLink size={10} />
                        {p.viewLive}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ── 4. Elghaly VR + CTA ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            <motion.div
              variants={item}
              className="group card card-hover rounded-2xl overflow-hidden flex flex-col cursor-pointer"
              style={{ background: "linear-gradient(160deg, #1e1b4b 0%, #0f172a 50%, #0c0a1a 100%)" }}
            >
              <div className="flex-1 flex items-center justify-center py-8 px-4 relative min-h-[300px]">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-48 h-48 bg-violet-600/25 rounded-full blur-3xl" />
                </div>
                <div className="absolute top-4 left-4">
                  <CategoryBadge label="Web App" color={elghaly.categoryColor} />
                </div>
                <div className="relative z-10 w-[138px] h-[275px] rounded-[2.5rem] border-[3px] border-slate-600 bg-black shadow-[0_0_50px_rgba(124,58,237,0.4),0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-14 h-[14px] bg-black rounded-b-xl z-20" />
                  <Image
                    src="/projects/elghaly-vr-mobile.png"
                    alt="Elghaly VR"
                    fill
                    sizes="138px"
                    className="object-cover object-top"
                  />
                </div>
              </div>
              <div className="p-5 flex flex-col border-t border-slate-700/50 bg-black/20">
                <h3 className="text-base font-extrabold text-white mb-1.5">{elghaly.name}</h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-4 line-clamp-3">{elghaly.description}</p>
                <TagList tags={elghaly.tags} dark />
                <div className="mt-4">
                  <ActionButtons url={elghaly.url} projectId={elghaly.id} category={elghaly.category} dark liveSite={p.liveSite} buildLikeLabel={p.buildLike} />
                </div>
              </div>
            </motion.div>

            {/* CTA card */}
            <motion.div
              variants={item}
              className="card card-hover rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-5 border-dashed border-violet-200 cursor-pointer min-h-[300px]"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-sky-500 flex items-center justify-center text-2xl text-white shadow-lg shadow-violet-200">
                ✦
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 mb-2">{p.ctaCard.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed max-w-xs mx-auto">{p.ctaCard.desc}</p>
              </div>
              <a href="#start-project" className="btn-primary px-7 py-3 text-sm flex items-center gap-2">
                {p.ctaCard.btn}
                <ArrowRight size={14} />
              </a>
            </motion.div>

          </div>
        </motion.div>
      </div>
    </section>
  );
}
