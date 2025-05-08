export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative bg-zinc-50 dark:bg-zinc-950 min-h-screen overflow-hidden">
      {/* Top accent gradient */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-purple-500 to-emerald-600 z-10"></div>
      
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[30%] -left-[20%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-emerald-900/10 to-purple-900/5 blur-3xl"></div>
        <div className="absolute -bottom-[30%] -right-[20%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-purple-900/10 to-emerald-900/5 blur-3xl"></div>
        <div className="absolute top-1/4 right-0 w-[40%] h-[40%] rounded-full bg-gradient-to-br from-emerald-500/5 to-emerald-900/5 blur-3xl animate-pulse-slow"></div>
        
        {/* Floating orbs */}
        <div className="absolute top-[15%] left-[10%] w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 blur-xl animate-bounce-slow"></div>
        <div className="absolute bottom-[20%] right-[15%] w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-purple-500/5 blur-xl animate-pulse-slow"></div>
        <div className="absolute top-[40%] right-[25%] w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500/30 to-purple-500/10 blur-xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        {children}
      </div>
    </div>
  );
} 