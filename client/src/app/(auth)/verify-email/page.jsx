'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import AuthCard from '@/components/layout/AuthCard';
import { authApi, ApiError } from '@/lib/api';

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailContent />
    </Suspense>
  );
}

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [state, setState] = useState(token ? 'verifying' : 'missing');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    authApi
      .verifyEmail(token)
      .then(() => {
        if (!cancelled) setState('success');
      })
      .catch((err) => {
        if (!cancelled) {
          setState('error');
          setMessage(err instanceof ApiError ? err.message : 'This verification link is invalid or has expired.');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  if (state === 'missing') {
    return (
      <AuthCard title="Verify your email">
        <p className="text-sm text-foreground-secondary">
          This link is missing its verification token. Please use the link from the email we sent you, or{' '}
          <Link href="/login" className="font-medium text-primary hover:underline">
            sign in
          </Link>{' '}
          to request a new one.
        </p>
      </AuthCard>
    );
  }

  if (state === 'verifying') {
    return (
      <AuthCard title="Verifying your email...">
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </AuthCard>
    );
  }

  if (state === 'success') {
    return (
      <AuthCard title="Email verified">
        <div className="flex flex-col items-center gap-3 py-2 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10 text-success">
            <CheckCircle2 className="h-6 w-6" />
          </span>
          <p className="text-sm text-foreground-secondary">Your email has been verified.</p>
          <Link href="/login" className="mt-2 text-sm font-medium text-primary hover:underline">
            Continue to sign in
          </Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Verification failed">
      <div className="flex flex-col items-center gap-3 py-2 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-danger/10 text-danger">
          <XCircle className="h-6 w-6" />
        </span>
        <p className="text-sm text-foreground-secondary">{message}</p>
        <Link href="/login" className="mt-2 text-sm font-medium text-primary hover:underline">
          Back to sign in
        </Link>
      </div>
    </AuthCard>
  );
}
