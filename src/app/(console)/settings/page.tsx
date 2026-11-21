import { Suspense } from 'react';
import { FeatureFlags, TenantDefaultsForm } from '@/components/console/settings-forms';
import { InviteStaffForm, StaffInvitations, StaffTable } from '@/components/console/staff-manager';
import { PageBody, PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getStaff, platformApi } from '@/lib/api/server';
import type { PlatformSettings, StaffInvitation, StaffMember } from '@/lib/api/types';

export const metadata = { title: 'Settings' };

export default function Page() {
  return (
    <PageBody>
      <PageHeader
        title="Settings"
        description="Platform staff, defaults for new tenants, and feature flags."
      />
      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
        <Settings />
      </Suspense>
    </PageBody>
  );
}

async function Settings() {
  const [me, { settings }, { staff, invitations }] = await Promise.all([
    getStaff(),
    platformApi<{ settings: PlatformSettings }>('/settings'),
    platformApi<{ staff: StaffMember[]; invitations: StaffInvitation[] }>('/staff'),
  ]);
  const isAdmin = me.role === 'admin';
  const timezones = [
    ...new Set([...Intl.supportedValuesOf('timeZone'), settings.newTenantDefaults.timezone]),
  ].sort();

  return (
    <div className="flex flex-col gap-6">
      {isAdmin ? null : (
        <p className="text-sm text-muted-foreground">
          You have read-only access. Platform admins can change these.
        </p>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Platform staff</CardTitle>
          <CardDescription>
            Admins can change things; support staff can look. Invited people become staff the first
            time they sign in to this console.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {isAdmin ? <InviteStaffForm /> : null}
          <StaffTable staff={staff} me={me.userId} canManage={isAdmin} />
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-medium">Pending invitations</h3>
            <StaffInvitations invitations={invitations} canManage={isAdmin} />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Defaults for new tenants</CardTitle>
          <CardDescription>
            Applied when an organisation is created. Existing tenants keep their own settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TenantDefaultsForm
            defaults={settings.newTenantDefaults}
            timezones={timezones}
            canEdit={isAdmin}
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Feature flags</CardTitle>
          <CardDescription>
            For every tenant. Changes take effect within 15 seconds.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FeatureFlags flags={settings.featureFlags} canEdit={isAdmin} />
        </CardContent>
      </Card>
    </div>
  );
}
