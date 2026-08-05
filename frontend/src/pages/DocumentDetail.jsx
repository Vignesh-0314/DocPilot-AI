import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AnalysisResultView } from '../components/AnalysisResultView';
import api from '../services/api';
import { 
  ArrowLeft, 
  FileText, 
  Download, 
  Sparkles, 
  Eye, 
  Loader2, 
  AlertCircle,
  Calendar,
  HardDrive
} from 'lucide-react';
import { motion } from 'framer-motion';

export const DocumentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/document/${id}`);
        setDocument(res.data.document);
      } catch (err) {
        console.error('[Document Detail Error]:', err);
        setError('Failed to load document details.');
      } finally {
        setLoading(false);
      }
    };
    fetchDocument();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-ocean-600 animate-spin" />
        <p className="text-sm font-medium text-slate-600">Retrieving AI document analysis...</p>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h3 className="text-lg font-bold text-slate-900">Document Not Found</h3>
        <p className="text-xs text-slate-500">{error || 'The requested document does not exist.'}</p>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-ocean-600 text-white text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Dashboard
        </Link>
      </div>
    );
  }

  const analysis = document.analysis_results && document.analysis_results.length > 0
    ? document.analysis_results[0]
    : null;

  const formattedDate = new Date(document.created_at).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-ocean-600 bg-white border border-slate-200 px-3.5 py-2 rounded-xl hover:bg-slate-50 transition-colors self-start"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              showPreview 
                ? 'bg-ocean-600 text-white shadow-md' 
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Eye className="w-4 h-4" /> {showPreview ? 'Hide Original Document' : 'View Original Document'}
          </button>
        </div>
      </div>

      {/* Document Meta Header Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-ocean-50 text-ocean-600 border border-ocean-100 flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">{document.original_name}</h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> {formattedDate}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <HardDrive className="w-3.5 h-3.5 text-slate-400" /> {(document.file_size / 1024).toFixed(1)} KB
              </span>
              <span>•</span>
              <span className="uppercase font-bold text-ocean-600 bg-ocean-50 px-2 py-0.5 rounded">
                {document.file_type.split('/')[1]}
              </span>
            </div>
          </div>
        </div>

        {analysis && (
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-4 py-2 rounded-2xl self-start md:self-auto">
            <Sparkles className="w-4 h-4 text-ocean-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-700">
              Analyzed by Gemini AI Engine
            </span>
          </div>
        )}
      </div>

      {/* Side-by-side or Single View */}
      <div className={`grid grid-cols-1 ${showPreview ? 'lg:grid-cols-12' : ''} gap-6`}>
        
        {/* Document Preview Pane */}
        {showPreview && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-5 bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col h-[750px]"
          >
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-ocean-600" /> Original File Preview
            </h3>
            <div className="flex-1 bg-slate-100 rounded-2xl overflow-hidden flex items-center justify-center border border-slate-200">
              {document.file_type.startsWith('image/') ? (
                <img 
                  src={document.file_data} 
                  alt="Original Document" 
                  className="max-h-full max-w-full object-contain p-2"
                />
              ) : document.file_type === 'application/pdf' ? (
                <iframe
                  src={document.file_data}
                  title="PDF Preview"
                  className="w-full h-full border-none"
                />
              ) : (
                <p className="text-xs text-slate-500">Preview not directly embeddable.</p>
              )}
            </div>
          </motion.div>
        )}

        {/* AI Analysis Cards Pane */}
        <div className={showPreview ? 'lg:col-span-7' : 'w-full'}>
          {analysis ? (
            <AnalysisResultView 
              analysis={analysis} 
              documentName={document.original_name} 
            />
          ) : (
            <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center text-slate-500 text-sm">
              Analysis pending or not available.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
