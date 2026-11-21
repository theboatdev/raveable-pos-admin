# Getting started

```bash
cd admin
nvm use                      # Node 22
pnpm install
cp .env.example .env.local   # then add the Clerk keys
pnpm dev                     # http://localhost:3001
```

The API must be running too ([backend getting started](../../backend/docs/02-getting-started.md)).

## Becoming the first admin

Nobody is staff until the API says so:

1. In `backend/.env`, set `PLATFORM_ADMIN_EMAILS` to your email (comma-separate several), and restart the API.
2. Open http://localhost:3001 and sign in with that email (it must be verified in Clerk).
3. You are now a platform admin. Invite everyone else from **Settings → Platform staff**.

Anyone else who signs in sees "This account is not platform staff".

**Use a separate account for organising.** Once an account is staff, the organiser app and its API refuse it (`/staff-account`). To try the organiser app or POS as well, sign up there with a different email (an address alias such as `you+organiser@example.com` works).

## Prerequisites

| Tool    | Version                                                                 |
| ------- | ----------------------------------------------------------------------- |
| Node.js | 22.12 or newer (`.nvmrc` says 22)                                       |
| pnpm    | 12.18.0. Run `corepack enable` once, or prefix commands with `corepack` |

## Environment (`.env.local`)

Use the Clerk application staff sign in to: the organisers' one, or a separate staff application whose keys are also set as `PLATFORM_CLERK_*` in the backend ([why](01-platform-admin-scope.md#security-rules)).

| Variable                                          | Value locally                   | Purpose                                       |
| ------------------------------------------------- | ------------------------------- | --------------------------------------------- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`               | From Clerk Dashboard → API keys | Clerk in the browser                          |
| `CLERK_SECRET_KEY`                                | From Clerk Dashboard → API keys | Clerk on the server                           |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL`                   | `/sign-in`                      | Where Clerk sends signed-out users            |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL`                   | `/sign-up`                      | Where invitation emails land                  |
| `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` | `/overview`                     | After sign-in, when there is no return URL    |
| `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL` | `/overview`                     | After accepting an invitation                 |
| `NEXT_PUBLIC_API_URL`                             | `http://localhost:4000`         | Raveable API, called from the Next.js server  |
| `API_URL`                                         | Optional                        | Overrides `NEXT_PUBLIC_API_URL` on the server |

`.env.local` is gitignored.

## Scripts

| Command                             | What it does                             |
| ----------------------------------- | ---------------------------------------- |
| `pnpm dev`                          | Dev server on port 3001                  |
| `pnpm build`                        | Production build                         |
| `pnpm start`                        | Serves the production build on port 3001 |
| `pnpm lint`                         | ESLint                                   |
| `pnpm typecheck`                    | `next typegen` then `tsc --noEmit`       |
| `pnpm test` / `pnpm test:watch`     | Vitest                                   |
| `pnpm format` / `pnpm format:check` | Prettier                                 |

Port 3001 keeps it clear of the organiser app on 3000 and the API on 4000, so all three run together.
