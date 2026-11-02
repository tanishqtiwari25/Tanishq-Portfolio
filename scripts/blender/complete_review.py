"""Complete the editable review scene after the web architecture GLB is exported.
This file executes in build_tt_arena.py's namespace. Review geometry is not duplicated in the web GLB.
"""
# Ring, rails, production screens and spectators for an editable six-scene review.
batches={}
canvasmat=material('Ring canvas woven white',(.65,.67,.7),0,.88)
shirtmats=[material('Spectator shirt '+str(i),c,0,.9) for i,c in enumerate([(.035,.05,.075),(.15,.025,.04),(.07,.08,.1),(.3,.3,.29),(.04,.025,.07)])]
skinmats=[material('Generic spectator skin '+str(i),c,0,.72) for i,c in enumerate([(.38,.23,.16),(.58,.38,.26),(.24,.13,.09),(.68,.48,.35)])]
hairmat=material('Generic spectator hair',(.012,.008,.006),0,.82)
box('Ring base',(0,.6,0),(7,1.2,7),black);box('Ring canvas',(0,1.24,0),(7,.06,7),canvasmat)
for x in (-1,1):
    for z in (-1,1):
        beam((x*3.45,0,z*3.45),(x*3.45,3.5,z*3.45),.11,edge)
        for y in (1.8,2.4,3):box('Turnbuckle',(x*3.2,y,z*3.2),(.4,.22,.4),red)
for y in (1.8,2.4,3):
    for side in (-1,1):
        beam((-3.25,y,side*3.25),(3.25,y,side*3.25),.035,canvasmat if y==2.4 else red)
        beam((side*3.25,y,-3.25),(side*3.25,y,3.25),.035,canvasmat if y==2.4 else red)
for i in range(5):box('Ring access stair',(-5.4+i*.5,(i+1)*1.27/10,-2.45),(.5,(i+1)*1.27/5,1.1),steel)
# Shared generic spectator meshes. No face is claimed as the owner's identity.
def ellipsoid(p,size,mat):
    verts=[];faces=[];rings=6;segments=8
    for a in range(rings+1):
        phi=math.pi*a/rings
        for b in range(segments):
            theta=math.tau*b/segments
            verts.append((p[0]+size[0]*math.sin(phi)*math.cos(theta),p[1]+size[1]*math.cos(phi),p[2]+size[2]*math.sin(phi)*math.sin(theta)))
    for a in range(rings):
        for b in range(segments):faces.append((a*segments+b,a*segments+(b+1)%segments,(a+1)*segments+(b+1)%segments,(a+1)*segments+b))
    poly('Generic spectator',verts,faces,mat)
for i in range(3600):
    if i<280:
        side=-1 if i%2 else 1;row=(i//2)%4;n=i//8;x=side*(5+row*.9);z=-31+n*.95;y=0
    else:
        n=i-280;tier=n%5;row=(n//5)%3;r=18+tier*3.3+row*.6;angle=n*2.39996
        x=math.cos(angle)*r;z=math.sin(angle)*r*2-17;y=tier*2.4
        if abs(x)<16 and -43<z<20:continue
    shirt=shirtmats[i%len(shirtmats)];skin=skinmats[i%4]
    ellipsoid((x,y+1.04,z),(.23,.4,.15),shirt)
    ellipsoid((x,y+1.61,z),(.13,.18,.13),skin)
    ellipsoid((x,y+1.73,z-.02),(.135,.09,.13),hairmat)
    for side in (-1,1):
        beam((x+side*.1,y+.1,z),(x+side*.1,y+.7,z),.075,black)
        elbow=(x+side*.33,y+1.1,z)
        hand=(x+side*.39,y+(1.85 if i%3==0 else .94),z+.03)
        beam((x+side*.2,y+1.3,z),elbow,.07,shirt);beam(elbow,hand,.055,skin)
# Material-batched review geometry, independent from the live architecture asset.
for matname,(verts,faces) in batches.items():
    mesh=bpy.data.meshes.new('Review '+matname);mesh.from_pydata(verts,[],faces);mesh.update()
    bm=bmesh.new();bm.from_mesh(mesh);bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces));bm.to_mesh(mesh);bm.free()
    obj=bpy.data.objects.new('Review '+matname,mesh);bpy.context.collection.objects.link(obj);mesh.materials.append(bpy.data.materials[matname])
