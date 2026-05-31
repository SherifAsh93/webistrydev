# Webistrydev Portfolio — Components Guide

All components live in `components/`. All are Client Components (`"use client"`) unless noted. Static data comes from `lib/data.ts`.

---

## Logo

**File:** `components/Logo.tsx`  
**Type:** Server component

**Purpose:** Renders the SVG brand logo (corner bracket + web code motif with violet gradient).

**Props:** `className?: string`

**Usage:**
```tsx
import Logo from "@/components/Logo";
<Logo className="w-8 h-8" />
```

---

## Navbar

**File:** `components/Navbar.tsx`  
**Type:** Client component

**Purpose:** Sticky top navigation bar with glassmorphism effect on scroll.

**Features:**
- Transparent on top, frosted glass after scrolling (scroll listener via `useEffect`)
- Desktop: horizontal nav links + "Hire Me" CTA
- Mobile: hamburger toggle revealing full-screen menu
- Logo has 3-click Easter egg (tracked via `useRef`) that navigates to `/admin`
- Anchor links: `#portfolio`, `#services`, `#pricing`, `#start-project`

**Props:** None (standalone, uses no external data)

**Dependencies:** `Logo`, `lucide-react` icons

---

## Hero

**File:** `components/Hero.tsx`  
**Type:** Client component

**Purpose:** First visible section. Animated hero with rotating words, aurora background blobs, and stats.

**Features:**
- Rotating word animation: "Websites" / "Web Apps" / "E-Commerce" / "Digital Products" — changes every 2.8s using Framer Motion
- Three floating aurora blob backgrounds (CSS animation)
- Dot grid background overlay
- Stat counter row: "6+ Projects", "3+ Years Experience", "Next.js", "100% On-Time Delivery"
- Green "Available" badge
- Two CTAs: "Start a Project" → `#start-project`, "See My Work" → `#portfolio`

**Props:** None

**Dependencies:** `framer-motion`

---

## TechStack

**File:** `components/TechStack.tsx`  
**Type:** Server component (no interactivity)

**Purpose:** Horizontally scrolling marquee of technology logos/names.

**Features:**
- Auto-scrolling CSS marquee animation (40s loop)
- Duplicated items to create infinite scroll effect

**Props:** None

---

## Portfolio

**File:** `components/Portfolio.tsx`  
**Type:** Client component

**Purpose:** Showcases 6 completed client projects with Framer Motion scroll animations.

**Features:**
- Staggered entrance animation on scroll (Intersection Observer via Framer Motion)
- Grid layout: full-width hero card (Ahmed El Akad) + 2-column grid + mixed cards
- Project categories: `ecommerce`, `fashion`, `clinic`, `web-app`, `landing`
- "Build Like This" button → sets URL param `type` and scrolls to `#start-project`
- "Your Project Next?" CTA card at the end

**Props:** None (reads from `lib/data.ts` internally)

**Project data shape:**
```typescript
interface Project {
  id: string;
  name: string;
  description: string;
  category: string;
  categoryLabel: string;
  categoryColor: string;    // Tailwind gradient class
  tags: string[];
  url: string;
  screenshot: string;       // Path relative to /public
  featured: boolean;
}
```

---

## Services

**File:** `components/Services.tsx`  
**Type:** Server component

**Purpose:** Displays 6 service categories in a card grid.

**Services:**
1. E-Commerce Stores
2. Brand & Fashion Sites
3. Medical & Clinic Apps
4. Custom Web Applications
5. Corporate Websites
6. High-Converting Landing Pages

**Props:** None (reads from `lib/data.ts`)

---

## Pricing

**File:** `components/Pricing.tsx`  
**Type:** Server component

**Purpose:** Shows 4 pricing tiers with features, timelines, and EGP/USD prices.

**Tiers:** Starter · Business (popular) · E-Commerce · Custom App

**Props:** None (reads from `lib/data.ts`)

**Pricing data shape:**
```typescript
interface PricingTier {
  name: string;
  egp: string;              // e.g., "6,000–12,000 EGP"
  usd: string;              // e.g., "$150–300"
  description: string;
  features: string[];
  timeline: string;
  popular: boolean;         // Adds "Most Popular" badge
  color: string;            // Icon gradient class
}
```

---

## HowItWorks

**File:** `components/HowItWorks.tsx`  
**Type:** Server component

**Purpose:** 4-step visual process: Talk → Design → Build → Launch.

**Props:** None

---

## StartProject

**File:** `components/StartProject.tsx`  
**Type:** Client component

**Purpose:** Multi-step project inquiry form that submits to the Neon database.

**Steps:**
1. Select project type (6 options with icons)
2. Pick a reference project from portfolio (filtered by selected type)
3. Describe idea (textarea) + select budget range
4. Enter contact info (name required, phone or email required)

**Features:**
- URL param `?type=ecommerce` pre-selects project type on load (set by Portfolio component)
- Form validation before advancing steps
- Success screen with personalized message after submission
- Calls `submitInquiry()` server action
- Budget options: 6 EGP/USD ranges

**Props:** None

**Dependencies:** `submitInquiry` server action, project data from `lib/data.ts`

---

## ContactForm

**File:** `components/ContactForm.tsx`  
**Type:** Client component

**Purpose:** Legacy single-step contact form (not currently rendered on the homepage, superseded by StartProject).

**Props:** None

---

## Footer

**File:** `components/Footer.tsx`  
**Type:** Server component

**Purpose:** Site footer with contact info and social links.

**Features:**
- Logo + brand name
- Nav links + contact links
- WhatsApp, email, phone links
- Copyright line

**Props:** None

---

## FloatingWhatsApp

**File:** `components/FloatingWhatsApp.tsx`  
**Type:** Client component

**Purpose:** Fixed-position WhatsApp button always visible in the bottom-right corner.

**Props:** None (WhatsApp number hardcoded inside)

---

## BottomNav

**File:** `components/BottomNav.tsx`  
**Type:** Client component

**Purpose:** Mobile-only bottom navigation bar (shown only below `md` breakpoint).

**Links:** Home · Work (`#portfolio`) · Pricing (`#pricing`) · Contact (`#start-project`)

**Features:**
- Active item tracking by scroll position or URL hash
- Fixed at bottom of screen

**Props:** None

---

## Static Data (`lib/data.ts`)

Not a component but the central data source for Portfolio, Services, Pricing, and StartProject:

```typescript
export const projects: Project[]     // 6 portfolio projects
export const services: Service[]     // 6 service categories
export const pricing: PricingTier[]  // 4 pricing tiers
```

Modify this file to update portfolio content, services, or pricing without touching the components.
