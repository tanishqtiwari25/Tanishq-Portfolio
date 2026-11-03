import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
const python=path.resolve('../tools/blender-local-runtime/SourceDir/Blender Foundation/Blender 5.2/5.2/python/bin/python.exe');
const skill='C:/Users/Tanishq Tiwari/.codex/skills/blender-cli/scripts';
const script=path.resolve('scripts/blender/build_venue_kit.py'),file='art/tt-arena/reconstruction/venue-build-plan.json';
const inspection=JSON.parse(execFileSync(python,['-X','utf8',skill+'/evidence.py','inspect','--script',script],{encoding:'utf8',stdio:['ignore','pipe','pipe']}));
const plan=JSON.parse(fs.readFileSync(file));
const explicit=[
 [[14],['bpy.types.Context.html#bpy.types.Context.scene','bpy.types.Scene.html#bpy.types.Scene.render'], 'Execute the reviewed installed env_report helper; it reads runtime fields and records observations, not claims of rendering support.'],
 [[20],['bpy.types.BlendData.html#bpy.types.BlendData.objects'],'Iterate objects in this fresh owned factory process only.'],
 [[21],['bpy.types.BlendDataObjects.html#bpy.types.BlendDataObjects.remove'],'Unlink and remove owned factory objects, not a user live scene.'],
 [[22],['bpy.types.Context.html#bpy.types.Context.scene'],'Use the active scene.'],
 [[23],['bpy.types.Scene.html#bpy.types.Scene.unit_settings','bpy.types.UnitSettings.html#bpy.types.UnitSettings.system'],'Set the documented METRIC enum.'],
 [[24],['bpy.types.UnitSettings.html#bpy.types.UnitSettings.scale_length'],'Keep metre scale one.'],
 [[25],['bpy.types.BlendDataCollections.html#bpy.types.BlendDataCollections.new'],'Create one named asset collection.'],
 [[26],['bpy.types.Scene.html#bpy.types.Scene.collection','bpy.types.CollectionChildren.html#bpy.types.CollectionChildren.link'],'Attach the asset collection to the active scene.'],
 [[41],['bpy.types.BlendDataMaterials.html#bpy.types.BlendDataMaterials.new'],'Create reusable named material datablocks.'],
 [[42],['bpy.types.Material.html#bpy.types.Material.node_tree','bpy.types.NodeTree.html#bpy.types.NodeTree.nodes','bpy.types.Node.html#bpy.types.Node.type'],'Find the Principled node by its type; runtime iteration must find it.'],
 [[43,44],['bpy.types.Node.html#bpy.types.Node.inputs','bpy.types.NodeSocket.html#bpy.types.NodeSocket.name'],'Record actual input labels and require the requested labels before accessing their defaults.'],
 [[45],['bpy.types.NodeSocketColor.html#bpy.types.NodeSocketColor.default_value'],'Assign authored linear RGBA albedo to the observed Base Color socket.'],
 [[46,47],['bpy.types.NodeSocketFloat.html#bpy.types.NodeSocketFloat.default_value'],'Assign artist-selected metalness and roughness to observed float inputs.'],
 [[49],['bpy.types.BlendDataImages.html#bpy.types.BlendDataImages.load'],'Load the authored PNG roughness maps, reusing already-loaded data.'],
 [[50],['bpy.types.ColorManagedInputColorspaceSettings.html#bpy.types.ColorManagedInputColorspaceSettings.name'],'Tag roughness as the observed Non-Color data space used by the existing runtime.'],
 [[51],['bpy.types.Image.html#bpy.types.Image.pack'],'Embed maps in the editable blend.'],
 [[52],['bpy.types.Nodes.html#bpy.types.Nodes.new'],'Create a documented image sampling node by its class identifier.'],
 [[53],['bpy.types.ShaderNodeTexImage.html#bpy.types.ShaderNodeTexImage.image'],'Set its loaded image datablock.'],
 [[54],['bpy.types.NodeLinks.html#bpy.types.NodeLinks.new','bpy.types.Node.html#bpy.types.Node.outputs','bpy.types.Node.html#bpy.types.Node.inputs'],'Connect the image output to the observed roughness input; verify the export in the web renderer.'],
 [[63],['bpy.types.BlendDataMeshes.html#bpy.types.BlendDataMeshes.new'],'Create a mesh datablock for each authored material batch.'],
 [[64],['bpy.types.Mesh.html#bpy.types.Mesh.from_pydata'],'Build vertices and triangles from explicit arrays; smooth shading enables authored split normals.'],
 [[65],['bpy.types.Mesh.html#bpy.types.Mesh.validate'],'Reject data that required invalid-geometry correction.'],
 [[66],['bpy.types.Mesh.html#bpy.types.Mesh.update'],'Update the new mesh.'],
 [[67],['bpy.types.Mesh.html#bpy.types.Mesh.uv_layers','bpy.types.UVLoopLayers.html#bpy.types.UVLoopLayers.new'],'Create a named UV map.'],
 [[69],['bpy.types.Mesh.html#bpy.types.Mesh.loops'],'Iterate actual mesh loop count.'],
 [[70],['bpy.types.MeshUVLoopLayer.html#bpy.types.MeshUVLoopLayer.data','bpy.types.MeshUVLoop.html#bpy.types.MeshUVLoop.uv'],'Populate UV loop coordinates. The deprecated accessor is still documented and runtime checked.'],
 [[73],['bpy.types.Mesh.html#bpy.types.Mesh.normals_split_custom_set'],'Set authored loop normals after axis conversion.'],
 [[74],['bpy.types.Mesh.html#bpy.types.Mesh.materials','bpy.types.IDMaterials.html#bpy.types.IDMaterials.append'],'Assign the shared material to the mesh.'],
 [[75],['bpy.types.BlendDataObjects.html#bpy.types.BlendDataObjects.new'],'Create an object referencing its mesh.'],
 [[76],['bpy.types.CollectionObjects.html#bpy.types.CollectionObjects.link'],'Link the object to the asset collection.'],
 [[79],['bmesh.html','mathutils.bvhtree.html','mathutils.kdtree.html'],'Execute the reviewed installed QA helper on this named kit; its implementation hashes are retained, and every error withholds export.'],
 [[84],['bpy.ops.wm.html#bpy.ops.wm.save_as_mainfile'],'Save a compressed editable sibling source, never overwriting the old arena.'],
 [[88],['bpy.ops.export_scene.html#bpy.ops.export_scene.gltf'],'Export binary static GLB with normals/UVs/materials, no cameras or clips; GLB registration/format was observed in runtime.json. Compression happens later without lossy quantization.'],
 [[90,91],['bpy.ops.render.html#bpy.ops.render.render','bpy.types.RenderSettings.html#bpy.types.RenderSettings.engine'],'Execute the fully reviewed installed multi-angle review helper in random and wire modes. This is Workbench geometry review, not photorealistic evidence.'],
];
const map=new Map();for(const [lines,refs,reason] of explicit)for(const line of lines)map.set(line,{lines:[line],refs,reason,basis:'source'});
plan.bindings=inspection.review.map(op=>{
 if(map.has(op.line))return map.get(op.line);
 if(op.requires_source)throw Error('Unreviewed Blender operation '+op.line+' '+op.code);
 return {lines:[op.line],basis:'general_python',reason:'Reviewed ordinary Python path, list, dictionary, hashing or serialization operation; it does not access Blender data.'};
});
plan.unresolved=[];delete plan.seal;fs.writeFileSync(file,JSON.stringify(plan,null,2));
console.log('Bound',plan.bindings.length,'reviewed operation lines.');
