import AddPost from "@/components/AddPost";
import Stories from "@/components/Stories";
import Feed from "@/components/feed/Feed";
import LeftMenu from "@/components/leftMenu/LeftMenu";
import RightMenu from "@/components/rightMenu/RightMenu";

const Homepage = () => {
  return (
    <div className="flex gap-10 pt-6">
      <div className="hidden xl:block w-[16%]">
        <LeftMenu type="home"/>
      </div>
      <div className="w-full lg:w-[75%] xl:w-[62%]">
        <div className="flex flex-col gap-4">
          <Stories />
          <AddPost />
          <Feed />
        </div>
      </div>
      <div className="hidden lg:block w-[22%]">
        <RightMenu />
      </div>
    </div>
  );
};

export default Homepage;