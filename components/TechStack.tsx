const techs = [
  { name: "Next.js", icon: "⬡" },
  { name: "React", icon: "⚛" },
  { name: "TypeScript", icon: "𝗧𝗦" },
  { name: "Tailwind CSS", icon: "✦" },
  { name: "PostgreSQL", icon: "🐘" },
  { name: "Neon DB", icon: "◈" },
  { name: "Drizzle ORM", icon: "◭" },
  { name: "Vercel", icon: "▲" },
  { name: "Node.js", icon: "⬡" },
  { name: "Cloudinary", icon: "☁" },
  { name: "Framer Motion", icon: "◎" },
  { name: "REST APIs", icon: "⇄" },
];

const doubled = [...techs, ...techs];

export default function TechStack() {
  return (
    <section className="py-12 overflow-hidden border-y border-white/[0.04]">
      <div className="flex">
        <div className="flex gap-10 animate-marquee whitespace-nowrap">
          {doubled.map((tech, i) => (
            <div
              key={i}
              className="flex items-center gap-2.5 text-slate-500 hover:text-slate-300 transition-colors shrink-0"
            >
              <span className="text-base leading-none">{tech.icon}</span>
              <span className="text-sm font-bold tracking-wide">{tech.name}</span>
              <span className="text-slate-700 ml-4">·</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
