// Commercial verification is distinct from checking a public website/contact.
// Populate only after written provider acceptance; never infer it from priceStatus.
export function isBookable(e,now=new Date()){
 const v=e?.verification;
 return Boolean(e&&e.listed!==false&&e.category!=='Para el corazón'&&v?.status==='verified'
  &&v.provider===e.provider&&v.price===e.price&&v.currency===e.currency
  &&Number.isFinite(e.price)&&e.price>0&&['ARS','USD'].includes(e.currency)
  &&v.unit==='person'&&v.taxesIncluded===true&&v.commercialAgreement===true&&v.paymentAuthorized===true
  &&typeof v.evidenceUrl==='string'&&v.evidenceUrl.startsWith('https://')
  &&v.includes?.trim()&&v.policy?.trim()&&v.bookingTerms?.trim()
  &&Number.isFinite(Date.parse(v.verifiedAt))&&Date.parse(v.verifiedAt)<=now.getTime()
  &&Number.isFinite(Date.parse(v.validUntil))&&Date.parse(v.validUntil)>now.getTime());
}
export function isPublicExperience(e,now=new Date()){
 return Boolean(e&&e.id&&e.title&&e.provider);
}
export function assertBookable(e,now=new Date()){
 if(!isBookable(e,now))throw Error('Este plan todavía no está habilitado para reservar o pagar en YOLO. Estamos verificando al proveedor y sus condiciones.');
}
export function isVerifiedQuote(e,quote,people,now=new Date()){
 return Boolean(isBookable(e,now)&&quote&&Number.isInteger(people)&&people>0
  &&quote.provider===e.provider&&quote.price===e.price&&quote.currency===e.currency
  &&quote.total===e.price*people);
}

export const browseOnlyCategories=['Para el corazón','Buenos Aires gratis','En vivo gratis','Teatro','Shows en vivo'];
export function hasPublishedPrice(e,now=new Date()){
 const p=e?.priceEvidence;
 return Boolean(p&&['public','quote'].includes(p.kind)&&p.amount===e.price&&p.currency===e.currency&&p.source===e.source&&/^https:\/\//.test(p.source)&&e.priceKind!=='net'&&Number.isFinite(Date.parse(p.checkedAt))&&Date.parse(p.checkedAt)<=now.getTime()&&now.getTime()-Date.parse(p.checkedAt)<=30*86400000&&(!p.validUntil||Date.parse(p.validUntil)>now.getTime()));
}
export function isDiscoverable(e){return isPublicExperience(e)&&!browseOnlyCategories.includes(e.category)&&e.surpriseEligible!==false&&e.language==='es'&&e.listed!==false&&hasPublishedPrice(e)&&Number.isFinite(e.price)&&e.price>=0&&['ARS','USD'].includes(e.currency)&&e.priceKind!=='net';}

/** Public per-person tiers belong to one activity, never extra catalog entries. */
export function priceForParty(e,people){
 if(!hasPublishedPrice(e))return null;
 if(people===undefined)return e;
 if(!Number.isInteger(people)||people<1||people>10||people<(e.minimumPeople||1)||people>(e.maximumPeople||10))return null;
 const tiers=e.priceEvidence.tiers;
 if(!tiers?.length)return e;
 const tier=tiers.find(t=>people>=t.minPeople&&people<=t.maxPeople&&Number.isFinite(t.amount)&&t.amount>=0);
 if(!tier)return null;
 return {...e,price:tier.amount,priceEvidence:{...e.priceEvidence,amount:tier.amount},priceVariant:`Por persona para ${people} personas`,selectedPeople:people};
}
