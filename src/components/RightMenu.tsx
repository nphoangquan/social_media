import Birthdays from "./Birthdays";
import Ad from "./Ad";
import FriendRequests from "./FriendRequests";
// import { Suspense } from "react";
const RightMenu = () => {
  return (
    <div className="flex flex-col gap-6">
      <FriendRequests />
      <Birthdays />
      <Ad />
    </div>
  );
};
export default RightMenu;
