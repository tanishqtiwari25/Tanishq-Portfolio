import fs from 'node:fs';
const path='art/tt-arena/entrance-assets/character-plan.json',p=JSON.parse(fs.readFileSync(path));
const b=(line,refs,reason)=>({lines:[line],refs,reason,basis:'source'});
p.bindings=[
 b(14,['bpy.types.Context.html#bpy.types.Context.scene'],'Run the already reviewed installed environment reporter; record actual runtime observations.'),
 b(21,['bpy.types.BlendData.html#bpy.types.BlendData.objects'],'Read factory objects owned by this new process.'),
 b(22,['bpy.types.BlendDataObjects.html#bpy.types.BlendDataObjects.remove'],'Unlink the owned factory objects before importing the candidate.'),
 b(23,['bpy.ops.import_scene.html#bpy.ops.import_scene.gltf'],'Load the candidate binary glTF with packed images using the documented filepath; no external program scripts are run.'),
 b(24,['bpy.types.BlendData.html#bpy.types.BlendData.objects','bpy.types.Object.html#bpy.types.Object.type','bpy.types.ID.html#bpy.types.ID.name'],'Collect actual imported mesh object names.'),
 b(34,['bmesh.html','mathutils.bvhtree.html','mathutils.kdtree.html'],'Execute the reviewed QA helper with its documented no_modifiers option to review the rest mesh, UVs, skin weights and proximity. Posed deformation is a separate browser review; all QA errors withhold export.'),
 {lines:[28,29,30,31,38,39,48],basis:'general_python',reason:'Serialize reviewed helper hashes, output JSON and file sizes; these are ordinary Python filesystem operations.'},
 b(40,['bpy.ops.wm.html#bpy.ops.wm.save_as_mainfile'],'Save a compressed editable candidate sibling, never overwriting the original garment.'),
 b(42,['bpy.ops.render.html#bpy.ops.render.render','bpy.types.RenderSettings.html#bpy.types.RenderSettings.engine'],'Execute the reviewed Workbench helper for four angles in solid and wire mode; not a photorealistic render claim.'),
 b(47,['bpy.ops.export_scene.html#bpy.ops.export_scene.gltf'],'Export GLB only after passing QA; ACTIONS retains available rig clips, with meshopt disabled for the independent later compression step.'),
];p.unresolved=[];delete p.seal;fs.writeFileSync(path,JSON.stringify(p,null,2));


