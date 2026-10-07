'use client';

import React from 'react';
import { X } from 'lucide-react';

interface SyllabusModalProps {
  isOpen: boolean;
  grade?: string;
  onClose: () => void;
}

export const SyllabusModal: React.FC<SyllabusModalProps> = ({
  isOpen,
  grade = 'Class 5',
  onClose,
}) => {
  if (!isOpen) return null;

  const cleanGrade = grade.replace(/\D/g, '');
  const isClass8 = cleanGrade === '8';

  const syllabusTitle =
    cleanGrade === '8'
      ? 'Class 8 Scholarship Syllabus (PSS)'
      : cleanGrade === '5'
      ? 'Class 5 Scholarship Syllabus (PUP)'
      : cleanGrade === '4'
      ? 'Class 4 Foundation Prep Syllabus (PUP)'
      : cleanGrade === '6' || cleanGrade === '7'
      ? `Class ${cleanGrade} Bridge Prep Syllabus (PSS)`
      : `${grade} Scholarship Syllabus`;

  const paper1Desc = isClass8
    ? '• First Language (Marathi/English): 25 Questions (50 Marks)\n• Mathematics: 50 Questions (100 Marks) — Number Systems, Real Numbers, Indices, Polynomials, Equations, Commercial Math (Compound Interest, Discount), Geometry & Circle Theorems, Surface Area & Volume.'
    : '• First Language (Marathi/English): 25 Questions (50 Marks)\n• Mathematics: 50 Questions (100 Marks) — Number work, Fractions, Decimals, Measurement, Geometry, Unitary Method, Profit & Loss, Simple Interest.';

  const paper2Desc = isClass8
    ? '• Third Language: 25 Questions (50 Marks)\n• Intelligence Test (Mental Ability): 50 Questions (100 Marks) — Complex Coding, Venn Diagrams, Syllogisms, Cube & Dice, Rhythm Series, Analogies, Mirror & Water Inversions.'
    : '• Third Language: 25 Questions (50 Marks)\n• Intelligence Test (Mental Ability): 50 Questions (100 Marks) — Comprehension, Classification, Series, Analogies, Codes, Visual logic & Symmetry.';

  const examGuidelines = isClass8
    ? 'Exam Guidelines (Pre-Secondary Scholarship - PSS):\nDuration: 90 mins per paper. Total 300 Marks. All questions carry 2 marks with no negative marking. 20% of questions in Paper 2 feature 2 correct options to identify.'
    : 'Exam Guidelines (Pre-Upper Primary Scholarship - PUP):\nDuration: 90 mins per paper. Total 300 Marks. All questions carry 2 marks with no negative marking.';

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
          <h2 className="text-[18px] font-bold text-[#F1F5F9]">{syllabusTitle}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#A8B4C4] hover:text-[#F1F5F9] hover:bg-[#172236] transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Paper 1 */}
        <div className="rounded-[12px] bg-[#172236] p-3.5 space-y-1.5 border border-[#334155]/40">
          <h3 className="text-[14px] font-bold text-[#22C7E6]">
            Paper 1: First Language & Mathematics • 150 Marks
          </h3>
          <p className="text-[13px] text-[#A8B4C4] leading-relaxed whitespace-pre-line">
            {paper1Desc}
          </p>
        </div>

        {/* Paper 2 */}
        <div className="rounded-[12px] bg-[#172236] p-3.5 space-y-1.5 border border-[#334155]/40">
          <h3 className="text-[14px] font-bold text-[#F5B94C]">
            Paper 2: Third Language & Intelligence Test • 150 Marks
          </h3>
          <p className="text-[13px] text-[#A8B4C4] leading-relaxed whitespace-pre-line">
            {paper2Desc}
          </p>
        </div>

        {/* Guidelines */}
        <div className="rounded-[10px] bg-[#0B1220] p-3 border border-[#334155]/60 text-[12px] text-[#A8B4C4] leading-relaxed whitespace-pre-line">
          {examGuidelines}
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-[12px] bg-[#22C7E6] text-[#062A35] font-bold text-[14px] hover:bg-[#8DE7F4] active:scale-[0.98] transition-all shadow-md shadow-[#22C7E6]/20"
        >
          Got It! Back to Practice
        </button>
      </div>
    </div>
  );
};
