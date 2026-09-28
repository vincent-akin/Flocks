'use client';

import { useState } from 'react';
import { Plus, ShieldCheck, X, Search } from 'lucide-react';
import PageHeader from '@/components/dashboard/PageHeader';
import DataState from '@/components/dashboard/DataState';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import Skeleton from '@/components/ui/Skeleton';
import { adminApi, memberApi, parishApi, unitApi, ApiError } from '@/lib/api';
import { useApi, useDebouncedValue } from '@/lib/hooks';
import { PERMISSION_GROUPS, permissionLabel } from '@/lib/permissions-catalog';

const ROLE_TONE = { SUPER_ADMIN: 'red', ADMIN: 'blue', UNIT_ADMIN: 'purple' };

export default function UsersPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const { data: assignments, status, error, reload } = useApi(() => adminApi.listRoleAssignments(), []);
  const isEmpty = status === 'success' && (!assignments || assignments.length === 0);

  async function handleRevoke(id) {
    if (!window.confirm('Revoke this role assignment? The user will lose the associated access immediately.')) return;
    await adminApi.revoke(id);
    reload();
  }

  return (
    <div>
      <PageHeader
        title="Users"
        description="Admins, Co-Admins, and Unit Admins - each a Role + Permission + Scope assignment."
        actions={
          <Button size="sm" onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" /> Grant Access
          </Button>
        }
      />

      <Card className="overflow-x-auto p-0">
        <DataState
          status={status}
          error={error}
          onRetry={reload}
          isEmpty={isEmpty}
          skeleton={
            <div className="space-y-2 p-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          }
          emptyState={
            <div className="flex flex-col items-center justify-center gap-2 p-10 text-center">
              <ShieldCheck className="mb-1 h-8 w-8 text-muted" />
              <p className="text-sm font-medium text-foreground">No admin users yet</p>
              <p className="max-w-xs text-sm text-muted">Grant a member a login and a role to get started.</p>
            </div>
          }
        >
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border-subtle text-xs uppercase tracking-wide text-muted">
                <th className="px-5 py-3 font-medium">User</th>
                <th className="px-5 py-3 font-medium">Role</th>
                <th className="px-5 py-3 font-medium">Scope</th>
                <th className="px-5 py-3 font-medium">Permissions</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {(assignments || []).map((a) => (
                <tr key={a._id} className="border-b border-border-subtle last:border-0 hover:bg-surface-secondary">
                  <td className="px-5 py-3.5 font-medium text-foreground">{a.user?.email || '—'}</td>
                  <td className="px-5 py-3.5">
                    <Badge tone={ROLE_TONE[a.role] || 'neutral'}>{a.role.replace(/_/g, ' ')}</Badge>
                  </td>
                  <td className="px-5 py-3.5 text-foreground-secondary">{a.scopeType}</td>
                  <td className="px-5 py-3.5 text-foreground-secondary">
                    {a.role === 'SUPER_ADMIN' ? 'All' : `${a.permissions.length} permission${a.permissions.length === 1 ? '' : 's'}`}
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge tone={a.status === 'ACTIVE' ? 'green' : 'neutral'}>{a.status}</Badge>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {a.status === 'ACTIVE' && a.role !== 'SUPER_ADMIN' && (
                      <Button variant="link" size="sm" className="text-danger" onClick={() => handleRevoke(a._id)}>
                        Revoke
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </DataState>
      </Card>

      <GrantAccessModal open={modalOpen} onClose={() => setModalOpen(false)} onCreated={reload} />
    </div>
  );
}

function GrantAccessModal({ open, onClose, onCreated }) {
  const initial = { memberId: '', role: 'ADMIN', scopeType: 'PARISH', scopeId: '', password: '' };
  const [form, setForm] = useState(initial);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [memberSearch, setMemberSearch] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const debouncedSearch = useDebouncedValue(memberSearch);
  const memberResults = useApi(
    () => (debouncedSearch ? memberApi.list({ search: debouncedSearch, limit: 5 }) : Promise.resolve({ data: [] })),
    [debouncedSearch]
  );
  const parishesResult = useApi(() => parishApi.list(), []);
  const unitsResult = useApi(() => unitApi.list(), []);

  function togglePermission(p) {
    setSelectedPermissions((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));
  }

  function selectMember(member) {
    setSelectedMember(member);
    setForm((f) => ({ ...f, memberId: member._id }));
    setMemberSearch('');
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError('');

    if (!form.memberId) {
      setError('Please select a member.');
      return;
    }
    if (form.scopeType !== 'ORGANIZATION' && !form.scopeId) {
      setError(`Please select a ${form.scopeType.toLowerCase()} for this scope.`);
      return;
    }
    if (selectedPermissions.length === 0) {
      setError('Select at least one permission.');
      return;
    }
    if (!selectedMember?.user && (!form.password || form.password.length < 8)) {
      setError('This member has no login yet - set a password (min 8 characters) to create one.');
      return;
    }

    setLoading(true);
    try {
      await adminApi.createRoleAssignment({
        memberId: form.memberId,
        role: form.role,
        scopeType: form.scopeType,
        scopeId: form.scopeType === 'ORGANIZATION' ? undefined : form.scopeId,
        permissions: selectedPermissions,
        password: selectedMember?.user ? undefined : form.password,
      });
      resetAndClose();
      onCreated();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function resetAndClose() {
    setForm(initial);
    setSelectedPermissions([]);
    setSelectedMember(null);
    setMemberSearch('');
    setError('');
    onClose();
  }

  return (
    <Modal open={open} onClose={resetAndClose} title="Grant Access" className="max-w-2xl">
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {error && (
          <div role="alert" className="rounded-control border border-danger/30 bg-danger/10 px-3.5 py-2.5 text-sm text-danger">
            {error}
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Member</label>
          {selectedMember ? (
            <div className="flex items-center justify-between rounded-control border border-border bg-surface-secondary px-3.5 py-2.5 text-sm">
              <span className="text-foreground">
                {selectedMember.firstName} {selectedMember.lastName}
                {!selectedMember.user && <span className="ml-2 text-xs text-muted">(no login yet)</span>}
              </span>
              <button type="button" onClick={() => setSelectedMember(null)} aria-label="Change member">
                <X className="h-4 w-4 text-muted" />
              </button>
            </div>
          ) : (
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <Input placeholder="Search members by name..." className="pl-9" value={memberSearch} onChange={(e) => setMemberSearch(e.target.value)} />
              {memberSearch && memberResults.data && memberResults.data.length > 0 && (
                <div className="absolute z-10 mt-1 w-full rounded-control border border-border bg-surface-elevated p-1 shadow-elevated">
                  {memberResults.data.map((m) => (
                    <button
                      key={m._id}
                      type="button"
                      onClick={() => selectMember(m)}
                      className="flex w-full items-center justify-between rounded-[8px] px-3 py-2 text-left text-sm hover:bg-surface-secondary"
                    >
                      <span>
                        {m.firstName} {m.lastName}
                      </span>
                      <span className="text-xs text-muted">{m.primaryParish?.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {selectedMember && !selectedMember.user && (
          <Input
            label="Set a login password for this member"
            type="password"
            hint="At least 8 characters. They'll use this with their on-file email to sign in."
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          />
        )}

        <div className="grid grid-cols-2 gap-3">
          <Select label="Role" value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}>
            <option value="ADMIN">Admin</option>
            <option value="UNIT_ADMIN">Unit Admin</option>
          </Select>
          <Select
            label="Scope"
            value={form.scopeType}
            onChange={(e) => setForm((f) => ({ ...f, scopeType: e.target.value, scopeId: '' }))}
          >
            <option value="ORGANIZATION">Organization-wide</option>
            <option value="PARISH">A specific parish</option>
            <option value="UNIT">A specific unit</option>
          </Select>
        </div>

        {form.scopeType === 'PARISH' && (
          <Select label="Parish" value={form.scopeId} onChange={(e) => setForm((f) => ({ ...f, scopeId: e.target.value }))} required>
            <option value="">Select a parish...</option>
            {(parishesResult.data || []).map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </Select>
        )}
        {form.scopeType === 'UNIT' && (
          <Select label="Unit" value={form.scopeId} onChange={(e) => setForm((f) => ({ ...f, scopeId: e.target.value }))} required>
            <option value="">Select a unit...</option>
            {(unitsResult.data || []).map((u) => (
              <option key={u._id} value={u._id}>
                {u.name}
              </option>
            ))}
          </Select>
        )}

        <div>
          <p className="mb-2 text-sm font-medium text-foreground">Permissions</p>
          <div className="max-h-64 space-y-4 overflow-y-auto rounded-control border border-border-subtle p-4">
            {PERMISSION_GROUPS.map((group) => (
              <div key={group.label}>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted">{group.label}</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {group.permissions.map((p) => (
                    <label key={p} className="flex items-center gap-2 text-sm text-foreground-secondary">
                      <input
                        type="checkbox"
                        checked={selectedPermissions.includes(p)}
                        onChange={() => togglePermission(p)}
                        className="h-4 w-4 rounded border-border text-primary focus:ring-primary/30"
                      />
                      {permissionLabel(p)}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={resetAndClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Grant Access
          </Button>
        </div>
      </form>
    </Modal>
  );
}
