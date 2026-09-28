'use client';

import { useEffect, useState } from 'react';
import { Building2, Save } from 'lucide-react';
import PageHeader from '@/components/dashboard/PageHeader';
import DataState from '@/components/dashboard/DataState';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Skeleton from '@/components/ui/Skeleton';
import { organizationApi, ApiError } from '@/lib/api';
import { useApi } from '@/lib/hooks';

export default function OrganizationPage() {
  const { data: org, status, error, reload } = useApi(() => organizationApi.get(), []);
  const [form, setForm] = useState(null);
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (org) {
      setForm({
        name: org.name || '',
        contactEmail: org.contactEmail || '',
        contactPhone: org.contactPhone || '',
        address: org.address || '',
        timezone: org.timezone || '',
      });
    }
  }, [org]);

  function update(field) {
    return (e) => {
      setForm((f) => ({ ...f, [field]: e.target.value }));
      setSaved(false);
    };
  }

  async function onSubmit(e) {
    e.preventDefault();
    setSaveError('');
    setSaving(true);
    try {
      await organizationApi.update(form);
      setSaved(true);
      reload();
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader title="Organization" description="Your church organization's profile and settings." />

      <DataState
        status={status}
        error={error}
        onRetry={reload}
        isEmpty={false}
        skeleton={<Skeleton className="h-96 w-full max-w-xl" />}
      >
        {form && (
          <Card className="max-w-xl">
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-control bg-primary/10 text-primary">
                <Building2 className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">{org.name}</p>
                <p className="text-xs text-muted">flocks.app/{org.slug}</p>
              </div>
            </div>

            <form onSubmit={onSubmit} className="space-y-4" noValidate>
              {saveError && (
                <div role="alert" className="rounded-control border border-danger/30 bg-danger/10 px-3.5 py-2.5 text-sm text-danger">
                  {saveError}
                </div>
              )}
              {saved && (
                <div role="status" className="rounded-control border border-success/30 bg-success/10 px-3.5 py-2.5 text-sm text-success">
                  Organization settings saved.
                </div>
              )}
              <Input label="Organization name" value={form.name} onChange={update('name')} required />
              <Input label="Contact email" type="email" value={form.contactEmail} onChange={update('contactEmail')} />
              <Input label="Contact phone" value={form.contactPhone} onChange={update('contactPhone')} />
              <Input label="Address" value={form.address} onChange={update('address')} />
              <Input label="Timezone" value={form.timezone} onChange={update('timezone')} placeholder="Africa/Lagos" />
              <div className="flex justify-end pt-2">
                <Button type="submit" loading={saving}>
                  <Save className="h-4 w-4" /> Save Changes
                </Button>
              </div>
            </form>
          </Card>
        )}
      </DataState>
    </div>
  );
}
