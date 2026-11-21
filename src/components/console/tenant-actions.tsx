'use client';

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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { reactivateTenant, suspendTenant } from '@/lib/actions/platform';

/** Suspend (with a reason) or reactivate a tenant. Platform admins only; the API checks. */
export function TenantActions({
  tenantId,
  tenantName,
  suspended,
}: {
  tenantId: string;
  tenantName: string;
  suspended: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setError(null);
      }}
    >
      <DialogTrigger asChild>
        <Button variant={suspended ? 'default' : 'destructive'}>
          {suspended ? 'Reactivate tenant' : 'Suspend tenant'}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {suspended ? `Reactivate ${tenantName}?` : `Suspend ${tenantName}?`}
          </DialogTitle>
          <DialogDescription>
            {suspended
              ? 'Its team and tills can use Raveable again straight away. Sales its tills stored meanwhile will sync.'
              : 'Its team is locked out of the organiser panel and its tills stop selling and syncing. Nothing is deleted. The organisation can see this action in its audit log.'}
          </DialogDescription>
        </DialogHeader>
        <form
          id="tenant-action"
          className="flex flex-col gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            const reason = String(new FormData(event.currentTarget).get('reason') ?? '').trim();
            startTransition(async () => {
              const result = suspended
                ? await reactivateTenant(tenantId)
                : await suspendTenant(tenantId, reason);
              if (result.ok) setOpen(false);
              else setError(result.message ?? 'Something went wrong.');
            });
          }}
        >
          {suspended ? null : (
            <>
              <Label htmlFor="suspend-reason">Reason</Label>
              <Textarea
                id="suspend-reason"
                name="reason"
                required
                minLength={3}
                maxLength={500}
                rows={3}
                placeholder="For example: unpaid invoices since September"
              />
            </>
          )}
        </form>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="tenant-action"
            variant={suspended ? 'default' : 'destructive'}
            disabled={pending}
          >
            {suspended ? 'Reactivate' : 'Suspend'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
