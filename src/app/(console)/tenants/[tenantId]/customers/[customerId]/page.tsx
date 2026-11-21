import Link from 'next/link';
import { Suspense } from 'react';
import { TenantPageSkeleton, TenantShell } from '@/components/console/tenant-shell';
import { Stat } from '@/components/stat';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { tenantRead } from '@/lib/api/server';
import type { Customer, CustomerPurchase, TenantBrief } from '@/lib/api/types';
import { ORDER_STATUS_LABELS, formatDate, formatDateTime, formatMoney } from '@/lib/format';
import { tenantHref } from '@/lib/navigation';

export const metadata = { title: 'Tenant customer' };

export default function Page({ params }: PageProps<'/tenants/[tenantId]/customers/[customerId]'>) {
  return (
    <Suspense fallback={<TenantPageSkeleton />}>
      <CustomerPage params={params} />
    </Suspense>
  );
}

async function CustomerPage({
  params,
}: {
  params: Promise<{ tenantId: string; customerId: string }>;
}) {
  const { tenantId, customerId } = await params;
  const data = await tenantRead<{
    tenant: TenantBrief;
    currency: string | null;
    customer: Customer;
    purchases: CustomerPurchase[];
  }>(tenantId, `/customers/${encodeURIComponent(customerId)}`);
  const { tenant, customer, purchases } = data;
  const currency = data.currency ?? purchases[0]?.currency ?? 'LKR';

  return (
    <TenantShell tenant={tenant} tab="customers">
      <Link
        href={tenantHref(tenant.id, 'customers')}
        className="text-sm text-muted-foreground hover:underline"
      >
        ← Customers
      </Link>
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-wrap items-center gap-2">
            {customer.name ?? 'Unnamed customer'}
            {customer.consent.marketing ? (
              <Badge variant="outline">Marketing opted in</Badge>
            ) : null}
            {customer.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm sm:grid-cols-3">
          <span>Phone: {customer.phone ?? '—'}</span>
          <span>Email: {customer.email ?? '—'}</span>
          <span>Customer since {formatDate(customer.createdAt)}</span>
        </CardContent>
      </Card>
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Orders" value={String(customer.orderCount)} />
        <Stat label="Spent" value={formatMoney(customer.totalSpentMinor, currency)} />
        <Stat
          label="Last purchase"
          value={customer.lastPurchaseAt ? formatDate(customer.lastPurchaseAt) : '—'}
        />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order</TableHead>
            <TableHead>Event</TableHead>
            <TableHead>Sold</TableHead>
            <TableHead className="text-right">Tickets</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {purchases.map((purchase) => (
            <TableRow key={purchase.orderId}>
              <TableCell>
                <Link
                  href={tenantHref(
                    tenant.id,
                    'events',
                    purchase.eventId,
                    'orders',
                    purchase.orderId,
                  )}
                  className="font-mono text-sm hover:underline"
                >
                  {purchase.ref}
                </Link>
              </TableCell>
              <TableCell className="text-sm">
                {purchase.eventName}
                <span className="block text-xs text-muted-foreground">{purchase.gateName}</span>
              </TableCell>
              <TableCell className="text-sm">{formatDateTime(purchase.soldAt)}</TableCell>
              <TableCell className="text-right tabular-nums">{purchase.tickets}</TableCell>
              <TableCell className="text-right tabular-nums">
                {formatMoney(purchase.totalMinor, purchase.currency)}
              </TableCell>
              <TableCell className="text-sm">{ORDER_STATUS_LABELS[purchase.status]}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TenantShell>
  );
}
