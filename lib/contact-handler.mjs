import { validateContact } from './contact-validation.mjs';
const windows=new Map();
const response=(status,extra={})=>Response.json(status===200?{ok:true}:{error:'Unable to send message. Please try again.'},{status,headers:{'Cache-Control':'no-store',...extra}});
// Best-effort per-instance limit: serverless instances do not share counters; restarts reset them.
export async function handleContact(request,{env=process.env,fetcher=fetch,now=Date.now}={}){
try {
const origin=request.headers.get('origin');const expected=env.CONTACT_ALLOWED_ORIGIN || new URL(request.url).origin;
if(origin && origin!==expected)return response(403);
if(!request.headers.get('content-type')?.includes('application/json'))return response(415);
if(Number(request.headers.get('content-length'))>16384)return response(413);
const reader=request.body?.getReader();if(!reader)return response(400);let bytes=0,text='';const decoder=new TextDecoder();
while(true){const part=await reader.read();if(part.done)break;bytes+=part.value.byteLength;if(bytes>16384){await reader.cancel();return response(413);}text+=decoder.decode(part.value,{stream:true});}text+=decoder.decode();
let data;try{data=validateContact(JSON.parse(text));}catch{return response(400);}if(!data)return response(400);
// Trust proxy headers only when deployment explicitly identifies the platform's overwritten IP header.
const header=env.CONTACT_TRUSTED_IP_HEADER || (env.VERCEL ? 'x-vercel-forwarded-for' : undefined);const ip=header?request.headers.get(header)?.split(',')[0]?.trim()||'unknown':'local';
const time=now();const key='portfolio:contact:'+ip;let attempts;
for(const [k,v] of windows)if(v.until<=time)windows.delete(k);if(windows.size>=10000&&!windows.has(key))return response(429);const entry=windows.get(key)||{count:0,until:time+600000};entry.count++;windows.set(key,entry);attempts=entry.count;
if(attempts>5)return response(429,{'Retry-After':'600'});
if(data.website)return response(400);
const apiKey=env.RESEND_API_KEY || env.EMAIL_API_KEY;
if(!apiKey||!env.CONTACT_RECEIVER_EMAIL||!env.CONTACT_FROM_EMAIL)return response(503);
const result=await fetcher('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+apiKey,'Content-Type':'application/json'},body:JSON.stringify({from:env.CONTACT_FROM_EMAIL,to:[env.CONTACT_RECEIVER_EMAIL],reply_to:data.email,subject:'New Portfolio Contact — Tanishq Tiwari',text:'Name: '+data.name+'\nEmail: '+data.email+'\n\nMessage:\n'+data.message+'\n\nTime: '+new Date(time).toISOString()}),signal:AbortSignal.timeout(10000)});
if(!result.ok)return response(502);const sent=await result.json();if(!sent.id)return response(502);return response(200);
}catch{return response(503);}
}
