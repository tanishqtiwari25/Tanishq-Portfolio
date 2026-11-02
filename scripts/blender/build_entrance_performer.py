"""Original garment study for the rear-facing entrance shot, not a face scan.
Reuses the existing 13-bone animation skeleton; all generated parts are editable.
"""
import bpy, bmesh, math, json, random, sys, tempfile
from pathlib import Path
from mathutils import Vector, Matrix
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'art/tt-arena/performer';OUT.mkdir(parents=True,exist_ok=True)
assert 'FINISHED' in bpy.ops.wm.read_factory_settings(use_empty=True)
assert 'FINISHED' in bpy.ops.import_scene.gltf(filepath=str(ROOT/'public/models/tt-temporary.glb'))
rig=next(o for o in bpy.data.objects if o.type=='ARMATURE')
rig.name='TT_Entrance_Performer_Rig'
for o in list(bpy.data.objects):
    if o.type=='MESH':bpy.data.objects.remove(o,do_unlink=True)
rig.animation_data.action=None
for t in rig.animation_data.nla_tracks:t.mute=True
for bone in rig.pose.bones:bone.matrix_basis=Matrix.Identity(4)
rig.data.pose_position='REST'

def mat(name,color,rough):
    m=bpy.data.materials.new(name);p=next(n for n in m.node_tree.nodes if n.type=='BSDF_PRINCIPLED')
    p.inputs['Base Color'].default_value=(*color,1);p.inputs['Roughness'].default_value=rough
    return m,p
cloth,cp=mat('M_Heavy_Cotton',(.025,.029,.036),.86)
pants,pp=mat('M_Cotton_Twill',(.035,.038,.045),.91)
rubber,rp=mat('M_Rubber_Sole',(.63,.65,.68),.78)
skin,sp=mat('M_Neutral_Hands',(.24,.13,.085),.58)
trim,tp=mat('M_Grey_Stitching',(.15,.16,.17),.8)
materials=[cloth,pants,rubber,skin,trim]
# Shared fabric weave normal and roughness maps; data maps are Non-Color.
for kind in ('Normal','Roughness'):
    im=bpy.data.images.new('T_Fabric_'+kind,512,512);im.colorspace_settings.name='Non-Color';pixels=[]
    rng=random.Random(4317)
    for y in range(512):
        for x in range(512):
            if kind=='Normal':
                a=.065*math.sin(x*math.pi/2);b=.065*math.sin(y*math.pi/2)
                pixels.extend((.5+a,.5+b,.995,1))
            else:
                v=.76+.12*rng.random()+.04*math.sin((x+y)*math.pi/3);pixels.extend((v,v,v,1))
    im.pixels.foreach_set(pixels);im.pack()
    for m,p in [(cloth,cp),(pants,pp)]:
        n=m.node_tree.nodes.new('ShaderNodeTexImage');n.image=im
        if kind=='Normal':
            normal=m.node_tree.nodes.new('ShaderNodeNormalMap');normal.inputs['Strength'].default_value=.3
            m.node_tree.links.new(n.outputs['Color'],normal.inputs['Color']);m.node_tree.links.new(normal.outputs['Normal'],p.inputs['Normal'])
        else:m.node_tree.links.new(n.outputs['Color'],p.inputs['Roughness'])

verts=[];faces=[];uvs=[];weights=[];mats=[]
def add(v,f,uv,w,material):
    k=len(verts);verts.extend((x,-z,y) for x,y,z in v);uvs.extend(uv);weights.extend(w)
    faces.extend(tuple(k+i for i in face) for face in f);mats.extend([material]*len(f))

