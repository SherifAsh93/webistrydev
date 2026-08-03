# Frontend Patterns

Recurring UI patterns extracted from 5 production projects. Use these as templates — not starting points for reinvention.

---

## Design System Tokens

All projects use Tailwind v4 with custom design tokens declared in `globals.css` inside `@theme {}` blocks. Each project has its own palette; these are the token *patterns*:

### Token Declaration Pattern (globals.css)
```css
@import "tailwindcss";

@theme {
  /* Brand colors */
  --color-primary: #7c3aed;        /* Main brand color */
  --color-primary-hover: #6d28d9;  /* Hover state */
  --color-accent: #0ea5e9;         /* Secondary accent */

  /* Backgrounds */
  --color-bg: #f7f6ff;             /* Page background */
  --color-surface: #ffffff;         /* Cards, panels */

  /* Text */
  --color-text: #0f172a;           /* Primary text */
  --color-muted: #64748b;          /* Secondary text */

  /* Typography */
  --font-sans: "Plus Jakarta Sans", system-ui;
  --font-serif: "Cormorant Garamond", Georgia, serif;
  --font-display: "Cinzel", serif;
}
```

### Project Palettes Summary

| Project | Background | Primary | Accent | Fonts |
|---------|-----------|---------|--------|-------|
| Ahmed-Elakad | `#f9f7f4` (warm cream) | `#b3a384` (gold) | `#1a1a1a` | Cinzel (display), Cormorant (serif), Inter |
| Montelle | `#fdfaf6` (ivory) | `#c4a35a` (gold-500) | `#1c1510` (dark) | Cormorant Garamond, Montserrat |
| zahrtelkhlig | Dusty rose spectrum | Rose/pink | Dark 900 | Cairo (Arabic), Cormorant (decorative) |
| webistrydev | `#f7f6ff` (lavender) | `#7c3aed` (violet) | `#0ea5e9` (cyan) | Plus Jakarta Sans, Cairo (AR) |
| elghaly-vr | Dark (3D canvas) | — | — | Geist Sans (Next.js default) |

---

## Typography System

### Font Loading Pattern (Next.js Google Fonts)
```typescript
// app/layout.tsx
import { Cormorant_Garamond, Montserrat } from "next/font/google";

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

// Apply in root layout
<html className={`${cormorant.variable} ${montserrat.variable}`}>
```

### Arabic Font (RTL projects)
```typescript
// Load Cairo only when lang=ar (webistrydev pattern)
const cairo = Cairo({ subsets: ['arabic'], variable: '--font-arabic', display: 'swap' });

// Conditional font apply
<html lang={lang} dir={dir} className={lang === 'ar' ? cairo.className : ''}>
```

---

## Responsive Grid Patterns

### Product Grid (ecommerce standard)
```tsx
<div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
  {products.map(p => <ProductCard key={p.id} product={p} />)}
</div>
```

### Content Sections (2-column text + image)
```tsx
<section className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
  <div className="w-full md:w-1/2">  {/* Text */}  </div>
  <div className="w-full md:w-1/2">  {/* Image */}  </div>
</section>
```

### Bento Grid (portfolio showcase)
```tsx
{/* Desktop: bento grid, Mobile: horizontal snap carousel */}
<div className="hidden md:grid grid-cols-12 gap-5">
  <div className="col-span-8">...</div>
  <div className="col-span-4">...</div>
  <div className="col-span-4">...</div>
  <div className="col-span-4">...</div>
  <div className="col-span-4">...</div>
</div>
<div className="md:hidden flex gap-3 overflow-x-auto snap-x snap-mandatory pb-4">
  {items.map(i => <div className="snap-start shrink-0 w-[82vw]">...</div>)}
</div>
```

---

## Navigation Patterns

### Desktop Navbar (3-column layout — Montelle)
```tsx
<nav className="sticky top-0 z-50 bg-white border-b">
  <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 grid grid-cols-3 items-center">
    {/* Left: navigation links */}
    <div className="hidden md:flex gap-6">...</div>
    {/* Center: logo */}
    <div className="flex justify-center">
      <LogoLink onTripleClick={() => router.push('/admin')} />
    </div>
    {/* Right: search, cart, user */}
    <div className="flex items-center justify-end gap-4">...</div>
  </div>
</nav>
```

