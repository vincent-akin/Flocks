import { BookOpen, ArrowRight } from 'lucide-react';

export default function ScriptureCard({ text, reference }) {
  return (
    <div className="relative overflow-hidden rounded-card border border-border bg-gradient-to-br from-primary/90 to-accent-purple/80 p-6 text-white">
      <BookOpen className="mb-3 h-5 w-5 opacity-80" />
      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider opacity-80">Daily Scripture</p>
      <p className="mb-3 text-lg font-medium leading-snug">&ldquo;{text}&rdquo;</p>
      <p className="mb-4 text-sm opacity-80">{reference}</p>
      <button type="button" className="inline-flex items-center gap-1.5 text-sm font-medium underline-offset-4 hover:underline">
        Read Today&apos;s Devotional <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}
