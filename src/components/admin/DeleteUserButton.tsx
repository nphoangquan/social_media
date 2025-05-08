"use client";

import { useState } from "react";
import { deleteUser } from "@/lib/actions/admin";
import { Trash2 } from "lucide-react";

interface DeleteUserButtonProps {
  userId: string;
}

export default function DeleteUserButton({ userId }: DeleteUserButtonProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      const result = await deleteUser(userId);
      
      if (!result.success) {
        setError(result.error || "Có lỗi xảy ra khi xóa người dùng");
        setIsConfirming(false);
      }
    } catch {
      setError("Có lỗi xảy ra khi xóa người dùng");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isConfirming) {
    return (
      <div className="flex items-center space-x-2">
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="text-white bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-xs"
        >
          {isDeleting ? "Đang xóa..." : "Xác nhận"}
        </button>
        <button
          onClick={() => setIsConfirming(false)}
          disabled={isDeleting}
          className="text-zinc-600 dark:text-zinc-400 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 px-2 py-1 rounded text-xs"
        >
          Hủy
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsConfirming(true)}
        className="text-red-600 hover:text-red-900 dark:hover:text-red-400 flex items-center"
      >
        <Trash2 className="h-4 w-4 mr-1" />
        Xóa
      </button>
      {error && <div className="text-xs text-red-500 mt-1">{error}</div>}
    </>
  );
} 