# The render review uses real project captures. Live buttons remain implemented in React.
fontpath=Path('C:/Windows/Fonts/impact.ttf');reviewfont=bpy.data.fonts.load(str(fontpath)) if fontpath.exists() else None
textwhite=material('Review screen white',(.9,.92,.96),0,.5,1)
def label(body,p,size=.3,color=None,width=None,pitch=0,yaw=0):
    curve=bpy.data.curves.new('Portfolio label','FONT');curve.body=body;curve.align_x='CENTER';curve.align_y='CENTER';curve.size=size;curve.extrude=.001
    if reviewfont:curve.font=reviewfont
    obj=bpy.data.objects.new(body[:40],curve);bpy.context.collection.objects.link(obj);obj.location=world(p);obj.rotation_euler=(math.pi/2+pitch,0,yaw);curve.materials.append(color or textwhite)
    bpy.context.view_layer.update()
    if width and obj.dimensions.x>width:obj.scale.x*=width/obj.dimensions.x
    return obj
def panel(p,size,mat,pitch=0,yaw=0):
    bpy.ops.mesh.primitive_plane_add(size=1,location=world(p));obj=bpy.context.object;obj.name='Review portfolio display';obj.rotation_euler=(math.pi/2+pitch,0,yaw);obj.scale=(size[0],size[1],1);obj.data.materials.append(mat);return obj
def screen_image(path):
    img=bpy.data.images.load(str(path),check_existing=True);img.pack();m=material('Project capture '+path.stem,(0,0,0),0,1)
    tex=m.node_tree.nodes.new('ShaderNodeTexImage');tex.image=img;p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Emission Strength'].default_value=1;m.node_tree.links.new(tex.outputs['Color'],p.inputs['Emission Color']);return m
panel((0,5.7,-40.6),(20.4,8.6),black)
label('TANISHQ',( -4.1,6.7,-40.55),4,width=8)
label('TIWARI',(4.1,6.7,-40.55),4,red,width=8)
label('D E V E L O P E R   P O R T F O L I O',(0,4.8,-40.55),.75,width=15)
label('CODE. BUILD. CREATE.',(0,4.3,-40.55),.32,width=12)
for x,title,capture in [(-4,'WEALTH PILOT','wealth-pilot-capture.webp'),(4,'TRULY GROW','truly-grow-capture.webp')]:
    before_display=set(bpy.data.objects)
    panel((x,5.3,1.25),(7.2,4.3),black)
    for dx in (-3.1,3.1):
        bpy.ops.mesh.primitive_cylinder_add(vertices=8,radius=.055,depth=7.5,location=world((x+dx,9.3,.7)));bpy.context.object.data.materials.append(steel)
    label(title,(x,6.95,1.29),.42,width=6.4)
    panel((x,5.3,1.3),(5.8,2.45),screen_image(ROOT/'public'/'images'/'arena'/capture))
    label('LIVE DEMO     /     SOURCE',(x,3.7,1.31),.25,red,width=6)
    display_root=bpy.data.objects.new('Retracting project display '+title,None);bpy.context.collection.objects.link(display_root)
    for obj in set(bpy.data.objects)-before_display:
        if obj!=display_root:obj.parent=display_root
    for frame,height in [(1,7.5),(430,7.5),(480,0),(550,0),(600,7.5),(720,7.5)]:
        display_root.location.z=height;display_root.keyframe_insert(data_path='location',frame=frame)
