"""Reference-guided head study, keeping the existing skeleton and performance clips."""
import bpy, bmesh, json, math, sys
import numpy as np
from pathlib import Path
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'art/tt-arena/face-likeness'
OUT.mkdir(parents=True, exist_ok=True)
for ob in list(bpy.data.objects):
    bpy.data.objects.remove(ob, do_unlink=True)
assert 'FINISHED' in bpy.ops.import_scene.gltf(filepath=str(ROOT/'art/tt-arena/rope-entry/performer-candidate.glb'), disable_bone_shape=True)
rig = next(o for o in bpy.data.objects if o.type == 'ARMATURE')
for track in rig.animation_data.nla_tracks:
    track.mute = True
rig.animation_data.action = None
rig.data.pose_position = 'REST'
body = next(o for o in bpy.data.objects if o.type == 'MESH')
bpy.context.view_layer.update()
inventory = []
for slot, material in enumerate(body.data.materials):
    indices = {i for p in body.data.polygons if p.material_index == slot for i in p.vertices}
    points = [body.matrix_world @ body.data.vertices[i].co for i in indices]
    inventory.append({'slot':slot,'material':material.name,'vertices':len(indices),
        'bounds':[[min(p[k] for p in points),max(p[k] for p in points)] for k in range(3)] if points else []})
(OUT/'inventory.json').write_text(json.dumps(inventory,indent=2))
print('FACE_INVENTORY',json.dumps(inventory),flush=True)

scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.cycles.samples = 48
scene.cycles.use_denoising = False
scene.render.threads_mode = 'FIXED'
scene.render.threads = 4
scene.render.resolution_x = 640
scene.render.resolution_y = 640
scene.render.resolution_percentage = 100
scene.view_settings.view_transform = 'AgX'
scene.world = bpy.data.worlds.new('Face_Review_World')
scene.world.color = (.08,.08,.08)
def point(ob, target):
    ob.rotation_euler = (Vector(target)-ob.location).to_track_quat('-Z','Y').to_euler()
for name, pos, energy, size in [('Key',(-1,-2,2.6),65,1.4),('Fill',(1,-1,1.9),25,1.2),('Rim',(.3,1,2.3),45,1)]:
    light = bpy.data.lights.new(name,'AREA'); light.energy=energy; light.shape='DISK'; light.size=size
    ob=bpy.data.objects.new(name,light);scene.collection.objects.link(ob);ob.location=pos;point(ob,(0,0,1.65))
camera=bpy.data.cameras.new('Face_Review_Camera'); cam=bpy.data.objects.new('Face_Review_Camera',camera)
scene.collection.objects.link(cam);scene.camera=cam;camera.lens=75
def render(label):
    for name, position in [('front',(0,-.91,1.68)),('three-quarter',(.56,-.77,1.69))]:
        cam.location=position;point(cam,(0,0,1.68));scene.render.filepath=str(OUT/f'{label}-{name}.png')
        assert 'FINISHED' in bpy.ops.render.render(write_still=True)
if '--skip-before' not in sys.argv:
    render('before')

# Remove only the task-authored raised hood; preserve the jacket/collar and rig.
bm=bmesh.new();bm.from_mesh(body.data)
hood=[f for f in bm.faces if f.material_index==0 and min((body.matrix_world@v.co).z for v in f.verts)>1.53]
bmesh.ops.delete(bm,geom=hood,context='FACES')
loose=[v for v in bm.verts if not v.link_faces]
bmesh.ops.delete(bm,geom=loose,context='VERTS')
bm.to_mesh(body.data);bm.free();body.data.update()
skin_slot=next(i for i,m in enumerate(body.data.materials) if m.name=='M_Neutral_Hands')
eye_slot=next(i for i,m in enumerate(body.data.materials) if m.name=='M_Brown_Eyes')
head_ids={i for p in body.data.polygons if p.material_index in (skin_slot,eye_slot) for i in p.vertices if (body.matrix_world@body.data.vertices[i].co).z>1.50}
inverse=body.matrix_world.inverted()
def gauss(x,c,w): return math.exp(-((x-c)/w)**2)
for i in head_ids:
    v=body.data.vertices[i];p=body.matrix_world@v.co;x,y,z=p
    # Primary likeness forms: leaner cheeks, a firmer jaw, less rounded skull.
    width=1-.07*gauss(z,1.622,.028)+.09*gauss(z,1.552,.022)
    p.x*=width
    neck=gauss(z,1.549,.020)
    p.x=p.x*(1-neck)+.052*math.tanh(p.x/.052)*neck
    p.y=p.y*(1-neck)+.052*math.tanh(p.y/.052)*neck
    eye=gauss(abs(x),.032,.025)*gauss(z,1.642,.018)*gauss(y,-.115,.035)
    p.z+=(z-1.642)*.38*eye
    if y<-.045:
        p.y-=.003*gauss(x,0,.018)*gauss(z,1.604,.022)
        p.z-=.004*gauss(x,0,.038)*gauss(z,1.536,.016)
    v.co=inverse@p
