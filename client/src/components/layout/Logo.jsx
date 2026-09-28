import Link from 'next/link';
import { Bird } from 'lucide-react';

export default function Logo({ href = '/', className = '' }) {
  return (
    <Link href={href} className={`inline-flex items-center gap-2 font-semibold tracking-tight text-foreground ${className}`}>
      <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-primary text-primary-foreground">
        <Bird className="h-4.5 w-4.5" />
      </span>
      <span className="text-lg">Flocks</span>
    </Link>
  );
}
