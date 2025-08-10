import NotificationList from "./_components/NotificationList";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function NotificationsPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="flex flex-col w-full py-6">
      <div className="flex flex-col gap-6 mx-auto w-full max-w-3xl">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <NotificationList />
      </div>
    </div>
  );
} 