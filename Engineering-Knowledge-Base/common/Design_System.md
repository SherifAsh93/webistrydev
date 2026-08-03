# Design System

Visual language, typography, color, spacing, and component aesthetics used across the portfolio.

---

## Tailwind v4 Setup (all projects)

```bash
npm install tailwindcss @tailwindcss/postcss
```

```javascript
// postcss.config.mjs
export default { plugins: { "@tailwindcss/postcss": {} } };
```

```css
/* app/globals.css */
@import "tailwindcss";

@theme {
  /* Define all custom tokens here */
  --color-primary: #7c3aed;
  --font-sans: "Plus Jakarta Sans", system-ui;
}
```

**Critical:** Tailwind v4 uses `@import "tailwindcss"` — NOT `@tailwind base/components/utilities`. Any CSS written OUTSIDE `@layer` will have higher specificity than Tailwind utility classes and will break them. Never add bare CSS resets outside layers.

---

## Typography Systems

### System 1: Luxury Fashion (Ahmed-Elakad, Montelle)
```
Display/Hero: Cinzel or Cormorant Garamond (serif, elegant)
Body: Cormorant Garamond or Montserrat
UI elements: Inter or Montserrat (sans)
```

**Character:** Uppercase tracking, thin weights, minimal text, white space. Target: high-end brides.

### System 2: Modern Web Portfolio (webistrydev)
```
Primary: Plus Jakarta Sans (geometric sans)
Arabic: Cairo
```

**Character:** Clean, geometric, purple gradient accents. Target: tech-savvy clients.

### System 3: Arabic RTL Commerce (zahrtelkhlig)
```
Arabic text: Cairo (designed for Arabic)
Decorative English: Cormorant Garamond
```

**Character:** RTL-first, large body text (line-height 1.75), dusty rose accents. Target: Egyptian women.

### System 4: Technical (elghaly-vr)
```
Geist Sans (Next.js default)
```

**Character:** Minimal UI that gets out of the way of the 3D experience.

---

## Color Palettes

### Luxury Warm (Montelle)
```css
--cream-50:  #fdfaf6;   /* page background */
--cream-100: #faf5ee;   /* section backgrounds */
--cream-200: #f5ece0;   /* input borders */
--cream-300: #eddcc8;   /* subtle accents */
--gold-300:  #e8d5a3;   /* light accent */
--gold-400:  #d4b96a;   /* dividers, borders */
--gold-500:  #c4a35a;   /* primary action */
--gold-600:  #a8873d;   /* hover state */
--gold-700:  #8b6914;   /* dark hover */
--dark-900:  #1c1510;   /* text, buttons */
--dark-800:  #2d2218;   /* button hover */
--dark-700:  #3d3020;   /* secondary text */
```

### Desert Gold (Ahmed-Elakad)
```css
--primary-gold: #b3a384;  /* warm gold/taupe — primary accent */
--bg-light:     #f9f7f4;  /* warm off-white */
--text-gray:    #7d7d7d;  /* muted text */
--text-black:   #1a1a1a;  /* primary text */
--border-light: #eeeeee;  /* borders */
/* Dark backgrounds: #0d0d0d, #1a1a1a */
```

### Violet Tech (webistrydev)
```css
--color-bg:      #f7f6ff;  /* light lavender */
--color-surface: #ffffff;   /* cards */
--color-violet:  #7c3aed;   /* primary brand */
--color-cyan:    #0ea5e9;   /* gradient accent */
--color-text:    #0f172a;   /* slate-900 */
--color-muted:   #64748b;   /* slate-500 */
```

### Gradient Text Pattern
```tsx
<span className="bg-gradient-to-r from-violet-600 to-cyan-500 bg-clip-text text-transparent">
  Your text here
</span>
```

---

## Spacing & Layout

### Container Pattern
```tsx
<div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
  {/* content */}
</div>
```
- `max-w-7xl` = 1280px (standard)
- `max-w-[1440px]` = extra wide for photography sites (Ahmed-Elakad)

### Section Padding
```tsx
<section className="py-12 md:py-16 lg:py-24">
  {/* Mobile: 48px, Tablet: 64px, Desktop: 96px */}
</section>
```

### Responsive Grid Progression
```tsx
{/* Product grid */}
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">

{/* Content with sidebar */}
<div className="flex flex-col lg:flex-row gap-8">

{/* 3-column info section */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
```

---

## Standard Animations

