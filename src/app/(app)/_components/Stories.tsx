"use client";

import { Story, User } from "@prisma/client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Plus, Camera, Video } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useUser } from "@clerk/nextjs";

type StoryWithUser = Story & {
  user: User;
};

type StoriesByUser = {
  user: User;
  stories: Story[];
  latestStory: Story;
  hasUnread: boolean;
};

interface StoriesProps {
  stories: StoryWithUser[];
}

export default function Stories({ stories }: StoriesProps) {
  const router = useRouter();
  const { user: currentUser } = useUser();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Group stories by user
  const storiesByUser: StoriesByUser[] = stories.reduce((acc: StoriesByUser[], story) => {
    const existingUserStories = acc.find(item => item.user.id === story.user.id);
    
    if (existingUserStories) {
      existingUserStories.stories.push(story);
      // Update latest story if this one is newer
      if (new Date(story.createdAt) > new Date(existingUserStories.latestStory.createdAt)) {
        existingUserStories.latestStory = story;
      }
      return acc;
    }
    
    return [...acc, { 
      user: story.user, 
      stories: [story],
      latestStory: story,
      hasUnread: true // In a real app, you'd track this
    }];
  }, []);

  // Sort users by latest story (most recent first)
  storiesByUser.sort((a, b) => 
    new Date(b.latestStory.createdAt).getTime() - new Date(a.latestStory.createdAt).getTime()
  );

  // Check scroll position
  const checkScrollPosition = () => {
    if (!scrollRef.current) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
  };

  useEffect(() => {
    checkScrollPosition();
    const scrollElement = scrollRef.current;
    
    if (scrollElement) {
      scrollElement.addEventListener('scroll', checkScrollPosition);
      return () => scrollElement.removeEventListener('scroll', checkScrollPosition);
    }
  }, [stories]);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    
    const scrollAmount = 280; // Width of story card + gap
    const newScrollLeft = direction === 'left' 
      ? scrollRef.current.scrollLeft - scrollAmount
      : scrollRef.current.scrollLeft + scrollAmount;
    
    scrollRef.current.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth'
    });
  };

  const handleCreateStory = () => {
    router.push('/stories/create');
  };

  const handleStoryClick = (storyId: number) => {
    router.push(`/story/${storyId}`);
  };

  if (!stories || stories.length === 0) {
    return (
      <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm rounded-xl shadow-sm dark:shadow-zinc-800/20 p-4">
        <div className="flex items-center gap-4">
          {/* Create Story Card */}
          <div 
            onClick={handleCreateStory}
            className="relative w-28 h-44 bg-gray-100 dark:bg-zinc-800 rounded-xl cursor-pointer overflow-hidden group hover:scale-[1.02] transition-transform duration-200"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20"></div>
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mb-2 mx-auto">
                <Plus className="w-4 h-4 text-white" />
              </div>
              <p className="text-xs font-medium text-center text-gray-900 dark:text-white">
                Tạo Story
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm rounded-xl shadow-sm dark:shadow-zinc-800/20 p-3 sm:p-4 relative">
      {/* Scroll buttons - hidden on mobile */}
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          title="Scroll left"
          aria-label="Scroll stories left"
          className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white dark:bg-zinc-800 rounded-full shadow-lg border border-gray-200 dark:border-zinc-700 items-center justify-center hover:scale-110 transition-transform"
        >
          <svg className="w-4 h-4 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}
      
      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          title="Scroll right"
          aria-label="Scroll stories right"
          className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white dark:bg-zinc-800 rounded-full shadow-lg border border-gray-200 dark:border-zinc-700 items-center justify-center hover:scale-110 transition-transform"
        >
          <svg className="w-4 h-4 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Stories container */}
      <div 
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-2 scrollbar-none"
      >
        {/* Create Story Card */}
        <div 
          onClick={handleCreateStory}
          className="relative flex-shrink-0 w-24 h-36 sm:w-28 sm:h-44 bg-gray-100 dark:bg-zinc-800 rounded-xl cursor-pointer overflow-hidden group hover:scale-[1.02] transition-transform duration-200"
        >
          {/* User's profile image as background */}
          {currentUser?.imageUrl && (
            <div className="absolute inset-0">
              <Image
                src={currentUser.imageUrl}
                alt="Your avatar"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30"></div>
            </div>
          )}
          
          {/* Create button */}
          <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-full flex items-center justify-center mb-1 sm:mb-2 mx-auto shadow-md">
              <Plus className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            </div>
            <p className="text-[10px] sm:text-xs font-medium text-center text-white drop-shadow-sm">
              Tạo Story
            </p>
          </div>
        </div>

        {/* User Stories */}
        {storiesByUser.map((userStories) => (
          <div
            key={userStories.user.id}
            onClick={() => handleStoryClick(userStories.latestStory.id)}
            className="relative flex-shrink-0 w-24 h-36 sm:w-28 sm:h-44 rounded-xl cursor-pointer overflow-hidden group hover:scale-[1.02] transition-transform duration-200"
          >
            {/* Story background */}
            <div className="absolute inset-0">
              {userStories.latestStory.video ? (
                <video
                  src={userStories.latestStory.video}
                  className="w-full h-full object-cover"
                  muted
                  loop
                  playsInline
                />
              ) : (
                <Image
                  src={userStories.latestStory.img || "/placeholder.png"}
                  alt={`${userStories.user.username}'s story`}
                  fill
                  className="object-cover"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40"></div>
            </div>

            {/* User avatar */}
            <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
              <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full overflow-hidden border-2 ${
                userStories.hasUnread ? 'border-blue-500' : 'border-gray-300'
              }`}>
                <Image
                  src={userStories.user.avatar || "/placeholder.png"}
                  alt={userStories.user.username || "User"}
                  width={32}
                  height={32}
                  className="object-cover"
                />
              </div>
            </div>

            {/* Story type indicator */}
            {userStories.latestStory.video && (
              <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
                <Video className="w-3 h-3 sm:w-4 sm:h-4 text-white drop-shadow-sm" />
              </div>
            )}

            {/* User name */}
            <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3">
              <p className="text-[10px] sm:text-xs font-medium text-white truncate drop-shadow-sm">
                {userStories.user.name && userStories.user.surname
                  ? `${userStories.user.name} ${userStories.user.surname}`
                  : userStories.user.username || "Anonymous"}
              </p>
            </div>

            {/* Unread indicator */}
            {userStories.hasUnread && (
              <div className="absolute inset-0 rounded-xl ring-2 ring-blue-500 ring-offset-1 ring-offset-white dark:ring-offset-zinc-900"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
