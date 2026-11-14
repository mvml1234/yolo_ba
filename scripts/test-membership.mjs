import assert from 'node:assert/strict';
import {membershipQuote as quote,membershipOffer,membershipState,membershipMargin} from '../app/lib/membership.mjs';
assert.equal(membershipOffer.monthlyPrice,3900);assert.equal(membershipOffer.checkoutEnabled,false);
for(const rank of [2,3,4]){const q=quote({rank,amount:150000});assert(q.saving<=q.cap);assert(q.saving>=0);assert.equal(q.final+q.saving,150000);assert.equal(quote({rank,amount:40000,currency:'USD'}).saving,0);assert.equal(quote({rank,amount:40000,nonprofit:true}).saving,0);assert.equal(quote({rank,amount:40000,eligible:false}).saving,0);assert.equal(quote({rank,amount:40000,used:999999}).saving,0)}
assert.equal(quote({rank:2,amount:40000}).saving,1000);assert.equal(quote({rank:3,amount:20000}).saving,1000);assert.equal(quote({rank:4,amount:40000}).saving,2500);assert.equal(quote({rank:1,amount:40000}).saving,0);assert.throws(()=>quote({rank:4,amount:-1}));
assert.equal(membershipState({membership:{active:true,rank:4},membershipInterest:{interested:true}}).active,false);assert.equal(membershipState({membershipInterest:{interested:true}}).interested,true);
assert.equal(membershipMargin({rank:4}).beforeCosts,1400);assert.equal(membershipMargin({rank:4}).contribution,null);assert.equal(membershipMargin({rank:4,processorRate:10,support:500,taxReserve:200}).contribution,310);assert.throws(()=>membershipMargin({rank:4,processorRate:101}));
console.log('Membership: proposal3900, percentage/caps, currency/nonprofit exclusions, no client activation, unknown costs kept unknown and worst-case cost margins.');
