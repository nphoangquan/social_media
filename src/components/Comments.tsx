import Image from "next/image";

const Comments = () => {
  return (
    <div className="">
      {/* WRITE */}
      <div className="flex items-center gap-4">
        <Image
          src="https://genk.mediacdn.vn/k:2015/1-78918-47c60bff6263d078621b9e023c6616fe-1450690114301/lien-minh-huyen-thoai-faker-dang-kho-mau-tai-rank-han-quyet-doi-lai-vi-tri-top-1.jpg"
          alt=""
          width={32}
          height={32}
          className="w-8 h-8 rounded-full"
        />
        <div className="flex-1 flex items-center justify-between bg-slate-100 rounded-xl text-sm px-6 py-2 w-full">
          <input
            type="text"
            placeholder="Wrrite a comment..."
            className="bg-transparent outline-none flex-1"
          />
          <Image
            src="/emoji.png"
            alt=""
            width={16}
            height={16}
            className="cursor-pointer"
          />
        </div>
      </div>
      {/* COMMENTS */}
      <div className="">
        {/* COMMENT */}
        <div className="flex gap-4 justify-between mt-6">
          {/* AVATAR */}
          <Image
            src="https://genk.mediacdn.vn/k:2015/1-78918-47c60bff6263d078621b9e023c6616fe-1450690114301/lien-minh-huyen-thoai-faker-dang-kho-mau-tai-rank-han-quyet-doi-lai-vi-tri-top-1.jpg"
            alt=""
            width={40}
            height={40}
            className="w-10 h-10 rounded-full"
          />
          {/* DESC */}
          <div className="flex flex-col gap-2 flex-1">
            <span className="font-medium">Fekar</span>
            <p>
              freestar freestar freestar freestar Lorem ipsum dolor sit amet,
              consectetur adipiscing elit. Suspendisse luctus nisi at libero
              dignissim, ut dapibus nisi cursus. Praesent lacinia nisi id lorem
              maximus, in sodales felis venenatis. Mauris non urna sapien.
              Maecenas vehicula efficitur massa, nec elementum est blandit eget.
              Ut consectetur quam odio.
            </p>
            <div className="flex items-center gap-8 text-xs text-gray-500 mt-2">
              <div className="flex items-center gap-4">
                <Image
                  src="/like.png"
                  alt=""
                  width={12}
                  height={12}
                  className="cursor-pointer w-4 h-4"
                />
                <span className="text-gray-300">|</span>
                <span className="text-gray-500">123 Likes</span>
              </div>
              <div className="">Reply</div>
            </div>
          </div>
          {/* ICON */}
          <Image
            src="/more.png"
            alt=""
            width={16}
            height={16}
            className="cursor-pointer w-4 h-4"
          ></Image>
        </div>
      </div>
    </div>
  );
};
export default Comments;
