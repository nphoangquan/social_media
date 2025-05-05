import { getUserPhotos } from "@/lib/actions/post";
import { auth } from "@clerk/nextjs/server";
import Image from "next/image";
import Link from "next/link";

export default async function PhotosPage() {
  const { userId } = await auth();
  
  // Trả về sớm nếu chưa xác thực
  if (!userId) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <p className="text-zinc-500 dark:text-zinc-400">Please sign in to view your photos</p>
      </div>
    );
  }
  
  // Lấy ảnh của người dùng - không có username nghĩa là ảnh của người dùng hiện tại
  const photos = await getUserPhotos();
  
  return (
    <div className="flex flex-col gap-6">
      <div className="p-6 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-2xl shadow-lg dark:shadow-zinc-800/20 border border-zinc-100/50 dark:border-zinc-800/50">
        <h1 className="text-2xl font-bold mb-4 text-zinc-800 dark:text-zinc-200">
          Your Photos
        </h1>
        
        {photos.length === 0 ? (
          <div className="flex justify-center items-center py-10">
            <p className="text-zinc-500 dark:text-zinc-400">No photos found. Share some photos in your posts!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1 sm:gap-2">
            {photos.map((photo) => (
              <Link 
                key={photo.id} 
                href={`/post/${photo.postId}`}
                className="aspect-square relative overflow-hidden rounded-md group cursor-pointer"
              >
                <Image
                  src={photo.img}
                  alt="User photo"
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 