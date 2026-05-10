CREATE TABLE `cron_jobs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(200) NOT NULL,
	`description` text,
	`cronExpression` varchar(100) NOT NULL,
	`jobType` enum('content_generation','health_check','maintenance','security_scan') NOT NULL,
	`config` json,
	`enabled` boolean NOT NULL DEFAULT true,
	`lastRunAt` timestamp,
	`lastRunStatus` enum('success','failed','running','skipped'),
	`lastRunMessage` text,
	`nextRunAt` timestamp,
	`totalRuns` int NOT NULL DEFAULT 0,
	`totalSuccesses` int NOT NULL DEFAULT 0,
	`totalFailures` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cron_jobs_id` PRIMARY KEY(`id`),
	CONSTRAINT `cron_jobs_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `cron_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`jobId` int NOT NULL,
	`jobName` varchar(200) NOT NULL,
	`jobType` varchar(50) NOT NULL,
	`status` enum('success','failed','running','skipped') NOT NULL,
	`message` text,
	`details` json,
	`startedAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	`durationMs` int,
	CONSTRAINT `cron_logs_id` PRIMARY KEY(`id`)
);
