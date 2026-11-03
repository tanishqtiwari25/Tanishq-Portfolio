"use client";
import { useEffect, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as T from "three";

/** Reviewed Blender structure, never a pre-rendered arena backdrop. */
export default function ArenaVenue() {
  const { scene } = useGLTF("/models/tt-venue-kit-web.glb", false, true);
  const venue = useMemo(() => {
    const copy=scene.clone(true);
    copy.traverse(object=>{
      if (!(object instanceof T.Mesh)) return;
      object.visible=object.name!=="SM_Seat";
      object.receiveShadow=true;
      object.castShadow=!/Terraces|Floor|Ribbon/.test(object.name);
      object.material=(object.material as T.MeshStandardMaterial).clone();
      const material=object.material as T.MeshStandardMaterial;
      if (/M_Floor/.test(material.name)) {
        material.color.setRGB(.003,.004,.006); material.envMapIntensity=.15;
      }
      if (/RibbonLED/.test(material.name)) {
        material.emissive.set("#e51f35"); material.emissiveIntensity=.7;
      }
      if (/ScoreboardLED/.test(material.name)) {
        material.emissive.set("#9b1427"); material.emissiveIntensity=.35;
      }
    });
    return copy;
  },[scene]);
  useEffect(()=>()=>venue.traverse(object=>{
    if(object instanceof T.Mesh) (object.material as T.Material).dispose();
  }),[venue]);
  return <primitive object={venue}/>;
}
