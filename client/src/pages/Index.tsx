import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import FeatureSection from '../components/FeatureSection';
import HowItWorks from '../components/HowItWorks';


const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <FeatureSection />
        <HowItWorks />
      </main>

    </div>
  );
};

export default Index;
