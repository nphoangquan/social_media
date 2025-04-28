import prisma from "@/lib/client";

export async function getStoryById(id: string) {
  try {
    const story = await prisma.story.findUnique({
      where: {
        id: parseInt(id),
      },
      include: {
        user: true,
      },
    });

    return story;
  } catch (error) {
    console.error("Error fetching story:", error);
    return null;
  }
}

export async function getAllStories() {
  try {
    const stories = await prisma.story.findMany({
      where: {
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return stories;
  } catch (error) {
    console.error("Error fetching stories:", error);
    return [];
  }
}

export async function getPaginatedStories(page: number = 1, limit: number = 10) {
  try {
    const skip = (page - 1) * limit;
    
    const stories = await prisma.story.findMany({
      where: {
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    });

    // Đếm tổng số story để biết đã hết story chưa
    const totalCount = await prisma.story.count({
      where: {
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    return {
      stories,
      hasMore: skip + stories.length < totalCount,
      total: totalCount
    };
  } catch (error) {
    console.error("Error fetching paginated stories:", error);
    return {
      stories: [],
      hasMore: false,
      total: 0
    };
  }
} 