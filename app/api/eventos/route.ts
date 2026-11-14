import {visibleAgenda,refreshInterval} from '../../lib/agenda-policy.mjs';
import {auditTicket} from '../../lib/ticket-audit.mjs';
import {env} from 'cloudflare:workers';
export const dynamic='force-dynamic';
const expired=(d:string|null)=>{if(!d)return false;const months=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];const m=d.toLowerCase().replace(/[º°]/g,'').match(/(?:al\s+(?:domingo|lunes|martes|miércoles|jueves|viernes|sábado)?\s*|y\s+(?:domingo|lunes|martes|miércoles|jueves|viernes|sábado)?\s*)(\d{1,2})\s+de\s+(\w+)/);if(!m)return false;const month=months.indexOf(m[2]);if(month<0)return false;return Date.now()>Date.parse(`2026-${String(month+1).padStart(2,'0')}-${m[1].padStart(2,'0')}T23:59:59-03:00`)};
const source='https://complejoteatral.gob.ar/';
const text=(s:string)=>s.replace(/<script[\s\S]*?<\/script>/gi,'').replace(/<style[\s\S]*?<\/style>/gi,'').replace(/<[^>]*>/g,' ').replace(/&nbsp;|&#160;/g,' ').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();
async function read(url:string){const r=await fetch(url,{signal:AbortSignal.timeout(10000),headers:{'User-Agent':'YOLO.BA official agenda checker'}});if(!r.ok)throw Error('Fuente no disponible');return r.text()}
export async function GET(){
 const bucket=env.BUCKET!;const key='public-agenda/official-theatre-v4.json';const now=Date.now();let previous:any=null;
 try{const saved=await bucket.get(key);if(saved){const data=await saved.json() as any;previous=data;if(now-Date.parse(data.checkedAt)<refreshInterval)return Response.json({...data,records:visibleAgenda(data.records).filter((e:any)=>!expired(e.scheduleText))},{headers:{'Cache-Control':'no-store'}})}}catch{}
 try{
 const html=await read(source);const urls=[...new Set([...html.matchAll(/href=["']([^"']*\/produccion\/[^"'#?]+)["']/g)].map(m=>new URL(m[1],source).href).filter(u=>u.startsWith(source)))].slice(0,80);
 const records:any[]=[];
 for(let i=0;i<urls.length;i+=5)await Promise.all(urls.slice(i,i+5).map(async url=>{try{const h=await read(url);const t=text(h);const title=text(h.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1]||'');if(!title)return;const price=t.match(/Valor de las localidades:\s*(.{0,180}?)(?:Dónde:|Venta de entradas|$)/i)?.[1]?.trim()||null;const dates=t.match(/Funciones:\s*(.{0,220}?)(?:Duración:|Valor de las localidades:|Dónde:|$)/i)?.[1]?.trim()||null;const ticket=[...h.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)].find(m=>/Comprar localidades/i.test(text(m[2])));const booking=ticket?new URL(ticket[1].replace(/&amp;/g,'&'),url).href:null;const ticketAudit=await auditTicket(booking,title);if(ticketAudit.availability==='unavailable')return;
 const metas=[...h.matchAll(/<meta\b[^>]*>/gi)].map(m=>m[0]);const imageMeta=metas.find(m=>/property=["']og:image["']/i.test(m));const rawImage=imageMeta?.match(/content=["']([^"']+)["']/i)?.[1];const imageUrl=rawImage?new URL(rawImage,url).href:null;
 const address=t.match(/Dirección:\s*(.{0,150}?)(?:Venta de entradas|Descargar|en off|$)/i)?.[1]?.trim()||null;
 const venue=t.match(/Dónde:\s*(.{0,130}?)(?:Dirección:|Venta de entradas|$)/i)?.[1]?.trim()||null;
 const duration=t.match(/Duración:\s*(.{0,70}?)(?:Valor de las localidades:|Dónde:|$)/i)?.[1]?.trim()||null;
 const genreText=t.match(/(?:Género|Géneros):\s*([^.:]{2,60})/i)?.[1]?.trim()||'';
 const genres=['Drama','Comedia','Musical','Infantil','Títeres','Danza','Performance'].filter(g=>genreText.toLowerCase().includes(g.toLowerCase()));
 if(!genres.length)genres.push('Sin género informado');
 const tariffs=[...(price||'').matchAll(/([^$]+)\$\s*([\d.]+(?:,\d+)?)/g)].map(m=>({label:m[1].trim(),amount:Number(m[2].replace(/\./g,'').replace(',','.')),currency:'ARS'}));
 if(expired(dates))return;records.push({ticketAudit,imageUrl:imageUrl?.startsWith('https://')?imageUrl:null,address,venue,duration,genres,tariffs,id:url,title,source:url,priceText:price,scheduleText:dates,bookingUrl:['invalid_link','wrong_destination'].includes(ticketAudit.status)?null:ticketAudit.url,availability:'unknown',checkedAt:new Date().toISOString(),category:'Teatro'});
 }catch{}}));
 const freeSources=await Promise.all(['https://entradasba.buenosaires.gob.ar/','https://turismo.buenosaires.gob.ar/es/article/que-hacer-esta-semana','https://usinadelarte.ar/'].map(async url=>{try{const h=await read(url);return {url,checkedAt:new Date().toISOString(),status:/Se perdió la conexión con el servidor/i.test(text(h))?'unavailable':'reachable',availability:'unknown'}}catch{return {url,checkedAt:new Date().toISOString(),status:'unavailable',availability:'unknown'}}}));
 const data={freeSources,checkedAt:new Date().toISOString(),source,records,status:'reviewed',note:'Cartelera oficial. La disponibilidad de cada función requiere confirmación en boletería.'};await bucket.put(key,JSON.stringify(data));return Response.json({...data,records:visibleAgenda(data.records).filter((e:any)=>!expired(e.scheduleText))},{headers:{'Cache-Control':'no-store'}});
 }catch{if(previous)return Response.json({...previous,records:visibleAgenda(previous.records).filter((e:any)=>!expired(e.scheduleText)),stale:true,lastAttemptAt:new Date().toISOString(),note:'No pudimos reconfirmar la fuente. Se muestra la última referencia disponible; consultá la boletería.'},{headers:{'Cache-Control':'no-store'}});return Response.json({records:[],status:'unavailable',checkedAt:new Date().toISOString(),note:'No pudimos verificar la cartelera oficial. No se recomienda ninguna función.'},{headers:{'Cache-Control':'no-store'}})}
}
