"use client";

import { useState } from "react";
import { synchronizeUserAvatar } from "@/lib/actions";
import { useRouter } from "next/navigation";

export default function SyncAvatarButton() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();
  
  const handleSync = async () => {
    setIsSyncing(true);
    setMessage("");
    
    try {
      const result = await synchronizeUserAvatar();
      
      if (result.success) {
        setMessage("Avatar synchronized successfully!");
        // Buộc refresh tất cả components
        router.refresh();
      } else {
        setMessage("Failed to synchronize avatar.");
      }
    } catch (error) {
      setMessage("Error synchronizing avatar.");
      console.error(error);
    } finally {
      setIsSyncing(false);
    }
  };
  
  return (
    <div className="mt-4">
      <button 
        onClick={handleSync} 
        disabled={isSyncing}
        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isSyncing ? (
          <>
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-solid border-current border-e-transparent align-[-0.125em]"></span>
            Syncing...
          </>
        ) : (
          "Sync Avatar"
        )}
      </button>
      
      {message && (
        <p className={`mt-2 text-sm ${message.includes("success") ? "text-emerald-500" : "text-red-500"}`}>
          {message}
        </p>
      )}
    </div>
  );
} 