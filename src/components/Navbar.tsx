import Link from "next/link";
import MobileMenu from "./MobileMenu";
import {
  ClerkLoaded,
  ClerkLoading,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { Home, Users, BookOpen, Search, UserPlus, MessageSquare, LogIn } from "lucide-react";
import Image from "next/image";
import NotificationBell from "./notifications/NotificationBell";
import SearchBar from "./SearchBar";

interface NavbarProps {
  logoFont: string;
}

const Navbar = ({ logoFont }: NavbarProps) => {
  return (
    <div className="h-24 flex items-center justify-between">
      {/* LEFT */}
      <div className="md:hidden lg:block w-[25%] pl-2">
        <Link 
          href="/" 
          className="flex items-center gap-2 group"
        >
          <div className="relative w-8 h-8">
            <Image
              src="/introvertia-icon.png"
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
      <div className="hidden md:flex w-[45%] text-sm items-center justify-between ml-6">
        {/* LINKS */}
        <div className="flex gap-6 text-zinc-400">
          <Link href="/" className="flex items-center gap-2 hover:text-zinc-100 transition-colors">
            <Home className="w-4 h-4" />
            <span>Homepage</span>
          </Link>
          <Link href="/friends" className="flex items-center gap-2 hover:text-zinc-100 transition-colors">
            <Users className="w-4 h-4" />
            <span>Friends</span>
          </Link>
          <Link href="/stories" className="flex items-center gap-2 hover:text-zinc-100 transition-colors">
            <BookOpen className="w-4 h-4" />
            <span>Stories</span>
          </Link>
        </div>
        <div className='hidden xl:block'>
          <SearchBar />
        </div>
      </div>
      {/* RIGHT */}
      <div className="w-[30%] flex items-center gap-4 xl:gap-8 justify-end">
        <ClerkLoading>
          <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-zinc-600 border-solid border-current border-e-transparent align-[-0.125em] text-surface motion-reduce:animate-[spin_1.5s_linear_infinite]" />
        </ClerkLoading>
        <ClerkLoaded>
          <SignedIn>
            <div className="xl:hidden cursor-pointer text-zinc-400 hover:text-zinc-100 transition-colors">
              <Link href="/search">
                <Search className="w-5 h-5" />
              </Link>
            </div>
            <Link href="/friend-requests" className="cursor-pointer text-zinc-400 hover:text-zinc-100 transition-colors">
              <UserPlus className="w-6 h-6" />
            </Link>
            <div className="cursor-pointer text-zinc-400 hover:text-zinc-100 transition-colors">
              <MessageSquare className="w-5 h-5" />
            </div>
            <NotificationBell />
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