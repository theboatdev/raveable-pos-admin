import { Suspense } from 'react';
import { DeleteTenant } from '@/components/console/delete-tenant';
import { TenantSettingsForm } from '@/components/console/tenant-settings-form';
import { TenantPageSkeleton, TenantShell } from '@/components/console/tenant-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getStaff, tenantRead } from '@/lib/api/server';
import type { TenantDetail } from '@/lib/api/types';

export const metadata = { title: 'Tenant settings' };

export default function Page({ params }: PageProps<'/tenants/[tenantId]/settings'>) {
  return (
    <Suspense fallback={<TenantPageSkeleton />}>
      <Settings params={params} />
    </Suspense>
  );
}

async function Settings({ params }: { params: Promise<{ tenantId: string }> }) {
  const [{ tenantId }, staff] = await Promise.all([params, getStaff()]);
  const { tenant, organisation } = await tenantRead<TenantDetail>(tenantId);
  const isAdmin = staff.role === 'admin';
  const timezones = organisation
    ? [...new Set([...Intl.supportedValuesOf('timeZone'), organisation.settings.timezone])]
    : [];

  return (
    <TenantShell tenant={tenant} tab="settings">
      {organisation ? (
        <Card>
          <CardHeader>
            <CardTitle>Organisation details</CardTitle>
            <CardDescription>
              {tenant.status === 'deleted'
                ? 'The tenant is deleted, so its details can no longer change.'
                : isAdmin
                  ? 'The same settings the Owner sees. Renaming also renames the organisation in Clerk.'
                  : 'Read-only: support staff cannot change tenants.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TenantSettingsForm
              tenantId={tenant.id}
              name={organisation.name}
              settings={organisation.settings}
              timezones={timezones}
              canEdit={isAdmin && tenant.status !== 'deleted'}
            />
          </CardContent>
        </Card>
      ) : (
        <p className="text-sm text-muted-foreground">This tenant’s data has been deleted.</p>
      )}

      {isAdmin && !tenant.deletion?.dataDeletedAt ? (
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle>Delete tenant</CardTitle>
            <CardDescription>
              Removes the organisation from Clerk and drops its database for good. Export its data
              first from the Overview tab if it may be needed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DeleteTenant
              tenantId={tenant.id}
              tenantName={tenant.name}
              clerkDeleted={tenant.status === 'deleted'}
            />
          </CardContent>
        </Card>
      ) : null}
    </TenantShell>
  );
}
