'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

/**
 * The real authentication boundary on the client: middleware.js only
 * checks whether an auth cookie exists (fast, but can't validate it).
 * This component waits for AuthContext to actually confirm the session
 * with the backend (GET /auth/me, with a refresh attempt built in) and
 * redirects to /login if that fails - e.g. an expired refresh token, a
 * revoked session, or a stale cookie with no backend session behind it.
 */
export default function AuthGuard({ children }) {
  const { status } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [status, router, pathname]);

  if (status === 'loading') {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" aria-label="Loading" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null; // redirect is in flight
  }

  return children;
}
