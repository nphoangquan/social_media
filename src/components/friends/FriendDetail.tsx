import prisma from "@/lib/client";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { MessageCircle } from "lucide-react";

export default async function FriendDetail({ username }: { username: string }) {
  const user = await prisma.user.findFirst({
    where: {
      username,
    },
    include: {
      _count: {
        select: {
          followers: true,
          followings: true,
          posts: true,
        },
      },
    },
  });

  if (!user) return notFound();

  return (
    <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-2xl shadow-lg dark:shadow-zinc-800/20 border border-zinc-100/50 dark:border-zinc-800/50 overflow-hidden">
      {/* Cover Image */}
      <div className="w-full h-64 md:h-80 relative">
        <Image
          src={user.cover || "/noCover.png"}
          alt=""
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      </div>
      
      {/* Profile Content */}
      <div className="p-6">
        {/* Header with avatar and actions */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between -mt-16 mb-6 relative">
          {/* Avatar */}
          <div className="flex items-end">
            <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-white dark:ring-zinc-900 shadow-xl">
              <Image
                src={user.avatar || "/noAvatar.png"}
                alt=""
                width={96}
                height={96}
                className="object-cover w-full h-full"
              />
            </div>
            {/* Online indicator */}
            <div className="w-4 h-4 bg-emerald-500 rounded-full absolute bottom-1 left-20 border-2 border-white dark:border-zinc-900"></div>
          </div>
          
          {/* Actions */}
          <div className="mt-6 md:mt-0 flex gap-2">
            <Link 
              href={`/profile/${user.username}`}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium text-sm transition-colors"
            >
              View Profile
            </Link>
            <button 
              className="p-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-xl transition-colors"
              title="Send Message"
            >
              <MessageCircle className="w-5 h-5 text-zinc-600 dark:text-zinc-300" />
            </button>
          </div>
        </div>
        
        {/* User info */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 mb-2">
            {user.name && user.surname
              ? `${user.name} ${user.surname}`
              : user.username}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">@{user.username}</p>
          
          {user.description && (
            <p className="text-zinc-700 dark:text-zinc-300 mb-4">{user.description}</p>
          )}
          
          <div className="flex flex-wrap gap-6 text-sm">
            {user.city && (
              <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                <span>{user.city}</span>
              </div>
            )}
            
            {user.school && (
              <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 14l9-5-9-5-9 5 9 5z"></path>
                  <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"></path>
                </svg>
                <span>{user.school}</span>
              </div>
            )}
            
            {user.work && (
              <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
                <span>{user.work}</span>
              </div>
            )}
            
            {user.website && (
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
                </svg>
                <a href={user.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  {user.website.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}
          </div>
        </div>
        
        {/* Stats */}
        <div className="flex justify-between border-t border-zinc-100 dark:border-zinc-800 pt-6">
          <div className="text-center">
            <div className="text-xl font-bold text-zinc-800 dark:text-zinc-100">{user._count.posts}</div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">Posts</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-zinc-800 dark:text-zinc-100">{user._count.followers}</div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">Followers</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-zinc-800 dark:text-zinc-100">{user._count.followings}</div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">Following</div>
          </div>
        </div>
      </div>
    </div>
  );
} 