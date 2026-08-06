import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, ArrowRight, ShieldCheck } from 'lucide-react';

export const GoogleAuthModal = ({ isOpen, onClose, onSelectAccount }) => {
  const [customEmail, setCustomEmail] = useState('');

  if (!isOpen) return null;

  const sampleAccounts = [
    {
      name: 'Sarah Jenkins',
      email: 'sarah.jenkins@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    },
    {
      name: 'Alex Rivera',
      email: 'alex.rivera.ai@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    }
  ];

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!customEmail) return;
    const namePart = customEmail.split('@')[0];
    const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1).replace(/[^a-zA-Z]/g, ' ');
    onSelectAccount({
      name: formattedName,
      email: customEmail,
      googleId: 'google_' + Date.now()
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100"
        >
          {/* Header */}
          <div className="p-6 pb-4 border-b border-slate-100 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200/80 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 leading-snug">Sign in with Google</h3>
                <p className="text-xs text-slate-500">to continue to <strong className="text-slate-800">DocPilot AI</strong></p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Choose an account</p>

            {/* Account List */}
            <div className="space-y-2">
              {sampleAccounts.map((acc, idx) => (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.01, backgroundColor: 'rgb(248 250 252)' }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => onSelectAccount({ name: acc.name, email: acc.email, googleId: 'google_' + idx })}
                  className="w-full p-3 rounded-2xl border border-slate-200 flex items-center justify-between text-left transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img src={acc.avatar} alt={acc.name} className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                    <div>
                      <div className="text-sm font-bold text-slate-900">{acc.name}</div>
                      <div className="text-xs text-slate-500">{acc.email}</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </motion.button>
              ))}
            </div>

            {/* Custom Google Email Input */}
            <div className="pt-3 border-t border-slate-100">
              <form onSubmit={handleCustomSubmit} className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Or enter another Google email
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    placeholder="your.email@gmail.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-ocean-500/20 focus:border-ocean-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                >
                  Continue with this account <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>

          {/* Footer Security Note */}
          <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Secure 256-bit OAuth authentication powered by DocPilot AI</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
