import fs from 'node:fs/promises';
import sharp from 'sharp';
import {buildVenueParts,TIERS} from '../lib/arena/venueDesign.mjs';
const parts=buildVenueParts();
const meshes=parts.map(({name,material,geometry:g})=>{
  const positions=[],vertices=new Map(),originalToWelded=[];
  for(let i=0;i<g.attributes.position.count;i++){
    const p=Array.from(g.attributes.position.array.slice(i*3,i*3+3)),key=p.map(x=>Math.round(x*1e6)).join(',');
    if(!vertices.has(key)){vertices.set(key,positions.length/3);positions.push(...p);}
    originalToWelded.push(vertices.get(key));
  }
  return {name,material,positions,indices:Array.from(g.index.array,i=>originalToWelded[i]),loopNormals:Array.from(g.index.array).flatMap(i=>Array.from(g.attributes.normal.array.slice(i*3,i*3+3))),loopUV:Array.from(g.index.array).flatMap(i=>Array.from(g.attributes.uv.array.slice(i*2,i*2+2),v=>v*.01))};
});
await fs.mkdir('art/tt-arena/reconstruction/venue',{recursive:true});
await fs.writeFile('art/tt-arena/reconstruction/venue/design.json',JSON.stringify({units:'metres',axes:'Three.js Y-up; import as Blender (x,-z,y)',tiers:TIERS,meshes}));
for(const [name,base] of [['Steel',.5],['Paint',.75],['Concrete',.9]]){
  const pixels=Buffer.alloc(512*512*3);
  for(let y=0;y<512;y++)for(let x=0;x<512;x++){
    const hash=Math.sin(x*12.9898+y*78.233)*43758.5453,noise=hash-Math.floor(hash);
    const broad=Math.sin(x*.043+Math.sin(y*.027))*Math.sin(y*.039);
    const rough=Math.max(0,Math.min(1,base+(noise-.5)*.12+broad*.07));
    for(let c=0;c<3;c++)pixels[(y*512+x)*3+c]=Math.round(rough*255);
  }
  await sharp(pixels,{raw:{width:512,height:512,channels:3}}).png().toFile('art/tt-arena/reconstruction/venue/T_'+name+'_Roughness.png');
}
console.log(meshes.map(m=>({name:m.name,triangles:m.indices.length/3})));parts.forEach(p=>p.geometry.dispose());
