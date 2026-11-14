import fs from 'node:fs/promises';
import {isPublicExperience,isBookable} from '../app/lib/catalog-access.mjs';
const all=JSON.parse(await fs.readFile('app/lib/catalog.json','utf8'));
const live=all.filter(e=>isPublicExperience(e));
const columns=['id','title','category','provider','zone','price','currency','source'];
const esc=x=>'"'+String(x??'').replaceAll('"','""')+'"';
await fs.writeFile('public/catalogo-yolo-ba.csv',[columns,...live.map(e=>columns.map(k=>e[k]))].map(r=>r.map(esc).join(',')).join('\r\n'));
await fs.writeFile('app/lib/catalog-stats.json',JSON.stringify({date:new Date().toISOString().slice(0,10),visible:live.length,verifiedPaid:live.filter(e=>isBookable(e)).length,researchPaid:all.filter(e=>e.category!=='Para el corazón').length,categories:Object.fromEntries([...new Set(all.map(e=>e.category))].map(c=>[c,live.filter(e=>e.category===c).length]))},null,2)+'\n');
console.log('Public inventory:',live.length,'activities, paid:',live.filter(e=>isBookable(e)).length);