### Glassmorphism Navbar (webistrydev)
```tsx
// Class changes on scroll
const [scrolled, setScrolled] = useState(false);
useEffect(() => {
  const onScroll = () => setScrolled(window.scrollY > 20);
  window.addEventListener('scroll', onScroll);
  return () => window.removeEventListener('scroll', onScroll);
}, []);

<nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
  scrolled ? 'bg-white/80 backdrop-blur-md shadow-sm' : 'bg-transparent'
}`}>
```

### Triple-Click Admin Access (all admin projects)
```tsx
// Navbar.tsx — secret admin navigation
const clickCount = useRef(0);
const clickTimer = useRef<NodeJS.Timeout>();

function handleLogoClick() {
  clickCount.current++;
  clearTimeout(clickTimer.current);
  clickTimer.current = setTimeout(() => { clickCount.current = 0; }, 800);
  
  if (clickCount.current === 3) {
    clickCount.current = 0;
    router.push('/admin');
  }
}
```

### Mobile Bottom Nav (persistent mobile UI)
```tsx
// components/layout/MobileBottomNav.tsx — md:hidden
<nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t md:hidden pb-safe">
  <div className="flex items-center justify-around h-14">
    {navItems.map(item => (
      <Link key={item.href} href={item.href}
        className={`flex flex-col items-center gap-1 ${isActive(item.href) ? 'text-primary' : 'text-muted'}`}>
        <item.icon size={20} />
        <span className="text-[10px]">{item.label}</span>
      </Link>
    ))}
  </div>
