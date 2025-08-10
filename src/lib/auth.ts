import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/client";
import { USER_ROLES, type UserRole } from "@/shared/constants/roles";

// Các vai trò trong hệ thống
export type { UserRole };

// Enum cho quyền hạn
export enum Permission {
  // Quyền người dùng thông thường
  CREATE_POST = "create_post",
  EDIT_OWN_POST = "edit_own_post",
  DELETE_OWN_POST = "delete_own_post",
  CREATE_COMMENT = "create_comment",
  DELETE_OWN_COMMENT = "delete_own_comment",
  
  // Quyền người kiểm duyệt
  DELETE_ANY_POST = "delete_any_post",
  DELETE_ANY_COMMENT = "delete_any_comment",
  
  // Quyền quản trị viên
  MANAGE_USERS = "manage_users",
  CHANGE_USER_ROLE = "change_user_role",
  DELETE_USER = "delete_user",
  VIEW_REPORTS = "view_reports",
  HANDLE_REPORTS = "handle_reports",
  VIEW_ANALYTICS = "view_analytics"
}

// Ánh xạ quyền theo vai trò
const rolePermissions: Record<UserRole, Permission[]> = {
  user: [
    Permission.CREATE_POST,
    Permission.EDIT_OWN_POST,
    Permission.DELETE_OWN_POST,
    Permission.CREATE_COMMENT,
    Permission.DELETE_OWN_COMMENT,
  ],
  moderator: [
    Permission.CREATE_POST,
    Permission.EDIT_OWN_POST,
    Permission.DELETE_OWN_POST,
    Permission.CREATE_COMMENT,
    Permission.DELETE_OWN_COMMENT,
    Permission.DELETE_ANY_POST,
    Permission.DELETE_ANY_COMMENT,
    Permission.VIEW_REPORTS,
    Permission.HANDLE_REPORTS,
  ],
  admin: [
    Permission.CREATE_POST,
    Permission.EDIT_OWN_POST,
    Permission.DELETE_OWN_POST,
    Permission.CREATE_COMMENT,
    Permission.DELETE_OWN_COMMENT,
    Permission.DELETE_ANY_POST,
    Permission.DELETE_ANY_COMMENT,
    Permission.MANAGE_USERS,
    Permission.CHANGE_USER_ROLE,
    Permission.DELETE_USER,
    Permission.VIEW_REPORTS,
    Permission.HANDLE_REPORTS,
    Permission.VIEW_ANALYTICS,
  ],
};

// Định nghĩa interface cho user có trường role
interface UserWithRole {
  id: string;
  username: string;
  avatar: string | null;
  name: string | null;
  surname: string | null;
  role: string;
}

// Lấy thông tin người dùng hiện tại kèm role
export async function getCurrentUser(): Promise<UserWithRole | null> {
  const { userId } = await auth();
  
  if (!userId) {
    return null;
  }
  
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      avatar: true,
      name: true,
      surname: true,
      role: true,
    },
  });
  
  return user as UserWithRole;
}

// Kiểm tra xem người dùng có quyền cụ thể không
export async function hasPermission(permission: Permission): Promise<boolean> {
  const user = await getCurrentUser();
  
  if (!user) {
    return false;
  }
  
  const userRole = user.role as UserRole;
  return rolePermissions[userRole].includes(permission);
}

// Kiểm tra xem người dùng có sở hữu nội dung hay không
export async function isOwner(contentType: "post" | "comment", contentId: number): Promise<boolean> {
  const { userId } = await auth();
  
  if (!userId) {
    return false;
  }
  
  if (contentType === "post") {
    const post = await prisma.post.findUnique({
      where: { id: contentId },
      select: { userId: true },
    });
    
    return post?.userId === userId;
  } else if (contentType === "comment") {
    const comment = await prisma.comment.findUnique({
      where: { id: contentId },
      select: { userId: true },
    });
    
    return comment?.userId === userId;
  }
  
  return false;
}

// Kiểm tra xem người dùng có thể xóa nội dung hay không
export async function canDeleteContent(contentType: "post" | "comment", contentId: number): Promise<boolean> {
  const user = await getCurrentUser();
  
  if (!user) {
    return false;
  }
  
  // Kiểm tra quyền sở hữu
  const isContentOwner = await isOwner(contentType, contentId);
  
  // Nếu là chủ sở hữu và có quyền xóa nội dung của mình
  if (isContentOwner) {
    if (contentType === "post") {
      return rolePermissions[user.role as UserRole].includes(Permission.DELETE_OWN_POST);
    } else if (contentType === "comment") {
      return rolePermissions[user.role as UserRole].includes(Permission.DELETE_OWN_COMMENT);
    }
  }
  
  // Nếu không phải chủ sở hữu, kiểm tra quyền xóa bất kỳ nội dung nào
  if (contentType === "post") {
    return rolePermissions[user.role as UserRole].includes(Permission.DELETE_ANY_POST);
  } else if (contentType === "comment") {
    return rolePermissions[user.role as UserRole].includes(Permission.DELETE_ANY_COMMENT);
  }
  
  return false;
} 