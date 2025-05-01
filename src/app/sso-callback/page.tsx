"use client";

import { Suspense } from "react";
import { SSOCallbackContent } from "./sso-callback-content";

export default function SSOCallback() {
  return (
    <Suspense fallback={
      <div className="h-screen w-full flex items-center justify-center bg-zinc-950">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-400 mb-4"></div>
          <h3 className="text-white text-lg font-medium">Đang xử lý đăng nhập...</h3>
          <p className="text-zinc-400 text-sm mt-2">Vui lòng đợi trong giây lát</p>
        </div>
      </div>
    }>
      <SSOCallbackContent />
    </Suspense>
  );
} 