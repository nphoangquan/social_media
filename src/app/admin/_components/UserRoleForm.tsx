"use client";

import { useState } from "react";
import { updateUserRole } from "@/lib/actions/admin";

interface UserRoleFormProps {
  userId: string;
  currentRole: string;
}

const UserRoleForm = ({ userId, currentRole }: UserRoleFormProps) => {
  const [role, setRole] = useState(currentRole);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value;
    
    if (newRole === role) return;
    
    setRole(newRole);
    setIsSubmitting(true);
    setMessage(null);
    
    try {
      const { success, error } = await updateUserRole(userId, newRole);
      
      if (success) {
        setMessage({ type: "success", text: "Vai trò đã được cập nhật" });
      } else {
        setMessage({ type: "error", text: error || "Cập nhật vai trò thất bại" });
        setRole(currentRole);
      }
    } catch (error) {
      console.error("Error updating user role:", error);
      setMessage({ type: "error", text: "Có lỗi xảy ra khi cập nhật vai trò" });
      setRole(currentRole);
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const getRoleBadgeColor = (userRole: string) => {
    switch (userRole) {
      case "admin":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "moderator":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      default:
        return "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-400";
    }
  };

  return (
    <div className="relative">
      <select
        title="Chọn vai trò"
        value={role}
        onChange={handleChange}
        disabled={isSubmitting}
        className={`py-1 px-3 rounded text-sm font-medium ${getRoleBadgeColor(role)} border-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 dark:focus:ring-offset-zinc-900`}
      >
        <option value="user">Người dùng</option>
        <option value="moderator">Kiểm duyệt viên</option>
        <option value="admin">Quản trị viên</option>
      </select>
      {message && (
        <div className="absolute left-0 mt-1 w-full">
          <div className={`text-xs px-2 py-1 rounded ${message.type === "success" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"}`}>
            {message.text}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserRoleForm;


