import Link from 'next/link';
import { Suspense } from 'react';
import { TenantPageSkeleton, TenantShell } from '@/components/console/tenant-shell';
import { Stat } from '@/components/stat';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import type { EventDetail } from '@/lib/api/types';
import { STATUS_LABELS, formatDateTime, formatMoney } from '@/lib/format';
import { tenantHref } from '@/lib/navigation';

export const metadata = { title: 'Tenant event' };

export default function Page({ params }: PageProps<'/tenants/[tenantId]/events/[eventId]'>) {
  return (
    <Suspense fallback={<TenantPageSkeleton />}>
      <EventPage params={params} />
    </Suspense>
  );
}

async function EventPage({ params }: { params: Promise<{ tenantId: string; eventId: string }> }) {
  const { tenantId, eventId } = await params;
  const detail = await tenantRead<EventDetail>(tenantId, `/events/${encodeURIComponent(eventId)}`);
  const { tenant, event, ticketTypes, gates, sales, shifts, people } = detail;
  const currency = detail.currency ?? 'LKR';
  const money = (minor: number) => formatMoney(minor, currency);
  const name = (userId: string) => people[userId] ?? userId;

  return (
    <TenantShell tenant={tenant} tab="overview">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="flex items-center gap-2 text-xl font-semibold">
            {event.name} <Badge variant="secondary">{STATUS_LABELS[event.status]}</Badge>
          </h2>
          <p className="text-sm text-muted-foreground">
            {event.venue} · {formatDateTime(event.startsAt)} – {formatDateTime(event.endsAt)} ·
            capacity {event.capacity}
            {event.managerIds.length
              ? ` · managed by ${event.managerIds.map(name).join(', ')}`
              : ''}
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href={tenantHref(tenant.id, 'events', event.id, 'orders')}>View orders</Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Revenue"
          value={money(sales.totals.revenueMinor)}
          detail={`${sales.totals.orderCount} orders`}
        />
        <Stat
          label="Tickets sold"
          value={String(sales.totals.ticketCount)}
          detail={`of ${event.capacity}`}
        />
        <Stat
          label="Sold offline"
          value={String(sales.totals.offlineCount)}
          detail={`${sales.totals.oversoldCount} oversold`}
        />
        <Stat
          label="Reversals"
          value={String(
            (sales.reversed.voided?.orderCount ?? 0) + (sales.reversed.refunded?.orderCount ?? 0),
          )}
          detail={`${sales.pendingReversals} waiting for approval`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ticket types</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Sold</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ticketTypes.map((type) => (
                  <TableRow key={type.id}>
                    <TableCell>
                      {type.name}
                      <span className="block text-xs text-muted-foreground">
                        {type.allocated} of {type.quota} allocated to gates
                      </span>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {money(type.priceMinor)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {type.sold} / {type.quota}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gates and POS</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Gate</TableHead>
                  <TableHead>Sells here</TableHead>
                  <TableHead>POS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {gates.map((gate) => (
                  <TableRow key={gate.id}>
                    <TableCell className="font-medium">{gate.name}</TableCell>
                    <TableCell className="text-sm">
                      {gate.cashierIds.map(name).join(', ') || '—'}
                    </TableCell>
                    <TableCell className="text-sm">
                      {gate.pos ? (
                        <>
                          {gate.pos.allocations
                            .filter((a) => a.quantity > 0 || a.sold > 0)
                            .map((a) => (
                              <span key={a.ticketTypeId} className="block">
                                {ticketTypes.find((t) => t.id === a.ticketTypeId)?.name ??
                                  'Deleted type'}
                                : {a.sold} / {a.quantity}
                              </span>
                            ))}
                          <span className="block text-xs text-muted-foreground">
                            Bands {gate.pos.bandsUsed} / {gate.pos.bandsIssued} · opens with{' '}
                            {money(gate.pos.openingFloatMinor)}
                          </span>
                        </>
                      ) : (
                        <span className="text-muted-foreground">Not set up</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cash drawers</CardTitle>
        </CardHeader>
        <CardContent>
          {shifts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No drawers opened yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Gate</TableHead>
                  <TableHead>Opened</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Cash expected</TableHead>
                  <TableHead className="text-right">Cash variance</TableHead>
                  <TableHead className="text-right">Bands variance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shifts.map((shift) => (
                  <TableRow key={shift.id}>
                    <TableCell className="text-sm font-medium">{shift.gateName}</TableCell>
                    <TableCell className="text-sm">
                      {formatDateTime(shift.openedAt)}
                      <span className="block text-xs text-muted-foreground">
                        by {name(shift.openedBy)}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm capitalize">{shift.status}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {money(shift.expectedCashMinor)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {shift.varianceMinor === null ? '—' : money(shift.varianceMinor)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {shift.bandsVariance ?? '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </TenantShell>
  );
}
