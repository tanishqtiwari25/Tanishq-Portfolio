"use client";
import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import * as T from "three";

// A local, one-time light-card capture supplies broad specular reflections to
// steel and cotton. It does not replace scene geometry or the planar runway.
export default function ArenaReflections({ mobile }: { mobile: boolean }) {
  const { gl, scene } = useThree();
  useEffect(() => {
    if (mobile) return;
    const capture = new T.Scene();
    capture.background = new T.Color("#05070a");
    const geometry = new T.PlaneGeometry(1, 1);
    const white = new T.MeshBasicMaterial({ color: new T.Color(4, 4.3, 5), side: T.DoubleSide, toneMapped: false });
    const red = new T.MeshBasicMaterial({ color: new T.Color(2.8, .03, .08), side: T.DoubleSide, toneMapped: false });
    for (let i = 0; i < 12; i++) {
      const angle = i * Math.PI / 6;
      const card = new T.Mesh(geometry, i % 3 ? white : red);
      card.position.set(Math.cos(angle) * 14, 12, Math.sin(angle) * 14);
      card.scale.set(2.4, .55, 1); card.lookAt(0, 1, 0); capture.add(card);
    }
    const generator = new T.PMREMGenerator(gl);
    const target = generator.fromScene(capture, .05, .1, 50);
    const previous = scene.environment, intensity = scene.environmentIntensity;
    scene.environment = target.texture; scene.environmentIntensity = .32;
    geometry.dispose(); white.dispose(); red.dispose(); generator.dispose();
    return () => { scene.environment = previous; scene.environmentIntensity = intensity; target.dispose(); };
  }, [gl, scene, mobile]);
  return null;
}
