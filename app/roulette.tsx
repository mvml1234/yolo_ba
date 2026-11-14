'use client';
import {useEffect,useRef,useState,type CSSProperties} from 'react';
import {ArrowUpRight,RotateCw,Sparkles,MapPin,ArrowRight,Utensils,Landmark,Waves,Trees,Rocket,Flower2,Palette,Gamepad2,Users,Check} from 'lucide-react';
import catalog from './lib/catalog.json';
import {roulettePool,drawExperience,wheelCategories} from './lib/roulette.mjs';
type Experience=typeof catalog[number];
const segments=[{label:'Sabores',color:'#ffb17f',Icon:Utensils},{label:'Ciudad',color:'#a2c6ff',Icon:Landmark},{label:'Agua',color:'#80d5d2',Icon:Waves},{label:'Escapadas',color:'#c4df80',Icon:Trees},{label:'Adrenalina',color:'#ff867c',Icon:Rocket},{label:'Bienestar',color:'#c5b2ef',Icon:Flower2},{label:'Crear',color:'#ffc9db',Icon:Palette},{label:'Jugar',color:'#ffda70',Icon:Gamepad2}];
const money=(n:number,c:string)=>`${c} ${new Intl.NumberFormat('es-AR',{maximumFractionDigits:0}).format(n)}`;
function LuckyStar(){return <svg viewBox="0 0 140 150" className="roulette-buddy" aria-hidden="true"><g className="buddy-wave"><path d="M111 61q17-20 18-6m-3 3q8-19 9-7" fill="none" stroke="#302a36" strokeWidth="4" strokeLinecap="round"/></g><path d="m52 116-7 18-14 1m50-19 5 19 14 1" fill="none" stroke="#302a36" strokeWidth="5" strokeLinecap="round"/><path d="m69 13 17 31 35 6-24 27 3 36-32-14-32 14 4-36-24-27 36-6z" fill="#ffda70" stroke="#302a36" strokeWidth="4" strokeLinejoin="round"/><g className="buddy-eyes"><ellipse cx="57" cy="64" rx="4" ry="7" fill="#302a36"/><ellipse cx="80" cy="64" rx="4" ry="7" fill="#302a36"/></g><path d="M59 80q10 12 20-1" fill="none" stroke="#302a36" strokeWidth="3.5" strokeLinecap="round"/><ellipse cx="48" cy="76" rx="6" ry="3" fill="#f18e80"/><ellipse cx="90" cy="76" rx="6" ry="3" fill="#f18e80"/></svg>}
export default function Roulette({onReserve,photo}:{onReserve:(e:Experience)=>void,photo:(e:Experience)=>string}){
 const [chosenCategory,setChosenCategory]=useState('Todas');
 const [people,setPeople]=useState(2),[maximum,setMaximum]=useState('30000'),[currency,setCurrency]=useState('ARS');
 const [reel,setReel]=useState<Experience[]>([]),[offset,setOffset]=useState(0),[rolling,setRolling]=useState(false);
 const reelWindow=useRef<HTMLDivElement>(null);
 const [rotation,setRotation]=useState(0),[spinning,setSpinning]=useState(false),[result,setResult]=useState<Experience|null>(null),[seen,setSeen]=useState<string[]>([]);
 const total=roulettePool(catalog,100000000,'ARS').length+roulettePool(catalog,100000000,'USD').length;
 const stage=useRef<HTMLDivElement>(null),outcome=useRef<HTMLDivElement>(null),pending=useRef<Experience|null>(null),timer=useRef<ReturnType<typeof setTimeout>|null>(null);
 const pool:Experience[]=roulettePool(catalog,maximum,currency,people).filter((e:Experience)=>chosenCategory==='Todas'||e.category===chosenCategory);
 useEffect(()=>()=>{if(timer.current)clearTimeout(timer.current)},[]);
 useEffect(()=>{if(result)outcome.current?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'nearest'})},[result]);
 function reset(value:string,coin=currency){setMaximum(value);setCurrency(coin);setResult(null);setSeen([])}
 function reveal(){const chosen=pending.current;if(!chosen)return;pending.current=null;if(timer.current)clearTimeout(timer.current);setResult(chosen);setSeen(s=>[...s,chosen.id]);setSpinning(false)}
 function spin(){
  if(spinning||!pool.length)return;
  const chosen=drawExperience(pool,seen) as Experience;if(!chosen)return;
  pending.current=chosen;setSpinning(true);setResult(null);
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  stage.current?.scrollIntoView({behavior:reduced?'instant':'smooth',block:'center'});
  const cards=Array.from({length:60},()=>pool[Math.floor(Math.random()*pool.length)]);cards[52]=chosen;setRolling(false);setOffset(0);setReel(cards);requestAnimationFrame(()=>requestAnimationFrame(()=>{setRolling(true);setOffset(52*196+98-(reelWindow.current?.clientWidth||600)/2)}));
  const target=(360-(wheelCategories.indexOf(chosen.category)*45+22.5))%360;
  setRotation(r=>r+1800+((target-r%360+360)%360));
  // transitionend is primary; this fallback also handles background tabs and reduced motion.
  timer.current=setTimeout(reveal,reduced?80:4400);
 }
 return <section className={`section page roulette-page ${spinning?'is-spinning':''} ${result?'has-result':''}`}>
  <div className="page-top roulette-intro"><span className="roulette-kicker"><Sparkles size={15}/> QUE EL AZAR TE SAQUE A PASEAR</span><h1 className="page-title">Ruleta de<br/><em>experiencias.</em><svg viewBox="0 0 100 30" aria-hidden="true"><path d="M5 17Q45 3 94 13M22 25Q60 14 89 21"/></svg></h1><p>Solo se vive una vez. ¿Qué plan te toca hoy?</p><span className="roulette-inventory"><Check size={14}/>{total} experiencias con tarifa publicada</span></div>
  <div className="roulette-layout">
   <div ref={stage} className="roulette-stage"><div className="roulette-blob" aria-hidden="true"/><span className="roulette-scribble scribble-one" aria-hidden="true">✳</span><span className="roulette-scribble scribble-two" aria-hidden="true">✦</span><span className="roulette-scribble scribble-three" aria-hidden="true">✧</span><div className="roulette-sticker" aria-hidden="true">UN GIRO.<br/><b>UN PLANAZO.</b></div>
    <div className="experience-reel" ref={reelWindow} aria-label="Cinta de experiencias"><span className="reel-marker" aria-hidden="true">▼</span><div className="reel-track" style={{transform:`translateX(${-offset}px)`,transition:rolling?'transform 4.05s cubic-bezier(.12,.7,.12,1)':'none'}} onTransitionEnd={e=>{if(e.target===e.currentTarget)reveal()}}>{(reel.length?reel:pool.slice(0,12)).map((e,i)=><article className={`reel-card ${result&&i===52?'reel-winner':''}`} key={i}><img src={photo(e)} alt=""/><small>{e.category}</small><b>{e.title}</b><span>{money(e.price!,e.currency)}</span></article>)}</div></div><LuckyStar/>
    <div className="roulette-stage-caption"><span className="roulette-status-dot"/>{spinning?'El universo está eligiendo…':result?'¡Ya tenés tu próximo plan!':'Un poquito de azar. Una nueva historia.'}</div>
    {result&&<div className="roulette-confetti" aria-hidden="true" key={rotation}>{Array.from({length:24},(_,i)=><i key={i} style={{'--i':i,'--x':`${((i*43)%101)-50}vw`,'--r':`${i*53}deg`,background:segments[i%8].color} as CSSProperties}/>)}</div>}
   </div>
   <div className="roulette-controls"><span className="roulette-step"><b>1</b> PONÉ TU LÍMITE</span><h2>Vos elegís cuánto.<br/>El azar, el plan.</h2>
    <fieldset disabled={spinning}><legend className="sr-only">Presupuesto y personas</legend><label htmlFor="roulette-budget" className="roulette-input-label">Tu máximo por persona</label><div className="roulette-money"><select aria-label="Moneda de la ruleta" value={currency} onChange={e=>reset(e.target.value==='ARS'?'30000':'50',e.target.value)}><option>ARS</option><option>USD</option></select><input id="roulette-budget" aria-label="Máximo de la ruleta por persona" type="number" min="0" step="any" value={maximum} onChange={e=>reset(e.target.value)} inputMode="decimal"/></div>
    <label className="field">¿Qué tenés ganas de hacer?<select value={chosenCategory} onChange={e=>{setChosenCategory(e.target.value);reset(maximum)}}><option>Todas</option>{wheelCategories.map(c=><option key={c}>{c}</option>)}</select></label><p className="roulette-group-total"><b>{maximum!==''?money(Number(maximum)*people,currency):'Elegí un presupuesto'}</b><span>Máximo entre {people===1?'vos':`las ${people} personas`} · traslado y extras aparte</span></p><div className="roulette-presets">{(currency==='ARS'?[0,15000,30000,50000]:[25,50,100,200]).map(n=><button type="button" key={n} aria-pressed={maximum===String(n)} className={maximum===String(n)?'chosen':''} onClick={()=>reset(String(n))}>{n===0?'Gratis':money(n,currency)}</button>)}</div>
    <label className="roulette-people"><span><Users size={17}/>¿Cuántos van?</span><select aria-label="Personas para la ruleta" value={people} onChange={e=>{setPeople(Number(e.target.value));reset(maximum)}}>{Array.from({length:10},(_,i)=><option key={i+1} value={i+1}>{i+1} {i===0?'persona':'personas'}</option>)}</select></label></fieldset>
    <div className="roulette-count" aria-live="polite"><Sparkles size={21}/><span>{pool.length?<><b>{pool.length} planes te esperan</b><small>Dentro de tu presupuesto y para tu grupo.</small></>:maximum===''?'Poné un máximo para encontrar tu próximo plan.':'No hay planes para esta combinación. Probá otro presupuesto o grupo.'}</span></div>
    <button className="button dark roulette-spin" disabled={spinning||!pool.length} onClick={spin}><RotateCw size={22}/>{spinning?'¡Allá vamos!':result?'Una vuelta más':'¡Dale, girá!'}<ArrowRight size={21}/></button><p className="roulette-note roulette-free-note"><Check size={14}/>Girar es gratis. No reserva ni genera un cobro.</p>
   </div>

  </div>
  <div ref={outcome} className="roulette-outcome" aria-live="polite" aria-atomic="true" aria-busy={spinning}>
   {spinning?<div className="roulette-wait"><div className="roulette-wait-dots" aria-hidden="true"><i/><i/><i/></div><p>Se viene un buen “¿y si vamos?”</p></div>:result?<article className="roulette-result" key={result.id}><div className="roulette-result-photo"><img src={photo(result)} alt={result.title}/><span className="roulette-result-sticker">¡TE TOCÓ!</span></div><div className="roulette-result-body"><span className="roulette-step"><b>2</b> EL AZAR DIJO… {result.category}</span><h2>{result.title}</h2><p className="roulette-location"><MapPin size={16}/>{result.zone} · {result.provider}</p><p>{result.description}</p><div className="roulette-result-price"><strong>{money(result.price!,result.currency)}</strong><span>Por persona{(result as any).minimumPeople>1?` · mínimo ${(result as any).minimumPeople} personas`:''} · {(result as any).priceVariant||'tarifa pública'}</span></div><p className="roulette-group-total"><b>{money(result.price!*people,result.currency)} para {people}</b><span>Total de esta selección · confirmá condiciones con el proveedor</span></p><div className="roulette-result-actions"><button className="button dark" onClick={()=>onReserve(result)}>¡Quiero ver este plan!<ArrowUpRight size={19}/></button><a className="text-link" href={result.source} target="_blank" rel="noreferrer">Tarifa oficial ↗</a></div><p className="roulette-note">Confirmá cupos y condiciones con el proveedor. ¿No era tu onda? Girá de nuevo.</p></div></article>:<div className="roulette-placeholder"><span aria-hidden="true">✦</span><p>Tu próximo <b>“qué bueno que vine”</b><br/>puede empezar con un giro.</p><span aria-hidden="true">✦</span></div>}
  </div>
  <p className="fineprint">Precios publicados o cotizados con fuente identificada y revisión reciente, sin convertir monedas. Cada plan elegible tiene la misma chance; evitamos repetir hasta recorrer la selección. Un resultado no garantiza cupo. Consultás, reservás y pagás directamente al proveedor.</p>
 </section>
}
