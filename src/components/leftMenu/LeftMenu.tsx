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
  // BookOpen, 
  List, 
  Settings 
} from "lucide-react";

const LeftMenu = ({ type }: { type: "home" | "profile" }) => {
  return (
    <div className="flex flex-col gap-6">
      {type === "home" && <ProfileCard />}
      <div className="p-6 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-2xl shadow-lg dark:shadow-zinc-800/20 border border-zinc-100/50 dark:border-zinc-800/50 text-sm">
        <div className="flex flex-col gap-1">
          <Link
            href="/"
            className="flex items-center gap-4 p-3 rounded-xl hover:bg-zinc-100/80 dark:hover:bg-zinc-800/50 text-zinc-600 dark:text-zinc-300 hover:text-emerald-500 dark:hover:text-emerald-400 transition-all group"
          >
            <FileText className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="font-medium">My Posts</span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-4 p-3 rounded-xl hover:bg-zinc-100/80 dark:hover:bg-zinc-800/50 text-zinc-600 dark:text-zinc-300 hover:text-emerald-500 dark:hover:text-emerald-400 transition-all group"
          >
            <Activity className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="font-medium">Activity</span>
          </Link>
          {/* <Link
            href="/"
            className="flex items-center gap-4 p-3 rounded-xl hover:bg-zinc-100/80 dark:hover:bg-zinc-800/50 text-zinc-600 dark:text-zinc-300 hover:text-emerald-500 dark:hover:text-emerald-400 transition-all group"
          >
            <Store className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="font-medium">Marketplace</span>
          </Link> */}
          <Link
            href="/"
            className="flex items-center gap-4 p-3 rounded-xl hover:bg-zinc-100/80 dark:hover:bg-zinc-800/50 text-zinc-600 dark:text-zinc-300 hover:text-emerald-500 dark:hover:text-emerald-400 transition-all group"
          >
            <Calendar className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="font-medium">Events</span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-4 p-3 rounded-xl hover:bg-zinc-100/80 dark:hover:bg-zinc-800/50 text-zinc-600 dark:text-zinc-300 hover:text-emerald-500 dark:hover:text-emerald-400 transition-all group"
          >
            <ImageIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="font-medium">Albums</span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-4 p-3 rounded-xl hover:bg-zinc-100/80 dark:hover:bg-zinc-800/50 text-zinc-600 dark:text-zinc-300 hover:text-emerald-500 dark:hover:text-emerald-400 transition-all group"
          >
            <Video className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="font-medium">Videos</span>
          </Link>
          {/* <Link
            href="/"
            className="flex items-center gap-4 p-3 rounded-xl hover:bg-zinc-100/80 dark:hover:bg-zinc-800/50 text-zinc-600 dark:text-zinc-300 hover:text-emerald-500 dark:hover:text-emerald-400 transition-all group"
          >
            <Newspaper className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="font-medium">News</span>
          </Link> */}
          {/* <Link
            href="/"
            className="flex items-center gap-4 p-3 rounded-xl hover:bg-zinc-100/80 dark:hover:bg-zinc-800/50 text-zinc-600 dark:text-zinc-300 hover:text-emerald-500 dark:hover:text-emerald-400 transition-all group"
          >
            <BookOpen className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="font-medium">Courses</span>
          </Link> */}
          <Link
            href="/"
            className="flex items-center gap-4 p-3 rounded-xl hover:bg-zinc-100/80 dark:hover:bg-zinc-800/50 text-zinc-600 dark:text-zinc-300 hover:text-emerald-500 dark:hover:text-emerald-400 transition-all group"
          >
            <List className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="font-medium">Friend Lists</span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-4 p-3 rounded-xl hover:bg-zinc-100/80 dark:hover:bg-zinc-800/50 text-zinc-600 dark:text-zinc-300 hover:text-emerald-500 dark:hover:text-emerald-400 transition-all group"
          >
            <Settings className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="font-medium">Settings</span>
          </Link>
        </div>
      </div>
      <Ad size='sm'/>
    </div>
  );
};

export default LeftMenu;
