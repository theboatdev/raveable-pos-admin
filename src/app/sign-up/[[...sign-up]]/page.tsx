import { SignUp } from '@clerk/nextjs';
import { Suspense } from 'react';

export const metadata = { title: 'Accept invitation' };

/**
 * Where staff invitation emails land. Sign-up is invitation-only: set the staff Clerk
 * application's sign-up mode to Restricted. Being invited to Clerk alone grants nothing;
 * the API's staff list decides (backend ADR-0009).
 */
export default function SignUpPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
      <p className="max-w-sm text-center text-sm text-muted-foreground">
        Raveable staff only. Accept the invitation from your email to create your account.
      </p>
      <Suspense>
        <SignUp />
      </Suspense>
    </main>
  );
}
