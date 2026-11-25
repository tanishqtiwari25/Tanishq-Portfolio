import {projectsData} from '@/data/projectsData';
import {SITE_URL} from '@/lib/seo.mjs';
export default function sitemap(){return [{url:SITE_URL,changeFrequency:'monthly',priority:1},...projectsData.map(p=>({url:`${SITE_URL}/work/${p.id}`,changeFrequency:'monthly',priority:.7}))];}
