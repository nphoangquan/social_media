"use client";

import { useSignIn } from "@clerk/nextjs";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, AtSign, Facebook, Github, Mail, AlertTriangle, X } from "lucide-react";

type ErrorType = {
  errors?: Array<{ message: string }>;
  message?: string;
};

export default function SignInPage() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [view, setView] = useState("main"); // main, email, password
  const router = useRouter();

  // Email/password sign in
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    try {
      setLoading(true);
      setError("");

      // Tạo 1 sign-in verification
      await signIn.create({
        identifier: emailAddress,
        password,
      }).then((result) => {
        if (result.status === "complete") {
          setActive({ session: result.createdSessionId });
          router.push("/");
        } else {
          setError("Đăng nhập không thành công. Vui lòng thử lại.");
          console.error("Sign-in status:", result);
        }
      });
    } catch (err: unknown) {
      console.error(err);
      const error = err as ErrorType;
      setError(error.errors?.[0]?.message || error.message || "Đăng nhập không thành công. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // Social sign in
  const handleSocialSignIn = async (provider: 'oauth_facebook' | 'oauth_google' | 'oauth_github') => {
    if (!isLoaded) return;

    try {
      setLoading(true);
      setError("");
      
      await signIn.authenticateWithRedirect({
        strategy: provider,
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/",
      });
    } catch (err: unknown) {
      console.error(err);
      const error = err as ErrorType;
      setError(error.errors?.[0]?.message || error.message || "Đăng nhập không thành công. Vui lòng thử lại.");
      setLoading(false);
    }
  };

  const continueWithEmail = async () => {
    if (!emailAddress) {
      setError("Vui lòng nhập email của bạn");
      return;
    }

    setError("");
    setView("password");
  };

  // Tắ error message
  const closeError = () => setError("");

  // Xử lý back button
  const handleBack = () => {
    setView("main");
    setError("");
  };

  if (!isLoaded) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-zinc-950">
        <div className="animate-pulse text-emerald-400 text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-zinc-950 flex justify-center items-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="relative w-10 h-10 bg-zinc-950 border-2 border-emerald-400 rounded-md flex items-center justify-center">
            <span className="text-emerald-400 text-xl font-bold">I</span>
          </div>
        </div>

        {/* Sign-in Container */}
        <div className="relative bg-zinc-900/90 rounded-2xl overflow-hidden border border-zinc-800 backdrop-blur-lg shadow-[0_0_25px_rgba(16,185,129,0.15)]">
          {/* Error Message */}
          {error && (
            <div className="absolute top-4 left-0 right-0 mx-4 bg-red-900/20 border border-red-500/40 text-red-400 p-3 rounded-lg flex items-center justify-between text-sm">
              <div className="flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>{error}</span>
              </div>
              <button 
                onClick={closeError} 
                className="text-red-400 hover:text-red-300"
                aria-label="Đóng thông báo lỗi"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="p-8 pt-14">
            {/* Heading */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-white">
                <span className="bg-gradient-to-r from-emerald-400 to-emerald-300 text-transparent bg-clip-text">
                  Đăng nhập
                </span>
              </h1>
              <p className="text-zinc-400 mt-2 text-sm">
                Chào mừng trở lại với Introvertia
              </p>
            </div>

            {/* View Chính - Social Options & Email Input */}
            {view === "main" && (
              <>
                {/* Social Login Buttons */}
                <div className="grid gap-3 mb-6">
                  <button
                    onClick={() => handleSocialSignIn("oauth_google")}
                    disabled={loading}
                    className="flex items-center justify-center gap-3 w-full p-3 rounded-lg border border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800 text-white transition-colors"
                  >
                    <Image src="/google.svg" alt="Google" width={20} height={20} />
                    <span>Tiếp tục với Google</span>
                  </button>
                  
                  <button
                    onClick={() => handleSocialSignIn("oauth_facebook")}
                    disabled={loading}
                    className="flex items-center justify-center gap-3 w-full p-3 rounded-lg border border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800 text-white transition-colors"
                  >
                    <Facebook className="w-5 h-5 text-blue-500" />
                    <span>Tiếp tục với Facebook</span>
                  </button>
                  
                  <button
                    onClick={() => handleSocialSignIn("oauth_github")}
                    disabled={loading}
                    className="flex items-center justify-center gap-3 w-full p-3 rounded-lg border border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800 text-white transition-colors"
                  >
                    <Github className="w-5 h-5 text-white" />
                    <span>Tiếp tục với GitHub</span>
                  </button>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-2 my-6">
                  <div className="h-px bg-zinc-800 flex-1"></div>
                  <span className="text-zinc-500 text-sm">hoặc</span>
                  <div className="h-px bg-zinc-800 flex-1"></div>
                </div>

                {/* Email */}
                <form onSubmit={(e) => { e.preventDefault(); continueWithEmail(); }} className="space-y-5">
                  <div>
                    <label htmlFor="email" className="block text-sm text-zinc-400 mb-1.5">
                      Email hoặc tên người dùng
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
                        <AtSign className="w-5 h-5" />
                      </div>
                      <input
                        id="email"
                        type="text"
                        value={emailAddress}
                        onChange={(e) => setEmailAddress(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-zinc-700 bg-zinc-800/50 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                        placeholder="email@example.com"
                        required
                      />
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={loading || !emailAddress}
                    className="w-full p-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>Tiếp tục</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </>
            )}

            {/* Password View */}
            {view === "password" && (
              <form onSubmit={handleEmailSignIn} className="space-y-5">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="email" className="block text-sm text-zinc-400">
                      Email
                    </label>
                    <button 
                      type="button" 
                      onClick={handleBack}
                      className="text-xs text-emerald-400 hover:text-emerald-300"
                    >
                      Chỉnh sửa
                    </button>
                  </div>
                  <div className="w-full p-3 rounded-lg border border-zinc-700 bg-zinc-800/50 text-zinc-300">
                    {emailAddress}
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="password" className="block text-sm text-zinc-400">
                      Mật khẩu
                    </label>
                    <Link href="/sign-in/reset-password" className="text-xs text-emerald-400 hover:text-emerald-300">
                      Quên mật khẩu?
                    </Link>
                  </div>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
                      <Mail className="w-5 h-5" />
                    </div>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-zinc-700 bg-zinc-800/50 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      placeholder="Nhập mật khẩu"
                      required
                    />
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={loading || !password}
                  className="w-full p-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 text-center border-t border-zinc-800 bg-zinc-950/90">
            <p className="text-zinc-400 text-sm">
              Chưa có tài khoản?{' '}
              <Link href="/sign-up" className="text-emerald-400 hover:text-emerald-300 font-medium">
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
}