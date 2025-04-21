"use client";

import { useFormStatus } from "react-dom";

const AddPostButton = () => {
  const { pending } = useFormStatus();
  return (
    <button
      className="bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 px-4 py-1.5 rounded-xl text-white text-sm font-medium transition-colors disabled:bg-emerald-400/50 dark:disabled:bg-emerald-500/50 disabled:cursor-not-allowed cursor-pointer"
      disabled={pending}
    >
      {pending ? (
        <div className="flex items-center gap-2">
          <div className="inline-block h-[10px] w-[10px] animate-spin rounded-full border-2 border-white/70 border-solid border-e-transparent align-[-0.125em] text-surface motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          {/* <div className="inline-block h-[10px] w-[10px] animate-spin rounded-full border-2 border-white/70 border-solid border-current border-e-transparent align-[-0.125em] text-surface motion-reduce:animate-[spin_1.5s_linear_infinite]" /> */}
          Sending
        </div>
      ) : (
        "Send"
      )}
    </button>
  );
};

export default AddPostButton;