### Entry Animations (CSS)
```css
@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-up { animation: fade-in-up 0.5s ease forwards; }

@keyframes slide-in-right {
  from { transform: translateX(100%); }
  to   { transform: translateX(0); }
}
.animate-slide-in-right { animation: slide-in-right 0.3s ease forwards; }

@keyframes slide-in-left {
  from { transform: translateX(-100%); }
  to   { transform: translateX(0); }
}
.animate-slide-in-left { animation: slide-in-left 0.3s ease forwards; }
```

### Hover Effects (Tailwind)
```tsx
{/* Image zoom */}
<div className="overflow-hidden">
  <img className="transition-transform duration-700 group-hover:scale-105" />
</div>

{/* Button lift */}
<button className="transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 active:scale-95">

{/* Card lift */}
<div className="transition-shadow duration-300 hover:shadow-xl">
```

### Hero Background Pan (luxury sites)
```css
@keyframes subtle-zoom {
  0%   { transform: scale(1); }
  100% { transform: scale(1.05); }
}
.hero-bg { animation: subtle-zoom 20s ease-in-out alternate infinite; }
```

---

## Component Aesthetics

### Cards
```tsx
{/* Standard card */}
<div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">

{/* Luxury card (fashion sites) */}
<div className="bg-cream-50 border border-cream-200 rounded-none p-6">
{/* Note: luxury sites often use square corners (rounded-none) */}

{/* Admin card */}
<div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 md:p-6">
```

### Buttons
```tsx
{/* Primary action */}
<button className="w-full bg-dark-900 text-white py-3 px-6 text-xs tracking-widest uppercase transition-colors hover:bg-dark-800 disabled:opacity-50">

{/* Outline */}
<button className="border border-current py-2 px-4 text-xs tracking-wider uppercase transition-colors hover:bg-current hover:text-white">

{/* Ghost/text */}
<button className="text-sm underline-offset-2 hover:underline text-muted">
```

### Form Inputs
```tsx
{/* Standard input */}
<input className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-gray-400">

{/* Luxury input (fashion sites) */}
<input className="w-full border-0 border-b border-gray-200 pb-2 bg-transparent focus:outline-none focus:border-primary text-sm">
```

---

## Mobile-Specific Patterns

### Safe Area Insets (iPhone)
```css
.pb-safe { padding-bottom: env(safe-area-inset-bottom, 0px); }
```

### Fixed Bottom Navigation
```tsx
<nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t pb-safe md:hidden">
  {/* Nav items */}
</nav>
```

### Touch Target Size
```tsx
{/* Always ≥44px for touchable elements */}
<button className="min-h-[44px] min-w-[44px] flex items-center justify-center">
```

### Custom Scrollbar (desktop only)
```css
/* Only shows custom scrollbar for mouse users — preserves mobile native scrolling */
@media (hover: hover) and (pointer: fine) {
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--color-primary); border-radius: 9999px; }
}
```

---

## Status Colors (Order Workflow)

Use consistently across all order management UIs:

```typescript
const ORDER_STATUS_STYLES = {
  PENDING:    { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', dot: 'bg-yellow-400' },
  CONFIRMED:  { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200',   dot: 'bg-blue-400'   },
  PROCESSING: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-400' },
  SHIPPED:    { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-400' },
  DELIVERED:  { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200',  dot: 'bg-green-400'  },
  CANCELLED:  { bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200',    dot: 'bg-red-400'    },
};
```

---

## Glassmorphism (webistrydev navbar)

```css
.nav-glass {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.5);
}
```

```tsx
<nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
  scrolled ? 'bg-white/80 backdrop-blur-md border-b border-white/50' : 'bg-transparent'
}`}>
```

---

## Fallback States (luxury design philosophy)

Every image, category, and UI state must have an intentional fallback that maintains the brand aesthetic. Never show:
- Broken image icons
- Empty grids
- Unstyled loading states

```tsx
{/* Product image fallback */}
{product.images[0] ? (
  <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
) : (
  <div className="h-full bg-gradient-to-b from-cream-100 to-cream-300 flex items-center justify-center">
    <span className="font-display text-4xl text-cream-400 italic">M</span>
  </div>
)}

{/* Category image fallback */}
{category.image ? (
  <Image src={category.image} alt={category.name} fill className="object-cover" />
) : (
  <div className="h-full bg-gradient-to-br from-gold-300 to-gold-500" />
)}

{/* Banner fallback */}
{banner.image ? (
  <Image src={banner.image} alt={banner.title} fill className="object-cover" />
) : (
  <div className="h-full flex items-center justify-center bg-cream-100">
    <div className="border border-gold-400 p-8 text-center">
      <h2 className="font-serif text-2xl">{banner.title}</h2>
    </div>
  </div>
)}
```
