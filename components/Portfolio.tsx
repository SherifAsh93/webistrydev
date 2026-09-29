"use client";
import Image from "next/image";
import { useState } from "react";
import { ExternalLink, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { projects } from "@/lib/data";
import type { Project } from "@/lib/data";
import { useLang } from "@/lib/language-context";
import ProjectInquiryModal from "@/components/ProjectInquiryModal";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 32 }, show: { opacity: 1, y: 0, transition: { duration: 0.55 } } };

const FLAGSHIP_IDS = ["qoya-furniture", "ahmed-elakad"];

type CaseStudy = { problem: string; built: string; outcome: string };
type LocalizedProject = Project & { description: string; caseStudy?: CaseStudy };

type CardProps = {
  project: LocalizedProject;
  liveLabel: string;
  liveSiteLabel: string;
  buildLikeLabel: string;
  onOpen: () => void;
};

function LiveBadge({ label, dark = false }: { label: string; dark?: boolean }) {
  return (
    <div
      className={`flex items-center gap-1.5 backdrop-blur-sm border rounded-full px-2.5 py-1 ${dark ? "bg-white/15 border-white/25" : "bg-white/80 border-slate-200"}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
      <span className={`text-[10px] font-bold tracking-widest uppercase ${dark ? "text-white" : "text-slate-600"}`}>{label}</span>
    </div>
  );
}

function BookButton({ label, dark = false, onClick, big = false }: { label: string; dark?: boolean; onClick: () => void; big?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 sm:flex-none font-bold transition-all text-center rounded-xl ${
        big ? "px-6 py-3.5 text-sm" : "px-4 py-2.5 text-xs"
      } ${
        dark
          ? "text-violet-300 hover:text-white bg-violet-900/50 hover:bg-violet-700 border border-violet-700/50 hover:border-violet-500"
          : "text-violet-700 hover:text-white bg-violet-50 hover:bg-violet-600 border border-violet-200 hover:border-violet-600"
      }`}
    >
      {label}
    </button>
  );
}

function LiveLink({ project, label, big = false }: { project: LocalizedProject; label: string; big?: boolean }) {
  return (
    <a
      href={project.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 font-bold transition rounded-xl border ${
        big ? "px-6 py-3.5 text-sm" : "px-4 py-2.5 text-xs"
      } text-slate-600 hover:text-violet-700 bg-slate-50 hover:bg-violet-50 border-slate-200 hover:border-violet-200`}
    >
      <ExternalLink size={big ? 14 : 12} />
      {label}
    </a>
  );
}

function FeatureChips({ tags, dark = false }: { tags: string[]; dark?: boolean }) {
  if (!tags?.length) return null;
  return (
    <ul className="flex flex-wrap gap-2" aria-label="Features">
      {tags.map((tag) => (
        <li
          key={tag}
          className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
            dark ? "bg-white/10 border-white/20 text-slate-700" : "bg-violet-50 text-violet-700 border-violet-100"
          }`}
        >
          {tag}
        </li>
      ))}
    </ul>
  );
}

function FlagshipCard({ project, caseLabels, badgeLabel, ...rest }: CardProps & { caseLabels: CaseStudy; badgeLabel: string }) {
  const cs = project.caseStudy;
  const rows = cs
    ? [
        { key: "problem", label: caseLabels.problem, text: cs.problem, accent: "text-rose-500" },
        { key: "built", label: caseLabels.built, text: cs.built, accent: "text-violet-600" },
        { key: "outcome", label: caseLabels.outcome, text: cs.outcome, accent: "text-emerald-600" },
      ]
    : [];

  return (
    <motion.article variants={item} className="group card card-hover rounded-3xl overflow-hidden bg-white">
      <div className="relative aspect-[4/3] md:aspect-[2/1] overflow-hidden bg-slate-50">
        <Image
          src={project.screenshot}
          alt={project.name}
          fill
          sizes="(min-width: 1024px) 1152px, 100vw"
          className="object-cover object-top group-hover:scale-[1.03] transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        <div className="absolute top-4 left-4 text-[10px] font-extrabold px-3 py-1.5 rounded-full uppercase tracking-widest text-white bg-gradient-to-r from-violet-600 to-sky-500 shadow-lg">
          {badgeLabel}
        </div>
        <div className="absolute top-4 right-4">
          <LiveBadge label={rest.liveLabel} dark />
        </div>
      </div>

      <div className="p-5 md:p-8">
        <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-2">{project.name}</h3>
        <p className="text-sm md:text-base text-slate-500 leading-relaxed mb-5 max-w-3xl">{project.description}</p>

        {rows.length > 0 && (
          <dl className="grid md:grid-cols-3 gap-3 md:gap-4 mb-5">
            {rows.map((r) => (
              <div key={r.key} className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                <dt className={`text-[10px] font-extrabold uppercase tracking-wider mb-1 ${r.accent}`}>{r.label}</dt>
                <dd className="text-sm text-slate-600 leading-relaxed">{r.text}</dd>
              </div>
            ))}
          </dl>
        )}

        <FeatureChips tags={project.tags} />

        <div className="flex flex-col sm:flex-row gap-2.5 mt-6">
          <LiveLink project={project} label={rest.liveSiteLabel} big />
          <BookButton label={rest.buildLikeLabel} onClick={rest.onOpen} big />
        </div>
      </div>
    </motion.article>
  );
}

