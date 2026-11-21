# Raveable admin docs

The internal platform console. Raveable staff use it to see every tenant, suspend or reactivate them, manage platform staff and settings, and review the audit log. It is a Next.js 16 app on port 3001 that talks to the API's `/v1/platform` endpoints. Built in Post-MVP (14 Nov 2026).

| Doc                                                   | What it covers                                                                |
| ----------------------------------------------------- | ----------------------------------------------------------------------------- |
| [01 Platform admin scope](01-platform-admin-scope.md) | What the console does and does not do, its screens, roles, the security rules |
| [02 Getting started](02-getting-started.md)           | Prerequisites, env, the first admin, scripts                                  |
| [03 Architecture](03-architecture.md)                 | Folder layout, calling the API, how it differs from the organiser app         |
| [04 Testing and quality](04-testing-and-quality.md)   | Vitest, ESLint, type checking, Prettier                                       |

## Shared docs (backend repo)

- [Development roadmap](../../backend/docs/00-development-roadmap.md)
- [ADR-0009: the platform console](../../backend/docs/adr/0009-platform-console.md): staff access, auditing, suspension, settings
- [API spec: Platform](../../backend/docs/08-api-spec.md#platform-post-mvp)
- [Auth and tenancy](../../backend/docs/05-auth-and-tenancy.md#platform-staff-and-cross-tenant-access)
- [Open questions](../../backend/docs/open-questions.md)
