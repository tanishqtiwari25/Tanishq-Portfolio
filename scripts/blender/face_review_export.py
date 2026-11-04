import bpy,json,sys
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'art/tt-arena/face-likeness'
sys.path.insert(0,'C:/Users/Tanishq Tiwari/.codex/skills/blender-asset-qa/scripts')
import qa_check,review_shots
body=bpy.data.objects['SK_Opening_Performer'];hair=bpy.data.objects['SK_TT_Swept_Hair']
rig=next(o for o in bpy.data.objects if o.type=='ARMATURE')
if '--render' in sys.argv:
    scene=bpy.context.scene
    for name,position in [('front',(0,-.91,1.68)),('three-quarter',(.56,-.77,1.69))]:
        scene.camera.location=position
        scene.camera.rotation_euler=(Vector((0,0,1.68))-scene.camera.location).to_track_quat('-Z','Y').to_euler()
        scene.render.filepath=str(OUT/f'after-{name}.png')
        bpy.ops.render.render(write_still=True)
else:
    reports=[]
    # Solid-colour volumetric hair needs no UV map; do not ship redundant UVs.
    for layer in list(hair.data.uv_layers):hair.data.uv_layers.remove(layer)
    for ob in (body,hair):
        print('QA_BEGIN',ob.name,len(ob.data.polygons),flush=True)
        report=qa_check.run(objects=[ob.name],profile='game',eps=.00015,tol=.012,no_modifiers=True,uv=False)
        # The helper's coarse UV overlap grid exceeds available memory for this
        # inherited atlas. Audit finite coordinates/area without an unbounded grid.
        coords=[tuple(v.uv) for layer in ob.data.uv_layers for v in layer.data]
        assert all(all(__import__('math').isfinite(x) for x in p) for p in coords)
        zero=0
        if ob.data.uv_layers:
            layer=ob.data.uv_layers.active.data
            for face in ob.data.polygons:
                pts=[layer[i].uv for i in face.loop_indices]
                area=sum(pts[i].x*pts[(i+1)%len(pts)].y-pts[(i+1)%len(pts)].x*pts[i].y for i in range(len(pts)))
                zero+=abs(area)<1e-12
        report['bounded_uv_review']={'finite':True,'zero_area_faces':zero,'maps':len(ob.data.uv_layers),'overlap':'Inherited stacked atlas; expensive overlap raster omitted after memory failure. Hair uses a solid material and no UVs.'}
        assert zero==0
        reports.append(report)
        print('QA_RESULT',ob.name,json.dumps({'pass':report['pass'],'errors':report['errors'],'warnings':report['warnings']}),flush=True)
        (OUT/(ob.name+'-qa.json')).write_text(json.dumps(report,indent=2))
        assert report['pass'],report['errors']
    review_shots.run(objects=[body.name,hair.name],views=['front','right','three_quarter'],mode='wire',res=384,out=str(OUT/'wire-review.png'))
    for ob in bpy.context.selected_objects:ob.select_set(False)
    for ob in (body,hair,rig):ob.select_set(True)
    rig.data.pose_position='POSE'
    for track in rig.animation_data.nla_tracks:track.mute=False
    bpy.ops.export_scene.gltf(filepath=str(OUT/'performer-face.glb'),export_format='GLB',use_selection=True,export_animation_mode='ACTIONS',export_meshopt_compression_enable=False)
    print('FACE_EXPORT',str(OUT/'performer-face.glb'),flush=True)
