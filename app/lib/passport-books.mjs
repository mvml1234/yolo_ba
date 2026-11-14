import {membershipTiers} from './membership.mjs';
export const passportEditions=[
 {number:1,key:'base',name:'Base',target:4,minCategories:1,color:'coral',motto:'Cuatro historias por categoría.'},
 {number:2,key:'plus',name:'Aventurero',target:8,minCategories:3,color:'blue',motto:'Hacete lugar para algo distinto.'},
 {number:3,key:'explorer',name:'Explorador',target:16,minCategories:5,color:'green',motto:'Ya conocés otras versiones de vos.'},
 {number:4,key:'golden',name:'Golden',target:24,minCategories:6,color:'gold',motto:'Una colección de momentos que vale oro.'}
];
/** Global verified history; each stamp belongs to one edition, independent of subscription. */
export function collectPassportBooks(stamps,categories){
 const seen=new Set();const ordered=stamps.filter(s=>s.id&&!seen.has(s.id)&&categories.includes(s.category)&&(seen.add(s.id),true)).slice().sort((a,b)=>a.date.localeCompare(b.date)||a.id.localeCompare(b.id));
 const diversity=new Set(ordered.map(s=>s.category)).size;let offset=0,previousComplete=true;
 const books=passportEditions.map(edition=>{
  const allocated=categories.flatMap(name=>ordered.filter(s=>s.category===name).slice(offset,offset+edition.target)),completed=allocated.length,complete=completed===edition.target*categories.length,unlocked=previousComplete;
  const pages=categories.map(name=>{const earned=allocated.filter(s=>s.category===name);return {name,target:edition.target,completed:earned.length,complete:earned.length>=edition.target,stamps:earned}});
  const startAt=offset;offset+=edition.target;previousComplete=previousComplete&&complete;
  return {...edition,pages,completed,stampCount:completed,target:edition.target*categories.length,complete,unlocked,startAt,finishAt:offset,diversity:Math.min(diversity,edition.minCategories),progress:Math.min(complete?100:99,Math.round(completed/(edition.target*categories.length)*100)),remainingCategories:Math.max(0,edition.minCategories-diversity)};
 });
 const activeIndex=books.findIndex(b=>!b.complete),current=activeIndex<0?books.length-1:activeIndex;
 return {books,currentRank:books[current].number,completedBooks:books.filter(b=>b.complete).length,allComplete:books.every(b=>b.complete),eligible:ordered.length,distinctCategories:diversity,totalGoal:books.reduce((n,b)=>n+b.target,0),benefits:[
 {id:'album',name:'Tu libreta y tus sellos',detail:'Base: cuatro experiencias distintas verificadas por categoría. Cada sello muestra experiencia y fecha. Los premios comerciales se anunciarán cuando Plus esté disponible.',status:'available',rank:1},
 {id:'progress',name:'Tu rango se gana viviendo',detail:'Base → Aventurero → Explorador → Golden. Tus sellos siguen guardados aunque no tengas una membresía activa.',status:'available',rank:1},
 ...membershipTiers.slice(1).map(t=>({id:'tier-'+t.rank,name:t.name+' · beneficios de membresía',detail:'Beneficios acordados directamente con proveedores y recomendaciones. Sin porcentajes garantizados. Plus todavía no se cobra.',status:'planned',rank:t.rank})),
 {id:'special',name:'Experiencias especiales Golden',detail:'A futuro, con cupos y condiciones por prestador. No hay entradas gratuitas, descuentos externos ni regalos comprometidos hoy.',status:'planned',rank:4}
 ]};
}
