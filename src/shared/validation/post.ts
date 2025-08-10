import { z } from "zod";

export const updatePostSchema = z.object({
  desc: z.string().min(1).max(3000),
  img: z.string().url().nullable().optional(),
  video: z.string().url().nullable().optional(),
});

export type UpdatePostInput = z.infer<typeof updatePostSchema>;


