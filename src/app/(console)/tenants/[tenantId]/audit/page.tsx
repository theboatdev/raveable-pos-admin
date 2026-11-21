import { Suspense } from 'react';
import { AuditTable } from '@/components/console/audit-table';
import { Pager } from '@/components/console/pager';
import { TenantPageSkeleton, TenantShell } from '@/components/console/tenant-shell';
import { tenantRead } from '@/lib/api/server';
import type { AuditEntry, TenantBrief } from '@/lib/api/types';
import { tenantHref } from '@/lib/navigation';

export const metadata = { title: 'Tenant audit trail' };

export default function Page({ params, searchParams }: PageProps<'/tenants/[tenantId]/audit'>) {
  return (
    <Suspense fallback={<TenantPageSkeleton />}>
      <Trail params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function Trail({
  params,
  searchParams,
}: {
  params: Promise<{ tenantId: string }>;
  searchParams: PageProps<'/tenants/[tenantId]/audit'>['searchParams'];
}) {
  const [{ tenantId }, query] = await Promise.all([params, searchParams]);
  const page = Math.max(1, Number(typeof query.page === 'string' ? query.page : 1) || 1);
  // Reads the tenant directly: its audit trail stays readable after its data is deleted.
  const trail = await tenantRead<{
    tenant: TenantBrief;
    entries: AuditEntry[];
    total: number;
    page: number;
    pageSize: number;
  }>(tenantId, `/audit?page=${page}`);

  return (
    <TenantShell
      tenant={trail.tenant}
      tab="audit"
      description="What the organisation’s people and Raveable staff did, newest first. Kept two years."
    >
      <AuditTable entries={trail.entries} />
      <Pager
        path={tenantHref(trail.tenant.id, 'audit')}
        params={{}}
        page={trail.page}
        pageSize={trail.pageSize}
        total={trail.total}
        noun={['entry', 'entries']}
      />
    </TenantShell>
  );
}
