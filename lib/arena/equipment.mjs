import * as T from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

/** Metre-scale, closed component geometry. Shared by web rendering and offline QA. */
export function buildEquipment(kind, mobile=false) {
  const buckets = new Map();
  const put = (g, material, p=[0,0,0], r=[0,0,0]) => {
    g.applyMatrix4(new T.Matrix4().compose(new T.Vector3(...p),new T.Quaternion().setFromEuler(new T.Euler(...r)),new T.Vector3(1,1,1)));
    if(!g.index) g.setIndex(Array.from({length:g.attributes.position.count},(_,i)=>i));
    if(!buckets.has(material)) buckets.set(material,[]);
    buckets.get(material).push(g);
  };
  const box=(p,s,m='paint',radius=.025)=>put(new RoundedBoxGeometry(...s,1,Math.min(radius,...s.map(v=>v*.2))),m,p);
  const cyl=(p,rad,depth,m='steel',r=[Math.PI/2,0,0],segments=mobile?8:12)=>put(new T.CylinderGeometry(rad,rad,depth,segments),m,p,r);
  const bar=(a,b,rad=.025,m='steel')=>{
    const d=new T.Vector3(...b).sub(new T.Vector3(...a));
    const g=new T.CylinderGeometry(rad,rad,d.length(),mobile?6:8);
    g.applyQuaternion(new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),d.clone().normalize()));
    put(g,m,new T.Vector3(...a).add(new T.Vector3(...b)).multiplyScalar(.5).toArray());
  };
  const bolt=(x,y,z)=>cyl([x,y,z],.023,.018,'steel',[Math.PI/2,0,0],6);
  if(kind==='speaker') {
    box([0,0,0],[1.2,.6,.73],'paint',.06);
    box([0,0,.375],[1.1,.51,.035],'rubber');
    for(const x of [-.29,.29]) {
      cyl([x,0,.4],.215,.025,'rubber');
      put(new T.ConeGeometry(.178,.07,mobile?12:24),'paper',[x,0,.425],[Math.PI/2,0,0]);
      cyl([x,0,.453],.065,.025,'rubber');
    }
    // Protective grille rods, not a featureless black face.
    for(let i=0;i<(mobile?10:20);i++) box([-.52+i*(1.04/(mobile?9:19)),0,.475],[.008,.47,.012],'paint',.001);
    for(const y of [-.23,0,.23]) box([0,y,.48],[1.08,.009,.012],'steel',.001);
    for(const x of [-.53,.53]) for(const y of [-.245,.245]) bolt(x,y,.49);
    for(const side of [-1,1]) {
      box([side*.61,0,-.02],[.045,.3,.25],'rubber');
      bar([side*.64,-.11,-.09],[side*.64,.11,-.09],.025);
      put(new T.TorusGeometry(.07,.014,6,12),'steel',[side*.61,.23,-.22],[0,Math.PI/2,0]);
    }
  } else if(kind==='desk') {
    box([0,0,-.27],[7.3,3.2,.48],'rubber',.08);
    box([0,0,-.06],[7.25,3.15,.12],'steel',.04);
    box([0,0,.015],[7.02,2.92,.055],'paint');
    for(const side of [-1,1]) {
      const x=side*2.98;
      box([x,0,.06],[1.02,2.8,.07],'rubber');
      for(let i=0;i<6;i++) {
        const fx=x-.37+i*.148;
        box([fx,-.4,.11],[.017,.94,.016],'paper',.002);
        box([fx,-.65+(i%4)*.16,.145],[.1,.055,.045],'steel',.009);
        cyl([fx,.36,.14],.047,.065,'rubber');
        box([fx,.37,.18],[.008,.025,.008],'steel',.001);
        for(let n=0;n<3;n++)box([fx,.59+n*.09,.12],[.06,.023,.02],n===2?'amber':'green',.002);
      }
      box([x,.99,.12],[.74,.15,.035],'paper');
      for(const y of [-1.18,1.18])for(const bx of [-.45,.45])bolt(x+bx,y,.14);
      for(let i=0;i<9;i++)box([x,-1.06+i*.02,-.514],[.72,.008,.015],'paper',.001);
    }
    // Recess rim, corner bumpers, cable strain relief and hinged carrying bars.
    for(const side of [-1,1]) {
      box([side*2.25,0,.105],[.055,2.85,.09],'steel');
      box([0,side*1.44,.105],[4.55,.055,.09],'steel');
      for(const y of [-1.5,1.5]) box([side*3.57,y,-.08],[.24,.22,.3],'rubber');
      for(let i=0;i<5;i++)cyl([side*3.67,-.65+i*.24,-.22],.055,.08,'rubber',[0,0,Math.PI/2]);
    }
    box([0,-1.57,.03],[6.9,.12,.22],'rubber');
  } else if(kind==='flightcase') {
    box([0,.55,0],[2.55,1.1,1.65],'rubber',.05);
    for(const x of [-1.25,1.25]) for(const y of [.04,1.06]) box([x,y,0],[.055,.065,1.69],'steel');
    for(const z of [-.82,.82]) {
      for(const x of [-1.25,1.25])box([x,.55,z],[.06,1.1,.065],'steel');
      for(const y of [.04,1.06])box([0,y,z],[2.55,.06,.065],'steel');
      for(const x of [-.65,.65]) {
        box([x,.55,z],[.2,.26,.04],'steel');
        box([x,.55,z+Math.sign(z)*.03],[.13,.19,.04],'rubber');
      }
    }
    for(const x of [-1,1])for(const z of [-.6,.6])cyl([x,-.07,z],.1,.09,'rubber',[0,0,Math.PI/2]);
  } else if(kind==='headset') {
    put(new T.TorusGeometry(.29,.025,8,24),'rubber',[0,0,0]);
    put(new T.TorusGeometry(.29,.012,6,24),'steel',[0,0,-.025]);
    for(const side of [-1,1]) {
      box([side*.29,-.035,0],[.13,.21,.15],'paint',.055);
      box([side*.25,-.035,.045],[.055,.18,.14],'rubber',.024);
    }
    const points=Array.from({length:32},(_,i)=>new T.Vector3(-.35+Math.sin(i*Math.PI/16)*.08,-.3+Math.cos(i*Math.PI/16)*.14,.025));
    put(new T.TubeGeometry(new T.CatmullRomCurve3(points,true),40,.008,5,true),'rubber');
  } else if(kind==='mount') {
    for(const x of [-2.4,2.4]) {
      const corners=[[-.17,-.17],[-.17,.17],[.17,.17],[.17,-.17]];
      corners.forEach(([dx,dz])=>bar([x+dx,-3.6,dz],[x+dx,3.6,dz]));
      for(let i=0;i<6;i++)corners.forEach(([dx,dz],n)=>{
        const next=corners[(n+1)%4];
        bar([x+dx,-3.6+i*1.2,dz],[x+next[0],-2.4+i*1.2,next[1]],.015);
      });
      box([x,3.55,0],[.75,.13,.75]);
      box([x,-3.5,0],[.55,.5,.2],'paint');
      for(const dx of [-.21,.21])for(const y of [-3.65,-3.35])bolt(x+dx,y,.13);
    }
    bar([-2.65,-3.4,0],[2.65,-3.4,0],.06);
  } else throw new Error('Unknown equipment '+kind);
  return [...buckets].map(([material,parts])=>{
    // Normalize the attribute sets before batching all pieces of each finish.
    parts.forEach(g=>{g.deleteAttribute('uv');g.deleteAttribute('uv1');});
    const geometry=mergeGeometries(parts,false);
    parts.forEach(g=>g.dispose());
    geometry.computeBoundingBox();geometry.computeBoundingSphere();
    return {material,geometry};
  });
}
