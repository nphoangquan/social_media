import Link from "next/link";
import MobileMenu from "./MobileMenu";
import {
  ClerkLoaded,
  ClerkLoading,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { Home, Users, BookOpen, Search, UserPlus, MessageSquare, Bell, LogIn } from "lucide-react";
import Image from "next/image";

interface NavbarProps {
  logoFont: string;
}

const Navbar = ({ logoFont }: NavbarProps) => {
  return (
    <div className="h-24 flex items-center justify-between">
      {/* LEFT */}
      <div className="md:hidden lg:block w-[20%]">
        <Link 
          href="/" 
          className="flex items-center gap-2 group"
        >
          <div className="relative w-8 h-8">
            <Image
              src="/introvertia-icon.svg"
              alt="Introvertia Logo"
              fill
              className="group-hover:brightness-125 transition-all"
            />
          </div>
          <span className={`text-2xl font-bold text-zinc-100 group-hover:text-emerald-400 tracking-wider transition-colors ${logoFont}`}>
            INTROVERTIA
          </span>
        </Link>
      </div>
      {/* CENTER */}
      <div className="hidden md:flex w-[50%] text-sm items-center justify-between">
        {/* LINKS */}
        <div className="flex gap-6 text-zinc-400">
          <Link href="/" className="flex items-center gap-2 hover:text-zinc-100 transition-colors">
            <Home className="w-4 h-4" />
            <span>Homepage</span>
          </Link>
          <Link href="/" className="flex items-center gap-2 hover:text-zinc-100 transition-colors">
            <Users className="w-4 h-4" />
            <span>Friends</span>
          </Link>
          <Link href="/" className="flex items-center gap-2 hover:text-zinc-100 transition-colors">
            <BookOpen className="w-4 h-4" />
            <span>Stories</span>
          </Link>
        </div>
        <div className='hidden xl:flex p-2.5 bg-zinc-800/50 items-center rounded-xl border border-zinc-700/50 hover:bg-zinc-800/70 transition-colors group'>
          <input 
            type="text" 
            placeholder="Search..." 
            className="bg-transparent outline-none text-zinc-300 placeholder-zinc-500 w-48"
          />
          <Search className="w-4 h-4 text-zinc-500 group-hover:text-zinc-400 transition-colors" />
        </div>
      </div>
      {/* RIGHT */}
      <div className="w-[30%] flex items-center gap-4 xl:gap-8 justify-end">
        <ClerkLoading>
          <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-zinc-600 border-solid border-current border-e-transparent align-[-0.125em] text-surface motion-reduce:animate-[spin_1.5s_linear_infinite]" />
        </ClerkLoading>
        <ClerkLoaded>
          <SignedIn>
            <div className="cursor-pointer text-zinc-400 hover:text-zinc-100 transition-colors">
              <UserPlus className="w-6 h-6" />
            </div>
            <div className="cursor-pointer text-zinc-400 hover:text-zinc-100 transition-colors">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div className="cursor-pointer text-zinc-400 hover:text-zinc-100 transition-colors">
              <Bell className="w-5 h-5" />
            </div>
            <UserButton />
          </SignedIn>
          <SignedOut>
            <div className="flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-100 transition-colors">
              <LogIn className="w-5 h-5" />
              <Link href="/sign-in">Login/Register</Link>
            </div>
          </SignedOut>
        </ClerkLoaded>
        <MobileMenu />
      </div>
    </div>
  );
};

export default Navbar;