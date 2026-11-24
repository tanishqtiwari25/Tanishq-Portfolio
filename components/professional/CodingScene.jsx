"use client";
import {useEffect,useRef,useState} from 'react';
const code=`import { ideas } from './you';

export function Build() {
  const product = create({
    design: 'thoughtful',
    experience: 'responsive',
    builtFor: 'real people'
  });

  return <YourNextIdea
    craftedWith="React"
    readyToGrow={true}
  />;
}`;
export default function CodingScene(){
 const host=useRef(null),count=useRef(0);
 const [length,setLength]=useState(0);
 const [paused,setPaused]=useState(false);
 const hold=useRef(0);
 useEffect(()=>{
  const node=host.current,motion=matchMedia('(prefers-reduced-motion: reduce)');
  let timer,observer;
  const stop=()=>{clearInterval(timer);timer=undefined;node.dataset.running='false';};
  const start=()=>{
   if(timer||paused||motion.matches||document.hidden)return;
   node.dataset.running='true';
   timer=setInterval(()=>{
    if(count.current===code.length){
     if(++hold.current<46)return;
     hold.current=0;count.current=0;
    }else count.current=Math.min(code.length,count.current+3);
    setLength(count.current);
   },48);
  };
  const setup=()=>{
   stop();observer?.disconnect();
   if(motion.matches){count.current=code.length;setLength(code.length);return;}
   if(!('IntersectionObserver' in window)){count.current=code.length;setLength(code.length);return;}
   observer=new IntersectionObserver(([entry])=>{if(entry.isIntersecting&&!document.hidden)start();else stop();},{threshold:.15});
   observer.observe(node);
  };
  const visibility=()=>{if(document.hidden)stop();else{observer?.unobserve(node);observer?.observe(node);}};
  setup();motion.addEventListener('change',setup);document.addEventListener('visibilitychange',visibility);
  return()=>{stop();observer?.disconnect();motion.removeEventListener('change',setup);document.removeEventListener('visibilitychange',visibility);};
 },[paused]);
 const phase=length<80?0:length<150?1:length<220?2:3;
 return <div ref={host} className="pro-hero-art pro-coding-scene" role="group" aria-label="Animated three-dimensional code editor and interface preview">
  <div className="pro-coding-stage" aria-hidden="true">
   <div className="pro-coding-floor"/>
   <div className="pro-coding-editor"><div className="pro-coding-chrome"><span/><span/><span/><small>Build.tsx</small><b>React</b></div><div className="pro-coding-tab">⌘ &nbsp; src / components / YourNextIdea</div><div className="pro-coding-source"><div className="pro-code-numbers">{code.split('\n').map((_,i)=><span key={i}>{i+1}</span>)}</div><pre>{(length?code.slice(0,length):'').split('\n').map((line,i)=><span key={i} className={/^import|^export/.test(line)?'code-purple':line.includes(':')||line.includes('=')?'code-blue':''}>{line}{i===(length?code.slice(0,length):'').split('\n').length-1&&length<code.length&&<i className="pro-typing-caret"/>}{'\n'}</span>)}</pre></div><div className="pro-coding-editor-foot"><span>● main</span><span>TypeScript React</span><span>UTF-8</span></div></div>
   <div className={`pro-coding-preview phase-${phase}`}><div className="pro-coding-preview-top"><i/><span>localhost / your-next-idea</span><b>↗</b></div><div className="pro-preview-layout"><div className="pro-preview-nav"><strong>your.idea</strong><i/><i/></div><div className="pro-preview-copy"><small>FROM POSSIBILITY TO PRODUCT</small><h3>Ideas become<br/><em>experiences.</em></h3><p>Designed with care.<br/>Built for people.</p><span className="pro-preview-cta">Explore the experience ↗</span></div><div className="pro-preview-blocks"><span/><span/><span/></div></div><div className="pro-preview-label"><span/> {phase===3?'Component rendered':'Rendering interface…'}</div></div>
   <div className="pro-coding-terminal"><small>TERMINAL <span>npm run build</span></small><code>{phase===3?'✓ Your idea is ready.':phase===2?'› Rendering components…':phase===1?'› Building your interface…':'› Writing the first lines…'}<b>_</b></code></div>
   <span className="pro-coding-caption">01 / WRITE &nbsp; → &nbsp; 02 / BUILD &nbsp; → &nbsp; 03 / SHIP</span>
  </div>
  <button className="pro-coding-motion-toggle" type="button" aria-pressed={paused} onClick={()=>setPaused(value=>!value)}>{paused?'▶ Resume motion':'Ⅱ Pause motion'}</button>
 </div>;
}
