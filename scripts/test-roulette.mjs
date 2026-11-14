import {verifiedTestExperience} from "./verified-test-experience.mjs";
import assert from 'node:assert/strict';
import {roulettePool,drawExperience} from '../app/lib/roulette.mjs';
import {readFileSync} from 'node:fs';
const catalog=JSON.parse(readFileSync(new URL('../app/lib/catalog.json',import.meta.url)));
for(const currency of ['ARS','USD'])for(const max of [0,15000,30000,100000]){const p=roulettePool(catalog,max,currency);assert(p.every(e=>e.currency===currency&&Number.isFinite(e.price)&&e.price>=0&&e.price<=max&&e.listed!==false&&e.surpriseEligible!==false));}
for(const max of ['',-1,Infinity,NaN,'oops'])assert.deepEqual(roulettePool(catalog,max),[]);
assert.deepEqual(roulettePool(catalog,30000,'EUR'),[]);
const proof=e=>({...e,title:e.title||'Fixture plan',source:'https://example.test/prices',priceEvidence:{kind:'public',source:'https://example.test/prices',amount:e.price,currency:e.currency,checkedAt:new Date().toISOString()}});
const a=proof(verifiedTestExperience({id:'a',provider:'Fixture',price:100,currency:'ARS',category:'Cultura y ciudad'})),b=proof(verifiedTestExperience({...a,id:'b',price:30000}));
assert.equal(roulettePool([a,b,{...a,id:'hidden',listed:false},{...a,id:'quote',price:null},{...a,id:'bad',price:-2},{...a,id:'package',surpriseEligible:false}],30000).length,2);
assert.equal(drawExperience([a,b],[],()=>0).id,'a');assert.equal(drawExperience([a,b],['a'],()=>0).id,'b');assert.equal(drawExperience([a,b],['a','b'],()=>.99).id,'b');assert.equal(drawExperience([]),null);
console.log('Roulette: budget boundaries, currencies, exclusions, free plans, no repeats and exhausted pool passed.');

assert.equal(roulettePool([{...a,priceEvidence:undefined},{...a,priceEvidence:{...a.priceEvidence,amount:999}},{...a,priceEvidence:{...a.priceEvidence,checkedAt:'2020-01-01'}},{...a,priceKind:'net'}],30000).length,0);
// A room remains one activity while its price changes with actual party size.
const room={...a,id:'tiered',minimumPeople:2,maximumPeople:4,priceEvidence:{...a.priceEvidence,tiers:[{minPeople:2,maxPeople:2,amount:100},{minPeople:3,maxPeople:3,amount:80},{minPeople:4,maxPeople:4,amount:60}]}};
assert.equal(roulettePool([room],100,'ARS',1).length,0);
assert.equal(roulettePool([room],80,'ARS',2).length,0);
assert.equal(roulettePool([room],80,'ARS',3)[0].price,80);
assert.equal(roulettePool([room],80,'ARS',3)[0].priceEvidence.amount,80);
assert.equal(roulettePool([room],100,'ARS',5).length,0);
assert.equal(roulettePool([{...a,language:'pending'},{...a,language:'unknown'},{...a,language:'en'}],30000).length,0);
const expanded=roulettePool(catalog,1e8,'ARS');
assert(expanded.length>=60,'At least60 distinct sourced activities in the roulette');
assert.equal(new Set(expanded.map(e=>e.id)).size,expanded.length);
assert(expanded.every(e=>e.priceEvidence.unit==='person'||!e.priceEvidence.unit));
console.log('Expanded roulette: minimum60, unique activities, public price evidence, party-specific tiers and pending languages excluded.');
