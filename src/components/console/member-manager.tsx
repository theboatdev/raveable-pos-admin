'use client';

import { Trash2 } from 'lucide-react';
import { useState, useTransition } from 'react';
import { ConfirmAction } from '@/components/confirm-action';
import { Button } from '@/components/ui/button';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { changeTenantMemberRole, removeTenantMember } from '@/lib/actions/platform';
import type { TenantMember, TenantRole } from '@/lib/api/types';
import { TENANT_ROLES, TENANT_ROLE_LABELS, formatDate } from '@/lib/format';

/**
 * A tenant's people. Platform admins can change roles (making someone Owner transfers
 * ownership) and remove people; the API keeps at least one Owner.
 */
export function MemberManager({
  tenantId,
  members,
  canManage,
}: {
  tenantId: string;
  members: TenantMember[];
  canManage: boolean;
}) {
  if (members.length === 0) {
    return (
      <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
        No members found in Clerk.
      </p>
    );
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Joined</TableHead>
          {canManage ? <TableHead className="w-12" /> : null}
        </TableRow>
      </TableHeader>
      <TableBody>
        {members.map((member) => (
          <MemberRow
            key={`${member.userId}:${member.role}`}
            tenantId={tenantId}
            member={member}
            canManage={canManage}
          />
        ))}
      </TableBody>
    </Table>
  );
}

function MemberRow({
  tenantId,
  member,
  canManage,
}: {
  tenantId: string;
  member: TenantMember;
  canManage: boolean;
}) {
  const [role, setRole] = useState<TenantRole>(member.role);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  return (
    <TableRow>
      <TableCell>
        <span className="font-medium">{member.name}</span>
        <span className="block text-xs text-muted-foreground">{member.email}</span>
      </TableCell>
      <TableCell>
        {canManage ? (
          <div className="flex flex-col gap-1">
            <NativeSelect
              size="sm"
              aria-label={`Role for ${member.name}`}
              value={role}
              disabled={pending}
              onChange={(event) => {
                const next = event.target.value as TenantRole;
                setRole(next);
                setError(null);
                startTransition(async () => {
                  const result = await changeTenantMemberRole(tenantId, member.userId, next);
                  if (!result.ok) {
                    setRole(member.role);
                    setError(result.message ?? 'Could not change the role.');
                  }
                });
              }}
            >
              {TENANT_ROLES.map((option) => (
                <NativeSelectOption key={option} value={option}>
                  {TENANT_ROLE_LABELS[option]}
                </NativeSelectOption>
              ))}
            </NativeSelect>
            {error ? <p className="text-xs text-destructive">{error}</p> : null}
          </div>
        ) : (
          <span className="text-sm">{TENANT_ROLE_LABELS[member.role]}</span>
        )}
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">{formatDate(member.joinedAt)}</TableCell>
      {canManage ? (
        <TableCell>
          <ConfirmAction
            trigger={
              <Button variant="ghost" size="icon" aria-label={`Remove ${member.name}`}>
                <Trash2 />
              </Button>
            }
            title={`Remove ${member.name}?`}
            description="They lose access to this organisation and its tills straight away, and their event and gate assignments are cleared. The organisation sees this in its audit log."
            confirmLabel="Remove"
            action={() => removeTenantMember(tenantId, member.userId)}
          />
        </TableCell>
      ) : null}
    </TableRow>
  );
}
