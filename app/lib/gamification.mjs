import {today} from './domain.mjs';
import {collectPassportBooks} from './passport-books.mjs';
export const gameCategories=['Gastronomía','Cultura y ciudad','Agua y Delta','Campo y escapadas','Aire y adrenalina','Bienestar','Talleres creativos','Juegos y deportes'];
export const gameLevels=[{name:'La curiosidad',at:0},{name:'Primeros pasos',at:150},{name:'Explorador',at:400},{name:'Coleccionista de historias',at:900},{name:'Espíritu YOLO',at:1800}];
export const gameRules=[{label:'Completar tus preferencias',xp:30,detail:'Una sola vez, aunque después las edites.'},{label:'Realizar una experiencia',xp:100,detail:'Cuando YOLO verifica que la salida se realizó.'},{label:'Descubrir una categoría',xp:40,detail:'La primera salida realizada en cada categoría.'},{label:'Vivir una sorpresa',xp:25,detail:'Extra por una experiencia realizada desde el modo sorpresa.'},{label:'Dejar una reseña verificada',xp:20,detail:'Una por experiencia realizada, con la reseña publicada.'}];
function eventDate(q){const d=q.quote?.date;if(typeof d!=='string')return null;const value=Date.parse(/Z$|[+-]\d\d:\d\d$/.test(d)?d:d+'-03:00');return Number.isFinite(value)?new Date(value):null}
function previousMonth(key){const [y,m]=key.split('-').map(Number);return new Date(Date.UTC(y,m-2,1)).toISOString().slice(0,7)}
export function passport(state,catalog,posts=[],now=new Date()){
 const day=today(now),month=day.slice(0,7),lookup=new Map(catalog.map(e=>[e.id,e]));const seen=new Set();
 const outings=(state?.requests||[]).filter(q=>{const date=eventDate(q);if(q.status!=='completed'||!q.id||seen.has(q.experienceId)||!lookup.has(q.experienceId)||lookup.get(q.experienceId).category==='Para el corazón'||!date||date>now)return false;seen.add(q.experienceId);return true}).map(q=>({id:q.id,experienceId:q.experienceId,title:lookup.get(q.experienceId).title,category:lookup.get(q.experienceId).category,date:today(eventDate(q)),surprise:q.mode==='sorpresa'})).sort((a,b)=>a.date.localeCompare(b.date)||a.id.localeCompare(b.id));
 const categories=new Set(),earned=[];let xp=state?.profile?30:0;const visited=new Set(outings.map(q=>q.experienceId));const reviewed=new Set();
 for(const p of posts){if(p.status==='published'&&p.booking_id&&Number.isInteger(p.rating)&&p.rating>=1&&p.rating<=5&&visited.has(p.experience_id))reviewed.add(p.experience_id)}
 for(const q of outings){const first=!categories.has(q.category);categories.add(q.category);const points=100+(first?40:0)+(q.surprise?25:0);xp+=points;earned.push({...q,xp:points,newCategory:first})}xp+=reviewed.size*20;
 const activeMonths=new Set(outings.map(q=>q.date.slice(0,7)));let streak=0;let cursor=activeMonths.has(month)?month:previousMonth(month);while(activeMonths.has(cursor)){streak++;cursor=previousMonth(cursor)}
 const levelIndex=gameLevels.findLastIndex(l=>xp>=l.at),level=gameLevels[levelIndex],next=gameLevels[levelIndex+1]||null;
 const thisMonth=earned.filter(q=>q.date.startsWith(month));
 const badges=[
  {id:'profile',name:'Brújula lista',detail:'Completá tus preferencias.',icon:'compass',earned:Boolean(state?.profile)},
  {id:'first',name:'Salí del piloto automático',detail:'Realizá tu primera experiencia.',icon:'footprints',earned:outings.length>=1},
  {id:'surprise',name:'Dejé lugar a la sorpresa',detail:'Realizá una experiencia del modo sorpresa.',icon:'sparkles',earned:outings.some(q=>q.surprise)},
  {id:'variety',name:'Fuera de lo de siempre',detail:'Descubrí tres categorías distintas.',icon:'map',earned:categories.size>=3},
  {id:'review',name:'Una historia que ayuda',detail:'Publicá una reseña verificada.',icon:'star',earned:reviewed.size>=1},
  {id:'five',name:'Cinco buenas historias',detail:'Realizá cinco experiencias.',icon:'ticket',earned:outings.length>=5},
  {id:'rhythm',name:'A mi ritmo',detail:'Realizá salidas en tres meses distintos.',icon:'calendar',earned:activeMonths.size>=3},
  {id:'all',name:'Buenos Aires por descubrir',detail:'Viví las ocho categorías.',icon:'trophy',earned:gameCategories.every(c=>categories.has(c))}
 ];
 const missions=[{id:'out',title:'Un mes, una buena historia',description:'Realizá una experiencia durante este mes.',done:thisMonth.length>=1,current:Math.min(thisMonth.length,1),target:1,action:'explore',cta:'Buscar mi plan'},
 (gameCategories.every(c=>categories.has(c))?{id:'new',title:'Siempre hay otra historia',description:'Realizá dos experiencias durante este mes.',done:thisMonth.length>=2,current:Math.min(thisMonth.length,2),target:2,action:'explore',cta:'Encontrar otra historia'}:{id:'new',title:'Probá otro lado de vos',description:'Viví por primera vez una categoría durante este mes.',done:thisMonth.some(q=>q.newCategory),current:thisMonth.some(q=>q.newCategory)?1:0,target:1,action:'category',cta:'Descubrir una categoría'}),
 {id:'review',title:'Dale una pista al próximo',description:'Dejá una reseña verificada de alguna experiencia que realizaste.',done:reviewed.size>0,current:Math.min(reviewed.size,1),target:1,action:'community',cta:'Compartir mi experiencia'}];
 return {version:2,collection:collectPassportBooks(earned,gameCategories),xp,level:{...level,number:levelIndex+1},next,progress:next?Math.max(0,Math.min(100,Math.round((xp-level.at)/(next.at-level.at)*100))):100,remaining:next?next.at-xp:0,completed:outings.length,streak,activeMonths:activeMonths.size,reviewCount:reviewed.size,month,missions,badges,categories:gameCategories.map(name=>({name,completed:outings.filter(q=>q.category===name).length})),suggestedCategory:gameCategories.find(c=>!categories.has(c))||null,stamps:earned.reverse(),rules:gameRules};
}
