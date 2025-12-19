import type { SqlBlock } from "../types";

export const hasSqlBlock = (text: string) => {
	const pattern = /<sql>(.*?)<\/sql>/gs;
	return pattern.test(text);
};

export function extractSqlBlocks(text: string): SqlBlock[] {
	const pattern = /<sql>(.*?)<\/sql>/gs;

	return [...text.matchAll(pattern)].map((match) => ({
		content: match[1].trim(),
		fullMatch: match[0],
		startIndex: match.index,
		endIndex: match.index + match[0].length,
	}));
}
