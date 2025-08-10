import type { Post as PrismaPost, User, Comment } from "@prisma/client";

export type FeedPostType = PrismaPost & {
  user: User;
  likes: { userId: string }[];
  _count: { comments: number; likes?: number };
  video?: string | null;
  comments: (Comment & { user: User })[];
  currentUserId?: string;
};


