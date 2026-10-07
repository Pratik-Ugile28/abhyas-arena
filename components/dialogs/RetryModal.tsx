'use client';

import React, { useState } from 'react';
import { QuizQuestion } from '@/types';

interface RetryModalProps {
  question: QuizQuestion | null;
  onClose: () => void;
  onConquer: (id: string) => void;
}

export const RetryModal: React.FC<RetryModalProps> = ({
  question,
  onClose,
  onConquer,
}) => {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);

  if (!question) return null;

  const handleSubmitOrContinue = () => {
    if (!isAnswered) {
      const correct = selectedKey === question.correctAnswer;
      setIsCorrect(correct);
      setIsAnswered(true);
    } else if (isCorrect) {
      onConquer(question.id);
      onClose();
    } else {
      setSelectedKey(null);
      setIsAnswered(false);
      setIsCorrect(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[480px] max-h-[90vh] overflow-y-auto rounded-[20px] bg-[#0F172A] border border-[#334155] p-5 shadow-2xl space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-2 border-b border-[#334155]">
          <h2 className="text-[18px] font-bold text-[#F5B94C]">Retry Question</h2>
          <span className="text-[11px] font-bold text-[#22C7E6] px-2 py-0.5 rounded bg-[#22C7E6]/10">
            {question.topic}
          </span>
        </div>

        <p className="text-[16px] font-semibold text-[#F1F5F9] leading-relaxed">
          {question.question}
        </p>

        {question.hint && (
          <div className="rounded-[8px] bg-[#0B1220] border border-[#334155] p-3 text-[13px] text-[#A8B4C4] leading-relaxed">
            💡 <span className="font-semibold text-[#F1F5F9]">Hint:</span> {question.hint}
          </div>
        )}

        {/* Options */}
        <div className="space-y-2">
          {question.options.map((opt) => {
            const isPicked = selectedKey === opt.key;
            const isActualCorrect = opt.key === question.correctAnswer;

            let bgClass = 'bg-[#172236] border-[#334155]';
            if (!isAnswered && isPicked) {
              bgClass = 'bg-[#22C7E6]/20 border-[#22C7E6]';
            } else if (isAnswered && isActualCorrect) {
              bgClass = 'bg-[#39C88A]/25 border-[#39C88A] text-[#39C88A]';
            } else if (isAnswered && isPicked && !isCorrect) {
              bgClass = 'bg-[#F07167]/20 border-[#F07167]';
            }

            return (
              <button
                key={opt.key}
                type="button"
                disabled={isAnswered}
                onClick={() => setSelectedKey(opt.key)}
                className={`w-full p-3 rounded-[12px] border text-left flex items-start gap-3 transition-all ${bgClass} ${
                  !isAnswered ? 'hover:border-[#22C7E6]/60 cursor-pointer' : 'cursor-default'
                }`}
              >
                <span className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-[12px] bg-[#22304A] text-[#F1F5F9] flex-shrink-0 mt-0.5">
                  {opt.key}
                </span>
                <span className="text-[14px] text-[#F1F5F9] font-medium leading-snug">
                  {opt.text}
                </span>
              </button>
            );
          })}
        </div>

        {/* Feedback Banner */}
        {isAnswered && (
          <div
            className={`rounded-[12px] p-3.5 border ${
              isCorrect
                ? 'bg-[#39C88A]/20 border-[#39C88A]/50 text-[#39C88A]'
                : 'bg-[#172236] border-[#334155] text-[#A8B4C4]'
            }`}
          >
            <p className="font-bold text-[14px]">
              {isCorrect ? '✓ Conquered! +15 XP' : 'Good try! Keep studying!'}
            </p>
            {!isCorrect && (
              <p className="text-[13px] text-[#A8B4C4] mt-1 whitespace-pre-line leading-relaxed">
                {question.explanation}
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-[12px] bg-[#172236] text-[#A8B4C4] font-semibold text-[14px] hover:text-[#F1F5F9] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!isAnswered && !selectedKey}
            onClick={handleSubmitOrContinue}
            className={`flex-1 py-3 rounded-[12px] font-bold text-[14px] transition-all shadow-md ${
              isCorrect
                ? 'bg-[#39C88A] text-[#062C1E] shadow-[#39C88A]/20'
                : selectedKey || isAnswered
                ? 'bg-[#22C7E6] text-[#062A35] shadow-[#22C7E6]/20'
                : 'bg-[#22304A] text-[#718096] cursor-not-allowed'
            }`}
          >
            {!isAnswered ? 'Submit answer' : isCorrect ? 'Done' : 'Try again'}
          </button>
        </div>
      </div>
    </div>
  );
};
