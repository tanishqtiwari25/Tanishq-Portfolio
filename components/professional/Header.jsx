"use client";
import {useEffect,useState,useRef} from 'react';
import MotionEnhancements from './MotionEnhancements';
const links=[['Work','work'],['About','about'],['Skills','skills'],['Services','services'],['Resume','resume']];
export default function Header(){
  const [open,setOpen]=useState(false);
  const trigger=useRef(null);
  useEffect(()=>{const close=e=>{if(e.key==='Escape'&&open){setOpen(false);trigger.current?.focus();}};window.addEventListener('keydown',close);return()=>window.removeEventListener('keydown',close);},[open]);
  return <header className="pro-header"><MotionEnhancements/><a className="pro-wordmark" href="/" aria-label="Tanishq Tiwari home">tanishq<span>.</span></a>
    <button ref={trigger} className="pro-menu-toggle" aria-expanded={open} aria-controls="professional-nav" onClick={()=>setOpen(!open)}>{open?'Close':'Menu'} <span aria-hidden="true">{open?'−':'+'}</span></button>
    <nav id="professional-nav" className={open?'is-open':''} aria-label="Main navigation">{links.map(([label,id])=><a key={id} href={`/#${id}`} onClick={()=>setOpen(false)}>{label}</a>)}<a className="pro-button pro-button-small" href="/#contact" onClick={()=>setOpen(false)}>Let’s talk <span aria-hidden="true">↗</span></a></nav>
  </header>;
}
