"use client";
import { useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Vector2 } from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";

/** Small optical light bleed; DOM portfolio displays remain crisp above WebGL. */
export default function ArenaLook() {
  const { gl, scene, camera, size } = useThree();
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
  useFrame((_, delta) => pipeline.composer.render(delta), 1);
  return null;
}
