'use client';
import { useEffect } from 'react';
export default function ScrollExperience(){useEffect(()=>{
if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
const nodes=document.querySelectorAll('section:not(#home) h2, section:not(#home) article, section:not(#home) .rounded-2xl');
const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');observer.unobserve(e.target);}}),{threshold:.08});
nodes.forEach((node,i)=>{node.classList.add('scroll-reveal');node.style.setProperty('--stagger', (i%3)*65+'ms');observer.observe(node);});
return()=>{observer.disconnect();nodes.forEach(n=>n.classList.remove('scroll-reveal'));};},[]);return null;}
