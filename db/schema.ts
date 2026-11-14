// Intentionally empty by default.
// Add Drizzle tables here when the site actually needs a database.
// See examples/d1/db/schema.ts for an opt-in example.
import { sqliteTable, text, integer, uniqueIndex, index } from 'drizzle-orm/sqlite-core';
import {sql} from 'drizzle-orm';
export const members = sqliteTable('members', {
 id: text('id').primaryKey(), email: text('email').notNull(),
 state: text('state').notNull(), revision: integer('revision').notNull().default(0),
 createdAt: text('created_at').notNull()
});
export const communityPosts=sqliteTable('community_posts',{
 id:text('id').primaryKey(),authorId:text('author_id').notNull(),alias:text('alias').notNull(),experienceId:text('experience_id').notNull(),caption:text('caption').notNull(),media:text('media').notNull(),rating:integer('rating'),bookingId:text('booking_id'),status:text('status').notNull().default('published'),createdAt:text('created_at').notNull()
},t=>[uniqueIndex('one_published_rating_per_member').on(t.authorId,t.experienceId).where(sql`${t.rating} IS NOT NULL AND ${t.status} = 'published'`),index('community_feed').on(t.status,t.createdAt)]);
export const communityMedia=sqliteTable('community_media',{
 id:text('id').primaryKey(),ownerId:text('owner_id').notNull(),storageKey:text('storage_key').notNull(),postId:text('post_id'),size:integer('size').notNull(),createdAt:text('created_at').notNull()
});
export const communityLikes=sqliteTable('community_likes',{
 id:text('id').primaryKey(),postId:text('post_id').notNull(),userId:text('user_id').notNull()
},t=>[uniqueIndex('one_like_per_member').on(t.postId,t.userId)]);
export const communityReports=sqliteTable('community_reports',{
 id:text('id').primaryKey(),postId:text('post_id').notNull(),userId:text('user_id').notNull(),reason:text('reason').notNull(),createdAt:text('created_at').notNull()
},t=>[uniqueIndex('one_report_per_member').on(t.postId,t.userId)]);
export const paymentOrders=sqliteTable('payment_orders',{
 id:text('id').primaryKey(),bookingId:text('booking_id').notNull(),userId:text('user_id').notNull(),provider:text('provider').notNull(),amountCents:integer('amount_cents').notNull(),feeCents:integer('fee_cents').notNull(),currency:text('currency').notNull(),mode:text('mode').notNull(),status:text('status').notNull(),preferenceId:text('preference_id'),checkoutUrl:text('checkout_url'),paymentId:text('payment_id'),processorFeeCents:integer('processor_fee_cents'),lastVerified:text('last_verified'),processorUpdated:text('processor_updated'),createdAt:text('created_at').notNull(),updatedAt:text('updated_at').notNull()
},t=>[uniqueIndex('one_order_per_booking').on(t.bookingId),uniqueIndex('one_mercadopago_payment').on(t.paymentId)]);
export const partnerPipeline=sqliteTable('partner_pipeline',{
 id:text('id').primaryKey(),stage:text('stage').notNull().default('prepared'),price:integer('price_cents'),commissionBps:integer('commission_bps'),availability:text('availability').notNull().default(''),policy:text('policy').notNull().default(''),notes:text('notes').notNull().default(''),threadUrl:text('thread_url').notNull().default(''),updatedAt:text('updated_at').notNull(),revision:integer('revision').notNull().default(0)
});
