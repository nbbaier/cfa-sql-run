import alchemy from "alchemy";
import {
	Assets,
	DurableObjectNamespace,
	KVNamespace,
	Worker,
	WranglerJson,
} from "alchemy/cloudflare";
import { CloudflareStateStore } from "alchemy/state";
import type { SqlRunDO } from "./src/do";

const app = await alchemy("cfa-sql-run", {
	stateStore: (scope) => new CloudflareStateStore(scope),
});

const kv = await KVNamespace("kv", {
	title: `${app.name}-kv`,
});

const durableObject = DurableObjectNamespace<SqlRunDO>("durableObject", {
	className: "SqlRunDO",
	sqlite: true,
});

const staticAssets = await Assets({
	path: "./src/assets",
});

export const worker = await Worker("worker", {
	entrypoint: "src/index.tsx",
	domains: ["sql.nicobaier.com"],
	bindings: {
		ASSETS: staticAssets,
		KV: kv,
		DO: durableObject,
		INBOUND_API_KEY: alchemy.secret(process.env.INBOUND_API_KEY),
	},
});

await WranglerJson({ worker });

console.log({ worker: worker.url });

await app.finalize();
