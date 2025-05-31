'use client';

import { useState } from 'react';
import { Plus, Search, X, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { startNewChat, UserSearchResult } from '@/lib/actions/messages';
import Image from 'next/image';
interface NewChatDialogProps {
  userId: string;
}

export default function NewChatDialog({ userId }: NewChatDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/users/search?query=${encodeURIComponent(searchTerm)}`);
      const data = await response.json();
      
      // Lọc ra người dùng khác
      const filteredResults = data.filter((user: UserSearchResult) => user.id !== userId);
      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Error searching for users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartChat = async (selectedUserId: string) => {
    try {
      setIsLoading(true);
      const chatId = await startNewChat(userId, selectedUserId);
      setIsOpen(false);
      router.push(`/messages/${chatId}`);
    } catch (error) {
      console.error('Error starting chat:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 rounded-full hover:bg-zinc-800/50 transition-colors relative group"
        title="New message"
      >
        <div className="relative">
          <Plus className="w-5 h-5 text-white transition-opacity duration-200" />
          <Plus className="w-5 h-5 absolute inset-0 text-transparent bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        </div>
        
        {/* Hover highlight với shimmer */}
        <div className="absolute inset-0 bg-emerald-500/10 opacity-0 rounded-full group-hover:opacity-100 overflow-hidden transition-opacity duration-200 -z-10">
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-emerald-100/20 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
        </div>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 rounded-lg shadow-lg w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
              <h3 className="text-lg font-medium">Tạo cuộc trò chuyện mới</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full hover:bg-zinc-800 transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Tìm kiếm bạn bè..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full p-2 pl-9 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                  <Search className="w-4 h-4 absolute left-2.5 top-3 text-zinc-500" />
                </div>
                <button
                  onClick={handleSearch}
                  disabled={isLoading}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Tìm kiếm
                </button>
              </div>
              
              <div className="max-h-64 overflow-y-auto">
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="space-y-2">
                    {searchResults.map((user) => (
                      <div 
                        key={user.id}
                        className="flex items-center gap-3 p-2 hover:bg-zinc-800 rounded-lg cursor-pointer transition-colors"
                        onClick={() => handleStartChat(user.id)}
                      >
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-zinc-800 flex-shrink-0">
                          {user.avatar && (
                            <Image
                              src={user.avatar} 
                              alt={user.username}
                              className="w-full h-full object-cover"
                              width={48}
                              height={48}
                            />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium">{user.name || user.username}</h4>
                          <p className="text-sm text-zinc-400">@{user.username}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : searchTerm ? (
                  <p className="text-center py-4 text-zinc-500">No users found - Không tìm thấy người dùng nào!</p>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 