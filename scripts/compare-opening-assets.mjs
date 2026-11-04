// Compare unaltered browser captures at the same viewport. No generated imagery.
import fs from 'node:fs/promises';
import sharp from 'sharp';
import crypto from 'node:crypto';
const root='art/tt-arena/entrance-assets';
const before=await fs.readFile(`${root}/before.png`),after=await fs.readFile(`${root}/after.png`);
const a=await sharp(before).metadata(),b=await sharp(after).metadata();
if(a.width!==b.width||a.height!==b.height)throw Error('Comparison viewports do not match');
const labels=Buffer.from(`<svg width="${a.width*2}" height="36"><rect width="100%" height="100%" fill="#101419"/><g fill="#eef1f4" font-family="Arial" font-size="18"><text x="20" y="25">BEFORE — ACTUAL BROWSER</text><text x="${a.width+20}" y="25">AFTER — ACTUAL BROWSER / OPENING ONLY</text></g></svg>`);
await sharp({create:{width:a.width*2,height:a.height+36,channels:4,background:'#101419'}}).composite([{input:labels,left:0,top:0},{input:before,left:0,top:36},{input:after,left:a.width,top:36}]).png().toFile(`${root}/before-after.png`);
const directory='art/tt-arena/reconstruction/vendor/system-selected';
const files=(await fs.readdir(directory)).filter(n=>n!=='source.json'&&!n.endsWith('.thumb'));
const hashes=[];for(const name of files){const bytes=await fs.readFile(`${directory}/${name}`);hashes.push({name,bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex')});}
await fs.writeFile(`${directory}/source.json`,JSON.stringify({license:'CC0 (explicit asset headers and official system pack listing)',page:'https://static.makehumancommunity.org/assets/assetpacks/makehuman_system_assets.html',archive:'https://files2.makehumancommunity.org/asset_packs/makehuman_system_assets/makehuman_system_assets_cc0.zip',archive_bytes:280737770,files:hashes},null,2));
console.log(JSON.stringify({screenshots:[a.width,a.height],comparison:[a.width*2,a.height+36],sourceFiles:hashes.length}));
