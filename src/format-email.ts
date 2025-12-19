export type QueryResult = {
	index: number;
	query: string;
	result: Record<string, unknown>[];
	error?: string;
};

export function formatResultsToHtml(results: QueryResult[]): string {
	const successCount = results.filter((r) => !r.error).length;
	const totalCount = results.length;
	const allSuccess = successCount === totalCount;

	const styles = `
		<style>
			body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
			h1 { font-size: 24px; font-weight: bold; margin-bottom: 8px; }
			.summary { color: #666; margin-bottom: 24px; }
			.query-section { margin-bottom: 32px; }
			h2 { font-size: 18px; font-weight: bold; margin-bottom: 12px; }
			.sql-code { font-family: 'SF Mono', Monaco, 'Courier New', monospace; font-size: 14px; margin-bottom: 12px; }
			.row-count { color: #333; margin-bottom: 12px; }
			.error { color: #dc2626; }
			table { border-collapse: collapse; }
			th { font-weight: bold; text-align: left; padding: 8px 24px 8px 0; }
			td { padding: 8px 24px 8px 0; }
			a { color: #2563eb; }
		</style>
	`;

	const blocks = results.map(({ index, query, result, error }) => {
		let contentHtml: string;

		if (error) {
			contentHtml = `<p class="error">✗ Error: ${error}</p>`;
		} else if (result.length === 0) {
			contentHtml =
				'<p class="row-count">✓ Query executed successfully (no rows returned)</p>';
		} else {
			const columns = Object.keys(result[0]);
			const headerRow = columns.map((col) => `<th>${col}</th>`).join("");
			const dataRows = result
				.map((row) => {
					const cells = columns
						.map((col) => {
							const value = row[col] ?? "NULL";
							const isEmail =
								typeof value === "string" &&
								value.includes("@") &&
								value.includes(".");
							return `<td>${isEmail ? `<a href="mailto:${value}">${value}</a>` : value}</td>`;
						})
						.join("");
					return `<tr>${cells}</tr>`;
				})
				.join("");

			contentHtml = `
				<p class="row-count">✓ Rows returned: ${result.length}</p>
				<table>
					<thead><tr>${headerRow}</tr></thead>
					<tbody>${dataRows}</tbody>
				</table>
			`;
		}

		return `
			<div class="query-section">
				<h2>Query ${index + 1}</h2>
				<p class="sql-code">${query}</p>
				${contentHtml}
			</div>
		`;
	});

	const headerIcon = allSuccess ? "✓" : "⚠";
	const summaryText = allSuccess
		? `All ${totalCount} ${totalCount === 1 ? "query" : "queries"} executed successfully`
		: `${successCount} of ${totalCount} queries executed successfully`;

	return `<!DOCTYPE html><html><head>${styles}</head><body>
		<h1>${headerIcon} SQL Execution Results</h1>
		<p class="summary">${summaryText}</p>
		${blocks.join("")}
	</body></html>`;
}
