import { SignIn } from '@clerk/nextjs';
import { Suspense } from 'react';

export const metadata = { title: 'Sign in' };

export default function SignInPage() {
  return (
    <main className="flex flex-1 items-center justify-center p-6">
      {/* Clerk reads the URL (usePathname), so it streams in after the static shell. */}
      <Suspense>
        <SignIn />
      </Suspense>
    </main>
  );
}
