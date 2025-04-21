"use client";

import { addComment } from "@/lib/actions";
import { useUser } from "@clerk/nextjs";
import { Comment, User, Post } from "@prisma/client";
import Image from "next/image";
import { useOptimistic, useState } from "react";
import { Send, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import PostDetail from "./PostDetail";

type CommentWithUser = Comment & { 
  user: User;
  replies?: CommentWithUser[];
  likes?: number;
};

export default function CommentList({
  comments,
  postId,
  showAll = false,
  post,
}: {
  comments: CommentWithUser[];
  postId: number;
  showAll?: boolean;
  post: Post & { user: User };
}) {
  const { user } = useUser();
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [optimisticComments, addOptimisticComment] = useOptimistic(comments);
  const [showPostDetail, setShowPostDetail] = useState(false);
  const router = useRouter();

  // Sort comments by likes and get the most liked comment
  const sortedComments = [...optimisticComments].sort((a, b) => 
    (b.likes || 0) - (a.likes || 0)
  );
  const mostLikedComment = sortedComments[0];
  
  const displayedComments = showAll ? sortedComments : (mostLikedComment ? [mostLikedComment] : []);

  async function handleSubmit(formData: FormData) {
    if (!user) return;

    const desc = formData.get("comment") as string;
    const parentId = formData.get("parentId") as string;
    if (!desc?.trim()) return;

    const optimisticComment: CommentWithUser = {
      id: Math.random(),
      desc: desc.trim(),
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: user.id,
      postId,
      parentId: parentId ? parseInt(parentId) : null,
      likes: 0,
      user: {
        id: user.id,
        username: user.username || "Sending...",
        avatar: user.imageUrl || "/noavatar.png",
        cover: "",
        description: "",
        name: user.firstName || "",
        surname: user.lastName || "",
        city: "",
        work: "",
        school: "",
        website: "",
        createdAt: new Date(),
      },
    };

    addOptimisticComment([optimisticComment, ...optimisticComments]);

    try {
      await addComment(postId, desc.trim(), parentId ? parseInt(parentId) : null);
      (document.getElementById(`comment-form-${parentId || "root"}`) as HTMLFormElement)?.reset();
      setReplyingTo(null);
      router.refresh();
    } catch (err) {
      console.error("Failed to add comment:", err);
    }
  }

  const CommentItem = ({ comment }: { comment: CommentWithUser }) => {
    const isReplying = replyingTo === comment.id;
    const [showAllReplies, setShowAllReplies] = useState(false);
    
    const displayedReplies = showAllReplies ? comment.replies : (comment.replies?.slice(0, 1) || []);

    return (
      <div className="space-y-2">
        <div className="flex gap-2">
          <div className="relative w-8 h-8 rounded-full overflow-hidden ring-1 ring-zinc-200 dark:ring-zinc-700 shrink-0">
            <Image
              src={comment.user.avatar || "/noavatar.png"}
              alt=""
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1">
            <div className="bg-zinc-100 dark:bg-zinc-800/50 rounded-lg px-3 py-2">
              <div className="font-medium text-sm text-zinc-800 dark:text-zinc-200 mb-1">
                {comment.user.name && comment.user.surname
                  ? `${comment.user.name} ${comment.user.surname}`
                  : comment.user.username}
              </div>
              <div className="text-sm text-zinc-600 dark:text-zinc-300">
                {comment.desc}
              </div>
            </div>
            <div className="flex gap-4 mt-1 px-3">
              <button
                type="button"
                className="text-xs text-zinc-500 hover:text-emerald-500 dark:text-zinc-400 dark:hover:text-emerald-400 transition-colors"
              >
                Like
              </button>
              <button
                type="button"
                onClick={() => setReplyingTo(comment.id)}
                className="text-xs text-zinc-500 hover:text-emerald-500 dark:text-zinc-400 dark:hover:text-emerald-400 transition-colors"
              >
                Reply
              </button>
              <div className="text-xs text-zinc-400 dark:text-zinc-500">
                {new Intl.DateTimeFormat("en-US", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                }).format(new Date(comment.createdAt))}
              </div>
            </div>
            {isReplying && user && (
              <div className="flex gap-2 mt-2">
                <div className="relative w-8 h-8 rounded-full overflow-hidden ring-1 ring-zinc-200 dark:ring-zinc-700 shrink-0">
                  <Image
                    src={user.imageUrl || "/noavatar.png"}
                    alt=""
                    fill
                    className="object-cover"
                  />
                </div>
                <form
                  id={`comment-form-${comment.id}`}
                  action={handleSubmit}
                  className="flex-1 flex gap-2"
                >
                  <input type="hidden" name="parentId" value={comment.id} />
                  <input
                    name="comment"
                    placeholder={`Reply to ${comment.user.name || comment.user.username}...`}
                    className="flex-1 bg-zinc-100 dark:bg-zinc-800/50 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 ring-emerald-500/20 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 text-zinc-600 dark:text-zinc-300"
                  />
                  <button
                    type="submit"
                    aria-label="Send reply"
                    className="shrink-0 px-3 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                  >
                    <Send className="w-4 h-4 cursor-pointer" />
                  </button>
                </form>
              </div>
            )}
            {comment.replies && comment.replies.length > 0 && (
              <div className="ml-8 mt-2 space-y-2 max-h-[300px] overflow-y-auto scrollbar-none">
                {displayedReplies?.map((reply) => (
                  <CommentItem key={reply.id} comment={reply} />
                ))}
                {!showAllReplies && comment.replies && comment.replies.length > 1 && (
                  <button
                    onClick={() => setShowAllReplies(true)}
                    className="text-xs text-zinc-500 hover:text-emerald-500 dark:text-zinc-400 dark:hover:text-emerald-400 transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <MessageCircle className="w-3 h-3" />
                    <span>View {comment.replies.length - 1} more {comment.replies.length - 1 === 1 ? 'reply' : 'replies'}</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {user && (
        <div className="flex gap-2">
          <div className="relative w-8 h-8 rounded-full overflow-hidden ring-1 ring-zinc-200 dark:ring-zinc-700 shrink-0">
            <Image
              src={user.imageUrl || "/noavatar.png"}
              alt=""
              fill
              className="object-cover"
            />
          </div>
          <form
            id="comment-form-root"
            action={handleSubmit}
            className="flex-1 flex gap-2"
          >
            <input
              name="comment"
              placeholder="Write a comment..."
              className="flex-1 bg-zinc-100 dark:bg-zinc-800/50 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 ring-emerald-500/20 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 text-zinc-600 dark:text-zinc-300"
            />
            <button
              type="submit"
              aria-label="Send comment"
              className="shrink-0 px-3 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
            >
              <Send className="w-4 h-4 cursor-pointer" />
            </button>
          </form>
        </div>
      )}

      {/* Comments */}
      <div className="space-y-4">
        {displayedComments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} />
        ))}
      </div>

      {/* View All Comments Button */}
      {!showAll && optimisticComments.length > 1 && (
        <button
          onClick={() => setShowPostDetail(true)}
          className="flex items-center gap-2 text-sm text-zinc-500 hover:text-emerald-500 dark:text-zinc-400 dark:hover:text-emerald-400 transition-colors mt-2 cursor-pointer"
        >
          <MessageCircle className="w-4 h-4" />
          <span>View all {optimisticComments.length} comments</span>
        </button>
      )}

      {/* Post Detail Modal */}
      {showPostDetail && (
        <PostDetail
          post={{
            ...post,
            comments: optimisticComments,
          }}
          onClose={() => setShowPostDetail(false)}
        />
      )}
    </div>
  );
}
