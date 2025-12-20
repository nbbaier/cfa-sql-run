import { Hono } from "hono";
import { cors } from "hono/cors";
import { showRoutes } from "hono/dev";
import { logger } from "hono/logger";
import { Example } from "./components/example";
import Layout from "./components/layout";
import { webhook } from "./webhook";

export { SqlRunDO } from "./do";

const app = new Hono<{ Bindings: Env }>();

app.use("*", logger());
app.use("*", cors());

app.get("/", (c) => {
	c.header("Cache-Control", "no-cache, no-store, must-revalidate");

	return c.env.ASSETS.fetch(c.req.raw);
});

app.get("/jsx", (c) => {
	const examples = [
		{
			subject: "Check connection",
			title: "Check connection",
			description: "Simple sanity check that returns the current timestamp.",
			sql: "SELECT datetime() AS now;",
		},
		{
			subject: "Create books table",
			title: "Create books table",
			description: "Creates a basic books table if it does not exist.",
			sql: "CREATE TABLE IF NOT EXISTS books (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, author TEXT NOT NULL, genre TEXT NOT NULL, published_date DATE NOT NULL);",
		},
		{
			subject: "Insert sample books",
			title: "Insert sample books",
			description: "Adds a couple of example rows to the books table.",
			sql: "INSERT INTO books (title, author, genre, published_date) VALUES ('The Great Gatsby', 'F. Scott Fitzgerald', 'Classic', '1925-04-10'), ('1984', 'George Orwell', 'Dystopian', '1949-06-08'), ('To Kill a Mockingbird', 'Harper Lee', 'Southern Gothic', '1960-07-11');",
		},
		{
			subject: "List books",
			title: "List books",
			description: "Returns all books ordered by most recent.",
			sql: "SELECT * FROM books ORDER BY published_date DESC;",
		},
	];

	return c.html(
		<Layout>
			<section class="flex flex-col">
				<p class="text-sm text-neutral-600">
					Send SQLite wrapped in <span class="geist-mono">&lt;sql&gt;</span>{" "}
					tags to:
				</p>
			</section>
			<section class="flex flex-col">
				<h2 class="text-lg font-medium mb-1">Quick examples</h2>
				<p class="text-sm text-neutral-600 mb-4">
					These are some quick examples of how to use SQLite over email.
				</p>
				<div className="flex flex-col gap-4">
					{examples.map((example) => (
						<Example {...example} />
					))}
				</div>
			</section>
		</Layout>,
	);
});

app.get("/health", (c) => {
	return c.json({
		status: "ok",
		timestamp: new Date().toISOString(),
	});
});

app.route("/webhook", webhook);
showRoutes(app, {
	verbose: true,
});
export default { fetch: app.fetch };
