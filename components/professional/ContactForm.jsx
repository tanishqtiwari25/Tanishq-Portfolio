"use client";
import { useRef, useState } from 'react';
import { validateContact } from '@/lib/contact-validation.mjs';
export default function ContactForm({configured,email}) {
  const [status,setStatus]=useState(''),[error,setError]=useState('');
  const lock=useRef(false);
  async function submit(event) {
    event.preventDefault(); if(lock.current)return;
    const form=event.currentTarget, data=Object.fromEntries(new FormData(form));
    if(!validateContact(data)||!['hiring','client'].includes(data.enquiryType)){setError('Please check your name, email, enquiry type and message.');return;}
    lock.current=true;setStatus('sending');setError('');
    try {
      const response=await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data),signal:AbortSignal.timeout(15000)});
      const result=await response.json();if(!response.ok||!result.ok)throw Error('send');
      setStatus('sent');form.reset();
    }catch{setStatus('');setError(`Your message could not be sent. Please retry or email ${email}.`);}
    finally{lock.current=false;}
  }
  return <form className="pro-contact-form" onSubmit={submit} aria-describedby="contact-status" aria-busy={status==='sending'}>
    <div className="pro-field-pair"><label>Your name<input name="name" autoComplete="name" required minLength={2} maxLength={100} placeholder="Alex Morgan" /></label>
    <label>Email address<input name="email" type="email" autoComplete="email" required maxLength={254} placeholder="alex@company.com" /></label></div>
    <label>What brings you here?<select name="enquiryType" required defaultValue=""><option value="" disabled>Select an enquiry type</option><option value="hiring">Hiring / Job Opportunity</option><option value="client">Client Project</option></select></label>
    <label>Your message<textarea name="message" required minLength={10} maxLength={5000} rows={5} placeholder="Tell me about the role or the product you have in mind." /></label>
    <div className="pro-honeypot" aria-hidden="true"><label>Leave this empty<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
    {!configured&&<p>Email delivery is not configured for this environment. Please <a href={`mailto:${email}`}>email me directly</a>.</p>}
    <button className="pro-button" type="submit" disabled={!configured||status==='sending'}>{status==='sending'?'Sending…':'Send message'} <span aria-hidden="true">↗</span></button>
    <div id="contact-status" role="status" aria-live="polite">{status==='sent'&&'Message sent. Thank you for getting in touch.'}</div>
    {error&&<p role="alert" className="pro-form-error">{error}</p>}
  </form>;
}
