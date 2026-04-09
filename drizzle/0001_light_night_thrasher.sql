CREATE TABLE `audit_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`userName` varchar(200),
	`action` varchar(200) NOT NULL,
	`resource` varchar(200) NOT NULL,
	`resourceId` int,
	`details` json,
	`ipAddress` varchar(50),
	`userAgent` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `calendar_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(500) NOT NULL,
	`description` text,
	`eventType` enum('publish','review','meeting','deadline','other') NOT NULL DEFAULT 'publish',
	`contentId` int,
	`accountId` int,
	`platform` varchar(100),
	`startAt` timestamp NOT NULL,
	`endAt` timestamp,
	`allDay` int DEFAULT 0,
	`status` enum('scheduled','completed','cancelled') NOT NULL DEFAULT 'scheduled',
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `calendar_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`topicId` int,
	`title` varchar(500) NOT NULL,
	`body` text,
	`contentType` enum('article','report','newsletter','social_post') NOT NULL DEFAULT 'article',
	`wordCount` int DEFAULT 0,
	`tags` json,
	`metadata` json,
	`status` enum('draft','writing','review_pending','review_passed','review_rejected','ready','published') NOT NULL DEFAULT 'draft',
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `insight_tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(500) NOT NULL,
	`taskType` enum('trend_analysis','competitor_monitor','keyword_tracking','custom') NOT NULL DEFAULT 'custom',
	`config` json,
	`result` json,
	`status` enum('pending','running','completed','failed') NOT NULL DEFAULT 'pending',
	`scheduleCron` varchar(100),
	`lastRunAt` timestamp,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `insight_tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `media_accounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`platform` enum('wechat_mp','xiaohongshu','douyin','bilibili','weibo','zhihu','website') NOT NULL,
	`accountName` varchar(200) NOT NULL,
	`accountId` varchar(200),
	`avatar` text,
	`description` text,
	`followers` int DEFAULT 0,
	`status` enum('active','inactive','pending_auth') NOT NULL DEFAULT 'active',
	`credentials` json,
	`autoPublish` int DEFAULT 0,
	`lastSyncAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `media_accounts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `publish_tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contentId` int NOT NULL,
	`platform` varchar(100) NOT NULL,
	`accountId` int,
	`status` enum('queued','scheduled','publishing','published','failed') NOT NULL DEFAULT 'queued',
	`publishedUrl` text,
	`scheduledAt` timestamp,
	`publishedAt` timestamp,
	`errorMessage` text,
	`publishMode` enum('manual','semi_auto','auto') NOT NULL DEFAULT 'manual',
	`metadata` json,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `publish_tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(500) NOT NULL,
	`reportType` enum('weekly','monthly','quarterly','special') NOT NULL DEFAULT 'weekly',
	`summary` text,
	`body` text,
	`coverImage` text,
	`period` varchar(100),
	`status` enum('draft','published','archived') NOT NULL DEFAULT 'draft',
	`publishedAt` timestamp,
	`downloadUrl` text,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `review_tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contentId` int NOT NULL,
	`reviewerId` int,
	`status` enum('pending','approved','rejected','revision_needed') NOT NULL DEFAULT 'pending',
	`comments` text,
	`score` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`reviewedAt` timestamp,
	CONSTRAINT `review_tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `signals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(500) NOT NULL,
	`source` varchar(200),
	`sourceUrl` text,
	`summary` text,
	`content` text,
	`category` varchar(100),
	`tags` json,
	`priority` enum('low','medium','high','urgent') NOT NULL DEFAULT 'medium',
	`status` enum('new','processing','archived','converted') NOT NULL DEFAULT 'new',
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `signals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sources` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(300) NOT NULL,
	`sourceType` enum('rss','api','website','manual','social') NOT NULL DEFAULT 'manual',
	`url` text,
	`config` json,
	`status` enum('active','inactive','error') NOT NULL DEFAULT 'active',
	`lastFetchAt` timestamp,
	`fetchCount` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sources_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `team_invites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`invitedBy` int NOT NULL,
	`token` varchar(128) NOT NULL,
	`status` enum('pending','accepted','expired') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp NOT NULL,
	CONSTRAINT `team_invites_id` PRIMARY KEY(`id`),
	CONSTRAINT `team_invites_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `topics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(500) NOT NULL,
	`description` text,
	`signalId` int,
	`category` varchar(100),
	`tags` json,
	`targetPlatforms` json,
	`aiSuggestion` text,
	`status` enum('draft','approved','rejected','in_production') NOT NULL DEFAULT 'draft',
	`priority` enum('low','medium','high','urgent') NOT NULL DEFAULT 'medium',
	`assignedTo` int,
	`createdBy` int,
	`approvedBy` int,
	`approvedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `topics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `website_posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(500) NOT NULL,
	`slug` varchar(300),
	`excerpt` text,
	`body` text,
	`coverImage` text,
	`category` varchar(100),
	`tags` json,
	`status` enum('draft','published','archived') NOT NULL DEFAULT 'draft',
	`publishedAt` timestamp,
	`contentId` int,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `website_posts_id` PRIMARY KEY(`id`),
	CONSTRAINT `website_posts_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `workflows` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(300) NOT NULL,
	`description` text,
	`trigger` json,
	`steps` json,
	`status` enum('active','inactive','draft') NOT NULL DEFAULT 'draft',
	`lastRunAt` timestamp,
	`runCount` int DEFAULT 0,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `workflows_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `phone` varchar(20);--> statement-breakpoint
ALTER TABLE `users` ADD `avatar` text;--> statement-breakpoint
ALTER TABLE `users` ADD `status` enum('active','inactive','invited') DEFAULT 'active' NOT NULL;