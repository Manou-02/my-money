import React from 'react';
import { Wifi, Battery } from 'lucide-react';

interface MobileFrameProps {
  isFrameMode: boolean;
  children: React.ReactNode;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({ isFrameMode, children }) => {
  if (!isFrameMode) {
    return (
      <div className="w-full min-h-screen bg-[#FAF8FF] dark:bg-[#0A0E14] text-[#0F172A] dark:text-[#F8FAFC] flex flex-col">
        <div className="w-full max-w-lg mx-auto min-h-screen flex flex-col bg-[#FAF8FF] dark:bg-[#0A0E14]">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-slate-900/90 py-4 sm:py-8 px-2 flex items-center justify-center">
      {/* Device Body */}
      <div className="w-full max-w-[420px] h-[880px] max-h-[96vh] bg-[#FAF8FF] dark:bg-[#0A0E14] rounded-[48px] border-[10px] border-slate-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] flex flex-col overflow-hidden relative">
        {/* Device Top Speaker & Notch / Dynamic Island */}
        <div className="pt-3 pb-1 px-7 flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200 select-none shrink-0 z-30">
          <span className="text-[12px] font-bold">9:41</span>
          
          {/* Dynamic Island pill */}
          <div className="w-24 h-5 bg-black rounded-full mx-auto" />
          
          <div className="flex items-center gap-1.5">
            <Wifi size={13} />
            <Battery size={15} />
          </div>
        </div>

        {/* Device App Content */}
        <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar relative">
          {children}
        </div>

        {/* Bottom Home Indicator */}
        <div className="h-4 bg-[#FAF8FF] dark:bg-[#0A0E14] flex items-center justify-center shrink-0 z-30">
          <div className="w-32 h-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
        </div>
      </div>
    </div>
  );
};
