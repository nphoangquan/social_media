import LeftMenu from "@/app/(app)/_components/LeftMenu";
import { Suspense } from "react";

export const metadata = {
  title: "Videos | Introvertia",
  description: "View all your videos on Introvertia",
};

export default function VideosLayout({
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
        {/* Sidebar content bên phải nếu cần */}
      </div>
    </div>
  );
} 