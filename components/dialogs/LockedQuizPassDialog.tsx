'use client';

import React from 'react';
import { Lock, Key, RefreshCw, CheckCircle2 } from 'lucide-react';

interface LockedQuizPassDialogProps {
  studentName: string;
  studentPhone: string;
  stageTitle?: string;
  chapterName?: string | null;
  onDismiss: () => void;
  onRedeemCodeClick: () => void;
  onSyncStatusClick?: () => void;
}

export const LockedQuizPassDialog: React.FC<LockedQuizPassDialogProps> = ({
  studentName,
  studentPhone,
  stageTitle = 'Locked Stage Battle',
  chapterName,
  onDismiss,
  onRedeemCodeClick,
  onSyncStatusClick = () => {},
}) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
      onClick={onDismiss}
    >
      <div
        className="w-full max-w-[460px] rounded-[20px] bg-[#22304A] border border-[#F5B94C]/50 p-5 shadow-2xl space-y-4 animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#D99B2B] flex items-center justify-center text-[#3A2605] flex-shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-[16px] font-extrabold text-[#F1F5F9] leading-tight truncate">
              Stage Locked • Scholarship Pass Required
            </h2>
            <p className="text-[12px] font-semibold text-[#F5B94C] leading-tight truncate">
              सराव पास आवश्यक • {chapterName || stageTitle}
            </p>
          </div>
        </div>

        <p className="text-[13px] text-[#A8B4C4] leading-relaxed">
          This quiz stage is part of the Maharashtra State Board & Scholarship preparation curriculum. Activate via institutional pass code or sync your student status to unlock.
        </p>

        {/* Registered Student Card */}
        <div className="w-full rounded-[12px] bg-[#0F172A] border border-[#334155] p-3 space-y-1 text-left">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-[#22C7E6] tracking-wider uppercase">
              REGISTERED STUDENT
            </span>
            <span className="text-[10px] font-bold text-[#F5B94C]">
              Pass Required
            </span>
          </div>
          <p className="text-[13px] font-bold text-[#F1F5F9]">Student: {studentName}</p>
          <p className="text-[12px] text-[#A8B4C4]">Parent WhatsApp: {studentPhone}</p>
        </div>

        {/* Perks */}
        <div className="space-y-1.5 text-left">
          <div className="flex items-center gap-2 text-[12px] text-[#F1F5F9]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#22C7E6] flex-shrink-0" />
            <span>All 12 Chapters & 36 Stage Battles Unlocked</span>
          </div>
          <div className="flex items-center gap-2 text-[12px] text-[#F1F5F9]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#22C7E6] flex-shrink-0" />
            <span>Sunday WhatsApp Progress Reports for Parents</span>
          </div>
          <div className="flex items-center gap-2 text-[12px] text-[#F1F5F9]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#22C7E6] flex-shrink-0" />
            <span>Unlimited Mistake Revision Book & Audio Explanations</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          <button
            onClick={() => {
              onDismiss();
              onRedeemCodeClick();
            }}
            className="w-full py-3 rounded-[10px] bg-[#22C7E6] text-[#062A35] font-bold text-[13px] flex items-center justify-center gap-2 hover:bg-[#8DE7F4] active:scale-[0.98] transition-all shadow-md shadow-[#22C7E6]/20"
          >
            <Key className="w-4 h-4" />
            <span>Enter Pass Code • कोड टाका</span>
          </button>

          <button
            onClick={() => {
              onDismiss();
              onSyncStatusClick();
            }}
            className="w-full py-2.5 rounded-[10px] bg-transparent border border-[#F5B94C]/70 text-[#F5B94C] font-bold text-[12px] flex items-center justify-center gap-2 hover:bg-[#F5B94C]/10 active:scale-[0.98] transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync Account Status ⟳</span>
          </button>

          <button
            onClick={onDismiss}
            className="w-full py-2 text-[12px] font-semibold text-[#A8B4C4] hover:text-[#F1F5F9] transition-colors"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
};
