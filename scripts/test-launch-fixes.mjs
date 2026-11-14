import assert from 'node:assert/strict';
import {visibleAgenda} from '../app/lib/agenda-policy.mjs';
import {collectPassportBooks} from '../app/lib/passport-books.mjs';
const now=new Date('2026-11-07T15:00:00Z');
const items=[{title:'Cancelado Back To The Orchestra',startAt:'2026-11-29T23:59:59-03:00'},{title:'Hoy',startAt:'2026-11-07T23:00:00-03:00',venue:'Sala'},{title:'Hoy',startAt:'2026-11-07T23:00:00-03:00',venue:'Sala'},{title:'Ayer',startAt:'2026-11-06T23:00:00-03:00'},{title:'Pendiente',source:'https://example.org'},{title:'Sectores agotados',startAt:'2026-11-08T21:00:00-03:00',availability:'unknown'}];
assert.deepEqual(visibleAgenda(items,now).map(x=>x.title),['Hoy','Pendiente','Sectores agotados']);
const cats=['a','b'];const stamps=Array.from({length:24},(_,i)=>({id:String(i),date:'2026-11-01',category:cats[i%2]}));const c=collectPassportBooks(stamps,cats);assert.equal(c.books[0].target,8);assert(c.books[0].complete);assert(c.books[1].complete);assert.equal(c.currentRank,3);assert.equal(new Set(c.books.flatMap(x=>x.pages.flatMap(p=>p.stamps.map(s=>s.id)))).size,24);
console.log('Agenda: cancelados, caducidad, deduplicación y sectores. Pasaporte: sellos por categoría y ediciones sin duplicados. OK');
