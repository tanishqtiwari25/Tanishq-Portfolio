// Only fixed event names and non-personal, allowlisted values reach GA.
const projectIds=new Set(['data-scraper-system','wealth-pilot','truly-grow','ecommerce-platform','2d-browser-game','sole-track','orbit-crm','instock']);
export function sanitizeEvent(name,params={}){
 if(['view_case_study','project_open','live_demo_click'].includes(name))return projectIds.has(params.project_id)?{name,params:{project_id:params.project_id}}:null;
 if(name==='generate_lead')return {name,params:{method:'contact_form'}};
 if(name==='resume_download')return {name,params:{document_type:'resume'}};
 if(name==='contact_click'&&['email','phone','linkedin','github'].includes(params.method))return {name,params:{method:params.method}};
 return null;
}
export const GA_MEASUREMENT_ID='G-PDFPRY3HD2';
export function trackEvent(name,params){
 const event=sanitizeEvent(name,params);if(!event||typeof window==='undefined')return;
 try{
  if(typeof window.gtag==='function')window.gtag('event',event.name,event.params);
 }catch{/* Measurement must never interrupt a real user action. */}
}
export function cleanPageUrl(value){try{const url=new URL(value);return /^https?:$/.test(url.protocol)?url.origin+url.pathname:'';}catch{return '';}}
export function validMeasurementId(value){return typeof value==='string'&&/^G-[A-Z0-9]{4,20}$/.test(value);}
