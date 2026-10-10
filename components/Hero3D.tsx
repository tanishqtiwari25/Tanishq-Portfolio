"use client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Color,
  Group,
  Mesh,
  MeshPhysicalMaterial,
  Points,
  MathUtils,
} from "three";

type Palette = {
  primary: string;
  secondary: string;
  gold: string;
  light: boolean;
};
function Sculpture({ mobile, palette }: { mobile: boolean; palette: Palette }) {
  const group = useRef<Group>(null),
    mesh = useRef<Mesh>(null),
    material = useRef<MeshPhysicalMaterial>(null),
    dust = useRef<Points>(null);
  const input = useRef({ x: 0, y: 0, scroll: 0 });
  const progress = useRef(0);
  const { viewport } = useThree();
  const colorA = useMemo(() => new Color(palette.primary), [palette.primary]);
  const colorB = useMemo(
    () => new Color(palette.secondary),
    [palette.secondary],
  );
  const particles = useMemo(() => {
    const n = mobile ? 24 : 60;
    const out = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      out[i * 3] = Math.sin(i * 17.17) * 8;
      out[i * 3 + 1] = Math.cos(i * 11.13) * 5;
      out[i * 3 + 2] = -3 - Math.abs(Math.sin(i * 5.31)) * 5;
    }
    return out;
  }, [mobile]);
  useEffect(() => {
    const scroll = () => {
      input.current.scroll =
        scrollY /
        Math.max(1, document.documentElement.scrollHeight - innerHeight);
    };
    const pointer = (e: PointerEvent) => {
      input.current.x = (e.clientX / innerWidth - 0.5) * 2;
      input.current.y = (e.clientY / innerHeight - 0.5) * 2;
    };
    // Tilt is progressive enhancement: no sensor permission prompt is triggered.
    const tilt = (e: DeviceOrientationEvent) => {
      if (
        e.gamma !== null &&
        e.beta !== null &&
        matchMedia("(pointer:coarse)").matches
      ) {
        input.current.x = MathUtils.clamp(e.gamma / 40, -1, 1);
        input.current.y = MathUtils.clamp((e.beta - 45) / 45, -1, 1);
      }
    };
    window.addEventListener("deviceorientation", tilt, { passive: true });
    scroll();
    window.addEventListener("scroll", scroll, { passive: true });
    window.addEventListener("pointermove", pointer, { passive: true });
    return () => {
      window.removeEventListener("scroll", scroll);
      window.removeEventListener("pointermove", pointer);
      window.removeEventListener("deviceorientation", tilt);
    };
  }, []);
  useFrame((state, delta) => {
    if (!group.current || !mesh.current) return;
    const t = state.clock.elapsedTime;
    const smooth = 1 - Math.exp(-delta * 3);
    progress.current = MathUtils.lerp(
      progress.current,
      input.current.scroll,
      smooth,
    );
    const p = progress.current;
    group.current.position.x = MathUtils.lerp(
      group.current.position.x,
      viewport.width * (mobile ? 0.12 : 0.25) - Math.sin(p * Math.PI * 2) * 0.5,
      smooth,
    );
    group.current.position.y = MathUtils.lerp(
      group.current.position.y,
      (mobile ? -0.4 : 0.15) + Math.sin(t * 0.28) * 0.09 - p * 0.8,
      smooth,
    );
    group.current.rotation.y = MathUtils.lerp(
      group.current.rotation.y,
      input.current.x * 0.2 + p * 1.5,
      smooth,
    );
    group.current.rotation.x = MathUtils.lerp(
      group.current.rotation.x,
      input.current.y * 0.1,
      smooth,
    );
    mesh.current.rotation.set(
      0.4 + Math.sin(t * 0.16) * 0.12,
      t * 0.055 + p * 2,
      0.2 + Math.cos(t * 0.18) * 0.08,
    );
    const scale = (mobile ? 0.45 : 0.68) * (1 - p * 0.25);
    group.current.scale.setScalar(scale);
    // Small nonuniform deformation keeps the sculpture alive without rebuilding geometry.
    mesh.current.scale.set(
      1 + Math.sin(t * 0.22) * 0.035,
      1 + Math.cos(t * 0.18 + p) * 0.045,
      1,
    );
    if (material.current) {
      material.current.color
        .copy(colorA)
        .lerp(colorB, (Math.sin(p * Math.PI * 2 + t * 0.06) + 1) * 0.3);
      material.current.iridescence = 0.65 + Math.sin(t * 0.2) * 0.2;
    }
    if (dust.current) dust.current.rotation.y = t * 0.008;
  });
  return (
    <>
      <group ref={group}>
        <mesh ref={mesh}>
          <torusKnotGeometry
            args={[1.15, 0.34, mobile ? 96 : 160, mobile ? 12 : 24, 2, 3]}
          />
          <meshPhysicalMaterial
            ref={material}
            color={palette.primary}
            metalness={0.6}
            roughness={0.22}
            clearcoat={1}
            clearcoatRoughness={0.12}
            transmission={mobile ? 0 : 0.18}
            thickness={1.3}
            ior={1.45}
            iridescence={0.8}
            iridescenceIOR={1.35}
            envMapIntensity={2.2}
          />
        </mesh>
        <mesh rotation={[Math.PI / 2.8, 0.2, -0.4]}>
          <torusGeometry args={[2.05, 0.006, 6, 100]} />
          <meshBasicMaterial
            color={palette.secondary}
            transparent
            opacity={0.25}
          />
        </mesh>
        <mesh position={[1.65, 0.8, -0.1]}>
          <sphereGeometry args={[0.055, 12, 12]} />
          <meshBasicMaterial color={palette.gold} />
        </mesh>
      </group>
      <points ref={dust}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={particles}
            count={particles.length / 3}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={mobile ? 0.018 : 0.022}
          color={palette.secondary}
          transparent
          opacity={0.45}
          sizeAttenuation
          depthWrite={false}
        />
      </points>
    </>
  );
}
export default function Hero3D() {
  const [visible, setVisible] = useState(true),
    [mobile, setMobile] = useState(false),
    [palette, setPalette] = useState<Palette>({
      primary: "#7c5cff",
      secondary: "#22d3ee",
      gold: "#d4b483",
      light: false,
    });
  useEffect(() => {
    const visibility = () => setVisible(!document.hidden);
    const dim = () => {
      const el = document.querySelector<HTMLElement>(".webgl-scene");
      if (el)
        el.style.opacity = String(
          (innerWidth < 768 ? 0.45 : 1) *
            (1 - Math.min(scrollY / innerHeight, 1) * 0.8),
        );
    };
    window.addEventListener("scroll", dim, { passive: true });
    dim();
    const resize = () =>
      setMobile(innerWidth < 768 || navigator.hardwareConcurrency <= 4);
    const readTheme = () => {
      const s = getComputedStyle(document.documentElement);
      const color = (name: string) =>
        "rgb(" + s.getPropertyValue(name).trim().split(/\s+/).join(",") + ")";
      setPalette({
        primary: color("--color-primary"),
        secondary: color("--color-secondary"),
        gold: color("--color-gold"),
        light: document.documentElement.dataset.theme === "light",
      });
    };
    visibility();
    resize();
    readTheme();
    const observer = new MutationObserver(readTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("resize", resize);
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", dim);
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("resize", resize);
    };
  }, []);
  return (
    <div className="webgl-scene">
      <Canvas
        camera={{ position: [0, 0, 7], fov: 38 }}
        dpr={mobile ? 0.85 : 1}
        frameloop={visible ? "always" : "never"}
        gl={{ antialias: !mobile, alpha: true, powerPreference: "low-power" }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[2, 4, 5]}
          intensity={3}
          color={palette.secondary}
        />
        <directionalLight
          position={[-3, -2, 3]}
          intensity={2}
          color={palette.primary}
        />
        <Sculpture mobile={mobile} palette={palette} />
        <Environment resolution={128}>
          <Lightformer position={[0, 4, 3]} scale={[5, 2, 1]} intensity={4} />
          <Lightformer
            position={[-4, 0, 1]}
            rotation={[0, Math.PI / 2, 0]}
            scale={[3, 5, 1]}
            color={palette.primary}
            intensity={3}
          />
          <Lightformer
            position={[4, 1, 0]}
            rotation={[0, -Math.PI / 2, 0]}
            scale={[2, 6, 1]}
            color={palette.secondary}
            intensity={4}
          />
        </Environment>
      </Canvas>
    </div>
  );
}
