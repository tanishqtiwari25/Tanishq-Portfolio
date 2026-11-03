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
  const indices=Array.from(g.index.array,i=>originalToWelded[i]);
  const parents=Array.from({length:positions.length/3},(_,i)=>i);
  const root=i=>parents[i]===i?i:(parents[i]=root(parents[i]));
  for(let i=0;i<indices.length;i+=3){parents[root(indices[i])]=root(indices[i+1]);parents[root(indices[i+1])]=root(indices[i+2]);}
  const islands=new Map();
  for(let i=0;i<indices.length;i++){
    const id=root(indices[i]);
    if(!islands.has(id))islands.set(id,{slot:islands.size,min:[Infinity,Infinity],max:[-Infinity,-Infinity]});
    const island=islands.get(id),original=g.index.array[i];
    for(let axis=0;axis<2;axis++){const value=g.attributes.uv.array[original*2+axis];island.min[axis]=Math.min(island.min[axis],value);island.max[axis]=Math.max(island.max[axis],value);}
  }
  const grid=Math.ceil(Math.sqrt(islands.size));
  const loopUV=indices.flatMap((index,i)=>{
    const island=islands.get(root(index)),original=g.index.array[i];
    return [0,1].map(axis=>{
      const local=(g.attributes.uv.array[original*2+axis]-island.min[axis])/Math.max(1e-6,island.max[axis]-island.min[axis]);
      const cell=axis===0?island.slot%grid:Math.floor(island.slot/grid);
      return (cell+.04+local*.92)/grid;
    });
  });
  return {name,material,positions,indices,loopNormals:Array.from(g.index.array).flatMap(i=>Array.from(g.attributes.normal.array.slice(i*3,i*3+3))),loopUV};
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
