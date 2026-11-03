"use client";
import { useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as T from "three";

/** A real scene surface: unlike CSS3D text this appears in the ramp reflection. */
export default function EntranceLED({ intro, reduced=false }: { intro: boolean; reduced?:boolean }) {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 2048; canvas.height = 688;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#08080a"; ctx.fillRect(0, 0, 2048, 688);
    let seed = 4317;
    const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
    // Original irregular red signal artwork; no full-scene image backdrop.
    const glow = ctx.createRadialGradient(1060, 440, 40, 1060, 440, 1150);
    glow.addColorStop(0, "#48101a"); glow.addColorStop(.55, "#1d080e"); glow.addColorStop(1, "#07080b");
    ctx.fillStyle = glow; ctx.fillRect(0, 0, 2048, 688);
    for (let i = 0; i < 620; i++) {
      ctx.strokeStyle = `rgba(235,16,43,${.04 + random() * .32})`;
      const x = random() * 2048, y = random() * 688;
      ctx.lineWidth = .5 + random() * 3;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + random() * 380 - 190, y + random() * 110 - 55); ctx.stroke();
    }
    for (let i=0;i<9000;i++) {
      ctx.fillStyle = random()>.18 ? `rgba(255,32,53,${random()*.45})` : "#f3b2b566";
      ctx.fillRect(random()*2048,random()*688,1+random()*8,1+random()*3);
    }
    ctx.font = '900 300px Impact, "Arial Narrow", sans-serif';
    const first = "TANISHQ ", second = "TIWARI";
    const width = ctx.measureText(first + second).width;
    ctx.save(); ctx.translate(1024, 350); ctx.scale(Math.min(1, 1850 / width), 1);
    ctx.fillStyle = "#f3f0ee"; ctx.fillText(first, -width / 2, 0);
    ctx.fillStyle = "#f21832"; ctx.fillText(second, -width / 2 + ctx.measureText(first).width, 0);
    ctx.restore();
    const subtitle = intro ? "CODE. BUILD. CREATE." : "DEVELOPER PORTFOLIO";
    ctx.font = '48px "Arial Narrow", sans-serif';
    const spacing = 38, subtitleWidth = ctx.measureText(subtitle).width + (subtitle.length - 1) * spacing;
    let x = (2048 - subtitleWidth) / 2;
    ctx.fillStyle = "#efebea";
    for (const letter of subtitle) { ctx.fillText(letter, x, 438); x += ctx.measureText(letter).width + spacing; }
    // Fine wear and LED pitch remain below the text's readability threshold.
    for (let i = 0; i < 6500; i++) {
      ctx.fillStyle = `rgba(7,7,9,${random() * .55})`;
      ctx.fillRect(random() * 2048, 150 + random() * 210, 1 + random() * 10, 1 + random() * 2);
    }
    ctx.fillStyle = "#00000022";
    for (let y = 0; y < 688; y += 4) ctx.fillRect(0, y, 2048, 1);
    const map = new T.CanvasTexture(canvas); map.colorSpace = T.SRGBColorSpace;
    map.anisotropy = 4; return map;
  }, [intro]);
  const uniforms=useMemo(()=>({ledTime:{value:0}}),[]);
  const material=useMemo(()=>{
    const m=new T.MeshBasicMaterial({map:texture,toneMapped:false});
    m.onBeforeCompile=shader=>{
      shader.uniforms.ledTime=uniforms.ledTime;
      shader.fragmentShader='uniform float ledTime;\n'+shader.fragmentShader;
      shader.fragmentShader=shader.fragmentShader.replace('#include <dithering_fragment>',`#include <dithering_fragment>
        float scan=exp(-pow((fract(vMapUv.y-ledTime*.035)-.5)*18.,2.));
        gl_FragColor.rgb *= .985+.015*scan;`);
    };
    m.customProgramCacheKey=()=> 'tt-led-subtle-scan-v1';
    return m;
  },[texture,uniforms]);
  useFrame(({clock})=>{uniforms.ledTime.value=reduced?0:clock.elapsedTime;});
  useEffect(()=>()=>material.dispose(),[material]);
  useEffect(() => () => texture.dispose(), [texture]);
  return <mesh position={[0, 9.2, -40.51]} material={material}>
    <planeGeometry args={[20.4, 6.88]} />
  </mesh>;
}
