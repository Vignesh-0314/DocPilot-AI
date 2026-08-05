import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DragDropUpload } from '../components/DragDropUpload';
import { DocumentCard } from '../components/DocumentCard';
import api from '../services/api';
import { 
  Sparkles, 
  Upload, 
  FileText, 
  Search, 
  Filter, 
  ShieldAlert, 
  CheckCircle, 
  Loader2,
  FolderOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/document/list');
      setDocuments(res.data.documents || []);
    } catch (err) {
      console.error('[Dashboard Error]:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleUploadSuccess = (docId) => {
    setShowUploadModal(false);
    navigate(`/document/${docId}`);
  };

  const handleDeleteDocument = async (docId) => {
    try {
      await api.delete(`/document/${docId}`);
      setDocuments(prev => prev.filter(d => d.id !== docId));
    } catch (err) {
      console.error('[Delete Error]:', err);
    }
  };

  // Filter & Search logic
  const filteredDocuments = documents.filter(doc => {
    const analysis = doc.analysis_results?.[0];
    const docType = analysis?.document_type || 'Other';
    
    const matchesFilter = selectedFilter === 'All' || docType.toLowerCase() === selectedFilter.toLowerCase();
    
    const matchesSearch = 
      doc.original_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (analysis?.summary && analysis.summary.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  const categories = ['All', 'Invoice', 'Resume', 'Contract', 'Medical Report', 'Bank Statement'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Welcome Card Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-r from-ocean-900 via-ocean-800 to-ocean-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-ocean-900/10"
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold tracking-wide border border-white/15">
              <Sparkles className="w-3.5 h-3.5 text-ocean-300 animate-pulse" />
              <span>Intelligent Document Processing Active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.name || 'User'} 👋
            </h1>
            <p className="text-ocean-100 text-sm leading-relaxed">
              Upload your invoices, contracts, resumes, or medical reports to instantly extract structured JSON parameters, assess risks, and review key insights.
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowUploadModal(true)}
            className="shrink-0 py-3.5 px-6 rounded-2xl bg-white text-ocean-800 font-bold text-sm shadow-lg hover:bg-ocean-50 transition-colors flex items-center justify-center gap-2.5"
          >
            <Upload className="w-4 h-4 text-ocean-600" />
            Upload Document
          </motion.button>
        </div>

        {/* Decorative backdrop shapes */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-ocean-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-32 h-32 bg-sky-400/10 rounded-full blur-2xl pointer-events-none" />
      </motion.div>

      {/* Control Bar: Search & Category Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedFilter(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedFilter === cat
                  ? 'bg-ocean-600 text-white shadow-md shadow-ocean-500/20'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents or keywords..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-ocean-500/20 focus:border-ocean-500 transition-all"
          />
        </div>
      </div>

      {/* Recent Uploaded Documents Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-ocean-600" /> Recent Uploaded Documents
          </h2>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
            {filteredDocuments.length} files
          </span>
        </div>

        {loading ? (
          <div className="py-16 text-center flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-ocean-600 animate-spin" />
            <p className="text-sm font-medium text-slate-500">Fetching document repository...</p>
          </div>
        ) : filteredDocuments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredDocuments.map((doc) => (
              <DocumentCard
                key={doc.id}
                document={doc}
                onDelete={handleDeleteDocument}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-300 max-w-md mx-auto my-8">
            <div className="w-14 h-14 rounded-2xl bg-ocean-50 text-ocean-600 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900">No documents found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              Upload your first business document to see instant AI analysis and structured metrics.
            </p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="mt-5 px-5 py-2.5 rounded-xl bg-ocean-600 text-white font-semibold text-xs shadow-md shadow-ocean-500/20 hover:bg-ocean-700 transition-colors inline-flex items-center gap-2"
            >
              <Upload className="w-4 h-4" /> Upload Document
            </button>
          </div>
        )}
      </div>

      {/* Upload Document Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl"
            >
              <DragDropUpload
                onUploadSuccess={handleUploadSuccess}
                onClose={() => setShowUploadModal(false)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
