import fs from 'node:fs';
import assert from 'node:assert/strict';
import { projectsData as work } from '../data/projectsData.js';
import { serializeSchema } from '../lib/seo.mjs';
const home=fs.readFileSync('.next/server/app/index.html','utf8');
assert.equal((home.match(/<h1\b/g)||[]).length,1);
assert.match(home,/rel="canonical" href="https:\/\/realtanishqtiwari.in/);
assert.match(home,/application\/ld\+json/);
assert.match(home,/\/resume\/tanishq-tiwari.pdf/);
for(const project of work){
 assert.ok(home.includes(`/work/${project.id}`),project.title+' homepage link');
 const page=fs.readFileSync(`.next/server/app/work/${project.id}.html`,'utf8');
 assert.equal((page.match(/<h1\b/g)||[]).length,1);
 assert.ok(page.includes(`https://realtanishqtiwari.in/work/${project.id}`));
 if(project.liveUrl)assert.ok(page.includes(project.liveUrl));
}
assert.equal(serializeSchema({name:'</script>'}).includes('<'),false);
assert.ok(fs.statSync('public/resume/tanishq-tiwari.pdf').size>0);
assert.ok(fs.statSync('public/images/social/portfolio.png').size>0);
console.log(`Verified homepage, ${work.length} case studies, canonical metadata, resume and live links.`);
