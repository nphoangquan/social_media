import { getReports } from "@/lib/actions/admin";
import ReportStatusForm from "@/app/admin/_components/ReportStatusForm";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import Image from "next/image";
import Link from "next/link";

export default async function ReportsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const page = typeof params.page === "string" ? parseInt(params.page) : 1;
  const status = typeof params.status === "string" ? params.status : undefined;
  
  const { success, reports, pagination, error } = await getReports(page, 10, status);

  if (!success || !reports) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6 text-zinc-900 dark:text-white">
          Quản lý báo cáo
        </h1>
        <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-4 rounded-lg">
          {error || "Không thể tải danh sách báo cáo. Vui lòng thử lại sau."}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          Quản lý báo cáo
        </h1>
        
        <div className="flex gap-2">
          <Link 
            href="/admin/reports" 
            className={`px-3 py-1.5 text-sm rounded-md ${!status ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'}`}
          >
            Tất cả
          </Link>
          <Link 
            href="/admin/reports?status=pending" 
            className={`px-3 py-1.5 text-sm rounded-md ${status === 'pending' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'}`}
          >
            Chờ xử lý
          </Link>
          <Link 
            href="/admin/reports?status=resolved" 
            className={`px-3 py-1.5 text-sm rounded-md ${status === 'resolved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'}`}
          >
            Đã xử lý
          </Link>
          <Link 
            href="/admin/reports?status=rejected" 
            className={`px-3 py-1.5 text-sm rounded-md ${status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'}`}
          >
            Từ chối
          </Link>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-100 dark:border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-50 dark:bg-zinc-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Người báo cáo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Loại
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Lý do
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Thời gian
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {reports.map((report) => (
                <tr key={report.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 flex-shrink-0">
                        {report.submitter.avatar ? (
                          <Image
                            className="h-8 w-8 rounded-full object-cover"
                            src={report.submitter.avatar}
                            alt={report.submitter.username}
                            width={32}
                            height={32}
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center">
                            <span className="text-zinc-600 dark:text-zinc-300 text-xs font-medium">
                              {report.submitter.username.substring(0, 2).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-zinc-900 dark:text-white">
                          {report.submitter.name} {report.submitter.surname}
                        </div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-400">
                          @{report.submitter.username}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      report.type === 'POST' 
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' 
                        : report.type === 'COMMENT'
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {report.type === 'POST' 
                        ? 'Bài viết' 
                        : report.type === 'COMMENT' 
                        ? 'Bình luận' 
                        : 'Người dùng'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-zinc-900 dark:text-white">
                      {report.reason}
                    </div>
                    {report.description && (
                      <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                        {report.description.length > 50 
                          ? `${report.description.substring(0, 50)}...` 
                          : report.description}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-zinc-500 dark:text-zinc-400">
                      {formatDistanceToNow(new Date(report.createdAt), {
                        addSuffix: true,
                        locale: vi,
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <ReportStatusForm reportId={report.id} currentStatus={report.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {report.type === 'POST' && report.postId && (
                      <Link
                        href={`/post/${report.postId}`}
                        className="text-emerald-600 hover:text-emerald-900 dark:hover:text-emerald-400 mr-3"
                      >
                        Xem bài viết
                      </Link>
                    )}
                    {report.type === 'USER' && report.reportedUser && (
                      <Link
                        href={`/profile/${report.reportedUser.username}`}
                        className="text-emerald-600 hover:text-emerald-900 dark:hover:text-emerald-400 mr-3"
                      >
                        Xem người dùng
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Phân trang */}
        {pagination && pagination.totalPages > 1 && (
          <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-800 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
            <div className="text-sm text-zinc-500 dark:text-zinc-400">
              Hiển thị {(pagination.currentPage - 1) * pagination.limit + 1} đến{" "}
              {Math.min(pagination.currentPage * pagination.limit, pagination.totalReports)} trong{" "}
              {pagination.totalReports} báo cáo
            </div>
            <div className="flex space-x-2">
              {pagination.currentPage > 1 && (
                <Link
                  href={`?page=${pagination.currentPage - 1}${status ? `&status=${status}` : ''}`}
                  className="px-3 py-1 rounded bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 text-sm"
                >
                  Trước
                </Link>
              )}
              {pagination.currentPage < pagination.totalPages && (
                <Link
                  href={`?page=${pagination.currentPage + 1}${status ? `&status=${status}` : ''}`}
                  className="px-3 py-1 rounded bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 text-sm"
                >
                  Sau
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 