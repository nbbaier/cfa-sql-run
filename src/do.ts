import { DurableObject } from "cloudflare:workers";
import { Inbound } from "inboundemail";
import { nanoid } from "nanoid";
import type { SqlBlock } from "../types";
import { formatResultsToHtml } from "./format-email";

export class SqlRunDO extends DurableObject {
	sql: SqlStorage;

	constructor(ctx: DurableObjectState, env: Env) {
		super(ctx, env);
		this.sql = ctx.storage.sql;
		console.log("[SqlRunDO] Initializing DO, running schema setup");
		try {
			this.sql.exec(`
				drop table if exists sql_run;
				create table if not exists kv (
					key TEXT PRIMARY KEY,
					value TEXT
				);
			`);
			console.log("[SqlRunDO] Schema setup complete");
		} catch (error) {
			console.error("[SqlRunDO] Schema setup failed:", error);
			throw error;
		}
	}

	runSql(sql: string) {
		console.log("[SqlRunDO] Executing SQL:", sql);
		try {
			const result = this.sql.exec(sql).toArray();
			console.log("[SqlRunDO] SQL success, rows returned:", result.length);
			return result;
		} catch (error) {
			console.error("[SqlRunDO] SQL execution failed:", error);
			throw error;
		}
	}

	async resetSql() {
		const tables = this.sql.exec(`PRAGMA table_list`).toArray();

		for (const table of tables) {
			const nameString = String(table.name ?? "");
			const schema = String(table.schema ?? "");

			if (schema !== "main" || nameString.startsWith("sqlite_")) {
				continue;
			}

			this.sql.exec(`drop table if exists "${nameString}"`);
		}
		const remainingTables = this.sql.exec(`PRAGMA table_list`).toArray();
		return { message: "SQL reset", remainingTables };
	}

	selectTables() {
		return this.sql.exec(`PRAGMA table_list`).toArray();
	}

	async fetch(request: Request): Promise<Response> {
		const { method } = request;

		if (method === "POST") {
			const { emailId, sqlBlocks } = (await request.json()) as {
				fromEmail: string;
				emailId: string;
				sqlBlocks: SqlBlock[];
			};

			const queries = sqlBlocks.map((sqlBlock, index) => ({
				index,
				query: sqlBlock.content,
			}));

			const results: {
				index: number;
				query: string;
				result: Record<string, SqlStorageValue>[];
			}[] = [];

			for (const query of queries) {
				const result = this.runSql(query.query);
				results.push({ index: query.index, query: query.query, result });
			}

			const inbound = new Inbound({ apiKey: this.env.INBOUND_API_KEY });

			const { thread_id } = await inbound.emails.retrieve(emailId);
			if (!thread_id) {
				return new Response(JSON.stringify({ message: "No thread ID found" }), {
					status: 400,
					headers: { "Content-Type": "application/json" },
				});
			}

			await inbound.emails.reply(thread_id, {
				from: "sql@nicobaier.com",
				text: `Here are the results of your SQL queries ${JSON.stringify(queries)}`,
				html: formatResultsToHtml(results),
			});

			return new Response(
				JSON.stringify({ message: "POST request received" }),
				{ status: 200, headers: { "Content-Type": "application/json" } },
			);
		}

		const result = this.runSql(
			`insert into kv (key, value) values ('${nanoid()}', 'test') returning key, value`,
		);

		return new Response(
			JSON.stringify({
				message: "Hello from Durable Object!",
				result: result,
				tables: this.selectTables(),
			}),
			{ status: 200, headers: { "Content-Type": "application/json" } },
		);
	}
}
