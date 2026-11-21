import Link from 'next/link';
import { Button } from '@/components/ui/button';

/** Previous / next links that keep the current query. */
export function Pager({
  path,
  params,
  page,
  pageSize,
  total,
  noun,
}: {
  path: string;
  params: Record<string, string | undefined>;
  page: number;
  pageSize: number;
  total: number;
  noun: [string, string];
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const href = (target: number) => {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) if (value) search.set(key, value);
    if (target > 1) search.set('page', String(target));
    const query = search.toString();
    return query ? `${path}?${query}` : path;
  };
  return (
    <div className="flex items-center justify-between text-sm text-muted-foreground">
      <span>
        {total.toLocaleString()} {total === 1 ? noun[0] : noun[1]}
        {pages > 1 ? ` · page ${page} of ${pages}` : ''}
      </span>
      {pages > 1 ? (
        <span className="flex gap-2">
          {page > 1 ? (
            <Button asChild variant="outline" size="sm">
              <Link href={href(page - 1)}>Previous</Link>
            </Button>
          ) : null}
          {page < pages ? (
            <Button asChild variant="outline" size="sm">
              <Link href={href(page + 1)}>Next</Link>
            </Button>
          ) : null}
        </span>
      ) : null}
    </div>
  );
}
