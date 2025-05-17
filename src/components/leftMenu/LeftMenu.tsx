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
      <div className="p-5 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-2xl shadow-lg dark:shadow-zinc-800/20 border border-zinc-100/50 dark:border-zinc-800/50 text-sm overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full mb-3 opacity-50"></div>
        
        <div className="flex flex-col gap-1">
          <MenuLink href="/" icon={<FileText className="w-5 h-5" />} label="Posts" />
          <MenuLink href="/activity" icon={<Activity className="w-5 h-5" />} label="Activity" />
          <MenuLink href="/events/birthdays" icon={<Calendar className="w-5 h-5" />} label="Events" />
          <MenuLink href="/photos" icon={<ImageIcon className="w-5 h-5" />} label="Photos" />
          <MenuLink href="/videos" icon={<Video className="w-5 h-5" />} label="Videos" />
          {username && (
            <MenuLink 
              href={`/profile/${username}`} 
              icon={<BookOpen className="w-5 h-5" />} 
              label="Profile" 
            />
          )}
          <MenuLink href="/friends" icon={<List className="w-5 h-5" />} label="Friend Lists" />
          <MenuLink href="/settings" icon={<Settings className="w-5 h-5" />} label="Settings" />
        </div>
      </div>
      <Ad size='sm'/>
    </div>
  );
};

// MenuLink component with simplified styling using emerald colors
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
        "flex items-center justify-between p-3 rounded-xl transition-colors",
        "text-zinc-600 dark:text-zinc-300 hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-emerald-50/20 dark:hover:bg-emerald-900/10",
        active && "bg-emerald-50/50 dark:bg-emerald-900/20 text-emerald-500 dark:text-emerald-400"
      )}
    >
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center w-10 h-10">
          {icon}
        </div>
        <span className="font-medium">{label}</span>
      </div>
      
      <ChevronRight className="w-4 h-4 opacity-40" />
    </Link>
  );
};

export default LeftMenu;
