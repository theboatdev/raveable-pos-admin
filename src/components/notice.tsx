import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/** A message in place of content. */
export function Notice({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {children ? <CardDescription>{children}</CardDescription> : null}
      </CardHeader>
    </Card>
  );
}
