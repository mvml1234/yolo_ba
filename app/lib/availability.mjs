import {bookingDates} from './booking.mjs';
import {paymentsConfiguration,quoteFee} from './payments.mjs';
export const maxAvailabilityRounds=2;
export function availabilityBatch(input,q,env,now=new Date()){
 if(q.nonprofit||q.category==='Para el corazón')throw Error('Las actividades solidarias no se cotizan ni cobran.');
 if(!['requested','quoted','availability_options'].includes(q.status))throw Error('Este estado no permite proponer horarios.');
 if((q.availabilityRounds||0)>=maxAvailabilityRounds)throw Error('Ya hubo dos rondas. Ofrecé otra experiencia o cerrá la solicitud.');
 if(input.checked!==true)throw Error('Confirmá que el prestador verificó estos cupos para todo el grupo.');
 const dates=bookingDates(input.dates,now);const text=(v,max=1000)=>String(v||'').trim().slice(0,max);
 const price=Number(input.price),currency=input.currency,provider=text(input.provider,140),place=text(input.place,200),policy=text(input.policy),reference=text(input.reference,160),expires=Date.parse(input.expires+'-03:00'),cancel=Date.parse(input.cancelBefore+'-03:00');
 if(!Number.isFinite(price)||price<=0||price>100000000||!['ARS','USD'].includes(currency)||!provider||!place||!policy||!reference)throw Error('Completá precio, moneda, prestador, lugar, condiciones y referencia de cupo.');
 const first=Math.min(...dates.map(d=>Date.parse(d+'-03:00')));
 if(!Number.isFinite(expires)||expires<=now.getTime()||expires>now.getTime()+24*3600000||expires>=first||!Number.isFinite(cancel)||cancel>first)throw Error('La vigencia debe ser futura, de hasta 24 h y anterior a los horarios. Revisá también el plazo de cancelación.');
 const commissionRate=Number(input.commissionRate||0),feeCents=quoteFee(price*q.people,commissionRate),paymentRequired=input.paymentRequired===true,config=paymentsConfiguration(env);
 if(paymentRequired&&(!config.ready||currency!=='ARS'||provider!==config.provider||feeCents>=Math.round(price*q.people*100)))throw Error('El cobro requiere prestador conectado, moneda ARS y comisión menor al total.');
 return {id:crypto.randomUUID(),round:(q.availabilityRounds||0)+1,checkedAt:now.toISOString(),expires:new Date(expires).toISOString(),options:dates.map(date=>({id:crypto.randomUUID(),date,price,total:price*q.people,currency,provider,place,policy,expires:new Date(expires).toISOString(),cancelBefore:new Date(cancel).toISOString(),paymentRequired,commissionRate,feeCents,availabilityReference:reference}))};
}
export function chooseAvailability(q,b,now=new Date()){
 if(q.status!=='availability_options'||q.availability?.id!==b.batchId)throw Error('Las opciones cambiaron. Actualizá la solicitud.');
 if(Date.parse(q.availability.expires)<=now.getTime())throw Error('Estos cupos vencieron. Pedí una nueva coordinación.');
 const option=q.availability.options.find(o=>o.id===b.optionId);if(!option||Date.parse(option.date+'-03:00')<=now.getTime())throw Error('Horario inválido o vencido.');
 q.quote={...option};delete q.quote.id;q.status='quoted';q.selectedAvailability={batchId:b.batchId,optionId:b.optionId};q.availability=null;
 return 'Elegiste un horario verificado. Revisá el precio y las condiciones antes de aceptar; todavía no hay reserva confirmada.';
}
export function declineAvailability(q,b){
 if(q.status!=='availability_options'||q.availability?.id!==b.batchId)throw Error('Las opciones cambiaron. Actualizá la solicitud.');
 q.status=(q.availabilityRounds||0)>=maxAvailabilityRounds?'replan_needed':'requested';q.availability=null;delete q.quote;
 return q.status==='replan_needed'?'Dos rondas sin coincidencia. Podés elegir otra experiencia o retirar esta solicitud, sin cobro por esta coordinación.':'Ningún horario te sirve. YOLO debe pedir una última tanda de cupos al prestador; no cambió tu fecha automáticamente.';
}
