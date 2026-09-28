import { QrCode } from 'lucide-react';
import SectionHeading from './SectionHeading';
import Card from '@/components/ui/Card';
import AttendanceChart from '@/components/dashboard/AttendanceChart';
import { attendanceTrend } from '@/lib/sample-data';

export default function AttendanceSection() {
  return (
    <section id="attendance" className="py-24">
      <div className="container">
        <SectionHeading eyebrow="Attendance" title="Attendance That Tells a Story." />
        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <p className="mb-1 text-sm font-medium text-foreground">Sunday Attendance</p>
            <p className="mb-4 text-xs text-muted">Members, consistency, and parish trends - not just a headcount.</p>
            <AttendanceChart data={attendanceTrend} />
          </Card>

          <Card className="flex flex-col items-center justify-center text-center">
            <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-card bg-surface-secondary text-foreground">
              <QrCode className="h-8 w-8" />
            </span>
            <p className="font-semibold text-foreground">Scan to Check In</p>
            <p className="mt-1.5 max-w-[220px] text-sm text-muted">
              Dynamic, session-specific QR codes that expire in minutes - never a static, reusable code.
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
}
