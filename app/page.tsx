import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import HowItWorks from '@/components/HowItWorks';
import Pricing from '@/components/Pricing';
import SampleReport from '@/components/SampleReport';
import Testimonials from '@/components/Testimonials';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main style={{ background: '#0A0A0A', minHeight: '100vh' }}>
      <Navbar />
      <Hero />
      <HowItWorks />
      <SampleReport />
      <Pricing />
      <Testimonials />
      <Footer />
    </main>
  );
}
