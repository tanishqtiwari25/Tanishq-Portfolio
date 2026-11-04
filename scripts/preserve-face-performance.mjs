// Keep exact original sample times; Blender's clip resampling is unnecessary here.
import fs from 'node:fs/promises';
function unpack(bytes){const n=bytes.readUInt32LE(12);return {j:JSON.parse(bytes.subarray(20,20+n)),bin:bytes.subarray(28+n)};}
const old=unpack(await fs.readFile('art/tt-arena/rope-entry/performer-candidate.glb'));
const {j,bin}=unpack(await fs.readFile('art/tt-arena/face-likeness/performer-face.glb'));
const chunks=[bin];let cursor=bin.length;const accessors=new Map(),views=new Map();
function copyAccessor(index){
  if(accessors.has(index))return accessors.get(index);
  const a=structuredClone(old.j.accessors[index]);
  if(!views.has(a.bufferView)){
    const v=structuredClone(old.j.bufferViews[a.bufferView]),data=old.bin.subarray(v.byteOffset||0,(v.byteOffset||0)+v.byteLength);
    const pad=(4-cursor%4)%4;if(pad){chunks.push(Buffer.alloc(pad));cursor+=pad;}
    const next=j.bufferViews.length;views.set(a.bufferView,next);v.buffer=0;v.byteOffset=cursor;
    j.bufferViews.push(v);chunks.push(data);cursor+=data.length;
  }
  a.bufferView=views.get(a.bufferView);const next=j.accessors.length;j.accessors.push(a);accessors.set(index,next);return next;
}
j.animations=old.j.animations.map(original=>{
  const clip=structuredClone(original);
  for(const s of clip.samplers){s.input=copyAccessor(s.input);s.output=copyAccessor(s.output);}
  for(const c of clip.channels){const name=old.j.nodes[c.target.node].name;const node=j.nodes.findIndex(n=>n.name===name);if(node<0)throw Error('Missing '+name);c.target.node=node;}
  return clip;
});
j.asset.extras={...j.asset.extras,face:'Photo-guided approximate likeness: jaw/eye proportions, vertex-colour beard and brows, swept volumetric hair. Not a scan.',animation:'Original five clips preserved without resampling.'};
const pad=(4-cursor%4)%4;if(pad){chunks.push(Buffer.alloc(pad));cursor+=pad;}j.buffers[0].byteLength=cursor;
let json=Buffer.from(JSON.stringify(j));json=Buffer.concat([json,Buffer.alloc((4-json.length%4)%4,32)]);
const data=Buffer.concat(chunks),header=Buffer.alloc(20),tail=Buffer.alloc(8);
header.writeUInt32LE(0x46546c67);header.writeUInt32LE(2,4);header.writeUInt32LE(28+json.length+data.length,8);header.writeUInt32LE(json.length,12);header.writeUInt32LE(0x4e4f534a,16);tail.writeUInt32LE(data.length);tail.writeUInt32LE(0x004e4942,4);
await fs.writeFile('art/tt-arena/face-likeness/performer-preserved.glb',Buffer.concat([header,json,tail,data]));
console.log('Preserved original channels for all five clips.');
