'use client';

import { useState } from 'react';
import { Sun, Moon, Monitor, Mail, LogOut } from 'lucide-react';
import { useTheme } from 'next-themes';
import PageHeader from '@/components/dashboard/PageHeader';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { useAuth } from '@/context/AuthContext';
import { authApi, ApiError } from '@/lib/api';
const THEME_OPTIONS = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
];

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { user, member, logout } = useAuth();
  const [resendState, setResendState] = useState('idle'); // idle | sending | sent | error
  const [resendError, setResendError] = useState('');

  async function handleResendVerification() {
    setResendState('sending');
    setResendError('');
    try {
      await authApi.resendVerification();
      setResendState('sent');
    } catch (err) {
      setResendState('error');
      setResendError(err instanceof ApiError ? err.message : 'Something went wrong.');
    }
  }

  return (
    <div>
      <PageHeader title="Settings" description="Your account and appearance preferences." />

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Account</CardTitle>
          </CardHeader>
          <dl className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-muted">Name</dt>
              <dd className="font-medium text-foreground">{member ? `${member.firstName} ${member.lastName}` : '—'}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted">Email</dt>
              <dd className="font-medium text-foreground">{user?.email}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted">Email verification</dt>
              <dd>
                {user?.isEmailVerified ? (
                  <Badge tone="green">Verified</Badge>
                ) : (
                  <Badge tone="amber">Not verified</Badge>
                )}
              </dd>
            </div>
          </dl>

          {!user?.isEmailVerified && (
            <div className="mt-4 rounded-control border border-warning/30 bg-warning/10 p-3.5">
              <p className="mb-2 flex items-center gap-1.5 text-sm text-foreground">
                <Mail className="h-4 w-4" /> Verify your email to secure your account.
              </p>
              {resendState === 'sent' ? (
                <p className="text-xs text-success">Verification email sent - check your inbox.</p>
              ) : (
                <Button size="sm" variant="secondary" onClick={handleResendVerification} loading={resendState === 'sending'}>
                  Resend verification email
                </Button>
              )}
              {resendState === 'error' && <p className="mt-1.5 text-xs text-danger">{resendError}</p>}
            </div>
          )}

          <div className="mt-5 border-t border-border-subtle pt-4">
            <Button variant="secondary" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4" /> Sign Out
            </Button>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Appearance</CardTitle>
          </CardHeader>
          <p className="mb-4 text-sm text-muted">Choose how Flocks looks on this device.</p>
          <div className="grid grid-cols-3 gap-2">
            {THEME_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setTheme(opt.value)}
                className={`flex flex-col items-center gap-2 rounded-control border p-4 text-sm transition-colors ${
                  theme === opt.value ? 'border-primary bg-primary/5 text-primary' : 'border-border text-foreground-secondary hover:bg-surface-secondary'
                }`}
              >
                <opt.icon className="h-5 w-5" />
                {opt.label}
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
