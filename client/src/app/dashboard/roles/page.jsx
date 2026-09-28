import { ArrowRight } from 'lucide-react';
import PageHeader from '@/components/dashboard/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { PERMISSION_GROUPS, permissionLabel } from '@/lib/permissions-catalog';

export default function RolesPage() {
  return (
    <div>
      <PageHeader
        title="Roles & Permissions"
        description="Every permission Flocks enforces, grouped by area. Role assignments (who has what) are managed from Users."
        actions={
          <Button href="/dashboard/users" size="sm">
            Manage User Access <ArrowRight className="h-4 w-4" />
          </Button>
        }
      />

      <div className="grid gap-5 sm:grid-cols-2">
        {PERMISSION_GROUPS.map((group) => (
          <Card key={group.label}>
            <h3 className="mb-3 text-sm font-semibold text-foreground">{group.label}</h3>
            <ul className="space-y-1.5">
              {group.permissions.map((p) => (
                <li key={p} className="text-sm text-foreground-secondary">
                  {permissionLabel(p)}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </div>
  );
}
