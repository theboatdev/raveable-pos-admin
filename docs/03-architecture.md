# Admin architecture

The admin console uses the same stack and conventions as the organiser app: Next.js 16 with Cache Components, React 19, Tailwind 4, shadcn/ui, Clerk and TypeScript. It is smaller: one navigation level, no organisations, no POS.

**Before writing Next.js code, read `AGENTS.md`.** Next.js 16 differs from older versions (for example `proxy.ts` replaces `middleware.ts`). The matching docs ship in `node_modules/next/dist/docs/`.

## Folder layout

```
admin/
├── src/
│   ├── proxy.ts                      Route guard: every route except sign-in and sign-up needs a Clerk session
│   ├── app/
│   │   ├── layout.tsx                Root: fonts, ClerkProvider, TooltipProvider, "· Raveable Admin" titles
│   │   ├── globals.css               Tailwind 4 + shadcn theme tokens
│   │   ├── sign-in/, sign-up/        Clerk <SignIn>; <SignUp> for accepting invitations only
│   │   ├── no-access/                Signed in but not platform staff
│   │   └── (console)/                Console pages (route group: no URL segment)
│   │       ├── layout.tsx            Sidebar + "Platform admin" header with your role
│   │       ├── error.tsx             "This page could not load"
│   │       ├── overview/ audit/ settings/ tenants/
│   │       └── tenants/[tenantId]/   Overview, members/, customers/[customerId]/, events/[eventId]/orders/[orderId]/,
│   │                                 audit/, settings/, export/route.ts (streams the JSON download)
│   ├── components/
│   │   ├── ui/                       shadcn/ui primitives (same set as frontend)
│   │   ├── shell/admin-sidebar.tsx   Sidebar: "Raveable Platform · Internal", nav, user menu
│   │   ├── console/                  Audit table, pager, tenant shell (header + tabs), tenant actions, member manager,
│   │   │                             tenant settings form, delete tenant, staff manager, settings forms
│   │   └── page-header.tsx, stat.tsx, form-field.tsx, form-status.tsx, submit-button.tsx, confirm-action.tsx, notice.tsx
│   ├── hooks/use-mobile.ts           Viewport < 768 px, for the sidebar
│   └── lib/
│       ├── api/server.ts             platformApi(): server-only client for /v1/platform; getStaff(); tenantRead()
│       ├── api/types.ts, errors.ts   API shapes; ApiError and form ActionState
│       ├── actions/platform.ts       Server Actions: tenants (edit, members, suspend, delete), settings, flags, staff
│       ├── audit.ts                  Plain-English labels for audit actions (tested)
│       ├── format.ts                 Money, dates (Sri Lanka time), labels
│       ├── navigation.ts             ADMIN_NAV, getActiveNav(), TENANT_TABS, tenantHref() (tested)
│       └── utils.ts                  cn() class-name helper
├── next.config.ts                    Same as frontend; redirects "/" to /overview
├── components.json                   shadcn/ui config (same as frontend)
└── vitest.config.mts
```

## Navigation

`src/lib/navigation.ts` defines one flat menu:

| Key        | Title     | Path        |
| ---------- | --------- | ----------- |
| `overview` | Overview  | `/overview` |
| `tenants`  | Tenants   | `/tenants`  |
| `audit`    | Audit log | `/audit`    |
| `settings` | Settings  | `/settings` |

`getActiveNav(pathname)` picks the active item from the first path segment, so `/tenants/org_2abc` highlights Tenants. Unknown paths highlight nothing. The menu reads the URL, so it renders inside `<Suspense>` with a fixed-size skeleton fallback.

Pages about one tenant share `TenantShell` (`components/console/tenant-shell.tsx`): a back link, the tenant's name and status, and tabs (`TENANT_TABS`: Overview, Members, Customers, Audit trail, Settings). Each page passes in the `tenant` its own API response carries, so drawing the frame costs no extra (audited) call. Events and orders open under Overview; customer pages under Customers. Pages load with `tenantRead()`, which turns a 404 into the not-found page and sends a tenant whose data is deleted back to its overview.

## How it differs from the organiser app

|                        | `frontend`                                        | `admin`                              |
| ---------------------- | ------------------------------------------------- | ------------------------------------ |
| Port                   | 3000                                              | 3001                                 |
| Users                  | Organisers and cashiers                           | Raveable staff                       |
| Sign-up                | Yes                                               | No, invite only                      |
| Clerk application      | Organisers'                                       | Organisers', or a separate staff one |
| Organisation switcher  | Yes, `hidePersonal`                               | None                                 |
| Navigation             | Two levels (organisation, event) with breadcrumbs | One flat menu, no breadcrumbs        |
| Redirect after sign-in | `/dashboard`                                      | `/overview`                          |
| API area               | `/v1/...`                                         | `/v1/platform/...`                   |

## Calling the API

The console never calls the API from the browser. Async Server Components call `platformApi()` (`src/lib/api/server.ts`) inside `<Suspense>`; it sends the Clerk session token to `/v1/platform`. Changes go through Server Actions in `src/lib/actions/platform.ts`, which call `refresh()` on success.

- `NOT_PLATFORM_STAFF` redirects to `/no-access`; `401` to sign-in.
- `getStaff()` (`GET /v1/platform/me`, cached per request) gives your role. Admin-only controls are hidden from support staff, but the API enforces roles.
- Every page load is an audited read on the API. Pages fetch only what they show.

## Rendering rules and UI kit

The same as the organiser app; see [frontend docs/04-architecture.md](../../frontend/docs/04-architecture.md#rendering-rules). In short:

- Anything that reads the URL goes inside `<Suspense>` with a fixed-size fallback.
- Browser state goes through `useSyncExternalStore`.
- shadcn/ui primitives in `components/ui`, added with `pnpm shadcn add <name>`.
- `cn()` comes from the `cn` package.

## Adding a page

1. Create `src/app/(console)/<name>/page.tsx` and export `metadata = { title: '...' }`. Use `<PageBody>` and `<PageHeader>`, and load data in an async component inside `<Suspense>`.
2. If it needs a new API endpoint, add it to the backend's `src/routes/platform.js` with an audit entry.
3. If it belongs in the menu, add it to `ADMIN_NAV` and its icon to `ICONS` in `admin-sidebar.tsx`.
4. Add a test case to `navigation.test.ts`, and a row to the screens table in [01 Platform admin scope](01-platform-admin-scope.md#screens).
