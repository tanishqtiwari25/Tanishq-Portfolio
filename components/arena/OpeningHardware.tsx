"use client";
import { useEffect, useMemo } from "react";
import * as T from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { brushedMetal } from "./arenaMaterials";

/** Ground plates, rail braces and recessed fasteners added only to the entrance. */
export default function OpeningHardware(){
  const maps=useMemo(brushedMetal,[]);
  const parts=useMemo(()=>{
    const steel:T.BufferGeometry[]=[],bolts:T.BufferGeometry[]=[];
    for(const side of [-1,1])for(let i=0;i<13;i++){
      const z=-32+i*1.5;
      const plate=new T.BoxGeometry(.7,.028,.24);plate.translate(side*3.53,.025,z);steel.push(plate);
      const a=new T.Vector3(side*3.35,.8,z),b=new T.Vector3(side*3.82,.045,z);
      const brace=new T.CylinderGeometry(.024,.024,a.distanceTo(b),10);
      brace.applyQuaternion(new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),b.clone().sub(a).normalize()));
      brace.translate(...a.add(b).multiplyScalar(.5).toArray());steel.push(brace);
      for(const x of [3.32,3.76]){
        const bolt=new T.CylinderGeometry(.023,.023,.012,6);bolt.translate(side*x,.045,z);bolts.push(bolt);
      }
    }
    const result={steel:mergeGeometries(steel)!,bolts:mergeGeometries(bolts)!};
    [...steel,...bolts].forEach(g=>g.dispose());return result;
  },[]);
  useEffect(()=>()=>{parts.steel.dispose();parts.bolts.dispose();maps.map.dispose();maps.roughnessMap.dispose();},[parts,maps]);
  return <group>
    <mesh geometry={parts.steel} castShadow receiveShadow><meshStandardMaterial color="#8c939a" map={maps.map} roughnessMap={maps.roughnessMap} metalness={.88} roughness={.58} bumpMap={maps.roughnessMap} bumpScale={.0005}/></mesh>
    <mesh geometry={parts.bolts} castShadow><meshStandardMaterial color="#a0a7b0" metalness={1} roughness={.3}/></mesh>
  </group>;
}
