'use client';

import { TrendingUp, Users, Boxes, AlertTriangle, HandHeart, BookOpen } from 'lucide-react';
import PageHeader from '@/components/dashboard/PageHeader';
import DataState from '@/components/dashboard/DataState';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Skeleton from '@/components/ui/Skeleton';
import Badge from '@/components/ui/Badge';
import { analyticsApi } from '@/lib/api';
import { useApi } from '@/lib/hooks';

function KpiSkeleton() {
  return (
    <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-24 w-full" />
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  const org = useApi(() => analyticsApi.organization(), []);
  const followUp = useApi(() => analyticsApi.followUp(), []);
  const compare = useApi(() => analyticsApi.compareParishes(), []);

  const metrics = org.data
    ? [
        { icon: Users, label: 'Total Members', value: org.data.members.total, tone: 'text-accent-blue' },
        { icon: Boxes, label: 'Active Units', value: org.data.activeUnits, tone: 'text-accent-purple' },
        { icon: HandHeart, label: 'Open Prayer Requests', value: org.data.prayerRequests, tone: 'text-accent-amber' },
        { icon: BookOpen, label: 'Bible Plan Participants', value: org.data.biblePlanParticipants, tone: 'text-success' },
      ]
    : [];

  return (
    <div>
      <PageHeader title="Analytics" description="Pastoral indicators for leadership - never a public ranking of members." />

      <DataState status={org.status} error={org.error} onRetry={org.reload} isEmpty={false} skeleton={<KpiSkeleton />}>
        <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {metrics.map((m) => (
            <Card key={m.label}>
              <m.icon className={`mb-3 h-5 w-5 ${m.tone}`} />
              <p className={`text-2xl font-semibold tracking-tight ${m.tone}`}>{m.value}</p>
              <p className="mt-1 text-xs text-muted">{m.label}</p>
            </Card>
          ))}
        </div>
      </DataState>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Members by Membership Status</CardTitle>
          </CardHeader>
          <DataState status={org.status} error={org.error} onRetry={org.reload} isEmpty={false} skeleton={<Skeleton className="h-40 w-full" />}>
            <ul className="space-y-3">
              {org.data &&
                Object.entries(org.data.members.membershipStatus).map(([status, count]) => (
                  <li key={status} className="flex items-center justify-between text-sm">
                    <span className="text-foreground-secondary">{status.replace(/_/g, ' ')}</span>
                    <span className="font-medium text-foreground">{count}</span>
                  </li>
                ))}
            </ul>
          </DataState>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Parish Comparison</CardTitle>
          </CardHeader>
          <DataState
            status={compare.status}
            error={compare.error}
            onRetry={compare.reload}
            isEmpty={compare.status === 'success' && (!compare.data || compare.data.length === 0)}
            skeleton={<Skeleton className="h-40 w-full" />}
          >
            <ul className="space-y-4">
              {(compare.data || []).map((p) => (
                <li key={p.parishId}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="text-foreground-secondary">{p.parishName}</span>
                    <span className="font-medium text-foreground">{p.totalMembers}</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-secondary">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${Math.min(100, (p.totalMembers / Math.max(1, compare.data[0]?.totalMembers || 1)) * 100)}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </DataState>
        </Card>
      </div>

      <Card className="mt-5">
        <CardHeader>
          <CardTitle>Follow-Up Intelligence</CardTitle>
        </CardHeader>
        <p className="mb-4 -mt-2 text-xs text-muted">Recommendations for pastoral attention - never automatic judgments.</p>
        <DataState
          status={followUp.status}
          error={followUp.error}
          onRetry={followUp.reload}
          isEmpty={false}
          skeleton={<Skeleton className="h-32 w-full" />}
        >
          {followUp.data && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <FollowUpTile
                icon={AlertTriangle}
                tone="amber"
                label="No attendance in 4 weeks"
                count={followUp.data.membersNotAttendingIn4Weeks.count}
              />
              <FollowUpTile
                icon={Users}
                tone="blue"
                label="New members pending follow-up"
                count={followUp.data.newMembersPendingFollowUp.count}
              />
              <FollowUpTile
                icon={TrendingUp}
                tone="purple"
                label="Baptized, not yet discipling"
                count={followUp.data.baptizedNotYetDiscipling.count}
              />
              <FollowUpTile
                icon={HandHeart}
                tone="red"
                label="Prayer requests needing follow-up"
                count={followUp.data.prayerRequestsNeedingFollowUp.count}
              />
            </div>
          )}
        </DataState>
      </Card>
    </div>
  );
}

function FollowUpTile({ icon: Icon, tone, label, count }) {
  return (
    <div className="rounded-control border border-border-subtle p-4">
      <div className="mb-3 flex items-center justify-between">
        <Icon className="h-4 w-4 text-muted" />
        <Badge tone={tone}>{count}</Badge>
      </div>
      <p className="text-sm text-foreground-secondary">{label}</p>
    </div>
  );
}
