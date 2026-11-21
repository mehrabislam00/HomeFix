import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";

import { Footer } from "@/components/Footer/footer";
import { Navbar } from "@/components/Navbar/navbar";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });

export const metadata: Metadata = {
  title: "HomeFix — Expert repairs. Trusted technicians.",
  description:
    "Book reliable professionals for your home appliances, electrical and plumbing needs.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${manrope.variable}`}>
      {/* inter.className sets font-family directly, so it works regardless of Tailwind font config */}
      <body className={`${inter.className} bg-ivory text-ink antialiased`}>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}