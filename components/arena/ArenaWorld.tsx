"use client";
import { brushedMetal, spectatorHead, spectatorTorso } from "./arenaMaterials";
import { useMemo, useRef, useEffect, useContext, createContext, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, useGLTF } from "@react-three/drei";
import * as T from "three";
import ArenaDecor from "./ArenaDecor";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
import { sampleJourney, ENTRY } from "@/lib/arena/journey.mjs";
import type { MutableRefObject, ReactNode } from "react";
export type JourneyState = {
  target: number;
  current: number;
  intro: number;
  paused: boolean;
  reduced: boolean;
  mobile: boolean;
};
type V = [number, number, number];
const STEEL = "#3b424c",
  DARK = "#15181e",
  RED = "#c71535";
const MetalMaps = createContext<ReturnType<typeof brushedMetal> | null>(null);
function Box({
  p,
  s,
  c = DARK,
  emissive = false,
}: {
  p: V;
  s: V;
  c?: string;
  emissive?: boolean;
}) {
  const textures = useContext(MetalMaps);
  return (
    <mesh position={p} castShadow receiveShadow>
      <boxGeometry args={s} />
      <meshStandardMaterial
        color={c}
        map={emissive ? undefined : textures?.map}
        roughnessMap={emissive ? undefined : textures?.roughnessMap}
        bumpMap={emissive ? undefined : textures?.roughnessMap}
        bumpScale={0.014}
        roughness={0.65}
        metalness={0.55}
        emissive={emissive ? c : "#000000"}
        emissiveIntensity={emissive ? 1.8 : 0}
      />
    </mesh>
  );
}
function Bar({
  a,
  b,
  r = 0.055,
  c = STEEL,
}: {
  a: V;
  b: V;
  r?: number;
  c?: string;
}) {
  const { mid, q, length } = useMemo(() => {
    const start = new T.Vector3(...a),
      end = new T.Vector3(...b),
      direction = end.clone().sub(start);
    return {
      mid: start.clone().add(end).multiplyScalar(0.5),
      q: new T.Quaternion().setFromUnitVectors(
        new T.Vector3(0, 1, 0),
        direction.clone().normalize(),
      ),
      length: direction.length(),
    };
  }, [a, b]);
  return (
    <mesh position={mid} quaternion={q}>
      <cylinderGeometry args={[r, r, length, 6]} />
      <meshStandardMaterial color={c} metalness={0.75} roughness={0.45} />
    </mesh>
  );
}
function Truss({
  x,
  z,
  width = 22,
  y = 11,
}: {
  x: number;
  z: number;
  width?: number;
  y?: number;
}) {
  return (
    <group position={[x, 0, z]}>
      {[-1, 1].map((side) => (
        <group key={side}>
          {[-0.25, 0.25].map((d) => (
            <Bar
              key={d}
              a={[(side * width) / 2 + d, 0, 0]}
              b={[(side * width) / 2 + d, y, 0]}
            />
          ))}
          {Array.from({ length: 10 }, (_, i) => (
            <Bar
              key={i}
              a={[(side * width) / 2 - 0.25, (i * y) / 10, 0]}
              b={[(side * width) / 2 + 0.25, ((i + 1) * y) / 10, 0]}
              r={0.035}
            />
          ))}
        </group>
      ))}
      <Bar a={[-width / 2, y, 0]} b={[width / 2, y, 0]} />
      <Bar a={[-width / 2, y + 0.5, 0]} b={[width / 2, y + 0.5, 0]} />
      {Array.from({ length: 22 }, (_, i) => (
        <Bar
          key={i}
          a={[-width / 2 + (i * width) / 22, y, 0]}
          b={[-width / 2 + ((i + 1) * width) / 22, y + 0.5, 0]}
          r={0.035}
        />
      ))}
    </group>
  );
}
function textureLabel(lines: string[], color = "#e9ebef", bg = "#0c0e12") {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 1024, 512);
  ctx.strokeStyle = "#c71535";
  ctx.lineWidth = 6;
  ctx.strokeRect(15, 15, 994, 482);
  lines.forEach((line, i) => {
    let size = i === 0 ? 130 : 36;
    do {
      ctx.font = `${i === 0 ? "bold " : ""}${size}px Arial`;
      size -= 2;
    } while (ctx.measureText(line).width > 920 && size > 20);
    ctx.textAlign = "center";
    ctx.fillStyle = i === 0 ? color : "#b0b7c4";
    ctx.fillText(line, 512, lines.length === 1 ? 295 : 220 + i * 90);
  });
  const tex = new T.CanvasTexture(canvas);
  tex.colorSpace = T.SRGBColorSpace;
  return tex;
}
function Sign({
  lines,
  p,
  s = [6, 3],
  rotation = [0, 0, 0],
  color = "#e9ebef",
}: {
  color?: string;
  lines: string[];
  p: V;
  s?: [number, number];
  rotation?: V;
}) {
  const label = lines.join("|");
  const map = useMemo(() => textureLabel(label.split("|"), color), [label, color]);
  useEffect(() => () => map.dispose(), [map]);
  return (
    <mesh position={p} rotation={rotation}>
      <planeGeometry args={s} />
      <meshBasicMaterial map={map} toneMapped={false} />
    </mesh>
  );
}
function BlenderArchitecture() {
  const { scene } = useGLTF("/models/tt-arena-architecture.glb", false, true);
  const architecture = useMemo(() => scene.clone(true), [scene]);
  useEffect(() => {
    architecture.traverse(object => {
      if (object instanceof T.Mesh) {
        object.receiveShadow = true;
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        for (const material of materials) if (material instanceof T.MeshStandardMaterial) {
          if (material.name.includes("LED")) { material.toneMapped = false;material.emissiveIntensity = 1.3; }
          else material.envMapIntensity = 1.7;
        }
        object.castShadow = object.name !== "Charcoal_concrete" && !object.name.includes("concrete");
      }
    });
  }, [architecture]);
  return <group><primitive object={architecture} />{[-1,1].map(side => <group key={side}><pointLight position={[side*12,9,-31]} color="#ff2447" intensity={170} distance={25}/><pointLight position={[side*16,8,7]} color="#e9efff" intensity={180} distance={35}/></group>)}</group>;
}
function Stage() {
  return (
    <group>
      <Box p={[0, 0.55, -37]} s={[26, 1.1, 8]} />
      <Box p={[0, 5.7, -41]} s={[21, 9, 0.6]} />
      <Sign
        p={[0, 5.7, -40.68]}
        s={[20.6, 8.6]}
        lines={["TT", "TANISHQ TIWARI · FRONTEND DEVELOPER"]}
      />
      <Truss x={0} z={-40} width={27} />
      {[-1, 1].map((side) => (
        <group key={side}>
          <Box p={[side * 13, 5, -39]} s={[2.5, 8, 0.5]} c={RED} emissive />
          <Sign
            p={[side * 13, 5, -38.73]}
            s={[2.3, 7.7]}
            lines={["TT", "ARENA"]}
          />
          <Box p={[side * 10.5, 1.7, -32]} s={[2, 3, 1.5]} />
          {[0, 1, 2, 3].map((i) => (
            <Box
              key={i}
              p={[side * 13, 8.8 - i * 0.6, -37]}
              s={[0.9, 0.48, 0.8]}
            />
          ))}
          {[0, 1, 2, 3].map((i) => (
            <Box
              key={"step" + i}
              p={[side * (14.75 - i * 0.5), (1.1 * (i + 1)) / 8, -34]}
              s={[0.5, (1.1 * (i + 1)) / 4, 2]}
            />
          ))}
        </group>
      ))}
      <Box p={[0, 2.4, -40.5]} s={[2.2, 3, 0.5]} c="#06070a" />
      <mesh
        position={[0, 0.5, -21.5]}
        rotation={[Math.atan(1 / 23), 0, 0]}
        receiveShadow
      >
        <boxGeometry args={[4.2, 0.2, Math.hypot(23, 1)]} />
        <meshStandardMaterial
          color="#292c32"
          metalness={0.55}
          roughness={0.6}
        />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={side}>
          <Bar
            a={[side * 2.15, 1.3, -33]}
            b={[side * 2.15, 0.1, -10]}
            r={0.035}
            c={RED}
          />
          {Array.from({ length: 13 }, (_, i) => (
            <group key={i}>
              <Bar
                a={[side * 3.1, 0, -33 + i * 1.8]}
                b={[side * 3.1, 1.1, -33 + i * 1.8]}
              />
              <Box
                p={[side * 3.1, 0.7, -33 + i * 1.8]}
                s={[0.12, 0.8, 1.5]}
                c="#30343b"
              />
            </group>
          ))}
        </group>
      ))}
    </group>
  );
}
function EntryRope({
  progress,
  y,
  index,
}: {
  progress: MutableRefObject<JourneyState>;
  y: number;
  index: number;
}) {
  const first = useRef<T.Mesh>(null),
    second = useRef<T.Mesh>(null);
  const a = useMemo(() => new T.Vector3(), []),
    b = useMemo(() => new T.Vector3(), []),
    direction = useMemo(() => new T.Vector3(), []),
    up = useMemo(() => new T.Vector3(0, 1, 0), []);
  useFrame(() => {
    const p = progress.current.current;
    const opening =
      T.MathUtils.smoothstep(p, 0.52, 0.55) *
      (1 - T.MathUtils.smoothstep(p, 0.6, 0.625));
    // Development entry: the ropes visibly separate, never disappear or intersect the rig.
    const middle = T.MathUtils.lerp(
      y,
      index === 0 ? 1.29 : index === 1 ? 3.45 : 3.75,
      opening,
    );
    [first.current, second.current].forEach((mesh, i) => {
      if (!mesh) return;
      a.set(-3.25, i === 0 ? y : middle, i === 0 ? -3.25 : ENTRY.z);
      b.set(-3.25, i === 0 ? middle : y, i === 0 ? ENTRY.z : -1.65);
      direction.copy(b).sub(a);
      mesh.position.copy(a).add(b).multiplyScalar(0.5);
      mesh.quaternion.setFromUnitVectors(up, direction.clone().normalize());
      mesh.scale.set(0.035, direction.length(), 0.035);
    });
  });
  return (
    <group>
      {[first, second].map((ref, i) => (
        <mesh ref={ref} key={i}>
          <cylinderGeometry args={[1, 1, 1, 6]} />
          <meshStandardMaterial
            color={index === 1 ? "#dadde0" : RED}
            roughness={0.7}
          />
        </mesh>
      ))}
    </group>
  );
}
function Ring({ progress }: { progress: MutableRefObject<JourneyState> }) {
  const canvas = useMemo(() => {
    const element = document.createElement("canvas");
    element.width = 256;
    element.height = 256;
    const ctx = element.getContext("2d")!;
    ctx.fillStyle = "#b7bbc3";
    ctx.fillRect(0, 0, 256, 256);
    for (let y = 0; y < 256; y += 3) {
      ctx.strokeStyle = y % 2 ? "#b5b9c1" : "#bec1c8";
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(256, y);
      ctx.stroke();
    }
    const texture = new T.CanvasTexture(element);
    texture.wrapS = texture.wrapT = T.RepeatWrapping;
    texture.repeat.set(8, 8);
    texture.colorSpace = T.SRGBColorSpace;
    return texture;
  }, []);
  useEffect(() => () => canvas.dispose(), [canvas]);
  return (
    <group>
      <Box p={[0, 0.6, 0]} s={[7, 1.2, 7]} />
      <mesh position={[0, 1.22, 0]} receiveShadow>
        <boxGeometry args={[6.8, 0.1, 6.8]} />
        <meshStandardMaterial map={canvas} roughness={0.95} metalness={0} />
      </mesh>
      {[-1, 1].map((side) => (
        <Sign
          key={side}
          p={[0, 0.62, side * 3.51]}
          rotation={[0, side === -1 ? Math.PI : 0, 0]}
          s={[5, 1]}
          lines={["TT ARENA"]}
        />
      ))}
      {[-1, 1].flatMap((x) =>
        [-1, 1].map((z) => (
          <group key={x + "," + z}>
            <Bar
              a={[x * 3.45, 0, z * 3.45]}
              b={[x * 3.45, 3.5, z * 3.45]}
              r={0.11}
              c="#a5aab3"
            />
            {[1.8, 2.4, 3].map((y) => (
              <group key={y}>
                <Bar
                  a={[x * 3.45, y, z * 3.45]}
                  b={[x * 3.1, y, z * 3.25]}
                  r={0.025}
                />
                <Bar
                  a={[x * 3.45, y, z * 3.45]}
                  b={[x * 3.25, y, z * 3.1]}
                  r={0.025}
                />
                <Box
                  p={[x * 3.1, y, z * 3.25]}
                  s={[0.42, 0.22, 0.28]}
                  c={RED}
                />
                <Box
                  p={[x * 3.25, y, z * 3.1]}
                  s={[0.28, 0.22, 0.42]}
                  c={RED}
                />
              </group>
            ))}
          </group>
        )),
      )}
      {[1.8, 2.4, 3].map((y, i) => (
        <group key={y}>
          {[-1, 1].map((side) => (
            <group key={side}>
              <Bar
                a={[-3.25, y, side * 3.25]}
                b={[3.25, y, side * 3.25]}
                r={0.035}
                c={i === 1 ? "#dadde0" : RED}
              />
              <Bar
                a={[side * 3.25, y, side === -1 ? -1.65 : -3.25]}
                b={[side * 3.25, y, 3.25]}
                r={0.035}
                c={i === 1 ? "#dadde0" : RED}
              />
            </group>
          ))}
          <EntryRope progress={progress} y={y} index={i} />
        </group>
      ))}
      {Array.from({ length: ENTRY.steps }, (_, i) => {
        const rise = (ENTRY.rise * (i + 1)) / ENTRY.steps;
        return (
          <group key={i}>
            <Box
              p={[-5.4 + i * 0.5, rise / 2, ENTRY.z]}
              s={[0.5, rise, 1.4]}
              c="#656c77"
            />
            <Box
              p={[-5.4 + i * 0.5, rise + 0.004, ENTRY.z]}
              s={[0.47, 0.008, 1.32]}
              c="#959ba5"
            />
          </group>
        );
      })}
      <Sign
        p={[-4.25, 1.75, -1.73]}
        s={[2.6, 0.32]}
        lines={["TEMPORARY ROPE ENTRY"]}
      />
      <Sign
        p={[0, 1.279, 0]}
        s={[3.4, 2]}
        rotation={[-Math.PI / 2, 0, 0]}
        lines={["TT", "BUILD. LEARN. REPEAT."]}
      />
    </group>
  );
}
function Crowd({ mobile, reduced }: { mobile: boolean; reduced: boolean }) {
  const headGeometry = useMemo(spectatorHead, []);
  const torsoGeometry = useMemo(spectatorTorso, []);
  useEffect(() => () => { headGeometry.dispose();torsoGeometry.dispose(); },[headGeometry,torsoGeometry]);
  const body = useRef<T.InstancedMesh>(null),
    head = useRef<T.InstancedMesh>(null),
    arms = useRef<T.InstancedMesh>(null),
    legs = useRef<T.InstancedMesh>(null);
  const count = mobile ? 900 : 4200;
  const people = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const floorCount = mobile ? 100 : 280;
        let x: number, z: number, y: number;
        if (i < floorCount) {
          const side = i % 2 ? -1 : 1,
            row = Math.floor(i / 2) % 4,
            n = Math.floor(i / 8);
          x = side * (6.2 + row * 1.25);
          z = -31 + n * (18 / Math.ceil(floorCount / 8));
          y = 0;
        } else {
          const n = i - floorCount,
            tier = Math.floor(n / ((count - floorCount) / 5)),
            row = Math.floor(n / 5) % 4,
            radius = 18 + tier * 3.3 + row * 0.55;
          let angle = n * 2.39996;
          x = Math.cos(angle) * radius;
          z = Math.sin(angle) * radius * 2 - 17;
          // Reserve the entire choreography envelope for cameras, consoles and ring.
          // Re-sample the same elliptical tier, so feet continue to rest on a terrace.
          while (Math.abs(x) < 16 && z > -43 && z < 20) {
            angle += 2.39996;
            x = Math.cos(angle) * radius;
            z = Math.sin(angle) * radius * 2 - 17;
          }
          y = tier * 2.4;
        }
        return {
          x,
          z,
          y,
          phase: i * 1.813,
          height: 0.92 + (i % 7) * 0.025,
          color: new T.Color(
            ["#293c51", "#632c37", "#3a4048", "#9b9992", "#1f2730", "#4b3b5b"][
              i % 6
            ],
          ),
          skin: new T.Color(
            ["#a68c7d", "#785748", "#be9b86", "#856950"][i % 4],
          ),
        };
      }),
    [count, mobile],
  );
  const dummy = useMemo(() => new T.Object3D(), []),
    lastUpdate = useRef(-1);
  useEffect(() => {
    people.forEach((p, i) => {
      body.current?.setColorAt(i, p.color);
      arms.current?.setColorAt(i, p.color);
      head.current?.setColorAt(i, p.skin);
    });
    for (const ref of [body, arms, head])
      if (ref.current?.instanceColor)
        ref.current.instanceColor.needsUpdate = true;
  }, [people]);
  useFrame(({ clock }) => {
    const t = reduced ? 0 : clock.elapsedTime;
    if (reduced && lastUpdate.current === 0) return;
    if (t - lastUpdate.current < 1 / (mobile ? 20 : 30)) return;
    lastUpdate.current = t;
    people.forEach((p, i) => {
      const sway = Math.sin(t * (1.1 + (i % 5) * 0.13) + p.phase) * 0.025,
        h = p.height;
      const yaw = Math.atan2(-p.x, -13 - p.z);
      dummy.position.set(p.x, p.y + 1.02 * h + sway, p.z);
      dummy.rotation.set(0, yaw, Math.sin(t + p.phase) * 0.045);
      dummy.scale.set(0.42, 0.49 * h, 0.26);
      dummy.updateMatrix();
      body.current?.setMatrixAt(i, dummy.matrix);
      dummy.position.y = p.y + 1.54 * h + sway;
      dummy.rotation.z = 0;
      dummy.scale.set(0.16, 0.18 * h, 0.16);
      dummy.updateMatrix();
      head.current?.setMatrixAt(i, dummy.matrix);
      dummy.position.set(
        p.x + 0.24 * Math.cos(yaw),
        p.y + 1.28 * h + sway,
        p.z - 0.24 * Math.sin(yaw),
      );
      dummy.rotation.z =
        Math.sin(t * (1.2 + (i % 3) * 0.22) + p.phase) * 0.65 + 0.25;
      dummy.scale.set(0.095, 0.42 * h, 0.095);
      dummy.updateMatrix();
      arms.current?.setMatrixAt(i, dummy.matrix);
      for (let side = 0; side < 2; side++) {
        dummy.position.set(
          p.x + (side ? 1 : -1) * 0.115 * Math.cos(yaw),
          p.y + 0.36 * h,
          p.z - (side ? 1 : -1) * 0.115 * Math.sin(yaw),
        );
        dummy.rotation.set(0, yaw, 0);
        dummy.scale.set(0.14, 0.71 * h, 0.15);
        dummy.updateMatrix();
        legs.current?.setMatrixAt(i * 2 + side, dummy.matrix);
      }
    });
    for (const ref of [body, head, arms, legs])
      if (ref.current) ref.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <group>
      <instancedMesh
        ref={body}
        args={[undefined, undefined, count]}
        frustumCulled={false}
      >
        <primitive object={torsoGeometry} attach="geometry" />
        <meshStandardMaterial roughness={1} />
      </instancedMesh>
      <instancedMesh
        ref={head}
        args={[undefined, undefined, count]}
        frustumCulled={false}
      >
        <primitive object={headGeometry} attach="geometry" />
        <meshStandardMaterial roughness={.85} vertexColors />
      </instancedMesh>
      <instancedMesh
        ref={arms}
        args={[undefined, undefined, count]}
        frustumCulled={false}
      >
        <boxGeometry />
        <meshStandardMaterial roughness={1} />
      </instancedMesh>
      <instancedMesh
        ref={legs}
        args={[undefined, undefined, count * 2]}
        frustumCulled={false}
      >
        <boxGeometry />
        <meshStandardMaterial color="#171d26" roughness={1} />
      </instancedMesh>
      {Array.from({ length: mobile ? 5 : 9 }, (_, i) => (
        <Sign
          key={i}
          p={[(i % 2 ? 1 : -1) * (6.3 + (i % 3) * 1.2), 2.2, -29 + i * 2.3]}
          rotation={[0, i % 2 ? -Math.PI / 2 : Math.PI / 2, 0]}
          s={[0.95, 0.6]}
          lines={[i % 2 ? "TT" : "LET’S GO"]}
        />
      ))}
    </group>
  );
}
function Stadium() {
  return (
    <group>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.12, -12]}
        receiveShadow
      >
        <planeGeometry args={[110, 110]} />
        <meshStandardMaterial
          color="#15181d"
          roughness={0.8}
          metalness={0.25}
        />
      </mesh>
      {Array.from({ length: 6 }, (_, i) => (
        <mesh
          key={i}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={[1, 2, 1]}
          position={[0, i * 1.35, -17]}
        >
          <ringGeometry args={[18 + i * 3.3, 21.2 + i * 3.3, 64]} />
          <meshStandardMaterial
            color={i % 2 ? "#25282e" : "#1b1e24"}
            side={T.DoubleSide}
          />
        </mesh>
      ))}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        scale={[1, 2, 1]}
        position={[0, 17, -17]}
      >
        <ringGeometry args={[10, 39, 64]} />
        <meshStandardMaterial color="#16191e" side={T.DoubleSide} />
      </mesh>
      {[-1, 1].map((x) => (
        <Truss key={x} x={0} z={x === -1 ? -18 : 9} width={28} y={13} />
      ))}
      <group position={[0, 11, 0]}>
        <mesh><cylinderGeometry args={[3.4, 3.4, 2.6, 8]} /><meshStandardMaterial color="#252b34" metalness={0.8} roughness={0.3} /></mesh>
        {[0, Math.PI / 2, Math.PI, -Math.PI / 2].map(angle => <group key={angle} rotation={[0, angle, 0]}><Sign p={[0, 0, 3.45]} s={[2.5, 2.1]} color="#ff2445" lines={["TT", "CODE. BUILD. CREATE."]} /></group>)}
        {[-1.4, 1.4].map(y => <mesh key={y} position={[0,y,0]} rotation={[Math.PI/2,0,0]}><torusGeometry args={[3.4,0.06,6,32]} /><meshStandardMaterial color="#e01739" emissive="#e01739" emissiveIntensity={1.5} /></mesh>)}
        <Sign
          p={[0, 0, 2.01]}
          s={[5.6, 2]}
          lines={["TT ARENA", "TANISHQ TIWARI"]}
        />
        {[-1, 1].map((s) => (
          <Bar key={s} a={[s * 2, 1, 0]} b={[s * 2, 6, 0]} r={0.06} />
        ))}
      </group>
    </group>
  );
}
function MovingFixture({
  p,
  reduced,
  phase = 0,
  illuminate = false,
  color = "#dce7ff",
}: {
  p: V;
  reduced: boolean;
  phase?: number;
  illuminate?: boolean;
  color?: string;
}) {
  const group = useRef<T.Group>(null),
    target = useMemo(() => new T.Object3D(), []);
  const light = useRef<T.SpotLight>(null),
    direction = useMemo(() => new T.Vector3(), []);
  const origin = useMemo(() => new T.Vector3(...p), [p]);
  const beamUniforms = useMemo(() => ({ beamColor: { value: new T.Color(color) } }), [color]);
  useFrame(({ clock }) => {
    const t = reduced ? 0 : clock.elapsedTime;
    target.position.set(
      Math.sin(t * 0.23 + phase) * 8,
      0,
      p[2] + Math.cos(t * 0.17 + phase) * 5,
    );
    target.updateMatrixWorld();
    direction
      .copy(target.position)
      .sub(origin)
      .normalize();
    group.current?.quaternion.setFromUnitVectors(
      new T.Vector3(0, -1, 0),
      direction,
    );
  });
  return (
    <group>
      <primitive object={target} />
      <group position={p} ref={group}>
        <Box p={[0, 0.12, 0]} s={[0.65, 0.4, 0.65]} />
        <mesh position={[0, -6, 0]}>
          <coneGeometry args={[1.65, 12, 24, 1, true]} />
          <shaderMaterial
            uniforms={beamUniforms}
            vertexShader={`varying vec2 beamUv; varying vec3 beamNormal; varying vec3 beamView; void main(){beamUv=uv;vec4 p=modelViewMatrix*vec4(position,1.);beamView=-p.xyz;beamNormal=normalize(normalMatrix*normal);gl_Position=projectionMatrix*p;}`}
            fragmentShader={`uniform vec3 beamColor; varying vec2 beamUv; varying vec3 beamNormal; varying vec3 beamView; void main(){float soft=pow(abs(dot(normalize(beamNormal),normalize(beamView))),.7);float ends=smoothstep(0.,.22,beamUv.y)*smoothstep(1.,.72,beamUv.y);gl_FragColor=vec4(beamColor,.095*soft*ends);}`}
            transparent depthWrite={false} side={T.DoubleSide} blending={T.AdditiveBlending}
          />
        </mesh>
        <mesh position={[0, -0.15, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.18, 12]} />
          <meshBasicMaterial color="#f7f9ff" />
        </mesh>
      </group>
      {illuminate && (
        <spotLight
          ref={light}
          position={p}
          target={target}
          angle={0.137}
          penumbra={0.35}
          intensity={1400}
          distance={48}
          color={color}
        />
      )}
    </group>
  );
}
function MovingLights({ reduced, mobile }: { reduced: boolean; mobile: boolean }) {
  const target = useMemo(() => {
    const object = new T.Object3D();
    object.position.set(0, 0.4, -24);
    return object;
  }, []);
  return (
    <group>
      <ambientLight intensity={0.55} />
      <hemisphereLight args={["#d5dfef", "#24151b", 0.8]} />
      <primitive object={target} />
      <spotLight
        position={[-6, 12, -25]}
        target={target}
        angle={0.55}
        penumbra={0.6}
        intensity={1100}
        distance={60}
        color="#e7edff"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.001}
      />
      <pointLight
        position={[0, 5, -36]}
        intensity={70}
        distance={16}
        color={RED}
      />
      <pointLight
        position={[0, 6, 0]}
        intensity={360}
        distance={22}
        color="#e8eefa"
      />
      {[-1, 1].flatMap((side) =>
        [0, 1, 2, 3].map((i) => (
          <MovingFixture
            key={side + "," + i}
            p={[side * (6 + i * 2), 12, -35 + i * 10]}
            phase={i + side * 0.7}
            color={(i + (side === 1 ? 1 : 0)) % 3 === 0 ? "#ff1532" : "#dce7ff"}
            reduced={reduced}
            illuminate={mobile ? i === 1 && side === 1 : (i === 0 && side === -1) || i === 2}
          />
        )),
      )}
    </group>
  );
}
function TemporaryAvatar({
  journey,
}: {
  journey: MutableRefObject<JourneyState>;
}) {
  const gltf = useGLTF("/models/tt-temporary.glb");
  const model = useMemo(() => clone(gltf.scene), [gltf.scene]);
  const root = useRef<T.Group>(null),
    last = useRef(new T.Vector3(0, 1.1, -39));
  const mixer = useMemo(() => new T.AnimationMixer(model), [model]);
  const actions = useMemo(
    () => ({
      walk: gltf.animations.find((a) => a.name === "EntranceWalk"),
      idle: gltf.animations.find((a) => a.name === "Idle"),
    }),
    [gltf.animations],
  );
  const walk = useMemo(
    () => (actions.walk ? mixer.clipAction(actions.walk) : null),
    [mixer, actions],
  );
  const idle = useMemo(
    () => (actions.idle ? mixer.clipAction(actions.idle) : null),
    [mixer, actions],
  );
  const pos = useMemo(() => new T.Vector3(), []);
  useEffect(() => {
    walk?.play();
    idle?.play();
    model.traverse((object) => {
      if (object instanceof T.Mesh) {
        object.castShadow = true;
        object.receiveShadow = true;
      }
    });
    return () => {
      mixer.stopAllAction();
      mixer.uncacheRoot(model);
    };
  }, [walk, idle, mixer, model]);
  useFrame((_, delta) => {
    if (!root.current) return;
    const j = journey.current,
      sample = sampleJourney(j.current);
    const entering = j.current < 0.001;
    pos.set(...(sample.avatar as V));
    if (entering) pos.set(0, 1.1, -39 + j.intro * 4);
    const walking =
      pos.distanceToSquared(last.current) > 0.0000002 && !j.reduced;
    last.current.copy(pos);
    root.current.position.copy(pos);
    if (walk) {
      walk.weight = walking ? 1 : 0;
      const metres = entering ? j.intro * 4 : sample.distance + 4;
      walk.time =
        ((((metres / 1.28) % 1) + 1) % 1) * (actions.walk?.duration ?? 1.2);
    }
    if (idle) {
      idle.weight = walking ? 0 : 1;
      idle.time += j.reduced ? 0 : Math.min(delta, 0.05);
    }
    mixer.update(0);
    const yaw = entering ? 0 : sample.avatarYaw;
    const difference =
      T.MathUtils.euclideanModulo(
        yaw - root.current.rotation.y + Math.PI,
        Math.PI * 2,
      ) - Math.PI;
    root.current.rotation.y +=
      difference * (1 - Math.exp(-10 * Math.min(delta, 0.05)));
  });
  return (
    <group ref={root}>
      <primitive object={model} />
      <Sign p={[0, 2.15, 0]} s={[1.6, 0.32]} lines={["TEMPORARY RIG"]} />
    </group>
  );
}
function CameraRig({ journey }: { journey: MutableRefObject<JourneyState> }) {
  const { camera, size } = useThree();
  const look = useMemo(() => new T.Vector3(), []),
    pos = useMemo(() => new T.Vector3(), []);
  useFrame((_, delta) => {
    const j = journey.current;
    if (!j.paused)
      j.current = T.MathUtils.damp(
        j.current,
        j.target,
        j.reduced ? 14 : 4,
        Math.min(delta, 0.05),
      );
    const sample = sampleJourney(j.current);
    pos.set(...(sample.camera as V));
    look.set(...(sample.look as V));
    const perspective = camera as T.PerspectiveCamera;
    let fov = 45;
    if (j.mobile) {
      // Widen the lens rather than dollying through the ring to frame the stage.
      const aspect = size.width / size.height;
      const width =
        sample.chapter <= 1
          ? 12.8
          : sample.chapter === 3
            ? 9.8
            : sample.chapter >= 4
              ? 4.8
              : Math.max(8, pos.distanceTo(look) * 0.65);
      fov = T.MathUtils.clamp(
        T.MathUtils.radToDeg(
          2 * Math.atan(width / (2 * pos.distanceTo(look) * aspect)),
        ),
        52,
        104,
      );
    }
    if (perspective.fov !== fov) {
      perspective.fov = fov;
      perspective.updateProjectionMatrix();
    }
    camera.position.copy(pos);
    camera.lookAt(look);
  });
  return null;
}
export function PhysicalScreen({
  p,
  rotation = [0, 0, 0],
  size,
  children,
  visible = true,
}: {
  p: V;
  rotation?: V;
  size: [number, number];
  children: ReactNode;
  visible?: boolean;
}) {
  return (
    <group position={p} rotation={rotation}>
      <Box
        p={[0, 0, -0.14]}
        s={[size[0] + 0.28, size[1] + 0.28, 0.32]}
        c="#363c46"
      />
      {[-1, 1].map(side => <group key={"bezel"+side}>
        <Box p={[side*(size[0]/2+.08),0,.08]} s={[.13,size[1]+.3,.18]} c="#8c9097" />
        <Box p={[0,side*(size[1]/2+.08),.08]} s={[size[0]+.3,.13,.18]} c="#686e77" />
        {[-1,0,1].map(y=><mesh key={y} position={[side*(size[0]/2+.08),y*size[1]*.48,.19]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.045,.045,.025,6]} /><meshStandardMaterial color="#b6b9bf" metalness={1} roughness={.3}/></mesh>)}
      </group>)}
      <Box p={[0, 0, 0.035]} s={[size[0], size[1], 0.04]} c="#080b10" />
      {[-1, 1].map((s) => (
        <Box
          key={s}
          p={[s * (size[0] / 2 - 0.09), -size[1] / 2 - 0.04, 0.06]}
          s={[0.035, 0.025, 0.02]}
          c={RED}
          emissive
        />
      ))}
      {visible && (
        <Html
          transform
          occlude="blending"
          position={[0, 0, 0.075]}
          distanceFactor={(size[0] * 400) / 900}
          zIndexRange={[15, 1]}
          style={{
            width: 900,
            height: (900 * size[1]) / size[0],
            backfaceVisibility: "hidden",
          }}
        >
          <div
            className="arena-screen"
            style={{ width: 900, height: (900 * size[1]) / size[0] }}
          >
            {children}
          </div>
        </Html>
      )}
    </group>
  );
}
function Ready({
  onReady,
  onFailure,
}: {
  onReady: () => void;
  onFailure: () => void;
}) {
  const { gl, invalidate } = useThree();
  // This component is inside Suspense, so the rig and all critical descendants have loaded.
  useEffect(() => {
    const canvas = gl.domElement;
    const lost = (event: Event) => {
      event.preventDefault();
      onFailure();
    };
    canvas.addEventListener("webglcontextlost", lost);
    const frame = requestAnimationFrame(() => {
      invalidate();
      onReady();
    });
    return () => {
      cancelAnimationFrame(frame);
      canvas.removeEventListener("webglcontextlost", lost);
    };
  }, [gl, invalidate, onReady, onFailure]);
  return null;
}
export default function ArenaWorld({
  journey,
  children,
  onReady,
  onFailure,
  running = true,
}: {
  journey: MutableRefObject<JourneyState>;
  children: ReactNode;
  onReady: () => void;
  onFailure: () => void;
  running?: boolean;
}) {
  const mobile = journey.current.mobile;
  const textures = useMemo(brushedMetal, []);
  useEffect(() => () => {textures.map.dispose();textures.roughnessMap.dispose();}, [textures]);
  return (
    <Canvas
      frameloop={running ? "always" : "never"}
      shadows={!mobile}
      dpr={mobile ? 1 : [1, 1.4]}
      camera={{ position: [0, 4.5, -23], near: 0.1, far: 180, fov: 45 }}
      gl={{ antialias: !mobile, powerPreference: "high-performance" }}
    >
      <color attach="background" args={["#080b11"]} />
      <fog attach="fog" args={["#11151d", 40, 115]} />
      <MetalMaps.Provider value={textures}>
      <Suspense fallback={null}>
        <CameraRig journey={journey} />
        <BlenderArchitecture />
        <ArenaDecor mobile={mobile} reduced={journey.current.reduced} />
        <Ring progress={journey} />
        <Crowd mobile={mobile} reduced={journey.current.reduced} />
        <MovingLights reduced={journey.current.reduced} mobile={mobile} />
        <TemporaryAvatar journey={journey} />
        {children}
        <Ready onReady={onReady} onFailure={onFailure} />
      </Suspense>
      </MetalMaps.Provider>
    </Canvas>
  );
}
