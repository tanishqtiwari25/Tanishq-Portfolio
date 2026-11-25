export const SITE_URL='https://realtanishqtiwari.in';
export const SITE_TITLE='Tanishq Tiwari | React & Next.js Developer in Kanpur';
export const SITE_DESCRIPTION='React and Next.js developer in Kanpur, India. Explore Tanishq Tiwari’s web applications, technical case studies and API-connected business workflows.';
export const SOCIAL_IMAGE='/images/social/portfolio.png';
export const serializeSchema=value=>JSON.stringify(value).replace(/</g,'\\u003c');
export function profileSchema(projects){return {'@context':'https://schema.org','@graph':[
 {'@type':'Person','@id':`${SITE_URL}/#person`,name:'Tanishq Tiwari',url:SITE_URL,jobTitle:'React Frontend Developer',address:{'@type':'PostalAddress',addressLocality:'Kanpur',addressCountry:'IN'},sameAs:['https://github.com/tanishqtiwari25','https://www.linkedin.com/in/tanishq-tiwari-31138b252']},
 {'@type':'WebSite','@id':`${SITE_URL}/#website`,url:SITE_URL,name:'Tanishq Tiwari Portfolio',publisher:{'@id':`${SITE_URL}/#person`}},
 {'@type':'ProfilePage','@id':`${SITE_URL}/#page`,url:SITE_URL,mainEntity:{'@id':`${SITE_URL}/#person`}},
 {'@type':'ItemList',name:'Selected development projects',itemListElement:projects.map((p,i)=>({'@type':'ListItem',position:i+1,url:`${SITE_URL}/work/${p.id}`,name:p.title}))}
]};}
