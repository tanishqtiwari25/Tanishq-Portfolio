"use client";
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as T from "three";

/** Stadium crowd impostors: one alpha-tested draw call, not a scene backdrop. */
export default function SpectatorLOD({ mobile, reduced }: { mobile: boolean; reduced: boolean }) {
  const atlas = useTexture("/textures/spectators-atlas.webp");
  const count = mobile ? 1000 : 4480;
  const mesh = useRef<T.InstancedMesh>(null);
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
      const n = i - floor - ringside, tier = Math.min(4, Math.floor(n / ((count - floor - ringside) / 5)));
      const radius = 18 + tier * 3.3 + (Math.floor(n / 5) % 4) * .55;
      let a = n * 2.39996;
      x = Math.cos(a) * radius; z = Math.sin(a) * radius * 2 - 17;
      while (Math.abs(x) < 16 && z > -43 && z < 20) {
        a += 2.39996; x = Math.cos(a) * radius; z = Math.sin(a) * radius * 2 - 17;
      }
      y = tier * 2.4;
    }
    return { x, y, z, scale: .91 + (i % 9) * .018, phase: i * 1.813 };
  }), [count, mobile]);
  const geometry = useMemo(() => {
    const g = new T.PlaneGeometry(.72, 2.2); g.translate(0, 1.1, 0);
    g.setAttribute("atlasCell", new T.InstancedBufferAttribute(Float32Array.from({ length: count }, (_, i) => ((Math.imul(i + 1, 1103515245) >>> 16) % 4)), 1));
    return g;
  }, [count]);
  const material = useMemo(() => {
    atlas.colorSpace = T.SRGBColorSpace;
    const m = new T.MeshBasicMaterial({ map: atlas, color: "#a0a7b2", alphaTest: .5, side: T.DoubleSide });
    m.onBeforeCompile = shader => {
      shader.vertexShader = "attribute float atlasCell;\n" + shader.vertexShader;
      shader.vertexShader = shader.vertexShader.replace("#include <uv_vertex>", `#include <uv_vertex>
        vMapUv.x = (vMapUv.x * .992 + .004 + atlasCell) * .25;
        vMapUv.y = .105 + vMapUv.y * .875;`);
    };
    m.customProgramCacheKey = () => "tt-spectator-atlas-v1";
    return m;
  }, [atlas]);
  useEffect(() => () => { geometry.dispose(); material.dispose(); }, [geometry, material]);
  const dummy = useMemo(() => new T.Object3D(), []);
  const last = useRef(-1), lastCamera = useRef(new T.Vector3(Infinity, Infinity, Infinity));
  useEffect(() => {
    people.forEach((_, i) => mesh.current?.setColorAt(i, new T.Color(["#cbd0d9", "#aeb5bf", "#e0c4bf", "#88939f", "#bac4d1"][i % 5])));
    if (mesh.current?.instanceColor) mesh.current.instanceColor.needsUpdate = true;
  }, [people]);
  useFrame(({ camera, clock }) => {
    if (!mesh.current) return;
    const moved = lastCamera.current.distanceToSquared(camera.position) > .0001;
    if (!moved && (reduced || clock.elapsedTime - last.current < 1 / (mobile ? 15 : 24))) return;
    last.current = clock.elapsedTime; lastCamera.current.copy(camera.position);
    people.forEach((p, i) => {
      dummy.position.set(p.x, p.y - .022, p.z);
      dummy.rotation.set(0, Math.atan2(camera.position.x - p.x, camera.position.z - p.z), reduced ? 0 : Math.sin(clock.elapsedTime * .7 + p.phase) * .012);
      dummy.scale.set((i % 5 === 0 ? -1 : 1) * p.scale, p.scale, p.scale); dummy.updateMatrix(); mesh.current!.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });
  return <instancedMesh ref={mesh} geometry={geometry} material={material} args={[undefined, undefined, count]} frustumCulled={false} />;
}
