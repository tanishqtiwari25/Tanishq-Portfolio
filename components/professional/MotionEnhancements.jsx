"use client";
import {useEffect,useState} from 'react';

export default function MotionEnhancements(){
  const [build,setBuild]=useState({label:'interface',active:false});
  useEffect(()=>{
    const preference=window.matchMedia('(prefers-reduced-motion: reduce)');
    let observer,sectionObserver,timer;
    const animations=new Map();
    const seen=new WeakSet();
    function clear(){
      observer?.disconnect();sectionObserver?.disconnect();clearTimeout(timer);
      animations.forEach((animation,target)=>{animation.cancel();target.removeAttribute('data-code-building');});
      animations.clear();
    }
    function setup(){
      clear();setBuild({label:'interface',active:false});
      if(preference.matches||!('IntersectionObserver' in window)||!Element.prototype.animate)return;
      const root=document.querySelector('.professional-site');
      if(!root)return;
      // Observe actual content blocks individually so long sections reveal as read.
      // Content stays visible if JavaScript or the animation API is unavailable.
      const selector='h1,h2,h3,p:not([role]),.pro-work-card,.pro-hero-art,.pro-skills-grid>article,.pro-services-grid>article,.pro-resume-card,.pro-contact-form,.pro-case-table-wrap,.pro-more-work>a,.pro-actions,.pro-skills-grid ul,.pro-process';
      const blocks='.pro-work-card,.pro-hero-art,.pro-skills-grid>article,.pro-services-grid>article,.pro-resume-card,.pro-contact-form,.pro-case-table-wrap,.pro-more-work>a,.pro-actions,.pro-skills-grid ul,.pro-process';
      const targets=[...root.querySelectorAll(selector)].filter(target=>!target.parentElement.closest(blocks)&&!target.closest('.pro-build-status,[role="alert"],[role="status"]'));
      observer=new IntersectionObserver(entries=>{
        let stagger=0;
        entries.forEach(entry=>{
          if(!entry.isIntersecting||seen.has(entry.target))return;
          const target=entry.target;
          seen.add(target);observer.unobserve(target);
          // Focused controls are never clipped or delayed.
          if(target.contains(document.activeElement))return;
          const text=/^H[123]$|^P$/.test(target.tagName);
          target.setAttribute('data-code-building',text?'text':'block');
          const animation=target.animate(text?[
            {clipPath:'inset(0 100% 0 0)',opacity:.45},
            {clipPath:'inset(0 0% 0 0)',opacity:1}
          ]:[
            {opacity:.2,translate:'0 14px',clipPath:'inset(0 0 12% 0)'},
            {opacity:1,translate:'0 0',clipPath:'inset(0 0 0 0)'}
          ],{duration:text?(target.tagName==='H1'?1050:650):700,delay:Math.min(stagger++*65,195),easing:text?'steps(24,end)':'cubic-bezier(.22,1,.36,1)',fill:'backwards'});
          animations.set(target,animation);
          const finish=()=>{target.removeAttribute('data-code-building');animations.delete(target);};
          animation.finished.then(finish).catch(finish);
        });
      },{threshold:.06});
      targets.forEach(target=>observer.observe(target));
      sectionObserver=new IntersectionObserver(entries=>{
        const entry=entries.find(item=>item.isIntersecting);
        if(!entry)return;
        const label=entry.target.id==='main-content'?'introduction':entry.target.id||'case-study';
        setBuild({label,active:true});clearTimeout(timer);
        timer=setTimeout(()=>setBuild({label,active:false}),1400);
      },{rootMargin:'-10% 0px -55% 0px',threshold:0});
      root.querySelectorAll('section[id],.pro-case-intro').forEach(section=>sectionObserver.observe(section));
      const focus=event=>{
        animations.forEach((animation,target)=>{if(target.contains(event.target))animation.finish();});
      };
      root.addEventListener('focusin',focus);
      return ()=>root.removeEventListener('focusin',focus);
    }
    let removeFocus=setup();
    const change=()=>{removeFocus?.();removeFocus=setup();};
    preference.addEventListener('change',change);
    return()=>{clear();removeFocus?.();preference.removeEventListener('change',change);};
  },[]);
  return <div className={`pro-build-status${build.active?' is-building':''}`} aria-hidden="true"><div><span className="pro-build-dot"/><span>portfolio.tsx</span><span>{build.active?'BUILDING':'READY'}</span></div><code><span>{build.active?'render':'✓'}</span> {build.label.replaceAll('-','_')}<b className="pro-code-caret">▌</b></code><i/></div>;
}
