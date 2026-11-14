import assert from 'node:assert/strict';
import {economics,commissionSummary} from '../app/lib/profit.mjs';
let x=economics({price:25000,people:2,commissionRate:20});assert.equal(x.total,50000);assert.equal(x.commission,10000);assert.equal(x.sellerBeforeMP,40000);assert.equal(x.sellerAfterMP,null);assert.equal(x.contribution,null);
x=economics({price:25000,people:2,commissionRate:20,mpRate:5,operatingCost:1000,taxReserve:2000});assert.equal(x.sellerAfterMP,37500);assert.equal(x.contribution,7000);assert.equal(x.margin,14);
x=economics({price:25000,people:1,commissionRate:20,mpRate:0,operatingCost:0,taxReserve:0});assert.equal(x.sellerAfterMP,20000);assert.equal(x.contribution,5000);
assert.equal(economics({price:10,people:1,commissionRate:60,mpRate:60}).viable,false);assert.throws(()=>economics({price:0,people:1,commissionRate:20}));assert.throws(()=>economics({price:10,people:1,commissionRate:100}));
const order={mode:'live',status:'approved',currency:'ARS',lastVerified:'2026-10-28',fee:50};assert.equal(commissionSummary([order,{...order,mode:'test'},{...order,status:'refunded'},{...order,status:'partially_refunded'},{...order,status:'charged_back'},{...order,lastVerified:null}]).gross,50);
console.log('Profit checks passed: gross commission, unknown vs zero costs, seller MP cost, contribution and exclusion of unverified/test/refunded orders.');
