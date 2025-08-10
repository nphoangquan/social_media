import { z } from "zod";

export const addCommentSchema = z.object({
  postId: z.number().int().positive(),
  desc: z.string().min(1).max(3000),
  parentId: z.number().int().positive().nullable().optional(),
});

export type AddCommentInput = z.infer<typeof addCommentSchema>;


