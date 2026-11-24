import { notFound } from 'next/navigation';
import Link from 'next/link';
import { work,profile } from '@/data/professional';
import Header from '@/components/professional/Header';
import ProjectVisual from '@/components/professional/ProjectVisual';
import { SITE_URL,serializeSchema } from '@/lib/seo.mjs';
import '@/components/professional/professional.css';
export function generateStaticParams(){return work.map(project=>({slug:project.id}));}
export function generateMetadata({params}){
  const project=work.find(item=>item.id===params.slug);if(!project)return {title:'Project not found'};
  return {title:`${project.title} — Case Study`,description:project.description,alternates:{canonical:`/work/${project.id}`},openGraph:{title:`${project.title} — Tanishq Tiwari`,description:project.description,url:`/work/${project.id}`,images:[{url:'/images/social/portfolio.png',width:1200,height:630}]}};
}
export default function CaseStudy({params}){
  const project=work.find(item=>item.id===params.slug);if(!project)notFound();
  const schema={'@context':'https://schema.org','@type':'CreativeWork',name:project.title,description:project.description,url:`${SITE_URL}/work/${project.id}`,author:{'@type':'Person',name:profile.name,url:SITE_URL}};
  return <main className="professional-site"><Header/><article className="pro-case pro-container">
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:serializeSchema(schema)}}/>
    <Link href="/#work" className="pro-text-link">← Back to selected work</Link>
    <div className="pro-case-intro"><p className="pro-eyebrow">{project.category} / CASE STUDY</p><h1>{project.title}</h1><p>{project.description}</p><div className="pro-actions">{project.liveUrl&&<a className="pro-button" href={project.liveUrl} target="_blank" rel="noopener noreferrer">Visit live project ↗</a>}{project.githubUrl&&<a className="pro-text-link" href={project.githubUrl} target="_blank" rel="noopener noreferrer">View source code ↗</a>}</div></div>
    <ProjectVisual project={project} priority/>
    <div className="pro-case-meta"><div><small>My contribution</small><p>{project.role}</p></div><div><small>Technologies & capabilities</small><p>{project.stack.length?project.stack.join(' · '):'Full technology details to be confirmed.'}</p></div><div><small>Project context</small><p>{project.engagement}</p>{!project.sections&&<p>Client or team engagement details have not been provided.</p>}</div></div>
    <div className="pro-case-content">{project.sections ? <CaseSections sections={project.sections}/> : <><section><h2>The problem</h2><p>{project.problem||'Detailed project goals to be confirmed.'}</p></section><section><h2>The approach</h2><p>{project.solution||'Detailed implementation notes to be confirmed.'}</p></section><section><h2>What I built</h2><ul>{project.features.map(feature=><li key={feature}>{feature}</li>)}</ul></section><section><h2>Technical decisions & challenges</h2><p>{project.challenges||'A detailed challenge-and-resolution account has not been supplied yet.'}</p>{project.whatILearned&&<p>{project.whatILearned}</p>}</section><section><h2>The outcome</h2><p>{project.description}</p><p className="pro-case-note">{project.evidence} Features and contribution statements are based on the supplied resume and project descriptions.</p></section></>}<section><h2>Have a similar challenge?</h2><Link href="/#contact" className="pro-button">Discuss your project ↗</Link></section></div>
  </article><footer className="pro-footer pro-container"><Link href="/">Tanishq Tiwari</Link><a href={profile.resume} download>Download resume</a></footer></main>;
}

function CaseSections({sections}){
 return sections.map((section,index)=><section key={section.title} id={`case-section-${index+1}`}>
  <h2>{section.title}</h2>
  {section.paragraphs?.map(text=><p key={text}>{text}</p>)}
  {section.items?.map(([title,text])=><div className="pro-case-decision" key={title}><h3>{title}</h3><p>{text}</p></div>)}
  {section.steps&&<ol>{section.steps.map(text=><li key={text}>{text}</li>)}</ol>}
  {section.bullets&&<ul>{section.bullets.map(text=><li key={text}>{text}</li>)}</ul>}
  {section.table&&<div className="pro-case-table-wrap" role="region" aria-label={`${section.title} table`} tabIndex={0}><table className="pro-case-table"><caption>{section.title}</caption><thead><tr>{section.table.headers.map(header=><th key={header} scope="col">{header}</th>)}</tr></thead><tbody>{section.table.rows.map(([label,value])=><tr key={label}><th scope="row">{label}</th><td>{value}</td></tr>)}</tbody></table></div>}
  {section.note&&<p className="pro-case-note">{section.note}</p>}
  {section.after?.map(text=><p key={text}>{text}</p>)}
 </section>);
}
