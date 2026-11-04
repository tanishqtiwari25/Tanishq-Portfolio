// Photo-guided wardrobe and projected face study; preserve the source rig/clips.
import fs from 'node:fs/promises';
import * as T from 'three';
import sharp from 'sharp';
const OUT='art/tt-arena/photo-outfit';await fs.mkdir(OUT,{recursive:true});
const bytes=await fs.readFile('art/tt-arena/face-likeness/performer-preserved.glb'),n=bytes.readUInt32LE(12);
const j=JSON.parse(bytes.subarray(20,20+n)),bin=bytes.subarray(28+n),chunks=[bin];let cursor=bin.length;
const widths={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT4:16},sizes={5121:1,5123:2,5125:4,5126:4};
function read(index){const a=j.accessors[index],v=j.bufferViews[a.bufferView],width=widths[a.type],size=sizes[a.componentType],offset=(v.byteOffset||0)+(a.byteOffset||0),stride=v.byteStride||width*size;return Array.from({length:a.count},(_,i)=>Array.from({length:width},(_,k)=>bin[{5121:'readUInt8',5123:'readUInt16LE',5125:'readUInt32LE',5126:'readFloatLE'}[a.componentType]](offset+i*stride+k*size)));}
function put(data,target){const pad=(4-cursor%4)%4;if(pad){chunks.push(Buffer.alloc(pad));cursor+=pad;}const index=j.bufferViews.length;j.bufferViews.push({buffer:0,byteOffset:cursor,byteLength:data.length,...(target?{target}:{})});chunks.push(data);cursor+=data.length;return index;}
function append(rows,type='VEC3',componentType=5126,target=34962){const width=widths[type],array=componentType===5123?new Uint16Array(rows.flat()):componentType===5125?new Uint32Array(rows.flat()):new Float32Array(rows.flat());const a={bufferView:put(Buffer.from(array.buffer),target),componentType,count:array.length/width,type};if(type==='VEC3'){a.min=[0,1,2].map(k=>Math.min(...rows.map(r=>r[k])));a.max=[0,1,2].map(k=>Math.max(...rows.map(r=>r[k])));}j.accessors.push(a);return j.accessors.length-1;}
async function texture(data,name){const image=j.images.length;j.images.push({name,bufferView:put(data),mimeType:'image/png'});j.textures.push({source:image,sampler:0});return j.textures.length-1;}
const photo='C:/Users/Tanishq Tiwari/Downloads/WhatsApp Image 2026-11-01 at 22.56.57.jpeg';
// Only the head crop is embedded; background and full-body photo are not shipped.
const crop={left:490,top:440,width:300,height:330};
const portrait=await texture(await sharp(photo).extract(crop).png().toBuffer(),'T_Owner_Head_Reference_Crop');
const face=j.materials.length;j.materials.push({name:'M_Photo_Guided_Face',pbrMetallicRoughness:{baseColorTexture:{index:portrait},metallicFactor:0,roughnessFactor:.79}});
const photoUV=points=>points.map(([x,y])=>[(629+1310*x-350*(y-1.642)-crop.left)/crop.width,(595-350*x-1310*(y-1.642)-crop.top)/crop.height]);
let photoTriangles=0;
for(const mesh of j.meshes){
  const next=[];
  for(const p of mesh.primitives){
    const material=j.materials[p.material].name;
    if(material==='M_Neutral_Hands'||material==='M_Brown_Eyes'){
      const points=read(p.attributes.POSITION),ids=read(p.indices).flat(),front=[],rest=[];
      for(let i=0;i<ids.length;i+=3){const tri=ids.slice(i,i+3),mean=tri.reduce((a,k)=>a.map((v,d)=>v+points[k][d]/3),[0,0,0]);
        (mean[1]>1.55&&mean[2]>.065&&Math.abs(mean[0])<.077?front:rest).push(...tri);}
      if(rest.length)next.push({...p,indices:append(rest.map(i=>[i]),'SCALAR',5125,34963)});
      if(front.length){const attrs={...p.attributes,TEXCOORD_0:append(photoUV(points),'VEC2')};delete attrs.COLOR_0;next.push({...p,material:face,attributes:attrs,indices:append(front.map(i=>[i]),'SCALAR',5125,34963)});photoTriangles+=front.length/3;}
    }else if(material==='M_Authored_Padded_Jacket_Jeans'){
      const points=read(p.attributes.POSITION),ids=read(p.indices).flat(),coat=[],pants=[];
      for(let i=0;i<ids.length;i+=3){const tri=ids.slice(i,i+3);(tri.reduce((s,k)=>s+points[k][1]/3,0)>.94?coat:pants).push(...tri);}
      const coatMat=j.materials.length;j.materials.push({name:'M_Olive_Coat',pbrMetallicRoughness:{baseColorFactor:[.105,.09,.058,1],metallicFactor:0,roughnessFactor:.91},normalTexture:p.material!==undefined?j.materials[p.material].normalTexture:undefined});
      if(coat.length)next.push({...p,material:coatMat,indices:append(coat.map(i=>[i]),'SCALAR',5125,34963)});
      if(pants.length){
        const pantsMat=j.materials.length;j.materials.push({name:'M_Charcoal_Trousers',pbrMetallicRoughness:{baseColorFactor:[.024,.027,.03,1],metallicFactor:0,roughnessFactor:.92},normalTexture:j.materials[p.material].normalTexture});
        next.push({...p,material:pantsMat,indices:append(pants.map(i=>[i]),'SCALAR',5125,34963)});
      }
    }else if(material==='M_TT_Black_Hair'){
      const points=read(p.attributes.POSITION),ids=read(p.indices).flat();
      for(const pt of points){const height=pt[1]-1.69;pt[1]=1.69+height*.78;pt[0]-=.10*height;}
      const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(points.flat(),3));geometry.setIndex(ids);geometry.computeVertexNormals();
      next.push({...p,attributes:{...p.attributes,POSITION:append(points),NORMAL:append(Array.from({length:points.length},(_,i)=>[geometry.attributes.normal.getX(i),geometry.attributes.normal.getY(i),geometry.attributes.normal.getZ(i)]))}});geometry.dispose();
    }else next.push(p);
  }mesh.primitives=next;
}

