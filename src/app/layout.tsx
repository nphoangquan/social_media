import type { Metadata } from "next";
import { Inter, Orbitron } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { ClerkProvider } from "@clerk/nextjs";
import { NotificationProvider } from "@/lib/contexts/NotificationContext";
import AvatarRefresh from "@/components/AvatarRefresh";

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
      <html lang="en" className="dark">
        <body suppressHydrationWarning className={`${inter.className} bg-zinc-950 text-zinc-100`}>
          <NotificationProvider>
            {/* Component làm mới avatar để xử lý đồng bộ hóa dữ liệu */}
            <AvatarRefresh />
            
            {/* Thanh điều hướng với gradient màu ngọc lục bảo */}
            <div className="relative w-full sticky top-0 z-50">
              {/* Nền gradient màu ngọc lục bảo */}
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/20 via-emerald-900/10 to-emerald-950/20"></div>
              
              {/* Container thanh điều hướng */}
              <div className="relative w-full bg-zinc-900/80 backdrop-blur-sm border-b border-zinc-800/50 px-4 md:px-8 lg:px-24 xl:px-40 2xl:px-80">
                <Navbar logoFont={orbitron.className} />
              </div>
            </div>
            
            <div className="bg-zinc-950 px-4 md:px-8 lg:px-24 xl:px-40 2xl:px-80 pt-4">
              {children}
            </div>
          </NotificationProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}