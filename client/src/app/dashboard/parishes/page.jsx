'use client';

import { useState } from 'react';
import { Plus, Church, ChevronRight } from 'lucide-react';
import PageHeader from '@/components/dashboard/PageHeader';
import DataState from '@/components/dashboard/DataState';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Skeleton from '@/components/ui/Skeleton';
import { parishApi, ApiError } from '@/lib/api';
import { useApi } from '@/lib/hooks';

function ParishesSkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-36 w-full" />
      ))}
    </div>
  );
}

export default function ParishesPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const { data: parishes, status, error, reload } = useApi(() => parishApi.list(), []);
  const isEmpty = status === 'success' && (!parishes || parishes.length === 0);

  return (
    <div>
      <PageHeader
        title="Parishes"
        description="Locations and branches within your organization."
        actions={
          <Button size="sm" onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" /> Add Parish
          </Button>
        }
      />

      <DataState
        status={status}
        error={error}
        onRetry={reload}
        isEmpty={isEmpty}
        skeleton={<ParishesSkeleton />}
        emptyState={
          <Card>
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
              <Church className="mb-1 h-8 w-8 text-muted" />
              <p className="text-sm font-medium text-foreground">No additional parishes yet</p>
              <p className="max-w-xs text-sm text-muted">Your Main Parish was created automatically - add more as your church grows.</p>
            </div>
          </Card>
        }
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {(parishes || []).map((parish) => (
            <Card key={parish._id} interactive className="flex flex-col">
              <div className="flex items-start justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-control bg-primary/10 text-primary">
                  <Church className="h-5 w-5" />
                </span>
                {parish.isMainParish && (
                  <span className="rounded-full bg-surface-secondary px-2.5 py-1 text-xs font-medium text-muted">Main</span>
                )}
              </div>
              <h3 className="mt-4 text-base font-semibold text-foreground">{parish.name}</h3>
              <p className="mt-1 text-sm text-muted">{[parish.city, parish.state, parish.country].filter(Boolean).join(', ') || 'No address on file'}</p>
              <button className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                View parish <ChevronRight className="h-4 w-4" />
              </button>
            </Card>
          ))}
        </div>
      </DataState>

      <CreateParishModal open={modalOpen} onClose={() => setModalOpen(false)} onCreated={reload} />
    </div>
  );
}

function CreateParishModal({ open, onClose, onCreated }) {
  const initial = { name: '', city: '', state: '', country: '', contactEmail: '' };
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
      await parishApi.create(form);
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
    <Modal open={open} onClose={onClose} title="Add Parish">
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {error && (
          <div role="alert" className="rounded-control border border-danger/30 bg-danger/10 px-3.5 py-2.5 text-sm text-danger">
            {error}
          </div>
        )}
        <Input label="Parish name" value={form.name} onChange={update('name')} required placeholder="North Campus" />
        <div className="grid grid-cols-2 gap-3">
          <Input label="City" value={form.city} onChange={update('city')} />
          <Input label="State" value={form.state} onChange={update('state')} />
        </div>
        <Input label="Country" value={form.country} onChange={update('country')} />
        <Input label="Contact email (optional)" type="email" value={form.contactEmail} onChange={update('contactEmail')} />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Add Parish
          </Button>
        </div>
      </form>
    </Modal>
  );
}
