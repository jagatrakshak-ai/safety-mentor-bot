import { ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn('flex items-center gap-2.5 text-xl font-bold text-primary', className)}>
      <div className="rounded-lg bg-primary/10 p-2">
        <ShieldCheck className="h-6 w-6 text-primary" />
      </div>
      <h1 className="font-headline tracking-tight">Safety Mentor Bot</h1>
    </Link>
  );
}
