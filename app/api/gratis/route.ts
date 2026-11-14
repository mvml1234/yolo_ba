import {env} from 'cloudflare:workers';
import {freeBA,freeAgendas} from '../../lib/free-ba.mjs';
import {refreshInterval} from '../../lib/agenda-policy.mjs';
export const dynamic='force-dynamic';
export async function GET(){
 const bucket=env.BUCKET!;const key='public-agenda/free-ba-v2.json';
 try{const old=await bucket.get(key);if(old){const d=await old.json() as any;if(Date.now()-Date.parse(d.checkedAt)<refreshInterval)return Response.json(d,{headers:{'Cache-Control':'no-store'}})}}catch{}
 const sources=Array.from(new Set([...freeBA.map(e=>e.source),...freeAgendas.map(e=>e.url)]));
 const checkedAt=new Date().toISOString();
 const pages=await Promise.all(sources.map(async url=>{try{const r=await fetch(url,{signal:AbortSignal.timeout(10000)});if(!r.ok)throw Error();const text=(await r.text()).replace(/<script[\s\S]*?<\/script>/gi,'').replace(/<style[\s\S]*?<\/style>/gi,'').replace(/<[^>]*>/g,' ').replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim();return {url,text,status:'reachable'}}catch{return {url,text:'',status:'unavailable'}}}));
 const records=freeBA.map(e=>{
  const p=pages.find(p=>p.url===e.source);const t=p?.text||'';
  const guided=e.theme==='Visitas guiadas';
  const match=/access denied|captcha|just a moment|acceso denegado/i.test(t)?null:guided?t.match(/(?:visitas? guiadas?|recorridos? guiados?)[^.]{0,130}gratuit[ao]s?|gratuit[ao]s?[^.]{0,130}(?:visitas? guiadas?|recorridos? guiados?)/i):t.match(/(?:entrada|ingreso|acceso|participaci[oó]n)[^.]{0,55}gratuit[ao]/i);
  const evidence=match?t.slice(Math.max(t.lastIndexOf('.',match.index)+1,(match.index||0)-100),Math.min(t.indexOf('.',(match.index||0)+match[0].length)>0?t.indexOf('.',(match.index||0)+match[0].length):t.length,(match.index||0)+match[0].length+180)).trim():null;
  const conditional=Boolean(evidence&&/resident|jubilad|menores|estudiantes|argentinos|nacionales/i.test(evidence));
  return {...e,validation:match&&!conditional?'confirmed':conditional?'conditional':'pending',evidence,validatedAt:match?checkedAt:null,accessCondition:conditional?evidence:null,referenceDate:e.referenceDate,availability:'Por confirmar'};
 });
 const sourceChecks=pages.map(({url,status,text})=>({url,status,checkedAt,freeTextFound:/gratuit[ao]/i.test(text)}));
 const data={records,sourceChecks,checkedAt,note:'La fecha de referencia se conserva. La gratuidad reconfirmada identifica la variante; apertura y cupos se consultan al organizador.'};
 await bucket.put(key,JSON.stringify(data));return Response.json(data,{headers:{'Cache-Control':'no-store'}});
}
