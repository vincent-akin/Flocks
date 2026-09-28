'use client';

import { useState } from 'react';
import { Plus, BookOpen, Calendar } from 'lucide-react';
import PageHeader from '@/components/dashboard/PageHeader';
import DataState from '@/components/dashboard/DataState';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import Skeleton from '@/components/ui/Skeleton';
import { bibleApi, ApiError } from '@/lib/api';
import { useApi } from '@/lib/hooks';
import { hasPermission } from '@/lib/permissions';
import { useAuth } from '@/context/AuthContext';

const PLAN_TYPES = [
  { value: 'SEVEN_DAY', label: '7 Days' },
  { value: 'FOURTEEN_DAY', label: '14 Days' },
  { value: 'THIRTY_DAY', label: '30 Days' },
  { value: 'NINETY_DAY', label: '90 Days' },
  { value: 'ONE_EIGHTY_DAY', label: '180 Days' },
  { value: 'THREE_SIXTY_FIVE_DAY', label: '365 Days' },
  { value: 'CUSTOM', label: 'Custom' },
];

export default function BiblePage() {
  const { roleAssignments } = useAuth();
  const canCreatePlans = hasPermission(roleAssignments, 'create_bible_plan');
  const canSetVerse = hasPermission(roleAssignments, 'set_daily_verse');

  const [modalOpen, setModalOpen] = useState(false);
  const verses = useApi(() => bibleApi.currentVerses(), []);
  const plans = useApi(() => bibleApi.listPlans(), []);
  const myProgress = useApi(() => bibleApi.myProgress(), []);

  const isEmpty = plans.status === 'success' && (!plans.data || plans.data.length === 0);

  async function handleJoin(planId) {
    await bibleApi.joinPlan(planId);
    myProgress.reload();
  }

  return (
    <div>
      <PageHeader
        title="Bible"
        description="Daily, weekly, and yearly verses, plus reading plans and progress."
        actions={
          canCreatePlans && (
            <Button size="sm" onClick={() => setModalOpen(true)}>
              <Plus className="h-4 w-4" /> Create Plan
            </Button>
          )
        }
      />

      <DataState
        status={verses.status}
        error={verses.error}
        onRetry={verses.reload}
        isEmpty={false}
        skeleton={<Skeleton className="h-28 w-full mb-5" />}
      >
        <div className="mb-5 grid gap-4 sm:grid-cols-3">
          <VerseTile label="Verse of the Day" verse={verses.data?.daily} />
          <VerseTile label="Verse of the Week" verse={verses.data?.weekly} />
          <VerseTile label="Verse of the Year" verse={verses.data?.yearly} />
        </div>
      </DataState>

      {!canSetVerse && !verses.data?.daily && !verses.data?.weekly && !verses.data?.yearly && verses.status === 'success' && (
        <p className="mb-5 text-sm text-muted">No featured verses have been set yet - check back soon.</p>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Reading Plans</CardTitle>
        </CardHeader>
        <DataState
          status={plans.status}
          error={plans.error}
          onRetry={plans.reload}
          isEmpty={isEmpty}
          skeleton={<Skeleton className="h-32 w-full" />}
          emptyState={
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
              <BookOpen className="mb-1 h-8 w-8 text-muted" />
              <p className="text-sm font-medium text-foreground">No Bible plans published yet</p>
              <p className="max-w-xs text-sm text-muted">Create a reading plan to help your church grow together.</p>
            </div>
          }
        >
          <ul className="divide-y divide-border-subtle">
            {(plans.data || []).map((plan) => {
              const joined = (myProgress.data || []).find((r) => r.plan?._id === plan._id || r.plan === plan._id);
              return (
                <li key={plan._id} className="flex items-center gap-4 py-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-purple/10 text-accent-purple">
                    <BookOpen className="h-4.5 w-4.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{plan.title}</p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
                      <Calendar className="h-3 w-3" /> {plan.dailyReadings?.length || 0} days • {plan.isPublished ? 'Published' : 'Draft'}
                    </p>
                  </div>
                  {plan.isPublished &&
                    (joined ? (
                      <Badge tone="green">Joined</Badge>
                    ) : (
                      <Button size="sm" variant="secondary" onClick={() => handleJoin(plan._id)}>
                        Join Plan
                      </Button>
                    ))}
                </li>
              );
            })}
          </ul>
        </DataState>
      </Card>

      <CreatePlanModal open={modalOpen} onClose={() => setModalOpen(false)} onCreated={plans.reload} />
    </div>
  );
}

function VerseTile({ label, verse }) {
  return (
    <Card>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
      {verse ? (
        <>
          <p className="text-sm italic leading-relaxed text-foreground-secondary">&ldquo;{verse.text}&rdquo;</p>
          <p className="mt-2 text-sm font-medium text-foreground">{verse.reference}</p>
        </>
      ) : (
        <p className="text-sm text-muted">Not set</p>
      )}
    </Card>
  );
}

function CreatePlanModal({ open, onClose, onCreated }) {
  const today = new Date().toISOString().slice(0, 10);
  const initial = { title: '', description: '', planType: 'THIRTY_DAY', startDate: today, endDate: '', readingsText: '' };
  const [form, setForm] = useState(initial);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError('');

    const dailyReadings = form.readingsText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line, idx) => ({ day: idx + 1, references: [line] }));

    if (dailyReadings.length === 0) {
      setError('Add at least one daily reading (one Bible reference per line).');
      return;
    }

    setLoading(true);
    try {
      await bibleApi.createPlan({
        title: form.title,
        description: form.description,
        planType: form.planType,
        startDate: form.startDate,
        endDate: form.endDate || form.startDate,
        dailyReadings,
      });
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
    <Modal open={open} onClose={onClose} title="Create Bible Plan">
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {error && (
          <div role="alert" className="rounded-control border border-danger/30 bg-danger/10 px-3.5 py-2.5 text-sm text-danger">
            {error}
          </div>
        )}
        <Input label="Title" value={form.title} onChange={update('title')} required placeholder="30-Day Gospel Journey" />
        <Select label="Plan length" value={form.planType} onChange={update('planType')}>
          {PLAN_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </Select>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Start date" type="date" value={form.startDate} onChange={update('startDate')} required />
          <Input label="End date" type="date" value={form.endDate} onChange={update('endDate')} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Daily readings</label>
          <textarea
            value={form.readingsText}
            onChange={update('readingsText')}
            required
            rows={5}
            className="w-full rounded-control border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground placeholder:text-disabled focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder={'One reference per line, in order:\nGenesis 1-2\nGenesis 3-4\nMatthew 1'}
          />
          <p className="mt-1.5 text-xs text-muted">Each line becomes one day of the plan, in order.</p>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Create Plan
          </Button>
        </div>
      </form>
    </Modal>
  );
}
