CREATE TABLE `content_templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(300) NOT NULL,
	`platform` varchar(100) NOT NULL,
	`category` varchar(100),
	`description` text,
	`body` text,
	`fileUrl` text,
	`fileKey` text,
	`thumbnail` text,
	`usageCount` int DEFAULT 0,
	`status` enum('active','archived') NOT NULL DEFAULT 'active',
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `content_templates_id` PRIMARY KEY(`id`)
);
