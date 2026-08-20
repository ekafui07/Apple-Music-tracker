import React, { useState } from 'react';
import { Music, Lock, ArrowRight, KeyRound, CheckCircle2, X } from 'lucide-react';
import { loginAdmin, resetAdminPassword } from '../api/client';

export default function AuthPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Password Reset Modal State
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [resetStep, setResetStep] = useState(1);
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const data = await loginAdmin(email, password);
      onLogin(data.user);
    } catch (err) {
      setErrorMessage(err.message || 'Login failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordResetSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (resetStep === 1) {
      if (!resetEmail) {
        setErrorMessage('Please enter your authorized email address.');
        return;
      }
      setResetStep(2);
    } else if (resetStep === 2) {
      if (newPassword.length < 6) {
        setErrorMessage('Password must be at least 6 characters long.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setErrorMessage('Passwords do not match.');
        return;
      }

      setLoading(true);
      try {
        await resetAdminPassword(resetEmail, newPassword);
        setResetSuccess('Password updated successfully in database! Log in with your new password.');
        setTimeout(() => {
          setIsResetOpen(false);
          setResetStep(1);
          setResetSuccess('');
          setPassword(newPassword);
        }, 2000);
      } catch (err) {
        setErrorMessage(err.message || 'Password reset failed.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#08090d] text-gray-100 flex flex-col justify-between selection:bg-rose-600 selection:text-white relative overflow-hidden font-sans">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-rose-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Header Logo */}
      <header className="py-6 px-6 lg:px-12 flex items-center justify-between border-b border-gray-800/60 relative z-10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 via-rose-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-rose-600/30">
            <Music className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight text-white">
              Apple Music <span className="text-rose-500">PayTrack</span>
            </span>
            <span className="ml-2 text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20">
              Manager Portal
            </span>
          </div>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center p-4 relative z-10 my-8">
        <div className="w-full max-w-md bg-[#11121a]/90 backdrop-blur-xl border border-gray-800 p-8 rounded-3xl shadow-2xl space-y-6">
          
          {/* Card Icon & Title */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 mb-3 shadow-inner">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              Sign In to PayTrack
            </h2>
            <p className="text-xs text-gray-400 max-w-xs mx-auto">
              Enter your authorized admin email address and password to access database subscriber records.
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold text-center animate-fade-in">
              {errorMessage}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            <div>
              <label className="text-gray-400 font-semibold block mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input focus:outline-none font-medium"
                placeholder="name@domain.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-gray-400 font-semibold block">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsResetOpen(true);
                    setResetStep(1);
                    setErrorMessage('');
                    setResetEmail('');
                  }}
                  className="text-[10px] text-rose-400 hover:underline font-bold"
                >
                  Forgot Password?
                </button>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input focus:outline-none font-medium"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center space-x-2 cursor-pointer text-gray-400">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded bg-gray-900 border-gray-800 text-rose-600 focus:ring-rose-500 h-4 w-4"
                />
                <span>Remember this browser</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-pink-600 hover:brightness-110 text-white font-bold text-xs shadow-lg shadow-rose-600/25 transition-all flex items-center justify-center space-x-2 active:scale-95 disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

        </div>
      </main>

      {/* Password Reset Modal */}
      {isResetOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#12121a] w-full max-w-md rounded-2xl border border-gray-800 p-6 shadow-2xl space-y-4 text-xs">
            
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div className="flex items-center space-x-2">
                <KeyRound className="w-5 h-5 text-rose-500" />
                <h3 className="text-base font-bold text-white">Reset Admin Password</h3>
              </div>
              <button 
                onClick={() => setIsResetOpen(false)} 
                className="p-1 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold text-center">
                {errorMessage}
              </div>
            )}

            {resetSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{resetSuccess}</span>
              </div>
            )}

            {!resetSuccess && (
              <form onSubmit={handlePasswordResetSubmit} className="space-y-4">
                {resetStep === 1 && (
                  <div>
                    <p className="text-gray-400 mb-3">
                      Enter your authorized admin email address to verify your account and reset your password.
                    </p>
                    <label className="text-gray-400 block mb-1 font-semibold">Email Address</label>
                    <input
                      type="email"
                      required
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl glass-input focus:outline-none font-medium"
                      placeholder="name@domain.com"
                    />
                  </div>
                )}

                {resetStep === 2 && (
                  <div className="space-y-3">
                    <p className="text-gray-400">
                      Email verified for <span className="text-white font-bold">{resetEmail}</span>. Enter your new password below.
                    </p>
                    <div>
                      <label className="text-gray-400 block mb-1 font-semibold">New Password</label>
                      <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl glass-input focus:outline-none font-medium"
                        placeholder="At least 6 characters"
                      />
                    </div>

                    <div>
                      <label className="text-gray-400 block mb-1 font-semibold">Confirm New Password</label>
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl glass-input focus:outline-none font-medium"
                        placeholder="Re-enter new password"
                      />
                    </div>
                  </div>
                )}

                <div className="pt-3 border-t border-gray-800 flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsResetOpen(false)}
                    className="px-4 py-2 rounded-xl bg-gray-900 text-gray-300 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition-all disabled:opacity-50"
                  >
                    {loading ? 'Processing...' : resetStep === 1 ? 'Verify Email' : 'Save New Password'}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-6 px-4 text-center text-[11px] text-gray-500 border-t border-gray-800/60 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 Apple Inc. All rights reserved. Apple Music & PayTrack Pro.</p>
          <div className="flex items-center space-x-4">
            <span>Privacy Policy</span>
            <span>•</span>
            <span>Terms of Service</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
