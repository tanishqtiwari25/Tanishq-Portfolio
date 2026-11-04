// One reversible choreography drives the rope geometry, hands, torso and feet.
export const RING_ENTRY={start:.567,end:.605,z:-1.6,canvas:1.27,plane:-3.25};
const clamp=x=>Math.max(0,Math.min(1,x));
const ease=(q,a,b)=>{const t=clamp((q-a)/(b-a));return t*t*(3-2*t);};
export function entryProgress(p){return (p-RING_ENTRY.start)/(RING_ENTRY.end-RING_ENTRY.start);}

export function ropeLoad(p){
  const q=entryProgress(p);
  return ease(q,.16,.28)*(1-ease(q,.70,.90));
}

/** Fixed turnbuckles and a local, rounded tension deflection around the hands. */
export function entryRopePoint(p,index,z){
  const centre=RING_ENTRY.z,halfContact=.32;
  const t=z<centre-halfContact?(z+3.25)/(centre-halfContact+3.25):z>centre+halfContact?(3.25-z)/(3.25-centre-halfContact):1;
  const v=clamp(t);
  // Linear tension spans, with a rounded tangent at the contact patch.
  const envelope=v<.8?v:(.8+.2*(1-(1-(v-.8)/.2)**2));
  const load=ropeLoad(p),amount=[-.005,-.50,.06][index];
  return [RING_ENTRY.plane-.018*load*envelope,[1.8,2.4,3][index]+amount*load*envelope,z];
}

export function ringEntryPose(p){
  const q=clamp(entryProgress(p)),z=RING_ENTRY.z,y=RING_ENTRY.canvas;
  const bend=ease(q,0,.24)*(1-ease(q,.84,.99));
  const root=[-3.6+.35*ease(q,.40,.62)+.4*ease(q,.62,.84)+.35*ease(q,.86,1),y,z];
  const left=[-3.6+.65*ease(q,.36,.48)+.45*ease(q,.87,1),y+.76*ease(q,.28,.35)*(1-ease(q,.49,.56)),z+.13];
  const right=[-3.6+.8*ease(q,.66,.77)+.3*ease(q,.87,1),y+.76*ease(q,.58,.65)*(1-ease(q,.79,.86)),z-.13];
  return {q,root,left,right,pelvis:-.10*bend,lean:.75*bend,
    grip:ease(q,.02,.16)*(1-ease(q,.62,.74)),
    hands:[entryRopePoint(p,2,z+.28),entryRopePoint(p,1,z-.28)]};
}
