# WebistryDev ??? Agent Rules

Project: WebistryDev personal site ?? Next.js 16 ?? React 19 ?? Tailwind v4 ?? Neon PostgreSQL ?? Drizzle
Live: https://www.webistrydev.com (Vercel, auto-deploy from `main`)

## Branch rule (non-negotiable)

- The only valid branch is `main`.
- Before any change: `git checkout main`, then confirm `git branch --show-current` prints `main`.
- If `main` is missing or the repo is in a detached state, stop and ask. Do not force, stash, or reset.

## Source of truth

- This repository is the source of truth for the site.
- Deployment is Vercel: pushing to `main` triggers a production build.
- There is no separate server to update for the public site.

## Before committing

1. Show `git status` and `git diff` (plus `git diff --staged`) to the user.
2. Wait for explicit approval.
3. Re-confirm the branch is `main` immediately before pushing.

Never use `git commit -a`. Stage exact files only.

## Hard stops

- Never `git push --force`, `git reset --hard`, or delete branches without explicit approval.
- Never commit secrets, tokens, or the contents of `.env*` files.
- Never run `pm2 restart all` on any host.
- Never claim a change is done without a passing build or type check.

## Copy and content

- All user-facing copy is bilingual. Update both `ar` and `en` in `lib/translations.ts`.
- Pricing, service descriptions, and hero copy live in that file, not inside components.

## Structure

- `app/` ??? App Router routes, server actions (`app/actions/`), admin area
- `components/` ??? Hero, Portfolio, Pricing, Services, HowItWorks, StartProject, Footer, navigation
- `lib/` ??? `translations.ts` (all copy), `data.ts`, `language-context.tsx`, `projects.ts`
- `db/` ??? Drizzle schema and client
- `Projects/` ??? separate client projects tracked in this repository

## Quality gates

- `npm run build` must pass before pushing.
- Keep changes minimal and consistent with the surrounding style.
