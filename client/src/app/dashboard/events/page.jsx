'use client';

import { useState } from 'react';
import { Plus, CalendarDays } from 'lucide-react';
import PageHeader from '@/components/dashboard/PageHeader';
import DataState from '@/components/dashboard/DataState';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import Skeleton from '@/components/ui/Skeleton';
import MiniCalendar from '@/components/dashboard/MiniCalendar';
import { eventApi, parishApi, unitApi, ApiError } from '@/lib/api';
import { useApi } from '@/lib/hooks';

const EVENT_TYPES = [
  'SUNDAY_SERVICE', 'BIBLE_STUDY', 'PRAYER_MEETING', 'UNIT_MEETING', 'SMALL_GROUP',
  'OUTREACH', 'CONFERENCE', 'DISCIPLESHIP_CLASS', 'LEADERSHIP_MEETING', 'SPECIAL_EVENT',
];

function EventsSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  );
}

function formatEventDate(iso) {
  const d = new Date(iso);
  return {
    day: d.toLocaleDateString('en-US', { day: '2-digit' }),
    month: d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
    time: d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
  };
}

export default function EventsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const { data: events, status, error, reload } = useApi(() => eventApi.list(), []);
  const parishesResult = useApi(() => parishApi.list(), []);
  const unitsResult = useApi(() => unitApi.list(), []);
  const isEmpty = status === 'success' && (!events || events.length === 0);

  return (
    <div>
      <PageHeader
        title="Events"
        description="Organization, parish, and unit-scoped calendar."
        actions={
          <Button size="sm" onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" /> Create Event
          </Button>
        }
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
          </CardHeader>
          <DataState
            status={status}
            error={error}
            onRetry={reload}
            isEmpty={isEmpty}
            skeleton={<EventsSkeleton />}
            emptyState={
              <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
                <CalendarDays className="mb-1 h-8 w-8 text-muted" />
                <p className="text-sm font-medium text-foreground">No upcoming events</p>
                <p className="max-w-xs text-sm text-muted">Create an event to get started.</p>
              </div>
            }
          >
            <ul className="space-y-4">
              {(events || []).map((event) => {
                const { day, month, time } = formatEventDate(event.startsAt);
                return (
                  <li key={event._id} className="flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-control bg-surface-secondary text-center leading-none">
                      <span className="text-[10px] font-semibold uppercase text-muted">{month}</span>
                      <span className="text-sm font-semibold text-foreground">{day}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{event.title}</p>
                      <p className="truncate text-xs text-muted">
                        {time} {event.location ? `• ${event.location}` : ''}
                      </p>
                    </div>
                    <Badge tone="blue">{event.scopeType}</Badge>
                  </li>
                );
              })}
            </ul>
          </DataState>
        </Card>

        <Card>
          <MiniCalendar events={events || []} />
        </Card>
      </div>

      <CreateEventModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={reload}
        parishes={parishesResult.data || []}
        units={unitsResult.data || []}
      />
    </div>
  );
}

function CreateEventModal({ open, onClose, onCreated, parishes, units }) {
  const initial = { title: '', scopeType: 'ORGANIZATION', parish: '', unit: '', type: 'SPECIAL_EVENT', startsAt: '', location: '' };
  const [form, setForm] = useState(initial);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    if (form.scopeType === 'PARISH' && !form.parish) {
      setError('Please select a parish for a parish-scoped event.');
      return;
    }
    if (form.scopeType === 'UNIT' && !form.unit) {
      setError('Please select a unit for a unit-scoped event.');
      return;
    }
    setLoading(true);
    try {
      await eventApi.create({ ...form, startsAt: new Date(form.startsAt).toISOString() });
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
    <Modal open={open} onClose={onClose} title="Create Event">
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {error && (
          <div role="alert" className="rounded-control border border-danger/30 bg-danger/10 px-3.5 py-2.5 text-sm text-danger">
            {error}
          </div>
        )}
        <Input label="Title" value={form.title} onChange={update('title')} required placeholder="Sunday Service" />
        <div className="grid grid-cols-2 gap-3">
          <Select label="Type" value={form.type} onChange={update('type')}>
            {EVENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t.replace(/_/g, ' ')}
              </option>
            ))}
          </Select>
          <Select label="Visibility" value={form.scopeType} onChange={update('scopeType')}>
            <option value="ORGANIZATION">Organization-wide</option>
            <option value="PARISH">Parish</option>
            <option value="UNIT">Unit</option>
            <option value="ADMIN_ONLY">Admin only</option>
          </Select>
        </div>
        {form.scopeType === 'PARISH' && (
          <Select label="Parish" value={form.parish} onChange={update('parish')} required>
            <option value="">Select a parish...</option>
            {parishes.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </Select>
        )}
        {form.scopeType === 'UNIT' && (
          <Select label="Unit" value={form.unit} onChange={update('unit')} required>
            <option value="">Select a unit...</option>
            {units.map((u) => (
              <option key={u._id} value={u._id}>
                {u.name}
              </option>
            ))}
          </Select>
        )}
        <Input label="Date & time" type="datetime-local" value={form.startsAt} onChange={update('startsAt')} required />
        <Input label="Location (optional)" value={form.location} onChange={update('location')} placeholder="Main Sanctuary" />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Create Event
          </Button>
        </div>
      </form>
    </Modal>
  );
}
