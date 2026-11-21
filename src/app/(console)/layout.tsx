import { Suspense } from 'react';
import { AdminSidebar } from '@/components/shell/admin-sidebar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { ApiError } from '@/lib/api/errors';
import { getStaff } from '@/lib/api/server';
import { PLATFORM_ROLE_LABELS } from '@/lib/format';

/** Platform console shell. Cross-tenant data: every API call is audited (backend ADR-0009). */
export default function ConsoleLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          <span className="text-sm text-muted-foreground">Platform admin</span>
          <Suspense>
            <StaffBadge />
          </Suspense>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}

/**
 * Who is signed in, and whether they can change things. Also routes non-staff away
 * (getStaff redirects). Other API failures show on the page through its error
 * boundary; the layout has none above it, so the badge must not throw them.
 */
async function StaffBadge() {
  let staff;
  try {
    staff = await getStaff();
  } catch (error) {
    if (error instanceof ApiError) return null;
    throw error;
  }
  return (
    <Badge variant={staff.role === 'admin' ? 'default' : 'secondary'} className="ml-auto">
      {PLATFORM_ROLE_LABELS[staff.role]}
    </Badge>
  );
}
