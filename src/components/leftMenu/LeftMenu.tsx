import Link from "next/link";
import ProfileCard from "./ProfileCard";
import Ad from "../Ad";
import { 
  FileText, 
  Activity, 
  // Store, 
  Calendar, 
  Image as ImageIcon, 
  Video, 
  // Newspaper, 
  BookOpen, 
  List, 
  Settings,
  ChevronRight
} from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/client";
import { cn } from "@/lib/utils";

const LeftMenu = async ({ type }: { type: "home" | "profile" }) => {
  const { userId } = await auth();
  let username = "";
  
  if (userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { username: true }
    });
    
    if (user) {
      username = user.username;
    }
  }
  
  return (
    <div className="flex flex-col gap-6">
      {type === "home" && <ProfileCard />}
      <div className="p-5 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-2xl shadow-lg dark:shadow-zinc-800/20 border border-zinc-100/50 dark:border-zinc-800/50 text-sm overflow-hidden relative group">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400/20 via-emerald-500/30 to-emerald-600/20"></div>
        <div className="absolute -right-24 -bottom-24 w-48 h-48 bg-emerald-400/5 dark:bg-emerald-400/10 rounded-full blur-3xl group-hover:bg-emerald-400/10 dark:group-hover:bg-emerald-400/15 transition-all duration-700"></div>
        
        <div className="flex flex-col gap-1 relative z-10">
          <MenuLink href="/" icon={<FileText className="w-5 h-5 transition-all duration-300 group-hover:text-emerald-500 dark:group-hover:text-emerald-400" />} label="Posts" />
          <MenuLink href="/activity" icon={<Activity className="w-5 h-5 transition-all duration-300 group-hover:text-emerald-500 dark:group-hover:text-emerald-400" />} label="Activity" />
          {/* <Link
            href="/"
            className="flex items-center gap-4 p-3 rounded-xl hover:bg-zinc-100/80 dark:hover:bg-zinc-800/50 text-zinc-600 dark:text-zinc-300 hover:text-emerald-500 dark:hover:text-emerald-400 transition-all group"
          >
            <Store className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="font-medium">Marketplace</span>
          </Link> */}
          <MenuLink href="/events/birthdays" icon={<Calendar className="w-5 h-5 transition-all duration-300 group-hover:text-emerald-500 dark:group-hover:text-emerald-400" />} label="Events" />
          <MenuLink href="/photos" icon={<ImageIcon className="w-5 h-5 transition-all duration-300 group-hover:text-emerald-500 dark:group-hover:text-emerald-400" />} label="Photos" />
          <MenuLink href="/videos" icon={<Video className="w-5 h-5 transition-all duration-300 group-hover:text-emerald-500 dark:group-hover:text-emerald-400" />} label="Videos" />
          {/* <Link
            href="/"
            className="flex items-center gap-4 p-3 rounded-xl hover:bg-zinc-100/80 dark:hover:bg-zinc-800/50 text-zinc-600 dark:text-zinc-300 hover:text-emerald-500 dark:hover:text-emerald-400 transition-all group"
          >
            <Newspaper className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="font-medium">News</span>
          </Link> */}
          {username && (
            <MenuLink 
              href={`/profile/${username}`} 
              icon={<BookOpen className="w-5 h-5 transition-all duration-300 group-hover:text-emerald-500 dark:group-hover:text-emerald-400" />} 
              label="Profile" 
            />
          )}
          <MenuLink href="/friends" icon={<List className="w-5 h-5 transition-all duration-300 group-hover:text-emerald-500 dark:group-hover:text-emerald-400" />} label="Friend Lists" />
          <MenuLink href="/settings" icon={<Settings className="w-5 h-5 transition-all duration-300 group-hover:text-emerald-500 dark:group-hover:text-emerald-400" />} label="Settings" />
        </div>
      </div>
      <Ad size='sm'/>
    </div>
  );
};

// MenuLink component for consistent styling and animations
const MenuLink = ({ 
  href, 
  icon, 
  label,
  active = false
}: { 
  href: string; 
  icon: React.ReactNode; 
  label: string;
  active?: boolean;
}) => {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center justify-between p-3 rounded-xl transition-all duration-300 overflow-hidden relative group",
        "hover:bg-gradient-to-r hover:from-white/40 hover:to-emerald-50/30 dark:hover:from-zinc-800/80 dark:hover:to-emerald-900/20",
        "text-zinc-600 dark:text-zinc-300 hover:text-emerald-600 dark:hover:text-emerald-400",
        active && "bg-emerald-50/50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
      )}
    >
      <div className="flex items-center gap-4">
        {/* Icon wrapper with pulse animation on hover */}
        <div className="relative flex items-center justify-center w-10 h-10">
          <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping bg-emerald-400/10 dark:bg-emerald-400/5"></div>
          <div className="group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
            {icon}
          </div>
        </div>
        
        {/* Label with slide animation */}
        <span className="font-medium relative overflow-hidden">
          {label}
          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-400/30 dark:bg-emerald-400/40 group-hover:w-full transition-all duration-300"></span>
        </span>
      </div>
      
      {/* Chevron icon that appears on hover */}
      <ChevronRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-40 group-hover:translate-x-0 transition-all duration-300" />
    </Link>
  );
};

export default LeftMenu;