def profile(rings,cx=0,cz=0,material=0,bone='Spine',blend=None,segments=32,fold=.002):
    v=[];uv=[];w=[];f=[]
    for j,(y,rx,rz) in enumerate(rings):
        for i in range(segments):
            t=i*math.tau/segments
            crease=fold*math.sin(t*7+j*.85)*math.sin(math.pi*j/(len(rings)-1))**2
            v.append((cx+(rx+crease)*math.cos(t),y,cz+(rz+crease)*math.sin(t)))
            uv.append((i/segments,j/(len(rings)-1)))
            w.append(blend(y) if blend else {bone:1})
    for j in range(len(rings)-1):
        for i in range(segments):
            a=j*segments+i;b=j*segments+(i+1)%segments;f.append((a,b,b+segments,a+segments))
    # Triangle fan caps keep every garment watertight.
    for j,reverse in [(0,True),(len(rings)-1,False)]:
        center=len(v);v.append((cx,rings[j][0],cz));uv.append((.5,.5));w.append(blend(rings[j][0]) if blend else {bone:1})
        for i in range(segments):
            a=j*segments+i;b=j*segments+(i+1)%segments;f.append((center,b,a) if reverse else (center,a,b))
    add(v,f,uv,w,material)

def ellipse(center,radius,material,bone,segments=24,rings=14):
    v=[];uv=[];w=[];f=[]
    # Single poles avoid degenerate UV-sphere faces.
    v.append((center[0],center[1]-radius[1],center[2]));uv.append((.5,0));w.append({bone:1})
    for j in range(1,rings):
        t=-math.pi/2+j*math.pi/rings
        for i in range(segments):
            a=i*math.tau/segments;v.append((center[0]+radius[0]*math.cos(t)*math.cos(a),center[1]+radius[1]*math.sin(t),center[2]+radius[2]*math.cos(t)*math.sin(a)));uv.append((i/segments,j/rings));w.append({bone:1})
    top=len(v);v.append((center[0],center[1]+radius[1],center[2]));uv.append((.5,1));w.append({bone:1})
    for i in range(segments):f.append((0,1+(i+1)%segments,1+i));f.append((top,1+(rings-2)*segments+i,1+(rings-2)*segments+(i+1)%segments))
    for j in range(rings-2):
        for i in range(segments):
            a=1+j*segments+i;b=1+j*segments+(i+1)%segments;f.append((a,b,b+segments,a+segments))
    add(v,f,uv,w,material)

def blend_joint(y,upper,lower,joint,width=.08):
    t=max(0,min(1,(y-joint+width)/(2*width)));return {upper:t,lower:1-t}

# Human silhouette: waist, loose hem, chest, sloped shoulders and neck opening.
profile([(.88,.225,.145),(.9,.25,.16),(.94,.255,.165),(1.02,.25,.16),(1.12,.26,.16),(1.24,.285,.16),(1.35,.28,.145),(1.42,.235,.13),(1.47,.13,.105)],fold=.006)
profile([(.884,.24,.159),(.895,.26,.174),(.92,.264,.177),(.938,.257,.172)],material=0,fold=.001)
# Raised hood, separate folded collar, substantial cloth thickness in silhouette.
ellipse((0,1.61,-.012),(.172,.225,.18),0,'Head',32,22)
ellipse((0,1.445,-.035),(.17,.068,.143),0,'Spine')
# Shadowed face opening points forwards; the rear shot never asserts identity.
ellipse((0,1.61,.135),(.115,.15,.045),0,'Head',24,16)
profile([(.85,.19,.125),(.94,.195,.13),(1.0,.19,.12)],material=1,bone='Hips')
for side,label in [(-1,'Left'),(1,'Right')]:
    x=side*.28
    sleeve=[(.84,.071,.08),(.88,.075,.085),(.96,.084,.09),(1.04,.09,.095),(1.1,.094,.098),(1.16,.097,.105),(1.24,.102,.114),(1.34,.11,.12),(1.4,.09,.1)]
    profile(sleeve,x,material=0,blend=lambda y,L=label:blend_joint(y,L+'Arm',L+'ForeArm',1.1),segments=24,fold=.004)
    profile([(.79,.06,.065),(.81,.064,.07),(.85,.067,.073)],x,material=0,bone=label+'ForeArm',segments=24,fold=.001)
    ellipse((x,.755,.005),(.047,.066,.037),3,label+'ForeArm',20,12)
    for i in range(4):ellipse((x+(i-1.5)*.018,.714,.016),(.011,.042,.013),3,label+'ForeArm',10,8)
    ellipse((x-side*.045,.76,.027),(.022,.04,.022),3,label+'ForeArm',12,10)
    leg=[(.08,.066,.074),(.12,.074,.085),(.17,.076,.089),(.25,.079,.094),(.36,.087,.105),(.44,.091,.107),(.49,.105,.113),(.54,.106,.115),(.63,.11,.12),(.75,.121,.135),(.85,.123,.14),(.94,.11,.128)]
    profile(leg,side*.13,material=1,blend=lambda y,L=label:blend_joint(y,L+'UpLeg',L+'Leg',.49,.09),segments=28,fold=.004)
    # Layered outsole, rounded toe box, heel tab, tongue, and six lace crossings.
    ellipse((side*.13,.043,.045),(.09,.043,.175),2,label+'Foot',28,12)
    ellipse((side*.13,.084,.04),(.083,.063,.163),0,label+'Foot',28,14)
    ellipse((side*.13,.115,.022),(.055,.025,.095),1,label+'Foot',20,10)
    for i in range(5):ellipse((side*.13,.13-i*.004,.02+i*.019),(.055,.005,.005),4,label+'Foot',12,6)

