'use client';

import { useState } from 'react';
import { Plus, CalendarCheck, QrCode, RefreshCw, Lock } from 'lucide-react';
import PageHeader from '@/components/dashboard/PageHeader';
import DataState from '@/components/dashboard/DataState';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import Skeleton from '@/components/ui/Skeleton';
import { attendanceApi, parishApi, ApiError } from '@/lib/api';
import { useApi } from '@/lib/hooks';

export default function AttendancePage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [qrSession, setQrSession] = useState(null); // { session, token, qrDataUrl, expiresAt }

  const sessions = useApi(() => attendanceApi.listSessions(), []);
  const parishesResult = useApi(() => parishApi.list(), []);
  const isEmpty = sessions.status === 'success' && (!sessions.data || sessions.data.length === 0);

  async function handleRotate() {
    if (!qrSession) return;
    const res = await attendanceApi.rotateToken(qrSession.session._id);
    setQrSession((prev) => ({ ...prev, ...res.data }));
  }

  return (
    <div>
      <PageHeader
        title="Attendance"
        description="Dynamic, expiring QR sessions and check-in records."
        actions={
          <Button size="sm" onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" /> New Session
          </Button>
        }
      />

      {qrSession && (
        <Card className="mb-5 flex flex-col items-center gap-4 border-primary/30 text-center sm:flex-row sm:text-left">
          <div className="flex h-40 w-40 shrink-0 items-center justify-center overflow-hidden rounded-control border border-border bg-white p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrSession.qrDataUrl} alt="Attendance check-in QR code" className="h-full w-full object-contain" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">{qrSession.session.title}</p>
            <p className="mt-1 text-sm text-muted">
              This code expires at {new Date(qrSession.expiresAt).toLocaleTimeString()}. Rotate it to issue a fresh one.
            </p>
            <div className="mt-3 flex justify-center gap-2 sm:justify-start">
              <Button size="sm" variant="secondary" onClick={handleRotate}>
                <RefreshCw className="h-4 w-4" /> Rotate Code
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setQrSession(null)}>
                Close
              </Button>
            </div>
          </div>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Recent Sessions</CardTitle>
        </CardHeader>
        <DataState
          status={sessions.status}
          error={sessions.error}
          onRetry={sessions.reload}
          isEmpty={isEmpty}
          skeleton={
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          }
          emptyState={
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
              <CalendarCheck className="mb-1 h-8 w-8 text-muted" />
              <p className="text-sm font-medium text-foreground">No attendance sessions yet</p>
              <p className="max-w-xs text-sm text-muted">Create a session to generate a dynamic, expiring QR check-in code.</p>
            </div>
          }
        >
          <ul className="divide-y divide-border-subtle">
            {(sessions.data || []).map((s) => (
              <li key={s._id} className="flex items-center gap-4 py-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-amber/10 text-accent-amber">
                  <QrCode className="h-4.5 w-4.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{s.title}</p>
                  <p className="mt-0.5 text-xs text-muted">{new Date(s.scheduledStart).toLocaleString()}</p>
                </div>
                <Badge tone={s.isClosed ? 'neutral' : 'green'}>{s.isClosed ? 'Closed' : 'Open'}</Badge>
              </li>
            ))}
          </ul>
        </DataState>
      </Card>

      <div className="mt-4 flex items-center gap-1.5 text-xs text-muted">
        <Lock className="h-3.5 w-3.5" /> Each QR code is session-specific and expires in minutes - never a static, reusable code.
      </div>

      <CreateSessionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        parishes={parishesResult.data || []}
        onCreated={(res) => {
          setQrSession(res.data);
          sessions.reload();
        }}
      />
    </div>
  );
}

function CreateSessionModal({ open, onClose, parishes, onCreated }) {
  const initial = { title: '', parish: '', scheduledStart: '' };
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
      const res = await attendanceApi.createSession({
        title: form.title,
        parish: form.parish || undefined,
        scheduledStart: new Date(form.scheduledStart).toISOString(),
      });
      setForm(initial);
      onCreated(res);
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="New Attendance Session">
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {error && (
          <div role="alert" className="rounded-control border border-danger/30 bg-danger/10 px-3.5 py-2.5 text-sm text-danger">
            {error}
          </div>
        )}
        <Input label="Title" value={form.title} onChange={update('title')} required placeholder="Sunday Service" />
        <Select label="Parish (optional)" value={form.parish} onChange={update('parish')}>
          <option value="">Organization-wide</option>
          {parishes.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name}
            </option>
          ))}
        </Select>
        <Input label="Start time" type="datetime-local" value={form.scheduledStart} onChange={update('scheduledStart')} required />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Generate QR Code
          </Button>
        </div>
      </form>
    </Modal>
  );
}
