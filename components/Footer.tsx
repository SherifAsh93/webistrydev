const WHATSAPP = "201007526882";
const PHONE = "+20 100 752 6882";
const EMAIL = "sherif.ash93@gmail.com";

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.05] py-16 px-4 md:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
                <span className="text-white font-black">W</span>
              </div>
              <span className="font-extrabold text-white text-lg">Web Corner</span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
              Full-stack web developer building fast, modern digital products for businesses and entrepreneurs worldwide.
            </p>
          </div>

          {/* Links */}
          <div>
            <p className="text-xs font-extrabold uppercase tracking-widest text-slate-600 mb-4">Navigation</p>
            <ul className="flex flex-col gap-2.5">
              {["Portfolio", "Services", "Pricing", "How It Works", "Start a Project"].map((item) => (
                <li key={item}>
                  <a
                    href={`#${item.toLowerCase().replace(/ /g, "-")}`}
                    className="text-sm text-slate-400 hover:text-white transition-colors font-medium"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-xs font-extrabold uppercase tracking-widest text-slate-600 mb-4">Contact</p>
            <ul className="flex flex-col gap-3">
              <li>
                <a
                  href={`https://wa.me/${WHATSAPP}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-slate-400 hover:text-white transition-colors group"
                >
                  <span className="w-8 h-8 rounded-lg bg-[#25D366]/10 border border-[#25D366]/20 flex items-center justify-center text-base shrink-0 group-hover:bg-[#25D366]/20 transition">
                    💬
                  </span>
                  WhatsApp (fastest response)
                </a>
              </li>
              <li>
                <a
                  href={`tel:${PHONE}`}
                  className="flex items-center gap-3 text-sm text-slate-400 hover:text-white transition-colors group"
                >
                  <span className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-base shrink-0 group-hover:bg-cyan-500/20 transition">
                    📞
                  </span>
                  {PHONE}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${EMAIL}`}
                  className="flex items-center gap-3 text-sm text-slate-400 hover:text-white transition-colors group"
                >
                  <span className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-base shrink-0 group-hover:bg-violet-500/20 transition">
                    ✉️
                  </span>
                  {EMAIL}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/[0.05] pt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-600">
            © {new Date().getFullYear()} Web Corner. All rights reserved.
          </p>
          <p className="text-xs text-slate-700">
            Built with Next.js · Tailwind · Deployed on Vercel
          </p>
        </div>
      </div>
    </footer>
  );
}
