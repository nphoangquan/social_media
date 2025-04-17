import Image from "next/image";
import { Gift, MoreVertical, Cake } from "lucide-react";

const Birthdays = () => {
  return (
    <div className="p-6 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-2xl shadow-lg dark:shadow-zinc-800/20 text-sm border border-zinc-100/50 dark:border-zinc-800/50 hover:shadow-xl dark:hover:shadow-zinc-800/30 transition-all duration-300">
      {/* TOP */}
      <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 font-medium mb-5">
        <span className="text-xs uppercase tracking-wider font-semibold">Birthdays</span>
        <MoreVertical className="w-4 h-4 cursor-pointer hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors" />
      </div>

      {/* BOTTOM */}
      <div className="flex flex-col gap-5">
        {/* USER */}
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-white dark:ring-zinc-900 shadow-md">
            <Image
              src="https://i.ytimg.com/vi/89S6eHinDks/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLCJVAnCTJeZU5pxPaWP1yVxrGAS_A"
              alt=""
              fill
              className="object-cover"
            />
          </div>
          <div className="flex flex-col flex-1">
            <span className="text-zinc-900 dark:text-zinc-100 font-medium hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer transition-colors">IShowSpeed</span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
              <Cake className="w-3 h-3" /> Today
            </span>
          </div>
          <button className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 p-2 text-xs rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-800/20 hover:text-emerald-600 dark:hover:text-emerald-300 transition-colors font-medium shadow-sm hover:shadow-md">
            Celebrate
          </button>
        </div>
        
        {/* UPCOMING */}
        <div className="bg-zinc-100/80 dark:bg-zinc-800/50 rounded-xl p-4 flex items-center gap-3 group hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all cursor-pointer">
          <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <Gift className="w-5 h-5 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-zinc-800 dark:text-zinc-200 font-medium group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              Upcoming Birthdays
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              16 friends have upcoming birthdays
            </span>
          </div>
        </div>
        
        <button className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 p-3 text-xs rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-800/20 hover:text-emerald-600 dark:hover:text-emerald-300 transition-colors font-medium w-full shadow-sm hover:shadow-md">
          See all birthdays
        </button>
      </div>
    </div>
  );
};

export default Birthdays;
