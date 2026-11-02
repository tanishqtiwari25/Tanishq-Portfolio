"""Render and validate the six editable review chapters (not a website backdrop)."""
import bpy,json
from pathlib import Path
s=bpy.context.scene;root=Path(bpy.data.filepath).parent;out=root/'review';out.mkdir(exist_ok=True)
s.render.engine='CYCLES';s.cycles.samples=16;s.cycles.use_denoising=True
s.render.resolution_x=960;s.render.resolution_y=600;s.render.resolution_percentage=100
chapters=[(1,'01-entrance'),(100,'02-intro'),(300,'03-walk'),(480,'04-projects'),(610,'05-skills'),(720,'06-contact')]
assert len(s.timeline_markers)==6
assert s.camera.name=='Animated six-scene camera'
assert bpy.data.objects.get('Temporary avatar journey - likeness pending')
roots=[o for o in bpy.data.objects if o.name.startswith('Retracting project display')]
assert len(roots)==2
rigs=[o for o in bpy.data.objects if o.type=='ARMATURE']
assert rigs
assert any(t.name=='Journey synchronized walk and idle' and not t.mute and len(t.strips)==7 for o in rigs for t in o.animation_data.nla_tracks)
s.frame_set(480);assert all(abs(o.location.z)<.0001 for o in roots)
s.frame_set(610);assert all(abs(o.location.z-7.5)<.0001 for o in roots)
report={'chapters':[],'assertions':'passed','temporary_avatar':True,'exact_likeness':False}
for frame,name in chapters:
    s.frame_set(frame);s.render.filepath=str(out/(name+'.png'));bpy.ops.render.render(write_still=True)
    report['chapters'].append({'frame':frame,'image':name+'.png','camera':list(s.camera.location)})
    print('REVIEW_CHAPTER_COMPLETE',name,flush=True)
(out/'validation.json').write_text(json.dumps(report,indent=2))
print('SIX_SCENE_REVIEW_COMPLETE',flush=True)
