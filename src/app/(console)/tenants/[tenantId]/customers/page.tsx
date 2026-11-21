import Form from 'next/form';
import Link from 'next/link';
import { Suspense } from 'react';
import { Pager } from '@/components/console/pager';
import { TenantPageSkeleton, TenantShell } from '@/components/console/tenant-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { tenantRead } from '@/lib/api/server';
import type { Customer, TenantBrief } from '@/lib/api/types';
import { formatDate } from '@/lib/format';
import { tenantHref } from '@/lib/navigation';

export const metadata = { title: 'Tenant customers' };

const pick = (value: string | string[] | undefined) =>
  typeof value === 'string' && value ? value : undefined;

export default function Page({ params, searchParams }: PageProps<'/tenants/[tenantId]/customers'>) {
  return (
    <Suspense fallback={<TenantPageSkeleton />}>
      <Customers params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function Customers({
  params,
  searchParams,
}: {
  params: Promise<{ tenantId: string }>;
  searchParams: PageProps<'/tenants/[tenantId]/customers'>['searchParams'];
}) {
  const [{ tenantId }, query] = await Promise.all([params, searchParams]);
  const q = pick(query.q);
  const page = Math.max(1, Number(pick(query.page) ?? 1) || 1);
  const search = new URLSearchParams({ ...(q ? { q } : {}), page: String(page) });
  const data = await tenantRead<{
    tenant: TenantBrief;
    customers: Customer[];
    total: number;
    page: number;
    pageSize: number;
  }>(tenantId, `/customers?${search}`);
  const path = tenantHref(data.tenant.id, 'customers');

  return (
    <TenantShell
      tenant={data.tenant}
      tab="customers"
      description="Everyone who bought from this organisation, most recent first."
    >
      <Form action={path} className="flex flex-wrap items-end gap-2">
        <Input
          name="q"
          defaultValue={q}
          placeholder="Name, email or phone"
          className="w-72"
          aria-label="Search customers"
        />
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </Form>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead className="text-right">Orders</TableHead>
            <TableHead>Last purchase</TableHead>
            <TableHead>Marketing</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.customers.map((customer) => (
            <TableRow key={customer.id}>
              <TableCell>
                <Link
                  href={tenantHref(data.tenant.id, 'customers', customer.id)}
                  className="font-medium hover:underline"
                >
                  {customer.name ?? customer.phone ?? customer.email ?? 'Unnamed'}
                </Link>
                {customer.email ? (
                  <span className="block text-xs text-muted-foreground">{customer.email}</span>
                ) : null}
              </TableCell>
              <TableCell className="text-sm">{customer.phone ?? '—'}</TableCell>
              <TableCell className="text-right tabular-nums">{customer.orderCount}</TableCell>
              <TableCell className="text-sm">
                {customer.lastPurchaseAt ? formatDate(customer.lastPurchaseAt) : '—'}
              </TableCell>
              <TableCell>
                {customer.consent.marketing ? (
                  <Badge variant="outline">Opted in</Badge>
                ) : (
                  <span className="text-sm text-muted-foreground">No</span>
                )}
              </TableCell>
            </TableRow>
          ))}
          {data.customers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                No customers{q ? ' match that search' : ' yet'}.
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
      <Pager
        path={path}
        params={{ q }}
        page={data.page}
        pageSize={data.pageSize}
        total={data.total}
        noun={['customer', 'customers']}
      />
    </TenantShell>
  );
}
