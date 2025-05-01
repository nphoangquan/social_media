import { MessageSquare } from "lucide-react";

export default function NoSelectedChat() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-4">
      <div className="bg-zinc-800/40 p-6 rounded-full mb-3">
        <MessageSquare className="w-16 h-16 text-emerald-500/60" />
      </div>
      <h2 className="text-xl font-semibold mb-2 text-white">Your Messages</h2>
      <p className="text-zinc-400 max-w-md">
        Select a conversation or start a new one to begin messaging
      </p>
    </div>
  );
} 