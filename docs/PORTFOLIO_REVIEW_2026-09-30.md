# Portfolio update review — September 30, 2026

## Scope and cause

Sherif reported that WebistryDev was appearing as a project on its own portfolio.
Reviewed production and the latest commit, `1cb6891` (September 29).
The redesign switched from curated project IDs to every non-flagship record in
`lib/projects-data.json`, exposing an existing `category: self` record.

## Corrections

- Removed the WebistryDev project record and its AR/EN project descriptions.
  The portfolio now contains seven selected projects. QOYA and Ahmed El Akad
  remain first. The overall 11+ projects-delivered claim is not a count of the
  selected public portfolio cards.
- Localized the newly introduced business-feature chips and their accessible label.
- Corrected the new personal introduction to describe Sherif as a full-stack developer.
- Made project actions at least 44px high and stacked them on phones/tablets.
- Fixed an existing Arabic hydration mismatch in `lib/language-context.tsx`:
  the hydration render matches server English, then applies the saved/browser
  language. Language switching remains persistent and updates RTL/LTR.
- Kept the compact navigation menu through tablet widths; full navigation begins
  at 1024px so the desktop quote button and links do not wrap into narrow columns.
- Added the standing developer credit and reserved footer space for floating controls.

## Portfolio rules for future edits

`lib/data.ts` imports `lib/projects-data.json`; this is the active project source.
Do not list WebistryDev as a client project on its own site, re-add the removed
self record, or restore it just to fill the final grid row. Only include deliberately
selected work, and localize business-facing feature labels for Arabic.
Do not infer measurable client results from the existence of a feature.

## Verification and publishing

- Production build, TypeScript build checks, targeted ESLint and `git diff --check`.
- Chromium screenshots and interaction checks in AR/EN at 320, 390, 768, 1024,
  and 1440px widths (900px viewport height).
- Verify seven unique cards, no self-project link, no horizontal page overflow,
  no uncaught browser errors, project modal reference, Escape dismissal, compact
  navigation, language switching, and an unobscured linked footer credit.
- Homepage phone validation and simulated failed submissions in both languages;
  requests are intercepted so these tests do not create production leads or send
  notifications. Successful database saves/notification delivery are not re-tested.
- All seven project destinations returned HTTP 200 during this review.
- Browser verification script/artifacts: `/tmp/wd-review-browser.cjs`,
  `/tmp/wd-review-before/`, `/tmp/wd-review-after/` (temporary).

The owner approved publishing on September 30, 2026. Published directly from
`/home/sherif/sites/webistrydev` using the linked Vercel project's `deploy --prod --yes`.
Production: https://www.webistrydev.com/
Deployment: https://webistrydev-gw0ipoyd3-sherifs-projects-75c57a99.vercel.app
Vercel deployment ID: `GTgwx5dQLZKqBsNwjyYbze9f5F3H`.

The Vercel production build passed and the custom domain was aliased successfully.
Repeated the full AR/EN browser checks on the public production domain at all five
widths above: seven unique projects, no self-link, no horizontal overflow, and no
uncaught browser errors. Navigation, language switching, modal dismissal, validation,
simulated form failures and the unobscured footer credit passed. Inspected production
mobile/desktop portfolio and footer screenshots. `/tmp/wd-review-after/` now contains
the production verification results.

Hosting is Vercel; old PM2 deployment instructions in July documents are historical.
No commit or push has been made. The deployed corrections remain uncommitted in
the VPS working tree; preserve them when synchronizing future Git-based deployments.

Existing commercial-copy questions (maintenance versus package support durations,
24/7 wording and recurring discount) remain recorded in the conversion action plan.
