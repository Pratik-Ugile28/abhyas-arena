'use client';

import React, { useState } from 'react';
import { Key, X, CheckCircle2, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';

interface RedeemPassCodeDialogProps {
  studentName?: string;
  parentPhone?: string;
  onDismiss: () => void;
  onRedeemCode: (code: string) => Promise<{ success: boolean; message: string }>;
  onSyncStatus?: () => Promise<{ success: boolean; message: string }>;
}

export const RedeemPassCodeDialog: React.FC<RedeemPassCodeDialogProps> = ({
  studentName,
  parentPhone,
  onDismiss,
  onRedeemCode,
  onSyncStatus,
}) => {
  const [codeInput, setCodeInput] = useState<string>('');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const handleRedeem = async () => {
    const clean = codeInput.trim().toUpperCase();
    if (!clean || isVerifying) return;

    setIsVerifying(true);
    setFeedbackMessage(null);
    try {
      const res = await onRedeemCode(clean);
      setIsSuccess(res.success);
      setFeedbackMessage(res.message);
      if (res.success) {
        setTimeout(() => {
          onDismiss();
        }, 1500);
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSync = async () => {
    if (!onSyncStatus || isSyncing) return;
    setIsSyncing(true);
    try {
      const res = await onSyncStatus();
      setIsSuccess(res.success);
      setFeedbackMessage(res.message);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
      onClick={onDismiss}
    >
      <div
        className="w-full max-w-[440px] rounded-[24px] bg-[#22304A] border border-[#F5B94C]/45 p-5 shadow-2xl space-y-4 animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#D99B2B] flex items-center justify-center text-[#3A2605] flex-shrink-0">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-[17px] font-extrabold text-[#F1F5F9] leading-tight">
              Redeem Pass Code
            </h2>
            <p className="text-[12px] font-semibold text-[#F5B94C] leading-tight">
              सराव पास कोड टाका
            </p>
          </div>
        </div>

        {/* Input */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-[#A8B4C4] uppercase tracking-wider">
            Activation Code (Format: AA-6M-XXXXXX)
          </label>
          <div className="relative">
            <input
              type="text"
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
              placeholder="e.g. AA-6M-K7P9W2"
              className="w-full h-12 px-3.5 pr-10 rounded-[12px] bg-[#0F172A] border border-[#334155] text-[#F1F5F9] font-mono font-bold text-[15px] tracking-wider placeholder-[#718096] focus:border-[#22C7E6] focus:outline-none transition-colors"
            />
            {codeInput && (
              <button
                type="button"
                onClick={() => setCodeInput('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#718096] hover:text-[#F1F5F9]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Feedback message */}
        {feedbackMessage && (
          <div
            className={`p-3 rounded-[12px] flex items-start gap-2.5 text-[13px] border ${
              isSuccess
                ? 'bg-[#39C88A]/20 border-[#39C88A]/60 text-[#39C88A]'
                : 'bg-[#F07167]/20 border-[#F07167]/60 text-[#F07167]'
            }`}
          >
            {isSuccess ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            )}
            <span className="leading-snug">{feedbackMessage}</span>
          </div>
        )}

        <p className="text-[12px] text-[#A8B4C4] leading-relaxed">
          Pass codes are provided by your school, teacher, or study center. Valid format includes 1-Month, 3-Month, and 6-Month plans.
        </p>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          <button
            onClick={handleRedeem}
            disabled={!codeInput.trim() || isVerifying}
            className={`w-full py-3 rounded-[12px] font-bold text-[13px] flex items-center justify-center gap-2 transition-all shadow-md ${
              codeInput.trim() && !isVerifying
                ? 'bg-[#22C7E6] text-[#062A35] hover:bg-[#8DE7F4] active:scale-[0.98] shadow-[#22C7E6]/25'
                : 'bg-[#334155] text-[#718096] cursor-not-allowed'
            }`}
          >
            {isVerifying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying Code...</span>
              </>
            ) : (
              <>
                <Key className="w-4 h-4" />
                <span>Activate Pass • सक्रिय करा</span>
              </>
            )}
          </button>

          {onSyncStatus && (
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="w-full py-2.5 rounded-[12px] bg-transparent border border-[#F5B94C]/70 text-[#F5B94C] font-bold text-[12px] flex items-center justify-center gap-2 hover:bg-[#F5B94C]/10 transition-colors"
            >
              {isSyncing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Syncing...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Sync Account Status ⟳</span>
                </>
              )}
            </button>
          )}

          <button
            onClick={onDismiss}
            className="w-full py-2 text-[12px] font-semibold text-[#A8B4C4] hover:text-[#F1F5F9] transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
