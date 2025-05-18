"use client";

import { Story, User } from "@prisma/client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";

type StoryWithUser = Story & {
  user: User;
};

type StoriesByUser = {
  user: User;
  stories: Story[];
  latestStory: Story;
};

export default function StoryList({ stories: initialStories, currentStoryId }: { 
  stories: StoryWithUser[];
  currentStoryId?: number;
}) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [stories, setStories] = useState<StoryWithUser[]>(initialStories || []);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement | null>(null);
  const storyListRef = useRef<HTMLDivElement>(null);
  
  // Set mounted to true after first render to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load initial stories
  useEffect(() => {
    setStories(initialStories || []);
  }, [initialStories]);

  // Handle mouse enter/leave to control scroll behavior
  const handleMouseEnter = useCallback(() => {
    setIsHovering(true);
    // Save current scroll position of body
    const scrollY = window.scrollY;
    
    // Prevent body scroll
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
    // Restore body scroll
    const scrollY = document.body.style.top;
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    
    // Restore scroll position
    window.scrollTo(0, parseInt(scrollY || '0') * -1);
  }, []);

  // Handle wheel event to prevent propagation when hovering
  const handleWheel = useCallback((e: WheelEvent) => {
    if (isHovering && storyListRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = storyListRef.current;
      
      // Check if scroll reaches top or bottom
      if (
        (scrollTop === 0 && e.deltaY < 0) || 
        (scrollTop + clientHeight >= scrollHeight && e.deltaY > 0)
      ) {
        // If at edge, prevent default to stop outer container from scrolling
        e.preventDefault();
      }
    }
  }, [isHovering]);

  // Add wheel event listener
  useEffect(() => {
    const currentListRef = storyListRef.current;
    
    if (currentListRef) {
      currentListRef.addEventListener('wheel', handleWheel as EventListener, { passive: false });
    }
    
    return () => {
      if (currentListRef) {
        currentListRef.removeEventListener('wheel', handleWheel as EventListener);
      }
    };
  }, [handleWheel]);

  // Function to fetch more stories
  const fetchMoreStories = useCallback(async () => {
    if (loading || !hasMore) return;
    
    try {
      setLoading(true);
      const nextPage = page + 1;
      const response = await fetch(`/api/stories/paginated?page=${nextPage}&limit=10`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch stories');
      }
      
      const data = await response.json();
      
      if (data.stories.length > 0) {
        setStories(prevStories => [...prevStories, ...data.stories]);
        setPage(nextPage);
      }
      
      setHasMore(data.hasMore);
    } catch (error) {
      console.error('Error loading more stories:', error);
    } finally {
      setLoading(false);
    }
  }, [page, loading, hasMore]);

  // Setup intersection observer for infinite scroll
  useEffect(() => {
    if (!loadingRef.current) return;
    
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          fetchMoreStories();
        }
      },
      { threshold: 0.5 }
    );
    
    const currentLoadingRef = loadingRef.current;
    if (currentLoadingRef) {
      observerRef.current.observe(currentLoadingRef);
    }
    
    return () => {
      if (currentLoadingRef && observerRef.current) {
        observerRef.current.unobserve(currentLoadingRef);
      }
    };
  }, [loadingRef, fetchMoreStories]);

  // Handle empty stories
  if (!stories || stories.length === 0) {
    return (
      <div className="w-80 h-full bg-zinc-900/95 backdrop-blur-sm border-r border-zinc-800/50 overflow-y-auto rounded-lg">
        <div className="p-4">
          <h2 className="text-xl font-semibold text-zinc-100 mb-4">Stories</h2>
          
          {/* Add Story Button */}
          <div 
            className="relative w-full h-16 mb-6 cursor-pointer group overflow-hidden"
            onClick={() => {
              setTimeout(() => {
                router.push('/stories/create');
              }, 0);
            }}
          >
            {/* Background with neon emerald color */}
            <div className="absolute inset-0 bg-emerald-600 rounded-xl shadow-md"></div>
            
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-300/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite] group-hover:animate-[shimmer_1.5s_infinite]"></div>
            
            {/* Content */}
            <div className="absolute inset-0 flex items-center p-3 z-10">
              <div className="w-10 h-10 rounded-full bg-emerald-800/80 backdrop-blur-sm flex items-center justify-center shadow-lg border border-emerald-400/30">
                <Plus className="w-5 h-5 text-emerald-100" />
              </div>
              <div className="flex flex-col ml-3">
                <span className="text-white font-semibold text-lg group-hover:translate-x-1 transition-transform duration-300">Tạo Story</span>
                <span className="text-emerald-100/70 text-xs group-hover:translate-x-1 transition-transform duration-500">Chia sẻ khoảnh khắc của bạn</span>
              </div>
            </div>
          </div>
          
          <div className="text-center py-4 text-zinc-400 text-sm">
            Không có story nào
          </div>
        </div>
      </div>
    );
  }

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
      latestStory: story
    }];
  }, []);

  // Sort users by latest story (most recent first)
  storiesByUser.sort((a, b) => 
    new Date(b.latestStory.createdAt).getTime() - new Date(a.latestStory.createdAt).getTime()
  );

  return (
    <div 
      className="w-80 h-full bg-zinc-900/95 backdrop-blur-sm border-r border-zinc-800/50 overflow-hidden rounded-lg"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div 
        ref={storyListRef}
        className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent p-4 rounded-lg"
      >
        <h2 className="text-xl font-semibold text-zinc-100 mb-4">Stories</h2>
        
        {/* Add Story Button */}
        <div 
          className="relative w-full h-16 mb-6 cursor-pointer group overflow-hidden"
          onClick={() => {
            setTimeout(() => {
              router.push('/stories/create');
            }, 0);
          }}
        >
          {/* Background with neon emerald color */}
          <div className="absolute inset-0 bg-emerald-600 rounded-xl shadow-md"></div>
          
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-300/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite] group-hover:animate-[shimmer_1.5s_infinite]"></div>
          
          {/* Content */}
          <div className="absolute inset-0 flex items-center p-3 z-10">
            <div className="w-10 h-10 rounded-full bg-emerald-800/80 backdrop-blur-sm flex items-center justify-center shadow-lg border border-emerald-400/30">
              <Plus className="w-5 h-5 text-emerald-100" />
            </div>
            <div className="flex flex-col ml-3">
              <span className="text-white font-semibold text-lg group-hover:translate-x-1 transition-transform duration-300">Create Story</span>
              <span className="text-emerald-100/70 text-xs group-hover:translate-x-1 transition-transform duration-500">Share your moments</span>
            </div>
          </div>
        </div>
        
        {/* User Stories List */}
        <div className="space-y-4">
          {storiesByUser.map((userStories) => (
            <div 
              key={userStories.user.id}
              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer ${
                userStories.stories.some(s => s.id === currentStoryId)
                  ? 'bg-zinc-800'
                  : 'hover:bg-zinc-800/50'
              } transition-colors`}
              onClick={() => {
                setTimeout(() => {
                  router.push(`/story/${userStories.latestStory.id}`);
                }, 0);
              }}
            >
              <div className={`relative w-12 h-12 flex-shrink-0 rounded-full overflow-hidden ${
                userStories.stories.some(s => s.id === currentStoryId)
                  ? 'ring-2 ring-emerald-400'
                  : 'ring-2 ring-blue-500'
              }`}>
                <Image
                  src={userStories.user.avatar || "/placeholder.png"}
                  alt={userStories.user.username || "User"}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-zinc-200 text-sm truncate">
                  {userStories.user.name && userStories.user.surname
                    ? `${userStories.user.name} ${userStories.user.surname}`
                    : userStories.user.username || "Anonymous"}
                </div>
                <div className="flex items-center text-xs text-zinc-400">
                  {userStories.latestStory.video && (
                    <div className="mr-1 text-emerald-400">Video</div>
                  )}
                  {mounted ? (
                    new Date(userStories.latestStory.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  ) : (
                    "..."
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Loading indicator */}
        {hasMore && (
          <div 
            ref={loadingRef} 
            className="flex justify-center items-center py-4"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
                <span className="text-sm text-zinc-400">Loading nhiều stories...</span>
              </div>
            ) : (
              <div className="h-4" /> // Spacer to trigger intersection
            )}
          </div>
        )}
      </div>
    </div>
  );
} 