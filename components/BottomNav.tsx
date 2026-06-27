"use client";
import { LayoutGrid, Layers, Tag, Send } from "lucide-react";
import { useState, useEffect } from "react";
import { useLang } from "@/lib/language-context";

const sections = [
  { id: "",              navHref: "#"           },
  { id: "portfolio",     navHref: "#portfolio"  },
  { id: "services",      navHref: "#portfolio"  },
  { id: "how-it-works",  navHref: "#portfolio"  },
  { id: "pricing",       navHref: "#pricing"    },
  { id: "start-project", navHref: "#contact"    },
];

export default function BottomNav() {
  const [active, setActive] = useState("#");
  const { t } = useLang();

  const navItems = [
    { icon: LayoutGrid, label: t.bottomNav.home,    href: "#"          },
    { icon: Layers,     label: t.bottomNav.work,    href: "#portfolio" },
    { icon: Tag,        label: t.bottomNav.pricing, href: "#pricing"   },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const match = sections.find((s) => s.id === entry.target.id);
            if (match) setActive(match.navHref);
          }
        });
      },
      { threshold: 0.35 }
    );

    sections.forEach(({ id }) => {
      const el = id ? document.getElementById(id) : document.body;
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const isHireActive = active === "#contact";

  return (
    <nav
      className="fixed bottom-4 left-3 right-3 md:hidden z-40 flex items-center gap-2"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {/* Pill nav */}
      <div className="flex-1 flex items-center bg-white/95 backdrop-blur-xl border border-violet-100 shadow-xl shadow-violet-100/40 rounded-2xl px-1 py-1">
        {navItems.map(({ icon: Icon, label, href }) => {
          const isActive = active === href;
          return (
            <a
              key={href}
              href={href}
              onClick={() => setActive(href)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded-xl transition-all duration-200 ${
                isActive ? "bg-violet-50" : "hover:bg-slate-50"
              }`}
            >
              <Icon
                size={18}
                strokeWidth={isActive ? 2.5 : 1.8}
                className={isActive ? "text-violet-700" : "text-slate-400"}
              />
              <span className={`text-[9px] font-bold tracking-wide ${isActive ? "text-violet-700" : "text-slate-400"}`}>
                {label}
              </span>
              <div className={`w-1 h-1 rounded-full transition-all duration-200 ${isActive ? "bg-violet-600" : "bg-transparent"}`} />
            </a>
          );
        })}
      </div>

      {/* CTA pill */}
      <a
        href="#start-project"
        onClick={() => setActive("#contact")}
        className={`flex items-center gap-1.5 px-4 py-3.5 rounded-2xl font-extrabold text-xs transition-all whitespace-nowrap shadow-md ${
          isHireActive
            ? "bg-violet-700 text-white shadow-violet-400/40"
            : "bg-violet-600 text-white shadow-violet-300/40 hover:bg-violet-700"
        }`}
      >
        <Send size={13} />
        {t.nav.hire}
      </a>
    </nav>
  );
}
