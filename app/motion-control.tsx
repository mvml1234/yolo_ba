'use client';
import {useEffect,useState} from 'react';
import {Pause,Play} from 'lucide-react';

/** Decorative motion only. Business state and form submissions never depend on animation. */
export default function MotionControl(){
 const [paused,setPaused]=useState(false);
 useEffect(()=>{
  const media=window.matchMedia('(prefers-reduced-motion: reduce)');
  const sync=()=>{let saved=false;try{saved=localStorage.getItem('yolo-motion')==='off'}catch{}const off=media.matches||saved;document.documentElement.dataset.motion=off?'off':'on';setPaused(off)};
  sync();media.addEventListener('change',sync);
  const visible=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');visible.unobserve(entry.target)}})},{threshold:.06});
  const scan=()=>{document.querySelectorAll('.quick-moods,.rhythm,.heart-home-teaser,.curated .section-heading,.experience,.category-guide-card,.join-band,.step').forEach(node=>{if(node.hasAttribute('data-reveal'))return;node.setAttribute('data-reveal','');visible.observe(node)})};
  scan();const mutations=new MutationObserver(scan);mutations.observe(document.querySelector('main')?.parentNode||document.body,{childList:true,subtree:true});
  return()=>{media.removeEventListener('change',sync);visible.disconnect();mutations.disconnect()};
 },[]);
 function toggle(){const next=!paused;setPaused(next);document.documentElement.dataset.motion=next?'off':'on';try{localStorage.setItem('yolo-motion',next?'off':'on')}catch{}}
 return <button className="motion-control" onClick={toggle} aria-pressed={paused} aria-label={paused?'Activar animaciones decorativas':'Pausar animaciones decorativas'} title={paused?'Activar animaciones decorativas':'Pausar animaciones decorativas'}>{paused?<Play size={13}/>:<Pause size={13}/>}<span>{paused?'Activar movimiento':'Pausar movimiento'}</span></button>
}
