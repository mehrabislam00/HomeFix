// app/page.tsx

import { Hero } from "@/components/Hero/hero";
import { PopularCategories } from "@/components/home/popular-categories";
import { Navbar } from "@/components/Navbar/navbar";
import { PageBackdrop } from "@/components/PageBackdrop/page-backdrop";


const Home = () => {
  return (
    <main className="relative isolate min-h-screen overflow-x-clip bg-ivory">
      <PageBackdrop />
      <Navbar />
      <Hero />
      <PopularCategories />
    </main>
  );
};

export default Home;