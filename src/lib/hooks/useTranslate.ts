import { useState } from "react";

export interface SupportedLanguage {
  code: string;
  name: string;
}

export const supportedLanguages: SupportedLanguage[] = [
  { code: "vi", name: "Tiếng Việt" },
  { code: "en", name: "English" },
  { code: "fr", name: "Français" },
  { code: "de", name: "Deutsch" },
  { code: "es", name: "Español" },
  { code: "zh", name: "中文" },
  { code: "ja", name: "日本語" },
  { code: "ko", name: "한국어" },
  { code: "ru", name: "Русский" }
];

export function useTranslate() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const translateText = async (text: string, targetLanguage: string): Promise<string> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/ai/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text, targetLanguage }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to translate text");
      }
      
      const data = await response.json();
      return data.translatedText;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      return "";
    } finally {
      setLoading(false);
    }
  };
  
  return { translateText, loading, error, supportedLanguages };
} 