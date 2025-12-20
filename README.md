# CFA SQL Run

A Cloudflare Workers application for executing SQL queries with email-based webhooks, built with Hono, Alchemy, and Durable Objects.

## Quick Start

```bash
bun install
bun run dev
```

## Commands

| Command           | Description                    |
| ----------------- | ------------------------------ |
| `bun run dev`     | Start local development server |
| `bun run deploy`  | Deploy to Cloudflare           |
| `bun run destroy` | Tear down deployed resources   |
| `bun run check`   | Type check with TypeScript     |

## Architecture

### Infrastructure (alchemy.run.ts)

- **Worker**: HTTP endpoint at `sql.nicobaier.com`, handles API requests and webhooks
- **KV Namespace**: Data storage and caching
- **Durable Object**: Stateful SQL execution with SQLite persistence

### Bindings

- `KV`: Key-Value store for data persistence
- `DO`: Durable Object namespace for stateful operations
- `INBOUND_API_KEY`: Secure API key for email webhooks

### Routes

- `GET /health`: Health check endpoint
- `/webhook`: Email webhook handler with SQL execution
- `/`: Main website and API interface

## Configuration

Create a `.env` file:

```
INBOUND_API_KEY=your_api_key_here
```

## Development

The project uses:

- **Hono** for HTTP routing and middleware
- **Alchemy** for infrastructure as code on Cloudflare
- **Zod** for request validation
- **sql-formatter** for SQL query formatting
- **InboundEmail** SDK for webhook integration

## Type Safety

Environment types are auto-generated in `types/env.d.ts` based on bindings defined in `alchemy.run.ts`.

## Resources

- [Alchemy Documentation](https://alchemy.run)
- [Hono Documentation](https://hono.dev)
- [Cloudflare Workers](https://developers.cloudflare.com/workers)
