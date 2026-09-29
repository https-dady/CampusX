import Header from "../components/landing/Header";
import HeroSection from "../components/landing/HeroSection";
import StatsSection from "../components/landing/StatsSection";
import StartingPointSection from "../components/landing/StartingPointSection";
import ExperienceSection from "../components/landing/ExperienceSection";
import RoleMatchesSection from "../components/landing/RoleMatchesSection";
import CareerCTASection from "../components/landing/CareerCTASection";
import CoursesSection from "../components/landing/CoursesSection";
import Footer from "../components/landing/Footer";


const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#faf7f0]">
      <Header />

      <main>
        <HeroSection />
        <StatsSection />
        <StartingPointSection />
        <ExperienceSection />
        <RoleMatchesSection />
        <CareerCTASection />
        <CoursesSection />
        <Footer/>
      </main>
    </div>
  );
};

export default LandingPage;