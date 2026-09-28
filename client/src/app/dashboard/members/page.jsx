'use client';

import { useCallback, useMemo, useState } from 'react';
import { Search, Plus, Filter, Users } from 'lucide-react';
import PageHeader from '@/components/dashboard/PageHeader';
import DataState from '@/components/dashboard/DataState';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Badge from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import Modal from '@/components/ui/Modal';
import Skeleton from '@/components/ui/Skeleton';
import { memberApi, parishApi, ApiError } from '@/lib/api';
import { useApi, useDebouncedValue } from '@/lib/hooks';

const STATUS_TONE = { ACTIVE: 'green', NEW: 'blue', INACTIVE: 'neutral', TRANSFERRED: 'amber', MOVED_AWAY: 'neutral', DECEASED: 'neutral' };

function MembersSkeleton() {
  return (
    <div className="space-y-2 p-5">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}

export default function MembersPage() {
  const [search, setSearch] = useState('');
  const [parishFilter, setParishFilter] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const debouncedSearch = useDebouncedValue(search);

  const parishesResult = useApi(() => parishApi.list(), []);
  const parishes = parishesResult.data || [];

  const fetchMembers = useCallback(
    () => memberApi.list({ search: debouncedSearch, parishId: parishFilter, page, limit: 20 }),
    [debouncedSearch, parishFilter, page]
  );
  const { data: members, pagination, status, error, reload } = useApi(fetchMembers, [fetchMembers]);

  const isEmpty = status === 'success' && (!members || members.length === 0);

  return (
    <div>
      <PageHeader
        title="Members"
        description="Manage your church's members across every parish."
        actions={
          <Button size="sm" onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" /> Add Member
          </Button>
        }
      />

      <Card className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            placeholder="Search members..."
            className="pl-9"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 shrink-0 text-muted" />
          <Select
            value={parishFilter}
            onChange={(e) => {
              setParishFilter(e.target.value);
              setPage(1);
            }}
            className="min-w-[180px]"
          >
            <option value="">All parishes</option>
            {parishes.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      <Card className="overflow-x-auto p-0">
        <DataState
          status={status}
          error={error}
          onRetry={reload}
          isEmpty={isEmpty}
          skeleton={<MembersSkeleton />}
          emptyState={
            <div className="p-6">
              <div className="flex flex-col items-center justify-center gap-2 rounded-control border border-dashed border-border py-10 text-center">
                <Users className="mb-1 h-8 w-8 text-muted" />
                <p className="text-sm font-medium text-foreground">No members found</p>
                <p className="max-w-xs text-sm text-muted">
                  {search || parishFilter ? 'Try a different search or filter.' : 'Add your first member to get started.'}
                </p>
              </div>
            </div>
          }
        >
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border-subtle text-xs uppercase tracking-wide text-muted">
                <th className="px-5 py-3 font-medium">Member</th>
                <th className="px-5 py-3 font-medium">Parish</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Baptism</th>
                <th className="px-5 py-3 font-medium">Discipleship</th>
              </tr>
            </thead>
            <tbody>
              {(members || []).map((m) => (
                <tr key={m._id} className="border-b border-border-subtle last:border-0 hover:bg-surface-secondary">
                  <td className="flex items-center gap-3 px-5 py-3.5">
                    <Avatar name={`${m.firstName} ${m.lastName}`} size={32} />
                    <span className="font-medium text-foreground">
                      {m.firstName} {m.lastName}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-foreground-secondary">{m.primaryParish?.name || '—'}</td>
                  <td className="px-5 py-3.5">
                    <Badge tone={STATUS_TONE[m.membershipStatus] || 'neutral'}>{m.membershipStatus}</Badge>
                  </td>
                  <td className="px-5 py-3.5 text-foreground-secondary">{m.baptismStatus.replace(/_/g, ' ')}</td>
                  <td className="px-5 py-3.5 text-foreground-secondary">{m.discipleshipStatus.replace(/_/g, ' ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </DataState>
      </Card>

      {pagination && pagination.pages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-muted">
          <span>
            Page {pagination.page} of {pagination.pages} • {pagination.total} members
          </span>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <Button variant="secondary" size="sm" disabled={page >= pagination.pages} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}

      <AddMemberModal open={modalOpen} onClose={() => setModalOpen(false)} parishes={parishes} onCreated={reload} />
    </div>
  );
}

function AddMemberModal({ open, onClose, parishes, onCreated }) {
  const initial = { firstName: '', lastName: '', primaryParish: '', email: '', phone: '' };
  const [form, setForm] = useState(initial);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.primaryParish) {
      setError('Please select a parish.');
      return;
    }
    setLoading(true);
    try {
      await memberApi.create(form);
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
    <Modal open={open} onClose={onClose} title="Add Member">
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {error && (
          <div role="alert" className="rounded-control border border-danger/30 bg-danger/10 px-3.5 py-2.5 text-sm text-danger">
            {error}
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <Input label="First name" value={form.firstName} onChange={update('firstName')} required />
          <Input label="Last name" value={form.lastName} onChange={update('lastName')} required />
        </div>
        <Select label="Parish" value={form.primaryParish} onChange={update('primaryParish')} required>
          <option value="">Select a parish...</option>
          {parishes.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name}
            </option>
          ))}
        </Select>
        <Input label="Email (optional)" type="email" value={form.email} onChange={update('email')} />
        <Input label="Phone (optional)" value={form.phone} onChange={update('phone')} />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Add Member
          </Button>
        </div>
      </form>
    </Modal>
  );
}
