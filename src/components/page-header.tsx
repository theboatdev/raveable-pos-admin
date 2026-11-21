import { Badge } from '@/components/ui/badge';

/** Title row shared by every built page. */
export function PageHeader({
  title,
  description,
  badge,
  actions,
}: {
  title: string;
  description?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {typeof badge === 'string' ? <Badge variant="secondary">{badge}</Badge> : badge}
        </div>
        {description ? <p className="max-w-prose text-muted-foreground">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

/** Page body: padding and vertical rhythm. */
export function PageBody({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-1 flex-col gap-6 p-6">{children}</div>;
}
