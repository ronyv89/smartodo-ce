# Auth JWT Design

**Date:** 2026-04-24
**Status:** Approved
**Scope:** `apps/api`, `packages/db`

## Overview

Backend authentication for the Fastify REST API using JWT access + refresh token pairs. Local email/password is the first auth method. The schema is designed from day one to accommodate future OAuth providers without touching the user or credential tables. Password reset is included. Email verification is scaffolded in the schema but the flow is deferred.

## Data Model

Five new tables in `@repo/db`. All IDs are UUIDs via `gen_random_uuid()`. All timestamps are `timestamp with time zone`.

### `users`

Pure identity — no auth-method details, no role.

| Column | Type | Constraints |
|---|---|---|
| `id` | uuid | PK, default `gen_random_uuid()` |
| `email` | varchar(255) | not null, unique |
| `email_verified_at` | timestamptz | nullable — placeholder for future verification flow |
| `created_at` | timestamptz | not null, default `now()` |
| `updated_at` | timestamptz | not null, default `now()` |

### `user_credentials`

Local auth only. One row per user that registered with email/password.

| Column | Type | Constraints |
|---|---|---|
| `user_id` | uuid | PK + FK → `users.id`, on delete cascade |
| `password_hash` | varchar(255) | not null (bcrypt, cost 12) |
| `created_at` | timestamptz | not null, default `now()` |
| `updated_at` | timestamptz | not null, default `now()` |

### `user_identities`

OAuth provider links. Schema is ready; no OAuth logic is implemented yet.

| Column | Type | Constraints |
|---|---|---|
| `id` | uuid | PK |
| `user_id` | uuid | FK → `users.id`, on delete cascade |
| `provider` | varchar(50) | not null — e.g. `'google'`, `'github'` |
| `provider_user_id` | varchar(255) | not null |
| `provider_data` | jsonb | nullable — extra metadata from provider |
| `created_at` | timestamptz | not null, default `now()` |
| `updated_at` | timestamptz | not null, default `now()` |

Unique constraint: (`provider`, `provider_user_id`).

### `sessions`

Refresh token store. Stores a sha-256 hash of the raw token — never the token itself.

| Column | Type | Constraints |
|---|---|---|
| `id` | uuid | PK |
| `user_id` | uuid | FK → `users.id`, on delete cascade |
| `refresh_token_hash` | varchar(255) | not null, unique |
| `expires_at` | timestamptz | not null |
| `revoked_at` | timestamptz | nullable — set on logout or token rotation |
| `created_at` | timestamptz | not null, default `now()` |

### `password_reset_tokens`

One-time tokens for the forgot-password flow.

| Column | Type | Constraints |
|---|---|---|
| `id` | uuid | PK |
| `user_id` | uuid | FK → `users.id`, on delete cascade |
| `token_hash` | varchar(255) | not null, unique — sha-256 of raw token |
| `expires_at` | timestamptz | not null — 1 hour TTL |
| `used_at` | timestamptz | nullable — set on consumption |
| `created_at` | timestamptz | not null, default `now()` |

## API Endpoints

All routes under `/auth`. Protected routes require `Authorization: Bearer <access_token>`.

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | — | Create user + credentials, return token pair |
| `POST` | `/auth/login` | — | Verify credentials, return token pair |
| `POST` | `/auth/refresh` | — | Rotate refresh token, return new token pair |
| `POST` | `/auth/logout` | Bearer | Revoke current session |
| `POST` | `/auth/forgot-password` | — | Return a password reset token |
| `POST` | `/auth/reset-password` | — | Consume reset token, update password |
| `GET` | `/auth/me` | Bearer | Return current user profile |

### Token shapes

**Access token** — JWT, 15 min default, signed with `JWT_ACCESS_SECRET`:
```json
{ "sub": "<userId>", "email": "<email>", "sid": "<sessionId>", "iat": 0, "exp": 0 }
```

