import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { AuditEntry } from '@/lib/api/types';
import { describeAction, isChange, summariseDetails } from '@/lib/audit';
import { formatDateTime } from '@/lib/format';

/**
 * Audit entries. Platform staff are shown by name; organiser actors (in a tenant's trail)
 * by id and role, since their names live in the tenant's Clerk organisation.
 */
export function AuditTable({
  entries,
  showTenant = false,
}: {
  entries: AuditEntry[];
  showTenant?: boolean;
}) {
  if (entries.length === 0) {
    return (
      <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
        No entries.
      </p>
    );
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>When</TableHead>
          <TableHead>Who</TableHead>
          <TableHead>What</TableHead>
          {showTenant ? <TableHead>Tenant</TableHead> : null}
          <TableHead>Details</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {entries.map((entry) => (
          <TableRow key={entry.id}>
            <TableCell className="text-sm whitespace-nowrap">{formatDateTime(entry.at)}</TableCell>
            <TableCell className="text-sm">
              {entry.scope === 'platform' ? (
                <>
                  {entry.actorName ?? entry.actorId}
                  <span className="block text-xs text-muted-foreground">Raveable staff</span>
                </>
              ) : (
                <>
                  {entry.actorName ?? <span className="font-mono text-xs">{entry.actorId}</span>}
                  <span className="block text-xs text-muted-foreground">
                    Organiser ({entry.actorRole})
                  </span>
                </>
              )}
            </TableCell>
            <TableCell className="text-sm">
              <span className="flex flex-wrap items-center gap-2">
                {describeAction(entry.action)}
                {isChange(entry) ? <Badge variant="outline">Change</Badge> : null}
              </span>
              {entry.target.label ? (
                <span className="block text-xs text-muted-foreground">{entry.target.label}</span>
              ) : null}
            </TableCell>
            {showTenant ? (
              <TableCell className="text-sm">
                {entry.orgId ? (
                  <Link
                    href={`/tenants/${entry.orgId}`}
                    className="font-mono text-xs hover:underline"
                  >
                    {entry.orgId}
                  </Link>
                ) : (
                  '—'
                )}
              </TableCell>
            ) : null}
            <TableCell
              className="max-w-md truncate text-xs text-muted-foreground"
              title={summariseDetails(entry.details)}
            >
              {summariseDetails(entry.details)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
