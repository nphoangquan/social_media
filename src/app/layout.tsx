import type { Metadata } from "next";
import { Inter, Orbitron } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { ClerkProvider } from "@clerk/nextjs";

const inter = Inter({ subsets: ["latin"] });
const orbitron = Orbitron({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Introvertia - Social Media App",
  description: "Social media app built with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html suppressHydrationWarning lang="en" className="dark">
        <body suppressHydrationWarning className={`${inter.className} bg-zinc-950 text-zinc-100`}>
          <div className="w-full bg-zinc-900/80 backdrop-blur-sm border-b border-zinc-800/50 px-4 md:px-8 lg:px-24 xl:px-40 2xl:px-80 sticky top-0 z-50">
            <Navbar logoFont={orbitron.className} />
          </div>
          <div className="bg-zinc-950 px-4 md:px-8 lg:px-24 xl:px-40 2xl:px-80">
            {children}
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}