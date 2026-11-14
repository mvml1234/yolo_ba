export const minimumRankingReviews=3;
export function socialDraft(body){
 const alias=String(body.alias||'').trim();const caption=String(body.caption||'').trim();
 if(alias.length<2||alias.length>40||alias.includes('@')||/[<>\r\n]/.test(alias))throw Error('Elegí un nombre público de 2 a 40 caracteres, sin email.');
 if(caption.length>1200)throw Error('La historia admite hasta 1200 caracteres.');
 if(body.visibilityConsent!==true)throw Error('Confirmá que querés compartir esta historia con la comunidad.');
 if(!Array.isArray(body.mediaIds)||body.mediaIds.length>4||body.mediaIds.some(id=>typeof id!=='string'||!/^[a-f0-9-]{36}$/.test(id)))throw Error('Podés adjuntar hasta cuatro fotos.');
 const mediaIds=[...new Set(body.mediaIds)];if(!mediaIds.length&&caption.length<10)throw Error('Agregá una foto o una historia de al menos 10 caracteres.');
 const rating=body.rating===null||body.rating===undefined?null:Number(body.rating);
 if(rating!==null&&(!Number.isInteger(rating)||rating<1||rating>5))throw Error('La puntuación debe ser de 1 a 5 estrellas.');
 return {alias,caption,mediaIds,rating};
}
export function ratingBooking(state,experienceId){return (state?.requests||[]).find(q=>q.experienceId===experienceId&&q.status==='completed')||null}
// Only image bitstreams and alpha survive. EXIF/XMP/ICC, unknown chunks and
// trailing bytes are discarded so uploaded photographs don't expose metadata.
export function cleanPhoto(input){
 const bytes=new Uint8Array(input);const text=(a,b)=>String.fromCharCode(...bytes.slice(a,b));
 if(bytes.length<20||text(0,4)!=='RIFF'||text(8,12)!=='WEBP')throw Error('La foto debe prepararse como WebP. Volvé a seleccionarla.');
 const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);const end=view.getUint32(4,true)+8;
 if(end>bytes.length||end<20)throw Error('La foto está incompleta.');
 const chunks=[];let images=0;
 for(let offset=12;offset<end;){
  if(offset+8>end)throw Error('Formato de foto inválido.');const tag=text(offset,offset+4);const size=view.getUint32(offset+4,true);const next=offset+8+size+(size%2);
  if(next>end)throw Error('Formato de foto inválido.');
  if(tag==='ANIM'||tag==='ANMF')throw Error('Subí una foto fija, no una animación.');
  if(['VP8 ','VP8L','VP8X','ALPH'].includes(tag)){
   const chunk=bytes.slice(offset,next);if(tag==='VP8X'){if(size!==10)throw Error('Formato de foto inválido.');chunk[8]&=0x10;chunk[9]=chunk[10]=chunk[11]=0;}
   if(tag==='VP8 '||tag==='VP8L')images++;chunks.push(chunk);
  }offset=next;
 }
 if(images!==1)throw Error('No se encontró una foto válida.');const length=12+chunks.reduce((n,c)=>n+c.length,0);const result=new Uint8Array(length);result.set([82,73,70,70,0,0,0,0,87,69,66,80]);new DataView(result.buffer).setUint32(4,length-8,true);let at=12;for(const c of chunks){result.set(c,at);at+=c.length}return result;
}
