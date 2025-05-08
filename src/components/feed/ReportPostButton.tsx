"use client";

import { useState, useEffect } from "react";
import { createReport } from "@/lib/actions/admin";
import { Flag, X, AlertCircle, Check } from "lucide-react";

interface ReportPostButtonProps {
  postId: number;
  variant?: "default" | "compact";
  isModalOpen?: boolean;
  onModalClose?: () => void;
}

const ReportPostButton = ({ 
  postId, 
  variant = "default", 
  isModalOpen: externalModalOpen, 
  onModalClose 
}: ReportPostButtonProps) => {
  const [internalModalOpen, setInternalModalOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isConfirmStep, setIsConfirmStep] = useState(false);
  
  // Determine if modal should be open based on internal or external control
  const isModalOpen = externalModalOpen !== undefined ? externalModalOpen : internalModalOpen;

  // Sync external modal state changes
  useEffect(() => {
    if (externalModalOpen === false) {
      // Reset state when external controller closes the modal
      setReason("");
      setDescription("");
      setMessage(null);
      setIsConfirmStep(false);
    }
  }, [externalModalOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reason) {
      setMessage({ type: "error", text: "Vui lòng chọn lý do báo cáo" });
      return;
    }
    
    setIsSubmitting(true);
    setMessage(null);
    
    try {
      const { success, error } = await createReport("POST", postId, reason, description);
      
      if (success) {
        setMessage({ type: "success", text: "Báo cáo đã được gửi. Chúng tôi sẽ xem xét nội dung này sớm nhất có thể." });
        setReason("");
        setDescription("");
        setIsConfirmStep(true);
      } else {
        setMessage({ type: "error", text: error || "Không thể gửi báo cáo. Vui lòng thử lại sau." });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Có lỗi xảy ra khi gửi báo cáo" });
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetModal = () => {
    if (onModalClose) {
      // If externally controlled, call the provided close handler
      onModalClose();
    } else {
      // Otherwise use internal state
      setInternalModalOpen(false);
    }
    
    // Reset form state
    setReason("");
    setDescription("");
    setMessage(null);
    setIsConfirmStep(false);
  };

  const reportReasons = [
    { id: "inappropriate_content", label: "Nội dung không phù hợp", description: "Khiêu dâm, bạo lực, hoặc nội dung gây sốc" },
    { id: "spam", label: "Spam", description: "Quảng cáo, tin nhắn rác, hoặc nội dung lặp đi lặp lại" },
    { id: "harassment", label: "Quấy rối", description: "Bắt nạt, đe dọa, hoặc quấy rối người dùng khác" },
    { id: "false_info", label: "Thông tin sai lệch", description: "Thông tin giả, gây hiểu lầm hoặc không chính xác" },
    { id: "hate_speech", label: "Ngôn từ thù địch", description: "Phân biệt đối xử, kỳ thị, hoặc phát ngôn thù địch" },
    { id: "violence", label: "Bạo lực", description: "Đe dọa bạo lực hoặc nội dung nguy hiểm" },
    { id: "intellectual_property", label: "Vi phạm quyền sở hữu trí tuệ", description: "Vi phạm bản quyền hoặc nhãn hiệu" },
    { id: "scam", label: "Lừa đảo", description: "Lừa đảo, thông tin giả mạo hoặc hoạt động gian lận" },
    { id: "other", label: "Lý do khác", description: "Vấn đề khác không thuộc các danh mục trên" },
  ];

  return (
    <>
      {externalModalOpen === undefined && (
        variant === "compact" ? (
          <button
            id={`report-post-${postId}`}
            onClick={() => setInternalModalOpen(true)}
            className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
            aria-label="Report bài viết"
            title="Report bài viết"
          >
            <Flag className="w-4 h-4" />
          </button>
        ) : (
          <button
            id={`report-post-${postId}`}
            onClick={() => setInternalModalOpen(true)}
            className="flex items-center gap-1 text-sm text-zinc-500 dark:text-zinc-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
            aria-label="Report bài viết"
            title="Report bài viết"
          >
            <Flag className="w-4 h-4" />
            <span>Report</span>
          </button>
        )
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b border-zinc-200 dark:border-zinc-800">
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
                {isConfirmStep ? "Báo cáo đã được gửi" : "Báo cáo bài viết"}
              </h2>
              <button 
                onClick={resetModal}
                className="p-1 rounded-full text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 dark:text-zinc-400 transition-colors"
                aria-label="Đóng"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5">
              {isConfirmStep ? (
                <div className="flex flex-col items-center justify-center py-4">
                  <div className="w-16 h-16 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
                    <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-2">
                    Thanks for your report
                  </h3>
                  <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">
                    Báo cáo của bạn đã được gửi đến Admin. Chúng tôi sẽ xem xét nội dung này và sẽ sớm đưa ra phản hồi.
                  </p>
                  <button
                    onClick={resetModal}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <>
                  {message && (
                    <div
                      className={`mb-4 p-3 rounded-lg text-sm flex items-start gap-2 ${
                        message.type === "success"
                          ? "bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                          : "bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                      }`}
                    >
                      <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                      <span>{message.text}</span>
                    </div>
                  )}
                  
                  <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                        Chọn lý do báo cáo <span className="text-red-500">*</span>
                      </label>
                      <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-2 -mr-2">
                        {reportReasons.map((reportReason) => (
                          <label 
                            key={reportReason.id} 
                            className={`block p-3 rounded-lg border cursor-pointer transition-colors ${
                              reason === reportReason.label
                                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-600'
                                : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                            }`}
                          >
                            <div className="flex items-start">
                              <input
                                type="radio"
                                name="reason"
                                value={reportReason.label}
                                checked={reason === reportReason.label}
                                onChange={(e) => setReason(e.target.value)}
                                className="mt-1 mr-3 text-emerald-600 focus:ring-emerald-500 dark:focus:ring-emerald-400"
                              />
                              <div>
                                <span className="block text-sm font-medium text-zinc-800 dark:text-zinc-200">
                                  {reportReason.label}
                                </span>
                                <span className="block text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                                  {reportReason.description}
                                </span>
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="description" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                        Thông tin bổ sung (Optional)
                      </label>
                      <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full p-3 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-emerald-500 dark:focus:border-emerald-400"
                        placeholder="Cung cấp thông tin chi tiết về vấn đề bạn gặp phải..."
                        rows={4}
                      />
                    </div>
                    
                    <div className="flex justify-end gap-3 mt-6">
                      <button
                        type="button"
                        onClick={resetModal}
                        className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors"
                        disabled={isSubmitting}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 rounded-lg transition-colors disabled:opacity-50 disabled:pointer-events-none"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Đang gửi..." : "Gửi báo cáo"}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ReportPostButton; 