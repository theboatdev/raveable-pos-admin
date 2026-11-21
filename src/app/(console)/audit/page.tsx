import Form from 'next/form';
import { Suspense } from 'react';
import { AuditTable } from '@/components/console/audit-table';
import { Pager } from '@/components/console/pager';
import { PageBody, PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { platformApi } from '@/lib/api/server';
import type { AuditEntry } from '@/lib/api/types';

export const metadata = { title: 'Audit log' };

const pick = (value: string | string[] | undefined) =>
  typeof value === 'string' && value ? value : undefined;

export default function Page({ searchParams }: PageProps<'/audit'>) {
  return (
    <PageBody>
      <PageHeader
        title="Audit log"
        description="Every platform-staff action, including each look at a tenant’s data. Kept for two years."
      />
      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
        <Audit searchParams={searchParams} />
      </Suspense>
    </PageBody>
  );
}

async function Audit({ searchParams }: { searchParams: PageProps<'/audit'>['searchParams'] }) {
  const query = await searchParams;
  const filter = {
    tenantId: pick(query.tenantId),
    action: pick(query.action),
    actorId: pick(query.actorId),
  };
  const page = Math.max(1, Number(pick(query.page) ?? 1) || 1);
  const search = new URLSearchParams(
    Object.entries({ ...filter, page: String(page) }).filter((e): e is [string, string] =>
      Boolean(e[1]),
    ),
  );
  const log = await platformApi<{
    entries: AuditEntry[];
    total: number;
    page: number;
    pageSize: number;
  }>(`/audit?${search}`);

  return (
    <div className="flex flex-col gap-4">
      <Form action="/audit" className="flex flex-wrap items-end gap-2">
        <Input
          name="tenantId"
          defaultValue={filter.tenantId}
          placeholder="Tenant id"
          className="w-56"
          aria-label="Tenant id"
        />
        <Input
          name="action"
          defaultValue={filter.action}
          placeholder="Action, for example platform.tenant"
          className="w-64"
          aria-label="Action"
        />
        <Input
          name="actorId"
          defaultValue={filter.actorId}
          placeholder="Staff user id"
          className="w-56"
          aria-label="Staff user id"
        />
        <Button type="submit" variant="secondary">
          Filter
        </Button>
      </Form>
      <AuditTable entries={log.entries} showTenant />
      <Pager
        path="/audit"
        params={filter}
        page={log.page}
        pageSize={log.pageSize}
        total={log.total}
        noun={['entry', 'entries']}
      />
    </div>
  );
}
