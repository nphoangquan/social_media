"use client";

import Link from "next/link";
import { useState } from "react";

const MobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="md:hidden">
      <div
        className="flex flex-col gap-[4.5px] cursor-pointer"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <div
          className={`w-6 h-1 bg-zinc-100 hover:bg-emerald-400 rounded-sm ${
            isOpen ? "rotate-45" : ""
          } origin-left ease-in-out duration-500`}
        />
        <div
          className={`w-6 h-1 bg-zinc-100 hover:bg-emerald-400 rounded-sm ${
            isOpen ? "opacity-0" : ""
          } ease-in-out duration-500`}
        />
        <div
          className={`w-6 h-1 bg-zinc-100 hover:bg-emerald-400 rounded-sm ${
            isOpen ? "-rotate-45" : ""
          } origin-left ease-in-out duration-500`}
        />
      </div>
      {isOpen && (
        <div className="absolute left-0 top-24 w-full h-[calc(100vh-96px)] bg-zinc-900/95 backdrop-blur-sm flex flex-col items-center justify-center gap-8 font-medium text-xl z-10">
          <Link href="/" className="text-zinc-400 hover:text-zinc-100 transition-colors">Home</Link>
          <Link href="/" className="text-zinc-400 hover:text-zinc-100 transition-colors">Friends</Link>
          <Link href="/" className="text-zinc-400 hover:text-zinc-100 transition-colors">Groups</Link>
          <Link href="/" className="text-zinc-400 hover:text-zinc-100 transition-colors">Stories</Link>
          <Link href="/" className="text-zinc-400 hover:text-zinc-100 transition-colors">Login</Link>
        </div>
      )}
    </div>
  );
};

export default MobileMenu;