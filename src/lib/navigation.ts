/**
 * Navigation for the platform admin console (docs/01-platform-admin-scope.md).
 * Pure functions only, so they are unit-tested without a browser.
 */

export type AdminNavKey = 'overview' | 'tenants' | 'audit' | 'settings';

export interface NavItem {
  key: AdminNavKey;
  title: string;
  href: string;
}

export const ADMIN_NAV: readonly NavItem[] = [
  { key: 'overview', title: 'Overview', href: '/overview' },
  { key: 'tenants', title: 'Tenants', href: '/tenants' },
  { key: 'audit', title: 'Audit log', href: '/audit' },
  { key: 'settings', title: 'Settings', href: '/settings' },
];

export function getActiveNav(pathname: string): AdminNavKey | null {
  const first = pathname.split('?')[0]!.split('/').filter(Boolean)[0];
  return ADMIN_NAV.find((item) => item.key === first)?.key ?? null;
}
