import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/client";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Lấy tất cả người dùng mà người dùng hiện tại đang theo dõi
    const following = await prisma.follower.findMany({
      where: {
        followerId: userId,
      },
      include: {
        following: {
          select: {
            id: true,
            username: true,
            name: true,
            surname: true,
            avatar: true,
            birthDate: true,
          }
        }
      }
    });

    // Lọc ra những người dùng có ngày sinh và thêm thông tin về trạng thái sinh nhật
    const friendsWithBirthday = following
      .map(follow => follow.following)
      .filter(friend => friend.birthDate)
      .map(friend => {
        const today = new Date();
        const birthDate = new Date(friend.birthDate!);
        
        // Kiểm tra xem hôm nay có phải là sinh nhật không (bỏ qua năm)
        const isBirthdayToday = 
          today.getDate() === birthDate.getDate() && 
          today.getMonth() === birthDate.getMonth();
        
        // Tính toán ngày sinh nhật sắp tới trong năm nay
        const thisYearBirthday = new Date(
          today.getFullYear(),
          birthDate.getMonth(),
          birthDate.getDate()
        );
        
        // Nếu sinh nhật đã qua trong năm nay, đặt vào năm sau
        if (thisYearBirthday < today) {
          thisYearBirthday.setFullYear(today.getFullYear() + 1);
        }
        
        // Tính số ngày cho đến sinh nhật tiếp theo
        const daysUntilBirthday = Math.ceil(
          (thisYearBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );

        return {
          ...friend,
          isBirthdayToday,
          daysUntilBirthday
        };
      })
      // Sắp xếp theo sinh nhật gần nhất (hôm nay đầu tiên, sau đó theo số ngày đến sinh nhật)
      .sort((a, b) => {
        if (a.isBirthdayToday && !b.isBirthdayToday) return -1;
        if (!a.isBirthdayToday && b.isBirthdayToday) return 1;
        return a.daysUntilBirthday - b.daysUntilBirthday;
      });

    return NextResponse.json(friendsWithBirthday);
  } catch (error) {
    console.error("Error fetching birthdays:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 