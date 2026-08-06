import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, AlertCircle, Loader2, MailCheck, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [status, setStatus] = useState('verifying'); // 'verifying' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState('');

  const { confirmEmail } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const processVerification = async () => {
      if (!token || !email) {
        setStatus('error');
        setErrorMsg('Invalid or missing email verification parameters in link.');
        return;
      }

      try {
        await confirmEmail(email, token);
        setStatus('success');
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } catch (err) {
        setStatus('error');
        setErrorMsg(
          err.response?.data?.error || 'Verification link has expired or is invalid. Please request a new verification link.'
        );
      }
    };

    processVerification();
  }, [token, email]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 bg-slate-50">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200/80 shadow-card text-center"
      >
        {status === 'verifying' && (
          <div className="space-y-4 py-6">
            <div className="w-16 h-16 rounded-2xl bg-ocean-50 text-ocean-600 flex items-center justify-center mx-auto shadow-sm">
              <Loader2 className="w-8 h-8 animate-spin text-ocean-600" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900">Verifying Email Address</h2>
            <p className="text-sm text-slate-500 max-w-xs mx-auto">
              Please wait while we confirm your email and log you in...
            </p>
          </div>
        )}

        {status === 'success' && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="space-y-4 py-4"
          >
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-9 h-9 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-black text-slate-900">Email Verified!</h2>
            <p className="text-sm text-slate-600">
              Your account for <strong className="text-slate-900">{email}</strong> has been successfully confirmed.
            </p>
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
              <span>Redirecting to your Dashboard...</span>
            </div>
          </motion.div>
        )}

        {status === 'error' && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="space-y-5 py-4"
          >
            <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/20">
              <AlertCircle className="w-9 h-9 text-rose-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Verification Failed</h2>
            <p className="text-sm text-slate-600 leading-relaxed bg-rose-50/80 p-3.5 rounded-2xl border border-rose-100">
              {errorMsg}
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <Link
                to="/register"
                className="w-full py-3.5 px-4 rounded-xl bg-ocean-600 text-white font-semibold text-sm shadow-md shadow-ocean-500/20 hover:bg-ocean-700 transition-all flex items-center justify-center gap-2"
              >
                <span>Request New Link</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};
