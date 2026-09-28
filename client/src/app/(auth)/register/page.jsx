'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthCard from '@/components/layout/AuthCard';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { authApi, ApiError } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

const initialForm = {
  organizationName: '',
  adminFirstName: '',
  adminLastName: '',
  adminEmail: '',
  password: '',
  confirmPassword: '',
};

export default function RegisterPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, ...payload } = form;
      await authApi.registerOrganization(payload);
      await refresh();
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="Create your Flocks account"
      subtitle="Set up your church organization in a few minutes."
      footer={
        <>
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {error && (
          <div role="alert" className="rounded-control border border-danger/30 bg-danger/10 px-3.5 py-2.5 text-sm text-danger">
            {error}
          </div>
        )}

        <Input
          label="Church / Organization name"
          placeholder="Grace Fellowship"
          value={form.organizationName}
          onChange={update('organizationName')}
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <Input label="First name" value={form.adminFirstName} onChange={update('adminFirstName')} required autoComplete="given-name" />
          <Input label="Last name" value={form.adminLastName} onChange={update('adminLastName')} required autoComplete="family-name" />
        </div>

        <Input
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@church.org"
          value={form.adminEmail}
          onChange={update('adminEmail')}
          required
        />

        <Input
          label="Password"
          type="password"
          autoComplete="new-password"
          hint="At least 8 characters."
          value={form.password}
          onChange={update('password')}
          required
        />
        <Input
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          value={form.confirmPassword}
          onChange={update('confirmPassword')}
          required
        />

        <Button type="submit" className="w-full" loading={loading}>
          Create Account
        </Button>

        <p className="text-center text-xs text-muted">
          You&apos;ll be set up as the Super Admin for your organization, with a Main Parish created automatically.
        </p>
      </form>
    </AuthCard>
  );
}
