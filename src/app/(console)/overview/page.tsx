import Link from 'next/link';
import { Suspense } from 'react';
import { PageBody, PageHeader } from '@/components/page-header';
import { Stat } from '@/components/stat';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { platformApi } from '@/lib/api/server';
import type { Overview } from '@/lib/api/types';
import { formatMoney } from '@/lib/format';

export const metadata = { title: 'Overview' };

export default function Page() {
  return (
    <PageBody>
      <PageHeader
        title="Overview"
        description="Platform health at a glance. Opening this page is recorded in the audit log."
      />
      <Suspense fallback={<Skeleton className="h-72 w-full" />}>
        <OverviewContent />
      </Suspense>
    </PageBody>
  );
}

async function OverviewContent() {
  const data = await platformApi<Overview>('/overview');
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Tenants"
          value={String(data.tenants.active + data.tenants.suspended)}
          detail={`${data.tenants.suspended} suspended · ${data.tenants.newLast30Days} new in 30 days · ${data.tenants.deleted} deleted`}
        />
        <Stat
          label="Active events"
          value={String(data.events.onSale + data.events.live)}
          detail={`${data.events.live} live · ${data.events.onSale} on sale · ${data.events.draft} draft`}
        />
        <Stat
          label="Drawers open"
          value={String(data.drawersOpen)}
          detail={`${data.cashiersOnline} cashiers selling in the last two minutes`}
        />
        <Stat
          label="Orders"
          value={data.sales.reduce((sum, row) => sum + row.orderCount, 0).toLocaleString()}
          detail={`${data.sales.reduce((sum, row) => sum + row.ticketCount, 0).toLocaleString()} tickets, all time`}
        />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recorded sales volume</CardTitle>
        </CardHeader>
        <CardContent>
          {data.sales.length === 0 ? (
            <p className="text-sm text-muted-foreground">No sales yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Currency</TableHead>
                  <TableHead className="text-right">Orders</TableHead>
                  <TableHead className="text-right">Tickets</TableHead>
                  <TableHead className="text-right">All time</TableHead>
                  <TableHead className="text-right">Last 30 days</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.sales.map((row) => (
                  <TableRow key={row.currency}>
                    <TableCell className="font-medium">{row.currency}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {row.orderCount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {row.ticketCount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatMoney(row.revenueMinor, row.currency)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatMoney(row.last30Days.revenueMinor, row.currency)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          <p className="mt-3 text-xs text-muted-foreground">
            Completed orders only; each tenant sells in its own currency.{' '}
            <Link href="/tenants" className="underline">
              See tenants
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
