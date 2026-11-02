"use client";
import * as T from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

/** Shared generic spectator geometry; these faces do not represent the owner. */
export function spectatorHead() {
  const pieces: T.BufferGeometry[] = [];
  const sphere = (scale: [number,number,number], position: [number,number,number], shade = 1, upper = false) => {
    const g = new T.SphereGeometry(1, 10, 7, 0, Math.PI*2, 0, upper ? Math.PI*.58 : Math.PI);
    g.scale(...scale); g.translate(...position);
    const colors = new Float32Array(g.attributes.position.count*3).fill(shade);
    g.setAttribute("color",new T.BufferAttribute(colors,3)); pieces.push(g);
  };
  sphere([.83,1,.83],[0,0,0]);
  sphere([.26,.38,.3],[0,-.52,.25]);
  sphere([.15,.25,.26],[0,-.03,.79]);
  sphere([.17,.29,.12],[-.81,0,0]); sphere([.17,.29,.12],[.81,0,0]);
  sphere([.88,1.03,.88],[0,.08,-.035],.13,true);
  sphere([.085,.06,.035],[-.28,.12,.79],.12);
  sphere([.085,.06,.035],[.28,.12,.79],.12);
  const result=mergeGeometries(pieces)!; pieces.forEach(g=>g.dispose()); return result;
}
export function spectatorTorso() {
  const points = [[.3,-1],[.43,-.8],[.42,-.2],[.52,.35],[.55,.62],[.39,.83],[.18,.93]].map(([x,y])=>new T.Vector2(x,y));
  return new T.LatheGeometry(points,10);
}
/** Deterministic brushed and pitted metal maps, reused across all housings. */
export function brushedMetal() {
  const size=512, color=document.createElement("canvas"), rough=document.createElement("canvas");
  color.width=color.height=rough.width=rough.height=size;
  const context=color.getContext("2d")!, r=rough.getContext("2d")!;
  const pixels=context.createImageData(size,size), rp=r.createImageData(size,size);
  let seed=4317;
  const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  for(let y=0;y<size;y++) {
    const stripe=(random()-.5)*18;
    for(let x=0;x<size;x++) {
      const k=(y*size+x)*4, value=205+stripe+(random()-.5)*20;
      pixels.data[k]=value;pixels.data[k+1]=value;pixels.data[k+2]=value+3;pixels.data[k+3]=255;
      const roughness=100+random()*60;
      rp.data[k]=rp.data[k+1]=rp.data[k+2]=roughness;rp.data[k+3]=255;
    }
  }
  context.putImageData(pixels,0,0);r.putImageData(rp,0,0);
  for(let i=0;i<110;i++) {
    const x=random()*size,y=random()*size;
    context.strokeStyle=`rgba(30,35,40,${.1+random()*.25})`; context.lineWidth=.4+random();
    context.beginPath();context.moveTo(x,y);context.lineTo(x+20+random()*100,y+(random()-.5)*2);context.stroke();
  }
  const map=new T.CanvasTexture(color),roughnessMap=new T.CanvasTexture(rough);
  map.colorSpace=T.SRGBColorSpace;
  for(const texture of [map,roughnessMap]) {texture.wrapS=texture.wrapT=T.RepeatWrapping;texture.repeat.set(2,2);texture.anisotropy=4;}
  return {map,roughnessMap};
}
