import { buildEquipment } from '../lib/arena/equipment.mjs';
import fs from 'node:fs/promises';
const results=[];
for(const mobile of [false,true]) for(const kind of ['speaker','desk','flightcase','headset','mount']) {
  let triangles=0,invalid=0,degenerate=0,boundary=0,nonmanifold=0;
  const batches=buildEquipment(kind,mobile);
  for(const {geometry} of batches) {
    const p=geometry.attributes.position,n=geometry.attributes.normal,indices=geometry.index.array;
    const welded=new Map(),ids=[],edges=new Map();
    for(let i=0;i<p.count;i++) {
      const v=[p.getX(i),p.getY(i),p.getZ(i)];
      if(!v.every(Number.isFinite)||![n.getX(i),n.getY(i),n.getZ(i)].every(Number.isFinite))invalid++;
      const key=v.map(c=>Math.round(c*1e5)).join(':');
      if(!welded.has(key))welded.set(key,welded.size);
      ids.push(welded.get(key));
    }
    for(let i=0;i<indices.length;i+=3) {
      const t=Array.from(indices.slice(i,i+3));triangles++;
      if(t.some(v=>v>=p.count))invalid++;
      const points=t.map(v=>[p.getX(v),p.getY(v),p.getZ(v)]);
      const u=points[1].map((c,k)=>c-points[0][k]),v=points[2].map((c,k)=>c-points[0][k]);
      const cross=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];
      if(Math.hypot(...cross)<1e-12)degenerate++;
      for(let j=0;j<3;j++){const a=ids[t[j]],b=ids[t[(j+1)%3]],key=a<b?`${a}:${b}`:`${b}:${a}`;edges.set(key,(edges.get(key)||0)+1);}
    }
    boundary += [...edges.values()].filter(n=>n===1).length;
    nonmanifold += [...edges.values()].filter(n=>n>2).length;
    geometry.dispose();
  }
  results.push({kind,lod:mobile?'mobile':'desktop',materialBatches:batches.length,triangles,invalid,degenerate,boundary,nonmanifold});
}
const report={generatedAt:new Date().toISOString(),results,pass:results.every(r=>!r.invalid&&!r.degenerate&&!r.boundary&&!r.nonmanifold),scope:'Native Three.js equipment: finite vertices/normals, triangle areas, welded closed edge connectivity. Assembled contacts and artistic quality require browser review. Blender garment QA is a separate unchanged report.'};
await fs.writeFile('art/tt-arena/reference-correction/equipment-qa.json',JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
if(!report.pass)process.exitCode=1;
