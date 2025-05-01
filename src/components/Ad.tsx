import Image from "next/image";
import { MoreVertical } from "lucide-react";
import Link from "next/link";

const Ad = ({ size }: { size: "sm" | "md" | "lg" }) => {
  return (
    <div className="bg-zinc-900/90 rounded-xl shadow-lg text-sm overflow-hidden">
      {/* TOP */}
      <div className="flex items-center justify-between text-zinc-400 font-medium px-4 pt-3 pb-2">
        <span className="text-xs uppercase tracking-wider font-semibold">Sponsored Ads</span>
        <MoreVertical className="w-4 h-4 cursor-pointer hover:text-zinc-300 transition-colors" />
      </div>
      {/* BOTTOM */}
      <Link href="/landing" className="block hover:opacity-95 transition-opacity">
        <div className={`flex flex-col ${size === "sm" ? "gap-2" : "gap-3"}`}>
          {/* Main Image Container - No Border */}
          <div className={`relative w-full overflow-hidden ${
            size === "sm" ? "h-32" : size === "md" ? "h-40" : "h-52"
          }`}>
            <Image
              src="/itv_second.png"
              alt="Introvertia Ad"
              fill
              className="object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
          
          {/* Logo and Title */}
          <div className="flex items-center gap-3 px-4">
            <div className="relative w-8 h-8 rounded-md overflow-hidden">
              <Image
                src="/introvertia-icon.png"
                alt="Introvertia Logo"
                fill
                className="object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-zinc-100 font-medium">INTROVERTIA</span>
              <span className="text-xs text-zinc-500">Sponsored</span>
            </div>
          </div>
          
          {/* Description */}
          <p className={`px-4 ${size === "sm" ? "text-xs" : "text-sm"} text-zinc-300 leading-relaxed`}>
            {size === "sm"
              ? "Introvertia - Bạn hướng ngoại, tôi không phải."
              : size === "md"
              ? "Introvertia - Tôi hướng nội, bạn cũng thế."
              : "Introvertia - Bạn hướng ngoại, tôi không phải."}
          </p>
          
          {/* Button */}
          <div className="px-4 pb-4">
            <button className="bg-zinc-800 text-zinc-200 p-2.5 text-xs rounded-lg hover:bg-zinc-700 transition-colors font-medium w-full">
              Learn more
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default Ad;
