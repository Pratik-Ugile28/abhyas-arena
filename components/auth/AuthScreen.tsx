'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { CLASS_GRADES, AmbajogaiSchools, ARENA_COMPANIONS, ArenaCompanion } from '@/types';
import {
  ShieldCheck,
  User,
  Lock,
  Eye,
  EyeOff,
  School,
  AlertCircle,
  Loader2,
  ChevronDown,
  Shield,
} from 'lucide-react';

export const AuthScreen: React.FC = () => {
  const { login } = useApp();

  const [studentId, setStudentId] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
  const [selectedGradeKey, setSelectedGradeKey] = useState<string>('CLASS_5');
  const [selectedSchool, setSelectedSchool] = useState<string>(AmbajogaiSchools.KHOLESHWAR);
  const [selectedCompanion, setSelectedCompanion] = useState<ArenaCompanion>(ARENA_COMPANIONS[0]);
  const [isRegisterMode, setIsRegisterMode] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [schoolDropdownOpen, setSchoolDropdownOpen] = useState<boolean>(false);

  const selectedGradeInfo = CLASS_GRADES[selectedGradeKey] || CLASS_GRADES.CLASS_5;

  const handleFillDemo = () => {
    setStudentId('aarav_patil');
    setPassword('demo_password');
    setSelectedGradeKey('CLASS_5');
    setSelectedSchool(AmbajogaiSchools.KHOLESHWAR);
    setErrorMessage(null);
  };

  const handleQuickDemoGuest = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    const res = await login({
      studentId: 'STU-58291',
      password: '',
      grade: selectedGradeInfo.label,
      schoolName: selectedSchool,
      companionId: selectedCompanion.id,
      isRegister: false,
    });
    setIsLoading(false);
    if (!res.success && res.error) {
      setErrorMessage(res.error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = studentId.trim();
    if (!cleanId) {
      setErrorMessage('Please enter your Student ID or Username.');
      return;
    }

    const isDemo = cleanId.toUpperCase() === 'STU-58291' || cleanId.toLowerCase() === 'demo_student';
    if (!isDemo && password.length < 4) {
      setErrorMessage('Password must be at least 4 characters.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const res = await login({
      studentId: cleanId,
      password,
      grade: selectedGradeInfo.label,
      schoolName: selectedSchool,
      companionId: selectedCompanion.id,
      isRegister: isRegisterMode,
    });

    setIsLoading(false);
    if (!res.success && res.error) {
      setErrorMessage(res.error);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#0F172A] flex items-center justify-center p-4">
      <div className="w-full max-w-[480px] flex flex-col items-center text-center">
        {/* App Logo Emblem */}
        <div className="w-[72px] h-[72px] rounded-full bg-gradient-to-br from-[#22C7E6]/30 to-[#22304A] border-[1.5px] border-[#22C7E6] flex items-center justify-center shadow-lg shadow-[#22C7E6]/20">
          <ShieldCheck className="w-9 h-9 text-[#22C7E6]" />
        </div>

        <h1 className="text-[24px] font-black tracking-wider text-[#F1F5F9] mt-4 leading-tight">
          ABHYAS ARENA
        </h1>
        <p className="text-[12px] font-semibold text-[#F5B94C] mt-0.5">
          Maharashtra State Scholarship Practice
        </p>

        {/* Auth Card */}
        <div className="w-full mt-7 rounded-[20px] bg-[#172236] border border-[#334155] p-5 shadow-2xl text-left">
          <h2 className="text-[17px] font-bold text-[#F1F5F9]">
            {isRegisterMode ? 'Student Registration' : 'Student Sign In'}
          </h2>

          {errorMessage && (
            <div className="mt-3.5 p-3 rounded-[10px] bg-[#F07167]/15 border border-[#F07167] flex items-start gap-2 text-[#F07167] text-[12px] font-medium leading-snug">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-3.5 space-y-3.5">
            {/* Student ID / Username */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#A8B4C4] uppercase tracking-wider">
                Student ID or Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#22C7E6]">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => {
                    setStudentId(e.target.value);
                    setErrorMessage(null);
                  }}
                  placeholder="e.g. aarav_05 or STU-58291"
                  className="w-full h-11 pl-9 pr-3 rounded-[10px] bg-[#0F172A] border border-[#334155] text-[#F1F5F9] text-[14px] placeholder-[#718096] focus:border-[#22C7E6] focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#A8B4C4] uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#22C7E6]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={passwordVisible ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMessage(null);
                  }}
                  placeholder={
                    isRegisterMode
                      ? 'Create Password (min. 4 chars)'
                      : 'Enter Password'
                  }
                  className="w-full h-11 pl-9 pr-10 rounded-[10px] bg-[#0F172A] border border-[#334155] text-[#F1F5F9] text-[14px] placeholder-[#718096] focus:border-[#22C7E6] focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#A8B4C4] hover:text-[#F1F5F9]"
                  tabIndex={-1}
                >
                  {passwordVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Demo Fill Action */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleFillDemo}
                className="text-[11px] font-semibold text-[#22C7E6] hover:underline"
              >
                ⚡ Fill Demo (Aarav Patil)
              </button>
            </div>

            {/* Select Grade Pills (Classes 4-8) */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-semibold text-[#A8B4C4]">
                Select Scholarship Class (4 to 8):
              </label>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {Object.keys(CLASS_GRADES).map((gradeKey) => {
                  const g = CLASS_GRADES[gradeKey];
                  const isSelected = selectedGradeKey === gradeKey;
                  return (
                    <button
                      key={gradeKey}
                      type="button"
                      onClick={() => setSelectedGradeKey(gradeKey)}
                      className={`h-9 px-3 rounded-[10px] font-bold text-[11px] transition-all flex-shrink-0 ${
                        isSelected
                          ? 'bg-[#22C7E6] text-[#062A35]'
                          : 'bg-[#22304A] text-[#F1F5F9] hover:bg-[#334155]'
                      }`}
                    >
                      {g.label.replace('Class ', 'C')}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* School Selector Dropdown */}
            <div className="space-y-1.5 relative">
              <label className="text-[12px] font-semibold text-[#A8B4C4]">
                School (Ambajogai Pilot):
              </label>
              <button
                type="button"
                onClick={() => setSchoolDropdownOpen(!schoolDropdownOpen)}
                className="w-full h-11 px-3.5 rounded-[12px] bg-[#22304A] border border-[#334155] flex items-center justify-between text-left text-[13px] text-[#F1F5F9] font-medium hover:border-[#22C7E6]/60 transition-colors"
              >
                <div className="flex items-center gap-2 truncate">
                  <School className="w-4 h-4 text-[#22C7E6] flex-shrink-0" />
                  <span className="truncate">{selectedSchool}</span>
                </div>
                <ChevronDown className="w-4 h-4 text-[#A8B4C4] flex-shrink-0 ml-1" />
              </button>

              {schoolDropdownOpen && (
                <div className="absolute top-full left-0 right-0 z-30 mt-1 rounded-[12px] bg-[#22304A] border border-[#334155] shadow-xl overflow-hidden max-h-48 overflow-y-auto">
                  {AmbajogaiSchools.ALL.map((school) => (
                    <button
                      key={school}
                      type="button"
                      onClick={() => {
                        setSelectedSchool(school);
                        setSchoolDropdownOpen(false);
                      }}
                      className={`w-full px-3.5 py-2.5 text-left text-[12px] transition-colors flex items-center justify-between ${
                        selectedSchool === school
                          ? 'bg-[#22C7E6]/15 text-[#22C7E6] font-bold'
                          : 'text-[#F1F5F9] hover:bg-[#334155]'
                      }`}
                    >
                      <span className="truncate">{school}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Choose Arena Companion (when Register mode) */}
            {isRegisterMode && (
              <div className="space-y-1.5 pt-1">
                <label className="text-[12px] font-semibold text-[#A8B4C4]">
                  Choose Your Arena Companion:
                </label>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {ARENA_COMPANIONS.map((companion) => {
                    const isSelected = selectedCompanion.id === companion.id;
                    return (
                      <button
                        key={companion.id}
                        type="button"
                        onClick={() => setSelectedCompanion(companion)}
                        className={`w-28 p-2.5 rounded-[12px] border text-center flex-shrink-0 transition-all ${
                          isSelected
                            ? 'bg-[#334155]'
                            : 'bg-[#22304A] hover:bg-[#334155]/60'
                        }`}
                        style={{
                          borderColor: isSelected ? companion.auraColorHex : '#334155',
                          borderWidth: isSelected ? '2px' : '1px',
                        }}
                      >
                        <span className="text-[26px] block leading-none">{companion.emoji}</span>
                        <span
                          className="text-[11px] font-bold block truncate mt-1"
                          style={{ color: isSelected ? companion.auraColorHex : '#F1F5F9' }}
                        >
                          {companion.name}
                        </span>
                        <span className="text-[9px] text-[#A8B4C4] block truncate">
                          {companion.title}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-[12px] bg-[#22C7E6] text-[#062A35] font-bold text-[15px] flex items-center justify-center gap-2 hover:bg-[#8DE7F4] active:scale-[0.98] transition-all shadow-md shadow-[#22C7E6]/25 mt-4"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-[#062A35]" />
                  <span>Connecting...</span>
                </>
              ) : (
                <span>
                  {isRegisterMode
                    ? 'Create Free Account / मोफत खाते तयार करा'
                    : 'Enter Arena'}
                </span>
              )}
            </button>
          </form>

          {/* Toggle Register / Sign In */}
          <div className="mt-3 text-center">
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(!isRegisterMode);
                setErrorMessage(null);
              }}
              className="text-[12px] font-medium text-[#F5B94C] hover:underline"
            >
              {isRegisterMode
                ? 'Already have an account? Sign In'
                : 'New student? Create Free Account'}
            </button>
          </div>

          {/* Quick Demo Tour */}
          <div className="mt-1 text-center">
            <button
              type="button"
              disabled={isLoading}
              onClick={handleQuickDemoGuest}
              className="text-[12px] font-semibold text-[#22C7E6] hover:underline"
            >
              🎯 Quick Demo Tour / डेमो विद्यार्थी म्हणून एक्सप्लोर करा
            </button>
          </div>

          {/* Privacy Policy */}
          <div className="mt-4 pt-3 border-t border-[#334155]/60 flex items-center justify-center gap-1.5 text-[11px] text-[#A8B4C4]">
            <Shield className="w-3.5 h-3.5 opacity-70" />
            <a
              href="https://abhyasarena.web.app/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-[#F1F5F9] transition-colors"
            >
              Privacy Policy & Student Data Safety
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
