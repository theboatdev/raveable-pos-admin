import { SignOutButton } from '@clerk/nextjs';
import { Suspense } from 'react';
import { Button } from '@/components/ui/button';

export const metadata = { title: 'No access' };

/** Signed in, but not Raveable platform staff (the API said NOT_PLATFORM_STAFF). */
export default function NoAccessPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">This account is not platform staff</h1>
      <p className="max-w-md text-muted-foreground">
        The Raveable console is for Raveable staff. Organisers and cashiers use the organiser app
        instead. If you are staff, ask a platform admin to invite this email address, then sign in
        again.
      </p>
      <Suspense>
        <SignOutButton redirectUrl="/sign-in">
          <Button variant="outline">Sign out</Button>
        </SignOutButton>
      </Suspense>
    </main>
  );
}
