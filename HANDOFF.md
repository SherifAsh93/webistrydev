# WebistryDev hosting — 9 October 2026

## Current state

- Owner requested completion of the VPS hosting cutover. Source: `/home/sherif/sites/webistrydev`; existing uncommitted source changes preserved.
- Fresh production build passed with Next.js 16.1.0 and TypeScript. PM2 `webistrydev` (id 26) runs `node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 3001`. Process list saved with `pm2 save`; `pm2-sherif` active.
- Existing nginx domain block proxies to port 3001. The earlier 502 is fixed: direct runtime and nginx-routed homepage/Admin return 200.
- **Public cutover is NOT complete:** authoritative nameservers are `aurora.dns-parking.com` / `nebula.dns-parking.com` (Hostinger). Apex A remains `216.198.79.1`; www remains CNAME `cname.vercel-dns.com`. Public traffic still reaches Vercel.
- Vercel CLI is authenticated, but it does not manage this domain's authoritative DNS. No Hostinger token was available in process environment and no Hostinger cookies were found in either saved Chrome profile.
- Follow-up login attempt using the saved Chrome profile reached Google sign-in but did not authenticate. Hostinger subsequently remained on Cloudflare's "Just a moment" verification page after waiting. No password was stored in scripts/docs, no DNS records changed. Owner must complete browser authentication or supply DNS API access securely.
- Local `/etc/letsencrypt/live/webistrydev.com` certificate expired 15 September 2026. Certbot renewal failed 8 October 14:16 UTC because HTTP-01 requests reached Vercel and received 404. Current public Vercel certificates remain valid. Do not claim VPS HTTPS is valid: local nginx tests bypassed certificate verification.

## Verification performed

- Server/nginx/PM2 pre/post checks passed: disk 75%, about 25 GB free, low load. Runtime has no observed restart after start.
- Existing Neon connection: read-only SELECT against both leads and messages passed. No database writes/schema changes.
- Admin login, dashboard load and read-only New filtering passed in Chromium, no page errors. No inquiry/message/content saves or notification test sends.
- Telegram getMe passed. Resend key is configured; domain-list request returned `restricted_api_key` (send-only key), so delivery was not tested.
- Homepage browser checks at 320x740, 390x844 and 1440x900: no horizontal overflow or page errors. Scrolled 390/1440 screenshots inspected; all seven portfolio images loaded there. Initial 320 image sampling caught four of seven loaded; narrow screenshot is not full media-load sign-off.
- Evidence/scripts in `/tmp/opencode/webistrydev-*.png` and `/tmp/opencode/webistrydev-{verify,browser}.cjs` (temporary, not durable).

## Blocked next steps

1. Obtain Hostinger DNS access, or owner changes only these records in the authoritative DNS zone: apex `@` A -> `76.13.42.219`; www CNAME -> `webistrydev.com`. Replace conflicting web A/AAAA/CNAME records, preserve MX/TXT and unrelated records. Lower TTL if possible.
   - Safer with DNS access: issue the replacement certificate using DNS-01 TXT verification before switching A/CNAME records, configure persistent automated renewal, and verify the VPS certificate first. The earlier claim that renewal cannot happen before the traffic switch applies only to the existing HTTP-01 setup, not DNS-01.
2. Confirm both names resolve to VPS at authoritative and public resolvers. Renew only this certificate: `sudo certbot renew --cert-name webistrydev.com --nginx`. Check actual served SANs/expiry and HTTPS without insecure bypass.
3. Verify public homepage/Admin/static media and existing read-only database workflow. Then retire the old Vercel application deployment as authorized, preserving source and recovery material; do not disable DNS or other projects.

No public DNS changes, certificate renewal or Vercel retirement were performed because the authoritative DNS access is missing. No Git commit or content edits.
