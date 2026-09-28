import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';

export default function MemberOfWeekCard({ member }) {
  return (
    <div className="flex flex-col items-center text-center">
      <Avatar name={member.name} size={56} />
      <p className="mt-3 text-sm font-semibold text-foreground">{member.name}</p>
      <p className="text-xs text-muted">{member.unit}</p>
      <p className="mt-3 text-sm italic text-foreground-secondary">&ldquo;{member.quote}&rdquo;</p>
      <div className="mt-3 flex gap-2">
        {member.badges.map((b) => (
          <Badge key={b} tone="green">
            {b}
          </Badge>
        ))}
      </div>
    </div>
  );
}
