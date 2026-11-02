# Verification — 3 November 2026

Production build served at `http://127.0.0.1:3000/`; no deployment or push.
Desktop browser viewport requested 1440×645; mobile 390×844. Browser scrollbar
and device rounding are present in the original screenshot bytes.

| Check | Evidence / result |
| --- | --- |
| Production build, lint, types | `next build` completed; explicit lint had no warnings/errors; `tsc --noEmit` passed |
| Journey/contact tests | 20/20 pass after the final ring-approach path change |
| New equipment geometry | All ten desktop/mobile cases pass; `equipment-qa.json` |
| Actual avatar exports | Independent GLB decode audits passed for desktop and mobile; no likeness/pose certification |
| Six desktop stations | Saved in `after/01-entrance.png` through `06-contact.png`; inspected against reference and initial browser shots |
| Camera reversal | Chapter navigation exercised forward and back; deterministic reverse/continuity/root-surface sampling tests pass |
| Scroll stability | Arena scroll anchoring disabled; project modal open/close retains chapter 04 and scrollY 3718.4 in the desktop browser |
| Environmental animation | `paused-live-a.png` and `paused-live-b.png` differ while journey pause remains pressed; lights/haze keep their clock |
| Education | Desk education tab and header reader open Education & certifications with actual MBA/BBA/certifications |
| Projects | Desktop two displays; mobile single display; Next changes Wealth Pilot to Truly Grow and its supplied live URL; case-study dialog opens |
| Contact/social | Physical contact button opens named dialog with labelled name/email/message fields; email/GitHub/LinkedIn hrefs preserved |
| Audio | Enable changes to pressed Mute; muting restores Enable. No acoustic quality measurement claimed |
| Mobile | Lower-detail model/crowd scene reviewed; readable skills dialog saved in `mobile-skills-reader.png`; contact and entrance captures saved |
| Reduced motion | `?motion=reduce` sets the DOM reduced class; project chapter and pagination remain usable |
| Fallback | Explicit `?view=readable` path exposes all project/skills/contact controls; screenshot saved. Actual GPU context-loss injection not performed |
| Resume | No supplied resume asset found; no fake download added |

No live email was submitted. Contact-provider success/failure, missing config,
validation and rate limiting are covered by mocks; live Resend delivery and DNS
were not revalidated. Browser tests verify local functionality, not external
project availability. Real-device performance and final avatar deformation review
remain outstanding. Desktop console scoreboard is still cropped at its upper
edge and the venue remains visibly less detailed than the target.

Sandboxed Next lint initially misdetected existing dependencies and tried to
install them. That process was stopped; lint/build were rerun with the installed
dependencies outside the sandbox and passed. No dependency change was retained.
