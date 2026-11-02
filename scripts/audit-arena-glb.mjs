import fs from 'node:fs/promises';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
await MeshoptDecoder.ready;
const path = process.argv[2];
const bytes = await fs.readFile(path);
const jsonLength = bytes.readUInt32LE(12);
const gltf = JSON.parse(bytes.subarray(20, 20 + jsonLength));
const binary = bytes.subarray(28 + jsonLength);
const views = gltf.bufferViews.map(view => {
  const ext = view.extensions?.EXT_meshopt_compression;
  if (!ext) return binary.subarray(view.byteOffset || 0, (view.byteOffset || 0) + view.byteLength);
  const decoded = new Uint8Array(ext.count * ext.byteStride);
  MeshoptDecoder.decodeGltfBuffer(decoded, ext.count, ext.byteStride,
    binary.subarray(ext.byteOffset || 0, (ext.byteOffset || 0) + ext.byteLength), ext.mode, ext.filter || 'NONE');
  return decoded;
});
const widths = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT4: 16 };
function accessor(index) {
  const a = gltf.accessors[index], source = views[a.bufferView], data = new DataView(source.buffer, source.byteOffset, source.byteLength);
  const size = {5121:1,5123:2,5125:4,5126:4}[a.componentType];
  const width = widths[a.type], stride = gltf.bufferViews[a.bufferView].byteStride || width * size;
  const read = {5121:'getUint8',5123:'getUint16',5125:'getUint32',5126:'getFloat32'}[a.componentType];
  return Array.from({length:a.count}, (_,i) => Array.from({length:width},(_,k)=>data[read]((a.byteOffset || 0)+i*stride+k*size,true)));
}
let triangles=0, invalid=0, degenerate=0, badWeights=0, vertices=0, minArea=Infinity;
const points=new Map(), parents=[], edges=new Map(), surface=[];
const root=i=>parents[i]===i?i:(parents[i]=root(parents[i]));
const pointId=p=>{const key=p.map(n=>Math.round(n*1e7)).join(',');if(!points.has(key)){points.set(key,parents.length);parents.push(parents.length);}return points.get(key);};
const bounds=[Array(3).fill(Infinity),Array(3).fill(-Infinity)];
for (const mesh of gltf.meshes) for (const primitive of mesh.primitives) {
  const p=accessor(primitive.attributes.POSITION), ids=accessor(primitive.indices).flat();
  vertices += p.length; triangles += ids.length/3;
  for (const vertex of p) vertex.forEach((value,k)=>{if(!Number.isFinite(value))invalid++;bounds[0][k]=Math.min(bounds[0][k],value);bounds[1][k]=Math.max(bounds[1][k],value);});
  for(let i=0;i<ids.length;i+=3){
    const [a,b,c]=ids.slice(i,i+3).map(index=>p[index]);
    if(!a||!b||!c){invalid++;continue;}
    const u=b.map((n,k)=>n-a[k]),v=c.map((n,k)=>n-a[k]);
    const area=Math.hypot(u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0])/2;
    minArea=Math.min(minArea,area);if(area<1e-10)degenerate++;
    const corners=[a,b,c].map(pointId);
    for(let e=0;e<3;e++){
      const from=corners[e],to=corners[(e+1)%3],key=[Math.min(from,to),Math.max(from,to)].join(':');
      const edge=edges.get(key)||{count:0,balance:0};edge.count++;edge.balance+=from<to?1:-1;edges.set(key,edge);
      parents[root(from)]=root(to);
    }
    surface.push({id:corners[0],volume:(a[0]*(b[1]*c[2]-b[2]*c[1])+a[1]*(b[2]*c[0]-b[0]*c[2])+a[2]*(b[0]*c[1]-b[1]*c[0]))/6});
  }
  if(primitive.attributes.WEIGHTS_0!==undefined) for(const weights of accessor(primitive.attributes.WEIGHTS_0)) if(Math.abs(weights.reduce((a,b)=>a+b,0)-1)>.015)badWeights++;
}
const volumes=new Map();surface.forEach(f=>volumes.set(root(f.id),(volumes.get(root(f.id))||0)+f.volume));
const boundaryEdges=[...edges.values()].filter(e=>e.count===1).length;
const nonmanifoldEdges=[...edges.values()].filter(e=>e.count>2).length;
const inconsistentEdges=[...edges.values()].filter(e=>e.count===2&&e.balance!==0).length;
const invertedIslands=[...volumes.values()].filter(v=>v< -1e-10).length;
const report={path,bytes:bytes.length,vertices_with_uv_splits:vertices,triangles,materials:gltf.materials.length,bones:gltf.skins[0].joints.length,clips:gltf.animations.map(a=>a.name),bounds,minimum_triangle_area:minArea,invalid,degenerate,badWeights,boundaryEdges,nonmanifoldEdges,inconsistentEdges,islands:volumes.size,invertedIslands,limitations:'Export geometry and weight audit after welding coincident UV-split positions at 1e-7 m. Does not certify intersections, facial likeness or visual quality.'};
console.log(JSON.stringify(report,null,2));
if(invalid||degenerate||badWeights||boundaryEdges||nonmanifoldEdges||inconsistentEdges||invertedIslands)process.exitCode=1;
