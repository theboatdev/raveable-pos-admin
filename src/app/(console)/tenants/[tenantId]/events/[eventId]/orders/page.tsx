import Form from 'next/form';
import Link from 'next/link';
import { Suspense } from 'react';
import { TenantPageSkeleton, TenantShell } from '@/components/console/tenant-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { tenantRead } from '@/lib/api/server';
import type { Order, People, TenantBrief } from '@/lib/api/types';
import { ORDER_STATUS_LABELS, formatDateTime, formatMoney } from '@/lib/format';
import { tenantHref } from '@/lib/navigation';

export const metadata = { title: 'Tenant orders' };

const STATUSES = ['completed', 'voided', 'refunded', 'pending_reversal'] as const;
const STATUS_FILTER_LABELS: Record<(typeof STATUSES)[number], string> = {
  ...ORDER_STATUS_LABELS,
  pending_reversal: 'Waiting for approval',
};

export default function Page({
  params,
  searchParams,
}: PageProps<'/tenants/[tenantId]/events/[eventId]/orders'>) {
  return (
    <Suspense fallback={<TenantPageSkeleton />}>
      <Orders params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function Orders({
  params,
  searchParams,
}: {
  params: Promise<{ tenantId: string; eventId: string }>;
  searchParams: PageProps<'/tenants/[tenantId]/events/[eventId]/orders'>['searchParams'];
}) {
  const [{ tenantId, eventId }, query] = await Promise.all([params, searchParams]);
  const status = STATUSES.find((s) => s === query.status);
  const data = await tenantRead<{
    tenant: TenantBrief;
    event: { id: string; name: string };
    orders: Order[];
    people: People;
  }>(tenantId, `/events/${encodeURIComponent(eventId)}/orders${status ? `?status=${status}` : ''}`);
  const { tenant, event, orders, people } = data;
  const path = tenantHref(tenant.id, 'events', event.id, 'orders');

  return (
    <TenantShell tenant={tenant} tab="overview">
      <Link
        href={tenantHref(tenant.id, 'events', event.id)}
        className="text-sm text-muted-foreground hover:underline"
      >
        ← {event.name}
      </Link>
      <h2 className="text-xl font-semibold">Orders</h2>
      <Form action={path} className="flex flex-wrap items-end gap-2">
        <NativeSelect name="status" defaultValue={status ?? ''} aria-label="Status">
          <NativeSelectOption value="">Any status</NativeSelectOption>
          {STATUSES.map((s) => (
            <NativeSelectOption key={s} value={s}>
              {STATUS_FILTER_LABELS[s]}
            </NativeSelectOption>
          ))}
        </NativeSelect>
        <Button type="submit" variant="secondary">
          Filter
        </Button>
      </Form>
      <p className="text-sm text-muted-foreground">The latest 200 orders, newest first.</p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order</TableHead>
            <TableHead>Sold</TableHead>
            <TableHead>Gate and cashier</TableHead>
            <TableHead className="text-right">Tickets</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>
                <Link
                  href={tenantHref(tenant.id, 'events', event.id, 'orders', order.id)}
                  className="font-mono text-sm hover:underline"
                >
                  {order.ref}
                </Link>
                {order.customer?.name || order.customer?.phone ? (
                  <span className="block text-xs text-muted-foreground">
                    {order.customer.name ?? order.customer.phone}
                  </span>
                ) : null}
              </TableCell>
              <TableCell className="text-sm">{formatDateTime(order.soldAt)}</TableCell>
              <TableCell className="text-sm">
                {order.gateName}
                <span className="block text-xs text-muted-foreground">
                  {people[order.soldBy] ?? order.soldBy}
                </span>
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {order.lines.reduce((sum, line) => sum + line.quantity, 0)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatMoney(order.totalMinor, order.currency)}
              </TableCell>
              <TableCell>
                <span className="flex flex-wrap gap-1">
                  <Badge variant={order.status === 'completed' ? 'outline' : 'secondary'}>
                    {ORDER_STATUS_LABELS[order.status]}
                  </Badge>
                  {order.recordedOffline ? <Badge variant="secondary">Offline</Badge> : null}
                  {order.oversold ? <Badge variant="destructive">Oversold</Badge> : null}
                  {order.reversal?.status === 'pending' ? (
                    <Badge variant="secondary">Reversal pending</Badge>
                  ) : null}
                </span>
              </TableCell>
            </TableRow>
          ))}
          {orders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                No orders.
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </TenantShell>
  );
}
