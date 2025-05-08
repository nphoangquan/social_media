"use server";

import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/client";
import { revalidatePath } from "next/cache";
import { Permission, hasPermission } from "@/lib/auth";

// Lấy danh sách tất cả người dùng
export async function getAllUsers(page = 1, limit = 10) {
  try {
    // Kiểm tra quyền quản lý người dùng
    const hasManageUsersPermission = await hasPermission(Permission.MANAGE_USERS);
    if (!hasManageUsersPermission) {
      return { success: false, error: "Unauthorized" };
    }

    const skip = (page - 1) * limit;
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        name: true,
        surname: true,
        avatar: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
            comments: true,
            followers: true,
            followings: true,
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      },
      skip,
      take: limit
    });

    const totalUsers = await prisma.user.count();
    const totalPages = Math.ceil(totalUsers / limit);

    return {
      success: true,
      users,
      pagination: {
        totalUsers,
        totalPages,
        currentPage: page,
        limit
      }
    };
  } catch (error) {
    console.error("Error fetching users:", error);
    return { success: false, error: "Failed to fetch users" };
  }
}

// Cập nhật vai trò của người dùng
export async function updateUserRole(userId: string, newRole: string) {
  try {
    // Kiểm tra quyền thay đổi vai trò người dùng
    const hasChangeRolePermission = await hasPermission(Permission.CHANGE_USER_ROLE);
    if (!hasChangeRolePermission) {
      return { success: false, error: "Unauthorized" };
    }

    // Kiểm tra newRole có hợp lệ không
    if (!["user", "moderator", "admin"].includes(newRole)) {
      return { success: false, error: "Invalid role" };
    }

    // Cập nhật vai trò người dùng
    await prisma.user.update({
      where: { id: userId },
      data: { role: newRole }
    });

    revalidatePath(`/admin/users`);
    return { success: true };
  } catch (error) {
    console.error("Error updating user role:", error);
    return { success: false, error: "Failed to update user role" };
  }
}

// Tạo báo cáo mới
export async function createReport(type: string, targetId: number | string, reason: string, description?: string) {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    type ReportData = {
      type: string;
      reason: string;
      description?: string;
      submitterId: string;
      postId?: number;
      commentId?: number;
      reportedUserId?: string;
    };

    const reportData: ReportData = {
      type,
      reason,
      description,
      submitterId: userId,
    };

    // Xác định loại và ID của nội dung bị báo cáo
    if (type === "POST") {
      reportData.postId = typeof targetId === 'number' ? targetId : parseInt(targetId);
    } else if (type === "COMMENT") {
      reportData.commentId = typeof targetId === 'number' ? targetId : parseInt(targetId);
    } else if (type === "USER") {
      reportData.reportedUserId = targetId.toString();
    } else {
      return { success: false, error: "Invalid report type" };
    }

    // Tạo báo cáo
    await prisma.report.create({
      data: reportData
    });

    return { success: true };
  } catch (error) {
    console.error("Error creating report:", error);
    return { success: false, error: "Failed to create report" };
  }
}

