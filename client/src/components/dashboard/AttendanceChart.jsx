'use client';

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function AttendanceChart({ data }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="attendanceFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--border-subtle)" vertical={false} />
          <XAxis dataKey="month" stroke="var(--muted)" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="var(--muted)" fontSize={12} tickLine={false} axisLine={false} width={40} />
          <Tooltip
            contentStyle={{
              background: 'var(--surface-elevated)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              fontSize: 13,
              color: 'var(--foreground)',
            }}
          />
          <Area type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={2.5} fill="url(#attendanceFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
