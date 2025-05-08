"use client";

import { useState } from "react";
import { updateReportStatus } from "@/lib/actions/admin";

interface ReportStatusFormProps {
  reportId: number;
  currentStatus: string;
}

const ReportStatusForm = ({ reportId, currentStatus }: ReportStatusFormProps) => {
  const [status, setStatus] = useState(currentStatus);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    
    if (newStatus === status) return;
    
    setStatus(newStatus);
    setIsSubmitting(true);
    setMessage(null);
    
    try {
      const { success, error } = await updateReportStatus(reportId, newStatus);
      
      if (success) {
        setMessage({ type: "success", text: "Trạng thái đã được cập nhật" });
      } else {
        setMessage({ type: "error", text: error || "Cập nhật trạng thái thất bại" });
        setStatus(currentStatus); // Reset về trạng thái cũ nếu thất bại
      }
    } catch (error) {
      setMessage({ type: "error", text: "Có lỗi xảy ra khi cập nhật trạng thái" });
      setStatus(currentStatus); // Reset về trạng thái cũ nếu thất bại
      console.error(error);
    } finally {
      setIsSubmitting(false);
      
      // Tự động ẩn thông báo sau 3 giây
      setTimeout(() => {
        setMessage(null);
      }, 3000);
    }
  };

  const getStatusBadgeColor = (reportStatus: string) => {
    switch (reportStatus) {
      case "resolved":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
    }
  };

  return (
    <div className="relative">
      <select
        value={status}
        onChange={handleChange}
        disabled={isSubmitting}
        aria-label="Trạng thái báo cáo"
        className={`py-1 px-3 rounded text-sm font-medium ${getStatusBadgeColor(
          status
        )} border-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 dark:focus:ring-offset-zinc-900`}
      >
        <option value="pending">Chờ xử lý</option>
        <option value="resolved">Đã xử lý</option>
        <option value="rejected">Từ chối</option>
      </select>
      
      {message && (
        <div className="absolute left-0 mt-1 w-full">
          <div
            className={`text-xs px-2 py-1 rounded ${
              message.type === "success"
                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
            }`}
          >
            {message.text}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportStatusForm; 