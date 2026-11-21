import Form from 'next/form';
import Link from 'next/link';
import { Suspense } from 'react';
import { Pager } from '@/components/console/pager';
import { PageBody, PageHeader } from '@/components/page-header';
import { TenantStatusBadge } from '@/components/console/tenant-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
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
import type { TenantRow } from '@/lib/api/types';
import { formatDate, formatDateTime } from '@/lib/format';

export const metadata = { title: 'Tenants' };

const pick = (value: string | string[] | undefined) =>
  typeof value === 'string' && value ? value : undefined;

export default function Page({ searchParams }: PageProps<'/tenants'>) {
  return (
    <PageBody>
      <PageHeader
        title="Tenants"
        description="Every organiser organisation, each with its own database. Deleted tenants have their own filter. Each listing is recorded in the audit log."
      />
      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
        <Tenants searchParams={searchParams} />
      </Suspense>
    </PageBody>
  );
}

async function Tenants({ searchParams }: { searchParams: PageProps<'/tenants'>['searchParams'] }) {
  const query = await searchParams;
  const filter = { q: pick(query.q), status: pick(query.status) };
  const page = Math.max(1, Number(pick(query.page) ?? 1) || 1);
  const search = new URLSearchParams(
    Object.entries({ ...filter, page: String(page) }).filter((e): e is [string, string] =>
      Boolean(e[1]),
    ),
  );
  const data = await platformApi<{
    tenants: TenantRow[];
    total: number;
    page: number;
    pageSize: number;
  }>(`/tenants?${search}`);

  return (
    <div className="flex flex-col gap-4">
      <Form action="/tenants" className="flex flex-wrap items-end gap-2">
        <Input
          name="q"
          defaultValue={filter.q}
          placeholder="Name or organisation id"
          className="w-72"
          aria-label="Search"
        />
        <NativeSelect name="status" defaultValue={filter.status ?? ''} aria-label="Status">
          <NativeSelectOption value="">Any status</NativeSelectOption>
          <NativeSelectOption value="active">Active</NativeSelectOption>
          <NativeSelectOption value="suspended">Suspended</NativeSelectOption>
          <NativeSelectOption value="deleted">Deleted</NativeSelectOption>
        </NativeSelect>
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </Form>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Organisation</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead className="text-right">Events</TableHead>
            <TableHead className="text-right">Members</TableHead>
            <TableHead>Last activity</TableHead>
            <TableHead>Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.tenants.map((tenant) => (
            <TableRow key={tenant.id}>
              <TableCell>
                <Link href={`/tenants/${tenant.id}`} className="font-medium hover:underline">
                  {tenant.name}
                </Link>
                <span className="block font-mono text-xs text-muted-foreground">{tenant.id}</span>
              </TableCell>
              <TableCell>
                <TenantStatusBadge status={tenant.status} />
              </TableCell>
              <TableCell className="text-sm">
                {tenant.owners.length === 0
                  ? '—'
                  : tenant.owners.map((owner) => (
                      <span key={owner.email} className="block">
                        {owner.name}
                        <span className="block text-xs text-muted-foreground">{owner.email}</span>
                      </span>
                    ))}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {tenant.eventCount}
                {tenant.activeEventCount ? (
                  <span className="block text-xs text-muted-foreground">
                    {tenant.activeEventCount} active
                  </span>
                ) : null}
              </TableCell>
              <TableCell className="text-right tabular-nums">{tenant.memberCount}</TableCell>
              <TableCell className="text-sm">
                {tenant.lastActivityAt ? formatDateTime(tenant.lastActivityAt) : '—'}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatDate(tenant.createdAt)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Pager
        path="/tenants"
        params={filter}
        page={data.page}
        pageSize={data.pageSize}
        total={data.total}
        noun={['tenant', 'tenants']}
      />
    </div>
  );
}
