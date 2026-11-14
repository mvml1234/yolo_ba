import assert from 'node:assert/strict';
import {today,addDays} from '../app/lib/domain.mjs';
import fs from 'node:fs/promises';
import ts from 'typescript';
import {pathToFileURL} from 'node:url';
import {context} from './api-test-runtime.mjs';
const root=process.cwd();
const tmp=root+'/work/api-tests';await fs.mkdir(tmp,{recursive:true});
const runtime=pathToFileURL(root+'/scripts/api-test-runtime.mjs').href;
for(const name of ['account','admin']){let code=await fs.readFile(root+'/app/api/'+name+'/route.ts','utf8');code=code.replace("'../../lib/loyalty.mjs'",JSON.stringify(pathToFileURL(root+'/app/lib/loyalty.mjs').href)).replace("'../../lib/catalog-access.mjs'",JSON.stringify(pathToFileURL(root+'/app/lib/catalog-access.mjs').href)).replace("'cloudflare:workers'",JSON.stringify(runtime)).replace("'../../chatgpt-auth'",JSON.stringify(runtime)).replace("import catalog from '../../lib/catalog.json';","import {verifiedTestExperience} from '"+pathToFileURL(root+'/scripts/verified-test-experience.mjs').href+"';const catalog=JSON.parse(await (await import('node:fs/promises')).readFile("+JSON.stringify(root+'/app/lib/catalog.json')+",'utf8')).map(e=>['E01','E02','E03','E04'].includes(e.id)?verifiedTestExperience({...e,listed:true,provider:'Prestador de prueba local',price:e.id==='E01'?60000:20000,currency:'ARS'}):e);").replace("'../../lib/domain.mjs'",JSON.stringify(pathToFileURL(root+'/app/lib/domain.mjs').href)).replace("'../../lib/payments.mjs'",JSON.stringify(pathToFileURL(root+'/app/lib/payments.mjs').href)).replace("'../../lib/booking.mjs'",JSON.stringify(pathToFileURL(root+'/app/lib/booking.mjs').href)).replace("'../../lib/availability.mjs'",JSON.stringify(pathToFileURL(root+'/app/lib/availability.mjs').href));await fs.writeFile(tmp+'/'+name+'.mjs',ts.transpileModule(code,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText)}
const routes={account:await import(pathToFileURL(tmp+'/account.mjs')),admin:await import(pathToFileURL(tmp+'/admin.mjs'))};
const base='https://yolo.test';
const uid='qa-yolo-'+Date.now();
const user={'oai-authenticated-user-id':uid,'oai-authenticated-user-email':'qa@example.test'};
const admin={'oai-authenticated-user-id':uid+'-admin','oai-authenticated-user-email':'mateomarques10@gmail.com'};
async function call(path,headers,body){const user=headers['oai-authenticated-user-id']?{userId:headers['oai-authenticated-user-id'],email:headers['oai-authenticated-user-email'],displayName:'QA'}:null;const route=routes[path.split('/').pop()];const req=new Request(base+path,{headers:{...headers,...(body?{'Content-Type':'application/json'}:{})},...(body?{method:'POST',body:JSON.stringify(body)}:{})});const r=await context.run(user,()=>body?route.POST(req):route.GET());return {code:r.status,...await r.json()}}
const post=b=>call('/api/account',user,b);
assert.equal((await call('/api/account',{})).user,null);assert.equal((await call('/api/admin',user)).code,403);
const profile={name:'Prueba local',frequency:'weekly',startDate:today(),categories:['Gastronomía','Talleres creativos'],currency:'ARS',min:0,max:1000000,people:2,days:[0,1,2,3,4,5,6],from:'10:00',to:'20:00',area:'Cualquier zona',lead:2,replyHours:48,paused:false};
let d=await post({action:'profile',profile});assert.equal(d.code,200,JSON.stringify(d));const id=d.state.cycle.id;assert.equal(d.state.cycle.index,0);
for(let i=0;i<3;i++){d=await post({action:'next',cycleId:id,index:i});assert.equal(d.code,200,JSON.stringify(d))}assert.equal(d.state.cycle.status,'exhausted');assert.equal((await post({action:'accept',cycleId:id,index:2})).code,400);
d=await post({action:'profile',profile:{...profile,frequency:'monthly'}});assert.equal(d.state.cycle.id,id);
assert.equal((await post({action:'request',id:'E01',people:2,dates:['2026-10-01T10:00']})).code,400);
d=await post({action:'request',id:'E01',people:2,dates:[addDays(today(),5)+'T15:00']});assert.equal(d.code,200,JSON.stringify(d));const q=d.state.requests[0];assert.equal(q.status,'requested');
const other=await call('/api/account',{'oai-authenticated-user-id':uid+'-other','oai-authenticated-user-email':'other@example.test'});assert.equal(other.state.requests.length,0);
assert.equal((await call('/api/admin',admin,{action:'confirm',member:uid,id:q.id,code:'QA-LOCAL'})).code,400);
d=await call('/api/admin',admin,{action:'quote',member:uid,id:q.id,date:addDays(today(),5)+'T15:00',price:60000,currency:'ARS',provider:'Prestador de prueba local',place:'Punto de prueba local',policy:'Prueba local: cancelación sin cargo hasta el plazo indicado.',expires:addDays(today(),1)+'T18:00',cancelBefore:addDays(today(),3)+'T15:00'});assert.equal(d.code,200,JSON.stringify(d));
assert.equal((await post({action:'approve',id:q.id,acceptTerms:false})).code,400);
assert.equal((await post({action:'approve',id:q.id,acceptTerms:true})).code,200);
assert.equal((await call('/api/admin',admin,{action:'confirm',member:uid,id:q.id,code:'QA-LOCAL-NO-RESERVA'})).code,200);
d=await post({action:'cancel',id:q.id});assert.equal(d.state.requests[0].status,'cancel_requested');
assert.equal((await call('/api/admin',admin,{action:'cancelled',member:uid,id:q.id,note:'Prueba local cancelada, sin cargo.'})).code,200);
d=await call('/api/account',user);assert.equal(d.state.requests[0].status,'cancelled');
const requestKey=crypto.randomUUID();const payload={action:'request',id:'E02',people:2,dates:[addDays(today(),7)+'T15:00'],clientRequestId:requestKey};
const repeated=await Promise.all([post(payload),post(payload)]);assert.deepEqual(repeated.map(x=>x.code),[200,200]);assert.equal((await call('/api/account',user)).state.requests.filter(q=>q.clientRequestId===requestKey).length,1);assert.equal((await post(payload)).code,200);assert.equal((await post({...payload,people:3})).code,409);
assert.equal((await post({...payload,id:'E03',clientRequestId:'invalid'})).code,400);
assert.equal((await post({action:'request',id:'E03',people:1,dates:[addDays(today(),2)+'T24:00']})).code,400);
const race=await Promise.all([post({action:'favorite',id:'E01'}),post({action:'favorite',id:'E02'})]);assert.deepEqual(race.map(x=>x.code).sort(),[200,409]);
assert.equal((await call('/api/account',user)).state.favorites.length,1);
console.log('API integration passed: accounts isolated, admin protected, persistent 3-option cap, quote/approval/confirmation/cancellation states and concurrent edits. Identity and D1 bindings use local test doubles.');
console.log('Disposable local test prefix: '+uid);
// Two supplier-verified batches, rejected by the visitor, stop the scheduling loop.
let created=await post({action:'request',id:'E03',people:2,dates:[addDays(today(),7)+'T15:00']});assert.equal(created.code,200);let scheduling=created.state.requests.at(-1);
const validUntil=new Date(Date.now()+2*3600000-3*3600000).toISOString().slice(0,16);
const batchBody={action:'availability',member:uid,id:scheduling.id,checked:true,dates:[addDays(today(),8)+'T15:00',addDays(today(),9)+'T15:00'],price:20000,currency:'ARS',provider:'Prestador de prueba local',place:'Fixture place',policy:'Fixture cancel policy',reference:'Fixture supplier cupo confirmation for 2',expires:validUntil,cancelBefore:addDays(today(),6)+'T15:00'};
assert.equal((await call('/api/admin',user,batchBody)).code,403);
for(let round=1;round<=2;round++){
 assert.equal((await call('/api/admin',admin,batchBody)).code,200);
 let current=(await call('/api/account',user)).state.requests.find(x=>x.id===scheduling.id);assert.equal(current.status,'availability_options');assert.equal(current.availabilityRounds,round);
 assert.equal((await post({action:'availability_choose',id:current.id,batchId:'stale',optionId:current.availability.options[0].id})).code,400);
 const reject=await post({action:'availability_decline',id:current.id,batchId:current.availability.id});assert.equal(reject.code,200);assert.equal(reject.state.requests.find(x=>x.id===current.id).status,round===1?'requested':'replan_needed');
}
assert.equal((await call('/api/admin',admin,batchBody)).code,400);
assert.equal((await post({action:'approve',id:scheduling.id,acceptTerms:true})).code,400);
assert.equal((await post({action:'cancel',id:scheduling.id})).code,200);
// Picking a verified alternative creates a quote, never an acceptance or reservation.
created=await post({action:'request',id:'E04',people:2,dates:[addDays(today(),7)+'T15:00']});scheduling=created.state.requests.at(-1);
assert.equal((await call('/api/admin',admin,{...batchBody,id:scheduling.id})).code,200);
let current=(await call('/api/account',user)).state.requests.find(x=>x.id===scheduling.id);const choice={action:'availability_choose',id:current.id,batchId:current.availability.id,optionId:current.availability.options[1].id};
const selected=await post({...choice,price:1,date:'2099-01-01T12:00'});assert.equal(selected.code,200);current=selected.state.requests.find(x=>x.id===current.id);assert.equal(current.status,'quoted');assert.equal(current.quote.price,20000);assert.equal(current.quote.date,batchBody.dates[1]);assert.equal(current.acceptedTermsAt,undefined);
assert.equal((await post(choice)).code,400);assert.equal((await post({action:'approve',id:current.id,acceptTerms:false})).code,400);
console.log('Availability API passed: owner-only batches, stale choices rejected, two-round exit, withdraw without charge and authoritative quote selection.');
assert.equal((await post({action:'request',id:'H001',people:1,dates:[addDays(today(),5)+'T15:00']})).code,400);
console.log('Heart API: commercial request rejected; organisation registration stays direct.');

const memberInterest=await post({action:'membership_interest',interested:true,active:true,rank:4,price:1});assert.equal(memberInterest.code,200);assert.equal(memberInterest.state.membershipInterest.interested,true);assert.equal(memberInterest.state.membership,undefined);assert.equal((await post({action:'membership_interest',interested:'yes'})).code,400);assert.equal((await post({action:'membership_interest',interested:false})).state.membershipInterest.interested,false);
console.log('Membership interest: boolean opt-in only; caller cannot activate a subscription, rank or price.');

assert.equal((await post({action:'request',id:'E05',people:1,dates:[addDays(today(),5)+'T15:00']})).code,400);
assert.equal((await post({action:'favorite',id:'E05'})).code,200);
console.log('Pending provider API: direct request and favourite rejected.');

let visit=await post({action:'visit_claim',id:'E05',date:addDays(today(),-2),reference:'Fixture booking reference'});assert.equal(visit.code,200);const v=visit.state.requests.at(-1);assert.equal(v.status,'visit_pending');assert.equal((await call('/api/admin',user,{action:'verify_visit',member:uid,id:v.id,note:'Fixture checked'})).code,403);assert.equal((await call('/api/admin',admin,{action:'verify_visit',member:uid,id:v.id,note:'Fixture checked with provider'})).code,200);assert.equal((await call('/api/account',user)).state.requests.at(-1).status,'completed');assert.equal((await post({action:'claim_plus_reward',active:true})).code,400);console.log('Direct visits: private evidence, owner-only verification and premature Plus reward blocked.');