for side in (-1,1):
    origin=Vector((side*8,2.65,1.65));pitch=-.38;yaw=.12 if side==1 else 0;rot=Matrix.Rotation(yaw,4,'Y')@Matrix.Rotation(pitch,4,'X')
    def point(x,y,z=.09):return tuple(origin+(rot@Vector((x,y,z,1))).to_3d())
    panel(tuple(origin), (4.2,2.6),black,pitch,yaw)
    if side==1:
        label('ABOUT & SKILLS',point(0,.95),.32,width=3.8,pitch=pitch,yaw=yaw)
        for x,head,body in [(-1.3,'FRONTEND','HTML / CSS\nJS / React'),(0,'BACKEND','APIs / Node\nExpress / Mongo'),(1.3,'TOOLS','Git / GitHub\nVS Code')]:
            label(head,point(x,.45),.17,width=1.15,pitch=pitch,yaw=yaw)
            labels=[('5','3','JS','REACT'),('API','JS','EX','DB'),('Git','GH','VS','DEV')][int(round(x/1.3))+1]
            colors=[[(.8,.11,.025),(.025,.18,.75),(.85,.65,.015),(.015,.5,.7)],[(.06,.27,.12)]*4,[(.7,.08,.025),(.1,.12,.15),(.015,.3,.7),(.1,.12,.15)]][int(round(x/1.3))+1]
            for i,(tile,c) in enumerate(zip(labels,colors)):
                px=x+(-.27 if i%2==0 else .27);py=.02-(i//2)*.58
                tilemat=material('Skill tile '+str(x)+' '+str(i),c,0,.5,.7)
                panel(point(px,py,.105),(.43,.4),tilemat,pitch,yaw)
                label(tile,point(px,py,.115),.19,width=.38,pitch=pitch,yaw=yaw)
    else:
        label('LET’S BUILD',point(0,.55),.43,width=3.7,pitch=pitch,yaw=yaw)
        label('SOMETHING.',point(0,.05),.43,red,width=3.7,pitch=pitch,yaw=yaw)
        label('CONTACT   /   GITHUB   /   LINKEDIN',point(0,-.65),.17,width=3.7,pitch=pitch,yaw=yaw)
# Animate the review camera through the same six chapter compositions.
cam=bpy.data.cameras.new('Animated six-scene camera');camera=bpy.data.objects.new(cam.name,cam);bpy.context.collection.objects.link(camera);cam.lens=30;camera.rotation_mode='QUATERNION'
focus=bpy.data.objects.new('Animated camera focus target',None);bpy.context.collection.objects.link(focus);cam.dof.use_dof=True;cam.dof.aperture_fstop=4;cam.dof.focus_object=focus
chapter_frames=[1,100,300,480,610,720]
for frame,(_,p,target) in zip(chapter_frames,CAMERAS):
    camera.location=world(p);camera.rotation_quaternion=(Vector(world(target))-camera.location).to_track_quat('-Z','Y');camera.keyframe_insert(data_path='location',frame=frame);camera.keyframe_insert(data_path='rotation_quaternion',frame=frame)
    focus.location=world(target);focus.keyframe_insert(data_path='location',frame=frame)
    marker=scene.timeline_markers.new(CAMERAS[chapter_frames.index(frame)][0],frame=frame)
scene.camera=camera;scene.frame_end=720;scene.render.fps=30
# Add physically large fills for a useful offline review render.
for p,target,color,power in [((0,12,-31),(0,1,-34),(1,.03,.06),2200),((0,13,0),(0,0,0),(.8,.88,1),4000),((-12,10,6),(0,2,0),(.75,.85,1),2800)]:
    light=bpy.data.lights.new('Review area fill','AREA');light.energy=power;light.color=color;light.shape='DISK';light.size=7
    obj=bpy.data.objects.new(light.name,light);bpy.context.collection.objects.link(obj);obj.location=world(p);obj.rotation_euler=(Vector(world(target))-obj.location).to_track_quat('-Z','Y').to_euler()
scene['review_note']='Complete editable review layout. Generic crowd and temporary avatar are not photorealistic scans. Camera interpolation and final likeness require further art review.'

# Explicitly dark venue background; camera and root positions retrace without Bezier overshoot.
scene.world.use_nodes=True
background=scene.world.node_tree.nodes.get('Background');background.inputs['Color'].default_value=(.008,.012,.02,1);background.inputs['Strength'].default_value=.3
for action in bpy.data.actions:
    if action.name in ('ConfidentPose','EntranceWalk','Idle','Turn'):continue
    for layer in action.layers:
        for strip in layer.strips:
            for bag in strip.channelbags:
                for curve in bag.fcurves:
                    for key in curve.keyframe_points:key.interpolation='LINEAR'

# Homogeneous arena haze and real spot sources for the offline photographic review.
haze=bpy.data.materials.new('Arena airborne haze');haze.use_nodes=True;nodes=haze.node_tree.nodes;nodes.clear()
output=nodes.new('ShaderNodeOutputMaterial');volume=nodes.new('ShaderNodeVolumePrincipled');volume.inputs['Density'].default_value=.003;volume.inputs['Color'].default_value=(.55,.6,.7,1);volume.inputs['Anisotropy'].default_value=.3;haze.node_tree.links.new(volume.outputs['Volume'],output.inputs['Volume'])
bpy.ops.mesh.primitive_cube_add(size=1,location=world((0,7,-17)));mist=bpy.context.object;mist.name='Review arena haze';mist.scale=(80,100,15);mist.data.materials.append(haze)
for z in (-34,0):
    for i,x in enumerate((-9,-3,3,9)):
        light=bpy.data.lights.new('Review spotlight','SPOT');light.energy=3500;light.color=(1,.035,.07) if i%3==0 else (.8,.88,1);light.spot_size=.36;light.spot_blend=.35;light.shadow_soft_size=.12
        obj=bpy.data.objects.new(light.name,light);bpy.context.collection.objects.link(obj);obj.location=world((x,12.8,z));target=world((-x*.35,0,z+6));obj.rotation_euler=(Vector(target)-obj.location).to_track_quat('-Z','Y').to_euler()

# Retain imported clips, then schedule walk cycles by root-travel distance.
root=bpy.data.objects.get('Temporary avatar journey - likeness pending')
path=[(1,(0,1.1,-35)),(100,(0,1.1,-33)),(220,(0,.6,-22)),(340,(0,0,-9)),(400,(-5.9,0,-2.45)),(440,(-2.5,1.27,-2.45)),(480,(0,1.27,0))]
for obj in bpy.data.objects:
    if obj.type!='ARMATURE' or not obj.animation_data:continue
    walk=bpy.data.actions.get('EntranceWalk');idle=bpy.data.actions.get('Idle')
    if not walk or not idle:continue
    obj.animation_data.action=None
    for track in obj.animation_data.nla_tracks:track.mute=True
    track=obj.animation_data.nla_tracks.new();track.name='Journey synchronized walk and idle';track.mute=False
    for (start,a),(end,b) in zip(path,path[1:]):
        distance=(Vector(b)-Vector(a)).length;cycles=max(.1,distance/1.28)
        strip=track.strips.new('Stride '+str(start),start,walk)
        if len(walk.slots):strip.action_slot=walk.slots[0]
        strip.action_frame_start=walk.frame_range[0];strip.action_frame_end=walk.frame_range[1]
        strip.repeat=cycles;strip.scale=(end-start)/(cycles*(walk.frame_range[1]-walk.frame_range[0]));strip.frame_end=end;strip.extrapolation='NOTHING'
        direction=Vector(b)-Vector(a)
        root.rotation_euler.z=math.atan2(direction.x,direction.z);root.keyframe_insert(data_path='rotation_euler',frame=start)
    strip=track.strips.new('Ring idle',480,idle)
    if len(idle.slots):strip.action_slot=idle.slots[0]
    strip.repeat=6;strip.frame_end=720;strip.extrapolation='NOTHING'
    root.rotation_euler.z=0;root.keyframe_insert(data_path='rotation_euler',frame=480)
    obj['animation_note']='Walk repeats scheduled to root distance; final climb retargeting and likeness remain pending.'
