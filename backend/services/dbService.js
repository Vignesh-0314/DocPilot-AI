import supabase from '../config/supabase.js';
import crypto from 'crypto';

// In-memory fallback store (only used when supabase === null)
const fallbackStore = {
  users: [],
  documents: [],
  analysisResults: [],
};

export const dbService = {
  // User operations
  async createUser({ name, email, passwordHash }) {
    const cleanEmail = email.trim().toLowerCase();

    if (supabase) {
      const { data, error } = await supabase
        .from('users')
        .insert([{
          name,
          email: cleanEmail,
          password_hash: passwordHash || 'OAUTH_GOOGLE_USER'
        }])
        .select()
        .single();

      if (error) {
        console.error('[Supabase Error] createUser failed:', error.message || error);
        throw new Error(`Database error creating user: ${error.message}`);
      }
      return data;
    }

    const newUser = {
      id: crypto.randomUUID(),
      name,
      email: cleanEmail,
      password_hash: passwordHash || 'OAUTH_GOOGLE_USER',
      created_at: new Date().toISOString()
    };
    fallbackStore.users.push(newUser);
    return newUser;
  },

  async findUserByEmail(email) {
    if (!email) return null;
    const cleanEmail = email.trim().toLowerCase();

    if (supabase) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .ilike('email', cleanEmail)
        .maybeSingle();

      if (error) {
        console.error('[Supabase Error] findUserByEmail failed:', error.message || error);
        throw new Error(`Database error looking up user: ${error.message}`);
      }
      return data;
    }

    return fallbackStore.users.find(u => u.email.toLowerCase() === cleanEmail) || null;
  },

  async findUserById(id) {
    if (!id) return null;

    if (supabase) {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, created_at')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('[Supabase Error] findUserById failed:', error.message || error);
        throw new Error(`Database error looking up user by ID: ${error.message}`);
      }
      return data;
    }

    const user = fallbackStore.users.find(u => u.id === id);
    if (!user) return null;
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  // Document operations
  async createDocument({ userId, filename, originalName, fileType, fileSize, fileData }) {
    if (supabase) {
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

      if (error) {
        console.error('[Supabase Error] createDocument failed:', error.message || error);
        throw new Error(`Database error creating document: ${error.message}`);
      }
      return data;
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
      // Update document status
      const { error: updateErr } = await supabase
        .from('documents')
        .update({ status: 'analyzed' })
        .eq('id', documentId);

      if (updateErr) {
        console.warn('[Supabase Warning] Failed to update document status:', updateErr.message);
      }

      const { data, error } = await supabase
        .from('analysis_results')
        .insert([{
          document_id: documentId,
          document_type: documentType,
          confidence: confidence ?? 85,
          summary: summary || '',
          risk_level: riskLevel || 'Low',
          risk_explanation: riskExplanation || '',
          recommendations: recommendations || [],
          extracted_data: extractedData || {},
          health_score: healthScore || {},
          fraud_detection: fraudDetection || {},
          next_action: nextAction || {}
        }])
        .select()
        .single();

      if (error) {
        console.error('[Supabase Error] saveAnalysisResult failed:', error.message || error);
        throw new Error(`Database error saving analysis result: ${error.message}`);
      }
      return data;
    }

    // Fallback store updates
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
    if (!userId) return [];

    if (supabase) {
      const { data, error } = await supabase
        .from('documents')
        .select(`
          *,
          analysis_results (*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[Supabase Error] getUserDocuments failed:', error.message || error);
        throw new Error(`Database error retrieving user documents: ${error.message}`);
      }
      return data || [];
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
    if (!id || !userId) return null;

    if (supabase) {
      const { data, error } = await supabase
        .from('documents')
        .select(`
          *,
          analysis_results (*)
        `)
        .eq('id', id)
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('[Supabase Error] getDocumentById failed:', error.message || error);
        throw new Error(`Database error retrieving document: ${error.message}`);
      }
      return data;
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
    if (!id || !userId) return false;

    if (supabase) {
      // Delete analysis_results first if cascade constraint isn't set
      await supabase.from('analysis_results').delete().eq('document_id', id);

      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        console.error('[Supabase Error] deleteDocument failed:', error.message || error);
        throw new Error(`Database error deleting document: ${error.message}`);
      }
      return true;
    }

    fallbackStore.documents = fallbackStore.documents.filter(d => !(d.id === id && d.user_id === userId));
    fallbackStore.analysisResults = fallbackStore.analysisResults.filter(r => r.document_id !== id);
    return true;
  }
};
