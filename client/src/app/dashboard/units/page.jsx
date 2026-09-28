'use client';

import { useCallback, useState } from 'react';
import { Plus, Users, Lock, Boxes } from 'lucide-react';
import PageHeader from '@/components/dashboard/PageHeader';
import DataState from '@/components/dashboard/DataState';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import Skeleton from '@/components/ui/Skeleton';
import { unitApi, parishApi, ApiError } from '@/lib/api';
import { useApi } from '@/lib/hooks';

const CATEGORIES = [
  'CHOIR', 'MEDIA', 'PROTOCOL', 'USHERING', 'YOUTH', 'CHILDREN',
  'PRAYER', 'EVANGELISM', 'MENS_FELLOWSHIP', 'WOMENS_FELLOWSHIP', 'OTHER',
];

const CATEGORY_TONE = {
  CHOIR: 'purple', MEDIA: 'blue', PROTOCOL: 'amber', USHERING: 'blue', YOUTH: 'amber',
  CHILDREN: 'green', PRAYER: 'purple', EVANGELISM: 'green', MENS_FELLOWSHIP: 'blue',
  WOMENS_FELLOWSHIP: 'purple', OTHER: 'neutral',
};

// Full literal class strings, never interpolated - Tailwind's JIT scanner
// only picks up classes it can find verbatim in source, so a template
// literal like `bg-accent-${tone}/10` silently produces no CSS at all.
const CATEGORY_ICON_CLASSES = {
  blue: 'bg-accent-blue/10 text-accent-blue',
  green: 'bg-accent-green/10 text-accent-green',
  purple: 'bg-accent-purple/10 text-accent-purple',
  amber: 'bg-accent-amber/10 text-accent-amber',
  neutral: 'bg-surface-secondary text-foreground-secondary',
};

function UnitsSkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-40 w-full" />
      ))}
    </div>
  );
}

export default function UnitsPage() {
  const [parishFilter, setParishFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const parishesResult = useApi(() => parishApi.list(), []);
  const parishes = parishesResult.data || [];

  const fetchUnits = useCallback(() => unitApi.list({ parishId: parishFilter }), [parishFilter]);
  const { data: units, status, error, reload } = useApi(fetchUnits, [fetchUnits]);

  const isEmpty = status === 'success' && (!units || units.length === 0);

  return (
    <div>
      <PageHeader
        title="Units"
        description="Private communities within each parish - choirs, media, youth, and more."
        actions={
          <>
            <Select value={parishFilter} onChange={(e) => setParishFilter(e.target.value)} className="hidden sm:block sm:w-48">
              <option value="">All parishes</option>
              {parishes.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </Select>
            <Button size="sm" onClick={() => setModalOpen(true)}>
              <Plus className="h-4 w-4" /> Create Unit
            </Button>
          </>
        }
      />

      <DataState
        status={status}
        error={error}
        onRetry={reload}
        isEmpty={isEmpty}
        skeleton={<UnitsSkeleton />}
        emptyState={
          <Card>
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
              <Boxes className="mb-1 h-8 w-8 text-muted" />
              <p className="text-sm font-medium text-foreground">No units yet</p>
              <p className="max-w-xs text-sm text-muted">Create your first unit to organize members into ministries.</p>
            </div>
          </Card>
        }
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {(units || []).map((unit) => (
            <Card key={unit._id} interactive>
              <div className="flex items-start justify-between">
                <span className={`flex h-11 w-11 items-center justify-center rounded-control ${CATEGORY_ICON_CLASSES[CATEGORY_TONE[unit.category]] || CATEGORY_ICON_CLASSES.neutral}`}>
                  <Users className="h-5 w-5" />
                </span>
                {unit.isPrivate && (
                  <Badge tone="neutral" className="gap-1">
                    <Lock className="h-3 w-3" /> Private
                  </Badge>
                )}
              </div>
              <h3 className="mt-4 text-base font-semibold text-foreground">{unit.name}</h3>
              <p className="text-sm text-muted">{unit.parish?.name || '—'}</p>
              {unit.description && <p className="mt-2 line-clamp-2 text-sm text-foreground-secondary">{unit.description}</p>}
            </Card>
          ))}
        </div>
      </DataState>

      <CreateUnitModal open={modalOpen} onClose={() => setModalOpen(false)} parishes={parishes} onCreated={reload} />
    </div>
  );
}

function CreateUnitModal({ open, onClose, parishes, onCreated }) {
  const initial = { name: '', parish: '', category: 'OTHER', description: '' };
  const [form, setForm] = useState(initial);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.parish) {
      setError('Please select a parish.');
      return;
    }
    setLoading(true);
    try {
      await unitApi.create(form);
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
    <Modal open={open} onClose={onClose} title="Create Unit">
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {error && (
          <div role="alert" className="rounded-control border border-danger/30 bg-danger/10 px-3.5 py-2.5 text-sm text-danger">
            {error}
          </div>
        )}
        <Input label="Unit name" value={form.name} onChange={update('name')} required placeholder="Media Ministry" />
        <Select label="Parish" value={form.parish} onChange={update('parish')} required>
          <option value="">Select a parish...</option>
          {parishes.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name}
            </option>
          ))}
        </Select>
        <Select label="Category" value={form.category} onChange={update('category')}>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c.replace(/_/g, ' ')}
            </option>
          ))}
        </Select>
        <Input label="Description (optional)" value={form.description} onChange={update('description')} />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Create Unit
          </Button>
        </div>
      </form>
    </Modal>
  );
}
