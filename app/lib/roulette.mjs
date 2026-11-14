import {isDiscoverable,priceForParty} from "./catalog-access.mjs";
export const wheelCategories=['Gastronomía','Cultura y ciudad','Agua y Delta','Campo y escapadas','Aire y adrenalina','Bienestar','Talleres creativos','Juegos y deportes'];
export function roulettePool(catalog,maximum,currency='ARS',people){
 if(maximum===''||!Number.isFinite(Number(maximum))||Number(maximum)<0||!['ARS','USD'].includes(currency))return [];
 return catalog.filter(e=>isDiscoverable(e)).map(e=>priceForParty(e,people)).filter(e=>e&&isDiscoverable(e)&&e.surpriseEligible!==false&&e.currency===currency&&typeof e.price==='number'&&Number.isFinite(e.price)&&e.price>=0&&e.price<=Number(maximum)&&wheelCategories.includes(e.category));
}
export function drawExperience(pool,seen=[],random=Math.random){const fresh=pool.filter(e=>!seen.includes(e.id));const options=fresh.length?fresh:pool;if(!options.length)return null;return options[Math.min(options.length-1,Math.floor(Math.max(0,random())*options.length))];}
