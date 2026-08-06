import React from 'react';
import { 
  FileText, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  ListChecks, 
  Table, 
  Info,
  TrendingUp,
  Activity,
  ShieldCheck,
  ArrowRight,
  XCircle,
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

export const AnalysisResultView = ({ analysis, documentName }) => {
  if (!analysis) return null;

  const {
    document_type,
    confidence,
    summary,
    risk_level,
    risk_explanation,
    recommendations = [],
    extracted_data = {},
    health_score,
    healthScore = health_score,
    fraud_detection,
    fraudDetection = fraud_detection,
    next_action,
    nextAction = next_action
  } = analysis;

  // --- Helpers for Risk Styling ---
  const getRiskColor = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'high':
        return {
          bg: 'bg-rose-50',
          border: 'border-rose-200',
          text: 'text-rose-700',
          badge: 'bg-rose-600 text-white',
          icon: <AlertTriangle className="w-5 h-5 text-rose-600" />
        };
      case 'medium':
        return {
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          text: 'text-amber-700',
          badge: 'bg-amber-500 text-white',
          icon: <ShieldAlert className="w-5 h-5 text-amber-600" />
        };
      default:
        return {
          bg: 'bg-emerald-50',
          border: 'border-emerald-200',
          text: 'text-emerald-700',
          badge: 'bg-emerald-600 text-white',
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />
        };
    }
  };

  const riskStyle = getRiskColor(risk_level);

  // --- Feature 1: Health Score Helper ---
  const scoreVal = healthScore?.score ?? 90;
  const healthStatus = healthScore?.status || (scoreVal >= 90 ? 'Excellent' : scoreVal >= 75 ? 'Good' : scoreVal >= 60 ? 'Needs Review' : 'Poor');
  const healthReasons = healthScore?.reasons || healthScore?.healthReason || ['Document structure is clear and readable.'];

  const getHealthTheme = (score) => {
    if (score >= 90) {
      return {
        stroke: 'stroke-emerald-500',
        text: 'text-emerald-600',
        badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        barBg: 'bg-emerald-500'
      };
    } else if (score >= 75) {
      return {
        stroke: 'stroke-amber-500',
        text: 'text-amber-600',
        badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
        barBg: 'bg-amber-500'
      };
    } else if (score >= 60) {
      return {
        stroke: 'stroke-orange-500',
        text: 'text-orange-600',
        badgeBg: 'bg-orange-50 text-orange-700 border-orange-200',
        barBg: 'bg-orange-500'
      };
    } else {
      return {
        stroke: 'stroke-rose-500',
        text: 'text-rose-600',
        badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
        barBg: 'bg-rose-500'
      };
    }
  };

  const healthTheme = getHealthTheme(scoreVal);
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (scoreVal / 100) * circumference;

  // --- Feature 2: Fraud Detection Helper ---
  const fraudRisk = fraudDetection?.risk || 'Low';
  const fraudScore = fraudDetection?.score ?? 15;
  const fraudIssues = fraudDetection?.issues || [];

  const getFraudRiskBadge = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'high':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'medium':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
  };

  const getSeverityBadge = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'high':
        return 'bg-rose-100 text-rose-700 border border-rose-200';
      case 'medium':
        return 'bg-amber-100 text-amber-800 border border-amber-200';
      default:
        return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
    }
  };

  // --- Feature 3: Next Best Action Helper ---
  const actionVal = nextAction?.action || 'Review';
  const actionReason = nextAction?.reason || 'Document requires standard verification prior to final sign-off.';

  const getActionConfig = (act) => {
    switch (act) {
      case 'Approve':
        return {
          icon: <CheckCircle2 className="w-7 h-7 text-emerald-600" />,
          buttonBg: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/25',
          border: 'border-emerald-200 bg-emerald-50/40',
          badgeBg: 'bg-emerald-100 text-emerald-800',
          titleColor: 'text-emerald-900',
          btnText: 'Approve Document'
        };
      case 'Reject':
        return {
          icon: <XCircle className="w-7 h-7 text-rose-600" />,
          buttonBg: 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/25',
          border: 'border-rose-200 bg-rose-50/40',
          badgeBg: 'bg-rose-100 text-rose-800',
          titleColor: 'text-rose-900',
          btnText: 'Reject Document'
        };
      case 'Request More Information':
      case 'Request Information':
        return {
          icon: <HelpCircle className="w-7 h-7 text-ocean-600" />,
          buttonBg: 'bg-ocean-600 hover:bg-ocean-700 text-white shadow-ocean-500/25',
          border: 'border-ocean-200 bg-ocean-50/40',
          badgeBg: 'bg-ocean-100 text-ocean-800',
          titleColor: 'text-ocean-900',
          btnText: 'Request More Information'
        };
      default: // Review
        return {
          icon: <AlertTriangle className="w-7 h-7 text-amber-600" />,
          buttonBg: 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/25',
          border: 'border-amber-200 bg-amber-50/40',
          badgeBg: 'bg-amber-100 text-amber-800',
          titleColor: 'text-amber-900',
          btnText: 'Flag for Manual Review'
        };
    }
  };

  const actionConfig = getActionConfig(actionVal);

  return (
    <div className="space-y-6">
      
      {/* Top Banner Stats Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Document Type Badge Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-ocean-100 text-ocean-600 flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">Document Type</p>
            <p className="text-lg font-extrabold text-slate-900 mt-0.5">{document_type || 'Unclassified'}</p>
          </div>
        </div>

        {/* Confidence Score Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">AI Confidence</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-lg font-extrabold text-slate-900">{confidence}%</span>
              <div className="w-20 bg-slate-100 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-ocean-500 h-full rounded-full" 
                  style={{ width: `${confidence}%` }} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Risk Score Card */}
        <div className={`p-5 rounded-2xl border shadow-sm flex items-center justify-between ${riskStyle.bg} ${riskStyle.border}`}>
          <div className="flex items-center gap-3">
            {riskStyle.icon}
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-slate-500">Risk Assessment</p>
              <p className={`text-lg font-extrabold ${riskStyle.text} mt-0.5`}>{risk_level} Risk</p>
            </div>
          </div>
          <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${riskStyle.badge}`}>
            {risk_level}
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FEATURE 1 & FEATURE 2: Health Score & Fraud Detection Grid */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* FEATURE 1: AI Document Health Score Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-ocean-50 border border-ocean-100 text-ocean-600 flex items-center justify-center">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">AI Document Health</h3>
                  <p className="text-xs text-slate-500">Completeness & structural quality</p>
                </div>
              </div>
              <span className={`px-3 py-1 text-xs font-bold rounded-full border ${healthTheme.badgeBg}`}>
                {healthStatus}
              </span>
            </div>

            {/* Gauge & Reasons Layout */}
            <div className="flex flex-col sm:flex-row items-center gap-6 my-4 bg-slate-50/60 p-4 rounded-2xl border border-slate-100">
              
              {/* Circular Gauge */}
              <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
                <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className="text-slate-200 stroke-current"
                    strokeWidth="9"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className={`${healthTheme.stroke} stroke-current transition-all duration-1000 ease-out`}
                    strokeWidth="9"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-slate-900">{scoreVal}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">/ 100</span>
                </div>
              </div>

              {/* Health Reasons List */}
              <div className="flex-1 space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Health Factors
                </p>
                {healthReasons.map((reason, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{reason}</span>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </motion.div>

        {/* FEATURE 2: AI Fraud & Tampering Detection Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Fraud & Tampering Detection</h3>
                  <p className="text-xs text-slate-500">Stamp, signature & font integrity</p>
                </div>
              </div>
              <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getFraudRiskBadge(fraudRisk)}`}>
                {fraudRisk} Fraud Risk
              </span>
            </div>

            {/* Score Progress Bar */}
            <div className="mb-4 bg-slate-50/60 p-3 rounded-2xl border border-slate-100">
              <div className="flex justify-between items-center text-xs mb-1.5 font-bold">
                <span className="text-slate-600 uppercase tracking-wider">Tampering Suspicion Score</span>
                <span className="text-slate-900">{fraudScore}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-700 ${
                    fraudScore > 40 ? 'bg-rose-500' : fraudScore > 20 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${fraudScore}%` }}
                />
              </div>
            </div>

            {/* Issue List */}
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Detected Fraud & Security Checks ({fraudIssues.length})
              </p>
              {fraudIssues.length > 0 ? (
                fraudIssues.map((issue, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-slate-400" /> {issue.title}
                      </span>
                      <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-md ${getSeverityBadge(issue.severity)}`}>
                        {issue.severity}
                      </span>
                    </div>
                    <p className="text-slate-600 leading-snug">{issue.description}</p>
                  </div>
                ))
              ) : (
                <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>No visual tampering, altered dates, or font anomalies detected.</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

      </div>

      {/* ========================================================================= */}
      {/* FEATURE 3: AI Next Best Action Card (Final Decision Card) */}
      {/* ========================================================================= */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className={`p-6 sm:p-8 rounded-3xl border shadow-card transition-all ${actionConfig.border}`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-white shadow-sm border border-slate-200/80 shrink-0 mt-0.5">
              {actionConfig.icon}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-extrabold text-slate-400">
                  AI Decision Engine • Next Best Action
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${actionConfig.badgeBg}`}>
                  {actionVal}
                </span>
              </div>
              <h3 className={`text-xl font-black tracking-tight ${actionConfig.titleColor}`}>
                Recommended Action: {actionVal}
              </h3>
              <p className="text-slate-700 text-sm leading-relaxed max-w-2xl mt-1">
                {actionReason}
              </p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`px-6 py-3.5 rounded-2xl font-bold text-sm shadow-lg flex items-center justify-center gap-2.5 transition-all shrink-0 ${actionConfig.buttonBg}`}
          >
            <span>{actionConfig.btnText}</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>
      </motion.div>

      {/* Executive Summary Card */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm"
      >
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-ocean-500" /> Executive Summary
        </h3>
        <p className="text-slate-700 leading-relaxed text-sm bg-slate-50/80 p-4 rounded-xl border border-slate-100">
          {summary}
        </p>
      </motion.div>

      {/* Risk Explanation Card */}
      {risk_explanation && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`p-6 rounded-3xl border ${riskStyle.bg} ${riskStyle.border}`}
        >
          <h3 className={`text-base font-bold flex items-center gap-2 mb-2 ${riskStyle.text}`}>
            <Info className="w-5 h-5" /> Risk Analysis & Key Findings
          </h3>
          <p className="text-slate-700 text-sm leading-relaxed">
            {risk_explanation}
          </p>
        </motion.div>
      )}

      {/* Extracted Data Card */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm"
      >
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
          <Table className="w-5 h-5 text-ocean-500" /> Extracted Structured Information
        </h3>

        {Object.keys(extracted_data).length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(extracted_data).map(([key, value], idx) => (
              <div 
                key={idx}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-center"
              >
                <span className="text-xs font-semibold text-slate-400 capitalize tracking-wide">
                  {key.replace(/_/g, ' ')}
                </span>
                <span className="text-sm font-semibold text-slate-800 mt-1 break-words">
                  {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500 italic">No explicit key-value parameters were extracted.</p>
        )}
      </motion.div>

      {/* Recommendations Card */}
      {recommendations && recommendations.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm"
        >
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
            <ListChecks className="w-5 h-5 text-emerald-600" /> Recommended Action Items
          </h3>
          <div className="space-y-2.5">
            {recommendations.map((rec, index) => (
              <div 
                key={index} 
                className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 text-sm text-slate-800"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span className="leading-snug">{rec}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

    </div>
  );
};
