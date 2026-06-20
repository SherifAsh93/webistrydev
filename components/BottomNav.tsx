"use client";
import { Home, Briefcase, DollarSign, Rocket } from "lucide-react";
import { useState, useEffect } from "react";
import { useLang } from "@/lib/language-context";

export default function BottomNav() {
  const [active, setActive] = useState("#");
  const { t } = useLang();

  const navItems = [
    { icon: Home,        label: t.bottomNav.home,    href: "#" },
    { icon: Briefcase,   label: t.bottomNav.work,    href: "#portfolio" },
    { icon: DollarSign,  label: t.bottomNav.pricing, href: "#pricing" },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            if (id === "portfolio") setActive("#portfolio");
            else if (id === "pricing") setActive("#pricing");
            else if (id === "start-project") setActive("#start-project");
          }
        });
      },
      { threshold: 0.4 }
    );
    ["portfolio", "pricing", "start-project"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const isHireActive = active === "#start-project";

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 md:hidden z-40 bg-white/95 backdrop-blur-xl border-t border-violet-100 shadow-2xl shadow-violet-100/50"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-center">
        {/* Regular nav tabs */}
        <div className="grid grid-cols-3 flex-1">
          {navItems.map(({ icon: Icon, label, href }) => {
            const isActive = active === href;
            return (
              <a
                key={href}
                href={href}
                onClick={() => setActive(href)}
                className={`flex flex-col items-center justify-center gap-1 py-3 transition-all ${
                  isActive ? "text-violet-700" : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <div className={`p-1 rounded-lg transition-all ${isActive ? "bg-violet-100" : ""}`}>
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 1.8} />
                </div>
                <span className={`text-[10px] font-bold tracking-wide ${isActive ? "text-violet-700" : ""}`}>
                  {label}
                </span>
              </a>
            );
          })}
        </div>

        {/* CTA button */}
        <div className="px-2 py-2 shrink-0">
          <a
            href="#start-project"
            onClick={() => setActive("#start-project")}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl font-extrabold text-xs transition-all whitespace-nowrap ${
              isHireActive
                ? "bg-violet-700 text-white shadow-lg shadow-violet-300"
                : "bg-violet-600 text-white shadow-md shadow-violet-200 hover:bg-violet-700"
            }`}
          >
            <Rocket size={13} />
            {t.nav.hire}
          </a>
        </div>
      </div>
    </nav>
  );
}
