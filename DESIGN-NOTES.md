# Cinematic portfolio frontend

The updated visual system keeps Tanishq's existing content and contact endpoint. Violet establishes the main accent, cyan gives the 3D object depth, and champagne is reserved for small project numbers and details. Space Grotesk provides the display type; Inter handles readable body copy. Both are self-hosted through Fontsource.

## Files and responsibilities

- `styles/theme.css`: dark and light semantic color tokens. All design colors derive from these variables.
- `app/globals.css`: responsive layouts, glass surfaces, intro, cursor and interaction styles.
- `components/Hero.jsx`: editorial headline, immediate name/role, clear project/contact actions.
- `components/ThreeBackground.jsx`: delayed client loading, reduced-motion fallback, WebGL error boundary.
- `components/Hero3D.tsx`: real-time R3F sculpture, Three.js physical material, procedural Drei studio reflections, particles, pointer/scroll interpolation and adaptive mobile geometry.
- `components/ThemeToggle.tsx`: persistent theme preference. The small layout bootstrap sets the stored theme before paint.
- `components/Intro.tsx`: brief session-only intro with a time counter. It never locks scrolling, never waits for remote assets, and is skipped on mobile and for reduced motion.
- `components/ScrollExperience.jsx`: responsive lazy-loading gate; mobile and reduced motion retain native scrolling.
- `components/DesktopMotion.jsx`: GSAP ScrollTrigger reveals, timeline drawing, progress bar, original project counter, magnetic actions, Lenis anchors and modal scroll coordination.
- `components/CustomCursor.tsx`: desktop fine-pointer dot/ring; native cursor returns with keyboard navigation, pointer exit or reduced motion.
- `components/ProjectArtwork.jsx`: original illustrative artwork drawn in HTML/CSS. These are labeled concept visuals, not screenshots of the products.
- `components/ProjectCard.jsx`: bounded tilt and pointer-position shine. Desktop cards stack with CSS sticky positioning; mobile stays in normal document flow.
- `components/ProjectModal.jsx`: large case-study dialog animated with Motion, keyboard trap, Escape close, restored focus and native nested scrolling.
- `components/LocalTime.tsx`: live Kanpur clock, updated every 30 seconds.
- `tsconfig.json`: incremental TypeScript adoption with existing JSX content preserved.

## Animation ownership

GSAP manages scroll-linked DOM motion and Lenis updates. React Three Fiber owns the scene loop; frame values use refs, not React state. CSS owns short decorative transitions. Motion owns the modal entrance only, so the same property is not driven by several libraries. MatchMedia reverts GSAP motion when reduced motion changes. R3F is not loaded for reduced motion; hidden tabs pause rendering. Mobile widths, low-core devices and data-saving connections use the CSS fallback to avoid WebGL shader startup. Desktop rendering uses capped DPR, limited geometry and deferred loading. The scene also contains a lower-quality configuration for runtime resizing.

There is one page route, so no artificial route transition was introduced. Full-screen project detail is opened deliberately by the case-study button; hover alone does not interrupt reading or keyboard navigation.

## Content integrity

The showcase remains Data Scraper, Wealth Pilot, Truly Grow, E-Commerce Website, Game. No clients, quotes, awards, revenue or experience years were added. The existing 15+ project count is retained and animated. No testimonial section was added because no real testimonials were supplied. Original education, qualifications, contact details and project capabilities remain intact.

## Setup

```powershell
npm ci
npm run dev
npm run build
npm start
npm test
```

Use Node 20 or newer. Keep email settings in `.env.local` or your deployment environment. The API, validation and rate-limiting code are unchanged by this visual redesign. See README.md for verified sender and Vercel setup.

## Assets and libraries

No models, portrait photos, audio or textures need to be downloaded. The sculpture and lighting are procedural. Fonts are bundled from the open-source Fontsource packages (Space Grotesk and Inter, SIL Open Font License). New runtime packages: Three.js, React Three Fiber, Drei, GSAP, Lenis, Framer Motion and two Fontsource packages. TypeScript and Three.js typings are development dependencies.

References: https://r3f.docs.pmnd.rs/api/canvas, https://gsap.com/docs/v3/GSAP/gsap.matchMedia(), https://github.com/darkroomengineering/lenis, https://fontsource.org/fonts/space-grotesk, https://fontsource.org/fonts/inter.

## Further polish

Replace the labeled concept artwork with real optimized screenshots or short muted product captures when available. Add authenticated testimonial quotes only with permission. Add the missing Wealth Pilot and Truly Grow URLs/stacks once supplied. Audit the deployed site again on real mobile hardware after deployment; local scores are not a guarantee for all devices or networks.

## Verification (2026-10-10)

- Production build and TypeScript validation passed; homepage first-load JavaScript is 101 kB (down from 194 kB in the first redesign build).
- All 16 contact handler tests passed in the publishing checkout.
- Browser checks: desktop dark/light themes, persisted theme after reload, 390px mobile layout without horizontal overflow, mobile navigation, Wealth Pilot case study, initial close-button focus, Escape close and restored trigger focus. Desktop console showed no errors.
- Lighthouse 13.5.0, local production server, simulated mobile throttling, headless Chrome with GPU disabled: Performance 77, Accessibility 100, Best Practices 100, SEO 100. LCP 2.5s, TBT 830ms, CLS 0. The requested 90+ performance target is not yet met. Desktop performance and reduced-motion browser emulation were not measured.
- The remaining performance work is main-thread startup on the throttled mobile audit. Re-test on deployed infrastructure and real hardware before claiming 90+ or a universal frame rate.
- No fabricated testimonials or project screenshots were added. Case-study dialogs use explicit activation rather than opening automatically on hover.

## Contact update
Upstash is no longer required. RESEND_API_KEY and legacy EMAIL_API_KEY are supported. Rate limiting is best-effort per instance; Vercel instances do not share counters. Sender and recipient environment variables remain required.
