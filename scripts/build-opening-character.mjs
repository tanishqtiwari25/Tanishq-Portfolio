// CC0 anatomical base -> authored clothed entrance candidate, retaining the existing export rig.
// This is an anonymous anatomical foundation, never a reconstructed owner face.
import fs from 'node:fs/promises';
import * as T from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import sharp from 'sharp';
const OUT='art/tt-arena/entrance-assets',VENDOR='art/tt-arena/reconstruction/vendor';
await fs.mkdir(OUT,{recursive:true});
const raw=[],uvs=[],faces=[];let group='';
for(const line of (await fs.readFile(`${VENDOR}/makehuman-base.obj`,'utf8')).split(/\r?\n/)){
  const p=line.split(/\s+/);
  if(p[0]==='v')raw.push(p.slice(1,4).map(Number));
  else if(p[0]==='vt')uvs.push(p.slice(1,3).map(Number));
  else if(p[0]==='g')group=p[1];
  else if(p[0]==='f' && group==='body'){
    const f=p.slice(1).map(v=>{const [i,u]=v.split('/').map(Number);return [i-1,u-1];});
    for(let k=1;k<f.length-1;k++)faces.push([f[0],f[k],f[k+1]]);
  }
}
// CC0 vertex displacement data, applied locally as an authored adult base variation.
for(const target of ['asian-male-young.target','universal-average.target']){
  for(const line of (await fs.readFile(`${VENDOR}/${target}`,'utf8')).split(/\r?\n/)){
    const values=line.trim().split(/\s+/).map(Number);
    if(values.length===4 && values.every(Number.isFinite)){
      const [i,x,y,z]=values;raw[i][0]+=x;raw[i][1]+=y;raw[i][2]+=z;
    }
  }
}
const skin=JSON.parse(await fs.readFile(`${VENDOR}/default_weights.mhw`,'utf8')).weights;
const skel=JSON.parse(await fs.readFile(`${VENDOR}/default.mhskel`,'utf8'));
const originalWeights=raw.map(()=>[]);
for(const [name,list] of Object.entries(skin))for(const [i,w] of list)originalWeights[i].push([name,w]);
const bytes=await fs.readFile('public/models/tt-entrance-curvature.glb');
const jsonLength=bytes.readUInt32LE(12),base=JSON.parse(bytes.subarray(20,20+jsonLength));
const oldBin=bytes.subarray(28+jsonLength);
const jointNames=base.skins[0].joints.map(i=>base.nodes[i].name);
const S=.1062;
const global=p=>new T.Vector3(p[0]*S,(p[1]+8.45)*S,(p[2]-.12295)*S);
function joint(name,end){const ids=skel.joints[skel.bones[name][end]];return global(ids.reduce((sum,i)=>sum.map((v,a)=>v+raw[i][a]/ids.length),[0,0,0]));}
function segment(a,b,c,d){
  const source=b.clone().sub(a),target=d.clone().sub(c),q=new T.Quaternion().setFromUnitVectors(source.clone().normalize(),target.clone().normalize()),scale=target.length()/source.length();
  return p=>p.clone().sub(a).applyQuaternion(q).multiplyScalar(scale).add(c);
}
const transforms={};
for(const side of ['L','R']){
  const sign=side==='L'?1:-1,label=side==='L'?'Right':'Left';
  const arm=new T.Vector3(sign*.28,1.4,0),elbow=new T.Vector3(sign*.28,1.1,0),hand=new T.Vector3(sign*.28,.8,0);
  transforms[label+'Arm']=segment(joint('upperarm01.'+side,'head'),joint('lowerarm01.'+side,'head'),arm,elbow);
  transforms[label+'ForeArm']=segment(joint('lowerarm01.'+side,'head'),joint('wrist.'+side,'head'),elbow,hand);
  const hip=new T.Vector3(sign*.13,.92,0),knee=new T.Vector3(sign*.13,.49,0),ankle=new T.Vector3(sign*.13,.05,0);
  transforms[label+'UpLeg']=segment(joint('upperleg01.'+side,'head'),joint('lowerleg01.'+side,'head'),hip,knee);
  transforms[label+'Leg']=segment(joint('lowerleg01.'+side,'head'),joint('foot.'+side,'head'),knee,ankle);
  transforms[label+'Foot']=transforms[label+'Leg'];
}
function mapBone(name){
  const side=name.endsWith('.L')?'Right':name.endsWith('.R')?'Left':'';
  if(/upperarm/.test(name))return side+'Arm';
  if(/lowerarm|wrist|finger|metacarpal/.test(name))return side+'ForeArm';
  if(/upperleg/.test(name))return side+'UpLeg';
  if(/lowerleg/.test(name))return side+'Leg';
  if(/foot|toe/.test(name))return side+'Foot';
  if(/pelvis|root|spine0[45]/.test(name))return 'Hips';
  if(/spine|breast|shoulder|clavicle/.test(name))return 'Spine';
  return 'Head';
}
const weights=originalWeights.map(list=>{
  const m=new Map();for(const [name,w] of list){const n=mapBone(name);m.set(n,(m.get(n)||0)+w);}
  let entries=[...m].sort((a,b)=>b[1]-a[1]).slice(0,4);if(!entries.length)entries=[['Hips',1]];
  const sum=entries.reduce((n,[,w])=>n+w,0);return entries.map(([n,w])=>[n,w/sum]);
});
const normals=raw.map(()=>new T.Vector3());
for(const f of faces){const p=f.map(([i])=>new T.Vector3(...raw[i]));const n=p[1].sub(p[0]).cross(p[2].sub(p[0]));for(const [i] of f)normals[i].add(n);}
normals.forEach(n=>n.normalize());
const footWeight=i=>originalWeights[i].filter(([n])=>/foot|toe/.test(n)).reduce((s,[,w])=>s+w,0);
const handWeight=i=>originalWeights[i].filter(([n])=>/wrist|finger|metacarpal/.test(n)).reduce((s,[,w])=>s+w,0);
const bodyIds=[...new Set(faces.flatMap(f=>f.map(([i])=>i)))];

