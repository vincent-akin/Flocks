'use client';

import { Church, ChevronRight, Users, Boxes, HandHeart, BookOpen, AlertTriangle } from 'lucide-react';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Skeleton from '@/components/ui/Skeleton';
import DataState from '@/components/dashboard/DataState';
import StatCard from '@/components/dashboard/StatCard';
import PrayerListCard from '@/components/dashboard/PrayerListCard';
import EventListCard from '@/components/dashboard/EventListCard';
import ScriptureCard from '@/components/dashboard/ScriptureCard';
import MiniCalendar from '@/components/dashboard/MiniCalendar';
import ParishListCard from '@/components/dashboard/ParishListCard';
import { useApi } from '@/lib/hooks';
import { useAuth } from '@/context/AuthContext';
import { analyticsApi, prayerApi, eventApi, parishApi, bibleApi } from '@/lib/api';

const PARISH_DOT_CYCLE = ['blue', 'green', 'purple'];

export default function DashboardHomePage() {
  const { member } = useAuth();

  const org = useApi(() => analyticsApi.organization(), []);
  const followUp = useApi(() => analyticsApi.followUp(), []);
  const prayers = useApi(() => prayerApi.list(), []);
  const events = useApi(() => eventApi.list(), []);
  const parishes = useApi(() => parishApi.list(), []);
  const verses = useApi(() => bibleApi.currentVerses(), []);

  const kpis = org.data
    ? [
        { label: 'Total Members', value: org.data.members.total, accent: 'blue', note: 'across all parishes' },
        { label: 'Active Units', value: org.data.activeUnits, accent: 'green', note: 'organization-wide' },
        { label: 'Open Prayer Requests', value: org.data.prayerRequests, accent: 'amber', note: 'awaiting follow-up' },
        { label: 'Bible Plan Participants', value: org.data.biblePlanParticipants, accent: 'purple', note: 'currently reading' },
      ]
    : [];

  const displayName = member ? member.firstName : 'there';

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      {/* Main column */}
      <div className="space-y-5 lg:col-span-2">
        <div className="relative overflow-hidden rounded-card border border-border">
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
          <div
            className="h-56 bg-cover bg-center sm:h-64"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1438032005730-c779502df39b?w=1200&q=80')" }}
          />
          <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-10">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/70">Welcome back, {displayName}</p>
            <h1 className="max-w-md text-2xl font-semibold leading-tight text-white sm:text-3xl">
              Know the flock.
              <br />
              Care for the flock.
              <br />
              Grow the flock.
            </h1>
          </div>
        </div>

        <DataState
          status={org.status}
          error={org.error}
          onRetry={org.reload}
          isEmpty={false}
          skeleton={
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          }
        >
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {kpis.map((kpi) => (
              <StatCard key={kpi.label} label={kpi.label} value={kpi.value} delta="" note={kpi.note} accent={kpi.accent} />
            ))}
          </div>
        </DataState>

        <Card>
          <CardHeader>
            <CardTitle>Follow-Up Intelligence</CardTitle>
          </CardHeader>
          <p className="mb-4 -mt-2 text-xs text-muted">Recommendations for pastoral attention - never automatic judgments.</p>
          <DataState
            status={followUp.status}
            error={followUp.error}
            onRetry={followUp.reload}
            isEmpty={false}
            skeleton={<Skeleton className="h-24 w-full" />}
          >
            {followUp.data && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <FollowUpTile icon={AlertTriangle} tone="amber" label="No attendance in 4 weeks" count={followUp.data.membersNotAttendingIn4Weeks.count} />
                <FollowUpTile icon={Users} tone="blue" label="New members pending" count={followUp.data.newMembersPendingFollowUp.count} />
                <FollowUpTile icon={Boxes} tone="purple" label="Baptized, not discipling" count={followUp.data.baptizedNotYetDiscipling.count} />
                <FollowUpTile icon={HandHeart} tone="red" label="Prayers needing follow-up" count={followUp.data.prayerRequestsNeedingFollowUp.count} />
              </div>
            )}
          </DataState>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Prayer Requests</CardTitle>
            <Button as="a" href="/dashboard/prayer" variant="link" size="sm">
              View all <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <DataState
            status={prayers.status}
            error={prayers.error}
            onRetry={prayers.reload}
            isEmpty={prayers.status === 'success' && (!prayers.data || prayers.data.length === 0)}
            skeleton={<Skeleton className="h-32 w-full" />}
          >
            <PrayerListCard
              requests={(prayers.data || []).slice(0, 4).map((r) => ({
                title: r.title,
                name: r.member ? `${r.member.firstName} ${r.member.lastName}` : 'Anonymous',
                time: new Date(r.createdAt).toLocaleDateString(),
                priority: r.category === 'HEALTH' ? 'High' : 'Medium',
              }))}
            />
          </DataState>
        </Card>

        <DataState
          status={verses.status}
          error={verses.error}
          onRetry={verses.reload}
          isEmpty={verses.status === 'success' && !verses.data?.daily}
          skeleton={<Skeleton className="h-40 w-full" />}
          emptyState={
            <Card>
              <p className="text-sm text-muted">No verse of the day has been set yet.</p>
            </Card>
          }
        >
          {verses.data?.daily && <ScriptureCard text={verses.data.daily.text} reference={verses.data.daily.reference} />}
        </DataState>
      </div>

      {/* Right sidebar */}
      <div className="space-y-5">
        <Card>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-control bg-primary/10 text-primary">
              <Church className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">Your Church</p>
              <p className="text-xs text-muted">Multi-Parish Organization</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">Parishes</p>
              <Button as="a" href="/dashboard/parishes" variant="link" size="sm" className="text-xs">
                View all
              </Button>
            </div>
            <DataState
              status={parishes.status}
              error={parishes.error}
              onRetry={parishes.reload}
              isEmpty={parishes.status === 'success' && (!parishes.data || parishes.data.length === 0)}
              skeleton={<Skeleton className="h-24 w-full" />}
              emptyState={<p className="py-4 text-center text-sm text-muted">No parishes yet.</p>}
            >
              <ParishListCard
                parishes={(parishes.data || []).slice(0, 4).map((p, i) => ({
                  name: p.name,
                  units: '—',
                  members: '—',
                  accent: PARISH_DOT_CYCLE[i % PARISH_DOT_CYCLE.length],
                }))}
              />
            </DataState>
          </div>
        </Card>

        <Card>
          <MiniCalendar events={events.data || []} />
          <div className="mt-5 border-t border-border-subtle pt-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Upcoming Events</p>
              <Button as="a" href="/dashboard/events" variant="link" size="sm" className="text-xs">
                View all
              </Button>
            </div>
            <DataState
              status={events.status}
              error={events.error}
              onRetry={events.reload}
              isEmpty={events.status === 'success' && (!events.data || events.data.length === 0)}
              skeleton={<Skeleton className="h-24 w-full" />}
              emptyState={<p className="py-4 text-center text-sm text-muted">No upcoming events.</p>}
            >
              <EventListCard
                events={(events.data || []).slice(0, 3).map((e) => ({
                  date: `${new Date(e.startsAt).toLocaleDateString('en-US', { month: 'short' }).toUpperCase()} ${new Date(e.startsAt).getDate()}`,
                  title: e.title,
                  location: `${new Date(e.startsAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}${e.location ? ` • ${e.location}` : ''}`,
                  tag: e.scopeType,
                }))}
              />
            </DataState>
          </div>
        </Card>
      </div>
    </div>
  );
}

function FollowUpTile({ icon: Icon, tone, label, count }) {
  return (
    <div className="rounded-control border border-border-subtle p-3">
      <div className="mb-2 flex items-center justify-between">
        <Icon className="h-4 w-4 text-muted" />
        <Badge tone={tone}>{count}</Badge>
      </div>
      <p className="text-xs text-foreground-secondary">{label}</p>
    </div>
  );
}
