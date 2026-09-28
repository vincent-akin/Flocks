import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/landing/Hero';
import TrustStrip from '@/components/landing/TrustStrip';
import FeatureSection from '@/components/landing/FeatureSection';
import CommunitySection from '@/components/landing/CommunitySection';
import DiscipleshipSection from '@/components/landing/DiscipleshipSection';
import PrayerSection from '@/components/landing/PrayerSection';
import AttendanceSection from '@/components/landing/AttendanceSection';
import AnalyticsSection from '@/components/landing/AnalyticsSection';
import ParishSection from '@/components/landing/ParishSection';
import SecuritySection from '@/components/landing/SecuritySection';
import FinalCTA from '@/components/landing/FinalCTA';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <TrustStrip />
        <FeatureSection />
        <CommunitySection />
        <DiscipleshipSection />
        <PrayerSection />
        <AttendanceSection />
        <AnalyticsSection />
        <ParishSection />
        <SecuritySection />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