async function build(hooded){
  const positions=[],vertexWeights=[],triangles=[],materials=[],tex=[];
  const moved=raw.map((p,i)=>{
    const g=global(p),hand=handWeight(i),head=p[1]>6.25;
    const ease=head?0:hand>.35?0:p[1]>.3?.025:.012;
    // Cloth ease and low-amplitude folds over the anatomical foundation.
    const fold=head||hand>.35?0:.0025*Math.sin(p[1]*6+p[0]*3)*Math.sin(p[2]*8);
    g.addScaledVector(normals[i],ease+fold);
    const result=new T.Vector3();
    for(const [bone,w] of weights[i])result.addScaledVector(transforms[bone]?transforms[bone](g):g,w);
    return result;
  });
  const idMap=new Map();
  function addOriginal(i,u){
    const key=i+':'+u;if(idMap.has(key))return idMap.get(key);
    const id=positions.length;positions.push(moved[i].toArray());vertexWeights.push(weights[i]);tex.push(uvs[u]||[0,0]);idMap.set(key,id);return id;
  }
  for(const f of faces){
    if(f.every(([i])=>footWeight(i)>.5 && moved[i].y<.15))continue;
    const head=f.reduce((s,[i])=>s+raw[i][1],0)/3>6.25;
    const hand=f.reduce((s,[i])=>s+handWeight(i),0)/3>.45;
    const y=f.reduce((s,[i])=>s+raw[i][1],0)/3;
    if(hooded && !head && !hand)continue;
    const arms=f.reduce((s,[i])=>s+weights[i].filter(([n])=>/Arm/.test(n)).reduce((n,[,w])=>n+w,0),0)/3;
    if(y>.3 && y<6.25 && arms<.35)continue; // covered anatomy is removed, not displayed as clothing
    triangles.push(f.map(([i,u])=>addOriginal(i,u)));materials.push(head||hand?3:y>.3?0:1);
  }
  // Close source openings/cut cuffs with inset caps; UV seams share geometric vertices in QA.
  function capBoundaries(start=0){
    const welded=new Map(),canonical=positions.map((p,i)=>{const k=p.map(v=>Math.round(v*1e6)).join(',');if(!welded.has(k))welded.set(k,i);return welded.get(k);});
    const edges=new Map();
    for(const f of triangles.slice(start))for(let e=0;e<3;e++){
      const a=canonical[f[e]],b=canonical[f[(e+1)%3]],key=[Math.min(a,b),Math.max(a,b)].join(':');
      if(edges.has(key))edges.delete(key);else edges.set(key,[a,b]);
    }
    const next=new Map([...edges.values()].map(([a,b])=>[a,b])),used=new Set();
    for(const [first] of next){
      if(used.has(first))continue;const loop=[];let v=first;
      while(v!==undefined&&!used.has(v)){used.add(v);loop.push(v);v=next.get(v);}
      if(v!==first || loop.length<3)throw Error('Non-loop boundary in anatomical source');
      const centre=loop.reduce((p,i)=>p.map((x,a)=>x+positions[i][a]/loop.length),[0,0,0]);
      // Inset face openings; foot/trouser cuts remain horizontal.
      if(centre[1]>1.5)centre[2]-=.009;
      const id=positions.length;positions.push(centre);vertexWeights.push(vertexWeights[loop[0]]);tex.push([.5,.5]);
      for(let j=0;j<loop.length;j++){triangles.push([loop[(j+1)%loop.length],loop[j],id]);materials.push(centre[1]>1.5?3:1);}
    }
  }
  capBoundaries();
  // Separate loose sweatshirt, with a dropped hem, broad shoulders and a ribbed collar.
  if(!hooded){
  const rings=[[.958,.218,.132],[.982,.224,.138],[1.035,.23,.142],[1.14,.239,.151],[1.26,.248,.153],[1.39,.252,.151],[1.465,.239,.136],[1.515,.171,.103],[1.548,.082,.075]];
  const torsoStart=positions.length,R=48;
  for(let r=0;r<rings.length;r++)for(let j=0;j<R;j++){
    const [y,rx,rz]=rings[r],a=j/R*Math.PI*2,fold=.003*Math.sin(a*8+r*.8)*(r===0||r===rings.length-1?0:1);
    positions.push([(rx+fold)*Math.sin(a),y,(rz+fold)*Math.cos(a)]);vertexWeights.push([['Spine',y<1.1?.55:1],['Hips',y<1.1?.45:0]].filter(([,w])=>w));tex.push([j/R,r/(rings.length-1)]);
  }
  for(let r=0;r<rings.length-1;r++)for(let j=0;j<R;j++){
    const a=torsoStart+r*R+j,b=torsoStart+r*R+(j+1)%R,c=b+R,d=a+R;
    triangles.push([a,b,c],[a,c,d]);materials.push(0,0);
  }
  for(const top of [false,true]){
    const r=top?rings.length-1:0,id=positions.length;positions.push([0,rings[r][0],0]);vertexWeights.push([[top?'Spine':'Hips',1]]);tex.push([.5,.5]);
    for(let j=0;j<R;j++){const a=torsoStart+r*R+j,b=torsoStart+r*R+(j+1)%R;triangles.push(top?[a,b,id]:[b,a,id]);materials.push(0);}
  }
  }
  if(hooded){
    const spec=(await fs.readFile(`${VENDOR}/system-selected/male_casualsuit05.mhclo`,'utf8'));
    const scale=['x','y','z'].map((axis,k)=>{const line=spec.split(/\r?\n/).find(s=>s.startsWith(axis+'_scale ')).split(/\s+/).slice(1).map(Number);return Math.abs(raw[line[1]][k]-raw[line[0]][k])/line[2];});
    const anchors=spec.split('verts 0')[1].split('delete_verts')[0].trim().split(/\r?\n/).map(l=>l.trim().split(/\s+/).map(Number));
    const fitted=anchors.map(a=>{
      const p=[0,1,2].map(k=>raw[a[0]][k]*a[3]+raw[a[1]][k]*a[4]+raw[a[2]][k]*a[5]+a[6+k]*scale[k]);
      let nearest=0,best=Infinity;
      for(const i of bodyIds){const d=raw[i].reduce((s,n,k)=>s+(n-p[k])**2,0);if(d<best){best=d;nearest=i;}}
      const w=weights[nearest],g=global(p),result=new T.Vector3();
      for(const [bone,value] of w)result.addScaledVector(transforms[bone]?transforms[bone](g):g,value);
      return {p:result,w};
    });
    const uv=[],f=[];
    for(const l of (await fs.readFile(`${VENDOR}/system-selected/male_casualsuit05.obj`,'utf8')).split(/\r?\n/)){
      const p=l.trim().split(/\s+/);
      if(p[0]==='vt')uv.push(p.slice(1,3).map(Number));
      if(p[0]==='f'){const a=p.slice(1).map(v=>v.split('/').map(n=>Number(n)-1));for(let k=1;k<a.length-1;k++)f.push([a[0],a[k],a[k+1]]);}
    }
    const normal=fitted.map(()=>new T.Vector3());
    for(const face of f){const p=face.map(([i])=>fitted[i].p),n=p[1].clone().sub(p[0]).cross(p[2].clone().sub(p[0]));for(const [i] of face)normal[i].add(n);}
    // Match normals across coincident source seam vertices before adding cloth thickness.
    const seamNormals=new Map();
    const seamKeys=fitted.map(v=>v.p.toArray().map(n=>Math.round(n*1e6)).join(','));
    normal.forEach((n,i)=>{if(!seamNormals.has(seamKeys[i]))seamNormals.set(seamKeys[i],new T.Vector3());seamNormals.get(seamKeys[i]).add(n);});
    normal.forEach((n,i)=>n.copy(seamNormals.get(seamKeys[i])).normalize());
    const lookup=new Map(),boundary=new Map();
    for(const face of f){
      const ids=face.map(([i,u])=>{
        const key=i+':'+u;if(!lookup.has(key)){
          const id=positions.length;for(const offset of [.0008,-.0015]){positions.push(fitted[i].p.clone().addScaledVector(normal[i],offset).toArray());vertexWeights.push(fitted[i].w);tex.push(uv[u]);}lookup.set(key,id);
        }return lookup.get(key);
      });
      triangles.push(ids,[ids[2]+1,ids[1]+1,ids[0]+1]);materials.push(7,7);
      for(let e=0;e<3;e++){const a=seamKeys[face[e][0]],b=seamKeys[face[(e+1)%3][0]],key=[a,b].sort().join(':');if(boundary.has(key))boundary.delete(key);else boundary.set(key,[ids[e],ids[(e+1)%3]]);}
    }
    for(const [a,b] of boundary.values()){triangles.push([b,a,a+1],[b,a+1,b+1]);materials.push(7,7);}
  }
  // Hood / scalp is an anatomical shell with an actual open front and 3 mm cloth thickness.
  const shell=hooded?[]:faces.filter(f=>f.every(([i])=>raw[i][1]>7.5) && f.reduce((n,[i])=>n+raw[i][2],0)/3<.62);
  const shellMap=new Map();const shellEdges=new Map();
  for(const f of shell){
    const ids=[];
    for(const [i,u] of f){if(!shellMap.has(i)){
      const n=normals[i],ease=hooded?.004+.031*T.MathUtils.smoothstep(raw[i][1],6.25,7.2):.008,outer=moved[i].clone().addScaledVector(n,ease),inner=outer.clone().addScaledVector(n,-.003);
      const id=positions.length;positions.push(outer.toArray(),inner.toArray());vertexWeights.push([['Head',1]],[['Head',1]]);tex.push(uvs[u]||[0,0],uvs[u]||[0,0]);shellMap.set(i,id);
    }ids.push(shellMap.get(i));}
    triangles.push(ids,[ids[2]+1,ids[1]+1,ids[0]+1]);materials.push(hooded?0:5,hooded?0:5);
    for(let e=0;e<3;e++){const a=ids[e],b=ids[(e+1)%3],key=[Math.min(a,b),Math.max(a,b)].join(':');if(shellEdges.has(key))shellEdges.delete(key);else shellEdges.set(key,[a,b]);}
  }
  for(const [a,b] of shellEdges.values()){triangles.push([b,a,a+1],[b,a+1,b+1]);materials.push(hooded?0:5,hooded?0:5);}
  if(hooded){
    // Tailored hood: continuous rounded crown, open face, doubled cloth and closed rim.
    const rows=[[1.535,.095,.092],[1.58,.118,.12],[1.66,.134,.142],[1.74,.137,.146],[1.81,.112,.12],[1.855,.055,.061],[1.866,.015,.018]];
    const start=positions.length,N=28;
    for(const [y,rx,rz] of rows)for(let j=0;j<=N;j++){
      const a=.7+(Math.PI*2-1.4)*j/N;
      for(const inset of [0,.004]){
        positions.push([(rx-inset)*Math.sin(a),y,(rz-inset)*Math.cos(a)-.005]);
        vertexWeights.push([['Head',1]]);tex.push([j/N,(y-1.535)/.331]);
      }
    }
    const q=(a,b,c,d)=>{triangles.push([a,b,c],[a,c,d]);materials.push(0,0);};
    for(let r=0;r<rows.length-1;r++)for(let j=0;j<N;j++){
      const a=start+2*(r*(N+1)+j),b=a+2,c=b+2*(N+1),d=a+2*(N+1);
      q(a,b,c,d);q(d+1,c+1,b+1,a+1);
    }
    for(let j=0;j<N;j++){let a=start+j*2;q(a+1,a+3,a+2,a);a=start+2*((rows.length-1)*(N+1)+j);q(a,a+2,a+3,a+1);}
    for(let r=0;r<rows.length-1;r++){let a=start+2*r*(N+1),b=a+2*(N+1);q(a,b,b+1,a+1);a+=2*N;b+=2*N;q(a+1,b+1,b,a);}
  }
  // Purpose-modelled layered sneakers, with a flat sole and shaped toe/heel.
  function shape(g,material,bone){
    const offset=positions.length,p=g.attributes.position,u=g.attributes.uv;
    for(let i=0;i<p.count;i++){positions.push([p.getX(i),p.getY(i),p.getZ(i)]);vertexWeights.push([[bone,1]]);tex.push(u?[u.getX(i),u.getY(i)]:[0,0]);}
    const index=g.index?.array||Array.from({length:p.count},(_,i)=>i);
    for(let i=0;i<index.length;i+=3){triangles.push([offset+index[i],offset+index[i+1],offset+index[i+2]]);materials.push(material);}g.dispose();
  }
  for(const side of [-1,1]){
    const bone=side===1?'RightFoot':'LeftFoot';
    const sole=new RoundedBoxGeometry(.18,.035,.31,2,.012);sole.translate(side*.13,.018,.055);shape(sole,2,bone);
    const shoe=new T.SphereGeometry(1,18,12);shoe.scale(.085,.065,.151);shoe.translate(side*.13,.082,.052);shape(shoe,hooded?0:1,bone);
    for(let j=0;j<4;j++){const lace=new T.BoxGeometry(.1,.005,.008);lace.translate(side*.13,.14-j*.005,.03+j*.022);shape(lace,4,bone);}
  }
  // The official low-poly eye asset explicitly maps each eye vertex to a base helper ID.
  const eyeMap=(await fs.readFile(`${VENDOR}/system-selected/low-poly.mhclo`,'utf8')).split('verts 0')[1].trim().split(/\s+/).map(Number);
  const eyeUV=[],eyeFaces=[];
  for(const line of (await fs.readFile(`${VENDOR}/system-selected/low-poly.obj`,'utf8')).split(/\r?\n/)){
    const p=line.trim().split(/\s+/);
    if(p[0]==='vt')eyeUV.push(p.slice(1,3).map(Number));
    if(p[0]==='f'){
      const f=p.slice(1).map(v=>v.split('/').map(Number));
      for(let k=1;k<f.length-1;k++)eyeFaces.push([f[0],f[k],f[k+1]]);
    }
  }
  const eyePositions=eyeMap.map(i=>global(raw[i]));
  const eyeCentres=[-1,1].map(sign=>{
    const points=eyePositions.filter(p=>Math.sign(p.x)===sign);
    return points.reduce((p,v)=>p.addScaledVector(v,1/points.length),new T.Vector3());
  });
  for(const f of eyeFaces){
    const ids=f.map(([v,u])=>{const id=positions.length,p=eyePositions[v-1].clone(),centre=eyeCentres[p.x<0?0:1];p.sub(centre).multiplyScalar(.92).add(centre);p.z-=.001;positions.push(p.toArray());vertexWeights.push([['Head',1]]);tex.push(eyeUV[u-1]);return id;});
    triangles.push(ids);materials.push(6);
  }
  if(false && hooded){
    const back=-.160;
    for(const x of [-.035,.035]){
      const top=new T.BoxGeometry(.054,.009,.006);top.translate(x,1.33,back);shape(top,2,'Spine');
      const stem=new T.BoxGeometry(.009,.052,.006);stem.translate(x,1.302,back-.001);shape(stem,2,'Spine');
    }
  }
  capBoundaries(); // Close the two open backs of the licensed low-poly eye shells.
  // Orient each connected closed surface consistently, including source garment seams.
  const canonical=new Map(),ids=positions.map(p=>{const key=p.map(v=>Math.round(v*1e7)).join(',');if(!canonical.has(key))canonical.set(key,canonical.size);return canonical.get(key);});
  const edges=new Map(),graph=triangles.map(()=>[]);
  triangles.forEach((f,i)=>{for(let k=0;k<3;k++){const a=ids[f[k]],b=ids[f[(k+1)%3]],key=[Math.min(a,b),Math.max(a,b)].join(':');const list=edges.get(key)||[];list.push([i,a<b?1:-1]);edges.set(key,list);}});
  for(const list of edges.values())if(list.length===2){const [[a,da],[b,db]]=list;graph[a].push([b,da===db]);graph[b].push([a,da===db]);}
  const signs=new Map();
  for(let first=0;first<triangles.length;first++)if(!signs.has(first)){
    const component=[],queue=[first];signs.set(first,false);
    for(let n=0;n<queue.length;n++){const i=queue[n];component.push(i);for(const [next,toggle] of graph[i])if(!signs.has(next)){signs.set(next,signs.get(i)!==toggle);queue.push(next);}}
    for(const i of component)if(signs.get(i))triangles[i].reverse();
    let volume=0;for(const i of component){const [a,b,c]=triangles[i].map(v=>new T.Vector3(...positions[v]));volume+=a.dot(b.cross(c))/6;}
    if(volume<0)for(const i of component)triangles[i].reverse();
  }
  // Give cap and thickness triangles explicit local UV charts; preserve all surface UVs.
  for(const f of triangles){
    const [a,b,c]=f.map(i=>tex[i]);
    if(Math.abs((b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]))<1e-10){
      for(let k=0;k<3;k++){const old=f[k];f[k]=positions.length;positions.push([...positions[old]]);vertexWeights.push(vertexWeights[old]);tex.push([[0,0],[1,0],[0,1]][k]);}
    }
  }
  return {positions,triangles,materials,tex,vertexWeights};
}

