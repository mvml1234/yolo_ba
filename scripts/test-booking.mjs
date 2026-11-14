import {verifiedTestExperience} from "./verified-test-experience.mjs";
import assert from 'node:assert/strict';
import {bookingDates,isBookingTime,nextBookingDay,readBookingDraft,timeChoices} from '../app/lib/booking.mjs';
import {cleanDates} from '../app/lib/domain.mjs';
const now=new Date('2026-10-28T18:00:00Z'); // 15 h Buenos Aires
assert.equal(isBookingTime('2026-10-29T14:59',now),false);assert.equal(isBookingTime('2026-10-29T15:00',now),true);
assert.throws(()=>bookingDates(['2026-10-28T20:00'],now));assert.throws(()=>bookingDates(['2027-02-01T12:00'],now));assert.throws(()=>cleanDates(['2026-10-30T24:00'],now));assert.throws(()=>cleanDates(['2026-10-30T12:60'],now));
assert.deepEqual(bookingDates(['2026-10-30T15:00','2026-10-30T15:00'],now),['2026-10-30T15:00']);assert.throws(()=>bookingDates(['2026-10-30T15:00','2026-10-31T15:00','2026-11-01T15:00','2026-11-02T15:00'],now));
assert.equal(nextBookingDay(6,now),'2026-10-31');assert.equal(nextBookingDay(0,now),'2026-11-01');assert.equal(nextBookingDay(6,new Date('2026-10-31T15:00:00Z')),'2026-11-07');
const draft={version:2,experienceId:'E01',people:2,dates:['2026-10-31T15:00'],clientRequestId:crypto.randomUUID(),savedAt:now.getTime()-60000},catalog=[verifiedTestExperience({id:'E01',listed:true,provider:'Fixture',price:100,currency:'ARS',category:'Gastronomía'})];
assert.equal(readBookingDraft(JSON.stringify(draft),catalog,now).people,2);assert.equal(readBookingDraft(JSON.stringify({...draft,savedAt:now.getTime()-3*3600000}),catalog,now),null);assert.equal(readBookingDraft(JSON.stringify({...draft,people:100}),catalog,now),null);assert.equal(readBookingDraft(JSON.stringify(draft),[{id:'E01',listed:false}],now),null);assert.equal(readBookingDraft('broken',catalog,now),null);assert.equal(readBookingDraft(JSON.stringify({...draft,dates:['2026-10-28T20:00']}),catalog,now),null);
assert.equal(timeChoices('Cultura y ciudad').includes('15:00'),true);
console.log('Booking checks passed: one-to-three future alternatives, 24-hour lead, 90-day horizon, strict time validation, weekend shortcuts and expiring sign-in drafts.');
