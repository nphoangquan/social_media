"use client";

import { useEffect } from "react";
import { useSignIn } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";

export function SSOCallbackContent() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Lấy "createdSessionId" từ URL
    if (isLoaded && signIn) {
      const createdSessionId = searchParams.get("createdSessionId");
      
      if (createdSessionId) {
        setActive({ session: createdSessionId }).then(() => {
          router.push("/");
        }).catch((err) => {
          console.error("Error setting active session:", err);
          router.push("/sign-in");
        });
      } else {
        // Xử lý trường hợp callback không bao gồm createdSessionId
        // Chuyển hướng người dùng về trang đăng nhập
        router.push("/sign-in"); 
      }
    }
  }, [isLoaded, signIn, setActive, router, searchParams]);

  return (
    <div className="h-screen w-full flex items-center justify-center bg-zinc-950">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-400 mb-4"></div>
        <h3 className="text-white text-lg font-medium">Đang xử lý đăng nhập...</h3>
        <p className="text-zinc-400 text-sm mt-2">Vui lòng đợi trong giây lát</p>
      </div>
    </div>
  );
} 