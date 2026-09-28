import './globals.css';
import ThemeProvider from '@/components/layout/ThemeProvider';
import { AuthProvider } from '@/context/AuthContext';

export const metadata = {
  title: 'Flocks — Church Community, Discipleship & Pastoral Care Platform',
  description:
    'Flocks brings your church community, discipleship, pastoral care, attendance, prayer, events, and insights into one connected platform.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