</nav>
```

---

## Cart Drawer Pattern (Slide-in Right)

```tsx
// components/store/CartDrawer.tsx
"use client";
import { useCart } from "@/store/cart";

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, total } = useCart();
  
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/40" onClick={closeCart} />
      )}
      
      {/* Drawer */}
      <div className={`fixed top-0 right-0 h-full w-full sm:w-96 z-50 bg-white shadow-2xl
        transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2>Your Bag ({items.length})</h2>
          <button onClick={closeCart}><X /></button>
        </div>
        
        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.map(item => (
            <div key={item.id} className="flex gap-3">
              <Image src={item.image} alt={item.name} width={64} height={80} />
              <div className="flex-1">
                <p>{item.name}</p>
                <p>{formatPrice(item.price)}</p>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                </div>
              </div>
              <button onClick={() => removeItem(item.id)}><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t">
          <div className="flex justify-between mb-2">
            <span>Subtotal</span>
            <span>{formatPrice(total())}</span>
          </div>
          <Link href="/checkout" className="btn-primary w-full text-center">
            Checkout
          </Link>
        </div>
      </div>
    </>
  );
}
```

---

## Product Card Pattern

```tsx
// components/store/ProductCard.tsx
interface Props { product: Product; }

export default function ProductCard({ product }: Props) {
  const { addItem } = useCart();
  const [adding, setAdding] = useState(false);
  
  return (
    <div className="group relative">
      {/* Image container — fixed aspect ratio */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-cream-100">
        {product.images[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          // Fallback — never show broken state
          <div className="h-full w-full flex items-center justify-center bg-gradient-to-b from-cream-100 to-cream-200">
            <span className="text-4xl font-serif text-cream-400 italic">M</span>
          </div>
        )}
        
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
          <button
            onClick={async () => { setAdding(true); addItem(product); setAdding(false); }}
            className="w-full bg-white text-dark-900 py-2 text-xs tracking-widest uppercase"
          >
            {adding ? 'Added' : 'Add to Bag'}
          </button>
        </div>
        
        {/* Badges */}
        {product.featured && (
          <span className="absolute top-2 left-2 bg-gold-500 text-white text-[10px] px-2 py-1 uppercase tracking-widest">
            Featured
          </span>
        )}
      </div>
      
      {/* Info */}
      <div className="mt-2 space-y-1">
        <Link href={`/products/${product.id}`} className="text-sm font-medium hover:underline">
          {product.name}
        </Link>
        <p className="text-sm text-muted">{formatPrice(product.price)}</p>
      </div>
    </div>
  );
}
```

---

## Announcement Bar (Marquee)

```tsx
// components/layout/AnnouncementBar.tsx
export default function AnnouncementBar() {
  const messages = [
    "Free shipping on orders over 800 EGP",
    "Handcrafted with love in Egypt",
    "New arrivals every week",
    "WhatsApp us for custom orders",
    "Secure checkout guaranteed",
  ];
  
  return (
    <div className="bg-dark-900 text-white text-[11px] tracking-widest py-2 overflow-hidden">
      {/* Double the content for seamless loop */}
      <div className="flex animate-marquee whitespace-nowrap will-change-transform">
        {[...messages, ...messages].map((msg, i) => (
          <span key={i} className="mx-8">{msg}</span>
        ))}
      </div>
    </div>
  );
}
```

```css
/* globals.css */
@keyframes marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
.animate-marquee { animation: marquee 20s linear infinite; }
```

---

## Loading & Fallback States

### Button Loading State
```tsx
<button disabled={loading} className="btn-primary relative">
  {loading ? (
    <span className="flex items-center gap-2">
      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">...</svg>
      Processing...
    </span>
  ) : 'Place Order'}
</button>
```

### Image Fallback (luxury projects)
```tsx
// Never show broken image — always have intentional fallback
{product.images[0] ? (
  <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
) : (
  <div className="h-full bg-gradient-to-b from-cream-100 to-cream-300 flex items-center justify-center">
    <span className="text-6xl font-serif text-cream-400 italic">M</span>
  </div>
)}
```

### Skeleton Loading
```tsx
// Use Tailwind pulse for loading states
<div className="animate-pulse">
  <div className="aspect-[3/4] bg-gray-200 rounded-lg" />
  <div className="mt-2 h-4 bg-gray-200 rounded w-3/4" />
  <div className="mt-1 h-4 bg-gray-200 rounded w-1/2" />
</div>
```

---

## Framer Motion Patterns (webistrydev)

### Staggered Entrance (whileInView)
```tsx
const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } }
};
const itemVariants = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

<motion.div
  variants={containerVariants}
  initial="hidden"
  whileInView="show"
  viewport={{ once: true, margin: "-80px" }}
>
  {items.map(item => (
    <motion.div key={item.id} variants={itemVariants}>
      {/* content */}
    </motion.div>
  ))}
</motion.div>
```

### Text Swap with Blur Fade
```tsx
<AnimatePresence mode="wait">
  <motion.span
    key={currentWord}
    initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
    exit={{ opacity: 0, y: -20, filter: "blur(8px)" }}
    transition={{ duration: 0.45 }}
  >
    {currentWord}
  </motion.span>
</AnimatePresence>
```

---

## RTL Support Pattern (Arabic)

### Root Setup
```tsx
// app/layout.tsx — always set dir on <html>
<html lang="ar" dir="rtl">
```

### Preventing RTL Flash (webistrydev inline script)
```tsx
// app/layout.tsx — runs before React, before any paint
<head>
  <script dangerouslySetInnerHTML={{ __html: `
    (function() {
      var lang = localStorage.getItem('lang');
      if (!lang) {
        var browserLang = navigator.languages?.[0] || navigator.language || '';
        lang = browserLang.startsWith('ar') ? 'ar' : 'en';
      }
      document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
      document.documentElement.setAttribute('lang', lang);
    })();
  `}} />
</head>
```

### RTL-Aware CSS
```css
/* globals.css */
[dir="rtl"] body { font-family: var(--font-arabic), system-ui; line-height: 1.75; }
[dir="rtl"] .text-clamp { padding-bottom: 2px; }  /* prevent Arabic descender clipping */
```

### Phone Inputs Stay LTR
```tsx
// Phone numbers must always be LTR even in RTL pages
<input type="tel" dir="ltr" placeholder="01XXXXXXXXX" className="w-full" />
```

---

## Admin Dashboard Pattern

### Login Gate (in layout.tsx)
```tsx
// app/admin/layout.tsx
import { getAdminSession } from "@/lib/session";
import AdminLoginView from "@/components/admin/AdminLoginView";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  if (!session) return <AdminLoginView />;
  return <>{children}</>;
}
```

### Admin Sidebar Navigation
```tsx
const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/admin/categories', label: 'Categories', icon: Tag },
];
// Highlight active: pathname === item.href || pathname.startsWith(item.href + '/')
```

### Status Badge Colors
```typescript
const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  PROCESSING: 'bg-purple-100 text-purple-800',
  SHIPPED: 'bg-orange-100 text-orange-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};
```

---

## PWA Setup (mr-mohammed, olympia-club, webistrydev)

Three files make a site installable as a Progressive Web App.

### `public/manifest.json`
```json
{
  "name": "App Name",
  "short_name": "App",
  "description": "App description",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#1c1510",
  "orientation": "portrait",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

### Root layout metadata
```typescript
// app/layout.tsx
export const metadata: Metadata = {
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "App Name",
  },
  formatDetection: { telephone: false },
};

