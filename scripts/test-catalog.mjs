import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {isPublicExperience} from '../app/lib/catalog-access.mjs';
import {areaOf,matches} from '../app/lib/domain.mjs';
const catalog=JSON.parse(await fs.readFile('app/lib/catalog.json','utf8'));
const stats=JSON.parse(await fs.readFile('app/lib/catalog-stats.json','utf8'));
const live=catalog.filter(e=>isPublicExperience(e));
const counts={};const keys=new Set();
for(const e of live){
 counts[e.category]=(counts[e.category]||0)+1;
 assert.ok(e.title&&e.provider&&e.zone&&e.source);
 assert.equal(new URL(e.source).protocol,'https:');
 assert.ok(e.price===null||(typeof e.price==='number'&&Number.isFinite(e.price)&&e.price>=0));
 const key=[e.category,e.provider,e.title,e.zone].join('|').toLowerCase();assert.ok(!keys.has(key),'Duplicate visible entry '+key);keys.add(key);
 assert.ok(e.offers.length>0);assert.ok(e.researchStatus);
}
assert(live.length>=482);assert.equal(counts['Para el corazón'],50);assert(live.filter(e=>e.category!=='Para el corazón').length>=432);
assert.deepEqual(Object.fromEntries(Object.entries(stats.categories).filter(([c,n])=>n>0)),counts);assert.equal(live.length,stats.visible);
assert.equal(new Set(catalog.map(e=>e.id)).size,catalog.length);
for(let i=1;i<=32;i++)assert.ok(catalog.some(e=>e.id==='E'+String(i).padStart(2,'0')),'Legacy IDs must remain resolvable');
assert.equal(areaOf({zone:'Cariló, Buenos Aires'}),'Escapadas');assert.equal(areaOf({zone:'Villa Crespo, CABA'}),'CABA');assert.equal(areaOf({zone:'San Isidro, Buenos Aires'}),'Zona norte / Delta');assert.equal(areaOf({zone:'Florida, Vicente López, Buenos Aires'}),'Zona norte / Delta');assert.equal(areaOf({zone:'Ramos Mejía, Buenos Aires'}),'Zona oeste');assert.equal(areaOf({zone:'Avellaneda, Buenos Aires'}),'Zona sur');
assert.equal(matches({category:'Bienestar',listed:false,price:20,currency:'ARS',zone:'CABA'},{categories:['Bienestar'],min:0,max:100,currency:'ARS',area:'Cualquier zona'}),false);
const csv=await fs.readFile('public/catalogo-yolo-ba.csv','utf8');assert.equal(csv.split('\r\n').length,live.length+1);
console.log('Catalog checks passed: '+live.length+' visible records; 50+ per category; sourced, deduplicated, stable IDs, geographic filters and matching CSV.');
