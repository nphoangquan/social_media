"use client";

import { useEffect, useRef, useState } from "react";
import { SendHorizontal, Image as ImageIcon, X, Loader2, AlertCircle, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { io, Socket } from "socket.io-client";
import Image from "next/image";
import {
  Message,
  UserType,
  getChatMessages,
  markChatAsRead,
  sendMessage,
  deleteMessage,
} from "@/lib/actions/messages";
import { uploadFile } from "@/lib/uploadMessages";
import ChatHeader from "./ChatHeader";

interface ChatContainerProps {
  chatId: number;
  userId: string;
}

interface MessageEvent {
  chatId: number;
  message: Message;
}

interface DeleteMessageEvent {
  chatId: number;
  messageId: number;
}

export default function ChatContainer({ chatId, userId }: ChatContainerProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [otherUser, setOtherUser] = useState<UserType | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deletingMessage, setDeletingMessage] = useState<number | null>(null);
  const [messageToDelete, setMessageToDelete] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        setErrorMessage("Failed to load messages. Please try refreshing the page.");
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

    // Listen for deleted messages
    const handleDeletedMessage = (data: DeleteMessageEvent) => {
      if (data.chatId === chatId) {
        setMessages((prev) => prev.filter((msg) => msg.id !== data.messageId));
      }
    };

    // Handle reconnection
    const handleReconnect = () => {
      console.log("Socket reconnected");
      socket.emit("join", userId);
    };

    socket.on("connect", handleReconnect);
    socket.on("new_message", handleNewMessage);
    socket.on("message_deleted", handleDeletedMessage);

    return () => {
      socket.off("new_message", handleNewMessage);
      socket.off("message_deleted", handleDeletedMessage);
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Clear any previous error
      setErrorMessage(null);
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        setErrorMessage('Please select an image file');
        return;
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage('Image size should not exceed 5MB');
        return;
      }
      
      setSelectedImage(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCancelImage = () => {
    setSelectedImage(null);
    setImagePreviewUrl(null);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleOpenImagePicker = () => {
    fileInputRef.current?.click();
  };

  const handleCloseError = () => {
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if ((!newMessage || newMessage.trim() === "") && !selectedImage) return;

    try {
      setSubmitting(true);
      setErrorMessage(null);
      const messageText = newMessage;
      let imageUrl = null;
      
      // Create a temporary message for immediate display (optimistic update)
      const tempId = Date.now(); // Temporary ID
      
      if (selectedImage) {
        setUploadingImage(true);
        
        // Add optimistic message with image preview right away
        const optimisticMessage = {
          id: tempId,
          content: messageText || "",
          img: imagePreviewUrl,
          createdAt: new Date(),
          senderId: userId,
        };
        
        // Add optimistic message to UI immediately
        setMessages((prev) => [...prev, optimisticMessage]);
        
        // Clear input fields for better UX
        setNewMessage("");
        
        try {
          // Upload the image to Cloudinary
          const uploadResult = await uploadFile(selectedImage);
          imageUrl = uploadResult.url;
        } catch (error) {
          console.error("Error uploading image:", error);
          // Remove the optimistic message if upload failed
          setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
          setErrorMessage("Failed to upload image. Please try again with a smaller image or check your internet connection.");
          setUploadingImage(false);
          return;
        } finally {
          setUploadingImage(false);
        }
      } else {
        // Text-only message
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
      }

      // Send the message
      const sentMessage = await sendMessage(chatId, messageText || "", imageUrl || undefined);

      // Replace the temporary message with the real one from the server
      if (sentMessage) {
        setMessages((prev) =>
          prev.map((msg) => (msg.id === tempId ? sentMessage : msg))
        );
      }
      
      // Clear image selection
      setSelectedImage(null);
      setImagePreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
    } catch (error) {
      console.error("Error sending message:", error);
      // Remove the optimistic message if there was an error
      setMessages((prev) => prev.filter((msg) => typeof msg.id === "number"));
      setErrorMessage("Failed to send message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = (messageId: number) => {
    setMessageToDelete(messageId);
  };

  const handleDeleteCancel = () => {
    setMessageToDelete(null);
  };

  const handleDeleteMessage = async (messageId: number) => {
    try {
      setDeletingMessage(messageId);
      setMessageToDelete(null);
      
      // Optimistic update: remove the message from UI first
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
      
      // Call the API to delete the message
      await deleteMessage(messageId);
      
      // No need to update the messages again as we already did it optimistically
    } catch (error) {
      console.error("Error deleting message:", error);
      setErrorMessage("Failed to delete message. Please try again.");
      
      // Restore the message if delete failed
      const data = await getChatMessages(chatId);
      setMessages(data);
    } finally {
      setDeletingMessage(null);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Chat header */}
      <ChatHeader user={otherUser} />

      {/* Error message */}
      {errorMessage && (
        <div className="mx-4 mt-2 p-3 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <p className="text-sm text-white">{errorMessage}</p>
          </div>
          <button 
            onClick={handleCloseError}
            className="text-white/80 hover:text-white"
            title="Close error message"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Delete confirmation dialog */}
      {messageToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-zinc-900 rounded-lg p-5 max-w-sm w-full mx-4 shadow-xl animate-scaleIn">
            <h3 className="text-lg font-medium text-white mb-2">Delete Message</h3>
            <p className="text-zinc-300 mb-4">Are you sure you want to delete this message? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={handleDeleteCancel}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteMessage(messageToDelete)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors flex items-center gap-2"
              >
                {deletingMessage === messageToDelete && <Loader2 className="w-4 h-4 animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

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
          messages.map((message) => {
            // Check if message contains only an image without text
            const isImageOnlyMessage = message.img && (!message.content || message.content.trim() === "");
            
            return (
              <div
                key={message.id}
                className={`group flex items-start gap-2 ${
                  message.senderId === userId ? "justify-end" : "justify-start"
                }`}
              >
                {/* Delete button - only shown for user's own messages on hover */}
                {message.senderId === userId && (
                  <div className="order-first flex items-start mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={() => handleDeleteConfirm(message.id)}
                      disabled={deletingMessage === message.id}
                      className="p-1.5 bg-zinc-800/90 hover:bg-zinc-700 rounded-full text-zinc-400 hover:text-red-500 transition-colors shadow-md"
                      title="Delete message"
                    >
                      {deletingMessage === message.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                )}
                
                {isImageOnlyMessage ? (
                  // Image-only message - Facebook style
                  <div className={`group-hover:opacity-90 transition-opacity relative flex flex-col ${message.senderId === userId ? "items-end" : "items-start"}`}>
                    <div className="rounded-lg overflow-hidden">
                      <Image
                        src={message.img || ''}
                        alt="Image message"
                        className="max-w-[320px] w-auto h-auto rounded-lg"
                        width={400}
                        height={400}
                      />
                    </div>
                    <div
                      className={`text-xs mt-1 ${
                        message.senderId === userId
                          ? "text-zinc-400"
                          : "text-zinc-500"
                      }`}
                    >
                      {formatDistanceToNow(new Date(message.createdAt), {
                        addSuffix: true,
                      })}
                    </div>
                  </div>
                ) : (
                  // Text message or text+image message
                  <div
                    className={`group relative max-w-[70%] p-3 rounded-lg ${
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
                          className="max-w-full h-auto rounded-lg"
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
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Image preview */}
      {imagePreviewUrl && (
        <div className="px-4 pt-2">
          <div className="relative inline-block">
            <div className="relative border border-zinc-700 rounded-lg overflow-hidden mb-2">
              <Image
                src={imagePreviewUrl}
                alt="Selected image"
                width={200}
                height={200}
                className="object-contain max-h-48"
              />
              <button
                type="button"
                onClick={handleCancelImage}
                className="absolute top-2 right-2 p-1.5 bg-zinc-800/80 hover:bg-zinc-700 rounded-full text-white shadow-md"
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Message input */}
      <div className="p-4 border-t border-zinc-800">
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              disabled={submitting}
              className="flex-1 bg-zinc-800 text-white rounded-full px-4 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-70"
            />
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
            />
            
            <button
              type="button"
              onClick={handleOpenImagePicker}
              disabled={submitting || uploadingImage}
              className="p-2 text-zinc-400 hover:text-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Attach image"
            >
              <ImageIcon className="w-5 h-5" />
            </button>

            <button
              type="submit"
              disabled={submitting || ((!newMessage.trim()) && !selectedImage) || uploadingImage}
              className="p-2 bg-emerald-500 hover:bg-emerald-600 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Send message"
            >
              {uploadingImage ? (
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              ) : (
                <SendHorizontal className="w-5 h-5 text-white" />
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
