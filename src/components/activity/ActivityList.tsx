"use client";

import { ActivityItem } from "@/lib/actions/activity";
import ActivityListItem from "./ActivityListItem";
import { useEffect, useRef } from "react";

export default function ActivityList({
  activities,
  loading,
  hasMore,
  onLoadMore,
}: {
  activities: ActivityItem[];
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
}) {
  const observerTarget = useRef<HTMLDivElement>(null);

  // Thiết lập intersection observer cho cuộn vô hạn
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          onLoadMore();
        }
      },
      { threshold: 1.0 }
    );

    // Lưu giá trị hiện tại của ref vào một biến
    const currentTarget = observerTarget.current;
    
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loading, onLoadMore]);

  return (
    <div className="flex flex-col divide-y divide-zinc-100 dark:divide-zinc-800">
      {activities.length === 0 ? (
        <div className="py-8 text-center text-zinc-500 dark:text-zinc-400">
          <p>No activities to display.</p>
        </div>
      ) : (
        <>
          {activities.map((activity) => (
            <ActivityListItem key={activity.id} activity={activity} />
          ))}
          
          <div ref={observerTarget} className="h-8 my-4 flex items-center justify-center">
            {loading && (
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-zinc-400/50 border-solid border-e-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
            )}
          </div>
        </>
      )}
    </div>
  );
} 