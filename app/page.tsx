// app/page.tsx

import { Hero } from "@/components/Hero/hero";
import { Navbar } from "@/components/Navbar/navbar";
import { PageBackdrop } from "@/components/PageBackdrop/page-backdrop";
import { SectionShell } from "@/components/Section shell/section-shell";


// import your existing services component, for example:
// import { ServiceCategories } from "@/components/service-categories";

const Home = () => {
  return (
    <main className="relative isolate min-h-screen overflow-x-clip bg-ivory">
      <PageBackdrop />
      <Navbar />
      <Hero />

      <SectionShell
      
        id="services"
        title="Home Services"
        description="Pick a category and book a verified technician."
      >
        {/* your existing Home Services cards / grid go here */}
        {/* <ServiceCategories /> */}
      </SectionShell>
    </main>
  );
};

export default Home;