'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';

/**
 * Wraps next-themes, which handles system-preference detection,
 * localStorage persistence, and (via the injected script it adds to
 * <html>) prevents the light/dark flash on first paint.
 */
export default function ThemeProvider({ children }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {children}
    </NextThemesProvider>
  );
}
