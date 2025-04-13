import { verifyWebhook } from '@clerk/nextjs/webhooks'
import { WebhookEvent } from "@clerk/nextjs/server";
import prisma from "@/lib/client";

export async function POST(req: Request) {
  try {
    const evt = await verifyWebhook(req) as WebhookEvent;

    const { id } = evt.data;
    const eventType = evt.type;
    console.log(`Received webhook with ID ${id} and event type of ${eventType}`)

    if (eventType === "user.created") {
      try {
        await prisma.user.create({
          data: {
            id: evt.data.id,
            username: evt.data.username || 'user_' + evt.data.id,
            avatar: evt.data.image_url || "/noAvatar.png",
            cover: "/noCover.png",
          },
        });
        console.log("User has been created!");
      } catch (err) {
        console.error("Failed to create the user:", err);
        return new Response("Failed to create the user!", { status: 500 });
      }
    }

    if (eventType === "user.updated") {
      try {
        await prisma.user.update({
          where: {
            id: evt.data.id,
          },
          data: {
            username: evt.data.username || undefined,
            avatar: evt.data.image_url || undefined,
          },
        });
        console.log("User has been updated!");
      } catch (err) {
        console.error("Failed to update the user:", err);
        return new Response("Failed to update the user!", { status: 500 });
      }
    }

    return new Response('Webhook received', { status: 200 })
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error verifying webhook', { status: 400 })
  }
}

