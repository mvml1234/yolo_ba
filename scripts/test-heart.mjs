import assert from 'node:assert/strict';
import fs from 'node:fs';
import {roulettePool} from '../app/lib/roulette.mjs';
import {matches} from '../app/lib/domain.mjs';
import {passport} from '../app/lib/gamification.mjs';
import {availabilityBatch} from '../app/lib/availability.mjs';
const data=JSON.parse(fs.readFileSync('app/lib/heart-catalog.json'));
assert.equal(data.length,50);assert.equal(new Set(data.map(x=>[x.title,x.provider,x.zone].join('|'))).size,50);
for(const e of data){assert.equal(e.category,'Para el corazón');assert.equal(e.price,0);assert.equal(e.commissionRate,0);assert.equal(e.nonprofit,true);assert.equal(e.surpriseEligible,false);assert.equal(e.costUnconfirmed,false);for(const k of ['source','costSource','signupUrl'])assert.equal(new URL(e[k]).protocol,'https:');for(const k of ['requirements','costEvidence','availabilityStatus','modality'])assert.ok(e[k]);}
assert.equal(data.filter(e=>e.exploratory).length,1,'Do not inflate programme matching routes into fake vacancies');
assert.equal(roulettePool(data,100000).length,0,'Solidarity needs intentional sign-up, never random assignment');
assert.equal(matches(data[0],{categories:['Para el corazón'],currency:'ARS',min:0,max:100,area:'Cualquier zona'}),false);
assert.throws(()=>availabilityBatch({}, {category:'Para el corazón',status:'requested',people:1},{}));
const g=passport({profile:null,requests:[{id:'fixture-heart',experienceId:data[0].id,status:'completed',quote:{date:'2026-10-20T15:00'}}]},data,[],new Date('2026-10-28T22:00:00Z'));assert.equal(g.xp,0);assert.equal(g.completed,0);
console.log('Heart checks passed: 50 sourced no-fee entries; no commission, payment, random assignment or XP; no artificial vacancy inflation.');
