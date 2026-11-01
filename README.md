# TT Arena portfolio

This is an enhancement of the supplied Next.js App Router / Tailwind portfolio. Personal content, education, experience, social contacts, and valid E-Commerce/Game URLs are preserved. The original ZIP remains untouched.

## Run

```powershell
cd "C:\Users\Tanishq Tiwari\Downloads\inventory-saas-documentation\Tanishq-Portfolio"
npm ci
Copy-Item .env.example .env.local
# Fill server-only settings in .env.local, then:
npm run dev
```

Production: `npm run build`, then `npm start`. Tests: `npm test`.
If the machine's npm launcher is broken, substitute `node "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js"` for `npm`.

## Email and deployment

POST /api/contact validates bounded JSON, checks origin, limits requests, checks a honeypot, and calls the Resend API on the server. Emails include name, email, message and server UTC timestamp. The sender is your verified sender; visitor email is Reply-To. Errors are generic and no provider payload or secret is returned. The frontend disables duplicate submission and only shows success after the API confirms delivery acceptance.

1. Create a Resend API key and verify your sending domain in Resend.
2. Set RESEND_API_KEY (or legacy EMAIL_API_KEY), CONTACT_RECEIVER_EMAIL, CONTACT_FROM_EMAIL, and CONTACT_ALLOWED_ORIGIN (exact public origin, without trailing slash).
3. No Upstash/Redis setup is required. A best-effort in-memory limit allows five attempts per ten minutes per IP on each instance. Counters reset on restart and are not shared across Vercel instances.
4. Keep the honeypot, origin checks and input validation enabled.
5. CONTACT_TRUSTED_IP_HEADER must name an IP header your reverse proxy overwrites. On Vercel the code defaults to x-vercel-forwarded-for. An unset header applies a shared five-per-ten-minute limit; set a trustworthy header for per-visitor limits. Never trust visitor-supplied forwarding headers on a directly exposed server.
6. Deploy with the Next.js preset and this folder as the project root. Use server-only environment settings and redeploy. Static export / GitHub Pages cannot run this endpoint.
7. Send a real test after configuring credentials, confirm inbox receipt and Reply-To, and inspect provider delivery status. Local automated tests mock provider responses; they do not prove live delivery.

Secrets belong in .env.local or host settings, never NEXT_PUBLIC variables. All environment files are ignored except .env.example. The implementation uses the [Resend send-email API](https://resend.com/docs/api-reference/emails/send-email) and [Next.js Route Handlers](https://nextjs.org/docs/14/app/building-your-application/routing/route-handlers).

## TT Arena experience

The homepage is now a real-time React Three Fiber arena: entrance stage, ramp, ring, animated audience, mechanical project display and ringside consoles. One reversible journey controls the camera and development rig. Sound is muted until enabled. Portfolio details and the retained contact form are available through a keyboard-accessible reader.

See [docs/TT-ARENA.md](docs/TT-ARENA.md) for the implementation, asset status and verification. The previous visual design is retained in source and documented in DESIGN-NOTES.md; Project Pink remains the Git baseline tag.

The model is a deliberately faceless temporary rig, not a validated likeness of Tanishq. /avatar-review provides front, three-quarter and side views beside the supplied reference photographs. A photo-matched, textured and rigged final character plus authored stair/rope-entry clips are required for final avatar delivery.

Four project previews are captures of the user's live public sites. Data Scraper keeps a labelled identity visual because no screenshot or valid live URL is supplied. No resume file exists in the baseline, so no download was fabricated.

For reproducible checks, /?motion=reduce forces the simplified motion path and /?view=readable selects the WebGL-independent portfolio fallback. Normal reduced-motion settings are respected automatically.

## Projects and content

The five projects remain Data Scraper, Wealth Pilot, Truly Grow, E-Commerce Website and Game. Existing personal content, experience, education, contact details and working project links are preserved. Missing project links/stacks stay empty. Resume functionality is removed.

## Verification

There are 20 automated tests: 16 contact tests and four reversible-journey/grounding invariants. Run npm test, then npm run build. TypeScript is enabled incrementally through tsconfig.json; existing JSX remains supported. Deployment still requires server-only email settings above.

Current browser verification and dependency-release caveats are documented in docs/TT-ARENA.md. Historical Project Pink measurements are in DESIGN-NOTES.md. Local audit results are measurements of one environment, not a guarantee across devices.
