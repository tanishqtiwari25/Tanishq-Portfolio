"use client";
import { Suspense, useEffect, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
import * as T from "three";
function Model({ wire }: { wire: boolean }) {
  const gltf = useGLTF("/models/tt-contact-performer.glb", false, true);
  const scene = useMemo(() => {
    const copy = clone(gltf.scene);
    copy.traverse(object => {
      if (object instanceof T.Mesh) {
        object.frustumCulled = false;
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        const copies = materials.map(material => {
          const next = material.clone();
          if (next instanceof T.MeshStandardMaterial) next.wireframe = wire;
          return next;
        });
        object.material = Array.isArray(object.material) ? copies : copies[0];
      }
    });
    const idle = gltf.animations.find(clip => clip.name === "Idle");
    if (idle) {
      const mixer = new T.AnimationMixer(copy);
      mixer.clipAction(idle).play(); mixer.setTime(0);
    }
    copy.updateMatrixWorld(true);
    return copy;
  }, [gltf.scene, gltf.animations, wire]);
  useEffect(() => () => scene.traverse(object => {
    if (object instanceof T.Mesh) (Array.isArray(object.material) ? object.material : [object.material]).forEach(material => material.dispose());
  }), [scene]);
  return <primitive object={scene} />;
}
export default function AvatarReview() {
  const [angle, setAngle] = useState(0);
  const [wire, setWire] = useState(false);
  const [closeup, setCloseup] = useState(false);
  return (
    <main className="avatar-review">
      <a href="/">← Return to TT Arena</a>
      <span className="arena-eyebrow">AVATAR / STANDARD</span>
      <h1>The arena avatar.</h1>
      <p>
        A simple clothed character with a neutral face. The original walk and ring-entry animations are retained.
      </p>
      <div className="avatar-review-layout">
        <div>
          <div
            className="avatar-viewer"
            aria-label="Interactive face and outfit preview"
          >
            <Canvas
              key={`${angle}-${closeup}`}
              camera={{
                position: (closeup ? [
                  [0, 1.67, .65], [.46, 1.67, .46], [.65, 1.67, 0], [0, 1.67, -.65],
                ] : [
                  [0, 1.15, 3.4], [2.4, 1.15, 2.4], [3.4, 1.15, 0], [0, 1.15, -3.4],
                ])[angle] as [number, number, number],
                fov: 38,
              }}
            >
              <color attach="background" args={["#171f2d"]} />
              <ambientLight intensity={.8} />
              <directionalLight position={[3, 4, 4]} intensity={2} />
              <directionalLight position={[-3, 2, 2]} intensity={.7} />
              <Suspense fallback={null}>
                <Model wire={wire} />
                <OrbitControls
                  target={closeup ? [0, 1.66, 0] : [0, 0.9, 0]}
                  enablePan={false}
                  minDistance={closeup ? .35 : 2}
                  maxDistance={closeup ? 1.8 : 5}
                />
              </Suspense>
              <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[8, 8]} />
                <meshStandardMaterial color="#283449" />
              </mesh>
            </Canvas>
          </div>
          <div className="avatar-angle-buttons">
            <button onClick={() => setCloseup(!closeup)} aria-pressed={closeup}>{closeup ? "Show full body" : "Show face"}</button>
            {["Front", "Three-quarter", "Side", "Rear"].map((label, i) => (
              <button
                key={label}
                onClick={() => setAngle(i)}
                aria-pressed={angle === i}
              >
                {label}
              </button>
            ))}
            <button onClick={() => setWire(!wire)} aria-pressed={wire}>Wireframe</button>
          </div>
          <a href="/models/tt-contact-performer.glb" download>
            Download avatar study GLB ↗
          </a>
        </div>
        <div>
          <h2>Standard character</h2>
          <p>
            This avatar uses a generic face and a simple outfit. The photo-based likeness study is no longer used in the arena.
          </p>
          <p>
            Use the angle controls to inspect the character and its outfit.
          </p>
        </div>
      </div>
    </main>
  );
}
