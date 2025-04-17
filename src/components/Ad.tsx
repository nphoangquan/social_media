import Image from "next/image";
import { MoreVertical } from "lucide-react";

const Ad = ({ size }: { size: "sm" | "md" | "lg" }) => {
  return (
    <div className="p-6 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-2xl shadow-lg dark:shadow-zinc-800/20 text-sm border border-zinc-100/50 dark:border-zinc-800/50 hover:shadow-xl dark:hover:shadow-zinc-800/30 transition-all duration-300">
      {/* TOP */}
      <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 font-medium mb-5">
        <span className="text-xs uppercase tracking-wider font-semibold">Sponsored Ads</span>
        <MoreVertical className="w-4 h-4 cursor-pointer hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors" />
      </div>
      {/* BOTTOM */}
      <div
        className={`flex flex-col ${size === "sm" ? "gap-3" : "gap-5"}`}
      >
        <div
          className={`relative w-full overflow-hidden rounded-xl ${
            size === "sm" ? "h-24" : size === "md" ? "h-36" : "h-48"
          }`}
        >
          <Image
            src="https://images.pexels.com/photos/23193135/pexels-photo-23193135.jpeg?auto=compress&cs=tinysrgb&w=800&lazy=load"
            alt=""
            fill
            className="object-cover hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 rounded-full overflow-hidden ring-2 ring-white dark:ring-zinc-900 shadow-md">
            <Image
              src="https://images.pexels.com/photos/23193135/pexels-photo-23193135.jpeg?auto=compress&cs=tinysrgb&w=800&lazy=load"
              alt=""
              fill
              className="object-cover"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-zinc-900 dark:text-zinc-100 font-medium hover:underline cursor-pointer group-hover:text-emerald-500 transition-colors">Nguyen Phan Hoang Quan</span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">Sponsored</span>
          </div>
        </div>
        <p className={`${size === "sm" ? "text-xs" : "text-sm"} text-zinc-600 dark:text-zinc-300 leading-relaxed`}>
          {size === "sm"
            ? "Cuu Toi Voi."
            : size === "md"
            ? "Cuu."
            : "Huhuhuhuhuhu"}
        </p>
        <button className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 p-3 text-xs rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-800/20 hover:text-emerald-600 dark:hover:text-emerald-300 transition-colors font-medium w-full shadow-sm hover:shadow-md">
          Learn more
        </button>
      </div>
    </div>
  );
};

export default Ad;
