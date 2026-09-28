import { ChevronRight, Church } from 'lucide-react';

const DOT = { blue: 'bg-accent-blue', green: 'bg-accent-green', purple: 'bg-accent-purple' };

export default function ParishListCard({ parishes = [] }) {
  return (
    <ul className="space-y-1">
      {parishes.map((parish) => (
        <li key={parish.name}>
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-control px-2 py-2.5 text-left transition-colors hover:bg-surface-secondary"
          >
            <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${DOT[parish.accent] || DOT.blue}`} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-foreground">{parish.name}</span>
              <span className="block text-xs text-muted">
                {parish.units} Units • {parish.members} Members
              </span>
            </span>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted" />
          </button>
        </li>
      ))}
    </ul>
  );
}
