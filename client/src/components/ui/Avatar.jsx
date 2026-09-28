import Image from 'next/image';
import { cn } from '@/lib/utils';

function initials(name = '') {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function Avatar({ name, src, size = 40, className }) {
  return (
    <div
      className={cn('relative shrink-0 overflow-hidden rounded-full bg-primary/15 text-primary', className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={name}
    >
      {src ? (
        <Image src={src} alt={name || 'Avatar'} fill sizes={`${size}px`} className="object-cover" />
      ) : (
        <span className="flex h-full w-full items-center justify-center text-xs font-semibold">{initials(name)}</span>
      )}
    </div>
  );
}