**Refresh token** — JWT, 7 days default, signed with `JWT_REFRESH_SECRET`:
```json
{ "sub": "<sessionId>", "iat": 0, "exp": 0 }
```

The raw refresh token is returned to the client. Its sha-256 hash is stored in `sessions.refresh_token_hash`.

### Token rotation

`POST /auth/refresh` atomically revokes the current session row and creates a new one, then issues a fresh token pair. A stolen refresh token becomes invalid after the legitimate client uses it next.

### Forgot-password flow

`POST /auth/forgot-password` generates a random token, stores its hash with a 1-hour TTL, and returns `{ resetToken }` in the response body. Email delivery is out of scope — the caller uses the token directly with `POST /auth/reset-password`. When email is added, this endpoint changes to return `204` and sends the token via email instead.

## Environment Variables

Added to `apps/api/.env` and `.env.example`:

| Variable | `.env` (local) | `.env.example` |
|---|---|---|
| `JWT_ACCESS_SECRET` | 64-char random hex | `change_me_access_secret` |
| `JWT_REFRESH_SECRET` | 64-char random hex | `change_me_refresh_secret` |
| `JWT_ACCESS_EXPIRES_IN` | `15m` | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | `7d` | `7d` |

`parseApiEnv` in `apps/api/src/config/env.ts` is extended to validate and expose these four values. Both secrets are required (no default); missing either throws at startup.

## File Structure

```
apps/api/src/
  lib/
    tokens.ts          # signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken
    password.ts        # hashPassword, verifyPassword (bcrypt cost 12)
    crypto.ts          # sha256Hash(raw: string): string
  plugins/
    authenticate.ts    # Fastify preHandler — verifies Bearer, decorates req.user
  routes/
    health.ts          # existing, unchanged
    auth/
      index.ts         # registers sub-routes under /auth prefix
      register.ts
      login.ts
      refresh.ts
      logout.ts
      forgot-password.ts
      reset-password.ts
      me.ts
```

`app.ts` registers `authenticate` as a Fastify plugin (for decoration) and `authRoutes` with `{ prefix: '/auth' }`.

### `req.user` shape

```ts
interface AuthUser {
  id: string;
  email: string;
  sessionId: string;
}
```

Declared via Fastify's type augmentation in `plugins/authenticate.ts`. Future RBAC (workspace roles) will be resolved by separate preHandlers that query `workspace_members` using `req.user.id` — no changes needed to this shape or the token payload.

## Error Handling

| Scenario | HTTP status |
|---|---|
| Email already registered | 409 Conflict |
| Invalid credentials | 401 Unauthorized |
| Invalid / expired access token | 401 Unauthorized |
| Invalid / expired / revoked refresh token | 401 Unauthorized |
| Invalid / expired / used reset token | 400 Bad Request |
| Validation errors (missing fields, bad format) | 400 Bad Request |

Fastify's built-in JSON schema validation handles request shape errors. Auth-specific errors are thrown with `fastify.httpErrors` (via `@fastify/sensible`).

## Testing

- Each route handler has a Jest test using `app.inject()` — no real server, no real DB.
- DB calls are mocked at the `db` singleton level.
- `lib/tokens.ts`, `lib/password.ts`, and `lib/crypto.ts` are unit-tested independently.
- Coverage target: 100% statements/branches/functions/lines (matching existing `@repo/db` standard).

## Future Extension Points

- **OAuth (Google, GitHub):** add `routes/auth/oauth/<provider>.ts`, create a `user_identities` row on first login, create a `user_credentials`-free user. Existing local auth files unchanged.
- **Email verification:** `email_verified_at` column is already in `users`. Add a token table and a `POST /auth/verify-email` endpoint. Change `/auth/forgot-password` to return `204` and send email.
- **Workspace RBAC:** a `workspace_members` table with `workspace_id`, `user_id`, `role`. A `requireWorkspaceRole(role)` preHandler reads `req.user.id` and the route param — no token changes needed.
