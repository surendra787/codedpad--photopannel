import React, { useState } from 'react';
import { Lock, Eye, EyeOff, ArrowRight, Image as ImageIcon, Video, KeyRound, AlertCircle, Loader2 } from 'lucide-react';

interface VaultLoginCardProps {
  onOpenVault: (password: string) => Promise<void>;
  isLoading: boolean;
  errorMessage: string | null;
}

export const VaultLoginCard: React.FC<VaultLoginCardProps> = ({
  onOpenVault,
  isLoading,
  errorMessage,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;
    onOpenVault(password.trim());
  };

  const handleDemoFill = () => {
    setPassword('password123');
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-xl shadow-slate-200/60 border border-slate-100">
        {/* Top Lock Icon Badge */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <Lock className="w-8 h-8 stroke-[2]" />
          </div>
        </div>

        {/* Header Text */}
        <div className="text-center mb-8">
          <p className="text-xs font-bold tracking-widest text-blue-600 uppercase mb-2">
            Your Personal Space
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-3">
            Welcome to CodedPad
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed px-2">
            Your memories deserve a private space. Enter your password to open your vault or create a new one.
          </p>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="vault-password" className="text-xs font-semibold text-slate-800">
                Your Password
              </label>
              <button
                type="button"
                onClick={handleDemoFill}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1 cursor-pointer"
                title="Fill preloaded demo vault"
              >
                <KeyRound className="w-3 h-3" />
                <span>Fill Demo Password</span>
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="vault-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={isLoading}
                required
                className="w-full pl-10 pr-11 py-3 text-sm bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:bg-white transition-all disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="mt-1.5 text-[11px] text-slate-400">
              Demo vault password is <strong className="text-slate-600 font-mono">password123</strong>, or enter any new password.
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading || !password.trim()}
            className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold rounded-xl shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Decrypting & Opening Vault...</span>
              </>
            ) : (
              <>
                <span>Open / Create Vault</span>
                <ArrowRight className="w-4 h-4 stroke-[2.2]" />
              </>
            )}
          </button>
        </form>

        {/* Footer in card */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <div className="relative flex justify-center text-center mb-5">
            <span className="bg-white px-3 text-[11px] font-bold tracking-widest text-slate-400 uppercase">
              Your files, your space
            </span>
          </div>

          <div className="flex items-center justify-center gap-8 text-xs text-slate-600 font-medium">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-blue-600" />
              <span>Private Photos</span>
            </div>
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4 text-blue-600" />
              <span>Private Videos</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
