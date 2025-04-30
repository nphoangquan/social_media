"use client";

import { useSignUp } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { 
  ArrowRight, 
  AtSign, 
  Facebook, 
  Github, 
  Mail, 
  AlertTriangle, 
  X, 
  User, 
  Lock, 
  Eye, 
  EyeOff 
} from "lucide-react";

// Đảm bảo Clerk script được load
declare global {
  interface Window {
    Clerk: Record<string, unknown>;
  }
}

type ErrorType = {
  errors?: Array<{ message: string }>;
  message?: string;
};

export default function SignUpPage() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [username, setUsername] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [view, setView] = useState("main"); // main, form, verify
  const router = useRouter();

  // For email/password sign up (first step)
  const handleSubmitDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    try {
      setLoading(true);
      setError("");

      await signUp.create({
        username,
        emailAddress,
        password,
      }).then(() => {
        // Send email verification code
        signUp.prepareEmailAddressVerification({ strategy: "email_code" }).then(() => {
          setView("verify");
        });
      });
    } catch (err: unknown) {
      console.error(err);
      const error = err as ErrorType;
      setError(error.errors?.[0]?.message || error.message || "Đăng ký không thành công. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // For verification code submission
  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    try {
      setLoading(true);
      setError("");

      const result = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/");
      } else {
        setError("Xác minh email không thành công. Vui lòng thử lại.");
      }
    } catch (err: unknown) {
      console.error(err);
      const error = err as ErrorType;
      setError(error.errors?.[0]?.message || error.message || "Xác minh email không thành công. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // For social sign up
  const handleSocialSignUp = async (provider: 'oauth_facebook' | 'oauth_google' | 'oauth_github') => {
    if (!isLoaded) return;

    try {
      setLoading(true);
      setError("");
      
      await signUp.authenticateWithRedirect({
        strategy: provider,
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/",
      });
    } catch (err: unknown) {
      console.error(err);
      const error = err as ErrorType;
      setError(error.errors?.[0]?.message || error.message || "Đăng ký không thành công. Vui lòng thử lại.");
      setLoading(false);
    }
  };

  const continueWithEmail = () => {
    setError("");
    setView("form");
  };

  // Close error message
  const closeError = () => setError("");

  // Handle back button
  const handleBack = () => {
    setView("main");
    setError("");
  };

  // Add hidden div for Clerk's invisible CAPTCHA
  useEffect(() => {
    // Create a div for clerk-captcha if it doesn't exist
    if (!document.getElementById('clerk-captcha')) {
      const captchaDiv = document.createElement('div');
      captchaDiv.id = 'clerk-captcha';
      captchaDiv.style.display = 'none';
      document.body.appendChild(captchaDiv);
    }
  }, []);

  if (!isLoaded) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-zinc-950">
        <div className="animate-pulse text-emerald-400 text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-zinc-950 flex justify-center items-center p-4">
      {/* Hidden div for Clerk's invisible CAPTCHA */}
      <div id="clerk-captcha" style={{ display: 'none' }}></div>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="relative w-10 h-10 bg-zinc-950 border-2 border-emerald-400 rounded-md flex items-center justify-center">
            <span className="text-emerald-400 text-xl font-bold">I</span>
          </div>
        </div>

        {/* Sign-up Container */}
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
                  {view === "verify" ? "Xác minh Email" : "Tạo tài khoản"}
                </span>
              </h1>
              <p className="text-zinc-400 mt-2 text-sm">
                {view === "verify" 
                  ? "Nhập mã xác minh đã được gửi đến email của bạn" 
                  : "Tham gia cộng đồng của chúng tôi"}
              </p>
            </div>

            {/* Main View - Social Options & Email Button */}
            {view === "main" && (
              <>
                {/* Social Sign Up Buttons */}
                <div className="grid gap-3 mb-6">
                  <button
                    onClick={() => handleSocialSignUp("oauth_google")}
                    disabled={loading}
                    className="flex items-center justify-center gap-3 w-full p-3 rounded-lg border border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800 text-white transition-colors"
                  >
                    <Image src="/google.svg" alt="Google" width={20} height={20} />
                    <span>Tiếp tục với Google</span>
                  </button>
                  
                  <button
                    onClick={() => handleSocialSignUp("oauth_facebook")}
                    disabled={loading}
                    className="flex items-center justify-center gap-3 w-full p-3 rounded-lg border border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800 text-white transition-colors"
                  >
                    <Facebook className="w-5 h-5 text-blue-500" />
                    <span>Tiếp tục với Facebook</span>
                  </button>
                  
                  <button
                    onClick={() => handleSocialSignUp("oauth_github")}
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

                {/* Email Button */}
                <button
                  onClick={continueWithEmail}
                  disabled={loading}
                  className="w-full p-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Mail className="w-5 h-5" />
                  <span>Đăng ký với Email</span>
                </button>
              </>
            )}

            {/* Form View */}
            {view === "form" && (
              <form onSubmit={handleSubmitDetails} className="space-y-5">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="username" className="block text-sm text-zinc-400">
                      Tên người dùng
                    </label>
                    <button 
                      type="button" 
                      onClick={handleBack}
                      className="text-xs text-emerald-400 hover:text-emerald-300"
                    >
                      Quay lại
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
                      <User className="w-5 h-5" />
                    </div>
                    <input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-zinc-700 bg-zinc-800/50 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      placeholder="username"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm text-zinc-400 mb-1.5">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
                      <AtSign className="w-5 h-5" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      value={emailAddress}
                      onChange={(e) => setEmailAddress(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-zinc-700 bg-zinc-800/50 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      placeholder="email@example.com"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm text-zinc-400 mb-1.5">
                    Mật khẩu
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
                      <Lock className="w-5 h-5" />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-3 rounded-lg border border-zinc-700 bg-zinc-800/50 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      placeholder="Nhập mật khẩu"
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-300"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={loading || !username || !emailAddress || !password}
                  className="w-full p-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Đang xử lý...' : 'Đăng ký'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* Verification View */}
            {view === "verify" && (
              <form onSubmit={handleVerifyEmail} className="space-y-5">
                <div>
                  <p className="text-zinc-400 text-sm mb-4">
                    Chúng tôi đã gửi một mã xác minh đến <span className="font-medium text-zinc-300">{emailAddress}</span>. Vui lòng nhập mã để tiếp tục.
                  </p>
                  <label htmlFor="code" className="block text-sm text-zinc-400 mb-1.5">
                    Mã xác minh
                  </label>
                  <input
                    id="code"
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full p-3 text-center tracking-widest rounded-lg border border-zinc-700 bg-zinc-800/50 text-white text-lg font-medium focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    placeholder="000000"
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={loading || code.length < 6}
                  className="w-full p-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Đang xác minh...' : 'Xác minh'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 text-center border-t border-zinc-800 bg-zinc-950/90">
            <p className="text-zinc-400 text-sm">
              Đã có tài khoản?{' '}
              <Link href="/sign-in" className="text-emerald-400 hover:text-emerald-300 font-medium">
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-20 right-10 w-20 h-20 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
}