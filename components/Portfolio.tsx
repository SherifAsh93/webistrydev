"use client";
import Image from "next/image";
import { useRef, useState } from "react";
import { ExternalLink, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { projects } from "@/lib/data";
import type { Project } from "@/lib/data";
import { useLang } from "@/lib/language-context";
import ProjectInquiryModal from "@/components/ProjectInquiryModal";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 32 }, show: { opacity: 1, y: 0, transition: { duration: 0.55 } } };

const GROUP_IDS = {
  management: ["ahmed-elakad", "zahrtelkhlig", "qoya-furniture", "ameer-dental", "batrawy-clinic", "sunset-management"],
  ecommerce: ["ahmed-elakad", "zahrtelkhlig", "qoya-furniture", "furniture-studio"],
  mobile: ["elghaly-vr"],
} as const;

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
  className = "",
}: {
  project: LocalizedProject;
  liveLabel: string;
  liveSiteLabel: string;
  buildLikeLabel: string;
  onOpen: () => void;
  className?: string;
}) {
  return (
    <motion.div variants={item} className={`group card card-hover rounded-2xl overflow-hidden flex flex-col cursor-pointer ${className}`}>
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

function GroupSection({
  label,
  desc,
  projects,
  liveLabel,
  liveSiteLabel,
  buildLikeLabel,
  onOpen,
}: {
  label: string;
  desc: string;
  projects: LocalizedProject[];
  liveLabel: string;
  liveSiteLabel: string;
  buildLikeLabel: string;
  onOpen: (project: LocalizedProject) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const total = projects.length;

  function slide(dir: 1 | -1) {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.offsetWidth * 0.85, behavior: "smooth" });
  }

  function onScroll() {
    const el = scrollRef.current;
    if (!el) return;
    const cardW = el.scrollWidth / total;
    setActiveIdx(Math.min(Math.round(el.scrollLeft / cardW), total - 1));
  }

  return (
    <div className="mb-12 last:mb-0">
      <div className="mb-5">
        <h3 className="text-xl md:text-2xl font-extrabold uppercase tracking-wide text-slate-900 mb-1">{label}</h3>
        <p className="text-sm text-slate-500">{desc}</p>
      </div>

      {/* Mobile: horizontal scroll */}
      <div className="md:hidden">
        <div className="relative">
          {total > 1 && (
            <>
              <button
                onClick={() => slide(-1)}
                className="absolute left-1 top-[42%] -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/95 border border-violet-100 shadow-md flex items-center justify-center text-violet-600 hover:bg-violet-50 transition"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => slide(1)}
                className="absolute right-1 top-[42%] -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/95 border border-violet-100 shadow-md flex items-center justify-center text-violet-600 hover:bg-violet-50 transition"
              >
                <ChevronRight size={16} />
              </button>
            </>
          )}
          <motion.div
            ref={scrollRef}
            dir="ltr"
            onScroll={onScroll}
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 hide-scrollbar"
          >
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                liveLabel={liveLabel}
                liveSiteLabel={liveSiteLabel}
                buildLikeLabel={buildLikeLabel}
                onOpen={() => onOpen(project)}
                className="snap-start shrink-0 w-[80vw] max-w-xs"
              />
            ))}
          </motion.div>
        </div>

        {total > 1 && (
          <div className="flex gap-1.5 items-center justify-center mt-1">
            {[...Array(total)].map((_, i) => (
              <div key={i} className={`rounded-full transition-all duration-300 ${i === activeIdx ? "w-5 h-1.5 bg-violet-500" : "w-1.5 h-1.5 bg-slate-200"}`} />
            ))}
          </div>
        )}
      </div>

      {/* Desktop: grid */}
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        className="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
      >
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            liveLabel={liveLabel}
            liveSiteLabel={liveSiteLabel}
            buildLikeLabel={buildLikeLabel}
            onOpen={() => onOpen(project)}
          />
        ))}
      </motion.div>
    </div>
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

  const managementProjects = GROUP_IDS.management.map(localize);
  const ecommerceProjects = GROUP_IDS.ecommerce.map(localize);
  const mobileProjects = GROUP_IDS.mobile.map(localize);

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

        {/* Grouped: Management Systems → E-Commerce → Mobile-First Web Solutions */}
        <GroupSection
          label={p.groups.management.label}
          desc={p.groups.management.desc}
          projects={managementProjects}
          liveLabel={p.live}
          liveSiteLabel={p.liveSite}
          buildLikeLabel={p.buildLike}
          onOpen={(project) => openModal(project, project.name)}
        />
        <GroupSection
          label={p.groups.ecommerce.label}
          desc={p.groups.ecommerce.desc}
          projects={ecommerceProjects}
          liveLabel={p.live}
          liveSiteLabel={p.liveSite}
          buildLikeLabel={p.buildLike}
          onOpen={(project) => openModal(project, project.name)}
        />
        <GroupSection
          label={p.groups.mobile.label}
          desc={p.groups.mobile.desc}
          projects={mobileProjects}
          liveLabel={p.live}
          liveSiteLabel={p.liveSite}
          buildLikeLabel={p.buildLike}
          onOpen={(project) => openModal(project, project.name)}
        />

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
