"use client";

import Post, { FeedPostType } from "./Post";
import { useEffect, useState, useRef, useCallback } from "react";
import { getPosts } from "@/lib/actions/post";

interface FeedProps {
  username?: string;
}

const Feed = ({ username }: FeedProps) => {
  const [posts, setPosts] = useState<FeedPostType[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced fetch function
  const debouncedFetch = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(async () => {
      if (!loadingRef.current && hasMore) {
        loadingRef.current = true;
        setLoading(true);
        
        try {
          const newPosts = await getPosts(page, 2, username);
          if (newPosts.length === 0) {
            setHasMore(false);
          } else {
            setPosts(prev => {
              // Check for duplicates
              const existingIds = new Set(prev.map(post => post.id));
              const uniqueNewPosts = newPosts.filter(post => !existingIds.has(post.id));
              return [...prev, ...uniqueNewPosts];
            });
          }
        } catch (error) {
          console.error("Error fetching posts:", error);
        } finally {
          setLoading(false);
          loadingRef.current = false;
        }
      }
    }, 500); // 500ms debounce
  }, [page, hasMore, username]);

  const lastPostElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loadingRef.current) {
        setPage(prevPage => prevPage + 1);
      }
    }, {
      rootMargin: '100px', // Start loading before reaching the end
      threshold: 0.1
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  useEffect(() => {
    debouncedFetch();
    
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [page, debouncedFetch]);

  return (
    <div className="flex flex-col bg-transparent">
      {posts.length ? (
        posts.map((post, index) => (
          <div 
            key={post.id} 
            ref={index === posts.length - 1 ? lastPostElementRef : null}
            className="mb-4 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-xl shadow-md dark:shadow-zinc-800/20"
          >
            <Post post={post}/>
          </div>
        ))
      ) : (
        <div className="text-center py-8 text-zinc-500 dark:text-zinc-400 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-xl shadow-md dark:shadow-zinc-800/20">
          No posts found!
        </div>
      )}
      {loading && (
        <div className="flex justify-center py-4">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-500 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
        </div>
      )}
    </div>
  );
};

export default Feed;