// Original vector-authored paisley motif: gold threads on teal cloth.
const pattern=`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 128 128"><defs><pattern id="p" width="64" height="64" patternUnits="userSpaceOnUse"><rect width="64" height="64" fill="#164b52"/><g fill="none" stroke="#b59b58" stroke-width=".8"><path d="M17 11C48-3 62 36 39 48C13 62 6 27 23 24C35 20 43 37 31 39C20 42 18 32 26 31C19 15 44 17 45 30C49 5 20 4 17 11Z"/><path d="M18 12C9 23 9 45 29 51M45 13C59 23 52 48 39 53" stroke-dasharray="1 2"/><path d="M4 4L7 7L4 10L1 7ZM59 53L62 56L59 59L56 56ZM9 57L12 60L9 63L6 60Z"/><circle cx="52" cy="5" r="2"/><path d="M3 37q9-8 12 0q-7 8-12 0M46 61q7-9 10-2"/></g></pattern></defs><rect width="128" height="128" fill="url(#p)"/></svg>`;
const scarfTexture=await texture(await sharp(Buffer.from(pattern)).png().toBuffer(),'T_Teal_Gold_Paisley');
const scarfMat=j.materials.length;j.materials.push({name:'M_Teal_Gold_Scarf',pbrMetallicRoughness:{baseColorTexture:{index:scarfTexture},metallicFactor:0,roughnessFactor:.94}});
const shirtMat=j.materials.length;j.materials.push({name:'M_Light_Cotton_Shirt',pbrMetallicRoughness:{baseColorFactor:[.63,.62,.58,1],metallicFactor:0,roughnessFactor:.92}});
const lapelMat=j.materials.length;j.materials.push({name:'M_Olive_Coat_Lapels',pbrMetallicRoughness:{baseColorFactor:[.076,.069,.047,1],metallicFactor:0,roughnessFactor:.9}});
const neckMat=j.materials.length;j.materials.push({name:'M_Neck_Skin',pbrMetallicRoughness:{baseColorFactor:[.27,.145,.09,1],metallicFactor:0,roughnessFactor:.79}});
const joints=j.skins[0].joints.map(i=>j.nodes[i].name),spine=joints.indexOf('Spine'),hips=joints.indexOf('Hips');
function patch(name,material,N,M,surface,thickness=.004){
  const points=[],uv=[],faces=[];
  for(let back=0;back<2;back++)for(let i=0;i<=N;i++)for(let k=0;k<=M;k++){const u=k/M,t=i/N,p=surface(u,t);points.push([p[0],p[1],p[2]-back*thickness]);uv.push([u*2.5,t*12]);}
  const stride=M+1,offset=(N+1)*stride;
  for(let i=0;i<N;i++)for(let k=0;k<M;k++){const a=i*stride+k,b=a+1,c=b+stride,d=a+stride;faces.push([a,b,c],[a,c,d],[a+offset,c+offset,b+offset],[a+offset,d+offset,c+offset]);}
  const boundary=[];for(let k=0;k<M;k++)boundary.push([k,k+1]);for(let i=0;i<N;i++)boundary.push([i*stride+M,(i+1)*stride+M]);for(let k=M;k>0;k--)boundary.push([N*stride+k,N*stride+k-1]);for(let i=N;i>0;i--)boundary.push([i*stride,(i-1)*stride]);
  for(const [a,b] of boundary){
    const k=points.length;points.push(points[b].slice(),points[a].slice(),points[a+offset].slice(),points[b+offset].slice());uv.push([0,0],[1,0],[1,.04],[0,.04]);faces.push([k,k+1,k+2],[k,k+2,k+3]);
  }
  for(const f of faces)f.reverse();
  const volume=faces.reduce((sum,[a,b,c])=>sum+new T.Vector3(...points[a]).dot(new T.Vector3(...points[b]).cross(new T.Vector3(...points[c])))/6,0);
  if(volume<0)for(const f of faces)f.reverse();
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(points.flat(),3));g.setIndex(faces.flat());g.computeVertexNormals();
  const skinJ=[],skinW=[];for(const [,y] of points){const w=T.MathUtils.smoothstep(y, .85,1.17);skinJ.push([spine,hips,0,0]);skinW.push([w,1-w,0,0]);}
  j.meshes[0].primitives.push({material,attributes:{POSITION:append(points),NORMAL:append(Array.from({length:points.length},(_,i)=>[g.attributes.normal.getX(i),g.attributes.normal.getY(i),g.attributes.normal.getZ(i)])),TEXCOORD_0:append(uv,'VEC2'),JOINTS_0:append(skinJ,'VEC4',5123),WEIGHTS_0:append(skinW,'VEC4')},indices:append(faces.flat().map(i=>[i]),'SCALAR',5125,34963),extras:{name}});g.dispose();
}
patch('Light shirt opening',shirtMat,22,12,(u,t)=>[(u-.5)*(.14-.035*t),1.48-.47*t+.007*Math.sin(u*Math.PI)*t**5,.178+.004*Math.cos(u*Math.PI)+.004*Math.sin(t*12+u*3)*Math.sin(t*Math.PI)]);
for(const side of [-1,1]){
  patch('Coat lapel',lapelMat,18,4,(u,t)=>[side*(.07+.035*Math.sin(t*Math.PI)+u*(.055-.025*t)),1.48-.43*t,.185+.006*Math.sin(t*Math.PI)],.005);
  patch(side<0?'Scarf left end':'Scarf right end',scarfMat,34,10,(u,t)=>[side*(.105+.04*Math.sin(t*Math.PI))+(u-.5)*(.095+.012*t),1.515-(side<0?.81:.75)*t,.115+.070*T.MathUtils.smoothstep(t,0,.18)-.012*t+.005*Math.sin(u*Math.PI*5+t*5)*Math.sin(t*Math.PI)],.004);
}
// Closed neck wrap: a narrow elliptical tube with its opening retained.
{
  const points=[],uv=[],faces=[],N=64,M=12;
  for(let i=0;i<N;i++)for(let k=0;k<M;k++){const a=i/N*Math.PI*2,b=k/M*Math.PI*2;points.push([(.12+.013*Math.sin(b))*Math.cos(a),1.505+.025*Math.cos(b),(.13+.013*Math.sin(b))*Math.sin(a)]);uv.push([i/N*3,k/M]);}
  for(let i=0;i<N;i++)for(let k=0;k<M;k++){const a=i*M+k,b=((i+1)%N)*M+k,c=((i+1)%N)*M+(k+1)%M,d=i*M+(k+1)%M;faces.push([a,b,c],[a,c,d]);}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(points.flat(),3));g.setIndex(faces.flat());g.computeVertexNormals();
  j.meshes[0].primitives.push({material:scarfMat,attributes:{POSITION:append(points),NORMAL:append(Array.from({length:points.length},(_,i)=>[g.attributes.normal.getX(i),g.attributes.normal.getY(i),g.attributes.normal.getZ(i)])),TEXCOORD_0:append(uv,'VEC2'),JOINTS_0:append(points.map(()=>[spine,0,0,0]),'VEC4',5123),WEIGHTS_0:append(points.map(()=>[1,0,0,0]),'VEC4')},indices:append(faces.flat().map(i=>[i]),'SCALAR',5125,34963)});g.dispose();
}
// Anatomical connection formerly hidden by the hood. Its top follows Head,
// while its base follows Spine; both caps are inside the existing body/head.
{
  const g=new T.CylinderGeometry(.038,.050,.086,32,8,false);g.translate(0,1.528,.008);
  const points=Array.from({length:g.attributes.position.count},(_,i)=>[g.attributes.position.getX(i),g.attributes.position.getY(i),g.attributes.position.getZ(i)]),normals=Array.from({length:points.length},(_,i)=>[g.attributes.normal.getX(i),g.attributes.normal.getY(i),g.attributes.normal.getZ(i)]),uv=Array.from({length:points.length},(_,i)=>[g.attributes.uv.getX(i),g.attributes.uv.getY(i)]),head=joints.indexOf('Head');
  j.meshes[0].primitives.push({material:neckMat,attributes:{POSITION:append(points),NORMAL:append(normals),TEXCOORD_0:append(uv,'VEC2'),JOINTS_0:append(points.map(()=>[head,spine,0,0]),'VEC4',5123),WEIGHTS_0:append(points.map(([,y])=>{const w=T.MathUtils.smoothstep(y,1.495,1.565);return [w,1-w,0,0];}),'VEC4')},indices:append(Array.from(g.index.array,i=>[i]),'SCALAR',5125,34963)});g.dispose();
}
j.asset.extras={...j.asset.extras,outfit:'Olive coat, light shirt and original teal/gold paisley scarf; photo-projected front face. Approximate reference study; lighting in the supplied photo is not de-lit.'};
const padding=(4-cursor%4)%4;if(padding){chunks.push(Buffer.alloc(padding));cursor+=padding;}j.buffers[0].byteLength=cursor;
let json=Buffer.from(JSON.stringify(j));json=Buffer.concat([json,Buffer.alloc((4-json.length%4)%4,32)]);const data=Buffer.concat(chunks),header=Buffer.alloc(20),tail=Buffer.alloc(8);header.writeUInt32LE(0x46546c67);header.writeUInt32LE(2,4);header.writeUInt32LE(28+json.length+data.length,8);header.writeUInt32LE(json.length,12);header.writeUInt32LE(0x4e4f534a,16);tail.writeUInt32LE(data.length);tail.writeUInt32LE(0x004e4942,4);
await fs.writeFile(OUT+'/reference-outfit.glb',Buffer.concat([header,json,tail,data]));
await fs.writeFile(OUT+'/authoring.json',JSON.stringify({photoTriangles,sourcePhoto:photo,embeddedCrop:crop,rigBones:joints.length,clips:j.animations.map(a=>a.name),limitations:['Projected photo retains its original lighting.','Unseen side/back face proportions remain approximate.','Scarf pattern is task-authored, not an exact fabric scan.']},null,2));
console.log({photoTriangles,bytes:28+json.length+data.length});
