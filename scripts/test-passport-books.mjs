import assert from 'node:assert/strict';
import {collectPassportBooks} from '../app/lib/passport-books.mjs';
const categories=['Gastronomía','Cultura y ciudad','Agua y Delta','Campo y escapadas','Aire y adrenalina','Bienestar','Talleres creativos','Juegos y deportes'];
const stamps=n=>Array.from({length:n},(_,i)=>({id:'visit-'+i,category:categories[i%8],date:'2026-10-20',title:'Experiencia '+i}));
let g=collectPassportBooks([],categories);assert.equal(g.books[0].target,32);assert.equal(g.totalGoal,416);
for(const [count,rank,done] of [[31,1,0],[32,2,1],[95,2,1],[96,3,2],[223,3,2],[224,4,3],[416,4,4]]){
 g=collectPassportBooks(stamps(count),categories);assert.equal(g.currentRank,rank);assert.equal(g.completedBooks,done);
 const ids=g.books.flatMap(b=>b.pages.flatMap(p=>p.stamps.map(s=>s.id)));assert.equal(new Set(ids).size,ids.length);
}
const skew=stamps(60).map(s=>({...s,category:categories[0]}));g=collectPassportBooks(skew,categories);assert.equal(g.currentRank,1);assert.equal(g.books[0].completed,4);
g=collectPassportBooks([...stamps(32),...stamps(32),{id:'heart',category:'Para el corazón',date:'2026-10-20'}],categories);assert.equal(g.eligible,32);assert.equal(g.books[0].complete,true);assert(g.benefits.filter(b=>b.id.startsWith('tier-')||b.id==='special').every(b=>b.status==='planned'));
console.log('Passport: four stamps per category,32/96/224/416 milestones, unique allocation, locked future books and Heart excluded.');
