'use client';
import { useEffect, useRef } from 'react';
// Perspective-projected 3D wire geometry; no WebGL dependency or GPU context required.
export default function ThreeBackground(){const canvas=useRef(null);useEffect(()=>{
const el=canvas.current,ctx=el.getContext('2d');if(!ctx)return;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');let frame,w,h,progress=0,target=0,last=0;
const resize=()=>{w=innerWidth;h=innerHeight;const d=Math.min(devicePixelRatio,1.5);el.width=w*d;el.height=h*d;ctx.setTransform(d,0,0,d,0,0);};
const scroll=()=>{target=scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight);};
const color=getComputedStyle(el).getPropertyValue('--color-secondary').trim().split(/\s+/).join(',');
const draw=time=>{if(document.hidden){frame=null;return;}progress+=(target-progress)*.045;
if(time-last> (w<768?45:25)){last=time;ctx.clearRect(0,0,w,h);const t=reduced.matches?0:time*.000065;const angle=t+progress*1.5;const size=Math.min(w*.21,h*.30);const cx=w*(w<768?.72:.78)-Math.sin(progress*Math.PI*2)*w*.1,cy=h*.43;
const project=(x,y,z)=>{let a=x*Math.cos(angle)-z*Math.sin(angle),b=x*Math.sin(angle)+z*Math.cos(angle);let yy=y*Math.cos(.5+progress)-b*Math.sin(.5+progress),zz=y*Math.sin(.5+progress)+b*Math.cos(.5+progress);const depth=3.8/(3.8+zz);return [cx+a*size*depth,cy+yy*size*depth];};
ctx.strokeStyle='rgba('+color+','+(w<768?.15:.34-progress*.16)+')';ctx.lineWidth=.7;
const rings=w<768?9:17,segments=64;for(let j=0;j<rings;j++){ctx.beginPath();for(let i=0;i<=segments;i++){const a=i/segments*Math.PI*2,b=j/rings*Math.PI*2;const p=project((1+.32*Math.cos(b))*Math.cos(a),.32*Math.sin(b),(1+.32*Math.cos(b))*Math.sin(a));i?ctx.lineTo(...p):ctx.moveTo(...p);}ctx.stroke();}
for(let i=0;i<24;i++){ctx.beginPath();for(let j=0;j<=32;j++){const a=i/24*Math.PI*2,b=j/32*Math.PI*2;const p=project((1+.32*Math.cos(b))*Math.cos(a),.32*Math.sin(b),(1+.32*Math.cos(b))*Math.sin(a));j?ctx.lineTo(...p):ctx.moveTo(...p);}ctx.stroke();}}
if(!reduced.matches)frame=requestAnimationFrame(draw);};
const start=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(draw);};resize();scroll();start();
window.addEventListener('resize',resize);window.addEventListener('scroll',scroll,{passive:true});document.addEventListener('visibilitychange',start);reduced.addEventListener('change',start);
return()=>{cancelAnimationFrame(frame);window.removeEventListener('resize',resize);window.removeEventListener('scroll',scroll);document.removeEventListener('visibilitychange',start);reduced.removeEventListener('change',start);};},[]);return <canvas ref={canvas} className="three-background" aria-hidden="true"/>;}
