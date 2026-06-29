# 05 — UI Patterns

## Design System Tokens (`@theme` in `globals.css`)

All design tokens are defined in the `@theme` block at the top of `app/globals.css`. Tailwind v4 reads these directly as CSS custom properties.

```css
@theme {
  --color-bg: #f7f6ff;           /* Light lavender — page background */
  --color-surface: #ffffff;       /* Pure white — card backgrounds */
  --color-violet: #7c3aed;        /* Primary brand color */
  --color-violet-light: #ede9f8;  /* Violet tint for borders */
  --color-cyan: #0ea5e9;          /* Gradient accent (sky blue) */
  --color-amber: #f59e0b;         /* Gold accent — used in hero "bтаgets" word */
  --color-text: #0f172a;          /* Slate-900 — primary text */
  --color-muted: #64748b;         /* Slate-500 — secondary text */
  --font-sans: "Plus Jakarta Sans", system-ui, sans-serif;
}
```

Use these via Tailwind utilities: `bg-bg`, `bg-surface`, `text-violet`, `text-cyan`, `text-muted`, `font-sans`.

---

## Utility Class Library

All custom utility classes are defined in `@layer utilities` in `globals.css`.

### `.card`

White card with subtle violet shadow and border:

```css
.card {
  background: #ffffff;
  border: 1px solid #ede9f8;
  box-shadow: 0 2px 16px rgba(124, 58, 237, 0.05), 0 1px 3px rgba(0, 0, 0, 0.04);
}
```

Used on: every card in Portfolio, Services, Pricing, StartProject, Admin dashboard.

### `.card-hover`

Adds lift-and-glow hover effect on top of `.card`:

```css
.card-hover {
  transition: border-color 0.3s, box-shadow 0.3s, transform 0.3s;
}
.card-hover:hover {
  border-color: rgba(124, 58, 237, 0.3);
  box-shadow: 0 12px 40px rgba(124, 58, 237, 0.12), 0 2px 8px rgba(0, 0, 0, 0.06);
  transform: translateY(-3px);
}
```

Always combine with `.card`: `className="card card-hover rounded-2xl"`.

### `.nav-glass`

Frosted glass style for the navbar after scrolling:

```css
.nav-glass {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(124, 58, 237, 0.1);
  box-shadow: 0 4px 24px rgba(124, 58, 237, 0.08);
}
```

Applied by `Navbar.tsx` only when `scrolled === true` (triggered at `window.scrollY > 40`).

### `.field`

Input/textarea style:

```css
.field {
  background: #f8f6ff;
  border: 1px solid #e4deff;
  color: #0f172a;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.field:focus {
  outline: none;
  border-color: #7c3aed;
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
}
.field::placeholder { color: #94a3b8; }
```

Used on all `<input>` and `<textarea>` elements in `StartProject.tsx`, `ChatPage.tsx`, and `admin/page.tsx`.

### `.btn-primary`

Primary action button:

```css
.btn-primary {
  background: linear-gradient(135deg, #7c3aed, #6d28d9);
  color: white;
  font-weight: 700;
  border-radius: 14px;
  transition: all 0.25s;
  position: relative;
  overflow: hidden;
}
.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(124, 58, 237, 0.35);
}
.btn-primary:active { transform: translateY(0); }
```

Used on submit buttons, CTA links, and the Send button in chat. Add `disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0` when the button can be disabled.

### `.section-label`

Section header decorative label with lines on either side:

```css
.section-label {
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: #7c3aed;
  display: flex;
  align-items: center;
  gap: 8px;
}
.section-label::before, .section-label::after {
  content: "";
  flex: 0 0 20px;
  height: 1px;
  background: linear-gradient(90deg, transparent, #7c3aed);
}
.section-label::after {
  background: linear-gradient(90deg, #7c3aed, transparent);
}
```

Usage: `<p className="section-label justify-center mb-4">{t.section.label}</p>`

### `.text-gradient`

Violet-to-cyan gradient text:

