import Link from 'next/link';
import { PageBody, PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import type { TenantStatus } from '@/lib/api/types';
import { TENANT_STATUS_LABELS } from '@/lib/format';
import { TENANT_TABS, type TenantTab, tenantHref } from '@/lib/navigation';
import { cn } from '@/lib/utils';

export function TenantStatusBadge({ status }: { status: TenantStatus }) {
  return (
    <Badge variant={status === 'active' ? 'outline' : 'destructive'}>
      {TENANT_STATUS_LABELS[status]}
    </Badge>
  );
}

/**
 * The frame of every page about one tenant: back link, name and status, actions, and
 * the tenant's tabs. Each page passes the tenant it already loaded, so no extra (audited)
 * call is made just to draw the frame.
 */
export function TenantShell({
  tenant,
  tab,
  description,
  actions,
  children,
}: {
  tenant: { id: string; name: string; status: TenantStatus };
  tab: TenantTab;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <PageBody>
      <div className="flex flex-col gap-3">
        <Link href="/tenants" className="text-sm text-muted-foreground hover:underline">
          ← Tenants
        </Link>
        <PageHeader
          title={tenant.name}
          description={description}
          badge={<TenantStatusBadge status={tenant.status} />}
          actions={actions}
        />
        <nav aria-label="Tenant" className="flex gap-1 overflow-x-auto border-b">
          {TENANT_TABS.map((item) => (
            <Link
              key={item.key}
              href={tenantHref(tenant.id, item.segment)}
              aria-current={item.key === tab ? 'page' : undefined}
              className={cn(
                '-mb-px border-b-2 px-3 py-2 text-sm whitespace-nowrap transition-colors',
                item.key === tab
                  ? 'border-primary font-medium text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              )}
            >
              {item.title}
            </Link>
          ))}
        </nav>
      </div>
      {children}
    </PageBody>
  );
}

/** Loading state for a tenant page. */
export function TenantPageSkeleton() {
  return (
    <PageBody>
      <div className="h-24 w-full animate-pulse rounded-lg bg-muted" />
      <div className="h-96 w-full animate-pulse rounded-lg bg-muted" />
    </PageBody>
  );
}
