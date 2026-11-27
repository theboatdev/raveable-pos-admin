/** Shapes returned by /v1/platform (backend docs/08-api-spec.md#platform). Dates are ISO strings. */

export type PlatformRole = 'admin' | 'support';
export type TenantRole = 'owner' | 'event_manager' | 'cashier';
export type EventStatus = 'draft' | 'on_sale' | 'live' | 'closed';

export interface Staff {
  userId: string;
  role: PlatformRole;
  email: string | null;
  name: string;
}

export interface StaffMember extends Staff {
  status: 'active' | 'removed';
  addedBy: string;
  addedAt: string;
}

export interface StaffInvitation {
  id: string;
  email: string;
  role: PlatformRole;
  invitedBy: string;
  invitedAt: string;
}

export interface SalesFigures {
  orderCount: number;
  ticketCount: number;
  revenueMinor: number;
}

export interface Overview {
  tenants: { active: number; suspended: number; deleted: number; newLast30Days: number };
  events: { draft: number; onSale: number; live: number; closed: number };
  /** Gates whose cash drawer is open now. */
  drawersOpen: number;
  /** People whose gate POS reached Raveable in the last two minutes. */
  cashiersOnline: number;
  sales: (SalesFigures & {
    currency: string;
    last30Days: { orderCount: number; revenueMinor: number };
  })[];
}

export type TenantStatus = 'active' | 'suspended' | 'deleted';

/** A tenant's organisation settings, as its Owner sets them in the organiser app. */
export interface OrganisationSettings {
  currency: string;
  timezone: string;
  tax: { name: string; ratePercent: number; pricesIncludeTax: boolean };
  eventManagersCanSeeCrm: boolean;
  contactEmail: string | null;
  contactPhone: string | null;
  phoneCountryCode: string;
  bankAccount?: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    branch: string;
  } | null;
}

/** A registry entry (backend ADR-0010), with the tenant's settings from its own database. */
export interface Tenant {
  id: string;
  name: string;
  dbName: string;
  status: TenantStatus;
  suspension: { at: string; by: string; byName?: string | null; reason: string | null } | null;
  deletion: {
    at: string;
    by: string;
    byName?: string | null;
    dataDeletedAt: string | null;
  } | null;
  /** Null once the tenant's database has been deleted. */
  settings: OrganisationSettings | null;
  createdAt: string;
  updatedAt: string;
}

/** Sent with each per-tenant read, to title the page. */
export interface TenantBrief {
  id: string;
  name: string;
  status: TenantStatus;
}

export interface TenantRow extends Tenant {
  eventCount: number;
  activeEventCount: number;
  memberCount: number;
  lastSaleAt: string | null;
  lastActivityAt: string | null;
  owners: { name: string; email: string }[];
}

export interface TenantMember {
  userId: string;
  name: string;
  email: string;
  role: TenantRole;
  joinedAt: string;
}

export interface TenantDetail {
  tenant: Tenant;
  organisation: { id: string; name: string; settings: OrganisationSettings } | null;
  members: TenantMember[];
  events: {
    id: string;
    name: string;
    status: EventStatus;
    venue: string;
    startsAt: string;
    endsAt: string;
    capacity: number;
    ticketCount: number;
    revenueMinor: number;
  }[];
  /** Null once the tenant's database has been deleted. */
  sales: { allTime: SalesFigures; last30Days: SalesFigures } | null;
  pos: { gates: number; setUp: number; drawersOpen: number };
}

/** User id → name, for the tenant's people. */
export type People = Record<string, string>;

export interface RaveEvent {
  id: string;
  name: string;
  description: string;
  venue: string;
  startsAt: string;
  endsAt: string;
  capacity: number;
  allocatedQuota: number;
  status: EventStatus;
  managerIds: string[];
  discountPresets: { id: string; name: string; type: 'percent' | 'fixed'; value: number }[];
  createdAt: string;
  updatedAt: string;
}

export interface TicketType {
  id: string;
  name: string;
  priceMinor: number;
  quota: number;
  sold: number;
  salesStartAt: string | null;
  salesEndAt: string | null;
  /** Tickets of this type allocated to gates' POS. */
  allocated: number;
}

/** A gate and its POS, set up by an Owner (backend ADR-0012). */
export interface Gate {
  id: string;
  name: string;
  /** People attached to the gate's POS. */
  cashierIds: string[];
  pos: {
    allocations: { ticketTypeId: string; quantity: number; sold: number }[];
    bandsIssued: number;
    bandsUsed: number;
    bandsLeft: number;
    openingFloatMinor: number;
  } | null;
}

