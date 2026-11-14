import {cents} from './payments.mjs';
/** @param {{price:number,people:number,commissionRate:number,mpRate?:number|string|null,operatingCost?:number|string|null,taxReserve?:number|string|null}} input */
export function economics({price,people,commissionRate,mpRate=null,operatingCost=null,taxReserve=null}){
 if(!Number.isFinite(price)||price<=0||!Number.isInteger(people)||people<1||people>10||!Number.isFinite(commissionRate)||commissionRate<0||commissionRate>=100)throw Error('Revisá precio, personas y comisión.');
 const optional=(v,max)=>v===null||v===''||v===undefined?null:(Number.isFinite(Number(v))&&Number(v)>=0&&Number(v)<=max?Number(v):NaN);
 const mp=optional(mpRate,100),cost=optional(operatingCost,1e9),tax=optional(taxReserve,1e9);if([mp,cost,tax].some(Number.isNaN))throw Error('Los costos deben ser importes válidos y la tasa debe estar entre 0 y 100.');
 const total=cents(price*people),fee=cents(total/100*commissionRate/100),sellerBefore=total-fee,mpFee=mp===null?null:cents(total/100*mp/100),sellerNet=mpFee===null?null:sellerBefore-mpFee,contribution=cost===null||tax===null?null:fee-cents(cost)-cents(tax);
 return {total:total/100,commission:fee/100,sellerBeforeMP:sellerBefore/100,mpFee:mpFee===null?null:mpFee/100,sellerAfterMP:sellerNet===null?null:sellerNet/100,contribution:contribution===null?null:contribution/100,viable:sellerNet===null?null:sellerNet>=0,margin:contribution===null?null:Math.round(contribution/total*10000)/100};
}
export function commissionSummary(orders){const approved=orders.filter(o=>o.mode==='live'&&o.status==='approved'&&o.currency==='ARS'&&o.lastVerified);return {count:approved.length,gross:Math.round(approved.reduce((n,o)=>n+o.fee,0)*100)/100};}
