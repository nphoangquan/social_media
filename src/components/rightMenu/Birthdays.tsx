"use client";

import Image from "next/image";
import { Gift, MoreVertical, Cake } from "lucide-react";
import { useEffect, useState } from "react";
import { User } from "@prisma/client";
import { useRouter } from "next/navigation";

interface FriendWithBirthday extends User {
  isBirthdayToday: boolean;
}

const Birthdays = () => {
  const [friends, setFriends] = useState<FriendWithBirthday[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [celebrating, setCelebrating] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const res = await fetch("/api/birthdays");
        const data = await res.json();
        setFriends(data);
      } catch (error) {
        console.error("Error fetching birthdays:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, []);

  const handleSeeAllClick = () => {
    router.push("/events/birthdays");
  };

  const handleCelebrate = async (friendId: string) => {
    if (celebrating[friendId]) return;
    
    setCelebrating(prev => ({ ...prev, [friendId]: true }));
    
    try {
      await fetch("/api/birthdays/celebrate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ receiverId: friendId }),
      });
    } catch (error) {
      console.error("Error celebrating birthday:", error);
    } finally {
      // Keep the button disabled for better UX
      setTimeout(() => {
        setCelebrating(prev => ({ ...prev, [friendId]: false }));
      }, 5000);
    }
  };

  const todayBirthdays = friends.filter(friend => friend.isBirthdayToday);
  const upcomingBirthdaysCount = friends.length - todayBirthdays.length;

  if (loading) {
    return (
      <div className="p-6 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-2xl shadow-lg dark:shadow-zinc-800/20 text-sm border border-zinc-100/50 dark:border-zinc-800/50 min-h-[200px] flex items-center justify-center">
        <span className="text-zinc-500 dark:text-zinc-400">Loading birthdays...</span>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-2xl shadow-lg dark:shadow-zinc-800/20 text-sm border border-zinc-100/50 dark:border-zinc-800/50 hover:shadow-xl dark:hover:shadow-zinc-800/30 transition-all duration-300">
      {/* TOP */}
      <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 font-medium mb-5">
        <span className="text-xs uppercase tracking-wider font-semibold">Birthdays</span>
        <MoreVertical className="w-4 h-4 cursor-pointer hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors" />
      </div>

      {/* BOTTOM */}
      <div className="flex flex-col gap-5">
        {/* TODAY'S BIRTHDAYS */}
        {todayBirthdays.length > 0 ? (
          todayBirthdays.map((friend) => (
            <div key={friend.id} className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-white dark:ring-zinc-900 shadow-md">
                <Image
                  src={friend.avatar || "/noavatar.png"}
                  alt={friend.username}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col flex-1">
                <span className="text-zinc-900 dark:text-zinc-100 font-medium hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer transition-colors">
                  {friend.name || friend.username}
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                  <Cake className="w-3 h-3" /> Today
                </span>
              </div>
              <button 
                className={`${
                  celebrating[friend.id] 
                    ? "bg-emerald-100 dark:bg-emerald-800/20 text-emerald-600 dark:text-emerald-300" 
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-emerald-100 dark:hover:bg-emerald-800/20 hover:text-emerald-600 dark:hover:text-emerald-300"
                } p-2 text-xs rounded-xl transition-colors font-medium shadow-sm hover:shadow-md`}
                onClick={() => handleCelebrate(friend.id)}
                disabled={celebrating[friend.id]}
              >
                {celebrating[friend.id] ? "Celebrated!" : "Celebrate"}
              </button>
            </div>
          ))
        ) : (
          <div className="text-center py-2 text-zinc-500 dark:text-zinc-400">
            No birthdays today
          </div>
        )}
        
        {/* UPCOMING */}
        <div 
          className="bg-zinc-100/80 dark:bg-zinc-800/50 rounded-xl p-4 flex items-center gap-3 group hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all cursor-pointer"
          onClick={handleSeeAllClick}
        >
          <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <Gift className="w-5 h-5 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-zinc-800 dark:text-zinc-200 font-medium group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              Upcoming Birthdays
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {upcomingBirthdaysCount} friend{upcomingBirthdaysCount !== 1 ? 's' : ''} with upcoming birthdays
            </span>
          </div>
        </div>
        
        <button 
          className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 p-3 text-xs rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-800/20 hover:text-emerald-600 dark:hover:text-emerald-300 transition-colors font-medium w-full shadow-sm hover:shadow-md"
          onClick={handleSeeAllClick}
        >
          See all birthdays
        </button>
      </div>
    </div>
  );
};

export default Birthdays;
