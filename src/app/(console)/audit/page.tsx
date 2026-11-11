import { PagePlaceholder } from '@/components/page-placeholder';

export const metadata = { title: 'Audit log' };

export default function Page() {
  return (
    <PagePlaceholder
      title="Audit log"
      description="Every platform-staff action, including each cross-tenant read."
      milestone="Post-MVP"
    />
  );
}
