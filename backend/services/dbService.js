import supabase from '../config/supabase.js';
import crypto from 'crypto';

// In-memory fallback store
const fallbackStore = {
  users: [],
  documents: [],
  analysisResults: [],
};

export const dbService = {
  // User operations
  async createUser({ name, email, passwordHash }) {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('users')
          .insert([{ name, email, password_hash: passwordHash }])
          .select()
          .single();
        if (!error && data) return data;
        console.warn('[DB Error] Supabase user insert failed, using fallback store:', error?.message || error);
      } catch (err) {
        console.warn('[DB Exception] Supabase user insert failed, using fallback store:', err?.message || err);
      }
    }
    
    const newUser = {
      id: crypto.randomUUID(),
      name,
      email,
      password_hash: passwordHash,
      created_at: new Date().toISOString()
    };
    fallbackStore.users.push(newUser);
    return newUser;
  },

  async findUserByEmail(email) {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .ilike('email', email)
          .maybeSingle();
        if (data) return data;
        if (error) {
          console.warn('[DB Error] Supabase findUserByEmail error:', error.message);
        }
      } catch (err) {
        console.warn('[DB Exception] Supabase findUserByEmail failed, using fallback store:', err?.message || err);
      }
    }
    return fallbackStore.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  },

  async findUserById(id) {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, name, email, created_at')
          .eq('id', id)
          .maybeSingle();
        if (data) return data;
        if (error) {
          console.warn('[DB Error] Supabase findUserById error:', error.message);
        }
      } catch (err) {
        console.warn('[DB Exception] Supabase findUserById failed, using fallback store:', err?.message || err);
      }
    }
    const user = fallbackStore.users.find(u => u.id === id);
    if (!user) return null;
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  // Document operations
  async createDocument({ userId, filename, originalName, fileType, fileSize, fileData }) {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('documents')
          .insert([{
            user_id: userId,
            filename,
            original_name: originalName,
            file_type: fileType,
            file_size: fileSize,
            file_data: fileData,
            status: 'uploaded'
          }])
          .select()
          .single();
        if (!error && data) return data;
      } catch (err) {
        console.warn('[DB Exception] Supabase createDocument failed, using fallback store:', err?.message || err);
      }
    }

    const doc = {
      id: crypto.randomUUID(),
      user_id: userId,
      filename,
      original_name: originalName,
      file_type: fileType,
      file_size: fileSize,
      file_data: fileData,
      status: 'uploaded',
      created_at: new Date().toISOString()
    };
    fallbackStore.documents.push(doc);
    return doc;
  },

  async saveAnalysisResult({ documentId, documentType, confidence, summary, riskLevel, riskExplanation, recommendations, extractedData, healthScore, fraudDetection, nextAction }) {
    if (supabase) {
      try {
        // Update document status
        await supabase.from('documents').update({ status: 'analyzed' }).eq('id', documentId);

        const { data, error } = await supabase
          .from('analysis_results')
          .insert([{
            document_id: documentId,
            document_type: documentType,
            confidence,
            summary,
            risk_level: riskLevel,
            risk_explanation: riskExplanation,
            recommendations,
            extracted_data: extractedData,
            health_score: healthScore,
            fraud_detection: fraudDetection,
            next_action: nextAction
          }])
          .select()
          .single();

        if (!error && data) return data;
      } catch (err) {
        console.warn('[DB Exception] Supabase saveAnalysisResult failed, using fallback store:', err?.message || err);
      }
    }

    // Fallback updates
    const doc = fallbackStore.documents.find(d => d.id === documentId);
    if (doc) doc.status = 'analyzed';

    const result = {
      id: crypto.randomUUID(),
      document_id: documentId,
      document_type: documentType,
      confidence,
      summary,
      risk_level: riskLevel,
      risk_explanation: riskExplanation,
      recommendations,
      extracted_data: extractedData,
      health_score: healthScore,
      fraud_detection: fraudDetection,
      next_action: nextAction,
      created_at: new Date().toISOString()
    };
    fallbackStore.analysisResults.push(result);
    return result;
  },

  async getUserDocuments(userId) {
    if (supabase) {
      try {
        const { data } = await supabase
          .from('documents')
          .select(`
            *,
            analysis_results (*)
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (data) return data;
      } catch (err) {
        console.warn('[DB Exception] Supabase getUserDocuments failed, using fallback store:', err?.message || err);
      }
    }

    return fallbackStore.documents
      .filter(d => d.user_id === userId)
      .map(doc => ({
        ...doc,
        analysis_results: fallbackStore.analysisResults.filter(r => r.document_id === doc.id)
      }))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  async getDocumentById(id, userId) {
    if (supabase) {
      try {
        const { data } = await supabase
          .from('documents')
          .select(`
            *,
            analysis_results (*)
          `)
          .eq('id', id)
          .eq('user_id', userId)
          .single();

        if (data) return data;
      } catch (err) {
        console.warn('[DB Exception] Supabase getDocumentById failed, using fallback store:', err?.message || err);
      }
    }

    const doc = fallbackStore.documents.find(d => d.id === id && d.user_id === userId);
    if (!doc) return null;

    const analysis = fallbackStore.analysisResults.filter(r => r.document_id === doc.id);
    return {
      ...doc,
      analysis_results: analysis
    };
  },

  async deleteDocument(id, userId) {
    if (supabase) {
      try {
        await supabase.from('documents').delete().eq('id', id).eq('user_id', userId);
      } catch (err) {
        console.warn('[DB Exception] Supabase deleteDocument failed, using fallback store:', err?.message || err);
      }
    }
    fallbackStore.documents = fallbackStore.documents.filter(d => !(d.id === id && d.user_id === userId));
    fallbackStore.analysisResults = fallbackStore.analysisResults.filter(r => r.document_id !== id);
    return true;
  }
};
