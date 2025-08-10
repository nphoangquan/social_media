"use client";

import { Post, User, Comment } from "@prisma/client";
import CommentList from "./CommentList";
import { useEffect, useState, useCallback } from "react";
import { getPostComments } from "@/lib/actions/comment";

type CommentWithDetails = Comment & {
  user: User;
  likes: number;
  replies: (Comment & {
    user: User;
    likes: number;
  })[];
};

const Comments = ({ post }: { post: Post & { user: User } }) => {
  const [comments, setComments] = useState<CommentWithDetails[]>([]);

  const loadComments = useCallback(async () => {
    const commentsData = await getPostComments(post.id);
    setComments(commentsData);
  }, [post.id]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const handleCommentAdded = useCallback(() => {
    loadComments();
  }, [loadComments]);

  const postWithComments = {
    ...post,
    comments: comments,
  };

  return (
    <div className="border-t border-zinc-100/50 dark:border-zinc-800/50 pt-4">
      <CommentList 
        comments={comments} 
        postId={post.id} 
        post={postWithComments} 
        onCommentAdded={handleCommentAdded}
      />
    </div>
  );
};

export default Comments;


