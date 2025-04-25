import { getStoryById } from "@/lib/actions/story";
import StoryViewer from "@/components/story/StoryViewer";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function StoryPage({ params }: PageProps) {
  const { id } = await params;
  const story = await getStoryById(id);

  if (!story) {
    notFound();
  }

  return <StoryViewer story={story} />;
} 