/** A session of a gate's cash drawer. */
export interface Shift {
  id: string;
  gateName: string;
  openedBy: string;
  openedAt: string;
  closedAt: string | null;
  closedBy: string | null;
  status: 'open' | 'closed' | 'reviewed';
  orderCount: number;
  cashSalesMinor: number;
  cardSalesMinor: number;
  /** Cash paid out of the drawer as expenses (EXPENSES.md), already off expected cash. */
  cashExpensesMinor?: number;
  transferSalesMinor: number;
  expectedCashMinor: number;
  countedCashMinor: number | null;
  varianceMinor: number | null;
  expectedBandsLeft: number;
  countedBandsLeft: number | null;
  bandsVariance: number | null;
}

export interface EventSales {
  totals: SalesFigures & {
    discountMinor: number;
    taxMinor: number;
    offlineCount: number;
    oversoldCount: number;
  };
  reversed: Partial<Record<'voided' | 'refunded', { orderCount: number; amountMinor: number }>>;
  pendingReversals: number;
  byPayment: {
    method: 'cash' | 'card' | 'bank_transfer';
    orderCount: number;
    revenueMinor: number;
  }[];
  byCashier: (SalesFigures & { userId: string })[];
}

export interface EventDetail {
  tenant: TenantBrief;
  currency: string | null;
  event: RaveEvent;
  ticketTypes: TicketType[];
  gates: Gate[];
  sales: EventSales;
  shifts: Shift[];
  people: People;
}

export type OrderStatus = 'completed' | 'voided' | 'refunded';

export interface Order {
  id: string;
  ref: string;
  gateName: string;
  soldBy: string;
  syncedBy: string;
  soldAt: string;
  receivedAt: string;
  recordedOffline: boolean;
  oversold: boolean;
  outOfDate: boolean;
  lines: {
    ticketTypeId: string;
    name: string;
    unitPriceMinor: number;
    quantity: number;
    totalMinor: number;
  }[];
  subtotalMinor: number;
  discount: { name: string; type: 'percent' | 'fixed'; value: number; amountMinor: number } | null;
  tax: { name: string; ratePercent: number; pricesIncludeTax: boolean; amountMinor: number };
  totalMinor: number;
  currency: string;
  payment:
    | { method: 'cash'; tenderedMinor: number; changeMinor: number }
    | { method: 'card' | 'bank_transfer'; reference: string | null };
  customer: { name: string | null; phone: string | null; email: string | null } | null;
  status: OrderStatus;
  reversal: {
    type: 'void' | 'refund';
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    requestedBy: string;
    requestedAt: string;
    decidedBy: string | null;
    decidedAt: string | null;
  } | null;
  tickets: { code: string; ticketTypeId: string; status: 'valid' | 'void' }[];
  /** Partial refunds (PARTIAL_REFUNDS.md); absent from orders read before they existed. */
  refunds?: {
    id: string;
    ticketCodes: string[];
    ticketCount: number;
    amountMinor: number;
    method: 'cash' | 'card' | 'bank_transfer';
    reason: string;
    refundedBy: string;
    refundedAt: string;
  }[];
  refundedMinor?: number;
}

export interface Customer {
  id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  tags: string[];
  consent: { marketing: boolean; updatedAt: string | null };
  orderCount: number;
  totalSpentMinor: number;
  firstPurchaseAt: string | null;
  lastPurchaseAt: string | null;
  createdAt: string;
}

export interface CustomerPurchase {
  orderId: string;
  ref: string;
  eventId: string;
  eventName: string;
  gateName: string;
  soldAt: string;
  status: OrderStatus;
  totalMinor: number;
  currency: string;
  tickets: number;
}

export interface AuditEntry {
  id: string;
  at: string;
  scope: 'organisation' | 'platform';
  orgId: string | null;
  action: string;
  target: { type: string; id: string | null; label?: string | null };
  actorId: string;
  actorRole: string;
  /** For platform staff entries: their name. */
  actorName: string | null;
  details: Record<string, unknown>;
  requestId: string | null;
}

export interface PlatformSettings {
  newTenantDefaults: { currency: string; timezone: string; phoneCountryCode: string };
  featureFlags: { offlineSales: boolean; customerExport: boolean };
  updatedAt: string | null;
  updatedBy: string | null;
}
