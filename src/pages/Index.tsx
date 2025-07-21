import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Brands from "@/components/Brands";
import Features from "@/components/Features";
import Pricing from "@/components/Pricing";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <Brands />
      <Features />
      <Pricing />
      <Testimonials />
      <Footer />
    </div>
  );
};

export default Index;
