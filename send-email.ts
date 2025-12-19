import { Inbound } from "inboundemail";
import { formatResultsToHtml, type QueryResult } from "./src/format-email";

const apiKey = process.env.INBOUND_API_KEY;
if (!apiKey) {
	console.error("INBOUND_API_KEY environment variable is required");
	process.exit(1);
}

const inbound = new Inbound({ apiKey });

const sampleResults: QueryResult[] = [
	{
		index: 0,
		query: "SELECT * FROM users ORDER BY created_at DESC;",
		result: [
			{
				id: 1,
				name: "Alice Johnson",
				email: "alice@example.com",
				created_at: "2025-01-15 10:30:00",
			},
			{
				id: 2,
				name: "Bob Smith",
				email: "bob@example.com",
				created_at: "2025-01-14 14:22:00",
			},
			{
				id: 3,
				name: "Charlie Brown",
				email: "charlie@example.com",
				created_at: "2025-01-13 09:15:00",
			},
		],
	},
	{
		index: 1,
		query: "SELECT COUNT(*) as total FROM orders WHERE status = 'completed';",
		result: [{ total: 42 }],
	},
];

async function sendFormattedEmail(to: string, results: QueryResult[]) {
	const html = formatResultsToHtml(results);

	const response = await inbound.emails.send({
		from: "sql@nicobaier.com",
		to: [to],
		subject: "SQL Execution Results",
		html,
		text: `SQL query results: ${results.length} queries executed`,
	});

	console.log("Email sent:", response);
	return response;
}

const recipient = process.argv[2];

if (!recipient) {
	console.log("Usage: bun send-email.ts <recipient-email>");
	console.log("\nGenerating HTML preview to stdout instead...\n");
	console.log(formatResultsToHtml(sampleResults));
} else {
	await sendFormattedEmail(recipient, sampleResults);
	console.log(`Formatted email sent to ${recipient}`);
}
