import fs from 'node:fs';
import assert from 'node:assert/strict';
import {projectsData} from '../data/projectsData.js';
import {SITE_URL,serializeSchema} from '../lib/seo.mjs';
const read=path=>fs.readFileSync(path,'utf8');
const home=read('.next/server/app/index.html');
assert.equal((home.match(/<h1\b/g)||[]).length,1);
assert.ok(home.includes('React &amp; Next.js Developer in Kanpur'));
assert.ok(home.includes(`rel="canonical" href="${SITE_URL}"`));
const schemas=html=>[...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(match=>JSON.parse(match[1]));
assert.equal(schemas(home)[0]['@graph'][0]['@type'],'Person');
const titles=new Set();
for(const project of projectsData){
 assert.ok(home.includes(`href="/work/${project.id}"`),project.id+' crawlable home link');
 const html=read(`.next/server/app/work/${project.id}.html`);
 assert.equal((html.match(/<h1\b/g)||[]).length,1);
 assert.ok(html.includes(`rel="canonical" href="${SITE_URL}/work/${project.id}"`));
 assert.ok(html.includes(`property="og:url" content="${SITE_URL}/work/${project.id}"`));
 assert.ok(html.includes('/images/social/portfolio.png'));
 const title=html.match(/<title>(.*?)<\/title>/)[1];assert.ok(!titles.has(title));titles.add(title);
 assert.equal(schemas(html)[0]['@type'],'CreativeWork');
 if(project.sections)assert.ok(html.includes('<h2>'));
 assert.ok(!html.includes('name="robots" content="noindex'));
}
assert.equal(serializeSchema({text:'</script>'}).includes('<'),false);
assert.ok(fs.statSync('public/images/social/portfolio.png').size>0);
console.log(`SEO verification passed: 8 crawlable projects, unique titles, self canonicals, social metadata, server-rendered JSON-LD and heading structure.`);
