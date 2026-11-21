import { Suspense } from 'react';
import { MemberManager } from '@/components/console/member-manager';
import { TenantPageSkeleton, TenantShell } from '@/components/console/tenant-shell';
import { getStaff, tenantRead } from '@/lib/api/server';
import type { TenantBrief, TenantMember } from '@/lib/api/types';

export const metadata = { title: 'Tenant members' };

export default function Page({ params }: PageProps<'/tenants/[tenantId]/members'>) {
  return (
    <Suspense fallback={<TenantPageSkeleton />}>
      <Members params={params} />
    </Suspense>
  );
}

async function Members({ params }: { params: Promise<{ tenantId: string }> }) {
  const [{ tenantId }, staff] = await Promise.all([params, getStaff()]);
  const { tenant, members } = await tenantRead<{ tenant: TenantBrief; members: TenantMember[] }>(
    tenantId,
    '/members',
  );
  const canManage = staff.role === 'admin' && tenant.status !== 'deleted';
  return (
    <TenantShell
      tenant={tenant}
      tab="members"
      description="People in the organisation, from Clerk, with their Raveable roles."
    >
      {canManage ? (
        <p className="max-w-prose text-sm text-muted-foreground">
          Making someone Owner gives them full control; to transfer ownership, make the new person
          Owner, then change the old Owner’s role. A tenant always keeps at least one Owner. Changes
          appear in the tenant’s audit trail as Raveable staff.
        </p>
      ) : null}
      <MemberManager tenantId={tenant.id} members={members} canManage={canManage} />
    </TenantShell>
  );
}
