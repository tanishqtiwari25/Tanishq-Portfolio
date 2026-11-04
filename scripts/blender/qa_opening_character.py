"""Review the authored anatomical candidate in Blender before web delivery."""
import bpy
import hashlib
import json
import sys
import tempfile
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'art/tt-arena/entrance-assets'
SKILLS=Path('C:/Users/Tanishq Tiwari/.codex/skills')
sys.path.insert(0,str(SKILLS/'blender-core/scripts'))
import env_report
(OUT/'environment.json').write_text(json.dumps(env_report.run(),indent=2),encoding='utf-8')
sys.path.insert(0,str(SKILLS/'blender-asset-qa/scripts'))
import qa_check
import review_shots

name=sys.argv[sys.argv.index('--asset')+1]
assert name in ('SK_Opening_Performer','SK_Opening_Spectator')
for ob in list(bpy.data.objects):
    bpy.data.objects.remove(ob,do_unlink=True)
assert 'FINISHED' in bpy.ops.import_scene.gltf(filepath=str(OUT/(name+'-candidate.glb')),disable_bone_shape=True)
names=[ob.name for ob in bpy.data.objects if ob.type=='MESH']
assert names==[name],names
overlaps=[]
def collect(frame,event,arg):
    if event=='call' and frame.f_code.co_name=='_describe':
        data=frame.f_back.f_locals
        for a,b in frame.f_locals['pairs']:
            overlaps.append([[list(data['verts'][i]) for i in data['tris'][t]] for t in (a,b)])
    return collect
if '--trace' in sys.argv: sys.settrace(collect)
report=qa_check.run(objects=names,profile='game',eps=.00015,tol=.012,no_modifiers=True)
sys.settrace(None)
report['overlap_locations']=overlaps
report['scope']='Anatomical rest mesh, outfit shell, shoes and normalized 13-bone weights; not an owner facial likeness. Deformation is reviewed separately.'
report['reviewed_helpers_sha256']={n:hashlib.sha256((SKILLS/'blender-asset-qa/scripts'/n).read_bytes()).hexdigest() for n in ('qa_check.py','review_shots.py','_bpyx.py')}
(OUT/(name+'-qa.json')).write_text(json.dumps(report,indent=2),encoding='utf-8')
assert 'FINISHED' in bpy.ops.wm.save_as_mainfile(filepath=str(OUT/(name+'.blend')),compress=True)
for mode in ('solid','wire'):
    review_shots.run(objects=names,views=['front','right','back','three_quarter'],mode=mode,res=512,out=str(OUT/(name+'-'+mode+'.png')))
print('CHARACTER_QA',name,report['pass'],report['errors'],report['warnings'],flush=True)
if not report['pass']:
    raise RuntimeError('Character QA failed; export withheld')
tempfile.tempdir=str(OUT/'export-temp'/name);Path(tempfile.tempdir).mkdir(parents=True,exist_ok=True)
assert 'FINISHED' in bpy.ops.export_scene.gltf(filepath=str(OUT/(name+'-verified.glb')),export_format='GLB',export_animation_mode='ACTIONS',export_meshopt_compression_enable=False)
print('CHARACTER_EXPORT',(OUT/(name+'-verified.glb')).stat().st_size,flush=True)


