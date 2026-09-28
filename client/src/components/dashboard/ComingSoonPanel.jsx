import PageHeader from './PageHeader';
import Card from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';

/**
 * Used for dashboard routes that are structurally wired up (nav, layout,
 * permission gating) but whose full data views come next, once the
 * backend integration for that domain is connected.
 */
export default function ComingSoonPanel({ title, description, icon, emptyTitle, emptyDescription }) {
  return (
    <div>
      <PageHeader title={title} description={description} />
      <Card>
        <EmptyState icon={icon} title={emptyTitle} description={emptyDescription} />
      </Card>
    </div>
  );
}
