# TT Arena

TT Arena is the portfolio's continuous wrestling-arena journey. It uses the existing Next.js App Router, React 18, React Three Fiber 8, Drei 9 and Three.js 0.170 stack. The existing biography, experience, skills, five projects, social links and server-side contact endpoint remain the source of portfolio content. No professional wrestling career, project results or additional credentials are implied.

## Spatial design

The stage, ramp, ring, audience tiers, production equipment and displays share one world measured in metres. The entrance stage is at the negative end of the Z axis and the ring is centred around the origin. The camera starts facing the stage, turns toward the ring and follows the avatar along the ramp. Ringside positions become the project and production-console reading stations.

`lib/arena/journey.mjs` owns the shared journey sampling. Camera position, target, avatar position and chapter are derived from one bounded progress value. Reverse scrolling samples that same path rather than starting independent timelines. Ambient crowd and lighting activity is time-driven separately from the journey.

The visual language uses charcoal, crimson, brushed metal and white lighting. Physical displays have housings and supports; semantic HTML provides readable interactive portfolio content and a useful alternative when the visitor prefers a simpler presentation. The accessible reading mode is part of the experience, including on devices that cannot render WebGL.

## Main files

| File | Responsibility |
|---|---|
| `components/arena/ArenaExperience.tsx` | Entry coordinator, navigation, progress, pause, loading, reduced motion and error fallback |
| `components/arena/ArenaScene.tsx` | Stage LED content, mounted project display and production-console interactions |
| `components/arena/ArenaWorld.tsx` | WebGL canvas, camera, avatar, procedural stage, ramp, ring, crowd, trusses and lighting |
| `components/arena/ArenaReader.jsx` | Semantic portfolio content and existing contact form integration |
| `components/arena/useArenaAudio.ts` | Explicitly enabled original procedural arena sound |
| `components/arena/AvatarReview.tsx`, `app/avatar-review/page.tsx` | `/avatar-review` stand-in viewer, angle controls and supplied identity references |
| `lib/arena/journey.mjs` | Shared camera/avatar path and chapter positions |
| `scripts/build-arena-avatar.mjs` | Reproducible development avatar generator |
| `data/projectsData.js`, `data/skillsData.js` | Existing project and skills content |
| `lib/contact-handler.mjs` | Existing validated Resend contact delivery |

## Avatar status and required final asset

The supplied photographs are identity references. They are not a reconstructed head, rig or validated likeness. The development avatar is deliberately labelled as temporary. A generated character image, turntable render or photo shown in the interface must not be described as a completed textured and rigged avatar.

The procedural development asset provides a real skinned mesh, skeleton, embedded fabric texture and basic animation clips. Its simplified appearance and joint weights make it suitable for testing scale, path integration and playback, rather than representing a faithful portrait. The `/avatar-review` route offers front, three-quarter and side views of this stand-in beside the actual reference photographs. These are not previews of an approved face. Its walk, stairs and rope-entry choreography remain provisional: a production avatar requires animation cleanup and grounded foot placement in the actual arena.

To finish the likeness, provide or commission a web-ready GLB with:

- A head and hairstyle modelled against the supplied face references, without changing facial proportions or age.
- Front, three-quarter and side renders for the user's review before the model is locked.
- A textured body matching the supplied proportions and the requested black TT outfit.
- A complete compatible skeleton, skin weights and clean deformations.
- Entrance walk, turn, confident pose and idle clips; additional stair and rope-entry animation matched to the arena geometry.
- Metre-scale dimensions, grounded feet and documented forward/up axes.
- Optimized geometry and compressed textures, together with permission to publish the asset.

The available code workflow does not provide a validated photograph-to-likeness modelling service. Photo references cannot prove the missing side/rear head topology or produce a faithful face by themselves. The temporary asset must remain labelled until a model has been reviewed.

## Other assets and provenance

Arena architecture, fixtures, branding and crowd representations are procedural original geometry. The audience consists of efficient animated instanced silhouettes, rather than detailed scanned or individually rigged spectators. Light beams use restrained translucent geometry, rather than a physical volumetric renderer. These choices keep the development build manageable and are not claims of photorealism.

Procedural audio is an original synthesized, filtered noise bed and starts only after a visitor explicitly enables it. It evokes arena ambience; it is not an actual cheering-crowd recording. No commercial wrestling branding, entrance song or third-party crowd recording is required. More realistic licensed crowd loops and restrained spot effects can replace or supplement this bed after their licensing is established.

Reference photographs are user supplied. Portfolio screenshots, when available, are captures of the user's actual linked projects. Existing concept project artwork must remain labelled where a genuine screenshot is unavailable. A screenshot of a website demonstrates appearance; it does not validate its backend or establish project outcomes.

No resume file was present in the baseline portfolio, whose previous implementation intentionally removed resume functionality. A real resume PDF and its intended public URL are required before a resume download can be enabled. Do not substitute an invented CV or an empty download action.

## Accessibility and interaction

The visual scene is progressive enhancement for the same real portfolio content. Keep direct chapter navigation, a skip option, visible keyboard focus and a readable semantic presentation. Reduced-motion visitors should receive a simplified journey rather than compulsory camera travel. WebGL failure must leave the reading mode available.

Portfolio controls must remain real links and buttons. Use the existing project destinations, case studies and contact form. Do not display a successful contact submission until `/api/contact` confirms provider acceptance. Existing contact tests mock Resend and cannot establish inbox delivery in production.

