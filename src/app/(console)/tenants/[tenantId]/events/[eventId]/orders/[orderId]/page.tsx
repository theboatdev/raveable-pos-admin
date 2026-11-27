import Link from 'next/link';
import { Suspense } from 'react';
import { TenantPageSkeleton, TenantShell } from '@/components/console/tenant-shell';
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
import type { Order, People, TenantBrief } from '@/lib/api/types';
import { ORDER_STATUS_LABELS, formatDateTime, formatMoney } from '@/lib/format';
import { tenantHref } from '@/lib/navigation';

export const metadata = { title: 'Tenant order' };

export default function Page({
  params,
}: PageProps<'/tenants/[tenantId]/events/[eventId]/orders/[orderId]'>) {
  return (
    <Suspense fallback={<TenantPageSkeleton />}>
      <OrderPage params={params} />
    </Suspense>
  );
}

async function OrderPage({
  params,
}: {
  params: Promise<{ tenantId: string; eventId: string; orderId: string }>;
}) {
  const { tenantId, eventId, orderId } = await params;
  const { tenant, event, order, people } = await tenantRead<{
    tenant: TenantBrief;
    event: { id: string; name: string };
    order: Order;
    people: People;
  }>(tenantId, `/events/${encodeURIComponent(eventId)}/orders/${encodeURIComponent(orderId)}`);
  const money = (minor: number) => formatMoney(minor, order.currency);
  const name = (userId: string) => people[userId] ?? userId;
  const lineName = new Map(order.lines.map((line) => [line.ticketTypeId, line.name]));

  return (
    <TenantShell tenant={tenant} tab="overview">
      <Link
        href={tenantHref(tenant.id, 'events', event.id, 'orders')}
        className="text-sm text-muted-foreground hover:underline"
      >
        ← Orders for {event.name}
      </Link>
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="font-mono text-xl font-semibold">{order.ref}</h2>
        <Badge variant={order.status === 'completed' ? 'outline' : 'secondary'}>
          {ORDER_STATUS_LABELS[order.status]}
        </Badge>
        {order.recordedOffline ? <Badge variant="secondary">Sold offline</Badge> : null}
        {order.oversold ? <Badge variant="destructive">Oversold</Badge> : null}
        {order.outOfDate ? <Badge variant="secondary">Old prices</Badge> : null}
      </div>
      <p className="text-sm text-muted-foreground">
        Sold {formatDateTime(order.soldAt)} at {order.gateName} by {name(order.soldBy)}; received{' '}
        {formatDateTime(order.receivedAt)}
        {order.syncedBy !== order.soldBy ? `, synced by ${name(order.syncedBy)}` : ''}.
      </p>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Items</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <Table>
              <TableBody>
                {order.lines.map((line) => (
                  <TableRow key={line.ticketTypeId}>
                    <TableCell>
                      {line.quantity} × {line.name}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {money(line.totalMinor)}
                    </TableCell>
                  </TableRow>
                ))}
                {order.discount ? (
                  <TableRow>
                    <TableCell>Discount: {order.discount.name}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      −{money(order.discount.amountMinor)}
                    </TableCell>
                  </TableRow>
                ) : null}
                <TableRow>
                  <TableCell>
                    {order.tax.name} {order.tax.ratePercent}%
                    {order.tax.pricesIncludeTax ? ' (included)' : ''}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {money(order.tax.amountMinor)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Total</TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    {money(order.totalMinor)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <p>
              {order.payment.method === 'cash'
                ? `Cash: ${money(order.payment.tenderedMinor)} tendered, ${money(order.payment.changeMinor)} change`
                : `${order.payment.method === 'card' ? 'Card' : 'Bank transfer'}${order.payment.reference ? `, reference ${order.payment.reference}` : ''}`}
            </p>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              {order.customer ? (
                <ul className="flex flex-col gap-1">
                  <li>{order.customer.name ?? 'No name'}</li>
                  <li>{order.customer.phone ?? 'No phone'}</li>
                  <li>{order.customer.email ?? 'No email'}</li>
                </ul>
              ) : (
                <p className="text-muted-foreground">No customer details taken.</p>
              )}
            </CardContent>
          </Card>
          {order.reversal ? (
            <Card>
              <CardHeader>
                <CardTitle className="capitalize">{order.reversal.type}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-1 text-sm">
                <p>Reason: {order.reversal.reason}</p>
                <p>
                  Requested by {name(order.reversal.requestedBy)},{' '}
                  {formatDateTime(order.reversal.requestedAt)}
                </p>
                <p className="capitalize">
                  {order.reversal.status}
                  {order.reversal.decidedBy
                    ? ` by ${name(order.reversal.decidedBy)}${
                        order.reversal.decidedAt
                          ? `, ${formatDateTime(order.reversal.decidedAt)}`
                          : ''
                      }`
                    : ''}
                </p>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Ticket type</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.tickets.map((ticket) => (
                <TableRow key={ticket.code}>
                  <TableCell className="font-mono text-sm">{ticket.code}</TableCell>
                  <TableCell className="text-sm">
                    {lineName.get(ticket.ticketTypeId) ?? ticket.ticketTypeId}
                  </TableCell>
                  <TableCell className="text-sm capitalize">{ticket.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </TenantShell>
  );
}
