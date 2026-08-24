"use client";
import Image from "next/image";
import { useState } from "react";
import { ExternalLink, ArrowRight, CheckCircle2, Smartphone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { projects } from "@/lib/data";
import type { Project } from "@/lib/data";
import { useLang } from "@/lib/language-context";
import ProjectInquiryModal from "@/components/ProjectInquiryModal";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 32 }, show: { opacity: 1, y: 0, transition: { duration: 0.55 } } };

// Highest-value clients first; Sunset Management is shown separately as the flagship.
const MAIN_PROJECT_IDS = ["ahmed-elakad", "qoya-furniture", "zahrtelkhlig", "furniture-studio"] as const;
const FLAGSHIP_ID = "sunset-management";

function CategoryBadge({ label, color }: { label: string; color: string }) {
  return (
    <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-widest text-white bg-gradient-to-r ${color} shadow-md`}>
      {label}
    </span>
  );
}

function LiveBadge({ label, dark = false }: { label: string; dark?: boolean }) {
  return (
    <div className={`flex items-center gap-1.5 backdrop-blur-sm border rounded-full px-2.5 py-1 ${dark ? "bg-white/15 border-white/25" : "bg-white/80 border-slate-200"}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
      <span className={`text-[10px] font-bold tracking-widest uppercase ${dark ? "text-white" : "text-slate-600"}`}>{label}</span>
    </div>
  );
}

