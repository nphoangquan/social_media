import prisma from "@/lib/client";
import CommentList from "./CommentList";
import { Post, User } from "@prisma/client";

const Comments = async ({ post }: { post: Post & { user: User } }) => {
  const comments = await prisma.comment.findMany({
    where: {
      postId: post.id,
      parentId: null, // Only fetch top-level comments
    },
    include: {
      user: true,
      likes: true,
      replies: {
        include: {
          user: true,
          likes: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Transform comments to include like count
  const commentsWithLikes = comments.map(comment => ({
    ...comment,
    likes: comment.likes.length,
    replies: comment.replies.map(reply => ({
      ...reply,
      likes: reply.likes.length,
    })),
  }));

  const postWithComments = {
    ...post,
    comments: commentsWithLikes,
  };

  return (
    <div className="border-t border-zinc-100/50 dark:border-zinc-800/50 pt-4">
      <CommentList comments={commentsWithLikes} postId={post.id} post={postWithComments} />
    </div>
  );
};

export default Comments;