export const viewport = {
  themeColor: "#1c1510",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};
```

### Apple icon (generated at build time)
```typescript
// app/apple-icon.tsx
import { ImageResponse } from "next/og";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";
export default function AppleIcon() {
  return new ImageResponse(
    <div style={{ background: "#1c1510", width: "100%", height: "100%",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 80, color: "white" }}>M</div>,
    { ...size }
  );
}
```

---

## Bilingual Language Context (AR/EN)

Full implementation for projects that toggle between Arabic RTL and English LTR.

### `lib/language-context.tsx`
```typescript
"use client";
import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

type Lang = "ar" | "en";

interface LangContextValue {
  lang: Lang;
  dir: "rtl" | "ltr";
  setLang: (l: Lang) => void;
  t: (ar: string, en: string) => string;
}

const LangContext = createContext<LangContextValue>({
  lang: "ar", dir: "rtl", setLang: () => {}, t: (ar) => ar,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ar");

  useEffect(() => {
    const stored = localStorage.getItem("lang") as Lang | null;
    if (stored === "ar" || stored === "en") {
      setLangState(stored);
    } else {
      const browser = navigator.languages?.[0] ?? navigator.language ?? "";
      setLangState(browser.startsWith("ar") ? "ar" : "en");
    }
  }, []);

  function setLang(l: Lang) {
    setLangState(l);
    localStorage.setItem("lang", l);
    document.documentElement.setAttribute("lang", l);
    document.documentElement.setAttribute("dir", l === "ar" ? "rtl" : "ltr");
  }

  return (
    <LangContext.Provider value={{
      lang, dir: lang === "ar" ? "rtl" : "ltr", setLang,
      t: (ar, en) => lang === "ar" ? ar : en,
    }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);
```

### Root layout — prevent direction flash before hydration
```typescript
// app/layout.tsx — inline script runs before React, before any paint
<html>
  <head>
    <script dangerouslySetInnerHTML={{ __html: `
      (function(){
        var l=localStorage.getItem('lang');
        if(!l){var b=navigator.languages?.[0]||navigator.language||'';l=b.startsWith('ar')?'ar':'en';}
        document.documentElement.setAttribute('dir',l==='ar'?'rtl':'ltr');
        document.documentElement.setAttribute('lang',l);
      })();
    `}} />
  </head>
  <body><LanguageProvider>{children}</LanguageProvider></body>
</html>
```

### Component usage
```typescript
const { lang, t, setLang } = useLang();

<h1>{t("مرحباً بك", "Welcome")}</h1>
<button onClick={() => setLang(lang === "ar" ? "en" : "ar")}>
  {lang === "ar" ? "EN" : "ع"}
</button>
```

### Translations file for large string sets
```typescript
// lib/translations.ts
const T = {
  home:  { ar: "الرئيسية", en: "Home" },
  about: { ar: "عنا",      en: "About" },
} as const;

export function tr(key: keyof typeof T, lang: "ar" | "en"): string {
  return T[key]?.[lang] ?? key;
}
```

---

## Error and Not-Found Pages

Every project must define these — without them Next.js shows its own generic UI.

### `app/not-found.tsx`
```typescript
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
      <h1 className="text-6xl font-bold text-gray-200">404</h1>
      <p className="text-lg text-gray-600">الصفحة غير موجودة</p>
      <Link href="/" className="text-sm underline">العودة للرئيسية</Link>
    </div>
  );
}
```

### `app/error.tsx`
```typescript
"use client";
import { useEffect } from "react";

export default function ErrorPage({ error, reset }: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => { console.error(error); }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
      <h2 className="text-xl font-semibold">حدث خطأ ما</h2>
      <button onClick={reset} className="text-sm underline">حاول مجدداً</button>
    </div>
  );
}
```

### `app/global-error.tsx`
```typescript
// Catches errors thrown inside the root layout itself
"use client";
export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html><body>
      <div style={{ textAlign: "center", padding: "4rem" }}>
        <h2>Something went wrong</h2>
        <button onClick={reset}>Try again</button>
      </div>
    </body></html>
  );
}
```
