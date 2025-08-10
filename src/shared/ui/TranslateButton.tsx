import { useState, useRef, useEffect } from "react";
import { Languages } from "lucide-react";
import { useTranslate, supportedLanguages } from "@/shared/hooks/useTranslate";

type TranslateButtonProps = {
  text: string;
  onTranslated: (text: string) => void;
  onReset: () => void;
  isTranslated: boolean;
  className?: string;
  size?: "sm" | "md";
};

export default function TranslateButton({ 
  text, 
  onTranslated, 
  onReset, 
  isTranslated,
  className = "",
  size = "md"
}: TranslateButtonProps) {
  const { translateText, loading } = useTranslate();
  const [showLanguages, setShowLanguages] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Thiết lập kích thước biểu tượng dựa trên thuộc tính size
  const iconSize = size === "sm" ? "w-3 h-3" : "w-4 h-4";
  const textSize = size === "sm" ? "text-xs" : "text-sm";
  
  // Đóng dropdown khi nhấp chuột bên ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowLanguages(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleTranslate = async (languageCode: string) => {
    if (loading || !text) return;
    
    try {
      const translatedText = await translateText(text, languageCode);
      if (translatedText) {
        onTranslated(translatedText);
      }
    } catch (error) {
      console.error("Translation error:", error);
    } finally {
      setShowLanguages(false);
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={isTranslated ? onReset : () => setShowLanguages(!showLanguages)}
        disabled={loading}
        className={`flex items-center gap-1 ${textSize} font-medium 
          ${loading ? 'text-zinc-400 dark:text-zinc-500 cursor-not-allowed' : 
          'text-emerald-600 dark:text-emerald-500 hover:underline'} 
          focus:outline-none transition-colors`}
        aria-haspopup="true"
      >
        <Languages className={iconSize} />
        {loading 
          ? "Translating..." 
          : isTranslated 
            ? "Show original" 
            : "Translate"}
      </button>
      
      {showLanguages && !isTranslated && (
        <div className="absolute z-10 mt-1 w-40 rounded-md shadow-lg bg-white dark:bg-zinc-800 ring-1 ring-black ring-opacity-5 py-1 text-sm">
          {supportedLanguages.map((language) => (
            <button
              key={language.code}
              onClick={() => handleTranslate(language.code)}
              className="block px-4 py-2 w-full text-left hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
            >
              {language.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}


