"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Send } from "lucide-react";
import { useLang } from "@/lib/language-context";

export default function DesktopFloatingCTA() {
  const { t } = useLang();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hero = document.querySelector("section");
    if (!hero) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { rootMargin: "-64px 0px 0px 0px" }
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.a
          href="#start-project"
          initial={{ opacity: 0, y: 12, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.95 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          style={{ position: "fixed", bottom: "6rem", right: "1.5rem" }}
          className="btn-primary hidden md:flex z-40 items-center gap-2 px-5 py-3.5 text-sm shadow-xl"
        >
          <Send size={15} />
          {t.desktopCta.label}
        </motion.a>
      )}
    </AnimatePresence>
  );
}
