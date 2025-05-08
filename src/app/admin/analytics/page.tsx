import { getAdminDashboardStats } from "@/lib/actions/admin";
import { BarChart3, TrendingUp, Users, FileText, MessageSquare, Calendar } from "lucide-react";

// Định nghĩa interface cho stats object mở rộng
interface ExtendedStats {
  totalUsers: number;
  totalPosts: number;
  totalComments: number;
  pendingReports: number;
  newUsers: number;
  newPosts: number;
  newComments?: number;
  dailyInteractions?: number;
  interactionGrowthRate?: number;
}

export default async function AnalyticsPage() {
  const { success, stats, error } = await getAdminDashboardStats();

  if (!success || !stats) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6 text-zinc-900 dark:text-white">
          Thống kê
        </h1>
        <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-4 rounded-lg">
          {error || "Không thể tải dữ liệu thống kê. Vui lòng thử lại sau."}
        </div>
      </div>
    );
  }

  // Sử dụng interface đã định nghĩa
  const extendedStats = stats as ExtendedStats;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          Thống kê
        </h1>
        <div className="flex items-center gap-2">
          <label htmlFor="time-period" className="sr-only">Chọn khoảng thời gian</label>
          <select id="time-period" className="px-3 py-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm">
            <option value="7days">7 ngày qua</option>
            <option value="30days">30 ngày qua</option>
            <option value="90days">90 ngày qua</option>
            <option value="year">12 tháng qua</option>
          </select>
        </div>
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-100 dark:border-zinc-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Tổng người dùng</p>
              <h3 className="text-2xl font-bold mt-1 text-zinc-900 dark:text-white">{extendedStats.totalUsers.toLocaleString()}</h3>
              <div className="flex items-center mt-2 text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span className="text-xs">+{extendedStats.newUsers} tuần này</span>
              </div>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-full">
              <Users className="h-6 w-6 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-100 dark:border-zinc-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Tổng bài đăng</p>
              <h3 className="text-2xl font-bold mt-1 text-zinc-900 dark:text-white">{extendedStats.totalPosts.toLocaleString()}</h3>
              <div className="flex items-center mt-2 text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span className="text-xs">+{extendedStats.newPosts} tuần này</span>
              </div>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-full">
              <FileText className="h-6 w-6 text-emerald-500" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-100 dark:border-zinc-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Tổng bình luận</p>
              <h3 className="text-2xl font-bold mt-1 text-zinc-900 dark:text-white">{extendedStats.totalComments.toLocaleString()}</h3>
              <div className="flex items-center mt-2 text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span className="text-xs">+{extendedStats.newComments || 0} tuần này</span>
              </div>
            </div>
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-full">
              <MessageSquare className="h-6 w-6 text-purple-500" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-100 dark:border-zinc-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Tương tác hàng ngày</p>
              <h3 className="text-2xl font-bold mt-1 text-zinc-900 dark:text-white">{(extendedStats.dailyInteractions || 0).toLocaleString()}</h3>
              <div className="flex items-center mt-2 text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span className="text-xs">+{Math.round((extendedStats.interactionGrowthRate || 0) * 100)}% so với tuần trước</span>
              </div>
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-full">
              <Calendar className="h-6 w-6 text-amber-500" />
            </div>
          </div>
        </div>
      </div>

      {/* GROWTH CHART */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-100 dark:border-zinc-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Tăng trưởng người dùng</h3>
          </div>
          <div className="h-[300px] flex items-center justify-center">
            <div className="w-full h-full flex flex-col items-center justify-center text-center">
              <BarChart3 className="h-12 w-12 text-zinc-300 dark:text-zinc-700 mb-2" />
              <p className="text-zinc-500 dark:text-zinc-400 mb-1">Biểu đồ tăng trưởng</p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 max-w-xs">
                Hiển thị dữ liệu người dùng mới theo thời gian
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-100 dark:border-zinc-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Tương tác nội dung</h3>
          </div>
          <div className="h-[300px] flex items-center justify-center">
            <div className="w-full h-full flex flex-col items-center justify-center text-center">
              <BarChart3 className="h-12 w-12 text-zinc-300 dark:text-zinc-700 mb-2" />
              <p className="text-zinc-500 dark:text-zinc-400 mb-1">Biểu đồ tương tác</p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 max-w-xs">
                Hiển thị dữ liệu tương tác (bình luận, thích) theo thời gian
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* DETAILS */}
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-100 dark:border-zinc-800 p-6">
          <h3 className="text-lg font-semibold mb-4 text-zinc-900 dark:text-white">Phân tích nội dung</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-50 dark:bg-zinc-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Loại nội dung
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Tổng số
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    7 ngày qua
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Tăng trưởng
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-900 dark:text-white">
                    Bài đăng
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-400">
                    {extendedStats.totalPosts.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-400">
                    {extendedStats.newPosts.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
                      +{Math.round((extendedStats.newPosts / (extendedStats.totalPosts - extendedStats.newPosts || 1)) * 100)}%
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-900 dark:text-white">
                    Bình luận
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-400">
                    {extendedStats.totalComments.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-400">
                    {(extendedStats.newComments || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
                      +{Math.round(((extendedStats.newComments || 0) / (extendedStats.totalComments - (extendedStats.newComments || 0) || 1)) * 100)}%
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-900 dark:text-white">
                    Người dùng
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-400">
                    {extendedStats.totalUsers.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-400">
                    {extendedStats.newUsers.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
                      +{Math.round((extendedStats.newUsers / (extendedStats.totalUsers - extendedStats.newUsers || 1)) * 100)}%
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 