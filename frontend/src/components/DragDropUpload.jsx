import React, { useState, useRef } from 'react';
import { Upload, FileText, Image as ImageIcon, X, CheckCircle2, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

export const DragDropUpload = ({ onUploadSuccess, onClose }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateAndSetFile = (file) => {
    setError(null);
    if (!file) return;

    if (!allowedTypes.includes(file.type)) {
      setError('Unsupported file type. Please select a PDF, PNG, JPG, or JPEG file.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size exceeds 10MB limit.');
      return;
    }

    setSelectedFile(file);

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError(null);
    setProgress(20);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      // Upload file
      const uploadRes = await api.post('/document/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 60) / progressEvent.total);
          setProgress(20 + percentCompleted);
        }
      });

      const uploadedDoc = uploadRes.data.document;
      setProgress(85);
      setUploading(false);
      setAnalyzing(true);

      // Trigger AI Analysis automatically
      const analyzeRes = await api.post('/document/analyze', { documentId: uploadedDoc.id });
      setProgress(100);

      setTimeout(() => {
        if (onUploadSuccess) {
          onUploadSuccess(uploadedDoc.id, analyzeRes.data.analysis);
        }
      }, 500);

    } catch (err) {
      console.error('[Upload/Analyze Error]:', err);
      setError(err.response?.data?.error || 'Failed to upload or analyze document.');
      setUploading(false);
      setAnalyzing(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-100 max-w-xl w-full mx-auto relative overflow-hidden">
      
      {/* Modal Close Button if used in Modal */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-slate-900 flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5 text-ocean-500" /> Upload Document for AI Analysis
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          Upload PDF invoices, resumes, contracts, or bank statements for instant insights.
        </p>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm flex items-center gap-2"
        >
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{error}</span>
        </motion.div>
      )}

      {/* Drag & Drop Zone */}
      {!selectedFile ? (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
            dragActive
              ? 'border-ocean-500 bg-ocean-50/60 scale-[1.01]'
              : 'border-slate-300 hover:border-ocean-400 hover:bg-slate-50/80'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={handleChange}
            className="hidden"
          />
          <div className="w-14 h-14 rounded-2xl bg-ocean-100/70 text-ocean-600 flex items-center justify-center mx-auto mb-3 shadow-inner">
            <Upload className="w-7 h-7" />
          </div>
          <p className="text-base font-semibold text-slate-800">
            Click to upload or drag & drop file
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Supports PDF, PNG, JPG, JPEG (Max 10MB)
          </p>
        </div>
      ) : (
        /* File Selected Preview & Progress */
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="File Preview"
                className="w-14 h-14 object-cover rounded-lg border border-slate-200 shadow-sm shrink-0"
              />
            ) : (
              <div className="w-14 h-14 rounded-lg bg-ocean-100 text-ocean-700 flex items-center justify-center shrink-0">
                <FileText className="w-7 h-7" />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">
                {selectedFile.name}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • {selectedFile.type.split('/')[1].toUpperCase()}
              </p>
            </div>

            {!(uploading || analyzing) && (
              <button
                onClick={() => {
                  setSelectedFile(null);
                  setPreviewUrl(null);
                }}
                className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Progress Bar & Status indicator */}
          {(uploading || analyzing) && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 text-ocean-600 animate-spin" />
                  {uploading ? 'Uploading document...' : 'Gemini AI is analyzing document...'}
                </span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <motion.div
                  className="bg-gradient-to-r from-ocean-500 to-ocean-600 h-full rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          )}

          {/* Action Button */}
          {!(uploading || analyzing) && (
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={handleSubmit}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-ocean-600 to-ocean-500 text-white font-semibold shadow-md shadow-ocean-500/25 hover:from-ocean-700 hover:to-ocean-600 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" /> Analyze Document with AI
            </motion.button>
          )}
        </div>
      )}
    </div>
  );
};
