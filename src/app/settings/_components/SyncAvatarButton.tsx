"use client";

import { synchronizeUserAvatar } from "@/lib/actions";
import { useState } from "react";

export default function SyncAvatarButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSync = async () => {
    if (loading) return;
    setLoading(true);
    setMessage(null);
    try {
      const result = await synchronizeUserAvatar();
      if (result.success) {
        setMessage("Avatar synchronized successfully");
      } else {
        setMessage(result.error || "Failed to sync avatar");
      }
    } catch (err) {
      setMessage("Error during avatar sync");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handleSync}
        disabled={loading}
        className="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 disabled:opacity-60"
      >
        {loading ? "Syncing..." : "Sync Avatar"}
      </button>
      {message && <div className="text-sm text-zinc-500">{message}</div>}
    </div>
  );
}



