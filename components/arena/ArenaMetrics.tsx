"use client";
import {useEffect,useRef} from 'react';
import {useFrame,useThree} from '@react-three/fiber';

/** Opt-in development measurement. Counts reflection and postprocess passes too. */
export default function ArenaMetrics(){
  const {gl}=useThree();
  const samples=useRef<number[]>([]),previous=useRef(0),updated=useRef(0),calls=useRef<number[]>([]),triangles=useRef<number[]>([]);
  useEffect(()=>{
    const old=gl.info.autoReset;gl.info.autoReset=false;
    return ()=>{gl.info.autoReset=old;};
  },[gl]);
  useFrame(()=>{
    const now=performance.now();
    if(previous.current && !document.hidden){
      const ms=now-previous.current;
      if(ms<1000){samples.current.push(ms);calls.current.push(gl.info.render.calls);triangles.current.push(gl.info.render.triangles);}
    }
    previous.current=now;gl.info.reset();
    if(now-updated.current<1500 || samples.current.length<12)return;
    updated.current=now;
    const sorted=samples.current.slice().sort((a,b)=>a-b),median=sorted[Math.floor(sorted.length*.5)],p95=sorted[Math.floor(sorted.length*.95)];
    const average=(a:number[])=>Math.round(a.reduce((n,x)=>n+x,0)/a.length);
    const el=document.getElementById('arena-render-metrics');
    if(el)el.textContent=`${samples.current.length} frames | median ${median.toFixed(1)} ms (${(1000/median).toFixed(0)} FPS) | p95 ${p95.toFixed(1)} ms | ${average(calls.current)} calls | ${average(triangles.current).toLocaleString()} tris incl. extra passes`;
    samples.current=[];calls.current=[];triangles.current=[];
  });
  return null;
}
