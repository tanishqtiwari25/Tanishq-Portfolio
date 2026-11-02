# Arena lighting comparison

This pass uses the user-requested blender-core, blender-cli and 3d-website-architect workflows. It is an incremental lighting study, not a completed photorealistic recreation.

`tt-arena-lookdev.blend` in the parent folder preserves the six-scene editable review with reduced broad area fill, eight stronger and narrower red/white spot sources, and the existing haze. The original `tt-arena.blend` remains the generator baseline. Three 960 × 600 comparison stills cover entrance, projects and skills. No mesh, skinning, animation or GLB export changed in this pass, so these renders do not establish new mesh QA or likeness approval.

The web scene separately uses lower ambient/hemisphere fill, alternating red/white moving fixtures, narrower visible shafts, and three active moving spotlights on desktop (one on mobile). A fractional phase previously made the color condition always choose white; explicit color selection fixes this. Reduced-motion mode keeps the fixtures stationary.

## Reproduction and evidence

Load the baseline blend using blender-cli's `scripts/run_blender.py`, pass `scripts/blender/lighting_pass.py` and `art/tt-arena/evidence/lighting-plan.json`. The plan seals the exact script bytes and records 22 complete source reads. Selected routes are `choose-light-source-shape`, `render-still-or-animation`, `blend-file-open-save`, and the Scene/context/data discovery cards.

Implementation contracts include `SpotLight.energy`, `spot_size`, `spot_blend`, `AreaLight.energy`, `size`, `Light.color`, `Scene.frame_set`, `RenderSettings.filepath`, and the render/save operators. Exact refs and line bindings are in the plan. `lookdev-reopen.json` records a fresh reopen in Blender 5.2.3. `lighting-report.json` records each light's previous and resulting power.

The supplied reference still has substantially more detailed people, clothing, architecture, textures and atmosphere than this scene. The avatar remains temporary and is not a faithful face reconstruction. Detailed character and crowd work, final stair animation, and full asset QA remain outstanding.
