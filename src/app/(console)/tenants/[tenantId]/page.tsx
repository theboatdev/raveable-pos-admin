import { Download } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { TenantActions } from '@/components/console/tenant-actions';
import { TenantPageSkeleton, TenantShell } from '@/components/console/tenant-shell';
import { Stat } from '@/components/stat';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ApiError } from '@/lib/api/errors';
import { getStaff, platformApi } from '@/lib/api/server';
import type { TenantDetail } from '@/lib/api/types';
import { STATUS_LABELS, formatDate, formatDateTime, formatMoney } from '@/lib/format';
import { tenantHref } from '@/lib/navigation';

export const metadata = { title: 'Tenant' };

export default function Page({ params }: PageProps<'/tenants/[tenantId]'>) {
  return (
    <Suspense fallback={<TenantPageSkeleton />}>
      <TenantOverview params={params} />
    </Suspense>
  );
}

async function TenantOverview({ params }: { params: Promise<{ tenantId: string }> }) {
  const [{ tenantId }, staff] = await Promise.all([params, getStaff()]);
  let detail: TenantDetail;
  try {
    detail = await platformApi<TenantDetail>(`/tenants/${encodeURIComponent(tenantId)}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
  const { tenant, members, events, sales, pos } = detail;
  const isAdmin = staff.role === 'admin';
  const hasData = !tenant.deletion?.dataDeletedAt;
  const currency = tenant.settings?.currency ?? 'LKR';
  const money = (minor: number) => formatMoney(minor, currency);
  const owners = members.filter((m) => m.role === 'owner');

  return (
    <TenantShell
      tenant={tenant}
      tab="overview"
      description={`${tenant.id} · database ${tenant.dbName} · created ${formatDate(tenant.createdAt)}${
        tenant.settings ? ` · ${tenant.settings.currency}, ${tenant.settings.timezone}` : ''
      }`}
      actions={
        isAdmin && hasData ? (
          <>
            <Button asChild variant="outline">
              <a href={tenantHref(tenant.id, 'export')} download>
                <Download />
                Export data
              </a>
            </Button>
            {tenant.status === 'deleted' ? null : (
              <TenantActions
                tenantId={tenant.id}
                tenantName={tenant.name}
                suspended={tenant.status === 'suspended'}
              />
            )}
          </>
        ) : null
      }
    >
      {tenant.deletion ? (
        <Alert variant="destructive">
          <AlertTitle>Deleted on {formatDateTime(tenant.deletion.at)}</AlertTitle>
          <AlertDescription>
            {tenant.deletion.by === 'clerk'
              ? 'The organisation was deleted in Clerk. '
              : `By ${tenant.deletion.byName ?? tenant.deletion.by}. `}
            {tenant.deletion.dataDeletedAt
              ? `Its database was dropped on ${formatDateTime(tenant.deletion.dataDeletedAt)}; only the platform audit trail remains.`
              : 'Its data is kept and can be read or exported until a platform admin deletes it in Settings.'}
          </AlertDescription>
        </Alert>
      ) : null}
      {tenant.suspension ? (
        <Alert variant="destructive">
          <AlertTitle>Suspended on {formatDateTime(tenant.suspension.at)}</AlertTitle>
          <AlertDescription>
            By {tenant.suspension.byName ?? tenant.suspension.by}. Reason:{' '}
            {tenant.suspension.reason ?? '—'}
          </AlertDescription>
        </Alert>
      ) : null}
      <p className="text-sm text-muted-foreground">
        Everything you open about this tenant is recorded in the platform audit log and in the
        tenant’s own audit trail.
      </p>

      {sales ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat
            label="Revenue, all time"
            value={money(sales.allTime.revenueMinor)}
            detail={`${sales.allTime.orderCount} orders`}
          />
          <Stat
            label="Last 30 days"
            value={money(sales.last30Days.revenueMinor)}
            detail={`${sales.last30Days.ticketCount} tickets`}
          />
          <Stat
            label="Members"
            value={String(members.length)}
            detail={owners.length ? `Owner: ${owners.map((o) => o.name).join(', ')}` : undefined}
          />
          <Stat
            label="Gate POS set up"
            value={`${pos.setUp} / ${pos.gates}`}
            detail={`${pos.drawersOpen} drawers open`}
          />
        </div>
      ) : null}

      {hasData ? (
        <Card>
          <CardHeader>
            <CardTitle>Events</CardTitle>
            <CardDescription>
              Open an event for its ticket types, gates, tills, shifts and orders.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {events.length === 0 ? (
              <p className="text-sm text-muted-foreground">No events yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Sold</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>
                        <Link
                          href={tenantHref(tenant.id, 'events', event.id)}
                          className="font-medium hover:underline"
                        >
                          {event.name}
                        </Link>
                        <span className="block text-xs text-muted-foreground">
                          {event.venue} ·{' '}
                          {formatDate(event.startsAt, tenant.settings?.timezone ?? undefined)}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm">{STATUS_LABELS[event.status]}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {event.ticketCount} / {event.capacity}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {money(event.revenueMinor)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      ) : null}
    </TenantShell>
  );
}
