import { isInboundWebhook } from "@inboundemail/sdk";
import { Hono } from "hono";
import { validator } from "hono/validator";
import { extractSqlBlocks, hasSqlBlock } from "./parse-sql";

export const webhook = new Hono<{ Bindings: Env }>();

webhook.post(
	"/",
	validator("json", (value, c) => {
		if (!isInboundWebhook(value)) {
			return c.text("Invalid inbound webhook!", 400);
		}
		return value;
	}),
	async (c) => {
		const { email } = c.req.valid("json");
		const fromEmail = email.from?.addresses[0].address;
		const { text } = email.cleanedContent;

		if (!fromEmail) {
			return c.text("No from email found in email", 400);
		}

		if (!text || text.length === 0) {
			return c.text("No text found in email", 400);
		}

		if (!hasSqlBlock(text)) {
			return c.text("No SQL blocks found in email", 400);
		}

		const sqlBlocks = extractSqlBlocks(text);

		const id = c.env.DO.idFromName(fromEmail);
		const obj = c.env.DO.get(id);

		await obj.fetch("http://internal/process-email", {
			method: "POST",
			body: JSON.stringify({ fromEmail, emailId: email.id, sqlBlocks }),
		});

		return c.json({
			received: true,
		});
	},
);
