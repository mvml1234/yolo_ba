'use client';
import ExperienceMap from './experience-map';
import {useMemo,useState} from 'react';
import {ArrowUpRight,ArrowRight,Search,Heart,Leaf,Wine,Waves,Mountain,Sun,Palette,Users,Theater,Music,Radio,Compass} from 'lucide-react';
import {categoryGuides} from './lib/categories';
import {freeBA} from './lib/free-ba.mjs';
import catalog from './lib/catalog.json';
import {isPublicExperience} from './lib/catalog-access.mjs';
import {categoryPhoto,photoByKey} from './lib/photos';
import theatre from './lib/theatre-snapshot.json';
const visuals:Record<string,{icon:typeof Heart,photo?:string,alt?:string,tone:string,short:string}>={
 'Gastronomía':{icon:Wine,tone:'peach',short:'Probá algo nuevo'},
 'Cultura y ciudad':{icon:Compass,tone:'blue',short:'Redescubrí tu ciudad'},
 'Agua y Delta':{icon:Waves,tone:'blue',short:'Cerca del agua'},
 'Campo y escapadas':{icon:Leaf,tone:'green',short:'Cambiá de aire'},
 'Aire y adrenalina':{icon:Mountain,tone:'yellow',short:'Animate a más'},
 'Bienestar':{icon:Sun,tone:'peach',short:'Un rato para vos'},
 'Talleres creativos':{icon:Palette,tone:'yellow',short:'Creá con tus manos'},
 'Juegos y deportes':{icon:Users,tone:'green',short:'Compartí el desafío'},
 'Para el corazón':{icon:Heart,tone:'rose',photo:photoByKey('volunteer').src,alt:photoByKey('volunteer').alt,short:'Tu tiempo hace bien'},
 'Buenos Aires gratis':{icon:Radio,tone:'green',photo:photoByKey('garden').src,alt:photoByKey('garden').alt,short:'La ciudad sin pagar entrada'},
 'Teatro':{icon:Theater,tone:'peach',photo:theatre.records.find(e=>e.title==='Esperando a Godot')?.imageUrl||undefined,alt:'Escena de Esperando a Godot, del Complejo Teatral',short:'Sentí cada historia'},
 'Shows en vivo':{icon:Music,tone:'blue',photo:theatre.records.find(e=>e.title==='Jazz Buenos Aires')?.imageUrl||undefined,alt:'Jazz Buenos Aires, del Complejo Teatral',short:'Vivilo en primera persona'}
};
const normalize=(s:string)=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
export default function CategoryGuide({onExplore,onExperience}:{onExplore:(category:string)=>void,onExperience?:(id:string)=>void}){
 const [mapView,setMapView]=useState(false);
 const [query,setQuery]=useState(''),[group,setGroup]=useState('Todas');
 const counts=useMemo(()=>Object.fromEntries(categoryGuides.map(c=>[c.name,catalog.filter(e=>isPublicExperience(e)&&e.category===c.name).length])),[]);
 const displayed=categoryGuides.filter(c=>(group==='Todas'||group==='Sin entrada'&&(c.nonprofit||c.freeLive)||group==='Carteleras'&&['Teatro','Shows en vivo','Buenos Aires gratis'].includes(c.name)||group==='Experiencias'&&!['Teatro','Shows en vivo','Buenos Aires gratis'].includes(c.name))&&normalize([c.name,c.examples,c.description].join(' ')).includes(normalize(query)));
 return <section className="section page category-discovery"><header className="discovery-heading"><div><span className="eyebrow muted">YOLO · SOLO SE VIVE UNA VEZ</span><h1>¿Qué te pinta<br/><em>vivir hoy?</em></h1><p>Elegí lo que te mueve. El próximo plan está más cerca de lo que pensás.</p></div><button className="discovery-all" onClick={()=>onExplore('Todas')}><span>Ver todas las<br/><strong>experiencias</strong></span><ArrowUpRight size={26}/></button></header><div className="map-view-toggle"><button className={!mapView?"active":""} aria-pressed={!mapView} onClick={()=>setMapView(false)}>Categorías</button><button className={mapView?"active":""} aria-pressed={mapView} onClick={()=>setMapView(true)}>Mapa de actividades ↗</button></div>{mapView?<ExperienceMap onExperience={onExperience}/>:<><div className="discovery-controls"><div className="discovery-tabs" aria-label="Filtrar categorías">{['Todas','Experiencias','Carteleras','Sin entrada'].map(g=><button key={g} aria-pressed={group===g} className={group===g?'active':''} onClick={()=>setGroup(g)}>{g}</button>)}</div><label className="discovery-search"><Search size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} aria-label="Buscar categoría" placeholder="¿Comida, teatro, aventura…?"/>{query&&<button onClick={()=>setQuery('')} aria-label="Borrar búsqueda">×</button>}</label></div><p className="discovery-result" role="status">{displayed.length} categorías para elegir</p><div className="discovery-grid">{displayed.map(c=>{const v=visuals[c.name];const Icon=v.icon;const p=categoryPhoto(c.name);const agenda=['Teatro','Shows en vivo'].includes(c.name);const badge=agenda?'Agenda en vivo':c.nonprofit?'Gratis · solidario':c.freeLive?freeBA.length+' propuestas gratis':counts[c.name]+' experiencias';return <button key={c.name} className={'discovery-card tone-'+v.tone} onClick={()=>onExplore(c.name)} aria-label={'Explorar '+c.name}><div className="discovery-photo"><img src={v.photo||p.src} alt={v.alt||p.alt} loading="lazy"/><div className="discovery-shade"/><span className="discovery-icon"><Icon size={23} strokeWidth={1.7}/></span><span className="discovery-badge">{badge}</span><div className="discovery-title"><span>{v.short}</span><h2>{c.name}</h2></div><span className="discovery-go" aria-hidden="true"><ArrowUpRight size={23}/></span></div><div className="discovery-copy"><p>{c.examples}</p><span>{c.nonprofit?'Sumá tu tiempo, ayudá a otros':agenda?'Obras, fechas y enlaces oficiales':c.freeLive?'Mirá la agenda y elegí tu salida':'Encontrá tu próximo plan'}<ArrowRight size={16}/></span></div></button>})}</div>{!displayed.length&&<div className="discovery-empty"><Search size={30}/><h2>Probemos por otro lado.</h2><p>No encontramos categorías con esa búsqueda.</p><button className="button dark" onClick={()=>{setQuery('');setGroup('Todas')}}>Ver todas las categorías</button></div>}<div className="discovery-end"><Heart size={22}/><p>Para el corazón y Buenos Aires gratis no cobran entrada. Las reservas y consultas se coordinan directamente con cada organizador.</p></div></>}</section>
}
