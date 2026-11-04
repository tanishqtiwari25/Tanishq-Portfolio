"use client";
import { useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, useTexture } from "@react-three/drei";
import * as T from "three";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";

const PEOPLE = [
  {x:-3.7,z:-21.1,h:1.03,w:1.12,shirt:"#51434b",skin:"#a56d50",pose:.3},
  {x:3.7,z:-21.9,h:.94,w:.96,shirt:"#39464e",skin:"#bb8464",pose:2.45},
  {x:-3.8,z:-24.5,h:.97,w:.92,shirt:"#564c40",skin:"#85543e",pose:2.7},
  {x:3.75,z:-25.1,h:1.08,w:1.06,shirt:"#4b536b",skin:"#c18e6c",pose:.6},
  {x:-3.8,z:-27.7,h:1.08,w:1.02,shirt:"#63363d",skin:"#ae7756",pose:.8},
  {x:3.75,z:-28.2,h:1,w:1.17,shirt:"#4c5d4e",skin:"#946147",pose:2.45},
];

/** Opening-only volumetric near spectators. Shared anonymous base, not scanned people. */
export default function OpeningCrowd({reduced}:{reduced:boolean}) {
  const gltf=useGLTF("/models/tt-opening-spectator.glb",false,true);
  const matureSkin=useTexture("/textures/spectator-skin-mature.webp");
  matureSkin.colorSpace=T.SRGBColorSpace;
  matureSkin.flipY=false;
  const people=useMemo(()=>PEOPLE.map((p,i)=>{
    const model=clone(gltf.scene);
    model.traverse(o=>{
      if(o instanceof T.Mesh){
        o.castShadow=true;o.receiveShadow=true;
        const tint=(source:T.Material)=>{
          const m=source.clone();
          if(m instanceof T.MeshStandardMaterial){
            if(/Heavy_Cotton/.test(m.name))m.color.set(p.shirt);
            if(/Hands/.test(m.name)){
              m.color.set(i%3===0?"#b89e89":i%3===1?"#e7d2ba":"#ccb49d");
              if(i%2)m.map=matureSkin;
              m.roughness=.78;
            }
            if(/Scalp/.test(m.name))m.color.set(i%2?"#21150e":"#100e0c");
          }
          return m;
        };
        o.material=Array.isArray(o.material)?o.material.map(tint):tint(o.material);
      }
    });
    const arm=model.getObjectByName(i%2?"RightArm":"LeftArm");
    const forearm=model.getObjectByName(i%2?"RightForeArm":"LeftForeArm");
    return {model,arm,forearm,armRest:arm?.quaternion.clone(),forearmRest:forearm?.quaternion.clone(),q:new T.Quaternion(),axis:new T.Vector3(0,0,1),...p};
  }),[gltf.scene,matureSkin]);
  useEffect(()=>()=>people.forEach(({model})=>model.traverse(o=>{
    if(o instanceof T.Mesh)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.dispose());
  })),[people]);
  useFrame(({clock})=>people.forEach((p,i)=>{
    const sway=reduced?0:Math.sin(clock.elapsedTime*.65+i*1.7)*.075;
    if(p.arm&&p.armRest)p.arm.quaternion.copy(p.armRest).multiply(p.q.setFromAxisAngle(p.axis,(i%2?1:-1)*(p.pose+sway)));
    if(p.forearm&&p.forearmRest)p.forearm.quaternion.copy(p.forearmRest).multiply(p.q.setFromAxisAngle(p.axis,(i%2?1:-1)*.35));
  }));
  return <group>{people.map((p,i)=><group key={i} position={[p.x,.008,p.z]} rotation={[0,p.x<0?Math.PI*.36:-Math.PI*.36,0]} scale={[p.w,p.h,p.w]}><primitive object={p.model}/></group>)}</group>;
}
