"use client";
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as T from "three";
import { TIERS } from "@/lib/arena/venueDesign.mjs";

/** Stadium crowd impostors: one alpha-tested draw call, not a scene backdrop. */
export default function SpectatorLOD({ mobile, reduced }: { mobile: boolean; reduced: boolean }) {
  const atlas = useTexture("/textures/spectators-atlas-v2.webp");
  const count = mobile ? 1000 : 4480;
  const mesh = useRef<T.InstancedMesh>(null);
  const time=useMemo(()=>({value:0}),[]);
  const people = useMemo(() => Array.from({ length: count }, (_, i) => {
    const floor = mobile ? 100 : 280;
    const ringside = mobile ? 80 : 360;
    let x: number, y: number, z: number;
    if (i < floor) {
      const row = Math.floor(i / 2) % 4;
      x = (i % 2 ? -1 : 1) * (3.9 + row * .7);
      z = -32 + Math.floor(i / 8) * (19 / Math.ceil(floor / 8));
      y = 0;
    } else if (i < floor + ringside) {
      const n=i-floor, side=n%2 ? -1:1, row=Math.floor(n/2)%3;
      const along=Math.floor(n/6);
      if (n < ringside*.55) {x=side*(5.7+row*.72);z=-7.5+along*.44;}
      else {x=side*(3.9+(along%22)*.57);z=-7.2-row*.65;}
      y=0;
    } else {
      const n = i - floor - ringside, tier = TIERS[n % TIERS.length];
      const row=Math.floor(n/TIERS.length)%tier.rows;
      const radius = tier.radius + (row+.5)*tier.run;
      let a = n * 2.39996;
      x = Math.cos(a) * radius; z = Math.sin(a) * radius * 2 - 17;
      while (Math.abs(x) < 16 && z > -43 && z < 20) {
        a += 2.39996; x = Math.cos(a) * radius; z = Math.sin(a) * radius * 2 - 17;
      }
      y = tier.y + row*tier.rise;
    }
    x += Math.sin(i * 12.9898) * .12;
    z += Math.cos(i * 7.233) * .17;
    return { x, y, z, scale: .84 + (i % 13) * .019, phase: i * 1.813 };
  }), [count, mobile]);
  const geometry = useMemo(() => {
    const g = new T.PlaneGeometry(1.025, 2.05); g.translate(0, .97, 0);
    g.setAttribute("atlasCell", new T.InstancedBufferAttribute(Float32Array.from({ length: count }, (_, i) => (i * 7 + Math.floor(i / 12) * 5) % 12), 1));
    return g;
  }, [count]);
  const material = useMemo(() => {
    atlas.colorSpace = T.SRGBColorSpace;
    const m = new T.MeshLambertMaterial({ map: atlas, color: "#e0d8d3", alphaTest: .5, side: T.DoubleSide });
    m.onBeforeCompile = shader => {
      shader.uniforms.crowdTime=time;
      shader.vertexShader = "attribute float atlasCell; uniform float crowdTime;\n" + shader.vertexShader;
      shader.vertexShader=shader.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
        transformed.x += sin(crowdTime*.7+atlasCell*1.813)*.012*max(0.,position.y);`);
      shader.vertexShader = shader.vertexShader.replace("#include <uv_vertex>", `#include <uv_vertex>
        vMapUv.x = (vMapUv.x * .992 + .004 + mod(atlasCell,4.)) * .25;
        vMapUv.y = (vMapUv.y * .992 + .004 + floor(atlasCell/4.)) / 3.;`);
    };
    m.customProgramCacheKey = () => "tt-spectator-lit-atlas-v4-gpu-sway";
    return m;
  }, [atlas,time]);
  useEffect(() => () => { geometry.dispose(); material.dispose(); }, [geometry, material]);
  const dummy = useMemo(() => new T.Object3D(), []);
  const lastCamera = useRef(new T.Vector3(Infinity, Infinity, Infinity));
  useEffect(() => {
    lastCamera.current.set(Infinity,Infinity,Infinity);
    people.forEach((_, i) => mesh.current?.setColorAt(i, new T.Color(["#cbd0d9", "#aeb5bf", "#e0c4bf", "#88939f", "#bac4d1"][i % 5])));
    if (mesh.current?.instanceColor) mesh.current.instanceColor.needsUpdate = true;
  }, [people]);
  useFrame(({ camera, clock }) => {
    if (!mesh.current) return;
    time.value=reduced ? 0 : clock.elapsedTime;
    const moved = lastCamera.current.distanceToSquared(camera.position) > .0001;
    if (!moved) return;
    lastCamera.current.copy(camera.position);
    people.forEach((p, i) => {
      dummy.position.set(p.x, p.y - .022, p.z);
      dummy.rotation.set(0, Math.atan2(camera.position.x - p.x, camera.position.z - p.z), 0);
      dummy.scale.set((i % 5 === 0 ? -1 : 1) * p.scale, p.scale, p.scale); dummy.updateMatrix(); mesh.current!.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });
  return <instancedMesh ref={mesh} geometry={geometry} material={material} args={[undefined, undefined, count]} frustumCulled={false} />;
}
