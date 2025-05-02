import LeftMenu from "@/components/leftMenu/LeftMenu";
import { Suspense } from "react";

export const metadata = {
  title: "Photos | Introvertia",
  description: "View all your photos on Introvertia",
};

export default function PhotosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-6 px-6 py-8">
      <div className="hidden lg:block sticky top-24 h-fit w-1/4">
        <Suspense fallback={<div>Loading...</div>}>
          <LeftMenu type="home" />
        </Suspense>
      </div>
      <div className="flex-1">
        {children}
      </div>
      <div className="hidden xl:block w-1/4">
        {/* Right sidebar content if needed */}
      </div>
    </div>
  );
} 