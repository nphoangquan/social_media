import { getAllUsers } from "@/lib/actions/admin";
import UserRoleForm from "@/components/admin/UserRoleForm";
import DeleteUserButton from "@/components/admin/DeleteUserButton";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import Image from "next/image";
import Link from "next/link";

export default async function UsersAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const page = typeof params.page === "string" ? parseInt(params.page) : 1;
  const { success, users, pagination, error } = await getAllUsers(page, 10);

  if (!success || !users) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6 text-zinc-900 dark:text-white">
          Quản lý người dùng
        </h1>
        <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-4 rounded-lg">
          {error || "Không thể tải danh sách người dùng. Vui lòng thử lại sau."}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-zinc-900 dark:text-white">
        Quản lý người dùng
      </h1>

      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-100 dark:border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-50 dark:bg-zinc-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Người dùng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Ngày tham gia
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Vai trò
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Thống kê
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        {user.avatar ? (
                          <Image
                            className="h-10 w-10 rounded-full object-cover"
                            src={user.avatar}
                            alt={user.username}
                            width={40}
                            height={40}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center">
                            <span className="text-zinc-600 dark:text-zinc-300 text-sm font-medium">
                              {user.username.substring(0, 2).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-zinc-900 dark:text-white">
                          {user.name} {user.surname}
                        </div>
                        <div className="text-sm text-zinc-500 dark:text-zinc-400">
                          @{user.username}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-zinc-500 dark:text-zinc-400">
                      {formatDistanceToNow(new Date(user.createdAt), {
                        addSuffix: true,
                        locale: vi,
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <UserRoleForm userId={user.id} currentRole={user.role} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-400">
                    <div className="flex items-center space-x-4">
                      <div>
                        <span className="font-medium">{user._count.posts}</span> bài viết
                      </div>
                      <div>
                        <span className="font-medium">{user._count.comments}</span> bình luận
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center space-x-3">
                      <Link
                        href={`/profile/${user.username}`}
                        className="text-emerald-600 hover:text-emerald-900 dark:hover:text-emerald-400"
                      >
                        Xem hồ sơ
                      </Link>
                      <DeleteUserButton userId={user.id} />
                    </div>
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
              {Math.min(pagination.currentPage * pagination.limit, pagination.totalUsers)} trong{" "}
              {pagination.totalUsers} người dùng
            </div>
            <div className="flex space-x-2">
              {pagination.currentPage > 1 && (
                <Link
                  href={`?page=${pagination.currentPage - 1}`}
                  className="px-3 py-1 rounded bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 text-sm"
                >
                  Trước
                </Link>
              )}
              {pagination.currentPage < pagination.totalPages && (
                <Link
                  href={`?page=${pagination.currentPage + 1}`}
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