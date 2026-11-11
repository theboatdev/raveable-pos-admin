'use client';

import { UserButton } from '@clerk/nextjs';
import {
  Building2,
  LayoutDashboard,
  ScrollText,
  Settings,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Suspense } from 'react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import { ADMIN_NAV, getActiveNav, type AdminNavKey } from '@/lib/navigation';

const ICONS: Record<AdminNavKey, LucideIcon> = {
  overview: LayoutDashboard,
  tenants: Building2,
  audit: ScrollText,
  settings: Settings,
};

/** Reads the URL, so it renders inside <Suspense> (cacheComponents prerenders the rest). */
function AdminNav() {
  const active = getActiveNav(usePathname());
  return (
    <SidebarMenu>
      {ADMIN_NAV.map((item) => {
        const Icon = ICONS[item.key];
        return (
          <SidebarMenuItem key={item.key}>
            <SidebarMenuButton asChild isActive={item.key === active} tooltip={item.title}>
              <Link href={item.href}>
                <Icon />
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}

function AdminNavSkeleton() {
  return (
    <SidebarMenu>
      {ADMIN_NAV.map((item) => (
        <SidebarMenuItem key={item.key} className="flex h-8 items-center gap-2 px-2">
          <Skeleton className="size-4 rounded-md" />
          <Skeleton className="h-4 w-3/4" />
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}

export function AdminSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1.5">
          <ShieldCheck className="size-5 shrink-0" aria-hidden />
          <span className="truncate font-semibold group-data-[collapsible=icon]:hidden">
            Raveable Platform
          </span>
          <Badge variant="outline" className="ml-auto group-data-[collapsible=icon]:hidden">
            Internal
          </Badge>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <Suspense fallback={<AdminNavSkeleton />}>
              <AdminNav />
            </Suspense>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <UserButton showName />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
