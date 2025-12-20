import type { FC } from "hono/jsx";
import { formatSql } from "../format-sql";

export const Example: FC<{
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
					<h3 class="font-  medium">{props.title}</h3>
					<a class="text-blue-600 text-sm hover:underline" href={mailtoUrl}>
						Send
					</a>
				</div>
				<p class="text-neutral-600 text-xs">{props.description}</p>
			</div>
			<pre class="text-[11px] leading-5 bg-neutral-50 p-3 rounded border border-neutral-200 overflow-x-auto geist-mono">
				<code>
					{"<sql>\n"}
					{`${formatSql(props.sql.trim())}`}
					{"\n</sql>"}
				</code>
			</pre>
		</div>
	);
};
