"""Build the editable TT Arena architecture and its web-ready GLB.
Coordinates in helpers use the website's metres/Y-up world, converted for Blender.
Run: blender --background --python scripts/blender/build_tt_arena.py
"""
import bpy, bmesh, math, os, random, json
from pathlib import Path
from mathutils import Vector, Matrix
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'art'/'tt-arena'; OUT.mkdir(parents=True,exist_ok=True)
WEB=ROOT/'public'/'models'; WEB.mkdir(parents=True,exist_ok=True)
bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
random.seed(4317)
def world(p): return (p[0],-p[2],p[1])
def material(name,color,metal=0,rough=.5,emission=0):
    m=bpy.data.materials.new(name); m.use_nodes=True
    p=m.node_tree.nodes.get('Principled BSDF'); p.inputs['Base Color'].default_value=(*color,1)
    p.inputs['Metallic'].default_value=metal; p.inputs['Roughness'].default_value=rough
    if emission: p.inputs['Emission Color'].default_value=(*color,1);p.inputs['Emission Strength'].default_value=emission
    return m
steel=material('Brushed structural steel',(.25,.28,.32),.92,.31)
edge=material('Worn aluminium edges',(.52,.55,.59),.95,.26)
black=material('Powder coated black',(.018,.022,.029),.55,.44)
concrete=material('Charcoal concrete',(.024,.027,.032),.1,.83)
red=material('Crimson LED strips',(.8,.012,.045),.2,.3,4)
white=material('White fixture lenses',(.82,.9,1),.1,.2,5)
rampmat=material('Polished ramp panels',(.11,.12,.15),.85,.16)
# Pack original deterministic material maps inside the blend and GLB.
for mat in [steel,edge,black,rampmat]:
    image=bpy.data.images.new(mat.name+' grain',256,256)
    data=[]
    base=mat.node_tree.nodes.get('Principled BSDF').inputs['Base Color'].default_value[:3]
    for y in range(256):
        stripe=random.uniform(-.035,.035)
        for x in range(256):
            v=.78+stripe+random.uniform(-.03,.03); data.extend((v*base[0],v*base[1],v*base[2],1))
    image.pixels=data; image.pack()
    nodes=mat.node_tree.nodes; tex=nodes.new('ShaderNodeTexImage');tex.image=image
    mat.node_tree.links.new(tex.outputs['Color'],nodes.get('Principled BSDF').inputs['Base Color'])
# All repeated meshes are accumulated per material to keep web draw calls bounded.
batches={}
def poly(name,verts,faces,mat):
    v,f=batches.setdefault(mat.name,([],[]));n=len(v);v.extend(world(p) for p in verts);f.extend(tuple(n+i for i in face) for face in faces)
def box(name,p,s,mat=black):
    verts=[(p[0]+x*s[0]/2,p[1]+y*s[1]/2,p[2]+z*s[2]/2) for x,y,z in [(-1,-1,-1),(-1,-1,1),(-1,1,-1),(-1,1,1),(1,-1,-1),(1,-1,1),(1,1,-1),(1,1,1)]]
    poly(name,verts,[(0,4,6,2),(1,3,7,5),(0,1,5,4),(2,6,7,3),(0,2,3,1),(4,5,7,6)],mat)
def beam(a,b,r=.045,mat=steel,segments=6):
    a=Vector(a);b=Vector(b);d=(b-a).normalized();u=d.cross(Vector((0,1,0)))
    if u.length<.01:u=d.cross(Vector((1,0,0)))
    u.normalize();v=d.cross(u).normalized()
    verts=[tuple(p+r*(u*math.cos(t*math.tau/segments)+v*math.sin(t*math.tau/segments))) for p in (a,b) for t in range(segments)]
    faces=[tuple(range(segments-1,-1,-1)),tuple(range(segments,2*segments))]+[(i,(i+1)%segments,(i+1)%segments+segments,i+segments) for i in range(segments)]
    poly('Tube',verts,faces,mat)
def truss(a,b,cells=16):
    a=Vector(a);b=Vector(b);d=(b-a).normalized();u=d.cross(Vector((0,1,0)))
    if u.length<.01:u=d.cross(Vector((1,0,0)))
    u.normalize();v=d.cross(u).normalized();corners=[u*x*.26+v*y*.26 for x,y in [(-1,-1),(-1,1),(1,1),(1,-1)]]
    for i in range(4):
        beam(a+corners[i],b+corners[i],.05)
        for j in range(cells):
            c=a.lerp(b,j/cells);n=a.lerp(b,(j+1)/cells)
            beam(c+corners[i],c+corners[(i+1)%4],.025)
            beam(c+corners[i],n+corners[(i+1)%4],.026)
