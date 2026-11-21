import type { AuditEntry } from '@/lib/api/types';

/**
 * Plain-English labels for audit actions. Unknown actions fall back to the raw code,
 * so new backend actions still show.
 */
const LABELS: Record<string, string> = {
  'platform.overview.viewed': 'Viewed the platform overview',
  'platform.tenants.listed': 'Listed tenants',
  'platform.tenant.viewed': 'Viewed a tenant',
  'platform.tenant.audit_viewed': 'Viewed a tenant’s audit trail',
  'platform.tenant.suspended': 'Suspended a tenant',
  'platform.tenant.reactivated': 'Reactivated a tenant',
  'platform.tenant.updated': 'Edited a tenant’s details',
  'platform.tenant.deleted': 'Deleted a tenant and its data',
  'platform.tenant.exported': 'Exported a tenant’s data',
  'platform.tenant.members_viewed': 'Viewed a tenant’s members',
  'platform.tenant.member_role_changed': 'Changed a tenant member’s role',
  'platform.tenant.member_removed': 'Removed a tenant member',
  'platform.tenant.event_viewed': 'Viewed a tenant’s event',
  'platform.tenant.orders_viewed': 'Viewed a tenant’s orders',
  'platform.tenant.order_viewed': 'Viewed a tenant’s order',
  'platform.tenant.customers_viewed': 'Viewed a tenant’s customers',
  'platform.tenant.customer_viewed': 'Viewed a tenant’s customer',
  'platform.audit.viewed': 'Viewed the platform audit log',
  'platform.settings.viewed': 'Viewed platform settings',
  'platform.settings.updated': 'Changed platform settings',
  'platform.staff.listed': 'Listed platform staff',
  'platform.staff.invited': 'Invited platform staff',
  'platform.staff.invitation_revoked': 'Revoked a staff invitation',
  'platform.staff.role_changed': 'Changed a staff role',
  'platform.staff.removed': 'Removed platform staff',
};

export function describeAction(action: string): string {
  return LABELS[action] ?? action;
}

/** Whether an entry changed something, as opposed to looking at or exporting data. */
export function isChange(entry: Pick<AuditEntry, 'action'>): boolean {
  return !/[._](viewed|listed|exported)$/.test(entry.action);
}

/** A short summary of an entry's details, for the table. */
export function summariseDetails(details: Record<string, unknown>): string {
  return Object.entries(details)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(
      ([key, value]) =>
        `${key}: ${typeof value === 'object' ? JSON.stringify(value) : String(value)}`,
    )
    .join(' · ');
}
