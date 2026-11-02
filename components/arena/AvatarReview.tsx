"use client";
import { Suspense, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
function Model() {
  const gltf = useGLTF("/models/tt-entrance-performer.glb", false, true);
  const scene = useMemo(() => clone(gltf.scene), [gltf.scene]);
  return <primitive object={scene} />;
}
export default function AvatarReview() {
  const [angle, setAngle] = useState(0);
  return (
    <main className="avatar-review">
      <a href="/">← Return to TT Arena</a>
      <span className="arena-eyebrow">ASSET REVIEW / ENTRANCE OUTFIT STUDY</span>
      <h1>The entrance performer.</h1>
      <p>
        An original hooded garment study with cuffs, trouser folds, hands and
        layered sneakers. The 13,824-triangle mesh retains the 13-bone rig and
        four animation clips in a 534 KB GLB. It has no reconstructed facial
        likeness; the supplied photos remain the identity references.
      </p>
      <div className="avatar-review-layout">
        <div>
          <div
            className="avatar-viewer"
            aria-label="Interactive entrance outfit preview"
          >
            <Canvas
              key={angle}
              camera={{
                position: [
                  [0, 1.15, -3.4],
                  [2.4, 1.15, -2.4],
                  [3.4, 1.15, 0],
                ][angle] as [number, number, number],
                fov: 38,
              }}
            >
              <color attach="background" args={["#171f2d"]} />
              <ambientLight intensity={1.6} />
              <directionalLight position={[3, 4, 4]} intensity={3} />
              <Suspense fallback={null}>
                <Model />
                <OrbitControls
                  target={[0, 0.9, 0]}
                  enablePan={false}
                  minDistance={2}
                  maxDistance={5}
                />
              </Suspense>
              <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[8, 8]} />
                <meshStandardMaterial color="#283449" />
              </mesh>
            </Canvas>
          </div>
          <div className="avatar-angle-buttons">
            {["Rear", "Three-quarter", "Side"].map((label, i) => (
              <button
                key={label}
                onClick={() => setAngle(i)}
                aria-pressed={angle === i}
              >
                {label}
              </button>
            ))}
          </div>
          <a href="/models/tt-entrance-performer.glb" download>
            Download outfit study GLB ↗
          </a>
        </div>
        <div>
          <h2>Identity references</h2>
          <div className="avatar-references">
            <img
              src="/images/arena/reference-outdoor.webp"
              alt="Supplied outdoor reference of Tanishq wearing a patterned scarf"
            />
            <img
              src="/images/arena/reference-gym.webp"
              alt="Supplied standing gym reference for body and facial proportions"
            />
            <img
              src="/images/arena/reference-seated.webp"
              alt="Supplied seated reference of Tanishq in a black shirt"
            />
          </div>
          <h2>Required to finish your avatar</h2>
          <p>
            Remaining work includes a validated facial reconstruction, refined
            garment tailoring and skin textures, deformation review and a
            grounded stair/rope-entry performance. The current outfit is a
            composition asset, not an approved final character.
          </p>
          <p>
            Front, three-quarter and side views of that likeness model must be
            reviewed before it replaces this stand-in. A true profile photo
            would help resolve unseen side features; these three images do not
            contain a clean side profile.
          </p>
        </div>
      </div>
    </main>
  );
}
