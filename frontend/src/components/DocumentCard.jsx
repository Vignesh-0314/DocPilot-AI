import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, ShieldAlert, CheckCircle, AlertTriangle, ArrowRight, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

export const DocumentCard = ({ document, onDelete }) => {
  const analysis = document.analysis_results && document.analysis_results.length > 0
    ? document.analysis_results[0]
    : null;

  const getRiskBadge = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'high':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> High Risk
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" /> Medium Risk
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Low Risk
          </span>
        );
    }
  };

  const formattedDate = new Date(document.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
    >
      <div>
        {/* Card Header: Type Badge & Risk Badge */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-ocean-50 text-ocean-700 border border-ocean-100">
            {analysis?.document_type || 'Document'}
          </span>
          {analysis && getRiskBadge(analysis.risk_level)}
        </div>

        {/* Title & Filename */}
        <h4 className="text-base font-bold text-slate-900 truncate group-hover:text-ocean-600 transition-colors">
          {document.original_name}
        </h4>
        <p className="text-xs text-slate-500 mt-1">
          Uploaded on {formattedDate} • {(document.file_size / 1024).toFixed(1)} KB
        </p>

        {/* Summary Snippet */}
        {analysis?.summary && (
          <p className="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
            "{analysis.summary}"
          </p>
        )}
      </div>

      {/* Footer Metrics & Actions */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        {analysis?.confidence ? (
          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
            <span>Confidence:</span>
            <span className="text-ocean-600 font-bold">{analysis.confidence}%</span>
          </div>
        ) : (
          <span className="text-xs text-amber-600 font-medium">Processing...</span>
        )}

        <div className="flex items-center gap-2">
          {onDelete && (
            <button
              onClick={() => onDelete(document.id)}
              className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
              title="Delete Document"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          <Link
            to={`/document/${document.id}`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-ocean-600 hover:text-ocean-700 bg-ocean-50 hover:bg-ocean-100/80 px-3 py-1.5 rounded-lg transition-colors"
          >
            View Details <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};
