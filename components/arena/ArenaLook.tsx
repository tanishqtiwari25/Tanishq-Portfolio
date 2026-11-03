"use client";
import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Vector2 } from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";

/** Small optical light bleed; DOM portfolio displays remain crisp above WebGL. */
export default function ArenaLook() {
  const { gl, scene, camera, size } = useThree();
  const budget=useRef({last:0,total:0,count:0,scale:1,fastWindows:0});
  const pipeline = useMemo(() => {
    const composer = new EffectComposer(gl);
    const render = new RenderPass(scene, camera);
    const bloom = new UnrealBloomPass(new Vector2(1, 1), .24, .4, 1.05);
    const output = new OutputPass();
    composer.addPass(render); composer.addPass(bloom); composer.addPass(output);
    composer.setPixelRatio(1);
    return { composer, bloom, output };
  }, [gl, scene, camera]);
  useEffect(() => { pipeline.composer.setSize(size.width, size.height); }, [pipeline, size]);
  useEffect(() => () => {
    pipeline.bloom.dispose(); pipeline.output.dispose(); pipeline.composer.dispose();
  }, [pipeline]);
  useFrame((_, delta) => {
    const now=performance.now(),b=budget.current;
    if(b.last && !document.hidden){
      const ms=now-b.last;
      if(ms<250){b.total+=ms;b.count++;}
    }
    b.last=now;
    if(b.total>3000 && b.count>=30){
      const average=b.total/b.count;
      const old=b.scale;
      if(average>40){b.scale=Math.max(.75,b.scale-.125);b.fastWindows=0;}
      else if(average<21){if(++b.fastWindows>=3){b.scale=Math.min(1,b.scale+.125);b.fastWindows=0;}}
      else b.fastWindows=0;
      if(old!==b.scale)pipeline.composer.setPixelRatio(b.scale);
      const output=document.getElementById('arena-render-metrics');
      if(output)output.dataset.renderScale=b.scale.toFixed(3);
      b.total=0;b.count=0;
    }
    pipeline.composer.render(delta);
  }, 1);
  return null;
}
