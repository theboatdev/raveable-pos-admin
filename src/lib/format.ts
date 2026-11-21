import type {
  EventStatus,
  OrderStatus,
  PlatformRole,
  TenantRole,
  TenantStatus,
} from '@/lib/api/types';

/** Console times are shown in Sri Lanka time, where the Raveable team works. */
export const CONSOLE_TIMEZONE = 'Asia/Colombo';

export const STATUS_LABELS: Record<EventStatus, string> = {
  draft: 'Draft',
  on_sale: 'On sale',
  live: 'Live',
  closed: 'Closed',
};

export const TENANT_ROLE_LABELS: Record<TenantRole, string> = {
  owner: 'Owner',
  event_manager: 'Event Manager',
  cashier: 'Cashier',
};

export const TENANT_ROLES = ['owner', 'event_manager', 'cashier'] as const;

export const TENANT_STATUS_LABELS: Record<TenantStatus, string> = {
  active: 'Active',
  suspended: 'Suspended',
  deleted: 'Deleted',
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  completed: 'Completed',
  voided: 'Voided',
  refunded: 'Refunded',
};

export const PLATFORM_ROLE_LABELS: Record<PlatformRole, string> = {
  admin: 'Platform admin',
  support: 'Support (read-only)',
};

export function formatMoney(minor: number, currency: string): string {
  const digits =
    new Intl.NumberFormat('en', { style: 'currency', currency }).resolvedOptions()
      .maximumFractionDigits ?? 2;
  return new Intl.NumberFormat('en', {
    style: 'currency',
    currency,
    currencyDisplay: 'code',
  }).format(minor / 10 ** digits);
}

export function formatDateTime(iso: string, timeZone = CONSOLE_TIMEZONE): string {
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone,
  }).format(new Date(iso));
}

export function formatDate(iso: string, timeZone = CONSOLE_TIMEZONE): string {
  return new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeZone }).format(new Date(iso));
}

/** The currencies and timezones a new tenant can start with (backend validates the same). */
export const CURRENCIES = ['LKR', 'USD', 'EUR', 'GBP', 'INR', 'AUD', 'SGD', 'AED', 'MVR'] as const;