// Lấy danh sách báo cáo
export async function getReports(page = 1, limit = 10, status?: string) {
  try {
    // Kiểm tra quyền xem báo cáo
    const hasViewReportsPermission = await hasPermission(Permission.VIEW_REPORTS);
    if (!hasViewReportsPermission) {
      return { success: false, error: "Unauthorized" };
    }

    const skip = (page - 1) * limit;
    
    // Điều kiện lọc theo trạng thái
    const where = status ? { status } : {};
    
    // Lấy danh sách báo cáo
    const reports = await prisma.report.findMany({
      where,
      include: {
        submitter: {
          select: {
            id: true,
            username: true,
            name: true,
            surname: true,
            avatar: true,
          }
        },
        reportedUser: {
          select: {
            id: true,
            username: true,
            name: true,
            surname: true,
            avatar: true,
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      },
      skip,
      take: limit
    });

    // Tổng số báo cáo
    const totalReports = await prisma.report.count({ where });
    const totalPages = Math.ceil(totalReports / limit);

    return {
      success: true,
      reports,
      pagination: {
        totalReports,
        totalPages,
        currentPage: page,
        limit
      }
    };
  } catch (error) {
    console.error("Error fetching reports:", error);
    return { success: false, error: "Failed to fetch reports" };
  }
}

// Cập nhật trạng thái báo cáo
export async function updateReportStatus(reportId: number, status: string) {
  try {
    // Kiểm tra quyền xử lý báo cáo
    const hasHandleReportsPermission = await hasPermission(Permission.HANDLE_REPORTS);
    if (!hasHandleReportsPermission) {
      return { success: false, error: "Unauthorized" };
    }

    // Kiểm tra status có hợp lệ không
    if (!["pending", "resolved", "rejected"].includes(status)) {
      return { success: false, error: "Invalid status" };
    }

    // Cập nhật trạng thái báo cáo
    await prisma.report.update({
      where: { id: reportId },
      data: { status }
    });

    revalidatePath(`/admin/reports`);
    return { success: true };
  } catch (error) {
    console.error("Error updating report status:", error);
    return { success: false, error: "Failed to update report status" };
  }
}

// Lấy thống kê tổng quan cho dashboard
export async function getAdminDashboardStats() {
  try {
    // Kiểm tra quyền xem thống kê
    const hasViewAnalyticsPermission = await hasPermission(Permission.VIEW_ANALYTICS);
    if (!hasViewAnalyticsPermission) {
      return { success: false, error: "Unauthorized" };
    }

    // Tổng số người dùng
    const totalUsers = await prisma.user.count();
    
    // Tổng số bài đăng
    const totalPosts = await prisma.post.count();
    
    // Tổng số bình luận
    const totalComments = await prisma.comment.count();
    
    // Báo cáo chưa xử lý
    const pendingReports = await prisma.report.count({
      where: { status: "pending" }
    });
    
    // Người dùng mới trong 7 ngày qua
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const newUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: weekAgo
        }
      }
    });
    
    // Bài đăng mới trong 7 ngày qua
    const newPosts = await prisma.post.count({
      where: {
        createdAt: {
          gte: weekAgo
        }
      }
    });
    
    // Bình luận mới trong 7 ngày qua
    const newComments = await prisma.comment.count({
      where: {
        createdAt: {
          gte: weekAgo
        }
      }
    });
    
    // Tính toán số tương tác hàng ngày (bình luận + lượt thích trong 24h qua)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const recentComments = await prisma.comment.count({
      where: {
        createdAt: {
          gte: yesterday
        }
      }
    });
    
    const recentLikes = await prisma.like.count({
      where: {
        createdAt: {
          gte: yesterday
        }
      }
    });
    
    const dailyInteractions = recentComments + recentLikes;
    
    // Tính toán tỷ lệ tăng trưởng tương tác so với tuần trước
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const previousWeekComments = await prisma.comment.count({
      where: {
        createdAt: {
          gte: twoWeeksAgo,
          lt: oneWeekAgo
        }
      }
    });
    
    const previousWeekLikes = await prisma.like.count({
      where: {
        createdAt: {
          gte: twoWeeksAgo,
          lt: oneWeekAgo
        }
      }
    });
    
    const currentWeekComments = await prisma.comment.count({
      where: {
        createdAt: {
          gte: oneWeekAgo
        }
      }
    });
    
    const currentWeekLikes = await prisma.like.count({
      where: {
        createdAt: {
          gte: oneWeekAgo
        }
      }
    });
    
    const previousWeekInteractions = previousWeekComments + previousWeekLikes;
    const currentWeekInteractions = currentWeekComments + currentWeekLikes;
    
    // Tránh chia cho 0
    const interactionGrowthRate = previousWeekInteractions > 0 
      ? (currentWeekInteractions - previousWeekInteractions) / previousWeekInteractions 
      : 0;
    
    return {
      success: true,
      stats: {
        totalUsers,
        totalPosts,
        totalComments,
        pendingReports,
        newUsers,
        newPosts,
        newComments,
        dailyInteractions,
        interactionGrowthRate
      }
    };
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return { success: false, error: "Failed to fetch dashboard stats" };
  }
}

// Xóa người dùng
export async function deleteUser(userId: string) {
  try {
    // Kiểm tra quyền xóa người dùng
    const hasDeleteUserPermission = await hasPermission(Permission.DELETE_USER);
    if (!hasDeleteUserPermission) {
      return { success: false, error: "Unauthorized" };
    }

    // Xóa người dùng
    await prisma.user.delete({
      where: { id: userId }
    });

    revalidatePath(`/admin/users`);
    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { success: false, error: "Failed to delete user" };
  }
} 