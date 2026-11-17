# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Teamdesk: TanStack Start on Cloudflare Workers + D1, Bun/Turborepo monorepo. Request path: route → tRPC router (`apps/web/src/server/trpc/routers/`) → `@repo/services/<module>` → `@repo/db/<module>`.

## Commands

- `bun test` (all), `bun test <file>`, `bun test -t "<name>"`. In-memory SQLite, no server needed.
- `bun run check` = lint + typecheck. `bun run fix` formats; the pre-commit hook also runs it.
- Wrangler's "About to apply N migration(s)" prompt hangs under `bun run dev` / Turbo. Prefix with `CI=true`, or run `bun run db:apply` in `apps/web` first. Reason: Turbo doesn't forward keyboard input.
- Don't run `*:remote` scripts or `deploy` unless asked. Reason: they change the live deployed app and database.
- Reset the local DB by deleting `apps/web/.wrangler`. Reason: it's not a migration; nothing else resets it.
- After changing `database_id` in `wrangler.jsonc`, run `CI=true bun run db:apply && CI=true bun run db:seed` in `apps/web`. Reason: the local DB is keyed by that id, so the dev server switches to a new, empty one ("no such table").

## Imports and modules

- Browser code imports only `@repo/db/shared`. Reason: every other `@repo/db` / `@repo/services` entry pulls drizzle into the client bundle.
- No barrel files. A new table or service gets `src/<name>.ts` plus its own `exports` line in that package's `package.json`. Reason: without the line the import doesn't resolve.
- A new service also needs a line in `apps/web/src/server/trpc/context.ts`. Reason: that file builds `ctx.services` and is the only place `env.DB` is read.

## Services (`packages/services`)

- Never read `env`, bindings or the request; take a `Database`. Reason: tests swap D1 for `bun:sqlite` through that parameter.
- Export the zod input schema; the router passes it to `.input()` and the service parses again. Reason: callers that skip tRPC must still be validated.
- Throw `ServiceError` subclasses (`src/errors.ts`), never `TRPCError`. Reason: the service layer knows nothing of tRPC; `init.ts` maps the error codes to 404/409/403/400.
- Mutations take the acting member's id first and check it with `requireMember` / `requireAdmin`. Reason: there is no sign-in.
- Don't use `protectedProcedure` for team features. Reason: `ctx.userId` is always null, so it returns 401 every time. The UI sends `actorId` instead (`use-acting-member.ts`).

## Database (`packages/db`)

- Query functions return plain JSON (`id: string`, ISO dates) and keep row types private. Reason: tRPC serializes results as JSON.
- No validation in query functions. Reason: services validate first.
- Datetimes are UTC ISO strings; normalise with `toUtcIso` (`packages/services/src/time.ts`). Reason: the DB stores the `toISOString()` form.
- Schema change: edit `src/schema.ts`, run `bun run generate` in `packages/db`, commit `migrations/` **including `meta/`**. Reason: drizzle diffs against those snapshots; without them it recreates the tables.
- Wrangler applies migrations, not drizzle-kit. `seed.sql` is demo data, not a migration.

## Web app (`apps/web`)

- Load data with `getTrpc()` (`src/integrations/trpc/client.ts`), not `fetch`. Reason: during SSR it runs the router in-process instead of calling its own Worker.
- Keep tRPC routers thin: an input schema plus one service call. Reason: business rules belong in services, where the tests are.
- A fresh deployed database needs `db:seed:remote`. Reason: with no members, nobody can book.

## Known gap

The test "create rejects a due date in the past" (`packages/services/src/tasks.test.ts`) is skipped until `tasks.ts` validates due dates. Re-enable it when you add that check.
