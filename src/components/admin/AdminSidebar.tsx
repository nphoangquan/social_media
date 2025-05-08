"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  AlertTriangle,
  Settings,
  BarChart3,
  ShieldAlert,
  Home,
  LogOut,
} from "lucide-react";

interface AdminSidebarProps {
  userRole: string;
}

const AdminSidebar = ({ userRole }: AdminSidebarProps) => {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  const navItems = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: <LayoutDashboard className="h-5 w-5" />,
      access: ["admin", "moderator"],
    },
    {
      name: "Quản lý người dùng",
      href: "/admin/users",
      icon: <Users className="h-5 w-5" />,
      access: ["admin"],
    },
    {
      name: "Báo cáo",
      href: "/admin/reports",
      icon: <AlertTriangle className="h-5 w-5" />,
      access: ["admin", "moderator"],
    },
    {
      name: "Thống kê",
      href: "/admin/analytics",
      icon: <BarChart3 className="h-5 w-5" />,
      access: ["admin"],
    },
    {
      name: "Cài đặt",
      href: "/admin/settings",
      icon: <Settings className="h-5 w-5" />,
      access: ["admin"],
    },
  ];

  return (
    <div className="w-64 bg-white dark:bg-zinc-900 shadow-md dark:shadow-zinc-800/20 border-r border-zinc-200 dark:border-zinc-800 h-screen sticky top-0 pt-6 flex flex-col rounded-2xl">
      <div className="px-6 py-4 flex items-center gap-2 mb-6">
        <ShieldAlert className="h-6 w-6 text-emerald-500" />
        <h1 className="text-xl font-bold text-zinc-900 dark:text-white">Admin Panel</h1>
      </div>

      <nav className="flex-1">
        <ul className="space-y-1 px-2">
          {navItems
            .filter((item) => item.access.includes(userRole))
            .map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                    isActive(item.href)
                      ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 font-medium"
                      : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                  }`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              </li>
            ))}
        </ul>
      </nav>

      <div className="mt-auto px-2 mb-6 space-y-1">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
        >
          <Home className="h-5 w-5" />
          <span>Về trang chủ</span>
        </Link>
        <Link
          href="/sign-out"
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
        >
          <LogOut className="h-5 w-5" />
          <span>Đăng xuất</span>
        </Link>
      </div>
    </div>
  );
};

export default AdminSidebar; 