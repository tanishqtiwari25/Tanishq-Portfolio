"""Bounded rest QA and posed Workbench evidence for the separately tuned rig."""
import bpy
import hashlib
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'art/tt-arena/rope-entry/blender-review'
OUT.mkdir(parents=True, exist_ok=True)
SKILLS = Path('C:/Users/Tanishq Tiwari/.codex/skills')
sys.path.insert(0, str(SKILLS / 'blender-core/scripts'))
import env_report
(OUT / 'environment.json').write_text(json.dumps(env_report.run(), indent=2), encoding='utf-8')
sys.path.insert(0, str(SKILLS / 'blender-asset-qa/scripts'))
import qa_check
import review_shots

for ob in list(bpy.data.objects):
    bpy.data.objects.remove(ob, do_unlink=True)
assert 'FINISHED' in bpy.ops.import_scene.gltf(filepath=str(ROOT / 'art/tt-arena/rope-entry/performer-candidate.glb'), disable_bone_shape=True)
meshes = [ob.name for ob in bpy.data.objects if ob.type == 'MESH']
assert meshes == ['SK_Opening_Performer'], meshes
rig = next(ob for ob in bpy.data.objects if ob.type == 'ARMATURE')
for track in rig.animation_data.nla_tracks:
    track.mute = True
rig.animation_data.action = None
qa = qa_check.run(objects=meshes, profile='game', eps=.00015, tol=.012, no_modifiers=True)
qa['scope'] = 'Rest geometry and normalized refined weights; visual pose review follows. Generic anatomical head, not owner likeness. Shaped outsoles and waist-weight refinement.'
qa['reviewed_helpers_sha256'] = {name: hashlib.sha256((SKILLS / 'blender-asset-qa/scripts' / name).read_bytes()).hexdigest() for name in ('qa_check.py', 'review_shots.py', '_bpyx.py')}
(OUT / 'rest-qa.json').write_text(json.dumps(qa, indent=2), encoding='utf-8')
assert qa['pass'], qa['errors']
review_shots.run(objects=meshes, views=['front', 'right', 'three_quarter'], mode='solid', res=512, out=str(OUT / 'rest-solid.png'))
review_shots.run(objects=meshes, views=['front', 'right', 'three_quarter'], mode='wire', res=512, out=str(OUT / 'rest-wire.png'))
walk = bpy.data.actions.get('RingEntry')
assert walk is not None
rig.animation_data.action = walk
rig.animation_data.action_slot = walk.slots[0]
start, end = walk.frame_range
posed = []
for index, phase in enumerate([0, .16, .28, .42, .56, .70, .82, 1]):
    frame = start + (end - start) * phase
    bpy.context.scene.frame_set(int(frame), subframe=frame - int(frame))
    output = OUT / ('entry-%02d.png' % index)
    review_shots.run(objects=meshes, views=['front', 'right', 'three_quarter'], mode='solid', res=512, out=str(output))
    posed.append({'phase': phase, 'frame': frame, 'sheet': str(output), 'scope': 'Actual sampled RingEntry contacts, with scene root movement external to the clip.'})
bpy.context.scene.frame_set(int(start), subframe=start - int(start))
assert 'FINISHED' in bpy.ops.wm.save_as_mainfile(filepath=str(OUT / 'tt-performer-rope-reviewed.blend'), compress=True)
summary = {'pass': qa['pass'], 'warnings': qa['warnings'], 'action': walk.name, 'action_frames': [start, end], 'meshes': meshes, 'posed': posed, 'limitation': 'Workbench geometry/deformation evidence. This is geometry/deformation evidence of the sampled entry clip. Scene rope collisions and root motion are verified in the web runtime. Facial likeness is unfinished.'}
(OUT / 'review-summary.json').write_text(json.dumps(summary, indent=2), encoding='utf-8')
print('ENTRY_CANDIDATE_REVIEW', json.dumps(summary), flush=True)
