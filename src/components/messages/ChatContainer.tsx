"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { SendHorizontal, Image as ImageIcon, X, Loader2, AlertCircle, Trash2, Download, ChevronLeft, ChevronRight, Smile } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { io, Socket } from "socket.io-client";
import Image from "next/image";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";
import {
  Message,
  UserType,
  markChatAsRead,
  sendMessage,
  deleteMessage,
} from "@/lib/actions/messages";
import { uploadFile } from "@/lib/uploadMessages";
import ChatHeader from "./ChatHeader";

// Import emoji picker dynamically to avoid SSR issues
const EmojiPicker = dynamic(() => import("emoji-picker-react"), { 
  ssr: false,
  loading: () => <div className="p-2">Loading...</div>
});

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

// Define types for API responses
interface MessagesResponse {
  messages: Message[];
  hasMore: boolean;
  totalCount: number;
}

export default function ChatContainer({ chatId, userId }: ChatContainerProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [otherUser, setOtherUser] = useState<UserType | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deletingMessage, setDeletingMessage] = useState<number | null>(null);
  const [messageToDelete, setMessageToDelete] = useState<number | null>(null);
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesStartRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollHeightRef = useRef<number>(0);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  // Set mounted state for client-side portals
  useEffect(() => {
    setIsMounted(true);
    
    // Handle clicks outside emoji picker
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && 
          !emojiPickerRef.current.contains(event.target as Node) && 
          showEmojiPicker) {
        setShowEmojiPicker(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      setIsMounted(false);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

  // Load more messages with useCallback
  const loadMoreMessages = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    
    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      
      const response = await fetch(`/api/messages/${chatId}?page=${nextPage}&limit=15`);
      if (!response.ok) throw new Error("Failed to fetch more messages");
      
      const data = await response.json() as MessagesResponse;
      
      // Prepend older messages to the beginning
      setMessages(prev => [...data.messages, ...prev]);
      setHasMore(data.hasMore);
      setPage(nextPage);
    } catch (error) {
      console.error("Error loading more messages:", error);
      setErrorMessage("Failed to load more messages. Please try again.");
    } finally {
      setLoadingMore(false);
    }
  }, [chatId, hasMore, loadingMore, page]);

  // Load initial messages and set up realtime updates
  useEffect(() => {
    const loadMessages = async () => {
      try {
        setLoading(true);
        
        const response = await fetch(`/api/messages/${chatId}?page=0&limit=15`);
        if (!response.ok) throw new Error("Failed to fetch messages");
        
        const data = await response.json() as MessagesResponse;
        setMessages(data.messages);
        setHasMore(data.hasMore);
        setPage(0);

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

  // Set up infinite scroll observer
  useEffect(() => {
    if (loading || !hasMore) return;

    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loadingMore) {
        loadMoreMessages();
      }
    }, options);
    
    observerRef.current = observer;
    
    if (messagesStartRef.current) {
      observer.observe(messagesStartRef.current);
    }
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, loading, loadingMore, page, loadMoreMessages]);

  // Save scroll position before loading more messages
  useEffect(() => {
    if (messagesContainerRef.current) {
      scrollHeightRef.current = messagesContainerRef.current.scrollHeight;
    }
  }, [loadingMore]);

  // Restore scroll position after loading more messages
  useEffect(() => {
    if (loadingMore && messagesContainerRef.current) {
      const newScrollHeight = messagesContainerRef.current.scrollHeight;
      const scrollDiff = newScrollHeight - scrollHeightRef.current;
      messagesContainerRef.current.scrollTop = scrollDiff > 0 ? scrollDiff : 0;
    }
  }, [messages, loadingMore]);

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
    // Only auto-scroll if we're near the bottom already
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      
      if (isNearBottom && messagesEndRef.current && !loadingMore) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [messages, loadingMore]);

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
      const response = await fetch(`/api/messages/${chatId}?page=0&limit=15`);
      if (response.ok) {
        const data = await response.json() as MessagesResponse;
        setMessages(data.messages);
        setHasMore(data.hasMore);
        setPage(0);
      }
    } finally {
      setDeletingMessage(null);
    }
  };

  const handleOpenImage = (imageUrl: string) => {
    setViewingImage(imageUrl);
    // Find index of current image in filtered image messages array
    const imageMessages = messages.filter(msg => msg.img);
    const index = imageMessages.findIndex(msg => msg.img === imageUrl);
    setCurrentImageIndex(index !== -1 ? index : 0);
    // Prevent scrolling when modal is open
    document.body.style.overflow = 'hidden';
  };

  const handleCloseImage = () => {
    setViewingImage(null);
    // Restore scrolling
    document.body.style.overflow = '';
  };

  const handlePreviousImage = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const imageMessages = messages.filter(msg => msg.img);
    if (imageMessages.length <= 1) return;
    
    const newIndex = (currentImageIndex - 1 + imageMessages.length) % imageMessages.length;
    setCurrentImageIndex(newIndex);
    setViewingImage(imageMessages[newIndex].img || null);
  }, [messages, currentImageIndex]);

  const handleNextImage = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const imageMessages = messages.filter(msg => msg.img);
    if (imageMessages.length <= 1) return;
    
    const newIndex = (currentImageIndex + 1) % imageMessages.length;
    setCurrentImageIndex(newIndex);
    setViewingImage(imageMessages[newIndex].img || null);
  }, [messages, currentImageIndex]);

  // Handle keyboard navigation for image viewer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!viewingImage) return;
      
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePreviousImage(e as unknown as React.MouseEvent);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNextImage(e as unknown as React.MouseEvent);
      } else if (e.key === 'Escape') {
        handleCloseImage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [viewingImage, currentImageIndex, messages, handlePreviousImage, handleNextImage]);

  // Handle emoji selection
  const handleEmojiClick = (emojiData: { emoji: string }) => {
    const emoji = emojiData.emoji;
    setNewMessage(prevMessage => prevMessage + emoji);
    setShowEmojiPicker(false);
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

      {/* Image viewer modal - Using Portal to render at root level */}
      {isMounted && viewingImage && createPortal(
        <div className="fixed inset-0 bg-black/95 z-[9999] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-zinc-900/60 backdrop-blur-sm">
            <button 
              onClick={handleCloseImage}
              className="p-2 text-white rounded-full hover:bg-zinc-800"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex gap-2">
              <a 
                href={viewingImage} 
                download
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 text-white rounded-full hover:bg-zinc-800"
                title="Download"
              >
                <Download className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          {/* Image container with navigation arrows */}
          <div className="flex-1 flex items-center justify-center overflow-hidden" onClick={handleCloseImage}>
            {/* Previous button */}
            {messages.filter(msg => msg.img).length > 1 && (
              <button 
                onClick={handlePreviousImage}
                className="absolute left-4 p-3 bg-zinc-800/50 hover:bg-zinc-700/70 rounded-full text-white backdrop-blur-sm transition-all hover:scale-110 z-10"
                title="Previous image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}
            
            {/* Main image */}
            <div className="relative max-h-screen max-w-full cursor-zoom-out">
              <Image 
                src={viewingImage} 
                alt="Image viewer" 
                className="object-contain"
                width={1920} 
                height={1080} 
                loading="eager"
                priority
                quality={100}
              />
            </div>
            
            {/* Next button */}
            {messages.filter(msg => msg.img).length > 1 && (
              <button 
                onClick={handleNextImage}
                className="absolute right-4 p-3 bg-zinc-800/50 hover:bg-zinc-700/70 rounded-full text-white backdrop-blur-sm transition-all hover:scale-110 z-10"
                title="Next image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>
          
          {/* Thumbnails at bottom */}
          <div className="bg-zinc-900/60 backdrop-blur-sm p-2 overflow-x-auto flex gap-2">
            {messages
              .filter(msg => msg.img)
              .map((msg, index) => (
                <div 
                  key={`thumb-${msg.id}`} 
                  className={`cursor-pointer rounded-md overflow-hidden shrink-0 w-16 h-16 border-2 ${viewingImage === msg.img ? 'border-emerald-500' : 'border-transparent'}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (msg.img) {
                      setViewingImage(msg.img);
                      setCurrentImageIndex(index);
                    }
                  }}
                >
                  <Image 
                    src={msg.img || ''} 
                    alt="Thumbnail" 
                    width={64} 
                    height={64} 
                    className="object-cover w-full h-full"
                  />
                </div>
              ))
            }
          </div>
        </div>,
        document.body
      )}

      {/* Messages container */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <p className="text-zinc-500 mb-2">No messages</p>
            <p className="text-zinc-600 text-2xl max-w-xs">
              Gửi tin nhắn đi bro, sợ gì?
            </p>
          </div>
        ) : (
          <>
            {/* "Load More" section at the top */}
            <div ref={messagesStartRef} className="h-1" />
            
            {loadingMore && (
              <div className="flex justify-center py-2">
                <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
              </div>
            )}
          
            {messages.map((message) => {
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
                      <div 
                        className="rounded-lg overflow-hidden shadow-lg cursor-pointer"
                        onClick={() => message.img && handleOpenImage(message.img)}
                      >
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
                      className={`group relative max-w-[70%] p-3 rounded-lg shadow-md ${
                        message.senderId === userId
                          ? "bg-gradient-to-br from-emerald-400 to-emerald-500 text-white shadow-emerald-900/20"
                          : "bg-zinc-800 text-white shadow-zinc-950/50"
                      }`}
                    >
                      {message.img && (
                        <div 
                          className="mb-2 rounded-lg overflow-hidden cursor-pointer"
                          onClick={() => handleOpenImage(message.img || '')}
                        >
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
            })}
            <div ref={messagesEndRef} />
          </>
        )}
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
        <form onSubmit={handleSubmit} className="flex flex-col gap-2 relative">
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
            
            {/* Emoji Button */}
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              disabled={submitting}
              className="p-2 text-zinc-400 hover:text-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Add emoji"
            >
              <Smile className="w-5 h-5" />
            </button>
            
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
          
          {/* Emoji Picker */}
          {showEmojiPicker && isMounted && (
            <div 
              ref={emojiPickerRef}
              className="absolute bottom-16 left-4 z-50 shadow-lg"
            >
              <EmojiPicker
                onEmojiClick={handleEmojiClick}
                lazyLoadEmojis={true}
                searchDisabled={false}
                skinTonesDisabled
              />
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
