// Review-only contact sheet: unchanged browser captures beside the reference crops.
import sharp from 'sharp';
import path from 'node:path';
const reference = process.argv[2];
if (!reference) throw new Error('Supply the original six-frame storyboard path.');
const directory = path.resolve('art/tt-arena/six-view-pass');
const files = ['01-entrance.png','02-intro.png','03-walk.png','04-projects.png','05-skills.png','06-contact.png'];
const labels = ['ENTRANCE','INTRO REVEAL','WALK TO THE RING','PROJECTS','ABOUT &amp; SKILLS','CONTACT'];
const {width,height} = await sharp(reference).metadata();
const layers = [];
for (let i=0;i<6;i++) {
  const crop = {left:Math.floor(i%2*width/2),top:Math.floor(Math.floor(i/2)*height/3),width:Math.floor(width/2)-3,height:Math.floor(height/3)-3};
  const target = await sharp(reference).extract(crop).resize(768,344,{fit:'contain',background:'#080b11'}).png().toBuffer();
  const current = await sharp(path.join(directory,files[i])).resize(768,344,{fit:'contain',background:'#080b11'}).png().toBuffer();
  const label = Buffer.from(`<svg width="1536" height="32"><rect width="1536" height="32" fill="#161b24"/><g fill="#e4e8ee" font-family="Arial" font-size="14"><text x="16" y="22">${i+1} / ${labels[i]} — REFERENCE</text><text x="784" y="22">LIVE WEBGL STUDY — VISUAL FIDELITY NOT FINAL</text></g></svg>`);
  layers.push({input:target,left:0,top:i*376},{input:current,left:768,top:i*376},{input:label,left:0,top:i*376+344});
}
await sharp({create:{width:1536,height:2256,channels:4,background:'#080b11'}}).composite(layers).png().toFile(path.join(directory,'reference-comparison.png'));
