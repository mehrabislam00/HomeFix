// app/page.tsx

import { Hero } from "@/components/Hero/hero";
import { CtaBanner } from "@/components/home/cta-banner";
import { HowItWorks } from "@/components/home/how-it-works";
import { PopularCategories } from "@/components/home/popular-categories";
import { Testimonials } from "@/components/home/testimonials";
import { TopRatedServices } from "@/components/home/top-rated-services";
import { WhyHomeFix } from "@/components/home/why-homefix";
import { Navbar } from "@/components/Navbar/navbar";
import { PageBackdrop } from "@/components/PageBackdrop/page-backdrop";


const Home = () => {
  return (
    <main className="relative isolate min-h-screen overflow-x-clip bg-ivory">
      <PageBackdrop />
      
      <Hero />
      <PopularCategories />
      <HowItWorks />
      <TopRatedServices />
       <Testimonials />
      <WhyHomeFix />
      <CtaBanner />
    </main>
  );
};

export default Home;