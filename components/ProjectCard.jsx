'use client';
import { useRef } from 'react';
import { ArrowUpRight, Github } from 'lucide-react';
export default function ProjectCard({ project, index, onOpenModal }) {
const card = useRef(null);
const move = e => { if(!matchMedia('(hover: hover) and (prefers-reduced-motion: no-preference)').matches) return; const r=card.current.getBoundingClientRect(); card.current.style.setProperty('--rx', ((.5-(e.clientY-r.top)/r.height)*8)+'deg'); card.current.style.setProperty('--ry', (((e.clientX-r.left)/r.width-.5)*8)+'deg'); };
const reset = () => {card.current.style.setProperty('--rx','0deg');card.current.style.setProperty('--ry','0deg');};
return <article ref={card} className="project-card" onPointerMove={move} onPointerLeave={reset}>
<div className={'project-visual visual-'+project.visual} aria-hidden="true"><span className="visual-label">{project.category}</span><div className="visual-symbol">{project.visual==='scraper'?'[ ↗ ]':project.visual==='montra'?'m.':project.visual==='grow'?'↗':project.visual==='commerce'?'bag.':'✦'}</div><div className="visual-lines">{[1,2,3,4,5].map(n=><i key={n} style={{'--n':n}}/>)}</div><span className="visual-caption">{project.subtitle || project.title}</span></div>
<div className="project-copy"><div className="project-meta"><span>{String(index+1).padStart(2,'0')} / SELECTED WORK</span><span>{project.category}</span></div><h3>{project.title}</h3>{project.subtitle && <p className="project-subtitle">{project.subtitle}</p>}<p>{project.shortDescription}</p><div className="tech-tags">{project.technologies.map(t=><span key={t}>{t}</span>)}</div><div className="project-actions"><button onClick={()=>onOpenModal(project)}>Explore project <ArrowUpRight size={17}/></button><div className="flex gap-4">{project.githubUrl && <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" aria-label={'View '+project.title+' source'}><Github size={18}/></a>}{project.liveUrl && <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">Live site ↗</a>}</div></div></div></article>;
}
