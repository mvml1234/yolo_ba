import {isBookable} from './catalog-access.mjs';
import {today,addDays,cleanDates} from './domain.mjs';
export const bookingLeadHours=24;
export const bookingHorizonDays=90;
export const bookingDraftKey='yolo-reservation-v2';
export function bookingDates(dates,now=new Date()){
 const checked=cleanDates(dates,now);const min=now.getTime()+bookingLeadHours*3600000;const last=addDays(today(now),bookingHorizonDays);
 for(const d of checked){if(Date.parse(d+'-03:00')<min)throw Error('Elegí un horario con al menos 24 horas de anticipación para que podamos coordinar.');if(d.slice(0,10)>last)throw Error('Podemos coordinar fechas dentro de los próximos 90 días.');}return checked;
}
export function nextBookingDay(weekday,now=new Date()){let d=addDays(today(now),1);for(let i=0;i<7;i++,d=addDays(d,1))if(new Date(d+'T12:00:00Z').getUTCDay()===weekday)return d;return d;}
export function timeChoices(category){return ({'Gastronomía':['12:00','13:00','19:00','20:00'],'Cultura y ciudad':['11:00','13:00','15:00','17:00'],'Agua y Delta':['09:00','10:00','14:00','16:00'],'Campo y escapadas':['09:00','10:00','11:00','14:00'],'Aire y adrenalina':['10:00','12:00','14:00','16:00'],'Bienestar':['09:00','11:00','17:00','19:00'],'Talleres creativos':['10:00','14:00','16:00','18:00'],'Juegos y deportes':['12:00','15:00','18:00','20:00']})[category]||['10:00','12:00','15:00','18:00'];}
export function isBookingTime(value,now=new Date()){try{bookingDates([value],now);return true}catch{return false}}
export function validRequestKey(key){return typeof key==='string'&&/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(key)}
export function sameBooking(q,id,people,dates){return q.experienceId===id&&q.people===people&&JSON.stringify(q.dates)===JSON.stringify(dates)}
export function readBookingDraft(raw,catalog,now=new Date()){
 try{const d=JSON.parse(raw);if(!d||d.version!==2||!Number.isFinite(d.savedAt)||d.savedAt>now.getTime()||now.getTime()-d.savedAt>2*3600000||!validRequestKey(d.clientRequestId)||!Number.isInteger(d.people)||d.people<1||d.people>10||!catalog.some(e=>e.id===d.experienceId&&isBookable(e,now)))return null;return {...d,dates:bookingDates(d.dates,now)};}catch{return null;}
}

export function newBookingKey(){if(typeof crypto.randomUUID==='function')return crypto.randomUUID();const bytes=crypto.getRandomValues(new Uint8Array(16));bytes[6]=(bytes[6]&15)|64;bytes[8]=(bytes[8]&63)|128;const hex=Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');return hex.slice(0,8)+'-'+hex.slice(8,12)+'-'+hex.slice(12,16)+'-'+hex.slice(16,20)+'-'+hex.slice(20);}
