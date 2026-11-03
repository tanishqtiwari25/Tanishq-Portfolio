import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
const python=path.resolve('../tools/blender-local-runtime/SourceDir/Blender Foundation/Blender 5.2/5.2/python/bin/python.exe');
const skill='C:/Users/Tanishq Tiwari/.codex/skills/blender-cli/scripts';
const output=path.resolve('art/tt-arena/reconstruction/venue-build-plan.json');
const old=JSON.parse(fs.readFileSync('art/tt-arena/reconstruction/venue-plan.json'));
const types=['BlendData','BlendDataMeshes','BlendDataMaterials','BlendDataCollections','BlendDataObjects','CollectionChildren','UnitSettings','Mesh','UVLoopLayers','MeshUVLoopLayer','MeshUVLoop','Node','NodeSocketColor','NodeSocketFloat','ShaderNodeTexImage','BlendDataImages','Image','ColorManagedInputColorspaceSettings','IDMaterials','Context'];
const additions=types.map(x=>'api:bpy.types.'+x);
for(const id of additions){const card=JSON.parse(execFileSync(python,['-X','utf8',skill+'/features.py','show',id],{encoding:'utf8',stdio:['ignore','pipe','pipe']}));console.log(card.id,card.source_excerpt);}
const sources=[old,...['full-asset-qa','lighting-plan'].map(name=>JSON.parse(fs.readFileSync('art/tt-arena/evidence/'+name+'.json')))];
const features=[...new Set([...sources.flatMap(x=>x.selected_features),...additions])];
execFileSync(python,['-X','utf8',skill+'/features.py','plan','--request','Reconstruct the venue kit using explicit closed meshes; run reviewed scene, geometry and visual QA; export a web GLB',...features.flatMap(x=>['--feature',x]),'--output',output],{stdio:'pipe'});
const plan=JSON.parse(fs.readFileSync(output));
const reads=new Map();for(const source of sources)for(const read of source.reads){
  if(!reads.has(read.ref))reads.set(read.ref,read);
  else {const current=reads.get(read.ref);current.ranges=[...new Map([...current.ranges,...read.ranges].map(r=>[r.join(','),r])).values()];}
}
plan.reads=[...reads.values()];fs.writeFileSync(output,JSON.stringify(plan,null,2));
console.log('Retained authentic previous source-read records:',plan.reads.length);
