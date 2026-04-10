CREATE TABLE `ai_interactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`accountId` int NOT NULL,
	`platform` varchar(100) NOT NULL,
	`interactionType` enum('reply_comment','reply_dm','auto_like','auto_follow','content_suggest') NOT NULL DEFAULT 'reply_comment',
	`triggerContent` text,
	`aiResponse` text,
	`status` enum('pending','approved','sent','failed','rejected') NOT NULL DEFAULT 'pending',
	`sentAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ai_interactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `article_views` (
	`id` int AUTO_INCREMENT NOT NULL,
	`articleId` int NOT NULL,
	`sessionId` varchar(128),
	`userId` int,
	`ipAddress` varchar(50),
	`userAgent` text,
	`referrer` text,
	`viewedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `article_views_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bookmarks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`articleId` int NOT NULL,
	`sessionId` varchar(128),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bookmarks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `comments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`articleId` int NOT NULL,
	`parentId` int,
	`authorName` varchar(200) NOT NULL,
	`authorEmail` varchar(320),
	`authorAvatar` text,
	`userId` int,
	`content` text NOT NULL,
	`status` enum('pending','approved','rejected','spam') NOT NULL DEFAULT 'pending',
	`likeCount` int DEFAULT 0,
	`aiGenerated` boolean DEFAULT false,
	`ipAddress` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `comments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `data_loop_suggestions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`suggestionType` enum('content_topic','publish_time','platform_strategy','audience_insight','trend_alert') NOT NULL DEFAULT 'content_topic',
	`title` varchar(500) NOT NULL,
	`description` text,
	`dataSource` json,
	`confidence` int DEFAULT 50,
	`status` enum('new','accepted','dismissed','converted') NOT NULL DEFAULT 'new',
	`convertedToTopicId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `data_loop_suggestions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `likes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`articleId` int NOT NULL,
	`sessionId` varchar(128),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `likes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subscribers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`name` varchar(200),
	`status` enum('active','unsubscribed','bounced') NOT NULL DEFAULT 'active',
	`source` varchar(100),
	`subscribedAt` timestamp NOT NULL DEFAULT (now()),
	`unsubscribedAt` timestamp,
	CONSTRAINT `subscribers_id` PRIMARY KEY(`id`),
	CONSTRAINT `subscribers_email_unique` UNIQUE(`email`)
);
