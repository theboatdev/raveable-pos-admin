'use client';

import { Trash2, X } from 'lucide-react';
import { useActionState, useState, useTransition } from 'react';
import { ConfirmAction } from '@/components/confirm-action';
import { FormField } from '@/components/form-field';
import { FormStatus } from '@/components/form-status';
import { SubmitButton } from '@/components/submit-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  changeStaffRole,
  inviteStaff,
  removeStaff,
  revokeStaffInvitation,
} from '@/lib/actions/platform';
import { initialActionState } from '@/lib/api/errors';
import type { PlatformRole, StaffInvitation, StaffMember } from '@/lib/api/types';
import { PLATFORM_ROLE_LABELS, formatDate } from '@/lib/format';

const ROLES: PlatformRole[] = ['support', 'admin'];

export function InviteStaffForm() {
  const [state, action] = useActionState(inviteStaff, initialActionState);
  return (
    <form action={action} className="flex flex-col gap-3" key={state.at}>
      <div className="grid gap-3 sm:grid-cols-[1fr_14rem_auto] sm:items-end">
        <FormField label="Email" htmlFor="staff-email" error={state.fieldErrors?.email}>
          <Input
            id="staff-email"
            name="email"
            type="email"
            required
            placeholder="name@raveable.lk"
          />
        </FormField>
        <FormField label="Role" htmlFor="staff-role" error={state.fieldErrors?.role}>
          <NativeSelect id="staff-role" name="role" defaultValue="support" className="w-full">
            {ROLES.map((role) => (
              <NativeSelectOption key={role} value={role}>
                {PLATFORM_ROLE_LABELS[role]}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </FormField>
        <SubmitButton>Invite</SubmitButton>
      </div>
      <FormStatus state={state} />
    </form>
  );
}

export function StaffTable({
  staff,
  me,
  canManage,
}: {
  staff: StaffMember[];
  me: string;
  canManage: boolean;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Since</TableHead>
          {canManage ? <TableHead className="w-12" /> : null}
        </TableRow>
      </TableHeader>
      <TableBody>
        {staff.map((member) => (
          <StaffRow
            key={`${member.userId}:${member.role}`}
            member={member}
            isMe={member.userId === me}
            canManage={canManage}
          />
        ))}
      </TableBody>
    </Table>
  );
}

function StaffRow({
  member,
  isMe,
  canManage,
}: {
  member: StaffMember;
  isMe: boolean;
  canManage: boolean;
}) {
  const [role, setRole] = useState<PlatformRole>(member.role);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const editable = canManage && !isMe;
  return (
    <TableRow>
      <TableCell className="font-medium">
        {member.name} {isMe ? <Badge variant="secondary">You</Badge> : null}
      </TableCell>
      <TableCell className="text-sm">{member.email ?? '—'}</TableCell>
      <TableCell>
        {editable ? (
          <div className="flex flex-col gap-1">
            <NativeSelect
              size="sm"
              aria-label={`Role for ${member.name}`}
              value={role}
              disabled={pending}
              onChange={(event) => {
                const next = event.target.value as PlatformRole;
                setRole(next);
                setError(null);
                startTransition(async () => {
                  const result = await changeStaffRole(member.userId, next);
                  if (!result.ok) {
                    setRole(member.role);
                    setError(result.message ?? 'Could not change the role.');
                  }
                });
              }}
            >
              {ROLES.map((option) => (
                <NativeSelectOption key={option} value={option}>
                  {PLATFORM_ROLE_LABELS[option]}
                </NativeSelectOption>
              ))}
            </NativeSelect>
            {error ? <span className="text-sm text-destructive">{error}</span> : null}
          </div>
        ) : (
          PLATFORM_ROLE_LABELS[member.role]
        )}
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">{formatDate(member.addedAt)}</TableCell>
      {canManage ? (
        <TableCell>
          {editable ? (
            <ConfirmAction
              trigger={
                <Button variant="ghost" size="icon-sm" aria-label={`Remove ${member.name}`}>
                  <Trash2 />
                </Button>
              }
              title={`Remove ${member.name}?`}
              description="They lose access to the console at once. Their past actions stay in the audit log."
              confirmLabel="Remove"
              action={() => removeStaff(member.userId)}
            />
          ) : null}
        </TableCell>
      ) : null}
    </TableRow>
  );
}

export function StaffInvitations({
  invitations,
  canManage,
}: {
  invitations: StaffInvitation[];
  canManage: boolean;
}) {
  if (invitations.length === 0)
    return <p className="text-sm text-muted-foreground">No pending invitations.</p>;
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Invited</TableHead>
          {canManage ? <TableHead className="w-12" /> : null}
        </TableRow>
      </TableHeader>
      <TableBody>
        {invitations.map((invitation) => (
          <TableRow key={invitation.id}>
            <TableCell className="font-medium">{invitation.email}</TableCell>
            <TableCell>{PLATFORM_ROLE_LABELS[invitation.role]}</TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {formatDate(invitation.invitedAt)}
            </TableCell>
            {canManage ? (
              <TableCell>
                <ConfirmAction
                  trigger={
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Revoke ${invitation.email}`}
                    >
                      <X />
                    </Button>
                  }
                  title="Revoke this invitation?"
                  description={`${invitation.email} will not become staff by signing in.`}
                  confirmLabel="Revoke"
                  action={() => revokeStaffInvitation(invitation.id)}
                />
              </TableCell>
            ) : null}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
