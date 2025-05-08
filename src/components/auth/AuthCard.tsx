import Image from "next/image";
import { ReactNode } from "react";

interface AuthCardProps {
  title: string;
  description: string;
  children: ReactNode;
}

export default function AuthCard({ title, description, children }: AuthCardProps) {
  return (
    <div className="w-full max-w-[450px] relative group">
      {/* Background decorative elements */}
      <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-gradient-to-br from-emerald-500/10 to-purple-500/5 blur-3xl group-hover:bg-emerald-500/20 transition-all duration-700"></div>
      <div className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full bg-gradient-to-br from-purple-500/10 to-emerald-500/5 blur-3xl group-hover:bg-purple-500/20 transition-all duration-700"></div>
      
      <div className="mb-8 flex flex-col items-center animate-fadeIn">
        <div className="relative w-16 h-16 mb-5 group-hover:scale-110 transition-transform duration-500">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-500/20 to-purple-500/20 -z-10 group-hover:from-emerald-500/30 group-hover:to-purple-500/30 transition-all duration-500"></div>
          <Image 
            src="/introvertia-icon.png" 
            alt="Introvertia Logo" 
            fill
            className="object-contain p-2"
          />
        </div>
        
        <h1 className="text-3xl font-bold text-center text-foreground">{title}</h1>
        <p className="text-muted-foreground text-center mt-2 max-w-sm">{description}</p>
      </div>
      
      <div className="relative bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-xl border border-zinc-100/50 dark:border-zinc-800/50 shadow-lg hover:shadow-emerald-500/5 transition-all duration-500 overflow-hidden group">
        {/* Top accent gradient */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-purple-500 to-emerald-600 group-hover:opacity-100 transition-opacity"></div>
        
        {children}
      </div>
    </div>
  );
} 