body.data.update()

# Store facial colour on the mesh, avoiding the inherited overlapping skin UVs.
skin=body.data.materials[skin_slot]
paint=body.data.color_attributes.new(name='TT_Facial_Groom',type='FLOAT_COLOR',domain='CORNER')
for poly in body.data.polygons:
    for li in poly.loop_indices:
        p=body.matrix_world@body.data.vertices[body.data.loops[li].vertex_index].co
        x,y,z=p;ax=abs(x)
        smooth=lambda a: max(0,min(1,a))**2*(3-2*max(0,min(1,a)))
        front=smooth((-y-.035)/.025)
        cheekline=1.571+.070*max(0,min(1,(ax-.020)/.061))
        beard=smooth((cheekline-z)/.010)*smooth((z-1.505)/.018)*front
        lips=math.exp(-min(100,(x/.026)**4+((z-1.561)/.008)**4))
        beard*=1-lips
        moustache=math.exp(-min(100,(x/.027)**4+((z-1.581)/.0065)**4))*front
        browheight=1.665-.13*(ax-.032)
        brows=math.exp(-min(100,((ax-.032)/.026)**6+((z-browheight)/.007)**4))*front
        strength=max(beard*.94,moustache*.97,brows*.98) if z>1.50 else 0
        base=Vector((.30,.165,.105));dark=Vector((.009,.006,.004))
        colour=base.lerp(dark,strength)
        paint.data[li].color=(*colour,1)
body.data.color_attributes.active_color=paint
bs=next(n for n in skin.node_tree.nodes if n.type=='BSDF_PRINCIPLED')
for link in list(skin.node_tree.links):
    if link.to_socket==bs.inputs['Base Color']:skin.node_tree.links.remove(link)
colour_node=skin.node_tree.nodes.new('ShaderNodeVertexColor');colour_node.layer_name=paint.name
skin.node_tree.links.new(colour_node.outputs['Color'],bs.inputs['Base Color'])
bs.inputs['Roughness'].default_value=.65

# A fitted scalp shell with a raised swept quiff, plus tapered volumetric locks.
hair=bpy.data.materials.new('M_TT_Black_Hair')
bs=next(n for n in hair.node_tree.nodes if n.type=='BSDF_PRINCIPLED')
bs.inputs['Base Color'].default_value=(.012,.009,.007,1)
bs.inputs['Roughness'].default_value=.65
bs.inputs['Specular IOR Level'].default_value=.25
hair.diffuse_color=(.012,.009,.007,1)
points=[];faces=[];uvs=[]
mapping={}
def hairpoint(p):
    x,y,z=p
    n=Vector((x,y,z-1.65)).normalized()
    p=p+n*.003
    lift=.050*gauss(z,1.746,.042)*gauss(y,-.035,.095)
    p.z+=lift;p.x+=.010*gauss(z,1.746,.04)
    p.y+=.009*gauss(z,1.746,.04)
    return p
for poly in body.data.polygons:
    if poly.material_index!=skin_slot: continue
    coords=[body.matrix_world@body.data.vertices[i].co for i in poly.vertices]
    def above(p):
        threshold=1.675+.028*max(0,min(1,(-p.y+.015)/.10))
        return p.z>threshold
    if not all(above(p) for p in coords): continue
    f=[]
    for i,p in zip(poly.vertices,coords):
        key=tuple(round(value,7) for value in p)
        if key not in mapping:
            mapping[key]=len(points);points.append(hairpoint(p));uvs.append((p.x*5+.5,p.y*5+.5))
        f.append(mapping[key])
    faces.append(tuple(f))
