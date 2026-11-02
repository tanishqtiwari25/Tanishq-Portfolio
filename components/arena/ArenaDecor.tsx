"use client";
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  Environment,
  Lightformer,
  MeshReflectorMaterial,
} from "@react-three/drei";
import * as T from "three";
/** Procedural artwork/materials, not a backdrop photograph. */
function makeHaze() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const x = c.getContext("2d")!;
  const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, "rgba(170,179,195,.65)");
  g.addColorStop(0.35, "rgba(155,164,179,.25)");
  g.addColorStop(1, "rgba(100,110,130,0)");
  x.fillStyle = g;
  x.fillRect(0, 0, 128, 128);
  return new T.CanvasTexture(c);
}
function Haze({ mobile, reduced }: { mobile: boolean; reduced: boolean }) {
  const root = useRef<T.Group>(null);
  const map = useMemo(makeHaze, []);
  useEffect(() => () => map.dispose(), [map]);
  useFrame(({ clock }) => {
    if (!root.current || reduced) return;
    root.current.children.forEach((s, i) => {
      s.position.x =
        (i % 2 ? -1 : 1) * (2.2 + (i % 4) * 2.1) +
        Math.sin(clock.elapsedTime * 0.16 + i) * 0.45;
      s.position.y =
        0.8 + (i % 3) * 0.45 + Math.sin(clock.elapsedTime * 0.12 + i) * 0.18;
    });
  });
  return (
    <group ref={root}>
      {Array.from({ length: mobile ? 6 : 14 }, (_, i) => (
        <sprite
          key={i}
          position={[
            (i % 2 ? -1 : 1) * (2.2 + (i % 4) * 2.1),
            0.8 + (i % 3) * 0.45,
            -33 - (i % 3) * 1.2,
          ]}
          scale={[4.5, 2.2, 1]}
        >
          <spriteMaterial
            map={map}
            transparent
            opacity={0.46}
            depthWrite={false}
            color={i % 3 ? "#afbdcf" : "#ad2741"}
          />
        </sprite>
      ))}
    </group>
  );
}
function EllipseRail({
  radius,
  y,
  color = "#5c626c",
}: {
  radius: number;
  y: number;
  color?: string;
}) {
  const geometry = useMemo(() => {
    const points = Array.from({ length: 129 }, (_, i) => {
      const t = (i / 128) * Math.PI * 2;
      return new T.Vector3(
        Math.cos(t) * radius,
        y,
        Math.sin(t) * radius * 2 - 17,
      );
    });
    return new T.TubeGeometry(
      new T.CatmullRomCurve3(points),
      128,
      0.035,
      4,
      true,
    );
  }, [radius, y]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial
        color={color}
        emissive={color === "#d31b3f" ? color : "#000"}
        emissiveIntensity={color === "#d31b3f" ? 1.2 : 0}
        metalness={0.7}
        roughness={0.4}
      />
    </mesh>
  );
}
function LightGrid({ mobile }: { mobile: boolean }) {
  const white = useRef<T.InstancedMesh>(null),
    red = useRef<T.InstancedMesh>(null);
  const count = mobile ? 48 : 100;
  useEffect(() => {
    const d = new T.Object3D();
    const hidden = new T.Matrix4().makeScale(0,0,0);
    for (let i = 0; i < count; i++) {
      const side = i % 2 ? 1 : -1;
      const col = Math.floor(i / 2) % 10,
        row = Math.floor(i / 20);
      d.position.set(side * (4 + col * 1.7), 11.5 + row * 0.28, -39 + row * 9);
      d.rotation.x = Math.PI / 2;
      d.updateMatrix();
      (i % 3 ? white : red).current?.setMatrixAt(i, d.matrix);
      (i % 3 ? red : white).current?.setMatrixAt(i, hidden);
    }
    for (const ref of [white, red])
      if (ref.current) ref.current.instanceMatrix.needsUpdate = true;
  }, [count]);
  return (
    <group>
      <instancedMesh ref={white} args={[undefined, undefined, count]}>
        <sphereGeometry args={[0.08, 6, 5]} />
        <meshBasicMaterial color="#dfe8ff" toneMapped={false} />
      </instancedMesh>
      <instancedMesh ref={red} args={[undefined, undefined, count]}>
        <sphereGeometry args={[0.09, 6, 5]} />
        <meshBasicMaterial color="#ef2148" toneMapped={false} />
      </instancedMesh>
    </group>
  );
}
function PhoneFlashes({
  mobile,
  reduced,
}: {
  mobile: boolean;
  reduced: boolean;
}) {
  const ref = useRef<T.Points>(null);
  const positions = useMemo(() => {
    const n = mobile ? 20 : 65;
    return new Float32Array(
      Array.from({ length: n * 3 }, (_, i) => {
        const k = Math.floor(i / 3);
        return i % 3 === 0
          ? (k % 2 ? 1 : -1) * (18 + (k % 6) * 2)
          : i % 3 === 1
            ? 2 + (k % 5) * 1.5
            : -36 + (k % 19) * 3;
      }),
    );
  }, [mobile]);
  useFrame(({ clock }) => {
    if (ref.current)
      (ref.current.material as T.PointsMaterial).opacity = reduced
        ? 0.25
        : Math.pow(Math.max(0, Math.sin(clock.elapsedTime * 0.7)), 12) * 0.7 +
          0.1;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={positions.length / 3}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#d8e4ff"
        size={0.075}
        sizeAttenuation
        transparent
        depthWrite={false}
      />
    </points>
  );
}
export function ReflectiveRamp({ mobile }: { mobile: boolean }) {
  return (
    <mesh
      position={[0, 0.607, -21.5]}
      rotation={[-Math.PI / 2 - Math.atan(1 / 23), 0, 0]}
    >
      <planeGeometry args={[4.12, Math.hypot(23, 1)]} />
      {mobile ? (
        <meshStandardMaterial
          color="#272b32"
          metalness={0.7}
          roughness={0.32}
        />
      ) : (
        <MeshReflectorMaterial
          resolution={512}
          mixBlur={1}
          mixStrength={1.2}
          blur={[64, 16]}
          mirror={0.6}
          color="#272b32"
          metalness={0.65}
          roughness={0.19}
          depthScale={0.4}
          minDepthThreshold={0.2}
          maxDepthThreshold={1.3}
        />
      )}
    </mesh>
  );
}
export default function ArenaDecor({
  mobile,
  reduced,
}: {
  mobile: boolean;
  reduced: boolean;
}) {
  return (
    <group>
      <Environment resolution={64}>
        <Lightformer
          position={[0, 13, -24]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[20, 2, 1]}
          intensity={2.5}
        />
        <Lightformer
          position={[0, 10, 8]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[18, 1, 1]}
          intensity={2}
          color="#cbd8f1"
        />
        <Lightformer
          position={[-13, 5, -26]}
          rotation={[0, Math.PI / 2, 0]}
          scale={[18, 1, 1]}
          intensity={3}
          color="#a81736"
        />
      </Environment>
      <Haze mobile={mobile} reduced={reduced} />
      <ReflectiveRamp mobile={mobile} />
      <LightGrid mobile={mobile} />
      <PhoneFlashes mobile={mobile} reduced={reduced} />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <group key={i}>
          <EllipseRail radius={18 + i * 3.3} y={i * 1.35 + 0.8} />
          <EllipseRail
            radius={18 + i * 3.3}
            y={i * 1.35 + 0.12}
            color="#d31b3f"
          />
        </group>
      ))}
    </group>
  );
}
