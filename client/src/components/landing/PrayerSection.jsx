import { Lock, HandHeart } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';

export default function PrayerSection() {
  return (
    <section id="pastoral-care" className="bg-[#0B1120] py-24 text-white">
      <div className="container grid items-center gap-14 lg:grid-cols-2">
        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-accent-purple">Pastoral Care</p>
          <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
            Some Things Need More Than a Notification.
          </h2>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-slate-300">
            Give pastors and care teams the context they need to follow up, pray intentionally, and walk with people
            through every season.
          </p>
        </div>

        <div className="mx-auto w-full max-w-sm rounded-card border border-white/10 bg-white/[0.04] p-6 backdrop-blur">
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-purple/20 text-accent-purple">
              <HandHeart className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold">Prayer Request</p>
              <p className="text-xs text-slate-400">Submitted by Sarah Johnson</p>
            </div>
          </div>

          <p className="mb-5 text-base font-medium">Healing for my mother</p>

          <dl className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-slate-400">Category</dt>
              <dd><Badge tone="purple">Health</Badge></dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-slate-400">Visibility</dt>
              <dd className="text-slate-200">Pastor / Care Team</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-slate-400">Status</dt>
              <dd><Badge tone="amber">Being Prayed For</Badge></dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-slate-400">Assigned To</dt>
              <dd className="flex items-center gap-2">
                <Avatar name="Pastor John" size={22} />
                <span className="text-slate-200">Pastor John</span>
              </dd>
            </div>
          </dl>

          <div className="mt-5 flex items-center gap-1.5 rounded-control bg-white/5 px-3 py-2 text-xs text-slate-400">
            <Lock className="h-3.5 w-3.5" /> Private pastoral information
          </div>
        </div>
      </div>
    </section>
  );
}
