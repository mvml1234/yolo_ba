import assets from './photo-assets.json';
import officialPhotos from './official-photos.json';
import referencePhotos from './reference-photos.json';
type Photo=typeof assets[number];
export function photoByKey(key:string):Photo{return assets.find(p=>p.key===key)||assets[0]}
export function categoryPhoto(category:string):Photo{return assets.find(p=>p.topics.includes(category))||assets[0]}
/** Use activity-specific photos where available, stable across cards, roulette and checkout. */
export function experiencePhoto(e:{id:string;title:string;category:string;description?:string;provider?:string}):Photo{
 const official=(officialPhotos as Record<string,{src:string;source:string;imageURL:string}>)[e.id];
 if(official)return {key:e.id,src:official.src,alt:'Imagen de '+(e.provider||e.title)+' publicada en su página oficial',source:official.source,author:e.provider||'',license:'Fuente del proveedor',topics:[e.category],imageURL:official.imageURL};
 const reference=(referencePhotos as Record<string,Photo>)[e.id];
 if(reference)return reference;
 return categoryPhoto(e.category);
}
