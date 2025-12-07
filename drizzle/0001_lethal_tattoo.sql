CREATE TABLE `evaluations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` int,
	`sessionNumber` int NOT NULL,
	`date` varchar(10) NOT NULL,
	`groupName` varchar(255) NOT NULL,
	`facilitator` varchar(255) NOT NULL,
	`beforeGrouping` text,
	`beforeIsolation` text,
	`beforeTensions` text,
	`beforeCommunication` text,
	`beforeMixedInteractions` int,
	`duringParticipation` text,
	`duringRespect` text,
	`duringOpenness` text,
	`duringLaughter` text,
	`duringMixedInteractions` text,
	`afterGrouping` text,
	`afterMixedInteractions` int,
	`afterStereotypes` text,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `evaluations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionNumber` int NOT NULL,
	`date` varchar(10) NOT NULL,
	`groupName` varchar(255) NOT NULL,
	`facilitator` varchar(255) NOT NULL,
	`location` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `evaluations` ADD CONSTRAINT `evaluations_sessionId_sessions_id_fk` FOREIGN KEY (`sessionId`) REFERENCES `sessions`(`id`) ON DELETE no action ON UPDATE no action;