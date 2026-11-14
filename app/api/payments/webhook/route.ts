import {env} from 'cloudflare:workers';
import {paymentsConfiguration,verifyWebhook,checkedPayment} from '../../../lib/payments.mjs';
export const dynamic='force-dynamic';
export async function POST(req:Request){
 const config=paymentsConfiguration(env);if(!config.ready)return new Response('Payments disabled',{status:503});
 const id=await verifyWebhook(req,(env as any).MP_WEBHOOK_SECRET);if(!id)return new Response('Invalid signature',{status:401});
 try{
  const r=await fetch('https://api.mercadopago.com/v1/payments/'+id,{headers:{Authorization:'Bearer '+(env as any).MP_SELLER_OAUTH_TOKEN},signal:AbortSignal.timeout(10000)});if(!r.ok)return new Response('Retry later',{status:503});const payment=await r.json() as any;
  const order=await env.DB!.prepare('SELECT * FROM payment_orders WHERE id=?').bind(String(payment.external_reference||'')).first() as any;if(!order)return new Response('Ignored',{status:200});
  if(String(payment.id)!==id)return new Response('Payment mismatch',{status:400});const checked=checkedPayment(order,payment,env);const now=new Date().toISOString();
  await env.DB!.prepare('UPDATE payment_orders SET status=?,payment_id=?,processor_fee_cents=?,processor_updated=?,last_verified=?,updated_at=? WHERE id=? AND (processor_updated IS NULL OR processor_updated<=?)').bind(checked.status,checked.paymentId,checked.processorFee,checked.processorUpdated,now,now,order.id,checked.processorUpdated).run();
  return new Response('OK',{status:200});
 }catch{return new Response('Verification failed',{status:503})}
}