Audio must remain muted until an explicit interaction. The persistent sound control must both enable and mute it. Returning from a hidden tab should not create a burst of delayed animation or audio events.

## Running and checking

From this directory:

```sh
npm ci
npm test
npm run lint
npm run build
npm start
```

Type checking: `npx tsc --noEmit`. The existing email setup and Vercel configuration remain described in `README.md`; secrets belong only in server-side environment settings.

Automated tests validate path invariants and the existing contact handler. Browser verification is still required for camera composition, foreground clipping, reverse scrolling, physical display readability, focus handling, sound controls, responsive layouts and WebGL failure. A passing build does not prove a faithful avatar, flawless foot placement, 60 fps on every device or live email delivery. Performance targets are goals until measured on the final production build.

## Dependency audit

An `npm audit --json` check on 2026-11-01 reported 23 vulnerable dependency records in the inherited dependency tree: one critical, five high and 17 moderate. This audit does not by itself establish that every advisory can be exploited through this site's configured routes.

The direct production dependency `next@14.2.35` is the critical record. Its listed advisories include Windows-hosted server remote code execution ([GHSA-p293-qw3h-jr36](https://github.com/advisories/GHSA-p293-qw3h-jr36)), AVIF Image Optimization remote code execution ([GHSA-2xp9-vwfh-vxw4](https://github.com/advisories/GHSA-2xp9-vwfh-vxw4)) and SVG Image Optimization remote code execution ([GHSA-2464-fhr4-w9xw](https://github.com/advisories/GHSA-2464-fhr4-w9xw)). Other records include Next's nested PostCSS and the ESLint development toolchain.

No automatic major-version upgrade was applied as part of the arena design. The audit's suggested Next.js fix is a major release, so dependency remediation requires a separate compatibility check and regression run. Before production release, re-run the audit and move to a maintained patched Next.js version compatible with React and the existing contact endpoint. Preserve Project Pink separately while doing that migration. Do not interpret successful lint/build output as a clean dependency audit.

## Project Pink recovery

The previous portfolio is the user's named **Project Pink** baseline, identified in the workspace's `PROJECT-PINK.md`. Preserve that reference and its Git tag. TT Arena changes should not move the Project Pink tag or erase the prior version.
## Final implementation checks

- Production build, TypeScript and Next lint passed; initial homepage JavaScript is 94.4 kB, with the real-time arena deferred separately.
- All 20 automated tests passed: 16 contact tests and four journey invariants, including 10,000 continuity samples.
- Browser checks covered the entrance, stage-to-ring transition, forward/reverse chapter selection, physically mounted project screen, Wealth Pilot live URL, project pagination, case-study focus/Escape restoration, skills reader and contact-reader access.
- Contact integration test through the retained form returned HTTP 200 from the local API (provider acceptance, not independently confirmed inbox receipt).
- Sound enable and mute toggled the actual Web Audio context through explicit interaction. Audio is an original synthesized ambience bed, not recorded crowd cheers.
- 390px mobile: no horizontal overflow; stage lens widens without dollying through the ring; direct current-display reader is available. Mobile buttons have 44px targets. This does not establish a consistent frame rate on every mobile GPU.
- `/?motion=reduce` verified the simplified path state. `/?view=readable` verified all-content fallback with zero WebGL canvases. The actual OS reduced-motion setting was not changed during testing.
- Real public-site screenshots were captured from Wealth Pilot, Truly Grow, E-Commerce and Game, without logging in or submitting their forms. The Game site's current appearance differs from its older preserved portfolio description; its implementation has not been independently audited.
- Project Pink remains tagged at bc5bba8. TT Arena is developed separately on codex/tt-arena. The reference storyboard is a design guide only; it is not rendered as the scene background.

## Honest visual-delivery boundary

This is a working procedural 3D implementation, not a photorealistic reproduction of the storyboard. The audience uses simplified instanced people, stage haze uses sprites, and the scene currently uses one active project display on mechanical rails. An identity-reviewed final facial model, production stair/rope choreography and higher-detail crowd assets are still required for the requested final cinematic fidelity. No final avatar approval or exact likeness is claimed. The inherited Next.js dependency findings above must be addressed before calling this a production-ready release.

## Portfolio display refinement
Desktop project station now uses two suspended displays showing adjacent real projects. Mobile presents a single display. The physical production console includes About, Skills, Experience and Education controls, with independent readable Education and Experience dialogs. The arena menu exposes these details directly. The overhead scoreboard has a metal octagonal body, four branded faces and illuminated trim. These remain procedural assets; the supplied photographic storyboard and exact facial likeness are not reproduced.

## Six-scene visual revision
Journey navigation now follows Entrance, Intro Reveal, Walk to the Ring, Explore Projects, About & Skills, and Connect. Added a batched steel lattice roof/stage rig and crowd barriers, multi-row denser instanced audiences (4,200 desktop / 900 mobile), brighter venue fill, stronger stage haze, reflective ramp material, industrial screen bezels and console equipment. Fixed unused lighting instances being drawn at the world origin. The scene remains real-time geometry and interactive physical displays; the reference image is not used as a backdrop. Exact photorealistic reconstruction and facial likeness remain incomplete.

## Material and spectator detail pass
Arena metal housings share deterministic 512px brushed-grain, roughness and bump textures. Generic spectators now use shaped torsos, ears, noses, hair and eyes; they are not scans or the owner's likeness. Entrance and ramp cameras are lower to emphasize the runway and human-scale scene. Exact photorealism remains unverified and the personal avatar remains a development rig.
