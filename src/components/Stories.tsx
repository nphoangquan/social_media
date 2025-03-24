"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { WheelEvent } from "react";

const Stories = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  
  // Add global event listener for wheel events when hovering
  useEffect(() => {
    const currentRef = scrollRef.current;
    
    const preventDefaultScroll = (e: WheelEvent<HTMLElement>) => {
      if (isHovering && currentRef) {
        e.preventDefault();
        currentRef.scrollLeft += e.deltaY;
      }
    };
    
    // Add the event listener with passive: false to allow preventDefault
    window.addEventListener('wheel', preventDefaultScroll as unknown as EventListener, { passive: false });
    
    return () => {
      window.removeEventListener('wheel', preventDefaultScroll as unknown as EventListener);
    };
  }, [isHovering]);

  return (
    <div
      ref={scrollRef}
      className="p-4 bg-white rounded-lg shadow-md overflow-x-auto text-xs scrollbar-hide"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      style={{ scrollBehavior: "smooth" }} // Thêm mượt mà trong CSS
    >
      <div className="flex gap-8 w-max">
        {/*STORY*/}
        <div className="flex flex-col items-center gap-2 cursor-pointer">
          <Image
            src="https://genk.mediacdn.vn/k:2015/1-78918-47c60bff6263d078621b9e023c6616fe-1450690114301/lien-minh-huyen-thoai-faker-dang-kho-mau-tai-rank-han-quyet-doi-lai-vi-tri-top-1.jpg"
            alt=""
            width={80}
            height={80}
            className="w-20 h-20 rounded-full ring-2"
          />
          <span className="font-medium">Blyat</span>
        </div>
        {/*STORY*/}
        <div className="flex flex-col items-center gap-2 cursor-pointer">
          <Image
            src="https://genk.mediacdn.vn/k:2015/1-78918-47c60bff6263d078621b9e023c6616fe-1450690114301/lien-minh-huyen-thoai-faker-dang-kho-mau-tai-rank-han-quyet-doi-lai-vi-tri-top-1.jpg"
            alt=""
            width={80}
            height={80}
            className="w-20 h-20 rounded-full ring-2"
          />
          <span className="font-medium">Blyat</span>
        </div>
        {/*STORY*/}
        <div className="flex flex-col items-center gap-2 cursor-pointer">
          <Image
            src="https://genk.mediacdn.vn/k:2015/1-78918-47c60bff6263d078621b9e023c6616fe-1450690114301/lien-minh-huyen-thoai-faker-dang-kho-mau-tai-rank-han-quyet-doi-lai-vi-tri-top-1.jpg"
            alt=""
            width={80}
            height={80}
            className="w-20 h-20 rounded-full ring-2"
          />
          <span className="font-medium">Blyat</span>
        </div>
        {/*STORY*/}
        <div className="flex flex-col items-center gap-2 cursor-pointer">
          <Image
            src="https://genk.mediacdn.vn/k:2015/1-78918-47c60bff6263d078621b9e023c6616fe-1450690114301/lien-minh-huyen-thoai-faker-dang-kho-mau-tai-rank-han-quyet-doi-lai-vi-tri-top-1.jpg"
            alt=""
            width={80}
            height={80}
            className="w-20 h-20 rounded-full ring-2"
          />
          <span className="font-medium">Blyat</span>
        </div>
        {/*STORY*/}
        <div className="flex flex-col items-center gap-2 cursor-pointer">
          <Image
            src="https://genk.mediacdn.vn/k:2015/1-78918-47c60bff6263d078621b9e023c6616fe-1450690114301/lien-minh-huyen-thoai-faker-dang-kho-mau-tai-rank-han-quyet-doi-lai-vi-tri-top-1.jpg"
            alt=""
            width={80}
            height={80}
            className="w-20 h-20 rounded-full ring-2"
          />
          <span className="font-medium">Blyat</span>
        </div>
        {/*STORY*/}
        <div className="flex flex-col items-center gap-2 cursor-pointer">
          <Image
            src="https://genk.mediacdn.vn/k:2015/1-78918-47c60bff6263d078621b9e023c6616fe-1450690114301/lien-minh-huyen-thoai-faker-dang-kho-mau-tai-rank-han-quyet-doi-lai-vi-tri-top-1.jpg"
            alt=""
            width={80}
            height={80}
            className="w-20 h-20 rounded-full ring-2"
          />
          <span className="font-medium">Blyat</span>
        </div>
        {/*STORY*/}
        <div className="flex flex-col items-center gap-2 cursor-pointer">
          <Image
            src="https://genk.mediacdn.vn/k:2015/1-78918-47c60bff6263d078621b9e023c6616fe-1450690114301/lien-minh-huyen-thoai-faker-dang-kho-mau-tai-rank-han-quyet-doi-lai-vi-tri-top-1.jpg"
            alt=""
            width={80}
            height={80}
            className="w-20 h-20 rounded-full ring-2"
          />
          <span className="font-medium">Blyat</span>
        </div>
        {/*STORY*/}
        <div className="flex flex-col items-center gap-2 cursor-pointer">
          <Image
            src="https://genk.mediacdn.vn/k:2015/1-78918-47c60bff6263d078621b9e023c6616fe-1450690114301/lien-minh-huyen-thoai-faker-dang-kho-mau-tai-rank-han-quyet-doi-lai-vi-tri-top-1.jpg"
            alt=""
            width={80}
            height={80}
            className="w-20 h-20 rounded-full ring-2"
          />
          <span className="font-medium">Blyat</span>
        </div>
        {/*STORY*/}
        <div className="flex flex-col items-center gap-2 cursor-pointer">
          <Image
            src="https://genk.mediacdn.vn/k:2015/1-78918-47c60bff6263d078621b9e023c6616fe-1450690114301/lien-minh-huyen-thoai-faker-dang-kho-mau-tai-rank-han-quyet-doi-lai-vi-tri-top-1.jpg"
            alt=""
            width={80}
            height={80}
            className="w-20 h-20 rounded-full ring-2"
          />
          <span className="font-medium">Blyat</span>
        </div>
      </div>
    </div>
  );
};

export default Stories;
