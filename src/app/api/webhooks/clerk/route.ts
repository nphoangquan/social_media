import { verifyWebhook } from '@clerk/nextjs/webhooks'
import { WebhookEvent } from "@clerk/nextjs/server";
import prisma from "@/lib/client";
import { revalidatePath, revalidateTag } from 'next/cache';

// Define error type
type ErrorWithMessage = {
  message: string;
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return (error as ErrorWithMessage).message;
  }
  return String(error);
}

export async function POST(req: Request) {
  // Thêm logging thêm cho việc gỡ lỗi
  console.log("Webhook endpoint called");
  
  try {
    // Clone request để ghi log nếu cần thiết
    const reqClone = req.clone();
    const bodyText = await reqClone.text();
    console.log("Webhook request body:", bodyText);
    
    // Verify webhook với request gốc
    const evt = await verifyWebhook(req) as WebhookEvent;

    const { id } = evt.data;
    const eventType = evt.type;
    console.log(`Received webhook with ID ${id} and event type of ${eventType}`);
    console.log(`Event data: ${JSON.stringify(evt.data)}`);

    if (eventType === "user.created") {
      console.log("Processing user.created webhook event");
      try {
        // Kiểm tra xem user đã tồn tại (idempotency)
        console.log(`Checking if user ${evt.data.id} already exists`);
        const existingUser = await prisma.user.findUnique({
          where: { id: evt.data.id }
        });

        if (existingUser) {
          console.log(`User ${evt.data.id} already exists, skipping creation`);
          return new Response("User already exists", { status: 200 });
        }

        // Đảm bảo chúng ta có username hợp lệ
        let username = evt.data.username;
        console.log(`Initial username from Clerk: ${username}`);
        
        if (!username) {
          console.log("Không có username, tạo một username");
          // Nếu không có username từ oauth, sử dụng tiền tố email hoặc fallback
          if (evt.data.email_addresses && evt.data.email_addresses.length > 0) {
            const email = evt.data.email_addresses[0]?.email_address;
            console.log(`Sử dụng email để tạo username: ${email}`);
            username = email.split('@')[0];
          } else {
            console.log("Không tìm thấy email, sử dụng username dựa trên ID");
            username = 'user_' + evt.data.id;
          }
          
          console.log(`Generated username: ${username}`);
          
          // Đảm bảo username là duy nhất bằng cách kiểm tra database
          console.log(`Kiểm tra xem username ${username} đã tồn tại chưa`);
          const existingUsername = await prisma.user.findUnique({
            where: { username }
          });
          
          if (existingUsername) {
            console.log(`Username ${username} đã tồn tại, thêm số ngẫu nhiên`);
            // Thêm số ngẫu nhiên nếu username đã tồn tại
            username = username + '_' + Math.floor(Math.random() * 10000);
            console.log(`New unique username: ${username}`);
          }
        }

        // Chuẩn bị dữ liệu user với kiểm tra null rõ ràng
        const userData = {
          id: evt.data.id,
          username: username,
          name: evt.data.first_name || null,
          surname: evt.data.last_name || null,
          avatar: evt.data.image_url || "/noAvatar.png",
          cover: "/noCover.png",
        };
        
        console.log(`Creating user with data:`, userData);

        // Tạo bản ghi user
        const createdUser = await prisma.user.create({
          data: userData,
        });
        
        console.log(`User ${evt.data.id} (${username}) has been created successfully with database ID: ${createdUser.id}`);
        
        // Revalidate paths có thể hiển thị user mới
        console.log("Revalidating paths");
        revalidatePath("/", "layout");
        revalidateTag('user-list');
        
        return new Response("User created successfully", { 
          status: 201,
          headers: {
            'Content-Type': 'application/json'
          }
        });
      } catch (err: unknown) {
        console.error("Failed to create the user:", err);
        console.error("Error details:", getErrorMessage(err));
        return new Response(JSON.stringify({
          error: `Failed to create the user: ${getErrorMessage(err)}`,
          errorDetails: err instanceof Error ? err.stack : null
        }), { 
          status: 500,
          headers: {
            'Content-Type': 'application/json'
          }
        });
      }
    }

    if (eventType === "user.updated") {
      try {
        console.log("User update event received with data:", JSON.stringify({
          id: evt.data.id,
          username: evt.data.username,
          image_url: evt.data.image_url,
        }));
        
        // Luôn cập nhật avatar khi image_url thay đổi
        const userData: { username?: string; avatar?: string } = {
          username: evt.data.username || undefined,
        };
        
        // Chỉ cập nhật avatar nếu image_url tồn tại
        if (evt.data.image_url !== undefined) {
          userData.avatar = evt.data.image_url;
          console.log(`Cập nhật avatar thành: ${evt.data.image_url}`);
        }
        
        // Lấy user trước khi cập nhật để lấy username cho việc revalidate
        const user = await prisma.user.findUnique({
          where: { id: evt.data.id },
          select: { username: true }
        });
        
        // Cập nhật user trong database
        await prisma.user.update({
          where: {
            id: evt.data.id,
          },
          data: userData,
        });
        console.log("User đã được cập nhật thành công!");
        
        // Revalidate tất cả các đường dẫn và tag liên quan
        revalidatePath("/", "layout");
        revalidatePath("/settings", "layout");
        revalidateTag('user-profile-card');
        
        // Revalidate đường dẫn profile nếu username tồn tại
        if (user?.username) {
          revalidatePath(`/profile/${user.username}`, "layout");
        }
        
        // Trả về header cache control để ngăn chặn caching trình duyệt
        return new Response("User updated successfully", { 
          status: 200,
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
      } catch (err: unknown) {
        console.error("Failed to update the user:", err);
        return new Response("Failed to update the user!", { status: 500 });
      }
    }

    // Xử lý xóa user
    if (eventType === "user.deleted") {
      console.log(`Xử lý xóa user với ID: ${evt.data.id}`);
      
      // Theo dõi xem có lỗi nào không trong quá trình xóa
      let hasErrors = false;
      
      try {
        // Xóa theo thứ tự để tuân theo ràng buộc khóa ngoại
        
        // Đầu tiên, xóa thông báo liên quan đến user
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
        } catch (error: unknown) {
          console.error("Error deleting notifications:", error);
          hasErrors = true;
        }
        
        // Xóa likes (chúng tham chiếu đến bình luận và bài viết)
        try {
          const deletedLikes = await prisma.like.deleteMany({
            where: {
              userId: evt.data.id,
            },
          });
          console.log(`Deleted ${deletedLikes.count} likes`);
        } catch (error: unknown) {
          console.error("Error deleting likes:", error);
          hasErrors = true;
        }
        
        // Xóa bình luận (chúng tham chiếu đến bài viết)
        try {
          const deletedComments = await prisma.comment.deleteMany({
            where: {
              userId: evt.data.id,
            },
          });
          console.log(`Deleted ${deletedComments.count} comments`);
        } catch (error: unknown) {
          console.error("Error deleting comments:", error);
          hasErrors = true;
        }
        
        // Xóa bài viết của user
        try {
          const deletedPosts = await prisma.post.deleteMany({
            where: {
              userId: evt.data.id,
            },
          });
          console.log(`Deleted ${deletedPosts.count} posts`);
        } catch (error: unknown) {
          console.error("Error deleting posts:", error);
          hasErrors = true;
        }
        
        // Xóa mối quan hệ theo dõi
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
        } catch (error: unknown) {
          console.error("Error deleting follower relationships:", error);
          hasErrors = true;
        }
        
        // Xóa yêu cầu theo dõi
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
        } catch (error: unknown) {
          console.error("Error deleting follow requests:", error);
          hasErrors = true;
        }
        
        // Xóa khối
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
        } catch (error: unknown) {
          console.error("Error deleting blocks:", error);
          hasErrors = true;
        }
        
        // Xóa story
        try {
          const deletedStories = await prisma.story.deleteMany({
            where: {
              userId: evt.data.id,
            },
          });
          console.log(`Deleted ${deletedStories.count} stories`);
        } catch (error: unknown) {
          console.error("Error deleting stories:", error);
          hasErrors = true;
        }
        
        // Xóa bản ghi user
        try {
          await prisma.user.delete({
            where: {
              id: evt.data.id,
            },
          });
          console.log(`Deleted user record for ID: ${evt.data.id}`);
        } catch (error: unknown) {
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
      } catch (err: unknown) {
        console.error("Critical error during user deletion:", err);
        return new Response("Failed to delete the user!", { status: 500 });
      }
    }

    return new Response('Webhook received', { status: 200 })
  } catch (err: unknown) {
    console.error('Error in webhook handler:', err);
    console.error('Error details:', getErrorMessage(err));
    console.error('Stack trace:', err instanceof Error ? err.stack : 'No stack trace available');
    
    return new Response(JSON.stringify({
      error: `Error in webhook handler: ${getErrorMessage(err)}`,
      errorDetails: err instanceof Error ? err.stack : null
    }), { 
      status: 400,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}

