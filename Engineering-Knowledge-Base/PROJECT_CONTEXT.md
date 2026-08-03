# Project Overview

**Engineering-Knowledge-Base** is a documentation-only repository that serves as the central engineering reference for all of Sherif's (Webistry Dev) web projects. It is not a web application — it contains no code, no build system, and no runtime. Its purpose is to give an AI assistant (or a new developer) everything needed to understand the architecture, conventions, quality standards, and reusable patterns used across all projects, so that new projects can be started correctly on the first attempt.

- **GitHub:** https://github.com/SherifAsh93/Engineering-Knowledge-Base
- **Local path:** /home/sherif/sites/Engineering-Knowledge-Base
- **Type:** Documentation repository (Markdown only)
- **Audience:** AI assistants onboarding to new Webistry Dev projects

---

## Features / Contents

- **AI_Onboarding_Guide.md** — Reading-order guide for new AI sessions. Covers 6 phases (Who/Why, Code Organization, Auth, Database, Frontend, Backend). Includes quick-start guides for ecommerce, portfolio, admin CMS, and interactive tool project types. Ends with a pre-coding verification checklist and emergency reference card with common code snippets.
- **Master_AI_Context.md** — Complete engineering reference. Covers: who Sherif builds for (Egyptian SMBs), engineering philosophy (simplicity, server-first, permanence, production-ready), non-negotiable technology choices (Next.js 16, TypeScript strict, Tailwind v4, Jose JWT, Prisma/Drizzle, Neon PostgreSQL, Zustand, GitHub CDN), architecture patterns, naming conventions, quality standards, anti-pattern table, and a project handoff checklist.
- **common/** — 13 reference documents covering:
  - API_Design.md — Route organization, HTTP conventions, response formats
  - Architecture_Principles.md — Core architectural decisions
  - Authentication.md — Auth decision tree, Jose JWT patterns, admin gate, triple-click nav
  - Backend_Patterns.md — Prisma singleton, GitHub CDN upload, OrderItem snapshot, email/Telegram notifications, video/media handling
  - Coding_Standards.md — TypeScript patterns, import order, API route guard, tsconfig.json, ESLint config
  - Database_Standards.md — Prisma vs Drizzle vs flat-file decision, reference schema, migration strategy
  - Deployment.md — Vercel and VPS+PM2 deployment guidance
  - Design_System.md — Mobile patterns, animations, fallback states
  - Feature_Workflow.md — Step-by-step workflow for adding new features
  - Folder_Structure.md — Standard Next.js App Router layout, component placement, naming rules
  - Frontend_Patterns.md — Tailwind v4 @theme tokens, responsive grids, cart drawer, product card, admin dashboard, PWA setup, bilingual language context, error/not-found pages
  - Prompting_Guide.md — Model-agnostic AI session guide (works with any AI model)
  - Reusable_Patterns.md — Copy-paste patterns for auth, orders, cart, admin, Zod validation, Jitsi video
- **Blueprints/** — 12 blueprint/template documents covering:
  - Project_Generator_Guide.md — Generator walkthrough
  - api_blueprint.md — API route templates
  - auth_blueprint.md — Auth implementation templates
  - crud_blueprint.md — Admin CRUD page templates
  - dashboard_blueprint.md — Admin dashboard templates
  - database_blueprint.md — Prisma schema templates
  - feature_implementation_checklist.md — Per-feature completion checklist
  - landing_page_blueprint.md — Marketing/portfolio page templates
  - project_init_checklist.md — Phase-by-phase project initialization checklist
  - prompt_templates.md — Pre-written AI prompts for common tasks
  - reusable_backend_modules.md — Backend module copy-paste library
  - reusable_ui_components.md — UI component copy-paste library

---

## Tech Stack

No build system — documentation only.

All files are plain Markdown (.md). No dependencies, no package.json, no deployment pipeline.

---

## Folder Structure

```
Engineering-Knowledge-Base/
├── AI_Onboarding_Guide.md       # Reading order + quick-start + emergency reference card
├── Master_AI_Context.md         # Complete engineering + product reference
├── PROJECT_CONTEXT.md           # This file
├── common/                      # Per-topic engineering reference docs (12 files)
│   ├── API_Design.md
│   ├── Architecture_Principles.md
│   ├── Authentication.md
│   ├── Backend_Patterns.md
│   ├── Coding_Standards.md
│   ├── Database_Standards.md
│   ├── Deployment.md
│   ├── Design_System.md
│   ├── Feature_Workflow.md
│   ├── Folder_Structure.md
│   ├── Frontend_Patterns.md
│   ├── Prompting_Guide.md
│   └── Reusable_Patterns.md
└── Blueprints/                  # Starter templates and checklists (12 files)
    ├── Project_Generator_Guide.md
    ├── api_blueprint.md
    ├── auth_blueprint.md
    ├── crud_blueprint.md
    ├── dashboard_blueprint.md
    ├── database_blueprint.md
    ├── feature_implementation_checklist.md
    ├── landing_page_blueprint.md
    ├── project_init_checklist.md
    ├── prompt_templates.md
    ├── reusable_backend_modules.md
    └── reusable_ui_components.md
```

---

## Database

N/A — documentation only, no database.

---

## Environment Variables

N/A — documentation only, no runtime environment.

---

## Local Development

No setup required. To use:

1. Open any file in a Markdown editor (VS Code recommended).
2. Start a new project session by reading `AI_Onboarding_Guide.md` first — it gives the exact reading order.
3. For a new ecommerce project, follow the "Starting a New Ecommerce Project" quick-start in `AI_Onboarding_Guide.md`.
4. Reference `Master_AI_Context.md` for tech stack decisions, naming conventions, and quality standards.
5. Use `Blueprints/` files as copy-paste starters for specific file types.
6. Use `common/` files as reference when implementing a specific layer (auth, DB, frontend, API, etc.).

Recommended reading order for any new session:
1. `AI_Onboarding_Guide.md` (entry point)
2. `Master_AI_Context.md` (complete context)
3. Relevant `common/` documents per phase
4. Relevant `Blueprints/` documents for templates

---

## Deployment

GitHub only — no CI, no build, no hosting. The repo is the deployment.

The docs are consumed directly from:
- Local clone at /home/sherif/sites/Engineering-Knowledge-Base
- GitHub: https://github.com/SherifAsh93/Engineering-Knowledge-Base

No Vercel project, no VPS process, no PM2 entry.

---

## Current Status

**Active / Maintained.** This is a living document repository that should be updated whenever a new architectural decision is made, a new reusable pattern is established, or a new project reveals a lesson that should be codified. As of 2026-07-24, the repo covers:

- 5+ production projects: zahrtelkhlig, Montelle Couture, Ahmed-Elakad, webistrydev, QOYA Furniture, mr-mohammed, olympia-club, elghaly-vr
- All major layers: auth, database, frontend, backend, API, deployment, design system
- Egyptian market specifics: Arabic RTL, EGP formatting, Egyptian payment methods, Egyptian cities

---

## Known Issues

- No README.md exists at the root — AI sessions should be told to read `AI_Onboarding_Guide.md` first.
- No changelog — hard to know what patterns were added recently without reading git log.

---

## Future Improvements

- Add a root README.md that points to `AI_Onboarding_Guide.md` as the starting point.
- Add Blueprints for booking system and VR/3D project types (only ecommerce, portfolio, admin CMS covered now).
- Add Egyptian-specific payment patterns (Vodafone Cash USSD flow, InstaPay QR) as `common/Egypt_Payments.md`.
- Add `Company/COMPANY_AUDIT.md` is already present — keep updated after new projects ship.

---

## Reusable Assets

This entire repository is a reusable asset. Key items most likely to be directly copy-pasted:

- **Prisma singleton** (`Master_AI_Context.md` → "Recurring Implementation Patterns") — identical across all Vercel-hosted projects
- **Guard pattern** — top of every admin API route
- **Triple-click admin nav** — all projects that hide the admin URL
- **Order creation with snapshot** — all ecommerce projects
- **Jose JWT auth stack** — all projects with auth
- **Zustand cart with persist** — all ecommerce projects
- **@theme block** (from `common/Frontend_Patterns.md`) — Tailwind v4 design tokens
- **Atomic write pattern** — flat-file CMS projects (Ahmed-Elakad)
- **GitHub CDN upload pattern** — all Vercel-hosted projects needing image uploads
- **Emergency Reference Card** (`AI_Onboarding_Guide.md`) — one-line snippets for the most common operations

---

## Lessons Learned

- **Centralizing patterns prevents drift.** Without this repo, each project reinvented auth, prisma setup, and cart logic differently. The knowledge base enforces consistency.
- **AI needs reading order, not just documents.** `AI_Onboarding_Guide.md` exists because dumping all docs at once leads to poor recall. A phased reading order significantly improves AI output quality.
- **Anti-pattern documentation is as valuable as positive patterns.** The "Things That Will Break If Done Wrong" table in `Master_AI_Context.md` prevents the most costly mistakes.
- **Egypt-specific requirements (RTL, EGP, COD, Egyptian cities) must be documented explicitly.** AI assistants assume international/English defaults without explicit guidance.
- **Snapshot denormalization is required for all order items.** Learned from zahrtelkhlig — storing only FKs causes historical orders to show wrong prices when products are edited.

---

## WebistryDev Metadata

- **Category:** Documentation / Knowledge-Base / Engineering Reference
- **Complexity:** Low (no code, no build system)
- **Template Candidate:** Yes — the structure (common/ + Blueprints/ + onboarding guide + master context) is reusable for any agency or developer building multiple similar projects
- **Priority:** Active — should be updated continuously as new projects reveal new patterns
- **Reusable Modules:**
  - AI_Onboarding_Guide.md (reading-order pattern)
  - Master_AI_Context.md (technology decisions + philosophy)
  - common/Authentication.md (Jose JWT pattern)
  - common/Database_Standards.md (Prisma singleton, reference schema)
  - common/Frontend_Patterns.md (Tailwind v4 tokens, cart drawer, product card)
  - common/Backend_Patterns.md (image upload, order snapshot)
  - Blueprints/project_init_checklist.md (phased setup checklist)
- **Similar Projects:** All Webistry Dev client projects reference this repo:
  - /home/sherif/sites/zahrtelkhlig (ecommerce, primary reference project)
  - /home/sherif/sites/Montelle (ecommerce, bridal)
  - /home/sherif/sites/Ahmed-Elakad (flat-file CMS)
  - /home/sherif/sites/webistrydev (portfolio, lead-gen)
  - /home/sherif/sites/Qoya Furniture (ecommerce)
  - /home/sherif/sites/mr-mohammed (Arabic teacher site)
  - /home/sherif/sites/olympia-club (beach club booking)
  - /home/sherif/sites/elghaly-vr (3D/VR tool — referenced but docs live in that repo)
