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
  TrendingUp
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
    extracted_data = {}
  } = analysis;

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

      {/* Executive Summary Card */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
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
          transition={{ delay: 0.1 }}
          className={`p-6 rounded-2xl border ${riskStyle.bg} ${riskStyle.border}`}
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
        transition={{ delay: 0.2 }}
        className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
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
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
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
