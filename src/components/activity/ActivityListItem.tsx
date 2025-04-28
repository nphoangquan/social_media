"use client";

import { ActivityItem } from "@/lib/actions/activity";
import Image from "next/image";
import Link from "next/link";
import { FileText, Heart, MessageCircle } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

export default function ActivityListItem({ activity }: { activity: ActivityItem }) {
  // Function to format the date
  const formatDate = (date: Date) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const activityDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    if (activityDate.getTime() === today.getTime()) {
      return `Today at ${format(date, 'h:mm a')}`;
    }
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (activityDate.getTime() === yesterday.getTime()) {
      return `Yesterday at ${format(date, 'h:mm a')}`;
    }
    
    if (now.getTime() - date.getTime() < 7 * 24 * 60 * 60 * 1000) {
      return `${formatDistanceToNow(date, { addSuffix: true })} at ${format(date, 'h:mm a')}`;
    }
    
    return format(date, 'MMM d, yyyy \'at\' h:mm a');
  };

  // Function to get icon and description based on activity type
  const getActivityDetails = () => {
    switch (activity.type) {
      case 'POST_CREATED':
        return {
          icon: <FileText className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />,
          title: 'You created a post',
          description: activity.postDesc && activity.postDesc.length > 100
            ? `${activity.postDesc.substring(0, 100)}...`
            : activity.postDesc,
          link: `/post/${activity.postId}`,
        };
        
      case 'POST_LIKED':
        return {
          icon: <Heart className="w-5 h-5 text-red-500" />,
          title: `You liked a post${activity.targetUser ? ` by ${activity.targetUser.name || activity.targetUser.username}` : ''}`,
          description: activity.postDesc && activity.postDesc.length > 100
            ? `${activity.postDesc.substring(0, 100)}...`
            : activity.postDesc,
          link: `/post/${activity.postId}`,
        };
        
      case 'COMMENT_ADDED':
        return {
          icon: <MessageCircle className="w-5 h-5 text-blue-500" />,
          title: `You commented on a post${activity.targetUser ? ` by ${activity.targetUser.name || activity.targetUser.username}` : ''}`,
          description: activity.commentDesc && activity.commentDesc.length > 100
            ? `${activity.commentDesc.substring(0, 100)}...`
            : activity.commentDesc,
          link: `/post/${activity.postId}?commentId=${activity.commentId}`,
        };
        
      default:
        return {
          icon: <FileText className="w-5 h-5" />,
          title: 'Activity',
          description: '',
          link: '/',
        };
    }
  };

  const { icon, title, description, link } = getActivityDetails();
  
  return (
    <div className="py-4">
      <div className="flex items-start gap-4">
        <div className="mt-1 p-2 bg-zinc-100 dark:bg-zinc-800 rounded-full">
          {icon}
        </div>
        
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
            <h3 className="font-medium text-zinc-800 dark:text-zinc-200">{title}</h3>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {formatDate(new Date(activity.createdAt))}
            </span>
          </div>
          
          {description && (
            <p className="text-sm text-zinc-600 dark:text-zinc-300 mb-2">{description}</p>
          )}
          
          <Link 
            href={link}
            className="inline-flex items-center gap-1 text-xs px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full hover:bg-emerald-200 dark:hover:bg-emerald-800/40 transition-colors"
          >
            <span>View Post</span>
          </Link>
        </div>
        
        {activity.targetUser && (
          <Link 
            href={`/profile/${activity.targetUser.username}`}
            className="relative flex-shrink-0 w-10 h-10 rounded-full overflow-hidden ring-2 ring-zinc-100 dark:ring-zinc-800"
          >
            <Image
              src={activity.targetUser.avatar || "/noAvatar.png"}
              fill
              alt={activity.targetUser.name || activity.targetUser.username}
              className="object-cover"
            />
          </Link>
        )}
      </div>
    </div>
  );
} 