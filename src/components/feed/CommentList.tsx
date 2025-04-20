"use client";

import { addComment } from "@/lib/actions";
import { useUser } from "@clerk/nextjs";
import { Comment, User } from "@prisma/client";
import Image from "next/image";
import { useOptimistic, useState } from "react";
import { Smile, Heart, MoreVertical } from "lucide-react";

type CommentWithUser = Comment & { user: User };

const CommentList = ({
  comments,
  postId,
}: {
  comments: CommentWithUser[];
  postId: number;
}) => {
  const { user } = useUser();
  const [commentState, setCommentState] = useState(comments);
  const [desc, setDesc] = useState("");

  const add = async () => {
    if (!user || !desc) return;

    addOptimisticComment({
      id: Math.random(),
      desc,
      createdAt: new Date(Date.now()),
      updatedAt: new Date(Date.now()),
      userId: user.id,
      postId: postId,
      user: {
        id: user.id,
        username: "Sending Please Wait...",
        avatar: user.imageUrl || "/noAvatar.png",
        cover: "",
        description: "",
        name: "",
        surname: "",
        city: "",
        work: "",
        school: "",
        website: "",
        createdAt: new Date(Date.now()),
      },
    });
    try {
      const createdComment = await addComment(postId, desc);
      setCommentState((prev) => [createdComment, ...prev]);
      setDesc("");
    } catch (err) {
      console.error("Failed to add comment:", err);
    }
  };

  const [optimisticComments, addOptimisticComment] = useOptimistic(
    commentState,
    (state, value: CommentWithUser) => [value, ...state]
  );
  return (
    <>
      {user && (
        <div className="flex items-center gap-3 mb-6">
          <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-zinc-100 dark:ring-zinc-800">
            <Image
              src={user.imageUrl || "noAvatar.png"}
              alt=""
              fill
              loading="lazy"
              className="object-cover"
            />
          </div>
          <form
            action={add}
            className="flex-1 flex items-center justify-between bg-zinc-100/80 dark:bg-zinc-800/50 rounded-xl text-sm px-4 py-2 w-full group focus-within:ring-2 ring-emerald-500/20 dark:ring-emerald-500/10 transition-all"
          >
            <input
              type="text"
              placeholder="Write a comment..."
              value={desc}
              className="bg-transparent outline-none flex-1 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 text-zinc-600 dark:text-zinc-300"
              onChange={(e) => setDesc(e.target.value)}
            />
            <Smile className="w-4 h-4 cursor-pointer text-zinc-400 dark:text-zinc-500 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors" />
          </form>
        </div>
      )}

      <div className="space-y-6">
        {/* COMMENT */}
        {optimisticComments.map((comment) => (
          <div className="flex gap-3 group" key={comment.id}>
            {/* AVATAR */}
            <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-zinc-100 dark:ring-zinc-800">
              <Image
                src={comment.user.avatar || "noAvatar.png"}
                alt=""
                fill
                className="object-cover"
              />
            </div>
            {/* DESC */}
            <div className="flex-1 bg-zinc-100/50 dark:bg-zinc-800/30 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-zinc-800 dark:text-zinc-200">
                  {comment.user.name && comment.user.surname
                    ? comment.user.name + " " + comment.user.surname
                    : comment.user.username}
                </span>
                <MoreVertical className="w-4 h-4 cursor-pointer text-zinc-400 dark:text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-zinc-600 dark:text-zinc-300 text-sm leading-relaxed">
                {comment.desc}
              </p>
              <div className="flex items-center gap-6 text-xs mt-3">
                <div className="flex items-center gap-4 text-zinc-500 dark:text-zinc-400 group/like">
                  <Heart className="w-4 h-4 cursor-pointer group-hover/like:text-emerald-500 dark:group-hover/like:text-emerald-400 transition-colors" />
                  <span className="text-zinc-300 dark:text-zinc-600">|</span>
                  <span>0 Likes</span>
                </div>
                <button className="text-zinc-500 dark:text-zinc-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors">
                  Reply
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default CommentList;
