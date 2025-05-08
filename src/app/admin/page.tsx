import { getAdminDashboardStats } from "@/lib/actions/admin";
import {
  Users,
  FileText,
  MessageSquare,
  AlertTriangle,
  UserPlus,
  FileSignature,
} from "lucide-react";
import Link from "next/link";

export default async function AdminDashboard() {
  const { success, stats, error } = await getAdminDashboardStats();

  if (!success || !stats) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-6 text-zinc-900 dark:text-white">
          Dashboard
        </h1>
        <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-4 rounded-lg">
          {error || "Không thể tải dữ liệu. Vui lòng thử lại sau."}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Tổng người dùng",
      value: stats.totalUsers.toLocaleString(),
      icon: <Users className="h-5 w-5" />,
      color: "bg-blue-50 dark:bg-blue-900/20",
      textColor: "text-blue-600 dark:text-blue-400",
      iconColor: "text-blue-500",
      href: "/admin/users",
    },
    {
      title: "Tổng bài đăng",
      value: stats.totalPosts.toLocaleString(),
      icon: <FileText className="h-5 w-5" />,
      color: "bg-emerald-50 dark:bg-emerald-900/20",
      textColor: "text-emerald-600 dark:text-emerald-400",
      iconColor: "text-emerald-500",
      href: "#",
    },
    {
      title: "Tổng bình luận",
      value: stats.totalComments.toLocaleString(),
      icon: <MessageSquare className="h-5 w-5" />,
      color: "bg-purple-50 dark:bg-purple-900/20",
      textColor: "text-purple-600 dark:text-purple-400",
      iconColor: "text-purple-500",
      href: "#",
    },
    {
      title: "Báo cáo chờ xử lý",
      value: stats.pendingReports.toLocaleString(),
      icon: <AlertTriangle className="h-5 w-5" />,
      color: "bg-amber-50 dark:bg-amber-900/20",
      textColor: "text-amber-600 dark:text-amber-400",
      iconColor: "text-amber-500",
      href: "/admin/reports",
    },
    {
      title: "Người dùng mới (7 ngày)",
      value: stats.newUsers.toLocaleString(),
      icon: <UserPlus className="h-5 w-5" />,
      color: "bg-indigo-50 dark:bg-indigo-900/20",
      textColor: "text-indigo-600 dark:text-indigo-400",
      iconColor: "text-indigo-500",
      href: "/admin/users",
    },
    {
      title: "Bài đăng mới (7 ngày)",
      value: stats.newPosts.toLocaleString(),
      icon: <FileSignature className="h-5 w-5" />,
      color: "bg-pink-50 dark:bg-pink-900/20",
      textColor: "text-pink-600 dark:text-pink-400",
      iconColor: "text-pink-500",
      href: "#",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-zinc-900 dark:text-white">
        Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, index) => (
          <Link key={index} href={card.href} className="block">
            <div className={`p-6 rounded-lg shadow-sm border border-zinc-100 dark:border-zinc-800 ${card.color} transition-transform hover:scale-[1.02]`}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className={`text-sm font-medium ${card.textColor}`}>
                    {card.title}
                  </h2>
                  <p className="text-2xl font-bold text-zinc-900 dark:text-white mt-1">
                    {card.value}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${card.color}`}>
                  <div className={card.iconColor}>{card.icon}</div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-sm border border-zinc-100 dark:border-zinc-800">
          <h2 className="text-lg font-semibold mb-4 text-zinc-900 dark:text-white">
            Báo cáo gần đây
          </h2>
          <Link
            href="/admin/reports"
            className="inline-flex items-center mt-2 text-emerald-600 hover:text-emerald-500 text-sm"
          >
            Xem tất cả báo cáo
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-sm border border-zinc-100 dark:border-zinc-800">
          <h2 className="text-lg font-semibold mb-4 text-zinc-900 dark:text-white">
            Người dùng mới nhất
          </h2>
          <Link
            href="/admin/users"
            className="inline-flex items-center mt-2 text-emerald-600 hover:text-emerald-500 text-sm"
          >
            Quản lý người dùng
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
} 