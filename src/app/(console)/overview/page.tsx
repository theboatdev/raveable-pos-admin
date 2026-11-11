import { PagePlaceholder } from '@/components/page-placeholder';

export const metadata = { title: 'Overview' };

export default function Page() {
  return (
    <PagePlaceholder
      title="Overview"
      description="Platform health at a glance: tenant count, active events, devices online, recorded sales volume."
      milestone="Post-MVP"
    />
  );
}
