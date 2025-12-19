export interface SqlBlock {
	content: string;
	fullMatch: string;
	startIndex: number;
	endIndex: number;
}

export type QueueMessage = {
	fromEmail: string;
	emailId: string;
	sqlBlocks: SqlBlock[];
	queuedAt: string;
};
