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