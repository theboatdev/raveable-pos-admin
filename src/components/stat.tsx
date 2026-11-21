import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/** One headline figure. */
export function Stat({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl tabular-nums">{value}</CardTitle>
      </CardHeader>
      {detail ? (
        <CardContent className="text-sm text-muted-foreground">{detail}</CardContent>
      ) : null}
    </Card>
  );
}

/** A thin bar for "x of y". */
export function Meter({ value, max, label }: { value: number; max: number; label: string }) {
  const percent = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div
      className="h-2 w-full overflow-hidden rounded-full bg-muted"
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
    >
      <div
        className={`h-full rounded-full ${value > max ? 'bg-destructive' : 'bg-primary'}`}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
