import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FileText, LogOut, Sparkles, User, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-ocean-700 via-ocean-600 to-ocean-400 flex items-center justify-center text-white shadow-md shadow-ocean-500/20 group-hover:scale-105 transition-transform duration-200">
            <FileText className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-ocean-700 transition-colors flex items-center gap-1.5">
              DocPilot <span className="text-ocean-600">AI</span>
              <span className="inline-flex items-center gap-0.5 text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded-full bg-ocean-50 text-ocean-700 border border-ocean-200">
                <Sparkles className="w-3 h-3 text-ocean-500 animate-pulse" /> MVP
              </span>
            </span>
          </div>
        </Link>

        {/* User Navigation & Actions */}
        {user ? (
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100/80 border border-slate-200 text-slate-700 text-sm">
              <div className="w-6 h-6 rounded-full bg-ocean-600 text-white flex items-center justify-center text-xs font-semibold">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="font-medium text-slate-800">{user.name}</span>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors border border-transparent hover:border-rose-200"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </motion.button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-ocean-600 transition-colors"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-ocean-600 to-ocean-500 hover:from-ocean-700 hover:to-ocean-600 shadow-sm shadow-ocean-500/30 transition-all"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