function BookButton({ label, dark = false, onClick }: { label: string; dark?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all text-center ${
        dark
          ? "text-violet-300 hover:text-white bg-violet-900/50 hover:bg-violet-700 border border-violet-700/50 hover:border-violet-500"
          : "text-violet-700 hover:text-white bg-violet-50 hover:bg-violet-600 border border-violet-200 hover:border-violet-600"
      }`}
    >
      {label}
    </button>
  );
}

type LocalizedProject = Project & { description: string; categoryLabel: string };

function ProjectCard({
  project,
  liveLabel,
  liveSiteLabel,
  buildLikeLabel,
  onOpen,
}: {
  project: LocalizedProject;
  liveLabel: string;
  liveSiteLabel: string;
  buildLikeLabel: string;
  onOpen: () => void;
}) {
  return (
    <motion.div variants={item} className="group card card-hover rounded-2xl overflow-hidden flex flex-col cursor-pointer">
      <div className="relative h-56 md:h-64 overflow-hidden bg-slate-50">
        <Image src={project.screenshot} alt={project.name} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover object-top group-hover:scale-105 transition-transform duration-700" />
        <div className="absolute inset-0 bg-gradient-to-t from-white/50 via-transparent to-transparent" />
        <div className="absolute top-4 left-4"><CategoryBadge label={project.categoryLabel} color={project.categoryColor} /></div>
        <div className="absolute top-4 right-4"><LiveBadge label={liveLabel} /></div>
      </div>
      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-lg font-extrabold text-slate-900 mb-2">{project.name}</h3>
        <p className="text-sm text-slate-500 leading-relaxed mb-5 flex-1">{project.description}</p>
        <div className="flex gap-2">
          <a href={project.url} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-violet-700 bg-slate-50 hover:bg-violet-50 border border-slate-200 hover:border-violet-200 transition">
            <ExternalLink size={12} />{liveSiteLabel}
          </a>
          <BookButton label={buildLikeLabel} onClick={onOpen} />
        </div>
      </div>
    </motion.div>
  );
}

export default function Portfolio() {
  const { t } = useLang();
  const p = t.portfolio;
  const [modalProject, setModalProject] = useState<{ project: Project; displayName: string } | null>(null);

  function openModal(project: Project, displayName: string) {
    setModalProject({ project, displayName });
  }

  const localize = (id: string): LocalizedProject => {
    const proj = projects.find((pr) => pr.id === id)!;
    return {
      ...proj,
      description: t.projectDescs[id] || proj.description,
      categoryLabel: t.categoryLabels[proj.category] || proj.categoryLabel,
    };
  };

  const flagship = localize(FLAGSHIP_ID);
  const batrawy = localize("batrawy-clinic");
  const ameer = localize("ameer-dental");
  const mainProjects = MAIN_PROJECT_IDS.map(localize);

  return (
    <>
    <AnimatePresence>
      {modalProject && (
        <ProjectInquiryModal
          project={modalProject.project}
          projectDisplayName={modalProject.displayName}
          onClose={() => setModalProject(null)}
        />
      )}
    </AnimatePresence>
    <section id="portfolio" className="py-10 px-4 md:px-6 bg-white">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <p className="section-label justify-center mb-4">{p.sectionLabel}</p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">
            {p.title1 && <>{p.title1}<br /></>}
            <span className="text-gradient">{p.title2}</span>
          </h2>
          <p className="text-slate-500 text-lg max-w-xl mx-auto">{p.desc}</p>
        </div>

        {/* Flagship: latest build, front and center */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55 }}
          className="group relative rounded-2xl overflow-hidden card card-hover cursor-pointer mb-12"
          style={{ height: "clamp(400px, 52vw, 520px)" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- .PNG extension trips Next.js Image optimization */}
          <img src={flagship.screenshot} alt={flagship.name} className="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
          <div className="absolute top-5 left-5 flex gap-2">
            <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-widest text-white bg-gradient-to-r from-emerald-500 to-teal-500 shadow-md">
              {p.flagshipBadge}
            </span>
            <CategoryBadge label={flagship.categoryLabel} color={flagship.categoryColor} />
          </div>
          <div className="absolute top-5 right-5"><LiveBadge label={p.live} dark /></div>
          <div className="absolute bottom-0 inset-x-0 p-6 md:p-8">
            <div className="max-w-2xl">
              <h3 className="text-2xl md:text-3xl font-extrabold text-white mb-2 leading-tight">{flagship.name}</h3>
              <p className="text-white/75 text-sm md:text-base leading-relaxed mb-5 max-w-lg">{flagship.description}</p>
              <div className="flex gap-2">
                <a href={flagship.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-white/15 hover:bg-white/25 border border-white/30 backdrop-blur-sm transition">
                  <ExternalLink size={12} />{p.liveSite}
                </a>
                <button onClick={() => openModal(flagship, flagship.name)} className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-violet-600/80 hover:bg-violet-600 border border-violet-500/50 backdrop-blur-sm transition">
                  {p.buildLike}
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main projects, highest-value clients first */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12"
        >
          {mainProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              liveLabel={p.live}
              liveSiteLabel={p.liveSite}
              buildLikeLabel={p.buildLike}
              onOpen={() => openModal(project, project.name)}
            />
          ))}
        </motion.div>

        {/* Business apps promo */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55 }}
          className="rounded-2xl overflow-hidden card card-hover cursor-pointer mb-12"
          style={{ background: "linear-gradient(135deg, #0f172a 0%, #0d2137 60%, #0f2a1e 100%)" }}
        >
          <div className="grid md:grid-cols-2">
            <div className="p-8 md:p-10 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center">
                  <Smartphone size={18} className="text-teal-400" />
                </div>
                <span className="text-[10px] font-extrabold text-teal-400 tracking-widest uppercase">{p.bizApps.badge}</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-extrabold text-white leading-tight mb-4">
                {p.bizApps.title1}<br /><span className="text-gradient">{p.bizApps.title2}</span>
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">{p.bizApps.desc}</p>
              <ul className="space-y-2 mb-7">
                {p.bizApps.feats.map((feat) => (
                  <li key={feat} className="flex items-center gap-2 text-sm text-slate-300">
                    <CheckCircle2 size={14} className="text-teal-400 shrink-0" />{feat}
                  </li>
                ))}
              </ul>
              <a href="#start-project" className="btn-primary px-5 py-2.5 text-sm flex items-center gap-1.5 w-fit">
                {p.bizApps.cta}<ArrowRight size={14} />
              </a>
            </div>
            <div className="bg-black/30 p-6 md:p-8 flex flex-col justify-center gap-4 md:border-l border-slate-700/40">
              <p className="text-[10px] font-extrabold text-slate-500 tracking-widest uppercase mb-1">{p.bizApps.builtFor}</p>
              {[batrawy, ameer].map((project) => (
                <a key={project.id} href={project.url} target="_blank" rel="noopener noreferrer" className="group/proj flex gap-4 items-center bg-white/5 hover:bg-white/10 border border-white/10 hover:border-teal-500/40 rounded-xl p-4 transition-all">
                  <div className="relative w-20 h-14 rounded-lg overflow-hidden shrink-0 bg-slate-800">
                    <Image src={project.screenshot} alt={project.name} fill sizes="80px" className="object-cover object-top group-hover/proj:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-extrabold text-white mb-0.5">{project.name}</p>
                    <p className="text-xs text-slate-400 leading-snug line-clamp-2">{project.description}</p>
                    <div className="flex items-center gap-1 mt-2 text-teal-400 text-[11px] font-bold"><ExternalLink size={10} />{p.viewLive}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Final CTA */}
        <div className="card card-hover rounded-2xl p-10 flex flex-col items-center justify-center text-center gap-5 border-dashed border-violet-200 cursor-pointer">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-sky-500 flex items-center justify-center text-2xl text-white shadow-lg shadow-violet-200">✦</div>
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 mb-2">{p.ctaCard.title}</h3>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xs mx-auto">{p.ctaCard.desc}</p>
          </div>
          <a href="#start-project" className="btn-primary px-7 py-3 text-sm flex items-center gap-2">
            {p.ctaCard.btn}<ArrowRight size={14} />
          </a>
        </div>
      </div>
    </section>
    </>
  );
}
