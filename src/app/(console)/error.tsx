'use client';

import { RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ConsoleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-start gap-4 p-6">
      <h1 className="text-2xl font-semibold tracking-tight">This page could not load</h1>
      <p className="max-w-prose text-muted-foreground">
        The Raveable API may be down or unreachable.
        {error.digest ? ` Reference: ${error.digest}.` : ''}
      </p>
      <Button variant="outline" onClick={reset}>
        <RotateCw />
        Try again
      </Button>
    </div>
  );
}
