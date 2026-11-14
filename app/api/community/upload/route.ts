import {env} from 'cloudflare:workers';
import {getChatGPTUser} from '../../../chatgpt-auth';
import {cleanPhoto} from '../../../lib/social-domain.mjs';
export const dynamic='force-dynamic';
const json=(v:any,s=200)=>Response.json(v,{status:s,headers:{'Cache-Control':'no-store'}});
export async function POST(req:Request){try{
 const u=await getChatGPTUser();if(!u)return json({error:'Ingresá para subir fotos.'},401);
 const origin=req.headers.get('origin');if(origin&&origin!==new URL(req.url).origin)return json({error:'Origen inválido'},403);
 if(!env.BUCKET)return json({error:'El almacenamiento de fotos todavía no está disponible.'},503);
 if(req.headers.get('content-type')!=='image/webp')return json({error:'Prepará la foto desde el selector de imágenes.'},415);
 const quota=await env.DB!.prepare('SELECT COUNT(*) AS total,SUM(CASE WHEN post_id IS NULL THEN 1 ELSE 0 END) AS staged FROM community_media WHERE owner_id=?').bind(u.userId).first() as any;
 if(quota.total>=400||quota.staged>=12)return json({error:'Tenés demasiadas fotos pendientes o alcanzaste el límite de tu cuenta.'},429);
 const reader=req.body?.getReader();if(!reader)return json({error:'Seleccioná una foto.'},400);
 const chunks:Uint8Array[]=[];let size=0;while(true){const r=await reader.read();if(r.done)break;size+=r.value.length;if(size>5*1024*1024){await reader.cancel();return json({error:'Cada foto puede pesar hasta 5 MB.'},413)}chunks.push(r.value)}
 const raw=new Uint8Array(size);let offset=0;for(const c of chunks){raw.set(c,offset);offset+=c.length}const bytes=cleanPhoto(raw);
 const id=crypto.randomUUID();const key='community/'+id+'.webp';
 await env.BUCKET.put(key,bytes,{httpMetadata:{contentType:'image/webp'}});
 try{await env.DB!.prepare('INSERT INTO community_media(id,owner_id,storage_key,post_id,size,created_at) VALUES(?,?,?,NULL,?,?)').bind(id,u.userId,key,bytes.length,new Date().toISOString()).run()}catch(e){await env.BUCKET.delete(key);throw e}
 return json({id,url:'/api/community/photos/'+id});
}catch(e){return json({error:(e as Error).message||'No pudimos subir la foto.'},400)}}
export async function DELETE(req:Request){try{const u=await getChatGPTUser();if(!u)return json({error:'Ingresá.'},401);const origin=req.headers.get('origin');if(origin&&origin!==new URL(req.url).origin)return json({error:'Origen inválido'},403);const b=await req.json() as any;const m=await env.DB!.prepare('SELECT * FROM community_media WHERE id=? AND owner_id=? AND post_id IS NULL').bind(String(b.id),u.userId).first() as any;if(!m)return json({error:'Foto no disponible'},404);await env.BUCKET!.delete(m.storage_key);await env.DB!.prepare('DELETE FROM community_media WHERE id=? AND owner_id=? AND post_id IS NULL').bind(m.id,u.userId).run();return json({ok:true})}catch{return json({error:'No se pudo retirar la foto pendiente.'},400)}}
