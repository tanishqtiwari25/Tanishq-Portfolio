"use client";
import { Suspense, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
function Model() {
  const gltf = useGLTF("/models/tt-temporary.glb");
  const scene = useMemo(() => clone(gltf.scene), [gltf.scene]);
  return <primitive object={scene} />;
}
export default function AvatarReview() {
  const [angle, setAngle] = useState(0);
  return (
    <main className="avatar-review">
      <a href="/">← Return to TT Arena</a>
      <span className="arena-eyebrow">ASSET REVIEW / DEVELOPMENT STAND-IN</span>
      <h1>A rig. Not a likeness.</h1>
      <p>
        This is a textured, skinned development model with a skeleton and
        animation clips. It is deliberately faceless and does not reproduce
        Tanishq’s identity. The supplied photos remain the identity references.
        No final facial model has been approved.
      </p>
      <div className="avatar-review-layout">
        <div>
          <div
            className="avatar-viewer"
            aria-label="Interactive temporary avatar preview"
          >
            <Canvas
              key={angle}
              camera={{
                position: [
                  [0, 1.15, 3.4],
                  [2.4, 1.15, 2.4],
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
            {["Front", "Three-quarter", "Side"].map((label, i) => (
              <button
                key={label}
                onClick={() => setAngle(i)}
                aria-pressed={angle === i}
              >
                {label}
              </button>
            ))}
          </div>
          <a href="/models/tt-temporary.glb" download>
            Download temporary GLB ↗
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
            A character artist must reconstruct and validate the face in Blender
            or an equivalent character workflow, texture it against the supplied
            images, fit the black TT outfit, rig and skin the model, and deliver
            an optimized GLB with grounded walk, turn, pose, idle and
            stair/rope-entry clips.
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
