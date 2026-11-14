import {env} from 'cloudflare:workers';
import catalog from '../../lib/catalog.json';
import {isBookable} from '../../lib/catalog-access.mjs';
import {getChatGPTUser} from '../../chatgpt-auth';
import {paymentsConfiguration,preferencePayload,validCheckoutUrl,cents} from '../../lib/payments.mjs';
export const dynamic='force-dynamic';
const json=(v:any,s=200)=>Response.json(v,{status:s,headers:{'Cache-Control':'no-store'}});
const safe=(o:any)=>({id:o.id,bookingId:o.booking_id,amount:o.amount_cents/100,fee:o.fee_cents/100,currency:o.currency,status:o.status,provider:o.provider,mode:o.mode,paymentId:o.payment_id,lastVerified:o.last_verified,processorFee:o.processor_fee_cents===null?null:o.processor_fee_cents/100,created:o.created_at});
export async function GET(req:Request){try{const u=await getChatGPTUser();const config=paymentsConfiguration(env);const publicConfig={ready:config.ready,mode:config.mode,provider:config.provider,reason:config.reason};if(!u)return json({orders:[],configuration:publicConfig});const admin=new URL(req.url).searchParams.get('admin')==='1';if(admin&&u.email.toLowerCase()!=='mateomarques10@gmail.com')return json({error:'Acceso restringido'},403);const rows=admin?await env.DB!.prepare('SELECT * FROM payment_orders ORDER BY created_at DESC LIMIT 200').all():await env.DB!.prepare('SELECT * FROM payment_orders WHERE user_id=? ORDER BY created_at DESC LIMIT 150').bind(u.userId).all();return json({orders:rows.results.map(safe),configuration:publicConfig})}catch{return json({error:'No pudimos cargar el estado de pagos.'},500)}}
export async function POST(){return json({error:'YOLO no procesa pagos de experiencias. La reserva y el pago son directos al proveedor.'},410)}
