"use client";

import Link from "next/link";
import { useState } from "react";
import { SignedOut } from "@clerk/nextjs";

const MobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="md:hidden z-50">
      <div
        className="flex flex-col justify-center items-center w-10 h-10 gap-[4.5px] cursor-pointer group relative z-50 rounded-full"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <div
          className={`w-6 h-1 bg-white group-hover:bg-gradient-to-r group-hover:from-emerald-400 group-hover:to-emerald-600 rounded-sm relative overflow-hidden ${
            isOpen ? "rotate-45" : ""
          } origin-left ease-in-out duration-500`}
        >
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-emerald-100/20 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
        </div>
        <div
          className={`w-6 h-1 bg-white group-hover:bg-gradient-to-r group-hover:from-emerald-400 group-hover:to-emerald-600 rounded-sm relative overflow-hidden ${
            isOpen ? "opacity-0" : ""
          } ease-in-out duration-500`}
        >
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-emerald-100/20 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
        </div>
        <div
          className={`w-6 h-1 bg-white group-hover:bg-gradient-to-r group-hover:from-emerald-400 group-hover:to-emerald-600 rounded-sm relative overflow-hidden ${
            isOpen ? "-rotate-45" : ""
          } origin-left ease-in-out duration-500`}
        >
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-emerald-100/20 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
        </div>
      </div>
      
      {isOpen && (
        <div className="fixed left-0 top-24 w-full h-[calc(100vh-96px)] bg-zinc-900/95 backdrop-blur-sm flex flex-col items-center justify-center gap-8 font-medium text-xl z-40">
          <Link 
            href="/" 
            className="group relative px-4 py-2"
            onClick={() => setIsOpen(false)}
          >
            <div className="relative">
              <span className="text-white transition-opacity duration-200">Home</span>
              <span className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">Home</span>
            </div>
            
            {/* Gradient bar and shimmer on hover */}
            <div className="absolute -bottom-1 left-0 w-0 h-0.5 overflow-hidden bg-gradient-to-r from-emerald-600 via-emerald-400 to-[#00ffbb] rounded-full group-hover:w-full transition-all duration-300">
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-emerald-100/20 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
            </div>
          </Link>
          
          <Link 
            href="/activity" 
            className="group relative px-4 py-2"
            onClick={() => setIsOpen(false)}
          >
            <div className="relative">
              <span className="text-white transition-opacity duration-200">Activity</span>
              <span className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">Activity</span>
            </div>
            
            {/* Gradient bar and shimmer on hover */}
            <div className="absolute -bottom-1 left-0 w-0 h-0.5 overflow-hidden bg-gradient-to-r from-emerald-600 via-emerald-400 to-[#00ffbb] rounded-full group-hover:w-full transition-all duration-300">
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-emerald-100/20 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
            </div>
          </Link>
          
          <Link 
            href="/friends" 
            className="group relative px-4 py-2"
            onClick={() => setIsOpen(false)}
          >
            <div className="relative">
              <span className="text-white transition-opacity duration-200">Friends</span>
              <span className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">Friends</span>
            </div>
            
            {/* Gradient bar and shimmer on hover */}
            <div className="absolute -bottom-1 left-0 w-0 h-0.5 overflow-hidden bg-gradient-to-r from-emerald-600 via-emerald-400 to-[#00ffbb] rounded-full group-hover:w-full transition-all duration-300">
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-emerald-100/20 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
            </div>
          </Link>
          
          <Link 
            href="/events/birthdays" 
            className="group relative px-4 py-2"
            onClick={() => setIsOpen(false)}
          >
            <div className="relative">
              <span className="text-white transition-opacity duration-200">Events</span>
              <span className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">Events</span>
            </div>
            
            {/* Gradient bar and shimmer on hover */}
            <div className="absolute -bottom-1 left-0 w-0 h-0.5 overflow-hidden bg-gradient-to-r from-emerald-600 via-emerald-400 to-[#00ffbb] rounded-full group-hover:w-full transition-all duration-300">
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-emerald-100/20 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
            </div>
          </Link>
          
          <Link 
            href="/friend-requests" 
            className="group relative px-4 py-2"
            onClick={() => setIsOpen(false)}
          >
            <div className="relative">
              <span className="text-white transition-opacity duration-200">Friend Requests</span>
              <span className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">Friend Requests</span>
            </div>
            
            {/* Gradient bar and shimmer on hover */}
            <div className="absolute -bottom-1 left-0 w-0 h-0.5 overflow-hidden bg-gradient-to-r from-emerald-600 via-emerald-400 to-[#00ffbb] rounded-full group-hover:w-full transition-all duration-300">
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-emerald-100/20 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
            </div>
          </Link>
          
          <Link 
            href="/stories" 
            className="group relative px-4 py-2"
            onClick={() => setIsOpen(false)}
          >
            <div className="relative">
              <span className="text-white transition-opacity duration-200">Stories</span>
              <span className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">Stories</span>
            </div>
            
            {/* Gradient bar and shimmer on hover */}
            <div className="absolute -bottom-1 left-0 w-0 h-0.5 overflow-hidden bg-gradient-to-r from-emerald-600 via-emerald-400 to-[#00ffbb] rounded-full group-hover:w-full transition-all duration-300">
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-emerald-100/20 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
            </div>
          </Link>
          
          <Link 
            href="/photos" 
            className="group relative px-4 py-2"
            onClick={() => setIsOpen(false)}
          >
            <div className="relative">
              <span className="text-white transition-opacity duration-200">Photos</span>
              <span className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">Photos</span>
            </div>
            
            {/* Gradient bar and shimmer on hover */}
            <div className="absolute -bottom-1 left-0 w-0 h-0.5 overflow-hidden bg-gradient-to-r from-emerald-600 via-emerald-400 to-[#00ffbb] rounded-full group-hover:w-full transition-all duration-300">
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-emerald-100/20 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
            </div>
          </Link>

          <Link 
            href="/videos" 
            className="group relative px-4 py-2"
            onClick={() => setIsOpen(false)}
          >
            <div className="relative">
              <span className="text-white transition-opacity duration-200">Videos</span>
              <span className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">Videos</span>
            </div>
            
            {/* Gradient bar and shimmer on hover */}
            <div className="absolute -bottom-1 left-0 w-0 h-0.5 overflow-hidden bg-gradient-to-r from-emerald-600 via-emerald-400 to-[#00ffbb] rounded-full group-hover:w-full transition-all duration-300">
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-emerald-100/20 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
            </div>
          </Link>
          
          <Link 
            href="/landing" 
            className="group relative px-4 py-2"
            onClick={() => setIsOpen(false)}
          >
            <div className="relative">
              <span className="text-white transition-opacity duration-200">Ads</span>
              <span className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">Ads</span>
            </div>
            
            {/* Gradient bar and shimmer on hover */}
            <div className="absolute -bottom-1 left-0 w-0 h-0.5 overflow-hidden bg-gradient-to-r from-emerald-600 via-emerald-400 to-[#00ffbb] rounded-full group-hover:w-full transition-all duration-300">
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-emerald-100/20 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
            </div>
          </Link>
          
          {/* Chỉ hiển thị nút Login khi chưa đăng nhập */}
          <SignedOut>
            <Link 
              href="/sign-in" 
              className="group relative px-4 py-2"
              onClick={() => setIsOpen(false)}
            >
              <div className="relative">
                <span className="text-white transition-opacity duration-200">Login</span>
                <span className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">Login</span>
              </div>
              
              {/* Gradient bar and shimmer on hover */}
              <div className="absolute -bottom-1 left-0 w-0 h-0.5 overflow-hidden bg-gradient-to-r from-emerald-600 via-emerald-400 to-[#00ffbb] rounded-full group-hover:w-full transition-all duration-300">
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-emerald-100/20 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
              </div>
            </Link>
          </SignedOut>
        </div>
      )}
    </div>
  );
};

export default MobileMenu;