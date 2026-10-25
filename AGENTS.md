# WebistryDev ??? Agent Rules

Project: WebistryDev personal site ?? Next.js 16 ?? React 19 ?? Tailwind v4 ?? Neon PostgreSQL ?? Drizzle
Live: https://www.webistrydev.com (Vercel, auto-deploy from `main`)

## Branch rule (non-negotiable)

- The only valid branch is `main`.
- `master` is archive-only. Never edit, commit, or push on it.

## Worktree rule (non-negotiable)

- Every WebistryDev task MUST run in a fresh, clean worktree of `main`:
  1. `git fetch origin`
  2. `git worktree add --detach /home/sherif/tmp/<task> origin/main`
  3. Do all work inside `/home/sherif/tmp/<task>`
- Before editing, confirm the worktree is clean (`git status --short` is empty) and points at current `origin/main`.
- When the task is done: `git worktree remove /home/sherif/tmp/<task>`.
- The workspace at `/home/sherif/workspaces/WebistryDev` is a **permanent archive** on `master` with hundreds of uncommitted changes. Never edit, stash, reset, or switch branches there. Read it if useful; change nothing.
- If a clean worktree cannot be created, stop and ask. Do not force, stash, or reset.

## Before committing

1. Show `git status` and `git diff` (plus `git diff --staged`) to the user.
2. Wait for explicit approval.
3. Re-confirm the worktree is based on `main` and the push target is `main` immediately before pushing.

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
