"use client";
import { useEffect, useMemo } from "react";
import * as T from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

// Box trusses have four chords and crossed webs, rather than a flat ladder.
// Merge static tubes to keep the entire overhead kit to one draw call.
export default function StageRigging({ mobile }: { mobile: boolean }) {
  const geometry = useMemo(() => {
    const pieces: T.BufferGeometry[] = [];
    const up = new T.Vector3(0, 1, 0);
    const tube = (a: T.Vector3, b: T.Vector3, radius: number) => {
      const direction = b.clone().sub(a);
      const shape = new T.CylinderGeometry(radius, radius, direction.length(), mobile ? 5 : 8, 1);
      shape.applyMatrix4(new T.Matrix4().compose(a.clone().add(b).multiplyScalar(.5), new T.Quaternion().setFromUnitVectors(up, direction.normalize()), new T.Vector3(1, 1, 1)));
      pieces.push(shape);
    };
    const truss = (a: T.Vector3, b: T.Vector3) => {
      const length = a.distanceTo(b), axis = b.clone().sub(a).normalize();
      const u = new T.Vector3().crossVectors(axis, Math.abs(axis.y) > .9 ? new T.Vector3(1, 0, 0) : up).normalize().multiplyScalar(.25);
      const v = new T.Vector3().crossVectors(axis, u).normalize().multiplyScalar(.25);
      const offsets = [u.clone().add(v), u.clone().sub(v), u.clone().negate().sub(v), v.clone().sub(u)];
      offsets.forEach(offset => tube(a.clone().add(offset), b.clone().add(offset), .045));
      const bays = Math.ceil(length / 1.15);
      for (let i = 0; i < bays; i++) for (let side = 0; side < 4; side++) {
        const from = a.clone().lerp(b, i / bays), to = a.clone().lerp(b, (i + 1) / bays);
        tube(from.clone().add(offsets[side]), to.clone().add(offsets[(side + 1) % 4]), .022);
        tube(from.clone().add(offsets[side]), from.clone().add(offsets[(side + 1) % 4]), .025);
      }
    };
    const rows = mobile ? [-39, -31] : [-40, -34, -27];
    rows.forEach(z => truss(new T.Vector3(-15, 14, z), new T.Vector3(15, 14, z)));
    [-12, 12].forEach(x => {
      truss(new T.Vector3(x, 1.1, -39), new T.Vector3(x, 14, -39));
      truss(new T.Vector3(x, 14, -40), new T.Vector3(x, 14, -26));
      tube(new T.Vector3(x, 13.7, -34), new T.Vector3(x, 7, -38), .018);
    });
    const merged = mergeGeometries(pieces)!;
    pieces.forEach(piece => piece.dispose());
    return merged;
  }, [mobile]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return <mesh geometry={geometry} receiveShadow><meshStandardMaterial color="#68717d" metalness={.82} roughness={.38} /></mesh>;
}

export function ArenaBanner({ side }: { side: number }) {
  const map = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 256; canvas.height = 768;
    const c = canvas.getContext("2d")!;
    c.fillStyle = "#111216"; c.fillRect(0, 0, 256, 768);
    c.fillStyle = "#cc142e";
    c.beginPath(); c.moveTo(0, 0); c.lineTo(256, 0); c.lineTo(256, 100); c.lineTo(0, 180); c.fill();
    c.fillRect(29, 230, 88, 25); c.fillRect(62, 250, 24, 230);
    c.fillRect(131, 230, 88, 25); c.fillRect(164, 250, 24, 230);
    c.fillStyle = "#8e929b"; c.font = "bold 16px Arial"; c.textAlign = "center";
    c.fillText("TANISHQ TIWARI", 128, 646);
    c.fillStyle = "#d71934"; c.fillRect(0, 730, 256, 4);
    const texture = new T.CanvasTexture(canvas); texture.colorSpace = T.SRGBColorSpace;
    return texture;
  }, []);
  useEffect(() => () => map.dispose(), [map]);
  return <mesh position={[side * 13, 8, -38.6]} rotation={[0, side * -.09, 0]}><planeGeometry args={[2.15, 6.7]} /><meshStandardMaterial map={map} roughness={.85} emissiveMap={map} emissive="#ffffff" emissiveIntensity={.24} side={T.DoubleSide} /></mesh>;
}
