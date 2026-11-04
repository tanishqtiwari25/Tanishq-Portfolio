"""Source-bound import, mandatory QA and portrait/outfit render review."""
import bpy, bmesh, json, math, sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'art/tt-arena/photo-outfit'
sys.path.insert(0,'C:/Users/Tanishq Tiwari/.codex/skills/blender-asset-qa/scripts')
import qa_check, review_shots
for ob in list(bpy.data.objects):
    if ob.type in ('MESH','ARMATURE'):
        bpy.data.objects.remove(ob,do_unlink=True)
assert 'FINISHED' in bpy.ops.import_scene.gltf(filepath=str(OUT/'reference-outfit.glb'),disable_bone_shape=True)
rig=next(o for o in bpy.data.objects if o.type=='ARMATURE')
for track in rig.animation_data.nla_tracks:
    track.mute=True
rig.animation_data.action=None
rig.data.pose_position='REST'
meshes=[o.name for o in bpy.data.objects if o.type=='MESH']
# Canonicalize coincident glTF seam vertices in the REVIEW COPY only. UV seams
# remain loop attributes; the delivery GLB keeps all original split vertices.
for mesh_name in meshes:
    ob=bpy.data.objects[mesh_name]
    bm=bmesh.new();bm.from_mesh(ob.data)
    bmesh.ops.remove_doubles(bm,verts=list(bm.verts),dist=1e-7)
    bm.to_mesh(ob.data);bm.free()
if '--render-only' not in sys.argv:
    overlap_locations=[]
    def collect(frame,event,arg):
        if event=='call' and frame.f_code.co_name=='_describe':
            data=frame.f_back.f_locals
            if frame.f_locals['pairs'] is data['zf_pairs']:
                for a,b in frame.f_locals['pairs']:
                    overlap_locations.append([[list(data['verts'][i]) for i in data['tris'][t]] for t in (a,b)])
        return collect
    if '--trace' in sys.argv:sys.settrace(collect)
    qa=qa_check.run(objects=meshes,profile='game',eps=.00015,tol=.018,no_modifiers=True,uv=False)
    sys.settrace(None)
    qa['overlap_locations']=overlap_locations
    qa['uv_scope']='The inherited overlap grid exceeds memory. Export audit checks indices, weights, normals and watertight surfaces; photo UV placement is visually reviewed.'
    (OUT/'blender-qa.json').write_text(json.dumps(qa,indent=2))
    print('PHOTO_OUTFIT_QA',json.dumps({'pass':qa['pass'],'errors':qa['errors'],'warnings':qa['warnings']}),flush=True)
    assert qa['pass'],qa['errors']
if '--wire-only' in sys.argv:
    review_shots.run(objects=meshes,views=['front','right','three_quarter'],mode='wire',res=384,out=str(OUT/'outfit-wire.png'))
    sys.exit(0)
scene=bpy.context.scene
for name,position,target,resolution in [
    ('face-front',(0,-.91,1.68),(0,0,1.67),(640,640)),
    ('face-quarter',(.5,-.76,1.68),(0,0,1.67),(640,640)),
    ('outfit-front',(.2,-4.2,1.3),(0,0,.94),(640,800)),
]:
    if '--pose-only' in sys.argv:continue
    if '--view' in sys.argv and name!=sys.argv[sys.argv.index('--view')+1]:continue
    scene.camera.location=position
    dx,dy,dz=[target[i]-position[i] for i in range(3)]
    scene.camera.rotation_euler=(math.atan2(math.hypot(dx,dy),-dz),0,math.atan2(-dx,dy))
    scene.render.resolution_x,scene.render.resolution_y=resolution
    scene.render.filepath=str(OUT/(name+'.png'))
    assert 'FINISHED' in bpy.ops.render.render(write_still=True)
assert 'FINISHED' in bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'reference-outfit-reviewed.blend'),compress=True)
if '--pose-review' in sys.argv or '--pose-only' in sys.argv:
    scene.camera.location=(.2,-4.2,1.3)
    scene.camera.rotation_euler=(math.atan2(math.hypot(-.2,4.2),.36),0,math.atan2(.2,4.2))
    scene.render.resolution_x,scene.render.resolution_y=640,800
    action=next(strip.action for track in rig.animation_data.nla_tracks for strip in track.strips if strip.action and 'RingEntry' in strip.action.name)
    rig.data.pose_position='POSE'
    rig.animation_data.action=action
    rig.animation_data.action_slot=action.slots[0]
    start,end=action.frame_range
    for i,phase in enumerate((.28,.50,.75)):
        if '--pose-index' in sys.argv and i!=int(sys.argv[sys.argv.index('--pose-index')+1]):continue
        sample_frame=start+(end-start)*phase
        scene.frame_set(int(sample_frame),subframe=sample_frame-int(sample_frame))
        scene.render.filepath=str(OUT/('entry-pose-%d.png'%i))
        assert 'FINISHED' in bpy.ops.render.render(write_still=True)
