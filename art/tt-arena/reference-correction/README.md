# Reference correction pass — 3 November 2026

This supersedes the earlier six-view visual status, not the original Blender
source or garment QA. The target is the supplied six-panel TT Arena storyboard.
The result remains a real-time development scene, not a photorealistic match.

## Audit and implementation

Fresh browser captures in `before/` identified repeated giant crowd subjects,
thin equipment, a frozen intro stride, weak project supports, and vertical
console screens that obscured the venue. `after/` records the corrected browser
views. Both sets use the same desktop viewport; these are unretouched captures.

- Added five reusable native Three.js equipment assets: speaker cabinet with
  cones/grille/handles/rigging eyes, bolted box-truss screen mounts, sloped desk
  with control wings/faders/meters/ports, wheeled flight cases and a headset.
  Closed component geometry is batched by shared material. These additions were
  authored in web code, **not** newly modelled or exported from Blender.
- Replaced the old duplicated console geometry with one supported production
  desk. Skills, about, experience, education and contact remain semantic HTML.
- Changed project screens to full-width real website previews on desktop;
  retained case studies, pagination, supplied live/source links and mobile reader.
- Added a 12-subject anonymous crowd atlas, with alpha testing, instancing,
  mirrored cells, height/position variation and reduced mobile population.
- Added entrance tunnel depth and speaker arrays. Rebalanced terrace emission,
  concrete response, runway reflection and cloth environment response.
- Kept lower rising/fading haze and moving fixtures independent of journey pause.
  This is sprite haze plus soft beam meshes, not simulated volumetric smoke.
- Corrected the intro's held walking leg. Shortened the ring-approach camera
  distance and moved its root path together; reversible sampling is preserved.
- Physical HTML screens now use raycast occlusion instead of blending cutouts.
  It is centre-point visibility, not per-pixel DOM depth testing.
- Disabled page scroll anchoring for the arena and preserved scroll during
  project-modal focus changes, avoiding entrance resets during display mounting.

## Assets and tools

Verified executable: workspace-local Blender 5.2.3 LTS; Node 24.13.0. The installed
skills were read and used for stage-specific guidance. No additional tools were
required or installed in this pass. Existing Blender architecture and rig exports
remain in use; this pass does not claim new Blender sculpting or a new face.

Crowd asset was generated using the built-in image generation tool in default
mode, not the API/CLI. Generation brief: a transparent 4-column by 3-row atlas of
12 distinct anonymous adult South Asian arena spectators, full bodies with
separated silhouettes, varied casual clothes and cheering/clapping/phone poses,
neutral photographic lighting, no text, no owner likeness. Actual output was
1024×1536 RGBA. The original is `spectators-source.png`; the alpha-preserving
WebP derivative is `public/textures/spectators-atlas-v2.webp` (257,284 bytes).
Source tool output: `.codex/generated_images/01a10cee-fbbe-78f1-9d4a-bfbf9e8e0c93/exec-5c8ca7d6-f0b6-4d31-9250-499afd4e70e0.png`.
The generation brief above is a record of the intended asset, not a claim of
verbatim recovery of the complete tool prompt.

## QA scope

`equipment-qa.json` checks actual web geometry for all five assets in desktop and
mobile configurations: finite positions/normals, valid triangles and indices,
closed welded edge connectivity. All ten cases pass. This does not certify
component intersections, assembly load capacity, UVs, artistic quality or poses.
No UV-dependent texture is used by these equipment meshes.

Independent audits of both existing avatar GLBs pass: no invalid/degenerate
triangles, open/nonmanifold or inconsistent welded edges, or bad normalized
weights. Desktop: 58,464 triangles, 1,501,440 bytes. Mobile: 13,824 triangles,
533,940 bytes. Original Blender garment QA remains separate and unchanged.

## Remaining final-quality gates

- Owner likeness is not reconstructed: no validated anatomical head, skin maps,
  scalp or groom. The visible hooded avatar is a development asset. Hand anatomy,
  gait, greeting deformation and stair climbing still need final animation review.
- Near crowds are photographic billboard impostors, not detailed animated 3D
  people. Repetition, flatness and missing individual contact shadows remain.
- Upper venue density, roof detail, scoreboard framing, stage materials and
  lighting still differ from the reference. This pass is not exact fidelity.
- No resume file exists in the supplied public assets. Wealth Pilot and Truly
  Grow source repository URLs and a Data Scraper capture/source were not supplied;
  no fabricated downloads, screenshots or links were added.
- No physical mobile device or measured FPS/GPU benchmark has been completed.
  DPR, crowd counts, fixture counts, model LOD and bloom are reduced on mobile.
- Contact is checked through local validation/provider mocks; no live message
  was sent and production Resend/DNS settings were not changed.

See `verification.md` for browser observations and the final build checks.
