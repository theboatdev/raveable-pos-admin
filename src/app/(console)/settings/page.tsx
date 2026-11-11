import { PagePlaceholder } from '@/components/page-placeholder';

export const metadata = { title: 'Settings' };

export default function Page() {
  return (
    <PagePlaceholder
      title="Settings"
      description="Platform staff, defaults for new tenants (currency LKR, timezone Asia/Colombo) and feature flags."
      milestone="Post-MVP"
    />
  );
}