# Close the shell through a 1.5 mm inward layer at every perimeter edge.
edges={}
for f in faces:
    for a,b in zip(f,f[1:]+f[:1]):
        key=tuple(sorted((a,b)))
        if key in edges:del edges[key]
        else:edges[key]=(a,b)
count=len(points);basefaces=list(faces)
for p in points:
    front=max(0,min(1,(-p.y+.015)/.08))
    p.z=max(p.z,1.665+front*(.038-.010*(abs(p.x)/.09)**2))
for i in {v for edge in edges.values() for v in edge}:
    p=points[i]
    front=max(0,min(1,(-p.y+.015)/.08))
    p.z=1.665+front*(.038-.010*(abs(p.x)/.09)**2)
for p,texuv in list(zip(points,uvs)):
    n=Vector((p.x,p.y,p.z-1.65)).normalized();points.append(p-n*.0015);uvs.append(texuv)
faces.extend(tuple(i+count for i in reversed(f)) for f in basefaces)
faces.extend((b,a,a+count,b+count) for a,b in edges.values())

# Conform the swept locks to the real scalp surface, with no hovering strands.
from mathutils.bvhtree import BVHTree
scalp_tree=BVHTree.FromPolygons(points,faces)
for j in range(42):
    x=-.067+j/41*.134
    rings=[];N=7;steps=10
    for k in range(steps):
        t=k/(steps-1);xx=x+.010*t;yy=-.072+.102*t
        hit,normal,_,_=scalp_tree.ray_cast(Vector((xx,yy,2)),Vector((0,0,-1)))
        if hit is None:hit=Vector((xx,yy,1.75));normal=Vector((0,0,1))
        p=hit+normal*.0007
        radius=.0016*max(.15,math.sin(math.pi*(.08+.9*t))**.6)
        tangent=Vector((0,1,0));side=tangent.cross(normal).normalized()
        ring=[]
        for a in range(N):
            ang=a*math.tau/N;ring.append(len(points));points.append(p+side*(math.cos(ang)*radius)+normal*(math.sin(ang)*radius));uvs.append((a/N,t))
        rings.append(ring)
    for k in range(steps-1):
        for a in range(N):faces.append((rings[k][a],rings[k][(a+1)%N],rings[k+1][(a+1)%N],rings[k+1][a]))
    faces.append(tuple(reversed(rings[0])));faces.append(tuple(rings[-1]))
mesh=bpy.data.meshes.new('TT_Swept_Hair_Surface');mesh.from_pydata(points,[],faces);mesh.update()
bm=bmesh.new();bm.from_mesh(mesh)
bmesh.ops.triangulate(bm,faces=[f for f in bm.faces if len(f.verts)>4])
bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces));bm.to_mesh(mesh);bm.free()
hair_ob=bpy.data.objects.new('SK_TT_Swept_Hair',mesh);scene.collection.objects.link(hair_ob);mesh.materials.append(hair)
for p in mesh.polygons:p.use_smooth=True
hairuv=mesh.uv_layers.new(name='UVMap')
for p in mesh.polygons:
    for li in p.loop_indices:hairuv.data[li].uv=uvs[mesh.loops[li].vertex_index]
vg=hair_ob.vertex_groups.new(name='Head');vg.add(list(range(len(points))),1,'REPLACE')
mod=hair_ob.modifiers.new('Existing_Head_Rig','ARMATURE');mod.object=rig
hair_ob.parent=rig
# Hair points above were world-space. The imported rig carries a coordinate transform.
hair_ob.matrix_world.identity()
bpy.context.view_layer.update()
assert 'FINISHED' in bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'tt-face-study.blend'),compress=True)
if '--no-render' not in sys.argv:
    render('after')

exec(compile((ROOT/'scripts/blender/face_review_export.py').read_text(), str(ROOT/'scripts/blender/face_review_export.py'), 'exec'))
