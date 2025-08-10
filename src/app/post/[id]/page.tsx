import prisma from "@/lib/client";
import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import PostDetail from "@/app/(app)/_components/PostDetail";
import LeftMenu from "@/app/(app)/_components/LeftMenu";
import RightMenu from "@/app/(app)/_components/rightMenu/RightMenu";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ commentId?: string | string[] }>;
};

export default async function PostPage({ 
  params,
  searchParams 
}: PageProps) {
  const { id } = await params;
  const commentParams = await searchParams;
  
  const { userId } = await auth();
  
  // Chuyển hướng đến trang đăng nhập nếu không có ID người dùng
  if (!userId) {
    redirect("/sign-in");
  }
  
  const postId = parseInt(id);
  
  if (isNaN(postId)) {
    notFound();
  }
  
  // Lấy ID comment nổi bật từ tham số tìm kiếm nếu có
  const highlightCommentId = commentParams.commentId 
    ? parseInt(commentParams.commentId as string) 
    : undefined;
  
  // Lấy bài đăng với comments, likes và thông tin người dùng
  const post = await prisma.post.findUnique({
    where: {
      id: postId,
    },
    include: {
      user: true,
      likes: {
        select: {
          userId: true,
        },
      },
      _count: {
        select: {
          comments: true,
          likes: true,
        },
      },
      comments: {
        orderBy: {
          createdAt: 'desc',
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
      },
    },
  });
  
  if (!post) {
    notFound();
  }
  
  // Chuyển đổi comments để bao gồm số lượng like
  const transformedComments = post.comments.map(comment => ({
    ...comment,
    likes: comment.likes.length,
    replies: comment.replies.map(reply => ({
      ...reply,
      likes: reply.likes.length,
    })),
  }));

  // Chuyển đổi bài đăng với comments và bao gồm ID người dùng hiện tại
  const transformedPost = {
    ...post,
    comments: transformedComments,
    currentUserId: userId,
  };

  return (
    <div className="flex gap-6 pt-6">
      <div className="hidden xl:block w-[16%]">
        <LeftMenu type="home" />
      </div>
      <div className="w-full lg:w-[75%] xl:w-[62%]">
        <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-2xl shadow-lg dark:shadow-zinc-800/20 border border-zinc-100/50 dark:border-zinc-800/50 p-6">
          <h1 className="text-2xl font-bold text-zinc-800 dark:text-zinc-200 mb-6">Post</h1>
          <PostDetail 
            post={transformedPost} 
            standalone={true} 
            highlightCommentId={highlightCommentId}
          />
        </div>
      </div>
      <div className="hidden lg:block w-[26%]">
        <RightMenu />
      </div>
    </div>
  );
} 