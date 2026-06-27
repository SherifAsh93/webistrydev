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
    <footer className="border-t border-violet-100 pt-10 pb-28 md:pb-10 px-4 md:px-6 bg-white">
      <div className="max-w-6xl mx-auto">

        {/* Main row */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8 mb-8">

          {/* Brand */}
          <div className="flex-1 max-w-sm">
            <div className="flex items-center gap-2.5 mb-3">
              <Logo size={30} />
              <div className="flex flex-col -space-y-0.5">
                <span className="font-extrabold text-slate-900 text-base leading-tight tracking-tight">
                  Webistry<span className="text-gradient">dev</span>
                </span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.18em]">Full-Stack Developer</span>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">{t.footer.desc}</p>
          </div>

          {/* Contact icons row */}
          <div className="flex flex-wrap gap-3">
            <a
              href={`https://wa.me/${WHATSAPP}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-100 text-sm text-emerald-700 font-semibold hover:bg-emerald-100 transition group"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              {t.footer.whatsapp}
            </a>

            <a
              href={`tel:${PHONE}`}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-sky-50 border border-sky-100 text-sm text-sky-700 font-semibold hover:bg-sky-100 transition"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.02 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.16 6.16l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
              <span dir="ltr">{PHONE}</span>
            </a>

            <a
              href={`mailto:${EMAIL}`}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-violet-50 border border-violet-100 text-sm text-violet-700 font-semibold hover:bg-violet-100 transition"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              {EMAIL}
            </a>

            <a
              href={FACEBOOK}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-blue-50 border border-blue-100 text-sm text-blue-700 font-semibold hover:bg-blue-100 transition"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/></svg>
              facebook.com/WebistryDev
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-slate-400">{t.footer.rights}</p>
          <p className="text-xs text-slate-300">{t.footer.built}</p>
        </div>

      </div>
    </footer>
  );
}
