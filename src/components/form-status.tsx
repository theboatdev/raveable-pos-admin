import { CircleAlert, CircleCheck } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { ActionState } from '@/lib/api/errors';

/** The outcome of the last submit: an error, or a confirmation. */
export function FormStatus({ state }: { state: ActionState }) {
  if (!state.message) return null;
  return (
    <Alert variant={state.ok ? 'default' : 'destructive'} role={state.ok ? 'status' : 'alert'}>
      {state.ok ? <CircleCheck /> : <CircleAlert />}
      <AlertDescription>{state.message}</AlertDescription>
    </Alert>
  );
}
