import { getStoryById, getAllStories } from "@/lib/actions/story";
import StoryViewer from "@/components/story/StoryViewer";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function StoryPage({ params }: PageProps) {
  const { id } = await params;
  const story = await getStoryById(id);
  const allStories = await getAllStories();

  if (!story) {
    notFound();
  }

  return <StoryViewer story={story} allStories={allStories} />;
} 