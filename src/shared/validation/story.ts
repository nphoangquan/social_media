import { z } from "zod";

export const storyCreateSchema = z.object({
  fileType: z.enum(["image", "video"]),
  fileData: z.string().url(),
});

export type StoryCreateInput = z.infer<typeof storyCreateSchema>;