function ProjectCard({ project, ...rest }: CardProps) {
  return (
    <motion.article variants={item} className="group card card-hover rounded-2xl overflow-hidden flex flex-col bg-white h-full">
      <div className="relative h-52 md:h-64 overflow-hidden bg-slate-50">
        <Image
          src={project.screenshot}
          alt={project.name}
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-cover object-top group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white/45 via-transparent to-transparent" />
        <div className="absolute top-3 right-3">
          <LiveBadge label={rest.liveLabel} />
        </div>
      </div>

      <div className="p-5 md:p-6 flex flex-col flex-1">
        <h3 className="text-lg font-extrabold text-slate-900 mb-2">{project.name}</h3>
        <p className="text-sm text-slate-500 leading-relaxed mb-4 flex-1">{project.description}</p>
        <FeatureChips tags={project.tags} />
        <div className="flex gap-2 mt-5">
          <LiveLink project={project} label={rest.liveSiteLabel} />
          <BookButton label={rest.buildLikeLabel} onClick={rest.onOpen} />
        </div>
      </div>
    </motion.article>
  );
}

export default function Portfolio() {
  const { t } = useLang();
  const p = t.portfolio;
  const [modalProject, setModalProject] = useState<{ project: Project; displayName: string } | null>(null);

  function openModal(project: Project, displayName: string) {
    setModalProject({ project, displayName });
  }

  const localize = (id: string): LocalizedProject | null => {
    const proj = projects.find((pr) => pr.id === id);
    if (!proj) return null;
    return {
      ...proj,
      description: t.projectDescs[id] || proj.description,
      caseStudy: t.caseStudies?.[id],
    };
  };

  const flagshipProjects = FLAGSHIP_IDS.map(localize).filter(Boolean) as LocalizedProject[];
  const otherProjects = projects
    .map((pr) => pr.id)
    .filter((id) => !FLAGSHIP_IDS.includes(id))
    .map(localize)
    .filter(Boolean) as LocalizedProject[];

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
      <section id="portfolio" className="py-14 px-4 md:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <p className="section-label justify-center mb-4">{p.sectionLabel}</p>
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">
              {p.title1 && (
                <>
                  {p.title1}
                  <br />
                </>
              )}
              <span className="text-gradient">{p.title2}</span>
            </h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">{p.desc}</p>
          </div>

          {/* Flagship showcases — biggest visual space */}
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            className="flex flex-col gap-6 md:gap-8 mb-6 md:mb-8"
          >
            {flagshipProjects.map((project) => (
              <FlagshipCard
                key={project.id}
                project={project}
                caseLabels={p.caseLabels}
                badgeLabel={p.flagshipBadge}
                liveLabel={p.live}
                liveSiteLabel={p.liveSite}
                buildLikeLabel={p.buildLike}
                onOpen={() => openModal(project, project.name)}
              />
            ))}
          </motion.div>

          {/* All remaining projects — one list, no duplicate categories */}
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            className="grid md:grid-cols-2 gap-5 md:gap-6"
          >
            {otherProjects.map((project) => (
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

          {/* Final CTA */}
          <div className="card card-hover rounded-2xl p-10 mt-10 flex flex-col items-center justify-center text-center gap-5 border-dashed border-violet-200 cursor-pointer">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-sky-500 flex items-center justify-center text-2xl text-white shadow-lg shadow-violet-200">✦</div>
            <div>
              <h3 className="text-xl font-extrabold text-slate-900 mb-2">{p.ctaCard.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed max-w-xs mx-auto">{p.ctaCard.desc}</p>
            </div>
            <a href="#start-project" className="btn-primary px-7 py-3 text-sm flex items-center gap-2">
              {p.ctaCard.btn}
              <ArrowRight size={14} />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
