import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Định nghĩa tất cả các tuyến đường yêu cầu xác thực
const isProtectedRoute = createRouteMatcher([
  "/settings(.*)", 
  "/",
  "/profile(.*)",
  "/friends(.*)",
  "/friend-requests(.*)", 
  "/activity(.*)",
  "/notifications(.*)",
  "/events(.*)",
  "/stories(.*)",
  "/post/(.*)" // Bây giờ các bài đăng yêu cầu xác thực
]);

export default clerkMiddleware(async (auth, req) => {
  // Bảo vệ các tuyến đường cần xác thực
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Bỏ qua các file nội bộ của Next.js và tất cả các file tĩnh, trừ khi được tìm thấy trong tham số tìm kiếm
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Luôn chạy cho các tuyến API
    "/(api|trpc)(.*)",
  ],
};


