import { Hono } from "hono";
import type { FC } from "hono/jsx";
import { formatSql } from "./lib/sql";

const website = new Hono<{ Bindings: Env }>();

const SqlBlock = () => {
	return (
		<span class="bg-neutral-50 border border-neutral-200 geist-mono text-xs px-1 py-0.5 rounded">
			&lt;sql&gt;...&lt;/sql&gt;
		</span>
	);
};

const Example: FC<{
	title: string;
	description: string;
	subject: string;
	sql: string;
}> = (props) => {
	const encodedSubject = encodeURIComponent(props.subject);
	const encodedBody = encodeURIComponent(
		`<sql>${props.sql.trim().replaceAll(/\s+/g, " ")}</sql>`,
	);
	const mailtoUrl = `mailto:sql@nicobaier.com?subject=${encodedSubject}&body=${encodedBody}`;
	return (
		<div class="rounded border border-black custom-box-shadow px-4 pb-4 pt-3 bg-white">
			<div class="mb-4">
				<div class="flex items-center justify-between mb-1">
					<h3 class="text-base font-medium">{props.title}</h3>
					<a class="text-blue-600 text-sm hover:underline" href={mailtoUrl}>
						compose
					</a>
				</div>
				<p class="text-neutral-600 text-sm">{props.description}</p>
			</div>
			<pre class="text-[11.25px] leading-5 bg-neutral-50 p-3 rounded border border-neutral-200 overflow-x-auto geist-mono">
				<code>
					{"<sql>\n"}
					{`${formatSql(props.sql.trim())}`}
					{"\n</sql>"}
				</code>
			</pre>
		</div>
	);
};

const examples = [
	{
		subject: "Check connection",
		title: "Check connection",
		description: "Simple sanity check that returns the current timestamp",
		sql: "SELECT datetime() AS now;",
	},
	{
		subject: "Create books table",
		title: "Create books table",
		description: "Creates a basic books table if it does not exist",
		sql: "CREATE TABLE IF NOT EXISTS books (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, author TEXT NOT NULL, genre TEXT NOT NULL, published_date DATE NOT NULL);",
	},
	{
		subject: "Insert sample books",
		title: "Insert sample books",
		description: "Adds a couple of example rows to the books table",
		sql: "INSERT INTO books (title, author, genre, published_date) VALUES ('The Great Gatsby', 'F. Scott Fitzgerald', 'Classic', '1925-04-10'), ('1984', 'George Orwell', 'Dystopian', '1949-06-08'), ('To Kill a Mockingbird', 'Harper Lee', 'Southern Gothic', '1960-07-11');",
	},
	{
		subject: "List books",
		title: "List books",
		description: "Returns all books ordered by most recent",
		sql: "SELECT * FROM books ORDER BY published_date DESC;",
	},
];

website.get("/", (c) => {
	return c.html(
		<html lang="en">
			<head>
				<meta charset="UTF-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<script src="https://cdn.tailwindcss.com"></script>
				<title>SQLite over email</title>
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin />
				<link
					href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@100..900&family=Geist:wght@100..900&display=swap"
					rel="stylesheet"
				/>
				<style
					dangerouslySetInnerHTML={{
						__html: `
      .geist-regular { font-family: "Geist", sans-serif; font-optical-sizing: auto; font-weight: 400; font-style: normal; }
   .geist-mono { font-family: "Geist Mono", monospace; font-optical-sizing: auto; font-weight: 400; font-style: normal; }
   .custom-box-shadow { box-shadow: 3.5px 3.5px 0px 0px #dddddd; }
   `,
					}}
				/>
			</head>
			<body>
				<div class="geist-regular min-h-screen px-6 py-10 sm:px-8 sm:py-14">
					<main class="mx-auto max-w-2xl flex flex-col gap-8 ">
						<h1 class="text-2xl font-semibold tracking-normal">
							SQLite over email
						</h1>
						<div class="flex flex-col gap-8">
							{" "}
							<section class="flex flex-col">
								<h2 class="text-lg font-medium mb-1">What is this?</h2>
								<div class="text-base leading-[1.75] text-neutral-600">
									An experiment based on{" "}
									<a
										href="https://sqlmail.dev"
										class="text-blue-600 hover:underline"
									>
										sqlmail.dev
									</a>
									. Send an email Send an email containing SQLite blocks fenced
									by <SqlBlock /> tags to:{" "}
									<div class="rounded border border-black custom-box-shadow px-3 py-2 bg-white font-medium flex items-center justify-between my-4">
										<span class="select-all">sql@nicobaier.com</span>
										<button
											type="button"
											class="font-normal text-blue-600 text-sm hover:underline"
											onclick={`navigator.clipboard.writeText("sql@nicobaier.com")`}
										>
											copy
										</button>
									</div>
									This will spin up a{" "}
									<a
										href="https://developers.cloudflare.com/durable-objects/api/sqlite-storage-api/"
										class="text-blue-600 hover:underline"
									>
										SQLite database
									</a>{" "}
									in a Durable Object and run the queries against it. The beauty
									of this architecture is that each email address gets its own
									isolated database.
								</div>
							</section>
							<section class="flex flex-col">
								<h2 class="text-lg font-medium mb-1">What can I do?</h2>
								<div class="text-base leading-[1.75] text-neutral-600">
									Anything you can do with SQLite, you can do here! I wouldn't
									put anything sensitive or crucial, but it's a fun way to
									experiment with SQLite. Here are some quick examples.
								</div>
								<div className="flex flex-col gap-4 my-4">
									{examples.map((example) => (
										<Example {...example} />
									))}
								</div>
								<div class="text-sm leading-[1.75] text-neutral-600">
									Tips: Emails can contain multiple <SqlBlock /> blocks. Queries
									run top-to-bottom. Anything outside of <SqlBlock /> blocks
									will be ignored.
								</div>
							</section>
						</div>
					</main>
				</div>
			</body>
		</html>,
	);
});

export default website;
