"use client";

import Link from "next/link";
import MobileMenu from "@/shared/ui/MobileMenu";
import {
  ClerkLoaded,
  ClerkLoading,
  SignedIn,
  SignedOut,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import { Home, Users, BookOpen, Search, UserPlus, MessageSquare, LogIn, ShieldAlert } from "lucide-react";
import Image from "next/image";
import NotificationBell from "@/app/notifications/_components/NotificationBell";
import SearchBar from "@/shared/ui/SearchBar";
import dynamic from "next/dynamic";
const MessagesBadge = dynamic(() => import("./messages/MessagesBadge"), { ssr: false });
import { useEffect, useState } from "react";

interface NavbarProps {
  logoFont: string;
}

const Navbar = ({ logoFont }: NavbarProps) => {
  const [userRole, setUserRole] = useState<string | null>(null);
  const { isSignedIn } = useUser();

  useEffect(() => {
    if (isSignedIn) {
      const fetchUserRole = async () => {
        try {
          const response = await fetch("/api/users/me/role");
          if (response.ok) {
            const data = await response.json();
            setUserRole(data.role);
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
        }
      };
      
      fetchUserRole();
    }
  }, [isSignedIn]);

  const isAdminOrModerator = userRole === "admin" || userRole === "moderator";

  return (
    <div className="h-24 flex items-center justify-between px-4">
      {/* LEFT */}
      <div className="md:hidden lg:flex lg:w-[20%] items-center">
        <Link 
          href="/" 
          className="flex items-center gap-2 group relative"
        >
          <div className="relative w-8 h-8">
            <Image
              src="/introvertia-icon.png"
              alt="Introvertia Logo"
              fill
              className="group-hover:brightness-125 transition-all"
            />
          </div>
          <span className={`text-2xl font-bold text-white ${logoFont}`}>
            INTROVERTIA
            <span className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent transition-opacity duration-300"></span>
          </span>
          
          {/* Emerald gradient outline khi hover */}
          <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-emerald-600 via-emerald-400 to-[#00ffbb] rounded-full group-hover:w-full transition-all duration-300"></div>
        </Link>
      </div>
      
      {/* CENTER */}
      <div className="hidden md:flex md:w-[50%] lg:w-[45%] text-sm items-center justify-between ml-4">
        {/* LINKS */}
        <div className="flex gap-4 lg:gap-6 text-zinc-400">
          <Link href="/" className="flex items-center gap-2 group relative">
            <div className="relative">
              <Home className="w-4 h-4 text-white transition-opacity duration-200" />
              <Home className="w-4 h-4 absolute inset-0 text-transparent bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </div>
            <div className="relative">
              <span className="text-white transition-opacity duration-200">Homepage</span>
              <span className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">Homepage</span>
            </div>
            
            {/* Gradient bar và shimmer khi hover */}
            <div className="absolute -bottom-1 left-0 w-0 h-0.5 overflow-hidden bg-gradient-to-r from-emerald-600 via-emerald-400 to-[#00ffbb] rounded-full group-hover:w-full transition-all duration-300">
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-emerald-100/20 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
            </div>
          </Link>
          
          <Link href="/friends" className="flex items-center gap-2 group relative">
            <div className="relative">
              <Users className="w-4 h-4 text-white transition-opacity duration-200" />
              <Users className="w-4 h-4 absolute inset-0 text-transparent bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </div>
            <div className="relative">
              <span className="text-white transition-opacity duration-200">Friends</span>
              <span className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">Friends</span>
            </div>
            
            {/* Gradient bar và shimmer khi hover */}
            <div className="absolute -bottom-1 left-0 w-0 h-0.5 overflow-hidden bg-gradient-to-r from-emerald-600 via-emerald-400 to-[#00ffbb] rounded-full group-hover:w-full transition-all duration-300">
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-emerald-100/20 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
            </div>
          </Link>
          
          <Link href="/stories" className="flex items-center gap-2 group relative">
            <div className="relative">
              <BookOpen className="w-4 h-4 text-white transition-opacity duration-200" />
              <BookOpen className="w-4 h-4 absolute inset-0 text-transparent bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </div>
            <div className="relative">
              <span className="text-white transition-opacity duration-200">Stories</span>
              <span className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">Stories</span>
            </div>
            
            {/* Gradient bar và shimmer khi hover */}
            <div className="absolute -bottom-1 left-0 w-0 h-0.5 overflow-hidden bg-gradient-to-r from-emerald-600 via-emerald-400 to-[#00ffbb] rounded-full group-hover:w-full transition-all duration-300">
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-emerald-100/20 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
            </div>
          </Link>
          
          {isAdminOrModerator && (
            <Link href="/admin" className="flex items-center gap-2 group relative">
              <div className="relative">
                <ShieldAlert className="w-4 h-4 text-white transition-opacity duration-200" />
                <ShieldAlert className="w-4 h-4 absolute inset-0 text-transparent bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </div>
              <div className="relative">
                <span className="text-white transition-opacity duration-200">Admin</span>
                <span className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">Admin</span>
              </div>
              
              {/* Gradient bar và shimmer khi hover */}
              <div className="absolute -bottom-1 left-0 w-0 h-0.5 overflow-hidden bg-gradient-to-r from-emerald-600 via-emerald-400 to-[#00ffbb] rounded-full group-hover:w-full transition-all duration-300">
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-emerald-100/20 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
              </div>
            </Link>
          )}
        </div>
        
        <div className='hidden xl:block pl-4 lg:pl-8'>
          <SearchBar />
        </div>
      </div>
      
      {/* RIGHT */}
      <div className="flex-1 md:w-[35%] lg:w-[30%] flex items-center gap-1 sm:gap-2 md:gap-3 lg:gap-4 xl:gap-6 justify-end">
        <ClerkLoading>
          <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-zinc-600 border-solid border-current border-e-transparent align-[-0.125em] text-surface motion-reduce:animate-[spin_1.5s_linear_infinite]" />
        </ClerkLoading>
        
        <ClerkLoaded>
          <SignedIn>
            <div className="xl:hidden group relative p-1">
              <Link href="/search">
                <div className="relative">
                  <Search className="w-5 h-5 text-white transition-opacity duration-200" />
                  <Search className="w-5 h-5 absolute inset-0 text-transparent bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </div>
              </Link>
              
              {/* Hover highlight với shimmer */}
              <div className="absolute inset-0 bg-emerald-500/10 opacity-0 rounded-full group-hover:opacity-100 overflow-hidden transition-opacity duration-200 -z-10">
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-emerald-100/20 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
              </div>
            </div>
            
            {isAdminOrModerator && (
              <Link href="/admin" className="group relative p-1">
                <div className="relative">
                  <ShieldAlert className="w-5 h-5 text-amber-400 transition-opacity duration-200" />
                  <ShieldAlert className="w-5 h-5 absolute inset-0 text-transparent bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </div>
                
                {/* Hover highlight với shimmer */}
                <div className="absolute inset-0 bg-amber-500/10 opacity-0 rounded-full group-hover:opacity-100 overflow-hidden transition-opacity duration-200 -z-10">
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-amber-100/20 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
                </div>
              </Link>
            )}
            
            <div className="group relative p-1">
              <Link href="/friend-requests" className="group relative p-1">
                <div className="relative">
                  <UserPlus className="w-5 h-5 sm:w-6 sm:h-6 text-white transition-opacity duration-200" />
                  <UserPlus className="w-5 h-5 sm:w-6 sm:h-6 absolute inset-0 text-transparent bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </div>
                
                {/* Hover highlight với shimmer */}
                <div className="absolute inset-0 bg-emerald-500/10 opacity-0 rounded-full group-hover:opacity-100 overflow-hidden transition-opacity duration-200 -z-10">
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-emerald-100/20 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
                </div>
              </Link>
            </div>
            
            <Link href="/messages" className="group relative p-1">
              <div className="relative">
                <MessageSquare className="w-5 h-5 text-white transition-opacity duration-200 cursor-pointer" />
                <MessageSquare className="w-5 h-5 absolute inset-0 text-transparent bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer" />
                <MessagesBadge />
              </div>
              
              {/* Hover highlight with shimmer */}
              <div className="absolute inset-0 bg-emerald-500/10 opacity-0 rounded-full group-hover:opacity-100 overflow-hidden transition-opacity duration-200 -z-10">
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-emerald-100/20 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
              </div>
            </Link>
            
            <div className="group relative p-1">
              <NotificationBell />
              
              {/* Hover highlight with shimmer */}
              <div className="absolute inset-0 bg-emerald-500/10 opacity-0 rounded-full group-hover:opacity-100 overflow-hidden transition-opacity duration-200 -z-10">
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-emerald-100/20 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
              </div>
            </div>
            
            <div className="relative group">
              <UserButton />
              {/* Ring effect on hover with shimmer */}
              <div className="absolute inset-0 -m-1 scale-0 rounded-full bg-gradient-to-r from-emerald-600 via-emerald-400 to-[#00ffbb] opacity-0 group-hover:scale-110 group-hover:opacity-30 transition-all duration-300 overflow-hidden -z-10">
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-emerald-100/20 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
              </div>
            </div>
          </SignedIn>
          
          <SignedOut>
            <div className="flex items-center gap-2 text-sm group relative">
              <div className="relative">
                <LogIn className="w-5 h-5 text-white transition-opacity duration-200" />
                <LogIn className="w-5 h-5 absolute inset-0 text-transparent bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </div>
              <div className="relative">
                <Link href="/sign-in" className="text-white transition-opacity duration-200">Login/Register</Link>
                <span className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">Login/Register</span>
              </div>
              
              {/* Gradient bar and shimmer on hover */}
              <div className="absolute -bottom-1 left-0 w-0 h-0.5 overflow-hidden bg-gradient-to-r from-emerald-600 via-emerald-400 to-[#00ffbb] rounded-full group-hover:w-full transition-all duration-300">
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-emerald-100/20 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
              </div>
            </div>
          </SignedOut>
        </ClerkLoaded>
        
        <div className="block lg:hidden">
          <MobileMenu />
        </div>
      </div>
    </div>
  );
};

export default Navbar;