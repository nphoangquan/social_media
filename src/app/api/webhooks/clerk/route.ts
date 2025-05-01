import { verifyWebhook } from '@clerk/nextjs/webhooks'
import { WebhookEvent } from "@clerk/nextjs/server";
import prisma from "@/lib/client";
import { revalidatePath, revalidateTag } from 'next/cache';

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
        console.log("User update event received with data:", JSON.stringify({
          id: evt.data.id,
          username: evt.data.username,
          image_url: evt.data.image_url,
        }));
        
        // Always update the avatar when the image_url changes
        const userData: { username?: string; avatar?: string } = {
          username: evt.data.username || undefined,
        };
        
        // Only set avatar if image_url exists
        if (evt.data.image_url !== undefined) {
          userData.avatar = evt.data.image_url;
          console.log(`Updating avatar to: ${evt.data.image_url}`);
        }
        
        // Get the user before updating to get the username for path revalidation
        const user = await prisma.user.findUnique({
          where: { id: evt.data.id },
          select: { username: true }
        });
        
        // Update the user in database
        await prisma.user.update({
          where: {
            id: evt.data.id,
          },
          data: userData,
        });
        console.log("User has been updated successfully!");
        
        // Revalidate all relevant paths and tags
        revalidatePath("/", "layout");
        revalidatePath("/settings", "layout");
        revalidateTag('user-profile-card');
        
        // Revalidate profile paths if username is available
        if (user?.username) {
          revalidatePath(`/profile/${user.username}`, "layout");
        }
        
        // Return a cache control header to prevent browser caching
        return new Response("User updated successfully", { 
          status: 200,
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
      } catch (err) {
        console.error("Failed to update the user:", err);
        return new Response("Failed to update the user!", { status: 500 });
      }
    }

    // Handle user deletion
    if (eventType === "user.deleted") {
      console.log(`Processing user deletion for user ID: ${evt.data.id}`);
      
      // Track if we have any errors during deletion
      let hasErrors = false;
      
      try {
        // Delete in order that respects foreign key constraints
        
        // First, delete notifications related to the user
        try {
          const deletedNotifications = await prisma.notification.deleteMany({
            where: {
              OR: [
                { receiverId: evt.data.id },
                { senderId: evt.data.id }
              ]
            },
          });
          console.log(`Deleted ${deletedNotifications.count} notifications`);
        } catch (error) {
          console.error("Error deleting notifications:", error);
          hasErrors = true;
        }
        
        // Delete likes (they reference comments and posts)
        try {
          const deletedLikes = await prisma.like.deleteMany({
            where: {
              userId: evt.data.id,
            },
          });
          console.log(`Deleted ${deletedLikes.count} likes`);
        } catch (error) {
          console.error("Error deleting likes:", error);
          hasErrors = true;
        }
        
        // Delete comments (they reference posts)
        try {
          const deletedComments = await prisma.comment.deleteMany({
            where: {
              userId: evt.data.id,
            },
          });
          console.log(`Deleted ${deletedComments.count} comments`);
        } catch (error) {
          console.error("Error deleting comments:", error);
          hasErrors = true;
        }
        
        // Delete user's posts
        try {
          const deletedPosts = await prisma.post.deleteMany({
            where: {
              userId: evt.data.id,
            },
          });
          console.log(`Deleted ${deletedPosts.count} posts`);
        } catch (error) {
          console.error("Error deleting posts:", error);
          hasErrors = true;
        }
        
        // Delete follow relationships
        try {
          const deletedFollowers = await prisma.follower.deleteMany({
            where: {
              OR: [
                { followerId: evt.data.id },
                { followingId: evt.data.id }
              ]
            },
          });
          console.log(`Deleted ${deletedFollowers.count} follower relationships`);
        } catch (error) {
          console.error("Error deleting follower relationships:", error);
          hasErrors = true;
        }
        
        // Delete follow requests
        try {
          const deletedFollowRequests = await prisma.followRequest.deleteMany({
            where: {
              OR: [
                { senderId: evt.data.id },
                { receiverId: evt.data.id }
              ]
            },
          });
          console.log(`Deleted ${deletedFollowRequests.count} follow requests`);
        } catch (error) {
          console.error("Error deleting follow requests:", error);
          hasErrors = true;
        }
        
        // Delete blocks
        try {
          const deletedBlocks = await prisma.block.deleteMany({
            where: {
              OR: [
                { blockerId: evt.data.id },
                { blockedId: evt.data.id }
              ]
            },
          });
          console.log(`Deleted ${deletedBlocks.count} blocks`);
        } catch (error) {
          console.error("Error deleting blocks:", error);
          hasErrors = true;
        }
        
        // Delete stories
        try {
          const deletedStories = await prisma.story.deleteMany({
            where: {
              userId: evt.data.id,
            },
          });
          console.log(`Deleted ${deletedStories.count} stories`);
        } catch (error) {
          console.error("Error deleting stories:", error);
          hasErrors = true;
        }
        
        // Finally, delete the user record
        try {
          await prisma.user.delete({
            where: {
              id: evt.data.id,
            },
          });
          console.log(`Deleted user record for ID: ${evt.data.id}`);
        } catch (error) {
          console.error("Error deleting user record:", error);
          hasErrors = true;
        }
        
        if (hasErrors) {
          console.log("User deletion completed with some errors. Check logs for details.");
          return new Response("User deletion completed with some errors", { status: 207 });
        } else {
          console.log("User and related data has been deleted successfully!");
          return new Response("User and related data deleted successfully", { status: 200 });
        }
      } catch (err) {
        console.error("Critical error during user deletion:", err);
        return new Response("Failed to delete the user!", { status: 500 });
      }
    }

    return new Response('Webhook received', { status: 200 })
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error verifying webhook', { status: 400 })
  }
}

