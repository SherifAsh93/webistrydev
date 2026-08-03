# WebistryDev — Complete Company Inventory Audit
> Generated: 2026-07-24 | Audited by: Shery (Claude AI) | Owner: Sherif Ash

---

## Table of Contents

1. [Repository Inventory](#1-repository-inventory)
2. [Overall Company Statistics](#2-overall-company-statistics)
3. [Missing Project Categories](#3-missing-project-categories)
4. [Recommended Build Order](#4-recommended-build-order)
5. [Top 20 Reusable Modules for WebistryDev OS](#5-top-20-reusable-modules-for-webistrydev-os)

---

## 1. Repository Inventory

---

### 1.1 — webistrydev

| Field | Details |
|---|---|
| **Repository Name** | webistrydev |
| **GitHub URL** | https://github.com/SherifAsh93/webistrydev |
| **Category** | Portfolio / Agency Lead-Gen |
| **Current Status** | Production |
| **Build Status** | Passing |
| **Deployment Status** | Live — https://webistrydev.com (VPS + PM2, port 3001) |
| **Database** | Neon PostgreSQL (via Drizzle ORM) |
| **Template Candidate** | Yes |
| **Priority** | High |
| **Similar Projects** | olympia-club (pitch site), qoya-furniture (lead-gen) |

**Tech Stack**
Next.js 16 · TypeScript 5 · Tailwind CSS 4 · Drizzle ORM 0.45 · Neon PostgreSQL · Framer Motion 12 · Lucide React · Resend (email) · Telegram Bot API · VPS + PM2

**Main Features**
- Bilingual Arabic/English site with RTL support and language toggle
- Portfolio grid of 9+ real client projects with screenshots and live links
- Services, pricing tiers (4 plans in EGP + USD), how-it-works flow
- StartProject form: voice recorder (MediaRecorder API, 60s) + free-text mode
- Client chat page (`/m/[token]`) — private link per lead, polls for admin replies
- Admin dashboard: lead inbox, voice playback, WhatsApp/email shortcuts
- Browser push notifications + auto-refresh every 30 s
- Email via Resend + Telegram notifications on every lead submission
- Floating WhatsApp button, mobile bottom nav, PWA meta

**Reusable Components**
- `FloatingWhatsApp.tsx` — fixed WhatsApp CTA button (all pages)
- `BottomNav.tsx` — mobile fixed bottom navigation bar
- `StartProject.tsx` — voice recorder + text form with project-type picker
- `ContactForm.tsx` — simple contact form with Zod validation
- `Navbar.tsx` — bilingual sticky navbar with language toggle
- `HowItWorks.tsx` — step-by-step process section
- `Pricing.tsx` — tiered pricing cards component
- `Portfolio.tsx` — grid of project cards with category filtering
- `ProjectInquiryModal.tsx` — modal overlay form

**Reusable APIs**
- `POST /api/lead` — create lead, trigger Resend email + Telegram notification
- `GET /api/lead/[token]` — fetch lead thread by private token
- `POST /api/lead/[token]/reply` — admin reply to lead
- `GET /api/leads` — admin: list all leads with filter
- `POST /api/push-subscribe` — Web Push subscription registration
- Language detection + `LanguageContext` (localStorage + browser lang)

**Reusable Database Schemas**
```
leads(id, token, type, content_text, voice_url, name, phone, status, created_at)
lead_replies(id, lead_id, content, sender, created_at)
push_subscriptions(id, endpoint, p256dh, auth, created_at)
```

---

### 1.2 — Ahmed-Elakad

| Field | Details |
|---|---|
| **Repository Name** | Ahmed-Elakad |
| **GitHub URL** | https://github.com/SherifAsh93/Ahmed-Elakad |
| **Category** | Fashion Portfolio + CRM |
| **Current Status** | Production |
| **Build Status** | Passing |
| **Deployment Status** | Live — https://ahmedelakad.com (VPS + PM2) |
| **Database** | Local JSON/file-based — `/home/sherif/data/ahmed-elakad/` |
| **Template Candidate** | Yes |
| **Priority** | High |
| **Similar Projects** | montelle-couture (luxury brand), qoya-furniture (portfolio) |

**Tech Stack**
Next.js 16 · TypeScript 5 · Tailwind CSS 4 · Cloudinary (legacy CDN) · Anthropic SDK (Claude AI analytics) · ffmpeg (video transcode) · yt-dlp (Instagram download) · Busboy (file uploads) · VPS + PM2 + Nginx

**Main Features**
- Bridal + couture collections by year with masonry gallery and cover images
- About page, experience page (testimonials, client videos, Instagram embeds)
- 4-step AtelierForm: Identity → Timeline → Vision → Investment
- AdInquiryPopup triggered by `?ref=ad` param (paid ad traffic)
- Atelier CRM page (`/atelier`) — Arabic RTL, for walk-in clients, no auth
- Full admin CMS: content editor, image/video manager, drag-reorder, delete
- Instagram video download via yt-dlp with cookie auth
- Client CRM — payments, dress tracking, voice notes
- AI-powered monthly Instagram analytics via Anthropic Claude
- Admin password change from dashboard

**Reusable Components**
- Masonry gallery component with drag-reorder
- 4-step multi-step form (AtelierForm pattern)
- AdInquiryPopup — URL param triggered modal
- Video player with ffmpeg-transcoded mp4
- AI-powered analytics report component

**Reusable APIs**
- `POST /api/upload` — streaming multipart via Busboy, saves to local disk
- `POST /api/ig-video` — yt-dlp Instagram video download
- `GET /api/admin/analytics` — Anthropic Claude AI monthly audit endpoint
- File-based config read/write pattern (no ORM needed for simple sites)

**Reusable Database Schemas**
- File-based JSON pattern: `config.json`, `messages.json`, `clients.json`
- No SQL ORM — local disk is the database for this project

---

### 1.3 — Montelle-Couture

| Field | Details |
|---|---|
| **Repository Name** | Montelle-Couture |
| **GitHub URL** | https://github.com/SherifAsh93/Montelle-Couture |
| **Category** | Luxury Ecommerce |
| **Current Status** | Production |
| **Build Status** | Passing |
| **Deployment Status** | Live — https://montelle-couture.vercel.app (Vercel) |
| **Database** | Neon PostgreSQL (via Prisma 7 + `@prisma/adapter-pg`) |
| **Template Candidate** | Yes |
| **Priority** | High |
| **Similar Projects** | zahrtelkhlig (full ecommerce), furniture-studio (product catalog) |

**Tech Stack**
Next.js 16 · TypeScript 5 · Tailwind CSS 4 · Prisma 7 · Neon PostgreSQL · Jose JWT 6 · Zustand 5 · Sharp 0.34 · GitHub + jsDelivr CDN · Lucide React · Vercel

**Main Features**
- Product catalog (veils, robes, corsets, dresses, accessories)
- Shop page with category filtering
- Product detail with image gallery and add-to-cart
- Cart drawer (Zustand, client-side, no login required)
- Checkout: name, phone, city, address, order notes
- Admin panel: dashboard stats, product CRUD, category management (parent/child), order management with status, banner management
- GitHub CDN image upload for products
- Mobile-first with bottom nav bar
- Triple-click logo easter egg → admin login
- Announcement bar with marquee animation
- Luxury typography: Cormorant Garamond + Montserrat

**Reusable Components**
- `CartDrawer` — Zustand-powered slide-over cart (reusable in any store)
- `ProductCard` — product listing card with hover effects
- `ImageGallery` — product detail multi-image gallery
- `AnnouncementBar` — scrolling marquee header bar
- `AdminSidebar` — admin panel navigation sidebar
- Triple-click admin trigger pattern
- Mobile `BottomNav` for store
- Category nested tree (parent/child)

**Reusable APIs**
- `POST /api/admin/products` — CRUD with GitHub CDN image upload
- `POST /api/admin/categories` — nested category management
- `POST /api/orders` — create customer order
- `PATCH /api/admin/orders/[id]` — update order status
- `POST /api/admin/banners` — homepage banner management
- `POST /api/auth/login` — Jose JWT admin login

**Reusable Database Schemas**
```
products(id, name, slug, description, price, category_id, images[], status, created_at)
categories(id, name, slug, parent_id, sort_order)
orders(id, customer_name, phone, city, address, notes, status, items_json, total, created_at)
banners(id, image_url, title, subtitle, link, sort_order, active)
```

---

### 1.4 — Qoya-Furniture

| Field | Details |
|---|---|
| **Repository Name** | Qoya-Furniture |
| **GitHub URL** | https://github.com/SherifAsh93/Qoya-Furniture |
| **Category** | Lead Generation / Brand Showcase |
| **Current Status** | Production |
| **Build Status** | Passing |
| **Deployment Status** | Live — https://qoya-furniture.vercel.app (Vercel) |
| **Database** | Neon PostgreSQL — single `inquiries` table (via Prisma 6) |
| **Template Candidate** | Yes |
| **Priority** | Medium |
| **Similar Projects** | webistrydev (lead-gen), olympia-club (pitch site), ahmed-elakad (portfolio) |

**Tech Stack**
Next.js 15 · TypeScript 5 · Tailwind CSS 4 · Prisma 6 · Neon PostgreSQL · Framer Motion 12 · Zod 3 · Lucide React · Vercel

**Main Features**
- Full-screen hero image slider (homepage)
- 4 furniture collection pages with full-screen cover + curated image grid
- About page with company pillars
- Gallery: 80+ professional product images with tap-to-fullscreen lightbox
- Stores page with Google Maps iframes, opening hours, address cards for 2 Cairo showrooms
- Contact page: inquiry form, WhatsApp deep link, phone, email, social, maps
- Scroll-reveal animations (Intersection Observer via `RevealObserver`)
- Floating WhatsApp button on all pages
- Split desktop nav (logo centered), full-screen mobile overlay
- Fully static build — all routes prerendered
- SEO metadata on every page

**Reusable Components**
- `HeroSlider.tsx` — full-screen auto-play image carousel
- `RevealObserver.tsx` — scroll-triggered Intersection Observer animations
- `GalleryGrid.tsx` — responsive image grid with lightbox
- `WhatsAppButton.tsx` — floating WhatsApp CTA
- `ContactForm.tsx` — inquiry form with Zod validation
- `Navbar.tsx` — centered-logo split nav + full-screen mobile overlay
- `Footer.tsx` — standard footer

**Reusable APIs**
- `POST /api/contact` — store inquiry in PostgreSQL + optional email notification

**Reusable Database Schemas**
```
inquiries(id, name, phone, email, message, created_at)
```

---

### 1.5 — Zahrtelkhlig

| Field | Details |
|---|---|
| **Repository Name** | Zahrtelkhlig |
| **GitHub URL** | https://github.com/SherifAsh93/Zahrtelkhlig |
| **Category** | Full Ecommerce + POS + Analytics |
| **Current Status** | Production (Archived — maintenance only) |
| **Build Status** | Passing |
| **Deployment Status** | Live — https://zahrtelkhlig.vercel.app (Vercel) |
| **Database** | Neon PostgreSQL (via Prisma 7 + Neon adapter) |
| **Template Candidate** | Yes — most feature-complete ecommerce template in the portfolio |
| **Priority** | Low (closed, reference only) |
| **Similar Projects** | montelle-couture (luxury ecommerce), furniture-studio (product catalog) |

**Tech Stack**
Next.js 16 · TypeScript 5 · Tailwind CSS 4 · Prisma 7 · Neon PostgreSQL · Jose JWT 6 · bcryptjs · Zustand 5 · GitHub + jsDelivr CDN · Sharp · next-auth · Vercel

**Main Features**
- Full Arabic RTL storefront: catalog, search, category/season filter, product detail
- Cart (Zustand + localStorage, no login required), wishlist (login required)
- Checkout: Vodafone Cash / InstaPay / COD / Bank Transfer
- Order tracking with status timeline
- Customer registration + login (JWT httpOnly cookie, 30d session)
- Admin panel: dashboard KPIs, product CRUD with size-stock grid, bulk delete, order management, inventory control, user/staff management, category management, banner management, media library, homepage settings, daily sales reports
- POS Terminal (`/pos`): staff login (role-based), product search, cart, ESC/POS thermal receipt printing
- Owner analytics dashboard (`/owner`): 30-day rolling chart, sales split pie, top products, low-stock alerts, activity feed, auto-refresh every 15s
- Multi-role auth: CUSTOMER / STAFF / ADMIN / OWNER

**Reusable Components**
- Full ecommerce cart + checkout flow (most complete implementation)
- POS terminal (complete point-of-sale for physical retail)
- Owner analytics dashboard (KPI cards, charts, activity feed)
- Role-based auth middleware
- Media library drag-and-drop uploader
- Size-stock grid editor
- Daily sales report page

**Reusable APIs**
- Full product CRUD with variants (size, color, stock)
- Order lifecycle API (create → confirm → ship → deliver)
- POS sale creation (deducts stock, creates POS order)
- Media upload API (batch, delete, browse by folder)
- Role-based auth middleware (`STAFF`, `ADMIN`, `OWNER`)
- Daily sales report aggregation query

**Reusable Database Schemas**
```
users(id, name, phone, email, password_hash, role, status, created_at)
products(id, name, slug, price, category_id, images[], status)
product_variants(id, product_id, size, color, stock)
categories(id, name, slug, image, parent_id, sort_order)
orders(id, user_id, source[online|pos], status, total, payment_method, items_json, created_at)
order_items(id, order_id, product_id, variant_id, qty, price)
banners(id, image_url, title, link, sort_order, active)
media_files(id, folder, filename, url, size, created_at)
```

---

### 1.6 — mr-mohammed

| Field | Details |
|---|---|
| **Repository Name** | mr-mohammed |
| **GitHub URL** | https://github.com/SherifAsh93/mr-mohammed |
| **Category** | EdTech / Online Teaching Platform |
| **Current Status** | Production |
| **Build Status** | Passing |
| **Deployment Status** | Live — https://mohammedcourses.vercel.app (Vercel) |
| **Database** | Neon PostgreSQL (via Drizzle ORM 0.45) |
| **Template Candidate** | Yes |
| **Priority** | Medium |
| **Similar Projects** | None (unique category in portfolio) |

**Tech Stack**
Next.js 16 · TypeScript 5 · Tailwind CSS 4 · Drizzle ORM 0.45 · Neon PostgreSQL · Jose JWT (student) · bcryptjs · Jitsi Meet External API · Cairo Google Font · PWA manifest · Vercel

**Main Features**
- Arabic RTL site with Cairo font
- Student registration (phone + password), pending until admin approval
- Student login + JWT httpOnly cookie session (30d)
- Course catalog with subject, schedule, price; inline enrollment with Vodafone Cash ref
- Student dashboard: confirmed enrollments, session join button, materials tab
- Jitsi Meet integration: teacher starts → students join same room (fullscreen iframe)
- Hidden admin panel (triple-click logo) — manage courses, sessions, students, enrollments, attendance, materials, exam results
- PWA: installable, bottom nav bar, Apple Web App meta

**Reusable Components**
- `JitsiSession.tsx` — Jitsi Meet External API iframe integration
- `AdminTrigger.tsx` — triple-click hidden admin access pattern
- `BottomNav.tsx` — mobile PWA bottom navigation
- Student enrollment form with payment reference field
- Attendance marking UI
- Exam results display table

**Reusable APIs**
- `POST /api/auth/register` — phone-based student registration (pending approval)
- `POST /api/auth/login` — Jose JWT student login
- `GET /api/courses` — list courses with enrollment counts
- `POST /api/enrollments` — student enrollment with payment reference
- `POST /api/admin/sessions` — create session with auto-generated Jitsi room name
- `PATCH /api/admin/students/[id]` — approve/reject student account

**Reusable Database Schemas**
```
mrm_users(id, name, phone, password_hash, status, created_at)
mrm_courses(id, title, subject, schedule_text, status, max_students, price, created_at)
mrm_sessions(id, course_id, title, meeting_link, scheduled_at, recorded_url)
mrm_enrollments(id, user_id, course_id, payment_ref, status, created_at)
mrm_attendance(id, session_id, user_id, status)
mrm_materials(id, title, description, subject, type, url, created_at)
mrm_results(id, student_name, subject, exam_name, score, max_score, created_at)
mrm_admin_settings(key, value, updated_at)
```

---

### 1.7 — olympia-club

| Field | Details |
|---|---|
| **Repository Name** | olympia-club |
| **GitHub URL** | https://github.com/SherifAsh93/olympia-club |
| **Category** | Pitch Demo / Beach Club App |
| **Current Status** | Beta |
| **Build Status** | Passing |
| **Deployment Status** | Live — VPS port 3002 (PM2 id 3) |
| **Database** | None (static data) |
| **Template Candidate** | Yes — mobile app shell template |
| **Priority** | Low |
| **Similar Projects** | webistrydev (pitch site), qoya-furniture (lead-gen demo) |

**Tech Stack**
Next.js 16 · TypeScript 5 · Tailwind CSS 4 · Framer Motion 12 · Lucide React · Cairo + Plus Jakarta Sans fonts · No backend · VPS + PM2

**Main Features**
- Animated splash screen (auto-dismiss 2.8s)
- Mobile-first shell (max-width 448px) — simulates iOS/Android native feel
- 5-tab bottom nav: Home / Facilities / Booking / Events / Membership
- Arabic (RTL, default) ↔ English (LTR) toggle, persisted in localStorage, auto-detected
- Home screen: hero banner, quick-action grid, upcoming events carousel, latest news
- Facilities: 6 facility cards
- Booking: form → "Confirm via WhatsApp" CTA (pre-filled WhatsApp message)
- Events: cards with tags (coming soon / free / register)
- Membership: 3 pricing plans with per-plan feature lists
- Framer Motion screen transitions + tap feedback
- PWA-ready: manifest.json, Apple Web App meta

**Reusable Components**
- `Splash.tsx` — animated splash screen with auto-dismiss
- `BottomNav.tsx` — 5-tab mobile bottom navigation
- `TopBar.tsx` — sticky header with logo + language toggle
- `MembershipScreen.tsx` — tiered membership/pricing plans
- Language context with localStorage sync and RTL/LTR direction switching
- WhatsApp booking CTA pattern (pre-filled message URL)
- `translations.ts` — full AR/EN string dictionary + `tr()` helper

**Reusable APIs**
- None (static / WhatsApp CTA only)

**Reusable Database Schemas**
- None

---

### 1.8 — elghaly-vr

| Field | Details |
|---|---|
| **Repository Name** | elghaly-vr |
| **GitHub URL** | https://github.com/SherifAsh93/elghaly-vr |
| **Category** | 3D Visualization / AR Tool |
| **Current Status** | Production |
| **Build Status** | Passing |
| **Deployment Status** | Live — Vercel (no custom domain) |
| **Database** | None (100% client-side) |
| **Template Candidate** | No |
| **Priority** | Medium |
| **Similar Projects** | None (unique category in portfolio) |

**Tech Stack**
Next.js 16 · TypeScript 5 · Tailwind CSS 4 · Three.js 0.182 · React Three Fiber 9 · Drei 10 · react-webcam 7 · No backend · Vercel

**Main Features**
- Rear-facing mobile camera stream via WebRTC
- Pixel-exact wall color sampling via HTML5 Canvas `getImageData`
- One-tap switch from camera to 3D room preview
- Fully procedural 3D living room (no GLB files — zero network cost):
  - Hardwood floor, wainscoting, chair rail, crown molding, baseboard
  - Sofa, coffee table, side table, floor lamp, ceiling fixture
  - Upper walls painted in the sampled color
- 6-light cinematic rig with ACES filmic tone mapping
- Orbital camera controls (OrbitControls, mobile-optimized)
- Contact shadows via Drei
- 100% client-side — no backend, no auth, no database, no env vars

**Reusable Components**
- Wall color picker via webcam (standalone React component)
- Procedural 3D room scene (Three.js + React Three Fiber)

**Reusable APIs**
- None

**Reusable Database Schemas**
- None

---

### 1.9 — Furniture-Studio

| Field | Details |
|---|---|
| **Repository Name** | Furniture-Studio |
| **GitHub URL** | https://github.com/SherifAsh93/Furniture-Studio |
| **Category** | Furniture Ecommerce |
| **Current Status** | Production |
| **Build Status** | Unknown |
| **Deployment Status** | Live — https://furniture-studio-fs.vercel.app (Vercel) |
| **Database** | Neon PostgreSQL (via Prisma) |
| **Template Candidate** | No (superseded by Qoya-Furniture) |
| **Priority** | Low |
| **Similar Projects** | qoya-furniture (newer replacement), montelle-couture (product catalog) |

**Tech Stack**
Next.js · TypeScript · Tailwind CSS · Prisma · Neon PostgreSQL · Vercel

**Main Features**
- Furniture product catalog
- Basic ecommerce or lead-gen (older project pre-dating Qoya)

**Reusable Components**
- Earlier version of furniture layout components (superseded by Qoya)

**Reusable APIs**
- Basic product listing

**Reusable Database Schemas**
- Basic products/inquiries schema

---

### 1.10 — elghaly-management

| Field | Details |
|---|---|
| **Repository Name** | elghaly-management |
| **GitHub URL** | https://github.com/SherifAsh93/elghaly-management |
| **Category** | Business Management Dashboard |
| **Current Status** | Production |
| **Build Status** | Unknown |
| **Deployment Status** | Live — https://elghaly-management.vercel.app (Vercel) |
| **Database** | Neon PostgreSQL (via `@neondatabase/serverless`) |
| **Template Candidate** | No |
| **Priority** | Low |
| **Similar Projects** | elghaly-management-local (local version) |

**Tech Stack**
React 18 · Vite · TypeScript · Tailwind CSS · Neon PostgreSQL (direct HTTP) · Lucide React · Vercel

**Main Features**
- Business management dashboard for elghaly client
- Built with Vite + React (pre-Next.js era project)
- Likely: inventory tracking, sales records, staff management

**Reusable Components**
- Early iteration dashboard components (pre-Next.js stack)

**Reusable APIs**
- Direct Neon HTTP SQL queries (no ORM)

**Reusable Database Schemas**
- Business-specific schema (likely products/sales/staff)

---

### 1.11 — Ameer-dental-clinic

| Field | Details |
|---|---|
| **Repository Name** | Ameer-dental-clinic |
| **GitHub URL** | https://github.com/SherifAsh93/Ameer-dental-clinic |
| **Category** | Healthcare / Dental Clinic |
| **Current Status** | Production |
| **Build Status** | Unknown |
| **Deployment Status** | Live — https://ameer-dental-clinic.vercel.app (Vercel) |
| **Database** | Neon PostgreSQL |
| **Template Candidate** | Yes — clinic/medical site template |
| **Priority** | Low |
| **Similar Projects** | batrawy-clinic (similar category) |

**Tech Stack**
React 18 · Vite · TypeScript · Tailwind CSS · Neon PostgreSQL · Lucide React · Gemini AI API · Vercel

**Main Features**
- Dental clinic website with appointment booking
- AI-powered features via Gemini API (scaffolded from Google AI Studio)
- Patient management or inquiry system
- Likely: doctor profile, services list, appointment form, contact

**Reusable Components**
- Clinic/medical site layout (services, doctor profile, appointment form)

**Reusable APIs**
- Appointment/booking form submission
- Gemini AI integration pattern

**Reusable Database Schemas**
- Likely: appointments(name, phone, date, service, notes, status)

---

### 1.12 — batrawy-clinic

| Field | Details |
|---|---|
| **Repository Name** | batrawy-clinic |
| **GitHub URL** | https://github.com/SherifAsh93/batrawy-clinic |
| **Category** | Healthcare / Medical Clinic |
| **Current Status** | Production |
| **Build Status** | Unknown |
| **Deployment Status** | Live — https://batrawy-clinic.vercel.app (Vercel) |
| **Database** | None (static or localStorage only) |
| **Template Candidate** | Yes — static clinic site template |
| **Priority** | Low |
| **Similar Projects** | ameer-dental-clinic |

**Tech Stack**
React 18 · Vite · TypeScript · Tailwind CSS · Lucide React · Vercel

**Main Features**
- Medical clinic static site
- No database (Google AI Studio scaffold — static)
- Doctor profile, services, contact info, appointment CTA

**Reusable Components**
- Static clinic site layout

**Reusable APIs**
- None

**Reusable Database Schemas**
- None

---

### 1.13 — Notely

| Field | Details |
|---|---|
| **Repository Name** | Notely |
| **GitHub URL** | https://github.com/SherifAsh93/Notely |
| **Category** | Productivity / Notes App |
| **Current Status** | Archived / Experimental |
| **Build Status** | Unknown |
| **Deployment Status** | No deployment found |
| **Database** | Local only (AsyncStorage) |
| **Template Candidate** | No |
| **Priority** | Low |
| **Similar Projects** | None |

**Tech Stack**
React Native · TypeScript · @react-native-async-storage/async-storage

**Main Features**
- Mobile notes application (React Native)
- Local storage only — no backend
- Likely: create/edit/delete notes, categories

**Reusable Components**
- React Native note CRUD UI

**Reusable APIs**
- None

**Reusable Database Schemas**
- None (AsyncStorage key-value)

---

### 1.14 — elghaly-management-local

| Field | Details |
|---|---|
| **Repository Name** | elghaly-management-local |
| **GitHub URL** | https://github.com/SherifAsh93/elghaly-management-local |
| **Category** | Business Management (Local / Offline) |
| **Current Status** | Archived |
| **Build Status** | Unknown |
| **Deployment Status** | No deployment |
| **Database** | Unknown (local) |
| **Template Candidate** | No |
| **Priority** | Low |
| **Similar Projects** | elghaly-management (cloud version) |

**Tech Stack**
Unknown (no language detected on GitHub)

**Main Features**
- Local/offline version of elghaly management system
- Likely predates the cloud version

**Reusable Components**
- N/A

**Reusable APIs**
- N/A

**Reusable Database Schemas**
- N/A

---

### 1.15 — Engineering-Knowledge-Base

| Field | Details |
|---|---|
| **Repository Name** | Engineering-Knowledge-Base |
| **GitHub URL** | https://github.com/SherifAsh93/Engineering-Knowledge-Base |
| **Category** | Internal Documentation |
| **Current Status** | Active (living document) |
| **Build Status** | N/A |
| **Deployment Status** | N/A — internal only |
| **Database** | None |
| **Template Candidate** | N/A |
| **Priority** | High |
| **Similar Projects** | N/A |

**Tech Stack**
Markdown · Git

**Main Features**
- Master AI context for all WebistryDev projects
- Architecture blueprints and patterns
- Technology standards and non-negotiable choices
- Common component patterns and code snippets
- AI onboarding guide for new projects
- Company philosophy and engineering principles

---

## 2. Overall Company Statistics

| Metric | Value |
|---|---|
| **Total Repositories** | 15 |
| **Production Projects** | 10 |
| **Beta / Pitch Projects** | 1 (olympia-club) |
| **Archived Projects** | 3 (zahrtelkhlig, notely, elghaly-management-local) |
| **Internal / Docs** | 1 (Engineering-Knowledge-Base) |
| **Live Deployments** | 12 unique URLs |
| **VPS Projects (PM2)** | 3 (webistrydev, ahmed-elakad, olympia-club) |
| **Vercel Projects** | 9 |
| **Primary Language** | TypeScript (14/15 repos) |
| **Primary Framework** | Next.js 16 App Router (9 active projects) |
| **Primary Database** | Neon PostgreSQL (8 projects) |
| **Primary ORM** | Prisma 7 (4) / Drizzle 0.45 (3) |
| **Categories Covered** | 9 (see below) |
| **Total Estimated Reusable Components** | ~45 |
| **Total Estimated Reusable APIs** | ~60 |

### Categories Covered

| # | Category | Projects |
|---|---|---|
| 1 | Luxury Ecommerce | Montelle, zahrtelkhlig, Furniture-Studio |
| 2 | Lead Generation / Brand Showcase | Qoya-Furniture, webistrydev, olympia-club |
| 3 | Fashion Portfolio + CRM | Ahmed-Elakad |
| 4 | EdTech / Online Teaching | mr-mohammed |
| 5 | 3D / AR Visualization | elghaly-vr |
| 6 | Business Management Dashboard | elghaly-management, elghaly-management-local |
| 7 | Healthcare / Medical | Ameer-dental-clinic, batrawy-clinic |
| 8 | Productivity App | Notely |
| 9 | Internal Documentation | Engineering-Knowledge-Base |

---

## 3. Missing Project Categories

These are high-demand niches in Egypt that WebistryDev has **no template for yet**:

| Priority | Missing Category | Why It Matters |
|---|---|---|
| 🔴 High | **Restaurant / Food Ordering** | Massive Egyptian market — cafés, restaurants, delivery apps are ubiquitous clients |
| 🔴 High | **Real Estate / Property Listings** | Egypt's construction boom drives huge demand for realtor + developer sites |
| 🔴 High | **SaaS / Subscription Platform** | Recurring revenue model — no SaaS template in the portfolio yet |
| 🔴 High | **Beauty Salon / Barber** | High volume client type — appointment booking + service menu |
| 🟡 Medium | **Event Management / Ticketing** | Weddings, conferences, corporate events — high in Egypt |
| 🟡 Medium | **Logistics / Delivery Tracking** | Courier services, last-mile delivery — growing in Egypt |
| 🟡 Medium | **Legal / Law Firm** | Professionals need polished sites; low competition in Arabic |
| 🟡 Medium | **Gym / Fitness Studio** | Class booking, membership management, trainer profiles |
| 🟡 Medium | **Hotel / Tourism / Booking** | Egypt tourism recovery drives hotel sites + booking pages |
| 🟡 Medium | **Digital Products / Downloads** | Sell ebooks, courses, templates with Stripe/PayPal |
| 🟢 Low | **Fintech / Payment Dashboard** | B2B payment tracking, invoicing |
| 🟢 Low | **Multi-tenant Marketplace** | Multiple vendors on one platform |
| 🟢 Low | **Church / NGO / Charity** | Donation forms, event listings, volunteer management |

---

## 4. Recommended Build Order

Based on market demand in Egypt, portfolio gaps, and reusability of resulting templates:

### Phase 1 — Immediate (High ROI, missing templates)

**1. Restaurant / Café Ordering Site**
> WhatsApp-based ordering, menu with categories, daily specials, table reservations. No payment gateway needed (cash on delivery model). Very repeatable for Egyptian F&B clients.

**2. Real Estate Listings**
> Property listing with filters (area, price, type), WhatsApp CTA, agent profile, inquiry form. Could target developers or individual agents.

**3. Beauty Salon / Barber Booking**
> Appointment booking with calendar, service menu, staff profiles, WhatsApp CTA. Very repeatable — every salon needs this.

### Phase 2 — Mid-term (Strategic gaps)

**4. Gym / Fitness Studio**
> Membership plans, class schedule, trainer bios, online enrollment form. Reuses membership tier component from olympia-club.

**5. Hotel / Guesthouse Booking Page**
> Room showcase, availability calendar, booking form, WhatsApp CTA. Egypt's North Coast + Red Sea tourism demand.

**6. Event Management / Ticketing**
> Event listings, countdown timer, ticket purchase (WhatsApp/Vodafone Cash), attendee management. Reuses POS/order pattern from zahrtelkhlig.

### Phase 3 — Long-term (High complexity, higher value)

**7. SaaS / Subscription Platform**
> Multi-tenant, plan tiers, usage tracking, billing via Stripe or Paymob. First true recurring-revenue product.

**8. Multi-vendor Marketplace**
> Vendors list products, buyers checkout, admin takes commission. Extends zahrtelkhlig ecommerce template.

---

## 5. Top 20 Reusable Modules for WebistryDev OS

These are the modules that appear across multiple projects and should be extracted into a shared `@webistrydev/ui` or `@webistrydev/core` library:

| # | Module Name | Source Project(s) | Type | Description |
|---|---|---|---|---|
| 1 | **FloatingWhatsApp** | webistrydev, qoya, montelle, olympia | Component | Fixed WhatsApp CTA button with pre-filled message URL |
| 2 | **LanguageContext (AR/EN)** | webistrydev, olympia | Context + Hook | RTL/LTR toggle, localStorage sync, browser lang detection, `tr()` helper |
| 3 | **Jose JWT Auth Stack** | zahrtelkhlig, montelle, mr-mohammed | API + Middleware | httpOnly cookie sessions (HS256), login/logout/verify, role-based middleware |
| 4 | **AdminTrigger (Triple-click)** | montelle, mr-mohammed, zahrtelkhlig | Component | Hidden admin access: triple-click on logo within 800ms → password modal |
| 5 | **GitHub CDN Image Upload** | zahrtelkhlig, montelle | API Route | Upload image to GitHub repo → serve via jsDelivr CDN, no storage cost |
| 6 | **Zustand Cart + Checkout** | zahrtelkhlig, montelle | Store + Pages | Cart drawer, item management, localStorage persistence, checkout form (Egyptian COD) |
| 7 | **Product CRUD Admin** | zahrtelkhlig, montelle, furniture-studio | Admin Pages + API | Full product management: add/edit/delete, image gallery, category, stock, status |
| 8 | **Order Management System** | zahrtelkhlig, montelle | Admin Pages + API | Order list, status progression, filter by status, customer details |
| 9 | **Neon PostgreSQL Prisma Boilerplate** | zahrtelkhlig, montelle, qoya, mr-mohammed | Config | `schema.prisma` + Prisma adapter for Neon serverless + connection pooling pattern |
| 10 | **Drizzle + Neon Boilerplate** | webistrydev, mr-mohammed | Config | `db/schema.ts` + `db/index.ts` with Neon HTTP driver — lightweight alternative to Prisma |
| 11 | **Mobile BottomNav** | webistrydev, mr-mohammed, olympia, montelle | Component | Fixed 4-5 tab mobile bottom navigation bar |
| 12 | **RevealObserver (Scroll Animations)** | qoya | Component | Intersection Observer wrapper — add `data-reveal` class for fade-in-up on scroll |
| 13 | **HeroSlider** | qoya | Component | Full-screen auto-play image carousel with dots and Framer Motion transitions |
| 14 | **AnnouncementBar** | montelle | Component | Scrolling marquee header strip with configurable speed and text |
| 15 | **POS Terminal** | zahrtelkhlig | Full Page | Staff POS: product search, cart, role auth, ESC/POS receipt printing |
| 16 | **Owner Analytics Dashboard** | zahrtelkhlig | Full Page | KPI cards, 30-day chart (online vs POS), top products, low-stock alerts, auto-refresh |
| 17 | **Email + Telegram Notification** | webistrydev | API Utility | Dual notification on form submit — Resend email + Telegram Bot API message |
| 18 | **Media Library (Drag + Upload)** | zahrtelkhlig | Admin Page | Multi-file drag-and-drop image uploader, folder browser, delete — reusable for any CMS |
| 19 | **Jitsi Meet Integration** | mr-mohammed | Component | `JitsiSession.tsx` — Jitsi External API iframe, fullscreen, auto-admit, configurable room |
| 20 | **Splash Screen** | olympia | Component | Animated logo splash with configurable dismiss delay — for PWAs and pitch apps |

---

> **Note:** `C:\WebistryDev\Company\COMPANY_AUDIT.md` — this file mirrors the local path and should be kept in sync with `/home/sherif/sites/Engineering-Knowledge-Base/Company/COMPANY_AUDIT.md` on the VPS.

---

*WebistryDev OS — building Egypt's best client sites, one template at a time.*
