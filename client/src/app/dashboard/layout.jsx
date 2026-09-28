import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import AuthGuard from '@/components/layout/AuthGuard';

export default function DashboardLayout({ children }) {
  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden bg-background">
        <div className="hidden lg:block">
          <Sidebar />
        </div>
        <div className="flex flex-1 flex-col overflow-hidden">
          <Topbar />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}
