import Image from "next/image";

const AddPost = () => {
  return (
    <div className="p-4 bg-white shadow-md rounded-lg flex gap-4 justify-between text-sm">
      AddPost
      {/*AVATAR*/}
      <Image
        src="https://genk.mediacdn.vn/k:2015/1-78918-47c60bff6263d078621b9e023c6616fe-1450690114301/lien-minh-huyen-thoai-faker-dang-kho-mau-tai-rank-han-quyet-doi-lai-vi-tri-top-1.jpg"
        alt="Profile picture"
        width={48}
        height={48}
        className="w-12 h-12 object-cover rounded-full"
      />
      {/*POST*/}
      <div className="flex-1">
        {/*TEXT INPUT*/}
        <div className="flex gap-4">
          <textarea
            placeholder="What's on your mind my fellow?"
            className="flex-1 bg-gray-100 rounded-lg p-2"
          ></textarea>
          <Image
            src="/emoji.png"
            alt=""
            width={20}
            height={20}
            className="w-5 h-5 cursor-pointer self-end"
          />
        </div>
        {/*POST OPTION*/}
        <div className="flex items-center gap-4 mt-4 text-gray-400 flex-wrap">
          <div className="flex items-center gap-2 cursor-pointer">
            <Image
              src="/addimage.png"
              alt=""
              width={20}
              height={20}
              className="w-5 h-5 cursor-pointer self-end"
            />
            Photo
            <Image
              src="/addVideo.png"
              alt=""
              width={20}
              height={20}
              className="w-5 h-5 cursor-pointer self-end"
            />
            Video
            <Image
              src="/poll.png"
              alt=""
              width={20}
              height={20}
              className="w-5 h-5 cursor-pointer self-end"
            />
            Polls
            <Image
              src="/events.png"
              alt=""
              width={20}
              height={20}
              className="w-5 h-5 cursor-pointer self-end"
            />
            Events
          </div>
        </div>
      </div>
      {/*AVATAR*/}
      <div className="class"></div>
    </div>
  );
};
export default AddPost;
