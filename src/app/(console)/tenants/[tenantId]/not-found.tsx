import Link from 'next/link';
import { PageBody, PageHeader } from '@/components/page-header';

export default function TenantNotFound() {
  return (
    <PageBody>
      <PageHeader title="Tenant not found" description="No organisation has that id." />
      <Link href="/tenants" className="text-sm underline">
        Back to tenants
      </Link>
    </PageBody>
  );
}
