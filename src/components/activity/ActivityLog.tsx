"use client";

import { ActivityItem, getUserActivity } from "@/lib/actions/activity";
import { useCallback, useState } from "react";
import ActivityFilter from "./ActivityFilter";
import ActivityList from "./ActivityList";
import { Calendar } from "lucide-react";

export default function ActivityLog({ initialActivities }: { initialActivities: ActivityItem[] }) {
  const [activities, setActivities] = useState<ActivityItem[]>(initialActivities);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialActivities.length >= 20);
  const [filter, setFilter] = useState<'all' | 'posts' | 'likes' | 'comments'>('all');

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    
    try {
      setLoading(true);
      const nextPage = page + 1;
      const nextActivities = await getUserActivity(nextPage, 20);
      
      if (nextActivities.length > 0) {
        setActivities(prev => [...prev, ...nextActivities]);
        setPage(nextPage);
      }
      
      if (nextActivities.length < 20) {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error loading more activities:", error);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, page]);

  // Lọc hoạt động dựa trên loại đã chọn
  const filteredActivities = activities.filter(activity => {
    if (filter === 'all') return true;
    if (filter === 'posts' && activity.type === 'POST_CREATED') return true;
    if (filter === 'likes' && activity.type === 'POST_LIKED') return true;
    if (filter === 'comments' && activity.type === 'COMMENT_ADDED') return true;
    return false;
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-2xl shadow-lg dark:shadow-zinc-800/20 border border-zinc-100/50 dark:border-zinc-800/50 p-6">
        <h1 className="text-2xl font-bold text-zinc-800 dark:text-zinc-200 mb-6">Activity Log</h1>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <ActivityFilter 
            currentFilter={filter}
            onFilterChange={setFilter}
          />
          
          <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
            <Calendar className="w-4 h-4" />
            <span>Showing your recent activity</span>
          </div>
        </div>
        
        <ActivityList 
          activities={filteredActivities} 
          loading={loading}
          hasMore={hasMore}
          onLoadMore={loadMore}
        />
      </div>
    </div>
  );
} 