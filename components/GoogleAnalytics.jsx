"use client";
import Script from 'next/script';
import {useEffect,useRef,useState} from 'react';
import {usePathname} from 'next/navigation';
import {cleanPageUrl,trackEvent} from '@/lib/analytics.mjs';
const liveProjects={'montra.realtanishqtiwari.in':'wealth-pilot','trulygrow.realtanishqtiwari.in':'truly-grow','orbit.realtanishqtiwari.in':'orbit-crm','diamond.realtanishqtiwari.in':'data-scraper-system','pickk.realtanishqtiwari.in':'ecommerce-platform','bird.realtanishqtiwari.in':'2d-browser-game'};
export default function GoogleAnalytics({measurementId}){
 const pathname=usePathname(),[ready,setReady]=useState(false),previous=useRef('');
 useEffect(()=>{
  if(!ready||!pathname)return;
  const location=window.location.origin+pathname;if(previous.current===location)return;
  const referrer=previous.current||cleanPageUrl(document.referrer);
  window.gtag('event','page_view',{send_to:measurementId,page_location:location,page_referrer:referrer});previous.current=location;
 },[ready,pathname,measurementId]);
 useEffect(()=>{
  if(!ready)return;
  const click=event=>{
   const link=event.target.closest?.('a[href]');if(!link)return;
   const href=link.getAttribute('href');if(href.startsWith('mailto:'))return trackEvent('contact_click',{method:'email'});if(href.startsWith('tel:'))return trackEvent('contact_click',{method:'phone'});
   let url;try{url=new URL(href,window.location.href);}catch{return;}
   const project=url.origin===window.location.origin&&url.pathname.match(/^\/work\/([a-z0-9-]+)\/?$/);if(project)return trackEvent('project_open',{project_id:project[1]});
   if(liveProjects[url.hostname])return trackEvent('live_demo_click',{project_id:liveProjects[url.hostname]});
   if(url.pathname.toLowerCase().endsWith('.pdf')&&url.pathname.toLowerCase().includes('resume'))return trackEvent('resume_download');
   if(url.hostname==='github.com')trackEvent('contact_click',{method:'github'});if(url.hostname==='www.linkedin.com'||url.hostname==='linkedin.com')trackEvent('contact_click',{method:'linkedin'});
  };
  document.addEventListener('click',click);return()=>document.removeEventListener('click',click);
 },[ready]);
 return <><Script id="portfolio-ga-init" strategy="afterInteractive" onReady={()=>setReady(true)}>{`window.dataLayer=window.dataLayer||[];window.gtag=window.gtag||function(){window.dataLayer.push(arguments);};window.gtag('js',new Date());window.gtag('config',${JSON.stringify(measurementId)},{send_page_view:false,allow_google_signals:false,allow_ad_personalization_signals:false,page_location:window.location.origin+window.location.pathname});`}</Script><Script id="portfolio-ga-loader" src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} strategy="afterInteractive"/></>;
}
