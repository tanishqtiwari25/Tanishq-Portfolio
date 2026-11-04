import fs from 'node:fs/promises';
import crypto from 'node:crypto';
const root='art/tt-arena/entrance-assets';
const hash=async path=>{const b=await fs.readFile(path);return {path,bytes:b.length,sha256:crypto.createHash('sha256').update(b).digest('hex')};};
const assets=[];
for(const [name,web] of [['SK_Opening_Performer','tt-opening-performer'],['SK_Opening_Spectator','tt-opening-spectator']]){
 const qa=JSON.parse(await fs.readFile(`${root}/${name}-qa.json`,'utf8'));
 assets.push({name,blenderQaPass:qa.pass,warnings:qa.warnings,files:await Promise.all([`${root}/${name}-candidate.glb`,`${root}/${name}-verified.glb`,`public/models/${web}.glb`].map(hash))});
}
await fs.writeFile(`${root}/delivery-manifest.json`,JSON.stringify({scope:'Opening desktop only. Owner identity and unique crowd face geometry unfinished.',assets,authoring:await hash('scripts/build-opening-character.mjs'),qaScript:await hash('scripts/blender/qa_opening_character.py'),evidencePlan:await hash(`${root}/character-plan.json`),screenshots:await Promise.all([`${root}/before.png`,`${root}/after.png`].map(hash))},null,2));
