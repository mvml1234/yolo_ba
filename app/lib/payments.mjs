export const paymentLabels={creating:'Preparando checkout',pending:'Pago pendiente',in_process:'Pago en revisión',approved:'Pago aprobado',rejected:'Pago rechazado',cancelled:'Pago cancelado',refunded:'Pago devuelto',partially_refunded:'Devolución parcial',charged_back:'Contracargo',needs_review:'Revisión del checkout',failed:'Checkout no disponible'};
export const cents=v=>Math.round((Number(v)+Number.EPSILON)*100);
export function paymentsConfiguration(e){
 return {ready:false,mode:'disabled',provider:null,origin:'',reason:'YOLO no cobra experiencias ni comisiones. Reservá y pagá directamente al proveedor.'};
}
export function quoteFee(total,rate){if(!Number.isFinite(total)||total<=0||!Number.isFinite(rate)||rate<0||rate>100)throw Error('Revisá el importe y la comisión acordada.');return cents(total*rate/100)}
export function preferencePayload(order,quote,title,config){
 if(!config.ready||order.currency!=='ARS')throw Error('Checkout no habilitado para esta cotización.');
 return {items:[{id:order.booking_id,title:'YOLO.BA · '+title.slice(0,100),currency_id:'ARS',quantity:1,unit_price:order.amount_cents/100}],marketplace_fee:order.fee_cents/100,external_reference:order.id,notification_url:config.origin+'/api/payments/webhook',back_urls:{success:config.origin+'/?checkout=return',pending:config.origin+'/?checkout=return',failure:config.origin+'/?checkout=return'},expires:true,expiration_date_to:quote.expires};
}
export function validCheckoutUrl(value){try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password&&(/(^|\.)mercadopago\.com\.ar$/).test(u.hostname)}catch{return false}}
export async function verifyWebhook(req,secret,now=Date.now()){
 const id=new URL(req.url).searchParams.get('data.id');const requestId=req.headers.get('x-request-id');const sig=req.headers.get('x-signature')||'';
 const ts=sig.match(/(?:^|,)\s*ts=(\d{10,13})(?:,|$)/)?.[1];const hash=sig.match(/(?:^|,)\s*v1=([a-f0-9]{64})(?:,|$)/i)?.[1];
 if(!secret||!id||!/^\d{1,30}$/.test(id)||!requestId||requestId.length>200||!ts||!hash)return null;
 const time=Number(ts)*(ts.length===10?1000:1);if(!Number.isFinite(time)||Math.abs(now-time)>300000)return null;
 const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);
 const signed=new Uint8Array(await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(`id:${id};request-id:${requestId};ts:${ts};`)));
 const expected=Uint8Array.from(hash.match(/../g).map(x=>parseInt(x,16)));let different=0;for(let i=0;i<signed.length;i++)different|=signed[i]^expected[i];return different===0?id:null;
}
export function checkedPayment(order,payment,e){
 if(String(payment.external_reference)!==order.id||payment.currency_id!==order.currency||cents(payment.transaction_amount)!==order.amount_cents||String(payment.collector_id)!==String(e.MP_SELLER_ID)||payment.live_mode!==(order.mode==='live')||!/^\d+$/.test(String(payment.id)))throw Error('El pago no coincide con esta orden.');
 if(order.payment_id&&String(order.payment_id)!==String(payment.id))throw Error('La orden ya tiene otro pago asociado. Requiere conciliación.');
 const allowed=['pending','in_process','approved','rejected','cancelled','refunded','charged_back'];if(!allowed.includes(payment.status))throw Error('Estado de pago desconocido.');
 const refund=cents(payment.transaction_amount_refunded||0);const status=payment.status==='approved'&&refund>0?(refund>=order.amount_cents?'refunded':'partially_refunded'):payment.status;
 const processorFee=(payment.fee_details||[]).reduce((n,x)=>n+cents(x.amount||0),0);
 const timestamp=new Date(payment.date_last_updated||payment.date_created);if(!Number.isFinite(timestamp.getTime()))throw Error('El pago no tiene fecha de actualización verificable.');
 return {status,paymentId:String(payment.id),processorFee,processorUpdated:timestamp.toISOString()};
}
