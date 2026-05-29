import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import TechStack from "@/components/TechStack";
import Portfolio from "@/components/Portfolio";
import Services from "@/components/Services";
import Pricing from "@/components/Pricing";
import HowItWorks from "@/components/HowItWorks";
import StartProject from "@/components/StartProject";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import BottomNav from "@/components/BottomNav";
import Footer from "@/components/Footer";

export default function Page() {
  return (
    <>
      <Navbar />
      <main className="pb-16 md:pb-0">
        <Hero />
        <TechStack />
        <Portfolio />
        <Services />
        <Pricing />
        <HowItWorks />
        <StartProject />
      </main>
      <Footer />
      <FloatingWhatsApp />
      <BottomNav />
    </>
  );
}
