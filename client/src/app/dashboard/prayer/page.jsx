'use client';

import { useState } from 'react';
import { Plus, Lock, HandHeart } from 'lucide-react';
import PageHeader from '@/components/dashboard/PageHeader';
import DataState from '@/components/dashboard/DataState';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import Skeleton from '@/components/ui/Skeleton';
import { prayerApi, ApiError } from '@/lib/api';
import { useApi } from '@/lib/hooks';

const STATUS_TONE = {
  SUBMITTED: 'neutral', ACTIVE: 'blue', BEING_PRAYED_FOR: 'purple', FOLLOW_UP: 'amber', ANSWERED: 'green', CONTINUING: 'blue',
};

const CATEGORIES = ['HEALTH', 'FAMILY', 'CAREER', 'FINANCE', 'SPIRITUAL', 'MARRIAGE', 'CHILDREN', 'THANKSGIVING', 'OTHER'];
const VISIBILITIES = [
  { value: 'PRIVATE', label: 'Private (only me and pastors with access)' },
  { value: 'PASTOR_CARE_TEAM', label: 'Pastor / Care Team' },
  { value: 'CHURCH_WIDE', label: 'Church-wide' },
];

function PrayerSkeleton() {
  return (
    <div className="space-y-3 p-1">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full" />
      ))}
    </div>
  );
}

export default function PrayerPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const { data: requests, status, error, reload } = useApi(() => prayerApi.list(), []);
  const isEmpty = status === 'success' && (!requests || requests.length === 0);

  return (
    <div>
      <PageHeader
        title="Prayer"
        description="Requests, visibility, and pastoral follow-up - always with member-controlled privacy."
        actions={
          <Button size="sm" onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" /> New Request
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Prayer Requests</CardTitle>
        </CardHeader>

        <DataState
          status={status}
          error={error}
          onRetry={reload}
          isEmpty={isEmpty}
          skeleton={<PrayerSkeleton />}
          emptyState={
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
              <HandHeart className="mb-1 h-8 w-8 text-muted" />
              <p className="text-sm font-medium text-foreground">No prayer requests yet</p>
              <p className="max-w-xs text-sm text-muted">Requests you submit or have access to will appear here.</p>
            </div>
          }
        >
          <ul className="divide-y divide-border-subtle">
            {(requests || []).map((req) => (
              <li key={req._id} className="flex items-center gap-4 py-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-purple/10 text-accent-purple">
                  <HandHeart className="h-4.5 w-4.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{req.title}</p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
                    {req.member ? `${req.member.firstName} ${req.member.lastName}` : 'Anonymous'} •{' '}
                    {new Date(req.createdAt).toLocaleDateString()}
                    {req.visibility === 'PRIVATE' && (
                      <span className="ml-1 inline-flex items-center gap-1 text-muted">
                        <Lock className="h-3 w-3" /> Private
                      </span>
                    )}
                  </p>
                </div>
                <Badge tone={STATUS_TONE[req.status] || 'neutral'}>{req.status.replace(/_/g, ' ')}</Badge>
              </li>
            ))}
          </ul>
        </DataState>
      </Card>

      <NewPrayerRequestModal open={modalOpen} onClose={() => setModalOpen(false)} onCreated={reload} />
    </div>
  );
}

function NewPrayerRequestModal({ open, onClose, onCreated }) {
  const initial = { title: '', description: '', category: 'OTHER', visibility: 'PRIVATE' };
  const [form, setForm] = useState(initial);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await prayerApi.create(form);
      setForm(initial);
      onCreated();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="New Prayer Request">
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {error && (
          <div role="alert" className="rounded-control border border-danger/30 bg-danger/10 px-3.5 py-2.5 text-sm text-danger">
            {error}
          </div>
        )}
        <Input label="Title" value={form.title} onChange={update('title')} required placeholder="Healing for my mother" />
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Description</label>
          <textarea
            value={form.description}
            onChange={update('description')}
            required
            rows={3}
            className="w-full rounded-control border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground placeholder:text-disabled focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="Share as much or as little as you're comfortable with..."
          />
        </div>
        <Select label="Category" value={form.category} onChange={update('category')}>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c.charAt(0) + c.slice(1).toLowerCase()}
            </option>
          ))}
        </Select>
        <Select label="Who can see this?" value={form.visibility} onChange={update('visibility')}>
          {VISIBILITIES.map((v) => (
            <option key={v.value} value={v.value}>
              {v.label}
            </option>
          ))}
        </Select>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Submit Request
          </Button>
        </div>
      </form>
    </Modal>
  );
}
