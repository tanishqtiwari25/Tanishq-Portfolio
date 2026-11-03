"use client";
import { createContext, useContext, useEffect, useMemo, type ReactNode } from "react";
import * as T from "three";
import { buildEquipment } from "@/lib/arena/equipment.mjs";
type Kind = 'speaker'|'desk'|'flightcase'|'headset'|'mount';
type Library = { geometry:Record<Kind,ReturnType<typeof buildEquipment>>; materials:Record<string,T.Material> };
const Context=createContext<Library|null>(null);
export function EquipmentLibrary({mobile,children}:{mobile:boolean;children:ReactNode}) {
  const library=useMemo(()=>{
    const materials:Record<string,T.Material>={
      steel:new T.MeshStandardMaterial({color:'#b7b9bd',metalness:1,roughness:.4}),
      paint:new T.MeshStandardMaterial({color:'#303238',metalness:0,roughness:.72}),
      rubber:new T.MeshStandardMaterial({color:'#202126',metalness:0,roughness:.96}),
      paper:new T.MeshStandardMaterial({color:'#282a2e',metalness:0,roughness:1}),
      green:new T.MeshBasicMaterial({color:new T.Color(0.1,1.2,.35),toneMapped:false}),
      amber:new T.MeshBasicMaterial({color:new T.Color(1.4,.25,.03),toneMapped:false}),
    };
    // Geometry deliberately has no inherited UVs: use a world-space finish shader.
    // Tertiary marks are subtle rather than evenly painted-on edge damage.
    for(const key of ['steel','paint']) {
      const material=materials[key] as T.MeshStandardMaterial;
      material.onBeforeCompile=shader=>{
        shader.vertexShader='varying vec3 finishPosition;\n'+shader.vertexShader;
        shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nfinishPosition=position;');
        shader.fragmentShader='varying vec3 finishPosition;\n'+shader.fragmentShader;
        shader.fragmentShader=shader.fragmentShader.replace('#include <roughnessmap_fragment>',`#include <roughnessmap_fragment>
          float finishGrain=fract(sin(dot(floor(finishPosition*vec3(140.,800.,130.)),vec3(12.9898,78.233,31.7)))*43758.5453);
          roughnessFactor=clamp(roughnessFactor+(finishGrain-.5)*.18,.15,1.);`);
      };
      material.customProgramCacheKey=()=>`tt-equipment-${key}-grain-v1`;
    }
    return {materials,geometry:Object.fromEntries((['speaker','desk','flightcase','headset','mount'] as Kind[]).map(kind=>[kind,buildEquipment(kind,mobile)])) as Library['geometry']};
  },[mobile]);
  useEffect(()=>()=>{Object.values(library.geometry).flat().forEach(p=>p.geometry.dispose());Object.values(library.materials).forEach(m=>m.dispose());},[library]);
  return <Context.Provider value={library}>{children}</Context.Provider>;
}
export function Equipment({kind,...props}:{kind:Kind;position?:[number,number,number];rotation?:[number,number,number];scale?:number|[number,number,number]}) {
  const library=useContext(Context)!;
  return <group {...props}>{library.geometry[kind].map(part=><mesh key={part.material} geometry={part.geometry} material={library.materials[part.material]} castShadow receiveShadow dispose={null}/>)}</group>;
}
export function ProductionDesk() {
  return <group>
    <pointLight position={[0,5,14.5]} intensity={55} distance={7} color="#dae4f1" />
    <group position={[0,1.4,11.5]} rotation={[-.9,0,0]}>
      <Equipment kind="desk" />
      <Equipment kind="headset" position={[-2.98,.08,.25]} rotation={[0,0,-.25]} />
    </group>
    <Equipment kind="flightcase" position={[-1.45,.17,11.65]} />
    <Equipment kind="flightcase" position={[1.45,.17,11.65]} />
  </group>;
}
