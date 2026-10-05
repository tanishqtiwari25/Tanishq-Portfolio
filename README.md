# Portfolio enhancement

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
2. Set EMAIL_API_KEY, CONTACT_RECEIVER_EMAIL, CONTACT_FROM_EMAIL, and CONTACT_ALLOWED_ORIGIN (exact public origin, without trailing slash).
3. Single persistent Node process: CONTACT_RATE_LIMIT_MODE=single-instance. Memory limiting resets on process restart.
4. Serverless / multiple instances: leave CONTACT_RATE_LIMIT_MODE unset and configure UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN. Production fails closed without a configured limiter. Redis counters use a ten-minute expiry.
5. CONTACT_TRUSTED_IP_HEADER must name an IP header your reverse proxy overwrites. On Vercel use x-vercel-forwarded-for. An unset header applies a shared five-per-ten-minute limit; set a trustworthy header for per-visitor limits. Never trust visitor-supplied forwarding headers on a directly exposed server.
6. Deploy with the Next.js preset and this folder as the project root. Use server-only environment settings and redeploy. Static export / GitHub Pages cannot run this endpoint.
7. Send a real test after configuring credentials, confirm inbox receipt and Reply-To, and inspect provider delivery status. Local automated tests mock provider responses; they do not prove live delivery.

Secrets belong in .env.local or host settings, never NEXT_PUBLIC variables. All environment files are ignored except .env.example. The implementation uses the [Resend send-email API](https://resend.com/docs/api-reference/emails/send-email) and [Next.js Route Handlers](https://nextjs.org/docs/14/app/building-your-application/routing/route-handlers).

## Design and motion

Edit styles/theme.css to change all semantic UI colors. Values are space-separated RGB channels, for example `--color-primary: 120 180 240`. Tailwind colors consume these variables with alpha support. Gradients and Canvas geometry also use these tokens.

ThreeBackground.jsx projects torus coordinates from 3D onto a Canvas. Its fixed background smoothly interpolates scroll progress into position, rotation, and opacity. It uses capped pixel density, fewer mobile rings, mobile frame throttling, and pauses in hidden tabs. Reduced motion presents a static object. No 3D/animation dependencies were added.

ScrollExperience.jsx uses IntersectionObserver and CSS transforms for section/card reveals. Hero and navbar use staggered CSS reveals; project tilt is bounded to four degrees and only enabled for fine hover with full motion. Native smooth anchor scrolling preserves browser behavior. The normal browser cursor is retained.

## Projects and content

Exactly five showcase entries: Data Scraper, Montra Money Manager, Truly Grow, E-Commerce Website, Game. Old chatbot/agency entries and extra CRM showcase removed. No project screenshots were supplied; abstract typography/geometry visuals are intentionally illustrative, not fabricated screenshots. Montra and Truly Grow use only the supplied descriptions and capabilities. Their technologies and links remain empty because none were supplied. Existing scraper placeholder URL removed. Resume UI and its public PDF removed.

## Files

Created: styles/theme.css; components/ThreeBackground.jsx; components/ScrollExperience.jsx; app/api/contact/route.js; lib/contact-validation.mjs; lib/contact-handler.mjs; tests/contact.test.mjs; .env.example; README.md.
Modified: app/globals.css, app/layout.jsx, app/page.jsx; tailwind.config.js; data/projectsData.js; components/Hero.jsx, Navbar.jsx, Projects.jsx, ProjectCard.jsx, ProjectModal.jsx, Contact.jsx; package.json, package-lock.json, .gitignore. Decorative utility colors in Experience, EducationCertifications were mapped to theme tokens. About, Skills, GitHubStats and Footer remain functionally preserved.
Dependency change: Next.js upgraded from 14.1.0 to patched 14.2.35; no new libraries.

## Remaining configuration

Real inbox delivery requires the above credentials. Montra and Truly Grow stacks, screenshots, and real URLs can be added to data/projectsData.js once available. Performance claims are not benchmarked; there is no guarantee of 60fps on every device. Original project capability descriptions are retained from the portfolio, rather than independently verified against their separate repositories.

## Verification results

- Production build: passed on Next.js 14.2.35. Home first-load JavaScript: 99.7 kB reported by Next.js (not a runtime performance benchmark).
- Contact automated tests: 16 passed, including validation, malformed/oversized payload, origin rejection, missing config, provider/network failure, honeypot, success envelope, verified From / Reply-To / timestamp, repeated-request limits, and shared Redis limit.
- Browser: correct 01–05 project order; Montra modal opens with focus and closes by Escape; desktop console clean before intentional failed contact request; mobile menu opens, closes after anchor selection; 390px mobile viewport shows no horizontal overflow; unconfigured contact correctly shows error and returns to enabled state.
- Search: portfolio source contains no Resume/CV functionality, old showcase names, or custom cursor styling.
- Build emitted nonfatal webpack cache snapshot warnings in this nested workspace; compilation, type checks, prerendering, and trace generation passed.
- Not verified: real inbox delivery (no provider credentials), independent capability audits of separate projects, performance benchmarks, every device/browser, and reduced-motion behavior by browser emulation (CSS/Canvas paths implemented).

Local email test: Resend accepted a live test email. The local sender was updated to contact@mail.realtanishqtiwari.in after the domain was verified. Configure your verified sender in host environment settings when deploying. Secrets stay only in ignored .env.local files.