# Original TT mark on the upper back, slightly embedded in the garment surface.
for x in (-.043,.043):
    # Elliptical short bars avoid coplanar decal surfaces/z-fighting.
    ellipse((x,1.29,-.161),(.035,.007,.008),2,'Spine',12,6)
    ellipse((x,1.255,-.162),(.007,.038,.009),2,'Spine',12,8)

mesh=bpy.data.meshes.new('TT_Garment_Surface');mesh.from_pydata(verts,[],faces);mesh.update()
bm=bmesh.new();bm.from_mesh(mesh);bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces));bm.to_mesh(mesh);bm.free()
ob=bpy.data.objects.new('SK_TT_Entrance_Outfit',mesh);bpy.context.collection.objects.link(ob)
for m in materials:mesh.materials.append(m)
uv=mesh.uv_layers.new(name='UVMap')
for p,mi in zip(mesh.polygons,mats):
    p.material_index=mi;p.use_smooth=True
    # Stable planar UVs per face avoid collapsed fan-cap coordinates.
    axis=max(range(3),key=lambda a:abs(p.normal[a]));axes=[a for a in range(3) if a!=axis]
    for li in p.loop_indices:
        co=mesh.vertices[mesh.loops[li].vertex_index].co;uv.data[li].uv=(co[axes[0]]*5,co[axes[1]]*5)
groups={b.name:ob.vertex_groups.new(name=b.name) for b in rig.data.bones}
for i,ws in enumerate(weights):
    for name,value in ws.items():
        if value>.00001:groups[name].add([i],value,'REPLACE')
mod=ob.modifiers.new('13 bone garment deformation','ARMATURE');mod.object=rig;ob.parent=rig
ob['status']='Original rear-facing outfit study. No reconstructed facial likeness.'
rig.data.pose_position='POSE'
bpy.context.scene.unit_settings.system='METRIC'
bpy.context.scene.frame_set(1)
# Keep the familiar animation clip names and their original action slots.
for t in rig.animation_data.nla_tracks:t.mute=True
assert 'FINISHED' in bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'tt-entrance-performer.blend'))
# Export only after the separate QA command has passed.
if '--export' in sys.argv:
    sys.path.insert(0,str(Path.home()/'.codex/skills/blender-asset-qa/scripts'))
    import qa_check
    qa=qa_check.run(objects=[ob.name],profile='game')
    (OUT/'qa.json').write_text(json.dumps(qa,indent=2))
    assert qa['pass'],qa['errors']
    temp=OUT/'export-temp';temp.mkdir(exist_ok=True);tempfile.tempdir=str(temp)
    assert 'FINISHED' in bpy.ops.export_scene.gltf(filepath=str(ROOT/'public/models/tt-entrance-performer.glb'),export_format='GLB',export_animation_mode='ACTIONS',export_meshopt_compression_enable=True)
stats={'vertices':len(mesh.vertices),'triangles':sum(len(p.vertices)-2 for p in mesh.polygons),'materials':len(materials),'bones':len(rig.data.bones),'dimensions':list(ob.dimensions),'facial_likeness':False}
(OUT/'model-stats.json').write_text(json.dumps(stats,indent=2));print('PERFORMER_STATS',json.dumps(stats),flush=True)
