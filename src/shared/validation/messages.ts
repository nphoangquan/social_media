import { z } from "zod";

export const sendMessageSchema = z.object({
  chatId: z.number().int().positive(),
  content: z.string().optional(),
  img: z.string().url().optional(),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;


