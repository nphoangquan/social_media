import { Save, ServerCrash, ShieldAlert, Lock } from "lucide-react";
import { hasPermission, Permission } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  // Kiểm tra quyền truy cập
  const hasAccess = await hasPermission(Permission.VIEW_ANALYTICS);
  if (!hasAccess) {
    redirect("/");
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          Cài đặt hệ thống
        </h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm transition-colors">
          <Save className="h-4 w-4" />
          Lưu thay đổi
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-100 dark:border-zinc-800 p-4">
            <nav className="space-y-1">
              <a href="#general" className="flex items-center px-3 py-2 text-sm font-medium rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400">
                Cài đặt chung
              </a>
              <a href="#security" className="flex items-center px-3 py-2 text-sm font-medium rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400">
                Bảo mật
              </a>
              <a href="#notifications" className="flex items-center px-3 py-2 text-sm font-medium rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400">
                Thông báo
              </a>
              <a href="#advanced" className="flex items-center px-3 py-2 text-sm font-medium rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400">
                Nâng cao
              </a>
            </nav>
          </div>
        </div>

        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cài đặt chung */}
          <section id="general" className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-100 dark:border-zinc-800 p-6">
            <h2 className="text-lg font-semibold mb-4 text-zinc-900 dark:text-white">Cài đặt chung</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="site-name" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Tên trang web
                </label>
                <input
                  type="text"
                  id="site-name"
                  defaultValue="Introvertia"
                  className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-800"
                />
              </div>
              
              <div>
                <label htmlFor="site-description" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Mô tả
                </label>
                <textarea
                  id="site-description"
                  rows={3}
                  defaultValue="Mạng Xã Hội Được Xây Dựng Bởi Nguyễn Phan Hoàng Quân"
                  className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-800"
                ></textarea>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="maintenance-mode"
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-zinc-300 rounded"
                />
                <label htmlFor="maintenance-mode" className="ml-2 block text-sm text-zinc-700 dark:text-zinc-300">
                  Bật chế độ bảo trì
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="user-registration"
                  defaultChecked={true}
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-zinc-300 rounded"
                />
                <label htmlFor="user-registration" className="ml-2 block text-sm text-zinc-700 dark:text-zinc-300">
                  Cho phép đăng ký tài khoản mới
                </label>
              </div>
            </div>
          </section>
          
          {/* Bảo mật */}
          <section id="security" className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-100 dark:border-zinc-800 p-6">
            <h2 className="text-lg font-semibold mb-4 text-zinc-900 dark:text-white flex items-center">
              <Lock className="h-5 w-5 mr-2 text-zinc-500 dark:text-zinc-400" />
              Bảo mật
            </h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="login-attempts" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Số lần đăng nhập tối đa thất bại
                </label>
                <input
                  type="number"
                  id="login-attempts"
                  defaultValue={5}
                  min={1}
                  max={10}
                  className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-800"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="two-factor"
                  defaultChecked={true}
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-zinc-300 rounded"
                />
                <label htmlFor="two-factor" className="ml-2 block text-sm text-zinc-700 dark:text-zinc-300">
                  Yêu cầu xác thực hai yếu tố cho vai trò Admin
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="content-filter"
                  defaultChecked={true}
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-zinc-300 rounded"
                />
                <label htmlFor="content-filter" className="ml-2 block text-sm text-zinc-700 dark:text-zinc-300">
                  Bật lọc nội dung không phù hợp
                </label>
              </div>
            </div>
          </section>
          
          {/* Thông báo */}
          <section id="notifications" className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-100 dark:border-zinc-800 p-6">
            <h2 className="text-lg font-semibold mb-4 text-zinc-900 dark:text-white">Thông báo</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800">
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-white">Thông báo báo cáo mới</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Nhận email khi có báo cáo mới</p>
                </div>
                <div className="flex items-center">
                  <label className="inline-flex relative items-center cursor-pointer">
                    <input type="checkbox" defaultChecked={true} className="sr-only peer" />
                    <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 dark:peer-focus:ring-emerald-800 rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-zinc-600 peer-checked:bg-emerald-600"></div>
                  </label>
                </div>
              </div>
              
              <div className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800">
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-white">Thông báo người dùng mới</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Nhận email khi có người dùng đăng ký mới</p>
                </div>
                <div className="flex items-center">
                  <label className="inline-flex relative items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 dark:peer-focus:ring-emerald-800 rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-zinc-600 peer-checked:bg-emerald-600"></div>
                  </label>
                </div>
              </div>
              
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-white">Thông báo bảo trì hệ thống</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Gửi email thông báo cho tất cả người dùng</p>
                </div>
                <div className="flex items-center">
                  <label className="inline-flex relative items-center cursor-pointer">
                    <input type="checkbox" defaultChecked={true} className="sr-only peer" />
                    <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 dark:peer-focus:ring-emerald-800 rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-zinc-600 peer-checked:bg-emerald-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </section>
          
          {/* Nâng cao */}
          <section id="advanced" className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-100 dark:border-zinc-800 p-6">
            <h2 className="text-lg font-semibold mb-4 text-zinc-900 dark:text-white flex items-center">
              <ServerCrash className="h-5 w-5 mr-2 text-zinc-500 dark:text-zinc-400" />
              Cài đặt nâng cao
              <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-500">
                Chỉ Admin
              </span>
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="debug-mode"
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-zinc-300 rounded"
                />
                <label htmlFor="debug-mode" className="ml-2 block text-sm text-zinc-700 dark:text-zinc-300">
                  Bật chế độ gỡ lỗi
                </label>
              </div>
              
              <div>
                <label htmlFor="api-timeout" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Thời gian timeout API (ms)
                </label>
                <input
                  type="number"
                  id="api-timeout"
                  defaultValue={30000}
                  step={1000}
                  min={5000}
                  max={60000}
                  className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-800"
                />
              </div>
              
              <div>
                <label htmlFor="cache-duration" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Thời gian cache (giây)
                </label>
                <input
                  type="number"
                  id="cache-duration"
                  defaultValue={3600}
                  step={300}
                  min={0}
                  max={86400}
                  className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-800"
                />
              </div>
              
              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <button className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors">
                  <ShieldAlert className="h-4 w-4" />
                  Xóa tất cả cache
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
} 