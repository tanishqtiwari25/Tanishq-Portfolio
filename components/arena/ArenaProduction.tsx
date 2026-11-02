"use client";
import { useEffect, useMemo, useRef } from "react";
import * as T from "three";

type Segment = { a: T.Vector3; b: T.Vector3; red?: boolean };
/** Repeated load-bearing square trusses, batched into two draw calls. */
export default function ArenaProduction({ mobile }: { mobile: boolean }) {
  const metal = useRef<T.InstancedMesh>(null);
  const leds = useRef<T.InstancedMesh>(null);
  const segments = useMemo(() => {
    const bars: Segment[] = [];
    const add = (a: number[], b: number[], red = false) => bars.push({ a: new T.Vector3(...a), b: new T.Vector3(...b), red });
    const beam = (start: number[], end: number[], cells: number) => {
      const a = new T.Vector3(...start), b = new T.Vector3(...end);
      const direction = b.clone().sub(a).normalize();
      const right = new T.Vector3(0, 1, 0).cross(direction).normalize();
      if (right.lengthSq() < .1) right.set(1,0,0);
      const up = direction.clone().cross(right).normalize();
      const corners = [[-1,-1],[-1,1],[1,1],[1,-1]].map(([x,y]) => right.clone().multiplyScalar(x*.24).addScaledVector(up,y*.24));
      const at = (t: number, corner: number) => a.clone().lerp(b,t).add(corners[corner]).toArray();
      for(let c=0;c<4;c++) {
        add(at(0,c),at(1,c));
        for(let j=0;j<cells;j++) {
          add(at(j/cells,c),at((j+1)/cells,(c+1)%4));
          add(at(j/cells,c),at(j/cells,(c+1)%4));
        }
      }
    };
    // The stage grid and central ring share one steel roof structure.
    for (const z of [-40,-33,-16,3,12]) beam([-14,13,z],[14,13,z], mobile?10:20);
    for (const x of [-14,14]) {
      beam([x,0,-39],[x,13,-39],10);
      beam([x,0,4],[x,13,4],10);
      beam([x,13,-40],[x,13,12],mobile?16:28);
      add([x,12.7,-40],[x,12.7,12],true);
    }
    for(const z of [-38,-31,-24,-17,-10]) {
      for(const side of [-1,1]) {
        // Steel crowd barriers along both sides of the entrance ramp.
        const x=side*3.4;
        for(let i=0;i<8;i++) add([x,0,z+i*.8],[x,1.22,z+i*.8]);
        add([x,1.22,z],[x,1.22,z+5.6]);
        add([side*2.13,.12+Math.max(0,(-10-z)/23),z],[side*2.13,.12+Math.max(0,(-10-z-5.6)/23),z+5.6],true);
      }
    }
    return bars;
  },[mobile]);
  useEffect(()=>{
    const object=new T.Object3D(), axis=new T.Vector3(0,1,0);
    let m=0,l=0;
    for(const segment of segments){
      const direction=segment.b.clone().sub(segment.a);
      object.position.copy(segment.a).add(segment.b).multiplyScalar(.5);
      object.quaternion.setFromUnitVectors(axis,direction.clone().normalize());
      object.scale.set(segment.red?.045:.035,direction.length(),segment.red?.045:.035);
      object.updateMatrix();
      if(segment.red) leds.current?.setMatrixAt(l++,object.matrix);
      else metal.current?.setMatrixAt(m++,object.matrix);
    }
    for(const ref of [metal,leds]) if(ref.current) ref.current.instanceMatrix.needsUpdate=true;
  },[segments]);
  const metalCount=segments.filter(s=>!s.red).length;
  return <group>
    <instancedMesh ref={metal} args={[undefined,undefined,metalCount]} frustumCulled={false}>
      <cylinderGeometry args={[1,1,1,5]}/><meshStandardMaterial color="#8b929c" metalness={.92} roughness={.29}/>
    </instancedMesh>
    <instancedMesh ref={leds} args={[undefined,undefined,segments.length-metalCount]} frustumCulled={false}>
      <cylinderGeometry args={[1,1,1,5]}/><meshBasicMaterial color="#ff173e" toneMapped={false}/>
    </instancedMesh>
    {[-1,1].map(side=><group key={side}>
      <pointLight position={[side*12,9,-31]} color="#ff2447" intensity={170} distance={25}/>
      <pointLight position={[side*16,8,7]} color="#e9efff" intensity={180} distance={35}/>
    </group>)}
  </group>;
}
