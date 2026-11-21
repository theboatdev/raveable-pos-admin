# Testing and code quality

Run these before you push:

```bash
pnpm format:check && pnpm lint && pnpm typecheck && pnpm test && pnpm build
```

The repo still has `.github/workflows/ci.yml`, which runs the same steps on GitHub. GitHub Actions is not in use for Raveable (the backend's workflow was removed), so run the checks locally.

## Tests (Vitest)

- Files: `src/**/*.test.ts` and `src/**/*.test.tsx`. Environment: Node. The `@/` alias works.

`src/lib/navigation.test.ts` covers:

| Case               | Checks                                                                           |
| ------------------ | -------------------------------------------------------------------------------- |
| Top-level sections | `/overview`, `/tenants/org_2abc` and `/audit?actor=u_1` highlight the right item |
| Unknown paths      | `/` and `/sign-in` highlight nothing                                             |
| Menu integrity     | Every item has a unique `href`                                                   |
| Tenant links       | `tenantHref()` builds tenant page paths and encodes each segment                 |
| Tenant tabs        | Every tab has a unique path segment                                              |

`src/lib/audit.test.ts` covers the audit labels: known actions are described, unknown ones pass through, reads are told from changes, details are summarised.

The platform API itself (staff access, auditing, suspension, settings, reading, editing, exporting and deleting tenants) is tested in the backend's `test/platform.test.js` and `test/platform-tenants.test.js`. Components have no tests yet.

## Lint, types and formatting

Same setup as the organiser app:

- **ESLint:** `eslint-config-next` core-web-vitals plus TypeScript rules.
- **Types:** `pnpm typecheck` runs `next typegen`, then `tsc --noEmit` in strict mode.
- **Prettier:** single quotes, trailing commas, 100-character lines, Tailwind class sorting.
