/** Launch proposal. No paid membership or financial entitlement is activated by this config. */
export const membershipOffer={id:'yolo-plus',version:'2026-10-29-v1',status:'prelaunch',currency:'ARS',monthlyPrice:3900,period:'month',autoRenewal:false,checkoutEnabled:false,minimumMonths:1,priceReviewed:'2026-10-29'};
export const membershipTiers=[
 {rank:1,name:'Base',price:0,ideas:0,rate:0,cap:0,from:0,categories:1,detail:'Tu libreta con cuatro sellos por categoría, ruleta, catálogo y progreso guardado.'},
 {rank:2,name:'Plus',price:3900,ideas:4,rate:0,cap:0,from:32,categories:8,detail:'Cuatro ideas personalizadas al mes y un pequeño beneficio por mes en planes elegibles.'},
 {rank:3,name:'Explorador',price:3900,ideas:6,rate:0,cap:0,from:96,categories:8,detail:'Seis ideas al mes y un tope de beneficio más alto, por la misma cuota.'},
 {rank:4,name:'Golden',price:3900,ideas:8,rate:0,cap:0,from:224,categories:8,detail:'Ocho ideas al mes, el mayor beneficio propuesto y acceso a futuras propuestas especiales.'}
];
export function membershipQuote({rank,amount,currency='ARS',nonprofit=false,eligible=true,used=0}){
 const tier=membershipTiers.find(t=>t.rank===rank)||membershipTiers[0];
 if(!Number.isFinite(amount)||amount<0||!Number.isFinite(used)||used<0)throw Error('Importe inválido.');
 const applicable=eligible&&!nonprofit&&currency==='ARS'&&amount>0;
 const saving=applicable?Math.max(0,Math.min(Math.round(amount*tier.rate)/100,tier.cap-used)):0;
 return {saving:Math.round(saving*100)/100,final:Math.round((amount-saving)*100)/100,rate:tier.rate,cap:tier.cap,remaining:Math.max(0,tier.cap-used),simulated:true};
}
export function membershipMargin({rank,processorRate=null,support=null,taxReserve=null}){
 const tier=membershipTiers.find(t=>t.rank===rank)||membershipTiers[1],fee=membershipOffer.monthlyPrice;
 const valid=n=>n===null||(Number.isFinite(n)&&n>=0);if(!valid(processorRate)||processorRate>100||!valid(support)||!valid(taxReserve))throw Error('Costos inválidos.');
 const processor=processorRate===null?null:Math.round(fee*processorRate)/100;
 return {fee,maximumBenefit:tier.cap,beforeCosts:fee-tier.cap,processor,contribution:[processor,support,taxReserve].some(v=>v===null)?null:Math.round((fee-tier.cap-processor-support-taxReserve)*100)/100};
}
/** This prelaunch build exposes no endpoint that grants a paid entitlement. */
export function membershipState(state){const active=Boolean(state?.plusReward?.expires&&Date.parse(state.plusReward.expires)>Date.now());return {plan:active?'plus':'base',status:active?'reward':'prelaunch',active,expires:state?.plusReward?.expires||null,interested:Boolean(state?.membershipInterest?.interested),requestedAt:state?.membershipInterest?.at||null,offer:membershipOffer,tiers:membershipTiers};}
