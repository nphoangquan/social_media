"use client";

import { useState, useRef, useEffect } from "react";
import { Copy, X, Check } from "lucide-react";

interface ShareModalProps {
  postId: number;
  onClose: () => void;
}

export default function ShareModal({ postId, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Create the share URL - will work with any domain, not just localhost
  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/post/${postId}`
    : '';

  // Handle click outside to close the modal
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        const target = event.target as HTMLElement;
        if (!target.closest('[data-modal-content]')) {
          onClose();
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // Select all text when the input is focused
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  // Handle copy to clipboard
  const handleCopy = () => {
    if (inputRef.current) {
      inputRef.current.select();
      navigator.clipboard.writeText(shareUrl).then(() => {
        setCopied(true);
        
        // Reset copied state after 2 seconds
        setTimeout(() => {
          setCopied(false);
        }, 2000);
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        data-modal-content
        className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg max-w-md w-full p-6 animate-fade-in"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
            Share Post
          </h2>
          <button 
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
            title="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="mb-5">
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
            Copy this link to share the post with your friends:
          </p>
          
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={shareUrl}
              readOnly
              className="w-full pr-12 pl-4 py-3 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-800 dark:text-zinc-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
            />
            
            <button
              onClick={handleCopy}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-emerald-500 dark:text-zinc-400 dark:hover:text-emerald-400 transition-colors p-1"
              title="Copy to clipboard"
            >
              {copied ? (
                <Check className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
              ) : (
                <Copy className="w-5 h-5" />
              )}
            </button>
          </div>
          
          {copied && (
            <p className="text-xs text-emerald-500 dark:text-emerald-400 mt-2 animate-fade-in">
              Link copied to clipboard!
            </p>
          )}
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium rounded-lg transition-colors"
            title="Close"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}


