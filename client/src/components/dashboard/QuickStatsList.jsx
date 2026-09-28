const TONE_BAR = {
  blue: 'bg-accent-blue',
  purple: 'bg-accent-purple',
  green: 'bg-accent-green',
  amber: 'bg-accent-amber',
};

export default function QuickStatsList({ stats = [] }) {
  return (
    <ul className="space-y-4">
      {stats.map((stat) => (
        <li key={stat.label}>
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <span className="text-foreground-secondary">{stat.label}</span>
            <span className="font-medium text-foreground">{stat.value}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-secondary">
            <div className={`h-full rounded-full ${TONE_BAR[stat.accent] || TONE_BAR.blue}`} style={{ width: `${stat.value}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
