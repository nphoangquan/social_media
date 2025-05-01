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

  // Handler for new post event
  const handleNewPost = useCallback((event: Event) => {
    const { post } = (event as CustomEvent).detail;
    // Add the new post to the beginning of the list
    if (post) {
      setPosts(prevPosts => {
        // Check if post already exists to avoid duplicates
        if (!prevPosts.some(p => p.id === post.id)) {
          return [post, ...prevPosts];
        }
        return prevPosts;
      });
    }
  }, []);

  // Handler for delete post event
  const handleDeletePost = useCallback((event: Event) => {
    const { postId } = (event as CustomEvent).detail;
    // Remove the deleted post from the list
    if (postId) {
      setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
    }
  }, []);

  // Handler for post update event
  const handlePostUpdate = useCallback((event: Event) => {
    const { postId, updatedPost } = (event as CustomEvent).detail;
    // Update the modified post in the list
    if (postId && updatedPost) {
      setPosts(prevPosts => prevPosts.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              desc: updatedPost.desc,
              img: updatedPost.img,
              video: updatedPost.video
            } 
          : post
      ));
    }
  }, []);

  // Add event listeners for posts
  useEffect(() => {
    // Add event listeners
    window.addEventListener('newPost', handleNewPost);
    window.addEventListener('deletePost', handleDeletePost);
    window.addEventListener('postUpdate', handlePostUpdate);
    
    // Clean up event listeners
    return () => {
      window.removeEventListener('newPost', handleNewPost);
      window.removeEventListener('deletePost', handleDeletePost);
      window.removeEventListener('postUpdate', handlePostUpdate);
    };
  }, [handleNewPost, handleDeletePost, handlePostUpdate]);

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