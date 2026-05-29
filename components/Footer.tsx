import Logo from "@/components/Logo";

const PHONE = "+20 100 752 6882";
const WHATSAPP = "201007526882";
const EMAIL = "sherif.ash93@gmail.com";

export default function Footer() {
  return (
    <footer className="border-t border-violet-100 py-16 px-4 md:px-6 bg-white mb-16 md:mb-0">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <Logo size={30} />
              <div className="flex flex-col -space-y-0.5">
                <span className="font-extrabold text-slate-900 text-base leading-tight tracking-tight">
                  Web<span className="text-gradient">Corner</span>
                </span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.18em]">Web Developer</span>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
              Full-stack web developer building fast, modern digital products for businesses and entrepreneurs worldwide.
            </p>
          </div>

          <div>
            <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-4">Navigation</p>
            <ul className="flex flex-col gap-2.5">
              {["Portfolio", "Services", "Pricing", "How It Works", "Start a Project"].map((item) => (
                <li key={item}>
                  <a
                    href={`#${item.toLowerCase().replace(/ /g, "-")}`}
                    className="text-sm text-slate-500 hover:text-violet-700 transition-colors font-medium"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-4">Contact</p>
            <ul className="flex flex-col gap-3">
              <li>
                <a
                  href={`https://wa.me/${WHATSAPP}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-slate-500 hover:text-violet-700 transition-colors group"
                >
                  <span className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-base shrink-0 group-hover:bg-emerald-100 transition">
                    💬
                  </span>
                  WhatsApp (fastest)
                </a>
              </li>
              <li>
                <a href={`tel:${PHONE}`} className="flex items-center gap-3 text-sm text-slate-500 hover:text-violet-700 transition-colors group">
                  <span className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center text-base shrink-0 group-hover:bg-sky-100 transition">
                    📞
                  </span>
                  {PHONE}
                </a>
              </li>
              <li>
                <a href={`mailto:${EMAIL}`} className="flex items-center gap-3 text-sm text-slate-500 hover:text-violet-700 transition-colors group">
                  <span className="w-8 h-8 rounded-lg bg-violet-50 border border-violet-200 flex items-center justify-center text-base shrink-0 group-hover:bg-violet-100 transition">
                    ✉️
                  </span>
                  {EMAIL}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-400">© {new Date().getFullYear()} Web Corner. All rights reserved.</p>
          <p className="text-xs text-slate-300">Built with Next.js · Tailwind · Deployed on Vercel</p>
        </div>
      </div>
    </footer>
  );
}
