import assert from 'node:assert/strict';
import {passport,gameCategories} from '../app/lib/gamification.mjs';
const now=new Date('2026-10-28T12:00:00Z');
const catalog=gameCategories.map((category,i)=>({id:'e'+i,title:'Plan '+i,category}));
const q=(id,eid,month,mode='catálogo')=>({id,experienceId:'e'+eid,status:'completed',mode,quote:{date:month+'-15T10:00'}});
assert.equal(passport(null,catalog,[],now).xp,0);
const s={profile:{name:'Mateo'},requests:[q('one',0,'2026-08'),q('two',1,'2026-09','sorpresa'),q('three',2,'2026-10')]};
const posts=[{experience_id:'e0',booking_id:'one',rating:5,status:'published'},{experience_id:'e0',booking_id:'one',rating:4,status:'published'},{experience_id:'e7',booking_id:'unknown',rating:5,status:'published'},{experience_id:'e1',booking_id:'two',rating:3,status:'hidden'}];
let g=passport(s,catalog,posts,now);assert.equal(g.xp,30+3*140+25+20);assert.equal(g.completed,3);assert.equal(g.streak,3);assert.equal(g.level.name,'Explorador');assert.equal(g.badges.find(b=>b.id==='variety').earned,true);assert.equal(g.badges.find(b=>b.id==='rhythm').earned,true);assert.equal(g.missions.find(m=>m.id==='out').done,true);assert.equal(g.missions.find(m=>m.id==='new').done,true);assert.equal(g.reviewCount,1);
const poisoned={...s,xp:999999,requests:[...s.requests,s.requests[0],{...q('future',3,'2027-01')},{...q('cancel',4,'2026-10'),status:'cancelled'},{...q('approved',4,'2026-10'),status:'approved'},q('unknown',999,'2026-10')]};assert.equal(passport(poisoned,catalog,posts,now).xp,g.xp);
assert.equal(passport(s,catalog,posts,new Date('2026-11-01T12:00:00Z')).streak,3);assert.equal(passport(s,catalog,posts,new Date('2026-12-01T12:00:00Z')).streak,0);assert.equal(passport(s,catalog,posts,new Date('2026-12-01T12:00:00Z')).xp,g.xp);
// Buenos Aires midnight: the outing still belongs to September before 03:00 UTC.
const boundary={profile:null,requests:[{...q('midnight',0,'2026-09'),quote:{date:'2026-10-01T02:00:00Z'}}]};g=passport(boundary,catalog,[],now);assert.equal(g.stamps[0].date,'2026-09-30');assert.equal(g.missions[0].done,false);
const all={profile:{name:'QA'},requests:catalog.map((_,i)=>q('all'+i,i,'2026-10'))};g=passport(all,catalog,[],now);assert.equal(g.categories.filter(c=>c.completed).length,8);assert.equal(g.badges.find(b=>b.id==='all').earned,true);assert.equal(g.suggestedCategory,null);assert.equal(g.missions.find(m=>m.id==='new').target,2);
assert.equal(passport(s,catalog,[],now).xp,passport(s,catalog,posts,now).xp-20);
console.log('Gamification checks passed: verified completion only, no client XP, deduplication, one review per experience, levels, badges, monthly missions, Buenos Aires boundaries and no inactivity XP loss.');
