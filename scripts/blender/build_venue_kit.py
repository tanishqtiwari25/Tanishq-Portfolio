"""Build the authored closed venue kit; execute only through its sealed evidence plan."""
import bpy
import json
import sys
import hashlib
import tempfile
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'art/tt-arena/reconstruction/venue'
SKILLS=Path('C:/Users/Tanishq Tiwari/.codex/skills')
sys.path.insert(0,str(SKILLS/'blender-core/scripts'))
import env_report
(OUT/'environment.json').write_text(json.dumps(env_report.run(),indent=2),encoding='utf-8')
sys.path.insert(0,str(SKILLS/'blender-asset-qa/scripts'))
import qa_check
import review_shots

# This process owns its factory scene. Existing architecture and avatar files are not overwritten.
for ob in list(bpy.data.objects):
    bpy.data.objects.remove(ob,do_unlink=True)
scene=bpy.context.scene
scene.unit_settings.system='METRIC'
scene.unit_settings.scale_length=1
collection=bpy.data.collections.new('ASSET_TTArenaVenue')
scene.collection.children.link(collection)

specs={
    'M_Concrete':((.035,.039,.046),0,.9,'Concrete'),
    'M_Floor':((.014,.016,.02),0,.93,'Concrete'),
    'M_PaintedSteel':((.018,.022,.028),0,.75,'Paint'),
    'M_Steel':((.45,.47,.5),1,.5,'Steel'),
    'M_Rubber':((.014,.015,.018),0,.96,None),
    'M_Seat':((.024,.028,.035),0,.72,'Paint'),
    'M_RibbonLED':((.15,.006,.012),0,.65,None),
    'M_ScoreboardLED':((.04,.001,.003),0,.75,None),
}
materials={}
sockets={}
for name,(color,metal,rough,texture) in specs.items():
    mat=bpy.data.materials.new(name)
    principled=next(n for n in mat.node_tree.nodes if n.type=='BSDF_PRINCIPLED')
    sockets[name]=[s.name for s in principled.inputs]
    assert all(n in principled.inputs for n in ('Base Color','Metallic','Roughness'))
    principled.inputs['Base Color'].default_value=(*color,1)
    principled.inputs['Metallic'].default_value=metal
    principled.inputs['Roughness'].default_value=rough
    if texture:
        image=bpy.data.images.load(str(OUT/('T_'+texture+'_Roughness.png')),check_existing=True)
        image.colorspace_settings.name='Non-Color'
        image.pack()
        node=mat.node_tree.nodes.new('ShaderNodeTexImage')
        node.image=image
        mat.node_tree.links.new(node.outputs['Color'],principled.inputs['Roughness'])
    materials[name]=mat
(OUT/'material-sockets.json').write_text(json.dumps(sockets,indent=2),encoding='utf-8')

design=json.loads((OUT/'design.json').read_text(encoding='utf-8'))
names=[]
for item in design['meshes']:
    raw=item['positions'];verts=[(raw[i],-raw[i+2],raw[i+1]) for i in range(0,len(raw),3)]
    idx=item['indices'];faces=[idx[i:i+3] for i in range(0,len(idx),3)]
    mesh=bpy.data.meshes.new(item['name']+'_Mesh')
    mesh.from_pydata(verts,[],faces,shade_flat=False)
    assert not mesh.validate(),item['name']+' required invalid geometry corrections'
    mesh.update()
    uv=mesh.uv_layers.new(name='UVMap')
    raw_uv=item['loopUV']
    for i in range(len(mesh.loops)):
        uv.data[i].uv=(raw_uv[i*2],raw_uv[i*2+1])
    raw_n=item['loopNormals']
    normals=[(raw_n[i],-raw_n[i+2],raw_n[i+1]) for i in range(0,len(raw_n),3)]
    mesh.normals_split_custom_set(normals)
    mesh.materials.append(materials[item['material']])
    ob=bpy.data.objects.new(item['name'],mesh)
    collection.objects.link(ob)
    names.append(item['name'])

report=qa_check.run(objects=names,profile='game',eps=.0002,tol=.012)
report['scope']='New closed venue kit only; tiling roughness UVs are intentionally stacked.'
report['reviewed_helpers_sha256']={n:hashlib.sha256((SKILLS/'blender-asset-qa/scripts'/n).read_bytes()).hexdigest() for n in ('qa_check.py','review_shots.py','_bpyx.py')}
(OUT/'asset-qa.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print('VENUE_QA',report['pass'],report['errors'],report['warnings'],flush=True)
assert 'FINISHED' in bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'tt-venue-kit.blend'),compress=True)
if not report['pass']:
    raise RuntimeError('Venue QA failed; export withheld')
tempfile.tempdir=str(OUT/'export-temp');Path(tempfile.tempdir).mkdir(exist_ok=True)
assert 'FINISHED' in bpy.ops.export_scene.gltf(filepath=str(OUT/'tt-venue-kit.glb'),export_format='GLB',export_animations=False,export_cameras=False,export_meshopt_compression_enable=False)
for mode in ('random','wire'):
    review_shots.run(objects=['SM_ScoreboardBody','SM_ScoreboardScreens','SM_ScoreboardFrame','SM_ScoreboardVent'],mode=mode,res=384,out=str(OUT/('scoreboard-'+mode+'.png')))
    review_shots.run(objects=['SM_Terraces','SM_BalconyFascia','SM_BalconyColumns','SM_BalconyRails'],mode=mode,res=384,out=str(OUT/('seating-'+mode+'.png')))
print('VENUE_EXPORT',(OUT/'tt-venue-kit.glb').stat().st_size,flush=True)
