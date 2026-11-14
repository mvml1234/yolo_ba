CREATE TABLE `community_likes` (
	`id` text PRIMARY KEY NOT NULL,
	`post_id` text NOT NULL,
	`user_id` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `one_like_per_member` ON `community_likes` (`post_id`,`user_id`);--> statement-breakpoint
CREATE TABLE `community_media` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`storage_key` text NOT NULL,
	`post_id` text,
	`size` integer NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `community_posts` (
	`id` text PRIMARY KEY NOT NULL,
	`author_id` text NOT NULL,
	`alias` text NOT NULL,
	`experience_id` text NOT NULL,
	`caption` text NOT NULL,
	`media` text NOT NULL,
	`rating` integer,
	`booking_id` text,
	`status` text DEFAULT 'published' NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `one_published_rating_per_member` ON `community_posts` (`author_id`,`experience_id`) WHERE "community_posts"."rating" IS NOT NULL AND "community_posts"."status" = 'published';--> statement-breakpoint
CREATE INDEX `community_feed` ON `community_posts` (`status`,`created_at`);--> statement-breakpoint
CREATE TABLE `community_reports` (
	`id` text PRIMARY KEY NOT NULL,
	`post_id` text NOT NULL,
	`user_id` text NOT NULL,
	`reason` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `one_report_per_member` ON `community_reports` (`post_id`,`user_id`);--> statement-breakpoint
CREATE TABLE `payment_orders` (
	`id` text PRIMARY KEY NOT NULL,
	`booking_id` text NOT NULL,
	`user_id` text NOT NULL,
	`provider` text NOT NULL,
	`amount_cents` integer NOT NULL,
	`fee_cents` integer NOT NULL,
	`currency` text NOT NULL,
	`mode` text NOT NULL,
	`status` text NOT NULL,
	`preference_id` text,
	`checkout_url` text,
	`payment_id` text,
	`processor_fee_cents` integer,
	`last_verified` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `one_order_per_booking` ON `payment_orders` (`booking_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `one_mercadopago_payment` ON `payment_orders` (`payment_id`);