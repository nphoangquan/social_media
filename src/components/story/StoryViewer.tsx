"use client";

import { Story, User } from "@prisma/client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { X, ChevronLeft, ChevronRight, Trash2, Pause, Play } from "lucide-react";
import { useEffect, useState, useCallback, useRef } from "react";
import { deleteStory } from "@/lib/actions";
import { useUser } from "@clerk/nextjs";
import StoryList from "./StoryList";

type StoryWithUser = Story & {
  user: User;
};

export default function StoryViewer({ story, allStories }: { story: StoryWithUser; allStories: StoryWithUser[] }) {
  const router = useRouter();
  const { user } = useUser();
  const [progress, setProgress] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showUserInfo, setShowUserInfo] = useState(true);
  const lastScrollY = useRef(0);
  const currentIndex = allStories.findIndex(s => s.id === story.id);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const shouldNavigateRef = useRef(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Set mounted to true after initial render to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle scroll to hide/show user info
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY.current + 10) {
        // Scrolling down
        setShowUserInfo(false);
      } else if (currentScrollY < lastScrollY.current - 10) {
        // Scrolling up
        setShowUserInfo(true);
      }
      
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Show user info when story changes
  useEffect(() => {
    setShowUserInfo(true);
  }, [story.id]);

  const handleNavigation = useCallback((direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentIndex > 0) {
      const prevId = allStories[currentIndex - 1].id;
      setTimeout(() => {
        router.push(`/story/${prevId}`);
      }, 0);
    } else if (direction === 'next' && currentIndex < allStories.length - 1) {
      const nextId = allStories[currentIndex + 1].id;
      setTimeout(() => {
        router.push(`/story/${nextId}`);
      }, 0);
    }
  }, [currentIndex, allStories, router]);

  const handleDelete = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      const success = await deleteStory(story.id);
      if (success) {
        setTimeout(() => {
          router.push('/stories');
        }, 0);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const togglePlayPause = () => {
    setIsPaused(prev => !prev);
    showControlsTemporarily();
  };

  const showControlsTemporarily = () => {
    setShowControls(true);
    
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000); // Hide controls after 3 seconds
  };

  const handleStoryClick = (e: React.MouseEvent) => {
    // Prevent the click from triggering navigation if clicking on a button
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    
    showControlsTemporarily();
  };

  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    if (!isPaused) {
      timerRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            if (timerRef.current) {
              clearInterval(timerRef.current);
            }
            // Only navigate to next story, don't go home if it's the last one
            if (currentIndex < allStories.length - 1) {
              shouldNavigateRef.current = true;
            }
            return prev;
          }
          return prev + 1;
        });
      }, 50); // 5 seconds total duration
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentIndex, allStories, isPaused]);
  
  // Handle navigation outside of render cycle
  useEffect(() => {
    if (shouldNavigateRef.current) {
      shouldNavigateRef.current = false;
      handleNavigation('next');
    }
  }, [progress, handleNavigation]);

  useEffect(() => {
    // Reset progress when story changes
    setProgress(0);
  }, [story.id]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        handleNavigation('prev');
      } else if (e.key === "ArrowRight") {
        handleNavigation('next');
      } else if (e.key === "Escape") {
        router.push('/stories');
      } else if (e.key === " ") { // Space key
        togglePlayPause();
        e.preventDefault(); // Prevent page scroll on space press
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleNavigation, router, togglePlayPause]);

  // Clean up timeout when unmounting
  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="relative h-screen flex">
      {/* Stories sidebar */}
      {showSidebar && (
        <StoryList stories={allStories} currentStoryId={story.id} />
      )}

      {/* Main story viewer */}
      <div className="flex-1 flex items-center justify-center bg-zinc-950 relative">
        {/* Close button */}
        <button
          onClick={() => router.push("/stories")}
          className="absolute top-4 right-4 z-50 p-2 hover:bg-zinc-800/50 rounded-full transition-colors"
          title="Close story"
        >
          <X className="w-6 h-6 text-white" />
        </button>

        {/* Toggle sidebar button */}
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className="absolute top-4 left-4 z-50 p-2 hover:bg-zinc-800/50 rounded-full transition-colors md:hidden"
          title={showSidebar ? "Hide stories" : "Show stories"}
        >
          <ChevronLeft className={`w-6 h-6 text-white transform transition-transform ${showSidebar ? 'rotate-0' : 'rotate-180'}`} />
        </button>

        {/* Play/Pause button */}
        {(showControls || isPaused) && (
          <button
            onClick={togglePlayPause}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 p-4 bg-black/30 hover:bg-black/50 rounded-full transition-opacity"
            title={isPaused ? "Play story" : "Pause story"}
          >
            {isPaused ? (
              <Play className="w-8 h-8 text-white" />
            ) : (
              <Pause className="w-8 h-8 text-white" />
            )}
          </button>
        )}

        {/* Delete button - only show if user is the owner */}
        {user?.id === story.userId && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="absolute top-4 right-16 z-50 p-2 hover:bg-zinc-800/50 rounded-full transition-colors disabled:opacity-50"
            title="Delete story"
          >
            <Trash2 className="w-6 h-6 text-white" />
          </button>
        )}

        {/* Navigation buttons */}
        {currentIndex > 0 && (
          <button
            onClick={() => handleNavigation('prev')}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-2 hover:bg-zinc-800/50 rounded-full transition-colors"
            title="Previous story"
          >
            <ChevronLeft className="w-8 h-8 text-white" />
          </button>
        )}
        {currentIndex < allStories.length - 1 && (
          <button
            onClick={() => handleNavigation('next')}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-2 hover:bg-zinc-800/50 rounded-full transition-colors"
            title="Next story"
          >
            <ChevronRight className="w-8 h-8 text-white" />
          </button>
        )}

        {/* Progress bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-zinc-800">
          <div 
            className="h-full bg-white transition-all duration-50 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* User info */}
        <div className={`absolute top-4 left-4 z-40 flex items-center gap-3 transition-opacity duration-300 ${showUserInfo ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div 
            className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-white cursor-pointer hover:ring-emerald-400 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300"
            onClick={(e) => {
              e.stopPropagation(); // Prevent story click handling
              setTimeout(() => {
                router.push(`/profile/${story.user.username}`);
              }, 0);
            }}
            title={`View ${story.user.username}'s profile`}
          >
            <Image
              src={story.user.avatar || "/noAvatar.png"}
              alt=""
              fill
              className="object-cover"
            />
          </div>
          <div 
            className="cursor-pointer group transition-all duration-300"
            onClick={(e) => {
              e.stopPropagation(); // Prevent story click handling
              setTimeout(() => {
                router.push(`/profile/${story.user.username}`);
              }, 0);
            }}
            title={`View ${story.user.username}'s profile`}
          >
            <div className="font-medium text-white group-hover:text-emerald-400 transition-colors duration-300">
              {story.user.name && story.user.surname
                ? `${story.user.name} ${story.user.surname}`
                : story.user.username}
            </div>
            <div className="text-xs text-zinc-400 group-hover:text-emerald-300 transition-colors duration-300">
              {mounted ? (
                new Date(story.createdAt).toLocaleDateString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric"
                })
              ) : (
                "..."
              )}
            </div>
          </div>
        </div>

        {/* Story content */}
        <div 
          className="relative w-full max-w-[500px] aspect-[9/16] rounded-lg overflow-hidden cursor-pointer"
          onClick={handleStoryClick}
        >
          {story.img && (
            <Image
              src={story.img}
              alt=""
              fill
              className="object-cover"
              priority
              unoptimized={story.img.startsWith('data:')}
            />
          )}
          {story.video && (
            <video
              src={story.video}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
              muted
              loop
              controls={false}
            />
          )}
        </div>
      </div>
    </div>
  );
} 