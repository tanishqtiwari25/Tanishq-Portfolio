import bpy, json
from pathlib import Path
root=Path(__file__).resolve().parents[2]
bpy.ops.wm.read_factory_settings(use_empty=True)
assert 'FINISHED' in bpy.ops.import_scene.gltf(filepath=str(root/'public/models/tt-temporary.glb'))
for o in bpy.data.objects:
    if o.type=='ARMATURE':
        print('RIG_INSPECT',json.dumps({'name':o.name,'matrix':[list(row) for row in o.matrix_world],'bones':{b.name:[list(b.head_local),list(b.tail_local)] for b in o.data.bones}}))
