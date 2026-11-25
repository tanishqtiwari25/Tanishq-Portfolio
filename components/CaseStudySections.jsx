export default function CaseStudySections({sections,headingLevel=3}){
 const Heading=`h${headingLevel}`,Subheading=`h${headingLevel+1}`;
 return <div className="pink-case-sections">{sections.map((section,index)=><section key={section.title} id={`study-${index+1}`}><Heading>{section.title}</Heading>
 {section.paragraphs?.map(text=><p key={text}>{text}</p>)}
 {section.items?.map(([title,text])=><div key={title}><Subheading>{title}</Subheading><p>{text}</p></div>)}
 {section.steps&&<ol>{section.steps.map(text=><li key={text}>{text}</li>)}</ol>}
 {section.bullets&&<ul>{section.bullets.map(text=><li key={text}>{text}</li>)}</ul>}
 {section.table&&<div className="pink-case-table" role="region" aria-label={section.title} tabIndex={0}><table><caption>{section.title}</caption><thead><tr>{section.table.headers.map(text=><th scope="col" key={text}>{text}</th>)}</tr></thead><tbody>{section.table.rows.map(([label,value])=><tr key={label}><th scope="row">{label}</th><td>{value}</td></tr>)}</tbody></table></div>}
 {section.note&&<p className="pink-case-note">{section.note}</p>}
 {section.after?.map(text=><p key={text}>{text}</p>)}
 </section>)}</div>;
}
