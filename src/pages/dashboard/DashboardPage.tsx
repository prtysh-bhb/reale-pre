import Header from "@/components/layout/public/Header";
import Footer from "@/components/layout/public/Footer";
import HeroSection from "@/components/sections/home/HeroSection";
import RecommendedProperties from "@/components/sections/home/RecommendedProperties";
import FaqSection from "@/components/sections/home/FAQSection";
import ServicesSection from "@/components/sections/home/ServicesSection";
import WhyChooseSection from "@/components/sections/home/WhyChooseSection";

export default function DashboardPage() {
  return (
    <>
      <Header />
      <HeroSection />
      <RecommendedProperties />
      <ServicesSection />
      <WhyChooseSection />
      <FaqSection />
      <Footer />
    </>
  );
}
