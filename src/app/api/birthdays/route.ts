import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/client";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get all users that the current user follows
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

    // Filter out users without birthdate and add information about birthday status
    const friendsWithBirthday = following
      .map(follow => follow.following)
      .filter(friend => friend.birthDate)
      .map(friend => {
        const today = new Date();
        const birthDate = new Date(friend.birthDate!);
        
        // Check if today is the birthday (ignore year)
        const isBirthdayToday = 
          today.getDate() === birthDate.getDate() && 
          today.getMonth() === birthDate.getMonth();
        
        // Calculate upcoming birthday this year
        const thisYearBirthday = new Date(
          today.getFullYear(),
          birthDate.getMonth(),
          birthDate.getDate()
        );
        
        // If birthday already passed this year, set to next year
        if (thisYearBirthday < today) {
          thisYearBirthday.setFullYear(today.getFullYear() + 1);
        }
        
        // Calculate days until next birthday
        const daysUntilBirthday = Math.ceil(
          (thisYearBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );

        return {
          ...friend,
          isBirthdayToday,
          daysUntilBirthday
        };
      })
      // Sort by closest birthday (today first, then by days until birthday)
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