import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FileText, User, Lock, Mail, ArrowRight, AlertCircle, Loader2, MailCheck, RefreshCw, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Register = () => {
  const [step, setStep] = useState(1); // 1 = Details form, 2 = Link sent pending confirmation
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Link state
  const [demoVerificationUrl, setDemoVerificationUrl] = useState('');
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { sendVerificationLink, resendVerificationLink } = useAuth();
  const navigate = useNavigate();

  // Timer countdown for link resend
  useEffect(() => {
    let interval = null;
    if (step === 2 && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  // Step 1: Send Verification Link
  const handleSendLink = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const res = await sendVerificationLink(name, email, password);
      setDemoVerificationUrl(res.verificationUrl || '');
      setSuccessMsg(`Verification link sent to ${email}`);
      setStep(2);
      setResendTimer(30);
      setCanResend(false);
    } catch (err) {
      setError(
        err.response?.data?.error ||
        (!err.response ? 'Unable to connect to backend server. Please ensure Node.js server is running.' : 'Failed to send verification link. Please try again.')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resend Link
  const handleResendLink = async () => {
    if (!canResend) return;
    setError('');
    setSuccessMsg('');
    setIsSubmitting(true);

    try {
      const res = await resendVerificationLink(email);
      setDemoVerificationUrl(res.verificationUrl || '');
      setSuccessMsg('New verification link sent!');
      setResendTimer(30);
      setCanResend(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to resend link.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 bg-slate-50">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200/80 shadow-card"
      >
        {/* Header Icon */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-ocean-700 to-ocean-500 text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-ocean-500/20">
            {step === 1 ? <FileText className="w-6 h-6" /> : <MailCheck className="w-6 h-6" />}
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {step === 1 ? 'Create your account' : 'Check your email'}
          </h2>
          <p className="text-sm text-slate-500 mt-1.5">
            {step === 1 
              ? 'Get started with AI-driven Intelligent Document Processing.'
              : `We sent a verification link to ${email}`}
          </p>
        </div>

        {/* Global Error Banner */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2.5"
          >
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {step === 1 ? (
            /* STEP 1: Registration Input Form */
            <motion.form
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleSendLink}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Sarah Jenkins"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-ocean-500/20 focus:border-ocean-500 text-sm transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Work / Personal Email
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="sarah@company.com"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-ocean-500/20 focus:border-ocean-500 text-sm transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-ocean-500/20 focus:border-ocean-500 text-sm transition-all"
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-ocean-600 to-ocean-500 text-white font-semibold text-sm shadow-md shadow-ocean-500/25 hover:from-ocean-700 hover:to-ocean-600 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-70"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Generating Link...
                  </>
                ) : (
                  <>
                    Send Verification Link <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </motion.form>
          ) : (
            /* STEP 2: Pending Email Confirmation View */
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-ocean-100 text-ocean-600 flex items-center justify-center mx-auto">
                  <MailCheck className="w-6 h-6 text-ocean-600" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Verification Link Sent</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  We sent an email verification link to <strong className="text-slate-900 font-bold">{email}</strong>.
                  <br /><br />
                  Please open your email inbox and click <strong>"Confirm Email Address"</strong> to activate your account and automatically log in.
                </p>
              </div>

              <div className="flex items-center justify-between text-xs pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setError('');
                    setSuccessMsg('');
                  }}
                  className="text-slate-500 hover:text-slate-800 font-semibold"
                >
                  ← Change Email
                </button>

                <button
                  type="button"
                  disabled={!canResend || isSubmitting}
                  onClick={handleResendLink}
                  className={`flex items-center gap-1 font-bold ${
                    canResend ? 'text-ocean-600 hover:text-ocean-700' : 'text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSubmitting ? 'animate-spin' : ''}`} />
                  {canResend ? 'Resend Link' : `Resend in ${resendTimer}s`}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-6 text-center text-xs text-slate-500 border-t border-slate-100 pt-5">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-ocean-600 hover:text-ocean-700 transition-colors">
            Log in
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
