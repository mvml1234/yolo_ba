import assert from 'node:assert/strict';
import fs from 'node:fs';
import {isBookable,isPublicExperience,assertBookable} from '../app/lib/catalog-access.mjs';
import {roulettePool} from '../app/lib/roulette.mjs';
import {ensureCycle,cycleAction} from '../app/lib/domain.mjs';
const now=new Date('2026-10-29T12:00:00Z');
const e={id:'test',title:'Prueba',provider:'Proveedor',category:'Gastronomía',price:100,currency:'ARS',listed:true,verification:{status:'verified',provider:'Proveedor',price:100,currency:'ARS',unit:'person',taxesIncluded:true,commercialAgreement:true,paymentAuthorized:true,evidenceUrl:'https://example.com/agreement',includes:'Detalle',policy:'Cancelación acordada',bookingTerms:'Reserva previa',verifiedAt:'2026-10-28T12:00:00Z',validUntil:'2099-01-01T00:00:00Z'}};
assert(isBookable(e,now));assert(isPublicExperience(e,now));
for(const key of Object.keys(e.verification)){assert(!isBookable({...e,verification:{...e.verification,[key]:null}},now),key+' missing must close sales');}
assert(!isBookable({...e,price:101},now));assert(!isBookable({...e,verification:{...e.verification,validUntil:'2026-10-29T12:00:00Z'}},now));
assert(!isBookable({...e,verification:{...e.verification,verifiedAt:'2099-01-01T00:00:00Z'}},now));
assert(isPublicExperience({...e,listed:false},now));assert(isPublicExperience({id:'heart',title:'Ayudar',provider:'ONG',category:'Para el corazón',listed:true,price:0},now));
const catalog=JSON.parse(fs.readFileSync('app/lib/catalog.json'));
const paid=catalog.filter(x=>x.category!=='Para el corazón');assert(paid.length>=432);assert.equal(paid.filter(x=>isPublicExperience(x,now)).length,paid.length);assert(roulettePool(catalog,100000000).length>0);
const p={frequency:'weekly',startDate:'2026-10-29',lead:1,days:[0,1,2,3,4,5,6],from:'10:00',people:1,replyHours:48,categories:['Gastronomía'],currency:'ARS',min:0,max:1000,area:'Cualquier zona'};
const state={profile:p,cycle:{id:'old',end:'2026-11-05',status:'open',ids:['pending-no-price'],shown:['E01'],index:0},requests:[],history:[]};
ensureCycle(state,catalog,now);assert.equal(state.cycle.status,'empty');assert.deepEqual(state.cycle.ids,[]);assert.throws(()=>assertBookable(paid[0],now));
console.log('Verification: missing agreement, expired price, changed price, hidden rows, free activities, stale cycles, full paid catalog and roulette exclusions passed.');
