'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { deleteTenant } from '@/lib/actions/platform';
import { tenantHref } from '@/lib/navigation';

/**
 * Deletes a tenant for good, after typing its name. Platform admins only; the API
 * checks the name too.
 */
export function DeleteTenant({
  tenantId,
  tenantName,
  clerkDeleted,
}: {
  tenantId: string;
  tenantName: string;
  /** Already deleted in Clerk: this deletes the data that was kept. */
  clerkDeleted: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          setTyped('');
          setError(null);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="destructive">{clerkDeleted ? 'Delete data' : 'Delete tenant'}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete {tenantName}?</DialogTitle>
          <DialogDescription>
            This removes the organisation from Clerk, so its people lose access, and drops its
            database: events, orders, customers, shifts and its audit trail. It cannot be undone.
            Export the data first if it may be needed. A record that the tenant existed stays in the
            platform audit log.
          </DialogDescription>
        </DialogHeader>
        <form
          id="delete-tenant"
          className="flex flex-col gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            startTransition(async () => {
              const result = await deleteTenant(tenantId, typed);
              if (result.ok) {
                setOpen(false);
                router.push(tenantHref(tenantId));
              } else {
                setError(result.message ?? 'Something went wrong.');
              }
            });
          }}
        >
          <Label htmlFor="delete-confirm">
            Type <span className="font-semibold">{tenantName}</span> to confirm
          </Label>
          <Input
            id="delete-confirm"
            value={typed}
            onChange={(event) => setTyped(event.target.value)}
            autoComplete="off"
          />
        </form>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="delete-tenant"
            variant="destructive"
            disabled={pending || typed.trim() !== tenantName}
          >
            Delete permanently
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
