export function rewardCategory(state,catalog,now=new Date()){
 const groups=new Map(),seen=new Set();for(const q of state?.requests||[]){const e=catalog.find(e=>e.id===q.experienceId),date=Date.parse((q.quote?.date||'')+'-03:00');if(q.status!=='completed'||!e||e.category==='Para el corazón'||!Number.isFinite(date)||date>now.getTime()||seen.has(e.id))continue;seen.add(e.id);groups.set(e.category,(groups.get(e.category)||0)+1);}return [...groups].find(([,n])=>n>=4)?.[0]||null;
}
