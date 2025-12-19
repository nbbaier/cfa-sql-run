import alchemy from "alchemy";
import {
	DurableObjectNamespace,
	KVNamespace,
	Worker,
	WranglerJson,
} from "alchemy/cloudflare";
import type { SqlRunDO } from "./src/do";

const app = await alchemy("cfa-sql-run");

const kv = await KVNamespace("kv", {
	title: `${app.name}-kv`,
});

const durableObject = DurableObjectNamespace<SqlRunDO>("durableObject", {
	className: "SqlRunDO",
	sqlite: true,
});

export const worker = await Worker("worker", {
	entrypoint: "src/index.ts",
	bindings: {
		KV: kv,
		DO: durableObject,
		INBOUND_API_KEY: alchemy.secret(process.env.INBOUND_API_KEY),
	},
});

await WranglerJson({ worker });

console.log(worker.url);

await app.finalize();
