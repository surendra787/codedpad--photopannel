import React from 'react';
import { Lock, ShieldCheck, FileCode2, GraduationCap, Unlock, LogOut } from 'lucide-react';

interface NavbarProps {
  isUnlocked: boolean;
  vaultId: string | null;
  activeTab: 'vault' | 'swagger';
  setActiveTab: (tab: 'vault' | 'swagger') => void;
  onOpenExaminerGuide: () => void;
  onLockVault: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  isUnlocked,
  vaultId,
  activeTab,
  setActiveTab,
  onOpenExaminerGuide,
  onLockVault,
}) => {
  return (
    <header className="w-full bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo - exactly matching Image 1 */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
            <Lock className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-slate-900 tracking-tight font-sans">
              CodedPad
            </span>
            {isUnlocked && vaultId && (
              <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded-md">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Vault #{vaultId.substring(0, 8)}
              </span>
            )}
          </div>
        </div>

        {/* Right side controls & navigation */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* View Tab Switcher */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-medium">
            <button
              type="button"
              onClick={() => setActiveTab('vault')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                activeTab === 'vault'
                  ? 'bg-white text-blue-700 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isUnlocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
              <span>Vault</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('swagger')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                activeTab === 'swagger'
                  ? 'bg-white text-blue-700 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileCode2 className="w-3.5 h-3.5" />
              <span>Swagger API</span>
            </button>
          </div>

          {/* Examiner Presentation Guide Button */}
          <button
            type="button"
            onClick={onOpenExaminerGuide}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 rounded-lg transition-colors cursor-pointer"
            title="Examiner Presentation & VS Code Setup Guide"
          >
            <GraduationCap className="w-4 h-4 text-amber-600" />
            <span className="hidden md:inline">Examiner Guide</span>
          </button>

          {/* Locked status / Lock button */}
          {isUnlocked ? (
            <button
              type="button"
              onClick={onLockVault}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Lock Vault</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 pl-1">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span className="hidden sm:inline">Private Storage</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
