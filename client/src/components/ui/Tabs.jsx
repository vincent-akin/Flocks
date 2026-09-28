'use client';

import { useId, useState } from 'react';
import { cn } from '@/lib/utils';

/** Simple, keyboard-navigable tab list. `tabs` = [{ id, label, content }]. */
export default function Tabs({ tabs, defaultTabId, className }) {
  const [active, setActive] = useState(defaultTabId || tabs[0]?.id);
  const name = useId();

  function onKeyDown(e, idx) {
    if (!['ArrowRight', 'ArrowLeft'].includes(e.key)) return;
    e.preventDefault();
    const dir = e.key === 'ArrowRight' ? 1 : -1;
    const nextIdx = (idx + dir + tabs.length) % tabs.length;
    setActive(tabs[nextIdx].id);
    document.getElementById(`${name}-tab-${tabs[nextIdx].id}`)?.focus();
  }

  return (
    <div className={className}>
      <div role="tablist" className="flex gap-1 border-b border-border-subtle">
        {tabs.map((tab, idx) => (
          <button
            key={tab.id}
            id={`${name}-tab-${tab.id}`}
            role="tab"
            type="button"
            aria-selected={active === tab.id}
            aria-controls={`${name}-panel-${tab.id}`}
            tabIndex={active === tab.id ? 0 : -1}
            onClick={() => setActive(tab.id)}
            onKeyDown={(e) => onKeyDown(e, idx)}
            className={cn(
              'relative -mb-px px-4 py-2.5 text-sm font-medium text-muted transition-colors hover:text-foreground',
              active === tab.id && 'text-foreground'
            )}
          >
            {tab.label}
            {active === tab.id && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary" />}
          </button>
        ))}
      </div>
      {tabs.map(
        (tab) =>
          active === tab.id && (
            <div key={tab.id} id={`${name}-panel-${tab.id}`} role="tabpanel" className="pt-5 animate-fade-in">
              {tab.content}
            </div>
          )
      )}
    </div>
  );
}
