// Lossless meshopt: preserve small lace triangles instead of quantizing positions.
import fs from 'node:fs/promises';
import sharp from 'sharp';
import { MeshoptEncoder } from 'meshoptimizer/meshopt_encoder.module.js';
await MeshoptEncoder.ready;
const input=await fs.readFile(process.argv[2]), length=input.readUInt32LE(12);
const j=JSON.parse(input.subarray(20,20+length)), bin=input.subarray(28+length);
const webp=process.argv.includes('--webp'),images=new Map();
if(webp){
  const linear=new Set();
  for(const m of j.materials||[])for(const t of [m.normalTexture,m.occlusionTexture,m.pbrMetallicRoughness?.metallicRoughnessTexture]){
    if(t)linear.add(j.textures[t.index].source);
  }
  for(let i=0;i<(j.images||[]).length;i++){
    const img=j.images[i];if(img.bufferView===undefined||img.mimeType!=='image/png')continue;
    const view=j.bufferViews[img.bufferView],data=bin.subarray(view.byteOffset||0,(view.byteOffset||0)+view.byteLength);
    images.set(img.bufferView,await sharp(data).webp(linear.has(i)?{lossless:true}:{quality:90}).toBuffer());img.mimeType='image/webp';
  }
  for(const texture of j.textures||[]){texture.extensions={...texture.extensions,EXT_texture_webp:{source:texture.source}};delete texture.source;}
  j.extensionsUsed=[...new Set([...(j.extensionsUsed||[]),'EXT_texture_webp'])];
  j.extensionsRequired=[...new Set([...(j.extensionsRequired||[]),'EXT_texture_webp'])];
}
const chunks=[];let cursor=0,virtual=0;
const put=data=>{const offset=cursor;chunks.push(Buffer.from(data));cursor+=data.length;const pad=(4-cursor%4)%4;chunks.push(Buffer.alloc(pad));cursor+=pad;return offset;};
for(let i=0;i<j.bufferViews.length;i++){
  const view=j.bufferViews[i],data=images.get(i)||bin.subarray(view.byteOffset||0,(view.byteOffset||0)+view.byteLength);
  if(images.has(i))view.byteLength=data.length;
  const a=j.accessors.find(a=>a.bufferView===i);
  if(a && (view.target===34962||view.target===34963)){
    const width={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT4:16}[a.type],size={5121:1,5123:2,5125:4,5126:4}[a.componentType];
    const stride=view.byteStride||width*size,count=data.length/stride,mode=view.target===34963?'TRIANGLES':'ATTRIBUTES';
    const encoded=MeshoptEncoder.encodeGltfBuffer(data,count,stride,mode);
    view.extensions={EXT_meshopt_compression:{buffer:0,byteOffset:put(encoded),byteLength:encoded.length,byteStride:stride,count,mode,filter:'NONE'}};
    view.buffer=1;view.byteOffset=virtual;virtual+=view.byteLength;virtual=Math.ceil(virtual/4)*4;
  }else{view.buffer=0;view.byteOffset=put(data);}
}
j.extensionsUsed=[...new Set([...(j.extensionsUsed||[]),'EXT_meshopt_compression'])];
j.extensionsRequired=[...new Set([...(j.extensionsRequired||[]),'EXT_meshopt_compression'])];
j.buffers=[{byteLength:cursor},{byteLength:virtual,extensions:{EXT_meshopt_compression:{fallback:true}}}];
let json=Buffer.from(JSON.stringify(j));json=Buffer.concat([json,Buffer.alloc((4-json.length%4)%4,32)]);
const payload=Buffer.concat(chunks),header=Buffer.alloc(20),tail=Buffer.alloc(8);
header.writeUInt32LE(0x46546c67,0);header.writeUInt32LE(2,4);header.writeUInt32LE(28+json.length+payload.length,8);header.writeUInt32LE(json.length,12);header.writeUInt32LE(0x4e4f534a,16);
tail.writeUInt32LE(payload.length,0);tail.writeUInt32LE(0x004e4942,4);
await fs.writeFile(process.argv[3],Buffer.concat([header,json,tail,payload]));
console.log(JSON.stringify({input:input.length,output:28+json.length+payload.length,lossless:!webp,geometryLossless:true,textures:webp?'WebP: lossless linear maps; quality 90 colour maps':'unchanged'}));
