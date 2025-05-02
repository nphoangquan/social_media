import { getUserVideos } from "@/lib/actions/post";
import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/client";

export default async function UserVideosPage({ 
  params
}: { 
  params: Promise<{ username: string }> 
}) {
  const { username } = await params;
  
  // Verify user exists
  const user = await prisma.user.findUnique({
    where: { username },
    select: { id: true, name: true, surname: true, username: true }
  });
  
  if (!user) {
    notFound();
  }
  
  // Fetch user videos with their username
  const videos = await getUserVideos(username);
  
  // Get display name
  const displayName = user.name && user.surname 
    ? `${user.name} ${user.surname}'s`
    : `${user.username}'s`;
  
  return (
    <div className="flex flex-col gap-6">
      <div className="p-6 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-2xl shadow-lg dark:shadow-zinc-800/20 border border-zinc-100/50 dark:border-zinc-800/50">
        <h1 className="text-2xl font-bold mb-4 text-zinc-800 dark:text-zinc-200">
          {displayName} Videos
        </h1>
        
        {videos.length === 0 ? (
          <div className="flex justify-center items-center py-10">
            <p className="text-zinc-500 dark:text-zinc-400">No videos found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {videos.map((video) => (
              <Link 
                key={video.id} 
                href={`/post/${video.postId}`}
                className="flex flex-col rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 hover:shadow-md transition-shadow duration-300"
              >
                <div className="aspect-video relative">
                  <video 
                    src={video.video} 
                    className="w-full h-full object-cover"
                    preload="metadata"
                    autoPlay={false}
                    muted
                    playsInline
                    controls={false}
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <div className="w-12 h-12 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center">
                      <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-white border-b-8 border-b-transparent ml-1"></div>
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-white/80 dark:bg-zinc-900/80">
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Click to view post
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 