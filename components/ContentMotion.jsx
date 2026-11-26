"use client";
import {useEffect} from 'react';

// Progressive enhancement: content is readable before JS and if animation fails.
export default function ContentMotion(){
 useEffect(()=>{
  const preference=matchMedia('(prefers-reduced-motion: reduce)');
  const active=new Set();let observer;
  const stop=()=>{observer?.disconnect();active.forEach(animation=>animation.cancel());active.clear();};
  const setup=()=>{
   stop();if(preference.matches||!('IntersectionObserver' in window)||!Element.prototype.animate)return;
   const compact=matchMedia('(max-width:767px)').matches;
   observer=new IntersectionObserver(entries=>{
    entries.forEach(({target,isIntersecting})=>{
     if(!isIntersecting)return;observer.unobserve(target);
     // Never hide a focused control while its section enters.
     if(target.contains(document.activeElement))return;
     const animation=target.animate([
      {opacity:.35,translate:`0 ${compact?12:22}px`},
      {opacity:1,translate:'0 0'}
     ],{duration:compact?360:560,delay:Number(target.dataset.motionOrder||0)*55,easing:'cubic-bezier(.16,1,.3,1)'});
     active.add(animation);animation.onfinish=()=>active.delete(animation);
    });
   },{threshold:.08});
   document.querySelectorAll('section:not(#home) h2, .skills-bento > div, .project-copy, .project-visual, #about .rounded-2xl, #journey .rounded-2xl, #education .rounded-2xl').forEach((node,index)=>{
    // Observe only top-level cards to avoid stacked nested animations.
    if(node.parentElement.closest('.rounded-2xl'))return;
    node.dataset.motionOrder=String(index%2);observer.observe(node);
   });
  };
  setup();preference.addEventListener('change',setup);
  return()=>{stop();preference.removeEventListener('change',setup);};
 },[]);
 return null;
}
