import sharp from 'sharp';
const root='art/tt-arena/reconstruction';
const names=['01-entrance','02-intro','03-walk','04-projects','05-skills','06-contact'];
const panels=[],comparison=[];
for(let i=0;i<names.length;i++){
  const after=await sharp(`${root}/after/${names[i]}.png`).resize(720,323).png().toBuffer();
  panels.push({input:after,left:(i%2)*720,top:Math.floor(i/2)*323});
  const left=i%2?772:0,top=Math.floor(i/2)*344;
  const ref=await sharp('C:/Users/Tanishq Tiwari/Downloads/tt-arena-complete-journey.png').extract({left,top,width:764,height:336}).resize(600,269).png().toBuffer();
  const before=await sharp(`${root}/before/${names[i]}.png`).resize(600,269).png().toBuffer();
  const current=await sharp(after).resize(600,269).png().toBuffer();
  for(const [column,input] of [ref,before,current].entries())comparison.push({input,left:column*600,top:30+i*269});
}
const title=Buffer.from('<svg width="1800" height="30"><rect width="1800" height="30" fill="#101216"/><g fill="white" font-family="Arial" font-size="18"><text x="15" y="22">REFERENCE</text><text x="615" y="22">BEFORE — actual browser</text><text x="1215" y="22">AFTER — actual browser</text></g></svg>');
await sharp({create:{width:1440,height:969,channels:3,background:'#080b11'}}).composite(panels).png().toFile(`${root}/six-browser-views.png`);
await sharp({create:{width:1800,height:1644,channels:3,background:'#080b11'}}).composite([{input:title,left:0,top:0},...comparison]).png().toFile(`${root}/reference-before-after.png`);