async function writeCharacter(name,hooded){
  const data=await build(hooded),j=structuredClone(base),chunks=[oldBin];let cursor=oldBin.length;
  const add=(array,type,width,target)=>{
    const pad=(4-cursor%4)%4;if(pad){chunks.push(Buffer.alloc(pad));cursor+=pad;}
    const input=Buffer.from(array.buffer,array.byteOffset,array.byteLength),view=j.bufferViews.length;
    j.bufferViews.push({buffer:0,byteOffset:cursor,byteLength:input.length,target});chunks.push(input);cursor+=input.length;
    const a={bufferView:view,componentType:type,count:array.length/width,type:{1:'SCALAR',2:'VEC2',3:'VEC3',4:'VEC4'}[width]};
    if(width===3 && array instanceof Float32Array){a.min=[0,1,2].map(k=>{let v=Infinity;for(let i=k;i<array.length;i+=3)v=Math.min(v,array[i]);return v;});a.max=[0,1,2].map(k=>{let v=-Infinity;for(let i=k;i<array.length;i+=3)v=Math.max(v,array[i]);return v;});}
    const id=j.accessors.length;j.accessors.push(a);return id;
  };
  const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(data.positions.flat(),3));geometry.setIndex(data.triangles.flat());geometry.computeVertexNormals();
  const jointData=[],weightData=[];
  for(const list of data.vertexWeights){for(let i=0;i<4;i++){jointData.push(list[i]?jointNames.indexOf(list[i][0]):0);weightData.push(list[i]?.[1]||0);}}
  const attrs={POSITION:add(new Float32Array(data.positions.flat()),5126,3,34962),NORMAL:add(geometry.attributes.normal.array,5126,3,34962),TEXCOORD_0:add(new Float32Array(data.tex.flatMap(([u,v])=>[u,1-v])),5126,2,34962),JOINTS_0:add(new Uint16Array(jointData),5123,4,34962),WEIGHTS_0:add(new Float32Array(weightData),5126,4,34962)};
  j.materials.push({name:'M_Generic_Scalp',pbrMetallicRoughness:{baseColorFactor:[.018,.012,.008,1],metallicFactor:0,roughnessFactor:.8}});
  async function imageTexture(filename,size){
    const png=await sharp(`${VENDOR}/system-selected/${filename}`).resize(size,size,{fit:'inside',withoutEnlargement:true}).png().toBuffer();
    const pad=(4-cursor%4)%4;if(pad){chunks.push(Buffer.alloc(pad));cursor+=pad;}
    const view=j.bufferViews.length;j.bufferViews.push({buffer:0,byteOffset:cursor,byteLength:png.length});chunks.push(png);cursor+=png.length;
    const source=j.images.length;j.images.push({bufferView:view,mimeType:'image/png',name:filename});
    const texture=j.textures.length;j.textures.push({source,sampler:0});return texture;
  }
  const skinTexture=await imageTexture('young_lightskinned_male_diffuse3.png',1024),eyeTexture=await imageTexture('brown_eye.png',512);
  j.materials[3].pbrMetallicRoughness={baseColorFactor:[1,1,1,1],baseColorTexture:{index:skinTexture},metallicFactor:0,roughnessFactor:.72};
  j.materials.push({name:'M_Brown_Eyes',pbrMetallicRoughness:{baseColorFactor:[1,1,1,1],baseColorTexture:{index:eyeTexture},metallicFactor:0,roughnessFactor:.3}});
  if(hooded){
    const garment=await imageTexture('male_casualsuit05_diffuse.png',1024),normal=await imageTexture('male_casualsuit05_normal.png',1024),ao=await imageTexture('male_casualsuit05_ao.png',1024);
    j.materials.push({name:'M_Authored_Padded_Jacket_Jeans',pbrMetallicRoughness:{baseColorFactor:[.65,.68,.72,1],baseColorTexture:{index:garment},metallicFactor:0,roughnessFactor:.82},normalTexture:{index:normal,scale:.65},occlusionTexture:{index:ao,strength:.6}});
  }
  const primitives=[];
  for(let m=0;m<j.materials.length;m++){
    const indices=data.triangles.flatMap((t,i)=>data.materials[i]===m?t:[]);if(!indices.length)continue;
    primitives.push({attributes:attrs,indices:add(new Uint32Array(indices),5125,1,34963),material:m});
  }
  j.meshes=[{name,primitives}];for(const n of j.nodes)if(n.mesh!==undefined){n.mesh=0;n.name=name;}
  const padding=(4-cursor%4)%4;if(padding){chunks.push(Buffer.alloc(padding));cursor+=padding;}
  j.buffers=[{byteLength:cursor}];j.asset.extras={source:'MakeHuman CC0 anatomy, weights, eyes, skin and padded jacket/jeans; task-authored rest-pose fitting, cloth thickness, hood/scalp and shoes. No owner facial likeness.'};
  const json=Buffer.from(JSON.stringify(j));const jp=Buffer.concat([json,Buffer.alloc((4-json.length%4)%4,32)]),binary=Buffer.concat(chunks),header=Buffer.alloc(20),tail=Buffer.alloc(8);
  header.writeUInt32LE(0x46546c67,0);header.writeUInt32LE(2,4);header.writeUInt32LE(28+jp.length+binary.length,8);header.writeUInt32LE(jp.length,12);header.writeUInt32LE(0x4e4f534a,16);tail.writeUInt32LE(binary.length,0);tail.writeUInt32LE(0x004e4942,4);
  await fs.writeFile(`${OUT}/${name}-candidate.glb`,Buffer.concat([header,jp,tail,binary]));
  geometry.dispose();return {name,vertices:data.positions.length,triangles:data.triangles.length,hooded};
}
const results=[];for(const [name,hooded] of [['SK_Opening_Performer',true],['SK_Opening_Spectator',false]])results.push(await writeCharacter(name,hooded));
await fs.writeFile(`${OUT}/candidate-stats.json`,JSON.stringify(results,null,2));console.log(results);





