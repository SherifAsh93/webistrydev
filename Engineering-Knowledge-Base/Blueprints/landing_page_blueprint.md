# Landing Page Blueprint

Starter layout for public-facing store and portfolio pages.

---

## Store Layout (Ecommerce)

### `app/(store)/layout.tsx`

```typescript
import type { Metadata } from "next";
import { Cairo, Cormorant_Garamond } from "next/font/google";
import "../../globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/store/CartDrawer";
import StoreHydration from "@/components/StoreHydration";

const cairo = Cairo({ subsets: ["arabic", "latin"], variable: "--font-cairo" });
const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-serif" });

export const metadata: Metadata = {
  title: "Store Name",
  description: "Store description",
};

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${cairo.variable} ${cormorant.variable} font-sans antialiased bg-cream-50`}>
        <StoreHydration />
        <Navbar />
        <main>{children}</main>
        <Footer />
        <CartDrawer />
      </body>
    </html>
  );
}
```

---

### `components/layout/Navbar.tsx`

```typescript
"use client";
import { useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/store/cartStore";

export default function Navbar() {
  const router = useRouter();
  const count = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const { items, openCart } = useCart();
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  function handleLogoClick(e: React.MouseEvent) {
    e.preventDefault();
    count.current++;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => { count.current = 0; }, 800);
    if (count.current >= 3) { count.current = 0; router.push("/admin"); return; }
    if (count.current === 1) router.push("/");
  }

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Mobile: menu icon */}
        <div className="w-10 md:hidden" />

        {/* Logo — center on mobile, left on desktop */}
        <button onClick={handleLogoClick} className="text-xl font-serif font-semibold tracking-wide">
          Store Name
        </button>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm">
          <Link href="/products" className="hover:text-primary transition-colors">Products</Link>
          <Link href="/collections" className="hover:text-primary transition-colors">Collections</Link>
          <Link href="/about" className="hover:text-primary transition-colors">About</Link>
        </nav>

        {/* Cart */}
        <button onClick={openCart} className="relative p-2">
          <ShoppingBag size={22} />
          {cartCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-white rounded-full text-[10px] flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
```

---

### Homepage Page (`app/(store)/page.tsx`)

```typescript
import { prisma } from "@/lib/prisma";
import HeroSection from "@/components/store/HeroSection";
import FeaturedProducts from "@/components/store/FeaturedProducts";
import CategoryGrid from "@/components/store/CategoryGrid";

export const revalidate = 60;

export default async function HomePage() {
  const [featuredProducts, categories] = await Promise.all([
    prisma.product.findMany({
      where: { active: true, featured: true },
      orderBy: { sortOrder: "asc" },
      take: 8,
    }),
    prisma.category.findMany({
      where: { active: true, parentId: null },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  return (
    <div>
      <HeroSection />
      <CategoryGrid categories={categories} />
      <FeaturedProducts products={featuredProducts} />
    </div>
  );
}
```

---

### Hero Section

```typescript
// components/store/HeroSection.tsx
export default function HeroSection() {
  return (
    <section className="relative h-[85vh] overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/hero.jpg')" }}
      />
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative h-full flex items-center justify-center text-center text-white px-4">
        <div className="animate-fade-in-up">
          <p className="text-sm tracking-widest uppercase mb-4 opacity-80">New Collection</p>
          <h1 className="text-4xl md:text-6xl font-serif font-medium mb-6 leading-tight">
            Elegance <br />Redefined
          </h1>
          <a
            href="/products"
            className="inline-block border border-white px-8 py-3 text-sm tracking-widest hover:bg-white hover:text-black transition-colors"
          >
            Shop Now
          </a>
        </div>
      </div>
    </section>
  );
}
```

---

## Portfolio Layout (Single-page, RTL bilingual)

### `app/layout.tsx`

```typescript
import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/contexts/LanguageContext";

const font = Plus_Jakarta_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Webistry Dev — Web Development",
  description: "Professional web solutions for Egyptian businesses",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={font.className}>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
```

### Language Context (Bilingual)

```typescript
// contexts/LanguageContext.tsx
"use client";
import { createContext, useContext, useState, ReactNode } from "react";

type Lang = "en" | "ar";
interface LangCtx { lang: Lang; toggle: () => void; t: (en: string, ar: string) => string }
const Ctx = createContext<LangCtx>({ lang: "en", toggle: () => {}, t: (en) => en });

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");
  const toggle = () => setLang(l => l === "en" ? "ar" : "en");
  const t = (en: string, ar: string) => lang === "ar" ? ar : en;
  return (
    <Ctx.Provider value={{ lang, toggle, t }}>
      <div dir={lang === "ar" ? "rtl" : "ltr"}>{children}</div>
    </Ctx.Provider>
  );
}

export const useLang = () => useContext(Ctx);
```

---

## Footer

```typescript
// components/layout/Footer.tsx
export default function Footer() {
  return (
    <footer className="bg-dark-900 text-white py-12 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="font-serif text-xl mb-3">Store Name</h3>
          <p className="text-white/50 text-sm leading-relaxed">
            Tagline or brand description here.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-medium mb-4 tracking-wider">Quick Links</h4>
          <ul className="space-y-2 text-sm text-white/60">
            <li><a href="/products" className="hover:text-white transition-colors">Products</a></li>
            <li><a href="/about" className="hover:text-white transition-colors">About</a></li>
            <li><a href="/contact" className="hover:text-white transition-colors">Contact</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-medium mb-4 tracking-wider">Contact</h4>
          <ul className="space-y-2 text-sm text-white/60">
            <li>Phone: +20 xxx xxx xxxx</li>
            <li>Email: info@example.com</li>
          </ul>
        </div>
      </div>
      <div className="max-w-6xl mx-auto mt-8 pt-8 border-t border-white/10 text-center text-white/30 text-xs">
        © {new Date().getFullYear()} Store Name. All rights reserved.
      </div>
    </footer>
  );
}
```
