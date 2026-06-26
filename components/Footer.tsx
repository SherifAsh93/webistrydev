"use client";
import Logo from "@/components/Logo";
import { useLang } from "@/lib/language-context";

const PHONE = "+20 100 752 6882";
const WHATSAPP = "201007526882";
const EMAIL = "sherif.hany@proton.me";
const FACEBOOK = "https://www.facebook.com/WebistryDev";

export default function Footer() {
  const { t } = useLang();

  return (
    <footer className="border-t border-violet-100 py-16 px-4 md:px-6 bg-white mb-16 md:mb-0">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <Logo size={30} />
              <div className="flex flex-col -space-y-0.5">
                <span className="font-extrabold text-slate-900 text-base leading-tight tracking-tight">
                  Webistry<span className="text-gradient">dev</span>
                </span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.18em]">Full-Stack Developer</span>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
              {t.footer.desc}
            </p>
          </div>

          <div>
            <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-4">{t.footer.navTitle}</p>
            <ul className="flex flex-col gap-2.5">
              {t.footer.navLinks.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="text-sm text-slate-500 hover:text-violet-700 transition-colors font-medium"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-4">{t.footer.contactTitle}</p>
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
                  {t.footer.whatsapp}
                </a>
              </li>
              <li>
                <a href={`tel:${PHONE}`} className="flex items-center gap-3 text-sm text-slate-500 hover:text-violet-700 transition-colors group">
                  <span className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center text-base shrink-0 group-hover:bg-sky-100 transition">
                    📞
                  </span>
                  <span dir="ltr">{PHONE}</span>
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
              <li>
                <a href={FACEBOOK} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-slate-500 hover:text-violet-700 transition-colors group">
                  <span className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#1877F2" xmlns="http://www.w3.org/2000/svg">
                      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
                    </svg>
                  </span>
                  facebook.com/WebistryDev
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-400">{t.footer.rights}</p>
          <p className="text-xs text-slate-300">{t.footer.built}</p>
        </div>
      </div>
    </footer>
  );
}
