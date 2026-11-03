# TT Arena reconstruction — 2026-11-03

This is a structural improvement pass, not acceptance of a photorealistic final result.

## Implemented

- Replaced the open red-line seating impression with three closed, stepped elliptical balcony bowls, proper fascia, columns and rails. Spectator positions follow the same metre-scale tier definition.
- Added radial roof girders, cross bridges, service cabinets and a four-face scoreboard. Removed the old scoreboard and replaced the relevant old bowl triangles in the website.
- Moved the production-desk camera closer. Lowered the new scoreboard after checking its browser framing.
- Preserved the continuous arena, mounted project displays, semantic portfolio sections and contact endpoint. Reduced-motion chapters snap directly to their fixed camera view.
- Moved stationary crowd sway to a vertex shader. The audience still uses twelve anonymous alpha-card subjects; it is not a finished 3D crowd.
- Corrected the overly dense initial smoke in reduced-motion mode. The effect remains animated layered sprites, not a fluid volume simulation.

## Tools and asset QA

Blender 5.2.3 LTS and Rigify availability were checked, independently of skill installation. The environment reports a GTX 1650 but no selected Cycles GPU backend; that is not a certified GPU render test.

The new editable source is `venue/tt-venue-kit.blend`. Its web export is `public/models/tt-venue-kit-web.glb`: **94,084 triangles, 8 materials, 3,107,636 bytes**, lossless meshopt compression. Source geometry is generated from `lib/arena/venueDesign.mjs` via explicit mesh arrays. Packed roughness maps are task-authored.

The sealed Blender CLI plan records the reviewed API passages and actual build-script hash. Mandatory Blender QA passes with no errors. Warnings remain for intentional stacked roughness UVs, shared construction contacts, near-coincident tube junction vertices, and structural foundations extending below the floor. These UVs are not a unique bake atlas. Workbench random/wire views review the seating and scoreboard. The independent decoded GLB audit reports zero invalid/degenerate triangles, boundary/nonmanifold/inconsistent edges or inverted islands. These checks do not certify visual fidelity.

## Still unfinished

- Avatar: the existing development garment remains visible and explicitly marked **likeness pending**. It is not a finished sculpt, face, groom, outfit or deformation-certified character. No claim of using all character skills to finish it is made.
- An official MakeHuman CC0 anatomical base, skeleton, weights and morphology data were downloaded at commit `a8bc2d54ff0ac92e78ff71431b1023eda42bf482` for a replacement. They are under `vendor/` with the original licenses. They have **not** been integrated or passed character QA. No downloaded program code was executed.
- A validated owner likeness needs a fitted/sculpted head and pose/lighting review; the supplied photographs are references, not a ready rigged likeness asset.
- Near spectators need actual anatomical 3D models and varied poses. Current repeated cards and raised-arm silhouettes still look artificial.
- Stage screen artwork, ramp surface breakup, low fog scattering, lighting contrast and roof detail still differ visibly from the reference. The source image is not a website backdrop or implementation evidence.
- Mobile performance and motion quality are not certified by a desktop screenshot. Diagnostic samples are short and environment-specific, not device benchmarks.
- No resume asset was supplied. Missing project source URLs and Data Scraper screenshots/URLs were not invented.

## Validation

Production build succeeds, including lint and TypeScript checks. Existing tests: **20/20 pass** (journey reversibility/continuity and mocked contact validation/provider behavior). No live mail was sent and no secret values were printed.

`before/` and `after/` contain actual browser captures at the six chapter checkpoints. Reduced motion is used to compare fixed framing. Animated light/smoke behavior must be reviewed separately with normal motion enabled.

| Checkpoint | Verified change | Remaining visible mismatch |
| --- | --- | --- |
| Entrance | Structural roof and populated stepped balconies frame the stage | Ramp is too flat/matte; portal too uniform; character silhouette is primitive |
| Intro | Shared stage/crowd structure remains coherent from the low oblique camera | Reference has richer smoke scattering, varied spectators and realistic greeting posture |
| Walk | Scoreboard face is in view; tiers have proper stepped surfaces | Needs a longer reflective walk surface, tighter rear character framing and detailed avatar |
| Projects | Suspended screens and scoreboard remain readable together | Reference has bulkier mechanical housings, more overhead detail and richer material wear |
| Skills | Console occupies more of the foreground; scoreboard no longer cropped | Console still lacks the reference's close textured metal framing and off-axis viewpoint |
| Contact | Contact buttons remain on the physical desk, with full form access | Same remaining equipment/material/lighting limitations as skills |

Mobile checked at 390 × 844: skills reader and contact form open with their full content; resizing now repopulates crowd instance matrices. The physical desk text is small, so the existing readable overlay remains necessary. No real mobile hardware FPS claim is made.

Normal-motion production diagnostic at 1440 × 645 returned a short sample near **16 FPS, median 62.5 ms, p95 73.4 ms, 415 draw calls and 755,611 triangles including extra passes**. Earlier in this pass the sample was about 17–19 FPS and 438–440 calls. The samples are not controlled benchmarks; no speedup is claimed. Performance is still below acceptance. `performance-sample.txt` and `normal-motion-metrics.png` retain the later actual observation.

No deployment or Git push is part of this pass.
