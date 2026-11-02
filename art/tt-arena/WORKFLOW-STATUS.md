# TT Arena coordinated workflow — 2026-11-02

## Verified environment

Blender 5.2.3 LTS (e13b728c6880) is present in the workspace-local portable runtime.
Node 24.13.0 is available. The requested skills are installed; installing a skill
was not treated as installing its executable. No additional skill installation
was necessary. No GPU render or mobile FPS benchmark is claimed.

## Dependency stages and actual status

| Stage / applied skill instructions | Current result | Remaining gate |
| --- | --- | --- |
| Architecture planning, core, scene setup | Existing metre-scale arena inspected; six continuous camera stations and physical portfolio displays revised | Full arena collection/origin/path hygiene audit and fresh architecture QA |
| Hard surface, environment kits | Existing Blender stage, trusses, ramp, barriers, terraces and ring retained; central console housing extracted from the batched architecture | More detailed venue equipment, believable structural proportions and varied crowd assets |
| PBR, texturing, lighting/lookdev | Shared metal grain/roughness, reflective runway, one environment-lighting system, animated spotlights and rising/fading smoke plumes | Physical wear and light balance still differ substantially from the reference; smoke is sprite based, not a fluid volume |
| Sculpting, clothing, hair | Hood taper/crown, shoulder width, garment folds, cap clearance and raised logo refined without changing source topology | No validated anatomical head, scalp UVs, face likeness, skin texture or hair/beard groom; those stages are not finished |
| Rigging, animation | 13-bone rig and four clips preserved; intro greeting layered onto the web rig; reversible root journey retained | Final gait, hand anatomy, shoulder deformation, stair climb and rope entry stress review |
| Optimization, export, asset QA | Desktop 58,464-triangle lossless Meshopt GLB: 1,501,440 bytes. Mobile 13,824-triangle asset retained. Fresh export geometry audits pass | Full visual/animation and architecture QA are required before final asset approval |

The listed SKILL.md files were read before their relevant stages. Hair grooming
instructions were reviewed, but a groom was not fabricated on a nonexistent final
scalp. The Blender CLI evidence plans record source receipts and exact task-script
hashes; a valid seal establishes traceability, not artistic quality.

## Fresh garment QA

The installed `blender-asset-qa/scripts/qa_check.py` and `_bpyx.py` were reviewed,
then invoked through `scripts/blender/qa_curvature_asset.py` with the sealed
`evidence/full-asset-qa.json` plan. Their hashes are in the report.

The first run failed with 57 near-coplanar triangle pairs. Trouser upper caps,
hood-opening inset and raised back mark were separated in the editable refinement
source; the rerun passed. Current report: no z-fighting, detached parts, boundary
or non-manifold edges, degeneracy, inconsistent winding, inward closed islands,
missing textures, unapplied scale or unweighted vertices. No vertex exceeds four
deform influences.

Warnings remain: the fabric UVs deliberately repeat and overlap (~98.85%), so
they are unsuitable for a unique high-to-low bake. One face-opening island is
enclosed by the hood; it is not a reconstructed face and should be replaced or
removed during the final head workflow. Passing static QA does not certify poses.

`scripts/audit-arena-glb.mjs` independently decodes the actual compressed exports
and checks triangles, winding, welded edge connectivity and normalized weights.
The raw desktop export is an intermediate; `tt-entrance-curvature-web.glb` is the
file the website uses. Blender export compression is disabled for the desktop
source because its quantization collapsed tiny facets; the separate packing step
uses lossless Meshopt compression instead.

## Web checks and limits

Production build, lint/type checks and all 20 contact/journey tests passed.
The six camera stations were inspected in the local browser. Project displays
default to real Wealth Pilot and Truly Grow captures with their actual live URLs.
Skills, Education, Experience and Contact remain interactive. The greeting pose
and garment rear/three-quarter/side/wireframe views were inspected in WebGL.
Two entrance captures verify changing spotlights/smoke in normal motion mode.
Reduced-motion mode intentionally freezes environmental animation.

No live email was sent in this pass. Provider tests use mocks and do not prove
production inbox delivery. No new deployment or push is part of this checkpoint.

## Visual acceptance remains open

The reference comparison is deliberately labelled a WebGL study. Crowd atlases
repeat visibly; material wear, stadium architecture and lighting are not yet at
the reference's photographic quality. The hooded garment is a development asset,
not the owner's approved likeness. A validated likeness head/body asset and final
performance are still missing. Do not label this implementation exact,
photorealistic, complete or ready for final delivery merely because tests pass.

## Lighting revision after visual feedback

The web renderer now uses a restrained desktop bloom pass followed by Three.js
OutputPass, with a one-pixel-ratio compositor. Mobile does not mount this pipeline.
Ambient fill was reduced in favour of red stage lights and a cool entrance key;
the existing environment reveals metal truss reflections. Audience impostors now
use Lambert lighting rather than unlit materials, with position/height variation.
They are still four repeated atlas subjects, not finished 3D crowd models.

The procedural LED wall has denser distressed red signal artwork and text wear.
The runway has shared roughness/bump detail, panel seams and fasteners. Reflection
strength and bloom were reduced after screenshot review to avoid a pink/white
washed-out runway. Spotlight cones are narrower and more transparent.

Physical HTML screens use their existing world-space transforms without blending
occlusion: the bloom pipeline otherwise darkened the alpha-cutout display regions.
Their text and buttons remain separate crisp DOM content; screen imagery is not
affected by scene bloom. They are visible only in their corresponding chapter.

`lighting-revision/` contains desktop entrance, projects, mobile and a before/after
comparison captured in the actual website. No Blender source or exported mesh was
modified during this rendering pass; previous static mesh QA has the same scope.
This improves the lighting/material treatment but does not finish avatar likeness,
crowd diversity, physical volumetric smoke or the outstanding animation work.
