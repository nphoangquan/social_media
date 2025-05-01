"use client";

import { useEffect, useRef, useState } from "react";
import { SendHorizontal } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { io, Socket } from "socket.io-client";
import Image from "next/image";
import {
  Message,
  UserType,
  getChatMessages,
  markChatAsRead,
  sendMessage,
} from "@/lib/actions/messages";
import ChatHeader from "./ChatHeader";

interface ChatContainerProps {
  chatId: number;
  userId: string;
}

interface MessageEvent {
  chatId: number;
  message: Message;
}

export default function ChatContainer({ chatId, userId }: ChatContainerProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [otherUser, setOtherUser] = useState<UserType | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  // Load initial messages and set up realtime updates
  useEffect(() => {
    const loadMessages = async () => {
      try {
        setLoading(true);
        const data = await getChatMessages(chatId);
        setMessages(data);

        // Mark chat as read when opened
        await markChatAsRead(chatId);
      } catch (error) {
        console.error("Error loading messages:", error);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();

    // Set up socket connection
    if (!socketRef.current) {
      socketRef.current = io(window.location.origin, {
        path: "/api/socket",
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });
    }

    const socket = socketRef.current;

    if (!socket.connected) {
      socket.connect();
    }

    // Join the user's room to receive messages
    socket.emit("join", userId);

    // Listen for new messages
    const handleNewMessage = (data: MessageEvent) => {
      if (data.chatId === chatId) {
        setMessages((prev) => [...prev, data.message]);
        markChatAsRead(chatId);
      }
    };

    // Handle reconnection
    const handleReconnect = () => {
      console.log("Socket reconnected");
      socket.emit("join", userId);
    };

    socket.on("connect", handleReconnect);
    socket.on("new_message", handleNewMessage);

    return () => {
      socket.off("new_message", handleNewMessage);
      socket.off("connect", handleReconnect);
    };
  }, [chatId, userId]);

  // Fetch other user info
  useEffect(() => {
    const fetchChatInfo = async () => {
      try {
        const response = await fetch(`/api/messages/info?chatId=${chatId}`);
        if (!response.ok) throw new Error("Failed to fetch chat info");

        const data = await response.json();
        if (data.participants) {
          const other = data.participants.find(
            (p: { user: UserType }) => p.user.id !== userId
          );
          setOtherUser(other?.user || null);
        }
      } catch (error) {
        console.error("Error loading chat info:", error);
      }
    };

    fetchChatInfo();
  }, [chatId, userId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage || newMessage.trim() === "") return;

    try {
      setSubmitting(true);
      const messageText = newMessage;

      // Create a temporary message for immediate display (optimistic update)
      const tempId = Date.now(); // Temporary ID
      const optimisticMessage = {
        id: tempId,
        content: messageText,
        img: null,
        createdAt: new Date(),
        senderId: userId,
      };

      // Add optimistic message to UI immediately
      setMessages((prev) => [...prev, optimisticMessage]);

      // Clear input field right away for better UX
      setNewMessage("");

      // Send the message
      const sentMessage = await sendMessage(chatId, messageText);

      // Replace the temporary message with the real one from the server
      if (sentMessage) {
        setMessages((prev) =>
          prev.map((msg) => (msg.id === tempId ? sentMessage : msg))
        );
      }
    } catch (error) {
      console.error("Error sending message:", error);
      // Remove the optimistic message if there was an error
      setMessages((prev) => prev.filter((msg) => typeof msg.id === "number"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Chat header */}
      <ChatHeader user={otherUser} />

      {/* Messages container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <p className="text-zinc-500 mb-2">No messages yet</p>
            <p className="text-zinc-600 text-sm max-w-xs">
              Send a message to start the conversation
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.senderId === userId ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[70%] p-3 rounded-lg ${
                  message.senderId === userId
                    ? "bg-gradient-to-br from-emerald-400 to-emerald-500 text-white"
                    : "bg-zinc-800 text-white"
                }`}
              >
                {message.img && (
                  <div className="mb-2 rounded-lg overflow-hidden">
                    <Image
                      src={message.img}
                      alt="Message attachment"
                      className="max-w-full h-auto"
                      width={300}
                      height={300}
                    />
                  </div>
                )}

                {message.content && <p>{message.content}</p>}

                <div
                  className={`text-xs mt-1 ${
                    message.senderId === userId
                      ? "text-white/80"
                      : "text-zinc-400"
                  }`}
                >
                  {formatDistanceToNow(new Date(message.createdAt), {
                    addSuffix: true,
                  })}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <div className="p-4 border-t border-zinc-800">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-zinc-800 text-white rounded-full px-4 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />

          <button
            type="submit"
            disabled={submitting || !newMessage.trim()}
            className="p-2 bg-emerald-500 hover:bg-emerald-600 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Send message"
          >
            <SendHorizontal className="w-5 h-5 text-white" />
          </button>
        </form>
      </div>
    </div>
  );
}