def ellipse_band(radius,width,y,height,mat=concrete):
    for i in range(160):
        t=i*math.tau/160;n=(i+1)*math.tau/160
        verts=[(math.cos(a)*r,h,math.sin(a)*r*2-17) for h in (y-height,y) for r,a in [(radius,t),(radius,n),(radius+width,n),(radius+width,t)]]
        poly('Terrace',verts,[(0,1,2,3),(4,7,6,5),(0,4,5,1),(1,5,6,2),(2,6,7,3),(3,7,4,0)],mat)
def ellipse_rail(radius,y,mat,r=.025):
    for i in range(160):
        a=i*math.tau/160;b=(i+1)*math.tau/160
        beam((math.cos(a)*radius,y,math.sin(a)*radius*2-17),(math.cos(b)*radius,y,math.sin(b)*radius*2-17),r,mat)
box('Venue floor',(0,-.2,-12),(110,.25,110),concrete)
box('Stage riser',(0,.55,-37),(26,1.1,8),black)
box('Entrance LED housing',(0,5.7,-41),(21.2,9,.6),black)
for side in (-1,1):
    box('LED wall side brace',(side*10.7,5.7,-40.65),(.16,9.3,.2),edge)
    box('Side tower',(side*13,5,-39),(2.5,8,.65),black)
    for x in (-1,1):box('Tower edge',(side*13+x*1.2,5,-38.64),(.08,8,.08),red)
    for y in (1,9):box('Tower edge',(side*13,y,-38.64),(2.45,.08,.08),red)
    truss((side*14,0,-40),(side*14,13,-40),12)
    for i in range(6):
        box('Line array speaker',(side*12,10-i*.52,-37.6),(.9,.47,.85),black)
        for j in range(4):box('Speaker grille',(side*12,10-i*.52+(j-1.5)*.085,-37.16),(.72,.025,.02),steel)
    # Grounded portal and footlights.
    for i in range(10):
        box('Stage footlight',(side*(2+i*1.05),1.2,-33),(.22,.15,.2),black)
        box('Footlight lens',(side*(2+i*1.05),1.28,-32.94),(.16,.06,.04),white)
for y in (1.1,10.25):box('Main LED frame',(0,y,-40.64),(21.5,.16,.22),edge)
# Open central entrance portal below the main display.
for x in (-1.25,1.25): box('Portal upright',(x,2.6,-40.2),(.16,3,.25),edge)
box('Portal lintel',(0,4.1,-40.2),(2.65,.16,.25),white)
# Ramp segments match the web's continuous one metre slope.
for i in range(46):
    z=-33+(i+.5)*.5;y=.1+(-10-z)/23
    box('Ramp panel',(0,y-.07,z),(4.2,.14,.495),rampmat)
for side in (-1,1):
    for i in range(47):
        z=-33+i*.5;y=.1+(-10-z)/23
        beam((side*2.1,y+.015,z),(side*2.1,y+.015,z+.48),.025,red)
    for i in range(32):
        z=-33+i*.75
        beam((side*3.35,0,z),(side*3.35,1.2,z),.04,edge)
        if i<31: beam((side*3.35,1.2,z),(side*3.35,1.2,z+.75),.045,edge)
        for n in range(2):beam((side*3.35,.08,z+n*.3),(side*3.35,1.14,z+n*.3),.018,steel)
# Ringside production consoles: sloped steel housings, rack units, knobs and bolts.
for side in (-1,1):
    origin=Vector((side*8,2.65,1.65));rotation=Matrix.Rotation(.12 if side==1 else 0,4,'Y')@Matrix.Rotation(-.38,4,'X')
    def cp(p):return tuple(origin+(rotation@Vector((*p,1))).to_3d())
    def panel_box(p,size,mat):
        verts=[cp((p[0]+x*size[0]/2,p[1]+y*size[1]/2,p[2]+z*size[2]/2)) for x,y,z in [(-1,-1,-1),(-1,-1,1),(-1,1,-1),(-1,1,1),(1,-1,-1),(1,-1,1),(1,1,-1),(1,1,1)]]
        poly('Console housing',verts,[(0,4,6,2),(1,3,7,5),(0,1,5,4),(2,6,7,3),(0,2,3,1),(4,5,7,6)],mat)
    panel_box((0,0,-.3),(4.8,3.05,.46),black)
    for sign in (-1,1):
        panel_box((sign*2.3,0,-.22),(.22,3.1,.45),edge)
        panel_box((0,sign*1.45,-.22),(4.8,.18,.45),steel)
        for y in (-1.3,-.65,0,.65,1.3):beam(cp((sign*2.3,y,.22)),cp((sign*2.3,y,.25)),.055,edge,6)
        beam((side*8+sign*2.05,0,1.6),cp((sign*2.05,-1.2,-.2)),.075,steel)
        panel_box((sign*2.65,0,-.12),(.4,2.8,.55),black)
        for i in range(10):
            y=-1.1+i*.23
            beam(cp((sign*2.65,y,.17)),cp((sign*2.65,y,.23)),.055,red if i%4==0 else steel,10)
    box('Console lower shelf',(side*8,1.1,1.8),(4.5,.12,1.8),steel)
