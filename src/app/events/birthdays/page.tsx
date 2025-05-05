"use client";

import { Cake, CalendarDays, Gift } from "lucide-react";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";

interface Friend {
  id: string;
  username: string;
  name?: string;
  surname?: string;
  avatar?: string;
  birthDate: string | Date;
  isBirthdayToday: boolean;
  daysUntilBirthday: number;
}

const BirthdaysPage = () => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
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
      // Giữ nút vô hiệu hóa để trải nghiệm người dùng tốt hơn
      setTimeout(() => {
        setCelebrating(prev => ({ ...prev, [friendId]: false }));
      }, 5000);
    }
  };

  // Nhóm sinh nhật theo tháng
  const groupedByMonth = friends.reduce((acc, friend) => {
    const birthDate = new Date(friend.birthDate);
    const month = birthDate.getMonth();
    
    if (!acc[month]) {
      acc[month] = [];
    }
    
    acc[month].push(friend);
    return acc;
  }, {} as Record<number, Friend[]>);

  // Tạo mảng các tháng với tên
  const months = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(2000, i, 1);
    return {
      index: i,
      name: format(date, 'MMMM'),
      friends: groupedByMonth[i] || []
    };
  });

  if (loading) {
    return (
      <div className="p-8 max-w-6xl mx-auto flex items-center justify-center min-h-[500px]">
        <div className="text-zinc-500 dark:text-zinc-400">Đang tải sinh nhật...</div>
      </div>
    );
  }

  if (friends.length === 0) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">Sinh Nhật</h1>
        <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <Cake className="w-12 h-12 text-zinc-400 dark:text-zinc-500" />
            <h2 className="text-xl text-zinc-800 dark:text-zinc-200">Không tìm thấy sinh nhật nào</h2>
            <p className="text-zinc-500 dark:text-zinc-400">
              Bạn bè của bạn chưa thêm ngày sinh nhật.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">Sinh Nhật</h1>
      
      {/* Sinh Nhật Hôm Nay */}
      {friends.some(friend => friend.isBirthdayToday) && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 mb-4 flex items-center gap-2">
            <Gift className="w-5 h-5 text-emerald-500" />
            Sinh Nhật Hôm Nay
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {friends
              .filter(friend => friend.isBirthdayToday)
              .map(friend => (
                <div 
                  key={friend.id}
                  className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-2xl shadow-lg p-4 flex items-center gap-4 border border-emerald-100 dark:border-emerald-900/30"
                >
                  <div className="relative w-16 h-16 rounded-full overflow-hidden ring-2 ring-emerald-400 dark:ring-emerald-600">
                    <Image
                      src={friend.avatar || "/noavatar.png"}
                      alt={friend.username}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-col">
                    <Link 
                      href={`/profile/${friend.username}`}
                      className="text-zinc-900 dark:text-zinc-100 font-semibold hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                    >
                      {friend.name || friend.username}
                    </Link>
                    <div className="flex items-center gap-1 text-sm text-emerald-600 dark:text-emerald-400">
                      <Cake className="w-4 h-4" />
                      <span>Sinh Nhật Hôm Nay!</span>
                    </div>
                    <button 
                      className={`mt-2 ${
                        celebrating[friend.id] 
                          ? "bg-emerald-200 dark:bg-emerald-800/50 text-emerald-700 dark:text-emerald-300" 
                          : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-800/50"
                      } p-2 text-xs rounded-xl transition-colors font-medium inline-flex w-fit`}
                      onClick={() => handleCelebrate(friend.id)}
                      disabled={celebrating[friend.id]}
                    >
                      {celebrating[friend.id] ? "Đã chúc mừng!" : "Chúc mừng"}
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
      
      {/* Sinh Nhật Sắp Tới */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 mb-4 flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
          Sinh Nhật Sắp Tới
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {friends
            .filter(friend => !friend.isBirthdayToday && friend.daysUntilBirthday <= 30)
            .slice(0, 6)
            .map(friend => {
              const birthDate = new Date(friend.birthDate);
              return (
                <div 
                  key={friend.id}
                  className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-2xl shadow-lg p-4 flex items-center gap-4"
                >
                  <div className="relative w-16 h-16 rounded-full overflow-hidden">
                    <Image
                      src={friend.avatar || "/noavatar.png"}
                      alt={friend.username}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-col">
                    <Link 
                      href={`/profile/${friend.username}`}
                      className="text-zinc-900 dark:text-zinc-100 font-semibold hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                    >
                      {friend.name || friend.username}
                    </Link>
                    <div className="flex items-center gap-1 text-sm text-zinc-500 dark:text-zinc-400">
                      <Cake className="w-4 h-4" />
                      <span>
                        {friend.daysUntilBirthday === 1 
                          ? 'Ngày mai' 
                          : `Còn ${friend.daysUntilBirthday} ngày`}
                      </span>
                    </div>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      {format(birthDate, 'MMMM d')}
                    </span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
      
      {/* Tất Cả Sinh Nhật Theo Tháng */}
      <div>
        <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 mb-4 flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
          Tất Cả Sinh Nhật
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {months.map(month => (
            <div 
              key={month.index}
              className={`bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden ${
                month.friends.length === 0 ? 'opacity-50' : ''
              }`}
            >
              <div className="bg-zinc-100 dark:bg-zinc-800 p-3 font-semibold text-zinc-800 dark:text-zinc-200">
                {month.name}
              </div>
              
              {month.friends.length > 0 ? (
                <div className="p-4 space-y-3">
                  {month.friends.map(friend => {
                    const birthDate = new Date(friend.birthDate);
                    return (
                      <div key={friend.id} className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-full overflow-hidden">
                          <Image
                            src={friend.avatar || "/noavatar.png"}
                            alt={friend.username}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex flex-col">
                          <Link 
                            href={`/profile/${friend.username}`}
                            className="text-zinc-900 dark:text-zinc-100 font-semibold hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-sm"
                          >
                            {friend.name || friend.username}
                          </Link>
                          <span className="text-xs text-zinc-500 dark:text-zinc-400">
                            {format(birthDate, 'MMMM d')}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 text-center text-zinc-500 dark:text-zinc-400 text-sm">
                  Không có sinh nhật nào
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BirthdaysPage; 