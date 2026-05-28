"use client";
import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { projects } from "@/lib/data";

function buildLikeThis(projectId: string, category: string) {
  const params = new URLSearchParams(window.location.search);
  params.set("ref", projectId);
  params.set("type", category);
  window.history.replaceState({}, "", `?${params.toString()}`);
  document.getElementById("start-project")?.scrollIntoView({ behavior: "smooth" });
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function Portfolio() {
  return (
    <section id="portfolio" className="py-28 px-4 md:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="section-label justify-center mb-4">Portfolio</p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            Work That Speaks
            <br />
            <span className="text-gradient">for Itself</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Real projects, real clients, real results — every site is custom-built with modern technology.
          </p>
        </div>

        {/* Bento Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {projects.map((project) => {
            const isFeatured = project.id === "ahmed-elakad" || project.id === "elghaly-vr";
            return (
              <motion.div
                key={project.id}
                variants={item}
                className={`${isFeatured ? "md:col-span-2" : ""} group relative glass glass-hover rounded-2xl overflow-hidden flex flex-col`}
              >
                {/* Screenshot */}
                <div className={`relative ${isFeatured ? "h-72" : "h-52"} overflow-hidden bg-[#0d1524]`}>
                  <Image
                    src={project.screenshot}
                    alt={project.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover object-top group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0d1524] via-transparent to-transparent" />
                  {/* Category badge (overlaid on image) */}
                  <div className="absolute top-3 left-3">
                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-widest text-white bg-gradient-to-r ${project.categoryColor} shadow-lg`}
                    >
                      {project.categoryLabel}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="text-lg font-extrabold text-white mb-1.5">{project.name}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed mb-4 flex-1 line-clamp-3">
                    {project.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.07] text-slate-400 uppercase tracking-wider"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.07] transition"
                    >
                      <ExternalLink size={12} />
                      Live Site
                    </a>
                    <button
                      onClick={() => buildLikeThis(project.id, project.category)}
                      className="flex-1 py-2.5 rounded-xl text-xs font-bold text-violet-300 hover:text-violet-200 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 transition"
                    >
                      Build Like This →
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* CTA Card */}
          <motion.div
            variants={item}
            className="glass glass-hover rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-4 border-dashed border-white/[0.06]"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-600 flex items-center justify-center text-xl shadow-lg shadow-violet-500/30">
              ✦
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white mb-1">Your Project Next?</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Let&apos;s build something great together.
              </p>
            </div>
            <a href="#start-project" className="btn-primary px-6 py-2.5 text-sm flex items-center gap-1.5">
              Start Now →
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