# Roof steel with crossing braces and black moving-head fixtures.
for z in (-40,-32,-16,3,12):truss((-14,13,z),(14,13,z),24)
for x in (-14,14):
    truss((x,13,-40),(x,13,12),32)
    truss((x,0,4),(x,13,4),12)
    beam((x,12.7,-40),(x,12.7,12),.035,red)
for z in (-38,-30,-16,2,11):
    for x in range(-12,13,3):
        box('Moving head base',(x,12.7,z),(.55,.25,.55),black)
        box('Moving head yoke',(x,12.35,z),(.45,.5,.35),steel)
        box('Lens',(x,12.05,z),(.28,.07,.28),white if x%2 else red)
for tier in range(5):
    radius=18+tier*3.3;y=tier*2.4
    ellipse_band(radius,3.25,y,.6)
    ellipse_band(radius-.08,.16,y+1.15,.55,black)
    ellipse_rail(radius-.1,y+.9,edge)
    ellipse_rail(radius-.1,y+.61,red,.045)
    # Each aisle remains visibly separated by metal uprights.
    for i in range(48):
        t=i*math.tau/48
        beam((math.cos(t)*radius,y,math.sin(t)*radius*2-17),(math.cos(t)*radius,y+1.15,math.sin(t)*radius*2-17),.025)
# Suspended eight-sided scoreboard, with four original TT marks.
bpy.ops.mesh.primitive_cylinder_add(vertices=8,radius=3.4,depth=2.6,location=world((0,11,0)))
drum=bpy.context.object;drum.name='Suspended octagonal scoreboard';drum.data.materials.append(black)
bevel=drum.modifiers.new('Manufactured edge bevel','BEVEL');bevel.width=.05;bevel.segments=2
bpy.ops.object.modifier_apply(modifier=bevel.name)
for y in (9.6,12.4):
    for i in range(64):
        a=i*math.tau/64;b=(i+1)*math.tau/64
        beam((3.45*math.cos(a),y,3.45*math.sin(a)),(3.45*math.cos(b),y,3.45*math.sin(b)),.045,red)
for angle in (0,math.pi/2,math.pi,3*math.pi/2):
    normal=Vector((math.sin(angle),0,math.cos(angle)))
    text=bpy.data.curves.new('TT personal branding','FONT');text.body='TT';text.align_x='CENTER';text.align_y='CENTER';text.size=1.5;text.extrude=.012
    font=Path('C:/Windows/Fonts/impact.ttf')
    if font.exists():text.font=bpy.data.fonts.load(str(font))
    obj=bpy.data.objects.new('Scoreboard TT',text);bpy.context.collection.objects.link(obj);obj.location=world(tuple(normal*3.5+Vector((0,11,0))))
    obj.rotation_euler=Vector(world(normal)).to_track_quat('Z','Y').to_euler();obj.data.materials.append(red)
    bpy.context.view_layer.objects.active=obj;obj.select_set(True);bpy.ops.object.convert(target='MESH');obj.select_set(False)
