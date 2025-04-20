"use client";

import { addComment } from "@/lib/actions";
import { useUser } from "@clerk/nextjs";
import { Comment, User } from "@prisma/client";
import Image from "next/image";
import { useOptimistic } from "react";
import { Send } from "lucide-react";

type CommentWithUser = Comment & { user: User };

export default function CommentList({
  comments,
  postId,
}: {
  comments: CommentWithUser[];
  postId: number;
}) {
  const { user } = useUser();

  const [optimisticComments, addOptimisticComment] = useOptimistic(comments);

  async function handleSubmit(formData: FormData) {
    if (!user) return;
    
    const desc = formData.get("comment") as string;
    if (!desc?.trim()) return;

    const optimisticComment: CommentWithUser = {
      id: Math.random(),
      desc: desc.trim(),
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: user.id,
      postId,
      user: {
        id: user.id,
        username: "Sending...",
        avatar: user.imageUrl || "/noavatar.png",
        cover: "",
        description: "",
        name: "",
        surname: "",
        city: "",
        work: "",
        school: "",
        website: "",
        createdAt: new Date(),
      },
    };

    addOptimisticComment([optimisticComment, ...optimisticComments]);
    
    try {
      await addComment(postId, desc.trim());
      (document.getElementById("comment-form") as HTMLFormElement).reset();
      // The server action will handle the revalidation
    } catch (err) {
      console.error("Failed to add comment:", err);
    }
  }

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
            id="comment-form"
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
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {optimisticComments.map((comment) => (
          <div key={comment.id} className="flex gap-2">
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
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
