export function validateContact(data){
if(!data || typeof data!=='object' || Array.isArray(data))return null;
const {name,email,message,website=''}=data;
if([name,email,message,website].some(v=>typeof v!=='string'))return null;
const cleanName=name.trim(),cleanEmail=email.trim(),cleanMessage=message.trim();
if(cleanName.length<2||cleanName.length>100||/[\r\n\x00-\x1f]/.test(cleanName))return null;
if(cleanEmail.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)||/[\r\n]/.test(cleanEmail))return null;
if(cleanMessage.length<10||cleanMessage.length>5000||/\x00/.test(cleanMessage)||website.length>200)return null;
return {name:cleanName,email:cleanEmail,message:cleanMessage,website};
}
