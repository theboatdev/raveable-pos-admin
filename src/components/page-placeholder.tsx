import { Badge } from '@/components/ui/badge';

/** Empty page used by the Phase 0 skeleton. Replaced screen by screen from Milestone 1. */
export function PagePlaceholder({
  title,
  description,
  milestone,
}: {
  title: string;
  description: string;
  milestone: string;
}) {
  return (
    <div className="flex flex-1 flex-col gap-4 p-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <Badge variant="secondary">{milestone}</Badge>
      </div>
      <p className="max-w-prose text-muted-foreground">{description}</p>
      <div className="flex min-h-64 flex-1 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
        Not built yet
      </div>
    </div>
  );
}
