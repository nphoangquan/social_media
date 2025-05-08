import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/client";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Kiểm tra xem người dùng có phải là admin hoặc moderator không
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (!user || (user.role !== "admin" && user.role !== "moderator")) {
    redirect("/"); // Chuyển hướng về trang chủ nếu không phải admin/moderator
  }

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <AdminSidebar userRole={user.role} />
      <div className="flex-1 p-8">{children}</div>
    </div>
  );
} 