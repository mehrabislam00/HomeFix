import { AboutHero } from "@/components/About/about-hero";
import { AudiencePanels } from "@/components/About/audience-panels";
import { MissionVision } from "@/components/About/mission-vision";
import { TrustBanner } from "@/components/About/trust-banner";
import type { Metadata } from "next";



export const metadata: Metadata = {
  title: "About — HomeFix",
  description:
    "HomeFix connects homeowners with approved technicians, with clear pricing and a booking flow from request to payment.",
};

const About = () => {
  return (
    <main className="relative isolate min-h-screen overflow-x-clip bg-ivory">
      {/* Soft sage light-pools, same as the rest of the site */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[900px] overflow-hidden">
        <div className="absolute -left-28 top-20 size-[440px] rounded-full bg-sage/20 blur-3xl" />
        <div className="absolute -right-24 top-0 size-[480px] rounded-full bg-muted-sage/20 blur-3xl" />
        <div className="absolute left-[38%] top-[520px] size-[380px] rounded-full bg-pale-sage blur-3xl" />
      </div>

      <AboutHero />
      <MissionVision />
      <AudiencePanels />
      <TrustBanner />
    </main>
  );
};

export default About;