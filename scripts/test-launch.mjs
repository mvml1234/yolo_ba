import assert from 'node:assert/strict';
import fs from 'node:fs';
import {roulettePool} from '../app/lib/roulette.mjs';
const read=f=>fs.readFileSync(new URL('../'+f,import.meta.url),'utf8');
const cat=JSON.parse(read('app/lib/catalog.json'));
assert(cat.length>=482);
assert.equal(cat.filter(e=>e.category==='Para el corazón').length,50);
for(const currency of ['ARS','USD']){
 const p=roulettePool(cat,1000000,currency);
 if(currency==='ARS')assert(p.length>=60);
 assert(p.every(e=>e.currency===currency&&e.price<=1000000&&e.priceKind!=='net'&&e.language!=='en'&&e.surpriseEligible!==false));
}
assert(!roulettePool(cat,1000000,'USD').some(e=>e.id==='E08'));
assert.equal(roulettePool(cat,'', 'ARS').length,0);
for(const f of ['app/yolo.tsx','app/start-guide.tsx','app/roulette.tsx'])assert(!/href=.{0,3}['"]\/demo/.test(read(f)));
assert(read('app/demo/page.tsx').includes("redirect('/')"));
assert(!read('app/passport-book.tsx').includes('onClick={sample}'));
assert(read('app/api/account/route.ts').includes("['request','accept','approve','availability_choose','availability_decline','claim_plus_reward']"));
assert(read('app/api/payments/route.ts').includes('POST(){return json({error:'));
assert(!read('app/membership-panel.tsx').includes('$3.900'));
console.log('Launch: fichas originales conservadas, 50 corazón, ruleta por moneda y presupuesto, inglés/netos excluidos, demos retiradas, reservas y premios bloqueados.');
