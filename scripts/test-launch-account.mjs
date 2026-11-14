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
assert.equal((await call('/api/account',{})).user,null);
assert.equal((await call('/api/admin',user)).code,403);
let a=await post({action:'favorite',id:'E01'});assert.equal(a.code,200,JSON.stringify(a));
a=await call('/api/account',user);assert(a.state.favorites.includes('E01'));
const other={...user,'oai-authenticated-user-id':uid+'-other'};const b=await call('/api/account',other);assert(!b.state.favorites.includes('E01'));
assert.equal((await call('/api/account',{}, {action:'favorite',id:'E01'})).code,401);
for(const action of ['request','accept','approve','claim_plus_reward'])assert.equal((await post({action})).code,410);
console.log('Account persistence across reads, user isolation, unauthenticated writes, admin boundary and direct-provider model passed.');
