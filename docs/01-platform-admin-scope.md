# Platform admin scope

The admin console is where Raveable staff see and manage every organiser tenant. Staff can read everything in a tenant; platform admins can also edit it, manage its members, export its data, suspend it and delete it. Every staff action, including each look at a tenant's data, is audited. Design decisions: backend [ADR-0009](../../backend/docs/adr/0009-platform-console.md) (the console), [ADR-0010](../../backend/docs/adr/0010-database-per-tenant.md) (a database per tenant) and [ADR-0011](../../backend/docs/adr/0011-staff-and-organiser-accounts.md) (separate accounts, tenant management).

## Who uses it

Raveable platform staff only, in two roles:

| Role           | Can                                                                                                      |
| -------------- | -------------------------------------------------------------------------------------------------------- |
| Platform admin | Everything below: change, export and delete tenants, manage their members, change settings, manage staff |
| Support        | Look at everything, including every tenant's data; change nothing                                        |

Organisers and cashiers never use it; their tools are in the `frontend` app. Staff accounts cannot use the `frontend` app either: the API refuses them there. Someone who is both staff and an organiser needs two accounts.

## Screens

| Path                                          | Screen            | What it does                                                                                                                         |
| --------------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `/`                                           | —                 | Redirects to `/overview`                                                                                                             |
| `/sign-in`                                    | Sign in           | Clerk sign-in                                                                                                                        |
| `/sign-up`                                    | Accept invitation | Completes a staff invitation from email. Sign-up is invitation-only                                                                  |
| `/no-access`                                  | No access         | Signed in, but not on the staff list (for example an organiser)                                                                      |
| `/overview`                                   | Overview          | Tenants (active, suspended, new, deleted), active events, open cash drawers and cashiers selling, recorded sales volume per currency |
| `/tenants`                                    | Tenants           | Every organisation with status, owners, events, members and last activity. Search by name or id; filter by status, including deleted |
| `/tenants/[tenantId]`                         | Tenant overview   | Status, database name, sales, members, gate POS set up and drawers open, and events. Admins: export data, suspend or reactivate      |
| `/tenants/[tenantId]/members`                 | Members           | The tenant's people and roles. Admins: change roles (transfer ownership), remove people                                              |
| `/tenants/[tenantId]/customers`               | Customers         | The tenant's customers, searchable, with each one's purchases                                                                        |
| `/tenants/[tenantId]/events/[eventId]`        | Event             | Ticket types, each gate's POS (allocations, bands, opening cash, who sells there), sales figures and cash drawers                    |
| `/tenants/[tenantId]/events/[eventId]/orders` | Orders            | The event's latest 200 orders, filtered by status, each opening to its items, payment, customer, tickets and any void or refund      |
| `/tenants/[tenantId]/audit`                   | Audit trail       | What the tenant's people and Raveable staff did                                                                                      |
| `/tenants/[tenantId]/settings`                | Settings          | The tenant's name and settings, as its Owner sees them. Admins: edit; delete the tenant                                              |
| `/tenants/[tenantId]/export`                  | (download)        | Admins: the tenant's whole database as JSON                                                                                          |
| `/audit`                                      | Audit log         | Every platform-staff action, including each read. Filter by tenant, action or staff member                                           |
| `/settings`                                   | Settings          | Platform staff (invite, role, remove), defaults for new tenants, feature flags                                                       |

## In scope

- Seeing every tenant and its headline numbers, including deleted tenants' records.
- Reading everything in a tenant: members, events, ticket types, gates and their POS, sales, cash drawers, orders, customers and its audit trail.
- Editing a tenant's name and settings, with the same rules as its Owner (the currency is locked once ticket types are priced). Renaming also renames it in Clerk.
- Changing a member's role or removing them. A tenant always keeps at least one Owner; to transfer ownership, make the new person Owner, then change the old Owner's role.
- Exporting a tenant's whole database as one JSON file (MongoDB Extended JSON).
- Suspending and reactivating a tenant, with a reason.
- Deleting a tenant, after typing its exact name.
- Managing platform staff, defaults for new tenants and feature flags.
- Reviewing the platform audit log.

## Out of scope

- Creating tenants. Organisers sign up and create their organisation in the `frontend` app; its database is created then.
- Inviting people into a tenant, or editing its events, ticket types, orders or customers.
- Selling tickets or acting as a cashier.
- Signing in as an organiser. There is no impersonation.

## What suspension does

- The tenant's people see a "suspended" page in the organiser panel; every organiser API call is refused.
- Its gate POS stop selling and syncing. Sales stored offline stay on the tills' browsers and sync after reactivation.
- Nothing is deleted and events keep their status. The tenant sees the suspension in its audit log.

## What deletion does

- The tenant is blocked at once: its people see an "organisation deleted" page and its gate POS stop.
- Its Clerk organisation is deleted, then its database is dropped: events, orders, customers, shifts and its own audit trail. This cannot be undone, so export first if the data may be needed.
- Its record stays in the registry (listed under the Deleted filter), with the platform's audit entries about it.
- If an organisation is deleted in Clerk instead, the tenant is blocked the same way but its data is kept; it can still be read and exported until an admin deletes it from Settings.

## Security rules

| Rule                             | How                                                                                                                                                                              |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The API decides who is staff     | Every `/v1/platform` request needs a verified Clerk session **and** an active record on the API's staff list, checked each time. A Clerk account alone gets `NOT_PLATFORM_STAFF` |
| Staff accounts are staff only    | The organiser API refuses staff accounts (`PLATFORM_STAFF_ACCOUNT`), so staff work only here                                                                                     |
| No self sign-up                  | Staff are invited from Settings. The first admins come from `PLATFORM_ADMIN_EMAILS` in the backend. With a separate staff Clerk application, set its sign-up mode to Restricted  |
| Each tenant's data is separate   | Every tenant has its own database; the console reaches it only through `/v1/platform`                                                                                            |
| The console's checks are UX only | `src/proxy.ts` only checks for a Clerk session; buttons are hidden from support staff, but the API enforces roles                                                                |
| Every call is audited            | Reads included. Calls about a tenant also appear in that tenant's own audit trail as "Raveable staff"                                                                            |
| Destructive actions ask first    | Deleting a tenant needs its exact name; removing a member asks to confirm                                                                                                        |
| Clearly internal                 | The sidebar shows "Raveable Platform" with an "Internal" badge; the header says "Platform admin" and your role                                                                   |
