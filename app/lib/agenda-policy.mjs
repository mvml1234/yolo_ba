export const refreshInterval = 15 * 60 * 1000;
export function visibleAgenda(records, now = new Date()) {
 const day = now.toLocaleDateString('en-CA', {timeZone:'America/Argentina/Buenos_Aires'});
 const end = new Date(now); end.setMonth(end.getMonth() + 3);
 const seen = new Set();
 return records.filter(e => {
  if(e.availability==='unavailable'||e.ticketAudit?.availability==='unavailable')return false;
  // These labels describe the whole announcement. Sector stock is handled by ticket audits.
  if(/^(?:cancelad[oa]|agotad[oa]|finalizad[oa])\b/i.test(e.title||''))return false;
  if(e.endAt&&Date.parse(e.endAt)<now.getTime())return false;
  if(e.startAt){const date=new Date(e.startAt);if(!Number.isFinite(date.getTime())||date>end)return false;if(e.dateOnly?e.startAt.slice(0,10)<day:date<now)return false;}
  const key=[e.title?.normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase(),e.venue?.trim().toLowerCase(),e.startAt?.slice(0,10)||e.scheduleText||''].join('|');
  if(seen.has(key))return false;seen.add(key);return true;
 });
}
