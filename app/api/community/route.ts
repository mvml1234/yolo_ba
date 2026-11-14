import {env} from 'cloudflare:workers';
import {getChatGPTUser} from '../../chatgpt-auth';
import catalog from '../../lib/catalog.json';
import {socialDraft,ratingBooking,minimumRankingReviews} from '../../lib/social-domain.mjs';
export const dynamic='force-dynamic';
const owner='mateomarques10@gmail.com';
const json=(v:any,s=200)=>Response.json(v,{status:s,headers:{'Cache-Control':'no-store'}});
const ratingsSQL="SELECT experience_id,COUNT(*) AS count,ROUND(AVG(rating),2) AS average FROM community_posts WHERE status='published' AND rating IS NOT NULL AND booking_id IS NOT NULL GROUP BY experience_id";
export async function GET(req:Request){try{
 const u=await getChatGPTUser();const db=env.DB!;const url=new URL(req.url);
 const ratings=(await db.prepare(ratingsSQL).all()).results;
 if(url.searchParams.get('summary')==='1')return json({ratings,minimumRankingReviews});
 const admin=Boolean(u&&u.email.toLowerCase()===owner);const moderation=url.searchParams.get('moderation')==='1';
 if(moderation&&!admin)return json({error:'Acceso restringido'},403);
 const mine=url.searchParams.get('mine')==='1';if(mine&&!u)return json({error:'Ingresá a tu cuenta.'},401);
 let where=moderation?"p.status IN ('published','hidden')":"p.status='published'";const args:any[]=[];
 if(mine){where+=' AND p.author_id=?';args.push(u!.userId)}
 const experience=url.searchParams.get('experience');if(experience){where+=' AND p.experience_id=?';args.push(experience)}
 const category=url.searchParams.get('category');if(category){const ids=catalog.filter(e=>e.category===category).map(e=>e.id);if(!ids.length)return json({posts:[],ratings,eligible:[],next:null});where+=' AND p.experience_id IN ('+ids.map(()=>'?').join(',')+')';args.push(...ids)}
 const cursor=url.searchParams.get('after');if(cursor){const [at,id]=cursor.split('|');if(!at||!id)return json({error:'Página inválida'},400);where+=' AND (p.created_at<? OR (p.created_at=? AND p.id<?))';args.push(at,at,id)}
 const result=await db.prepare(`SELECT p.*,(SELECT COUNT(*) FROM community_likes l WHERE l.post_id=p.id) AS likes,EXISTS(SELECT 1 FROM community_likes l WHERE l.post_id=p.id AND l.user_id=?) AS liked${moderation?',(SELECT COUNT(*) FROM community_reports r WHERE r.post_id=p.id) AS reports':''} FROM community_posts p WHERE ${where} ORDER BY p.created_at DESC,p.id DESC LIMIT 21`).bind(u?.userId||'',...args).all();
 const selected=result.results.slice(0,20) as any[];const last=selected.at(-1);
 const posts=selected.map(p=>({id:p.id,alias:p.alias,experienceId:p.experience_id,caption:p.caption,photos:JSON.parse(p.media).map((id:string)=>'/api/community/photos/'+id),rating:p.rating,verified:Boolean(p.booking_id),created:p.created_at,mine:u?.userId===p.author_id,likes:p.likes,liked:Boolean(p.liked),status:p.status,...(moderation?{reports:p.reports}:{})}));
 let eligible:string[]=[];if(u){const member=await db.prepare('SELECT state FROM members WHERE id=?').bind(u.userId).first() as any;eligible=(member?JSON.parse(member.state).requests:[]).filter((q:any)=>q.status==='completed').map((q:any)=>q.experienceId)}
 return json({posts,ratings,minimumRankingReviews,eligible,next:result.results.length>20&&last?last.created_at+'|'+last.id:null});
}catch{return json({error:'No pudimos cargar la comunidad. Intentá de nuevo.'},500)}}
export async function POST(req:Request){try{
 const u=await getChatGPTUser();if(!u)return json({error:'Ingresá para participar.'},401);
 const origin=req.headers.get('origin');if(origin&&origin!==new URL(req.url).origin)return json({error:'Origen inválido'},403);
 if(Number(req.headers.get('content-length')||0)>18000)return json({error:'Solicitud demasiado extensa'},413);
 const b=await req.json() as any;const db=env.DB!;const now=new Date().toISOString();
 if(b.action==='publish'){
  if(JSON.stringify(b).length>18000)return json({error:'Solicitud demasiado extensa'},413);const e=catalog.find(e=>e.id===b.experienceId);if(!e)return json({error:'Elegí una experiencia del catálogo.'},400);
  const draft=socialDraft(b);const member=await db.prepare('SELECT state FROM members WHERE id=?').bind(u.userId).first() as any;const state=member?JSON.parse(member.state):null;const booking=ratingBooking(state,e.id);
  const pending=state?.requests?.some((q:any)=>q.experienceId===e.id&&q.status==='visit_pending');if(draft.rating!==null&&!booking&&!pending)return json({error:'Para puntuar necesitás una experiencia marcada como realizada en YOLO.'},403);
  const count=await db.prepare("SELECT COUNT(*) AS n FROM community_posts WHERE author_id=? AND status!='deleted'").bind(u.userId).first() as any;if(count.n>=200)return json({error:'Alcanzaste el límite de historias de tu cuenta.'},400);
  const id=crypto.randomUUID();const slots=draft.mediaIds.map(()=>'?').join(',');
  const condition=draft.mediaIds.length?`(SELECT COUNT(*) FROM community_media WHERE owner_id=? AND post_id IS NULL AND id IN (${slots}))=?`:'1=1';
  const insert=db.prepare(`INSERT INTO community_posts(id,author_id,alias,experience_id,caption,media,rating,booking_id,status,created_at) SELECT ?,?,?,?,?,?,?,?,'published',? WHERE ${condition}`).bind(id,u.userId,draft.alias,e.id,draft.caption,JSON.stringify(draft.mediaIds),draft.rating,booking?.id||null,now,...(draft.mediaIds.length?[u.userId,...draft.mediaIds,draft.mediaIds.length]:[]));
  const commands=[insert];if(draft.mediaIds.length)commands.push(db.prepare(`UPDATE community_media SET post_id=? WHERE owner_id=? AND post_id IS NULL AND id IN (${slots}) AND EXISTS(SELECT 1 FROM community_posts WHERE id=?)`).bind(id,u.userId,...draft.mediaIds,id));
  try{const result=await db.batch(commands);if(result[0].meta.changes!==1)return json({error:'Las fotos cambiaron o no pertenecen a tu cuenta. Volvé a seleccionarlas.'},409)}catch(e){if(String(e).includes('UNIQUE'))return json({error:'Ya publicaste una puntuación para esta experiencia. Podés compartir otra historia sin puntuar.'},409);throw e}
  return json({ok:true,id});
 }
 const post=await db.prepare('SELECT * FROM community_posts WHERE id=?').bind(String(b.id||'')).first() as any;if(!post)return json({error:'Historia no disponible.'},404);
 if(b.action==='like'){if(post.status!=='published')return json({error:'Historia no disponible.'},404);if(b.liked===true)await db.prepare('INSERT OR IGNORE INTO community_likes(id,post_id,user_id) VALUES(?,?,?)').bind(crypto.randomUUID(),post.id,u.userId).run();else await db.prepare('DELETE FROM community_likes WHERE post_id=? AND user_id=?').bind(post.id,u.userId).run();return json({ok:true})}
 if(b.action==='report'){if(post.status!=='published'||!['privacy','inappropriate','spam'].includes(b.reason))return json({error:'Elegí un motivo válido.'},400);await db.prepare('INSERT OR IGNORE INTO community_reports(id,post_id,user_id,reason,created_at) VALUES(?,?,?,?,?)').bind(crypto.randomUUID(),post.id,u.userId,b.reason,now).run();return json({ok:true})}
 if(b.action==='delete'){if(post.author_id!==u.userId)return json({error:'Sólo podés retirar tus propias historias.'},403);await db.prepare("UPDATE community_posts SET status='deleted' WHERE id=? AND author_id=?").bind(post.id,u.userId).run();return json({ok:true})}
 if(b.action==='moderate'){if(u.email.toLowerCase()!==owner)return json({error:'Acceso restringido'},403);if(!['published','hidden'].includes(b.status)||post.status==='deleted')return json({error:'Estado inválido'},400);await db.prepare('UPDATE community_posts SET status=? WHERE id=?').bind(b.status,post.id).run();return json({ok:true})}
 return json({error:'Acción inválida'},400);
}catch(e){return json({error:(e as Error).message||'No se pudo guardar la historia.'},400)}}
