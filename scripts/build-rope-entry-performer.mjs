// Local geometry/weight edits and a sampled contact performance, authored in metres.
// This is a generic anatomical performer; no owner's facial likeness is claimed.
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import * as T from 'three';
import {createContactRig,resetContactRig,applyRingContacts} from '../lib/arena/characterPose.mjs';
import {RING_ENTRY,ringEntryPose} from '../lib/arena/ringEntry.mjs';
const out='art/tt-arena/rope-entry';await fs.mkdir(out,{recursive:true});
const source='art/tt-arena/entry-fix/tt-performer-entry-candidate.glb',original=await fs.readFile(source),length=original.readUInt32LE(12);
const j=JSON.parse(original.subarray(20,20+length)),bin=original.subarray(28+length),chunks=[bin];let cursor=bin.length;
const widths={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT4:16},sizes={5121:1,5123:2,5125:4,5126:4},methods={5121:'readUInt8',5123:'readUInt16LE',5125:'readUInt32LE',5126:'readFloatLE'};
function read(index){const a=j.accessors[index],v=j.bufferViews[a.bufferView],w=widths[a.type],size=sizes[a.componentType],stride=v.byteStride||w*size,offset=(v.byteOffset||0)+(a.byteOffset||0);return Array.from({length:a.count},(_,i)=>Array.from({length:w},(_,k)=>bin[methods[a.componentType]](offset+i*stride+k*size)));}
function append(values,width,type='VEC3',component=5126,target){
  const array=component===5121?new Uint8Array(values.flat()):new Float32Array(values.flat()),b=Buffer.from(array.buffer),pad=(4-cursor%4)%4;
  if(pad){chunks.push(Buffer.alloc(pad));cursor+=pad;}
  const bufferView=j.bufferViews.length;j.bufferViews.push({buffer:0,byteOffset:cursor,byteLength:b.length,...(target?{target}:{})});chunks.push(b);cursor+=b.length;
  const a={bufferView,componentType:component,count:array.length/width,type};
  if(type==='SCALAR'||type==='VEC3'){a.min=Array.from({length:width},(_,k)=>Math.min(...values.map(v=>v[k])));a.max=Array.from({length:width},(_,k)=>Math.max(...values.map(v=>v[k])));}
  j.accessors.push(a);return j.accessors.length-1;
}
const smooth=(a,b,x)=>{const t=T.MathUtils.clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};
const names=j.skins[0].joints.map(i=>j.nodes[i].name),hips=names.indexOf('Hips');let modifiedWeights=0;
for(const primitive of j.meshes[0].primitives){
  const material=j.materials[primitive.material].name;
  if(material==='M_Rubber_Sole'){
    const points=read(primitive.attributes.POSITION),ids=read(primitive.indices).flat();
    for(const point of points){
      const centre=Math.sign(point[0])*.13,t=T.MathUtils.clamp((point[2]+.1)/.31,0,1);
      point[0]=centre+(point[0]-centre)*(.78+.20*Math.sin(Math.PI*t));
      point[1]=Math.max(.00035,point[1]*.70);
    }
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(points.flat(),3));g.setIndex(ids);g.computeVertexNormals();
    const normals=Array.from({length:points.length},(_,i)=>[g.attributes.normal.getX(i),g.attributes.normal.getY(i),g.attributes.normal.getZ(i)]);
    primitive.attributes.POSITION=append(points,3,'VEC3',5126,34962);primitive.attributes.NORMAL=append(normals,3,'VEC3',5126,34962);g.dispose();
    j.materials[primitive.material].pbrMetallicRoughness.baseColorFactor=[.28,.30,.33,1];
  }
  if(material==='M_Authored_Padded_Jacket_Jeans'){
    const points=read(primitive.attributes.POSITION),joints=read(primitive.attributes.JOINTS_0),weights=read(primitive.attributes.WEIGHTS_0);
    points.forEach((point,i)=>{
      // A loose jacket hem must follow the pelvis rather than folding with thighs.
      const amount=smooth(.88,.995,point[1])*(1-smooth(1.08,1.18,point[1]));if(amount<.001)return;
      const values=new Map();let transfer=0;
      joints[i].forEach((joint,k)=>{
        const moved=/UpLeg|^LeftLeg$|^RightLeg$/.test(names[joint])?weights[i][k]*amount:0;
        values.set(joint,(values.get(joint)||0)+weights[i][k]-moved);transfer+=moved;
      });
      if(transfer<1e-6)return;modifiedWeights++;values.set(hips,(values.get(hips)||0)+transfer);
      const chosen=[...values].sort((a,b)=>b[1]-a[1]).slice(0,4),sum=chosen.reduce((n,[,w])=>n+w,0);
      joints[i]=[0,0,0,0];weights[i]=[0,0,0,0];chosen.forEach(([joint,w],k)=>{joints[i][k]=joint;weights[i][k]=w/sum;});
    });
    primitive.attributes.JOINTS_0=append(joints,4,'VEC4',5121,34962);primitive.attributes.WEIGHTS_0=append(weights,4,'VEC4',5126,34962);
  }
}
const objects=j.nodes.map(n=>{const o=new T.Object3D();o.name=n.name||'';if(n.translation)o.position.fromArray(n.translation);if(n.rotation)o.quaternion.fromArray(n.rotation);if(n.scale)o.scale.fromArray(n.scale);return o;});
j.nodes.forEach((n,i)=>(n.children||[]).forEach(child=>objects[i].add(objects[child])));
const model=new T.Group(),root=new T.Group();j.scenes[j.scene||0].nodes.forEach(i=>model.add(objects[i]));root.add(model);
const rig=createContactRig(model),times=[],poses=rig.bones.map(()=>({rotation:[],translation:[]})),samples=[];
for(let i=0;i<=180;i++){
  const q=i/180,p=RING_ENTRY.start+(RING_ENTRY.end-RING_ENTRY.start)*q,pose=ringEntryPose(p);resetContactRig(rig);
  root.position.fromArray(pose.root);root.rotation.y=Math.PI/2;
  const errors=applyRingContacts(root,rig,pose);times.push([q*6]);
  rig.bones.forEach((bone,k)=>{poses[k].rotation.push(bone.quaternion.toArray());poses[k].translation.push(bone.position.toArray());});
  samples.push({q,root:pose.root,feetError:Math.max(...errors.feet),handsError:Math.max(0,...errors.hands)});
}
const animation={name:'RingEntry',samplers:[],channels:[]},input=append(times,1,'SCALAR');
rig.bones.forEach((bone,k)=>{
  for(const [channel,type,width] of [['rotation','VEC4',4],['translation','VEC3',3]]){
    const sampler=animation.samplers.length;animation.samplers.push({input,output:append(poses[k][channel],width,type),interpolation:'LINEAR'});
    animation.channels.push({sampler,target:{node:j.nodes.findIndex(n=>n.name===bone.name),path:channel}});
  }
});
j.animations=j.animations.filter(a=>a.name!=='RingEntry');j.animations.push(animation);
j.asset.extras={...j.asset.extras,ropeEntry:'Sampled two-hand rope contact, torso duck and alternating step-over; coordinated with ringEntry.mjs. Generic facial identity.'};
const pad=(4-cursor%4)%4;if(pad){chunks.push(Buffer.alloc(pad));cursor+=pad;}j.buffers[0].byteLength=cursor;
const data=Buffer.concat(chunks),raw=Buffer.from(JSON.stringify(j)),json=Buffer.concat([raw,Buffer.alloc((4-raw.length%4)%4,32)]),header=Buffer.alloc(20),tail=Buffer.alloc(8);
header.writeUInt32LE(0x46546c67);header.writeUInt32LE(2,4);header.writeUInt32LE(28+json.length+data.length,8);header.writeUInt32LE(json.length,12);header.writeUInt32LE(0x4e4f534a,16);tail.writeUInt32LE(data.length);tail.writeUInt32LE(0x004e4942,4);
const result=Buffer.concat([header,json,tail,data]);await fs.writeFile(out+'/performer-candidate.glb',result);
await fs.writeFile(out+'/authored-entry-samples.json',JSON.stringify({source,modifiedWeights,trianglesUnchanged:true,sole:'Tapered toe/heel,30%thinner shaped rubber outsole',clip:'RingEntry',samples,sha256:crypto.createHash('sha256').update(result).digest('hex')},null,2));
console.log({bytes:result.length,modifiedWeights,frames:samples.length,maxFootError:Math.max(...samples.map(s=>s.feetError)),maxHandError:Math.max(...samples.map(s=>s.handsError))});
