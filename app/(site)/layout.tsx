import { Footer } from "@/components/Footer/footer";
import { Navbar } from "@/components/Navbar/navbar";

/** Public site chrome. Auth pages live in the (auth) group and render without it. */
export default function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}