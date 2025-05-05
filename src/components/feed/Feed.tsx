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

  // Xử lý sự kiện bài đăng mới
  const handleNewPost = useCallback((event: Event) => {
    const { post } = (event as CustomEvent).detail;
    // Thêm bài đăng mới vào đầu danh sách
    if (post) {
      setPosts(prevPosts => {
        // Kiểm tra xem bài đăng đã tồn tại chưa để tránh trùng lặp
        if (!prevPosts.some(p => p.id === post.id)) {
          return [post, ...prevPosts];
        }
        return prevPosts;
      });
    }
  }, []);

  // Xử lý sự kiện xóa bài đăng
  const handleDeletePost = useCallback((event: Event) => {
    const { postId } = (event as CustomEvent).detail;
    // Xóa bài đăng đã xóa khỏi danh sách
    if (postId) {
      setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
    }
  }, []);

  // Xử lý sự kiện cập nhật bài đăng
  const handlePostUpdate = useCallback((event: Event) => {
    const { postId, updatedPost } = (event as CustomEvent).detail;
    // Cập nhật bài đăng đã sửa đổi trong danh sách
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

  // Thêm trình nghe sự kiện cho các bài đăng
  useEffect(() => {
    // Thêm trình nghe sự kiện
    window.addEventListener('newPost', handleNewPost);
    window.addEventListener('deletePost', handleDeletePost);
    window.addEventListener('postUpdate', handlePostUpdate);
    
    // Dọn dẹp trình nghe sự kiện
    return () => {
      window.removeEventListener('newPost', handleNewPost);
      window.removeEventListener('deletePost', handleDeletePost);
      window.removeEventListener('postUpdate', handlePostUpdate);
    };
  }, [handleNewPost, handleDeletePost, handlePostUpdate]);

  // Hàm tìm nạp được trì hoãn
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
              // Kiểm tra trùng lặp
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
    }, 500); // 500ms trì hoãn
  }, [page, hasMore, username]);

  const lastPostElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loadingRef.current) {
        setPage(prevPage => prevPage + 1);
      }
    }, {
      rootMargin: '100px', // Bắt đầu tải trước khi đến cuối
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