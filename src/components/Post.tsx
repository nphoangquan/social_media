import Image from "next/image";
import Comments from "./Comments";
const Post = () => {
  return (
    <div className="flex flex-col gap-4">
      {/* USER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Image
            src="https://static.wikia.nocookie.net/theloudhousefanon/images/8/83/IShowSpeed-1.webp/revision/latest?cb=20230827125946"
            alt=""
            width={40}
            height={40}
            className="w-10 h-10 rounded-full"
          />
          <span className="font-medium">IShowMeat</span>
        </div>
        <Image src="/more.png" alt="" width={16} height={16} />
      </div>
      {/* DESC */}
      <div className="flex flex-col gap-4">
        <div className="w-full min-h-96 relative">
          <Image
            src="https://i.ytimg.com/vi/wYZux3BMc5k/hq720.jpg?sqp=-oaymwE7CK4FEIIDSFryq4qpAy0IARUAAAAAGAElAADIQj0AgKJD8AEB-AH-CYAC0AWKAgwIABABGHIgTihCMA8=&rs=AOn4CLDTVPsZSvjxjW_1OH901lJqff61Sw"
            alt=""
            fill
            className="object-cover rounded-md"
          />
        </div>
        <p>
          freestar freestar freestar freestar Lorem ipsum dolor sit amet,
          consectetur adipiscing elit. Suspendisse luctus nisi at libero
          dignissim, ut dapibus nisi cursus. Praesent lacinia nisi id lorem
          maximus, in sodales felis venenatis. Mauris non urna sapien. Maecenas
          vehicula efficitur massa, nec elementum est blandit eget. Ut
          consectetur quam odio. Orci varius natoque penatibus et magnis dis
          parturient montes, nascetur ridiculus mus. Mauris egestas leo et
          efficitur gravida. Nullam ante nulla, sollicitudin sed elit at, dictum
          faucibus mauris. Proin tristique, purus at placerat malesuada, est
          augue tempor risus, quis sodales lorem nisi interdum erat. Aliquam
          egestas, dolor non congue mollis, nulla orci congue massa, eget
          lacinia eros ante et dui. Sed non lobortis mauris. Nunc sagittis sit
          amet felis sit amet lobortis. Donec eleifend, dui eu eleifend aliquam,
          nisi urna congue odio, quis egestas diam metus porttitor purus.
        </p>
      </div>
      {/* INTERACTION */}
      <div className="flex items-center justify-between text-sm my-4">
        <div className="flex gap-8">
          <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-xl">
            <Image
              src="/like.png"
              width={16}
              height={16}
              alt=""
              className="cursor-pointer"
            />
            <span className="text-gray-300">|</span>
            <span className="text-gray-500">
              123 <span className="hidden md:inline"> Likes</span>{" "}
            </span>
          </div>
          <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-xl">
            <Image
              src="/comment.png"
              width={16}
              height={16}
              alt=""
              className="cursor-pointer"
            />
            <span className="text-gray-300">|</span>
            <span className="text-gray-500">
              123 <span className="hidden md:inline"> Comments</span>{" "}
            </span>
          </div>
        </div>
        <div className="class">
          <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-xl">
            <Image
              src="/share.png"
              width={16}
              height={16}
              alt=""
              className="cursor-pointer"
            />
            <span className="text-gray-300">|</span>
            <span className="text-gray-500">
              123 <span className="hidden md:inline"> Shares</span>{" "}
            </span>
          </div>
        </div>
      </div>
      <Comments/>
    </div>
  );
};
export default Post;
