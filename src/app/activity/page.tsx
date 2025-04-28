import { getUserActivity } from "@/lib/actions/activity";
import ActivityLog from "@/components/activity/ActivityLog";
import LeftMenu from "@/components/leftMenu/LeftMenu";
import RightMenu from "@/components/rightMenu/RightMenu";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function ActivityPage() {
  const { userId } = await auth();
  
  if (!userId) {
    // Redirect to sign in if not authenticated
    redirect("/sign-in");
  }
  
  // Get user's activity (server component can directly call server action)
  const activities = await getUserActivity(1, 20);

  return (
    <div className="flex gap-6 pt-6">
      <div className="hidden xl:block w-[16%]">
        <LeftMenu type="home" />
      </div>
      <div className="w-full lg:w-[75%] xl:w-[62%]">
        <ActivityLog initialActivities={activities} />
      </div>
      <div className="hidden lg:block w-[26%]">
        <RightMenu />
      </div>
    </div>
  );
} 