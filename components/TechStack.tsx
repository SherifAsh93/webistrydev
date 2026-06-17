const techs = [
  { name: "Next.js", icon: "⬡" },
  { name: "React", icon: "⚛" },
  { name: "TypeScript", icon: "TS" },
  { name: "Tailwind CSS", icon: "✦" },
  { name: "PostgreSQL", icon: "🐘" },
  { name: "Neon DB", icon: "◈" },
  { name: "Drizzle ORM", icon: "◭" },
  { name: "Cloud Hosting", icon: "▲" },
  { name: "Node.js", icon: "⬡" },
  { name: "Cloudinary", icon: "☁" },
  { name: "Framer Motion", icon: "◎" },
  { name: "REST APIs", icon: "⇄" },
];

const doubled = [...techs, ...techs];

export default function TechStack() {
  return (
    <section className="py-10 overflow-hidden border-y border-violet-100 bg-white">
      <div className="flex">
        <div className="flex gap-10 animate-marquee whitespace-nowrap">
          {doubled.map((tech, i) => (
            <div
              key={i}
              className="flex items-center gap-2 text-slate-400 hover:text-violet-600 transition-colors shrink-0"
            >
              <span className="text-sm font-bold leading-none text-slate-300">{tech.icon}</span>
              <span className="text-sm font-bold tracking-wide">{tech.name}</span>
              <span className="text-slate-200 ml-3">·</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