for x in (-2,2):beam((x,12.5,0),(x,17,0),.06,steel)
# Produce static meshes with proper UVs, edge bevels and reusable materials.
for matname,(verts,faces) in batches.items():
    mesh=bpy.data.meshes.new(matname+' geometry');mesh.from_pydata(verts,[],faces);mesh.update()
    bm=bmesh.new();bm.from_mesh(mesh);bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces));bm.to_mesh(mesh);bm.free()
    obj=bpy.data.objects.new(matname,mesh);bpy.context.collection.objects.link(obj);obj.data.materials.append(bpy.data.materials[matname])
    uv=mesh.uv_layers.new(name='Manufactured surface UV')
    for face in mesh.polygons:
        axis=max(range(3),key=lambda n:abs(face.normal[n]));axes=[n for n in range(3) if n!=axis]
        for loop in face.loop_indices:
            co=mesh.vertices[mesh.loops[loop].vertex_index].co
            uv.data[loop].uv=(co[axes[0]]*.35,co[axes[1]]*.35)
    if matname not in (red.name,white.name,concrete.name):
        bevel=obj.modifiers.new('Manufactured bevelled edges','BEVEL');bevel.width=.015;bevel.segments=2;bevel.limit_method='ANGLE';bevel.angle_limit=.65
# Review cameras use the same six compositions as the live journey.
CAMERAS=[('01 Entrance',(0,2.5,-17),(0,4.6,-40)),('02 Intro',(-8,2.8,-25),(0,5.2,-40)),('03 Walk',(-1.2,2.5,-22),(0,1.6,-6)),('04 Projects',(0,5.3,20),(0,5.3,1.2)),('05 Skills',(8.7,3.1,7.5),(8,2.7,1)),('06 Contact',(-8,3.1,7.5),(-8,2.7,1))]
for name,p,target in CAMERAS:
    cam=bpy.data.cameras.new(name);obj=bpy.data.objects.new(name,cam);bpy.context.collection.objects.link(obj);obj.location=world(p);obj.rotation_euler=(Vector(world(target))-obj.location).to_track_quat('-Z','Y').to_euler();cam.lens=30
    if name.startswith('01'):bpy.context.scene.camera=obj
# Lights are retained in the editable source; the web owns dynamic fixtures.
for x in (-10,10):
    light=bpy.data.lights.new('White arena fill','AREA');light.energy=2200;light.shape='DISK';light.size=8
    obj=bpy.data.objects.new(light.name,light);bpy.context.collection.objects.link(obj);obj.location=world((x,12,-20));obj.rotation_euler=(Vector(world((0,0,-20)))-obj.location).to_track_quat('-Z','Y').to_euler()
scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=32;scene.render.resolution_x=1440;scene.render.resolution_y=900;scene.render.resolution_percentage=100
scene.world.color=(.04,.04,.04)
scene['asset_status']='Original procedural architecture; personal avatar and crowd remain separate live assets. Not an exact photographic reconstruction.'
bpy.ops.export_scene.gltf(filepath=str(WEB/'tt-arena-architecture.glb'),export_format='GLB',export_cameras=False,export_lights=False,export_animations=False,export_extras=True,export_meshopt_compression_enable=True)
# Bring the existing rig and its walk/idle actions into the editable review scene.
# It is explicitly a temporary stand-in, not a completed likeness.
rigpath=WEB/'tt-temporary.glb'
if rigpath.exists():
    before=set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=str(rigpath))
    imported=set(bpy.data.objects)-before
    journey=bpy.data.objects.new('Temporary avatar journey - likeness pending',None);bpy.context.collection.objects.link(journey)
    for obj in imported:
        if obj.parent is None:obj.parent=journey
    for frame,pos in [(1,(0,1.1,-35)),(100,(0,1.1,-33)),(220,(0,.6,-22)),(340,(0,0,-9)),(400,(-5.9,0,-2.45)),(440,(-2.5,1.27,-2.45)),(480,(0,1.27,0)),(720,(0,1.27,0))]:
        journey.location=world(pos);journey.keyframe_insert(data_path='location',frame=frame)
    journey['status']='Temporary procedural rig; not a faithful owner likeness'
    scene.frame_end=720;scene.render.fps=30
    for obj in imported:
        if obj.type=='ARMATURE':obj['animation_note']='Imported original walk, idle, pose and turn clips. Root path requires final retargeting for a finished performance.'
exec(compile((ROOT/'scripts'/'blender'/'complete_review.py').read_text(encoding='utf-8-sig'), 'complete_review.py', 'exec'))
scene.frame_set(1)
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'tt-arena.blend'))
(OUT/'build-manifest.json').write_text(json.dumps({'source':'tt-arena.blend','asset':'/models/tt-arena-architecture.glb','cameras':[c[0] for c in CAMERAS],'units':'metres','coordinate_system':'Y-up glTF','status':'editable six-scene review, faithful likeness pending','chapter_frames':[1,100,300,480,610,720],'review_scene':True},indent=2))
print('TT_ARENA_BUILD_COMPLETE',flush=True)
