import { Hono } from "hono";
import { cors } from "hono/cors";
import { showRoutes } from "hono/dev";
import { logger } from "hono/logger";
import webhook from "./webhook";
import website from "./website";

export { SqlRunDO } from "./do";

const app = new Hono<{ Bindings: Env }>();

app.use("*", logger());
app.use("*", cors());

app.route("/", website);
app.route("/webhook", webhook);

app.get("/health", (c) => {
	return c.json({
		status: "ok",
		timestamp: new Date().toISOString(),
	});
});

showRoutes(app, {
	verbose: true,
});
export default { fetch: app.fetch };
