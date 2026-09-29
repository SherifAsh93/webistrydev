# WebistryDev: inquiry conversion plan

## Goal and baseline — September 2026

Owner reports visitors but no inquiries, and wants clients in Egypt and abroad.
No visitor counts, ad spend, or reliable conversion rate were supplied, so changes
should be evaluated as experiments rather than promises of sales.

Working source: `/home/sherif/sites/webistrydev` on the VPS. Hosting: Vercel,
production domain `https://www.webistrydev.com`. Obtain approval before publishing.
The VPS was 38 commits behind the production-era GitHub main branch and has been
fast-forwarded to that existing source before editing.

## Confirmed conversion barriers

1. The homepage form's WhatsApp link used the QOYA showroom number, unlike the
   owner's WebistryDev number in the footer. Contact details are now centralized.
2. The homepage and `/lead` form rejected international phone numbers. This was
   reproduced in the live browser using a +971-format number. They now accept
   Egyptian mobile numbers and explicit international country codes, including
   Arabic digits; the server validates and normalizes them consistently.
3. The homepage and portfolio inquiry modal displayed success even after a failed
   database insert. They now require confirmed saving and preserve inputs on error.
4. A complete written idea was mandatory on the homepage, despite copy promising
   that only name/phone were needed. It is now optional, like the existing `/lead`
   form, making an initial conversation possible without preparing a brief.
5. The $499 badge conflicted with the $440 lower bound of the displayed starter
   package. The badge now derives its value from the existing pricing data.

Other additions: prominent WhatsApp entry points, a personal introduction, a
bilingual FAQ, phone autofill/accessible labels, and conditional Meta Contact
events for WhatsApp clicks. Successful submissions use Lead events; failed
submissions must not fire Lead. Selected project type is retained in the existing
database field. Package prices and payment terms have not been changed.

## Findings requiring owner decisions

- A clean public browser showed no active Meta Pixel or Google Analytics script.
  Existing Meta code supports `NEXT_PUBLIC_FB_PIXEL_ID`; configure it in Vercel
  after the owner provides the WebistryDev Pixel ID, then redeploy and use Meta
  Test Events. Do not reuse another client's Pixel ID.
- Clarify the 1-year maintenance promise versus package-specific 30/60/90-day
  support, the 24/7 support wording, and the ongoing first-three-clients discount.
  Publish only terms you can deliver consistently; these were not silently changed.
- The current Ahmed El Akad deployment link was verified publicly accessible.
  Its canonical domain returned HTTP 503 during this audit. Retain the working
  portfolio link until the canonical domain is fixed.
- Facebook rejected the public page fetch. Recent content, reach, audience quality,
  and campaign performance have not been audited. Request screenshots/export of
  the last 30 days in Meta Business Suite/Ads Manager before diagnosing traffic quality.

## Measure the path to an inquiry

Track separately:

- Landing-page visits by source/campaign and country.
- WhatsApp Contact clicks (an intent signal, not a confirmed conversation).
- Successfully saved form Leads.
- Qualified conversations, quotes sent, and paid projects (manual lead dashboard).

Use `utm_source=facebook&utm_medium=organic&utm_campaign=...` on post links.
For ads use `utm_medium=paid_social`, distinct campaign names, and the matching
offer/landing page. Do not infer sales from button clicks or page likes.

Weekly review: qualified inquiries / landing-page visits; cost / qualified inquiry
for paid campaigns; quotes / qualified inquiries; paid projects / quotes. Investigate
high exit/drop-off steps using actual data. There is no guaranteed conversion target.

## Focused two-week plan

### Days 1–2: Fix the contact path and prove it works

Publish the approved fixes, check the form from an Egyptian phone and an
international number, verify the saved inquiry in the admin, and confirm notification
delivery. Pin one clear offer post: who you help, a real example, and one CTA.
Use the website or WhatsApp link consistently on Facebook's contact button.

### Days 3–5: Show one business use case

Post a short QOYA walkthrough: mobile collection navigation, named albums, client
experiences, and easy inquiry. Explain what was built, not unmeasured increases in
sales. QOYA's furniture-customer reviews are not testimonials about WebistryDev.
Use another genuine case study for a different audience in a separate post.

### Days 6–7: Talk to relevant business owners

Contact a small, researched set of businesses that fit the demonstrated work.
Point out one specific opportunity in their current customer journey and share a
relevant example. Ask whether they want to discuss it; avoid generic bulk messages.
Ask previous clients for introductions and honest feedback about your work.

### Week 2: Repeat what produces conversations

Compare Arabic/Egypt and English/international messages separately. Publish a
short process/FAQ post and follow up on real inquiries. Test a capped paid campaign
only after the contact path and measurement are working. Set the budget with the
owner; use qualified inquiries and paid projects, not likes, to decide whether to scale.

Do not post only technical updates or finished screenshots: pair each example with
the customer's problem, the concrete workflow built, and a clear next step.

Ready-to-edit copy is in `facebook/conversion-posts.md`. It has not been posted.
