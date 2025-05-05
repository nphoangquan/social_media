import { useState } from "react";

export function useSummarize() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateSummary = async (text: string): Promise<string> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/ai/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Không thể tạo bản tóm tắt");
      }
      
      const data = await response.json();
      return data.summary;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi không xác định");
      return "";
    } finally {
      setLoading(false);
    }
  };
  
  return { generateSummary, loading, error };
} 