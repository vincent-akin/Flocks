import Link from 'next/link';
import Logo from '@/components/layout/Logo';
import ThemeSwitcher from '@/components/layout/ThemeSwitcher';

export default function AuthLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-glow">
      <header className="flex items-center justify-between px-6 py-5 sm:px-10">
        <Logo />
        <div className="flex items-center gap-3">
          <ThemeSwitcher />
          <Link href="/" className="text-sm font-medium text-foreground-secondary hover:text-foreground">
            Back to site
          </Link>
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 pb-16">
        <div className="w-full max-w-md animate-slide-up">{children}</div>
      </main>
    </div>
  );
}
