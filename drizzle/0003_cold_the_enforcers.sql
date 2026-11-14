CREATE TABLE `partner_pipeline` (
	`id` text PRIMARY KEY NOT NULL,
	`stage` text DEFAULT 'prepared' NOT NULL,
	`price_cents` integer,
	`commission_bps` integer,
	`availability` text DEFAULT '' NOT NULL,
	`policy` text DEFAULT '' NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`thread_url` text DEFAULT '' NOT NULL,
	`updated_at` text NOT NULL,
	`revision` integer DEFAULT 0 NOT NULL
);
