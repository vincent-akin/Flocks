import { MessageSquare } from 'lucide-react';
import ComingSoonPanel from '@/components/dashboard/ComingSoonPanel';

export default function MessagesPage() {
  return (
    <ComingSoonPanel
      title="Messages"
      description="Church-wide, unit, and pastoral communication spaces."
      icon={MessageSquare}
      emptyTitle="No conversations yet"
      emptyDescription="Messages you send or receive will appear here."
    />
  );
}
