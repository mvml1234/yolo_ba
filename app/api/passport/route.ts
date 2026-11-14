import {env} from 'cloudflare:workers';
import {getChatGPTUser} from '../../chatgpt-auth';
import catalog from '../../lib/catalog.json';
import {passport} from '../../lib/gamification.mjs';
import {membershipState} from '../../lib/membership.mjs';
export const dynamic='force-dynamic';
export async function GET(){try{const u=await getChatGPTUser();let state=null,posts:any[]=[];if(u){const row=await env.DB!.prepare('SELECT state FROM members WHERE id=?').bind(u.userId).first() as any;state=row?JSON.parse(row.state):null;posts=(await env.DB!.prepare("SELECT experience_id,rating,booking_id,status FROM community_posts WHERE author_id=? AND status='published' AND rating IS NOT NULL").bind(u.userId).all()).results}return Response.json({authenticated:Boolean(u),passport:passport(state,catalog,posts),membership:membershipState(state)},{headers:{'Cache-Control':'private, no-store'}})}catch{return Response.json({error:'No pudimos cargar tu pasaporte. Intentá actualizarlo.'},{status:500,headers:{'Cache-Control':'no-store'}})}}