```css
.text-gradient {
  background: linear-gradient(135deg, #7c3aed 0%, #0ea5e9 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

Used on: "dev" in the logo/brand name, hero rotating words, section headings.

### `.text-gradient-gold`

Amber gradient variant for the hero's "winner" word (`titlePost`):

```css
.text-gradient-gold {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

---

## Animation Utility Classes

All defined in `globals.css`, each wrapping a `@keyframes` definition.

| Class | Keyframe | Duration | Usage |
|-------|----------|----------|-------|
| `.animate-aurora` | `aurora` | 10s ease-in-out infinite | Hero background blob 1 |
| `.animate-aurora-alt` | `aurora-alt` | 14s ease-in-out infinite | Hero background blob 2 |
| `.animate-marquee` | `marquee` | 40s linear infinite | TechStack scrolling strip |
| `.animate-float-up` | `float-up` | 0.7s ease-out both | One-shot entrance |
| `.animate-fade-in` | `fade-in` | 0.6s ease-out both | One-shot fade |
| `.animate-pulse-dot` | `pulse-dot` | 2s ease-in-out infinite | Green availability dot in Hero badge |
| `.animate-spin-slow` | `spin-slow` | 20s linear infinite | Decorative elements |
| `.animate-wave-bar` | `wave-bar` | 0.5s ease-in-out infinite alternate | Audio waveform bars in StartProject |
| `.animate-mic-pulse` | `mic-pulse` | 2s ease-out infinite | Mic button ring pulse |
| `.animate-bounce-left` | `bounce-x-left` | 1.2s ease-in-out infinite | Carousel scroll hint arrows |
| `.animate-bounce-right` | `bounce-x-right` | 1.2s ease-in-out infinite | Carousel scroll hint arrows |

---

## Framer Motion Animation Patterns

### Pattern 1: Blur-Fade for Rotating Words

```typescript
// Hero.tsx
<AnimatePresence mode="wait">
  <motion.span
    key={wordIdx}
    initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
    animate={{ opacity: 1, y: 0,  filter: "blur(0px)" }}
    exit={{    opacity: 0, y: -20, filter: "blur(8px)" }}
    transition={{ duration: 0.45 }}
    className="text-gradient inline-block"
  >
    {words[wordIdx]}
  </motion.span>
</AnimatePresence>
```

Word rotates every 2800ms via `setInterval`. The `key` prop change triggers AnimatePresence to animate out the old word and in the new one.

### Pattern 2: Section Entrance with Stagger

```typescript
const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } }
};

const item = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

<motion.div
  variants={container}
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, margin: "-80px" }}
>
  {items.map((i) => (
    <motion.div key={i.id} variants={item}>...</motion.div>
  ))}
</motion.div>
```

### Pattern 3: State Machine Transitions (StartProject)

`recordState` cycles through `"idle" | "requesting" | "recording" | "recorded"`. Each state renders a different UI block. `AnimatePresence mode="wait"` ensures smooth transitions between states.

```typescript
<AnimatePresence mode="wait">
  {recordState === "idle" && <motion.div key="idle" ...>...</motion.div>}
  {recordState === "requesting" && <motion.div key="requesting" ...>...</motion.div>}
  {recordState === "recording" && <motion.div key="recording" ...>...</motion.div>}
  {recordState === "recorded" && <motion.div key="recorded" ...>...</motion.div>}
</AnimatePresence>
```

---

## Responsive Layout Patterns

### Portfolio: Bento Grid (Desktop) + Snap Carousel (Mobile)

On desktop (`md:` breakpoint), Portfolio uses a CSS grid with varying span sizes to create a bento layout. On mobile, the same items are arranged in a horizontally scrollable snap carousel:

```css
/* Mobile: horizontal snap scroll */
.hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
.hide-scrollbar::-webkit-scrollbar { display: none; }
```

Used with `overflow-x-auto hide-scrollbar scroll-snap-type-x-mandatory` and `scroll-snap-align-start` on each item.

### Bottom Navigation (Mobile Only)

`BottomNav.tsx` is visible only on mobile (hidden at `md:` breakpoint). It shows icons for the main sections and detects the active section by querying `document.getElementById(id).getBoundingClientRect()` on `scroll` events.

### Font Switching for RTL

```css
/* globals.css */
[dir="rtl"] { font-family: var(--font-cairo), sans-serif; }
```

When `document.documentElement.dir` is set to `"rtl"`, the entire page switches to the Cairo font automatically. No JavaScript font-loading is needed beyond the Next.js `next/font` setup in `layout.tsx`.

---

## RTL Implementation

### The Flash Problem

Without intervention, Arabic users see a flash of LTR layout during hydration because the server renders `<html lang="en" dir="ltr">` (the SSR default).

### The Solution: Blocking Inline Script

`app/layout.tsx` injects a blocking script in `<head>` that runs synchronously before React paints:

```typescript
const langDetectScript = `
(function(){try{
  var saved=localStorage.getItem('lang');
  if(!saved){
    var ls=navigator.languages&&navigator.languages.length?navigator.languages:[navigator.language];
    if(ls[0]&&ls[0].toLowerCase().startsWith('ar')){saved='ar';}
  }
  if(saved==='ar'){
    document.documentElement.lang='ar';
    document.documentElement.dir='rtl';
  }
}catch(e){}})();
`;
```

This sets `dir="rtl"` before the browser renders any content, so Arabic users never see an LTR flash.

`suppressHydrationWarning` is set on both `<html>` and `<body>` to silence React's hydration mismatch warning (expected, because the script modifies the DOM before React takes over).

---

## Glassmorphism Navbar Pattern

The navbar starts transparent and activates glassmorphism after 40px of scroll:

```typescript
// Navbar.tsx
const [scrolled, setScrolled] = useState(false);

useEffect(() => {
  const handler = () => setScrolled(window.scrollY > 40);
  window.addEventListener("scroll", handler, { passive: true });
  return () => window.removeEventListener("scroll", handler);
}, []);

// Applied:
<nav className={`... ${scrolled ? "nav-glass" : "bg-transparent"}`}>
```

The `{ passive: true }` flag is important — it tells the browser the scroll handler will not call `preventDefault()`, enabling performance optimizations.

---

## Easter Egg: 3-Click Logo → /admin

`Navbar.tsx` counts rapid clicks on the logo button. Three clicks within 700ms each navigate to `/admin`:

```typescript
const clickCountRef = useRef(0);
const lastClickRef = useRef(0);

function handleLogoClick(e: React.MouseEvent) {
  e.preventDefault();
  const now = Date.now();
  if (now - lastClickRef.current > 700) clickCountRef.current = 0;
  clickCountRef.current += 1;
  lastClickRef.current = now;
  if (clickCountRef.current >= 3) {
    clickCountRef.current = 0;
    router.push("/admin");
  }
}
```

This is the only way to reach `/admin` without knowing the URL directly.
