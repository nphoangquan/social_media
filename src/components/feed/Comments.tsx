import prisma from "@/lib/client";
import CommentList from "./CommentList";

const Comments = async ({postId}:{postId:number}) => {
  const comments = await prisma.comment.findMany({
    where:{
      postId,
    },
    include:{
      user:true
    }
  })
  return (
    <div className="border-t border-zinc-100/50 dark:border-zinc-800/50 pt-4">
      <CommentList comments={comments} postId={postId}/>
    </div>
  );
};

export default Comments;