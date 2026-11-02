"""Evidence-backed lookdev pass over the existing six-scene review.

Run through blender-cli/run_blender.py with evidence/lighting-plan.json.
Geometry, animation and website assets are deliberately not regenerated here.
"""
import json
from pathlib import Path
import bpy

out = Path(__file__).resolve().parents[2] / 'art' / 'tt-arena'
review = out / 'lookdev'
review.mkdir(exist_ok=True)
scene = bpy.context.scene
changes = []
for light in bpy.data.lights:
    before = {'name': light.name, 'type': light.type, 'energy': light.energy}
    if light.type == 'AREA':
        # Keep readable consoles, but remove the broad wash over the audience.
        light.energy = 550 if 'Review area fill' in light.name else 320
        light.size = 4.5
    elif light.type == 'SPOT':
        # Narrow shafts and neutral white pools retain the reference's contrast.
        red = light.color[0] > light.color[1] * 2
        light.energy = 18000 if red else 28000
        light.color = (1, .004, .012) if red else (.82, .9, 1)
        light.spot_size = .27
        light.spot_blend = .18
    changes.append({**before, 'new_energy': light.energy})
assert sum(c['type'] == 'SPOT' for c in changes) == 8
scene.render.resolution_x = 960
scene.render.resolution_y = 600
scene.frame_set(1)
assert 'FINISHED' in bpy.ops.wm.save_as_mainfile(filepath=str(out / 'tt-arena-lookdev.blend'), compress=True)
for frame, name in [(1, '01-entrance'), (480, '04-projects'), (610, '05-skills')]:
    scene.frame_set(frame)
    scene.render.filepath = str(review / (name + '.png'))
    assert 'FINISHED' in bpy.ops.render.render(write_still=True)
    assert (review / (name + '.png')).stat().st_size > 1000
(review / 'lighting-report.json').write_text(json.dumps({'lights': changes, 'mesh_changes': False, 'exact_likeness': False}, indent=2))
print('LIGHTING_COMPARISON_COMPLETE', flush=True)
