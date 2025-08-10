import { z } from "zod";

export const chatsQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
});

export type ChatsQuery = z.infer<typeof chatsQuerySchema>;


