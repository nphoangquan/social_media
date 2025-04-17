"use client";

import { useFormStatus } from "react-dom";

const UpdateButton = () => {
  const { pending } = useFormStatus();

  return (
    <button
      className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 p-3 text-sm rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-800/20 hover:text-emerald-600 dark:hover:text-emerald-300 transition-colors font-medium w-full shadow-sm hover:shadow-md disabled:bg-opacity-50 disabled:cursor-not-allowed"
      disabled={pending}
    >
      {pending ? "Updating..." : "Update Profile"}
    </button>
  );
};

export default UpdateButton;