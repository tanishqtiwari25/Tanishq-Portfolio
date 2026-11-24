import Image from 'next/image';
export default function ProjectVisual({project,priority=false}){
  if(project.image)return <div className={`pro-project-visual visual-${project.id}`}><div className="pro-browser-bar"><span/><span/><span/><small>{project.liveUrl?new URL(project.liveUrl).hostname:project.title}</small></div><div className="pro-capture"><Image src={`/images/arena/${project.image}`} alt={`${project.title} website screenshot`} fill sizes="(max-width: 720px) 90vw, 48vw" priority={priority} /></div></div>;
  return <div className={`pro-project-visual pro-interface-study visual-${project.id}`} aria-label={`${project.title} illustrative interface study, not an actual screenshot`}>
    <div className="pro-study"><div className="pro-study-sidebar"><b>{project.mark||'TT'}</b><i/><i/><i/></div><div className="pro-study-main"><small>WORKSPACE</small><h4>{project.id==='sole-track'?'Inventory overview':project.id==='orbit-crm'?'Team workspace':project.id==='instock'?'Market research':'Lead collection'}</h4><div className="pro-study-stats"><span/><span/><span/></div><div className="pro-study-table">{['Overview','Recent activity','Reports'].map(label=><div key={label}><span>{label}</span><i/><i/></div>)}</div></div></div>
    <span className="pro-study-label">INTERFACE STUDY · SCREENSHOT PENDING</span>
  </div>;
}
