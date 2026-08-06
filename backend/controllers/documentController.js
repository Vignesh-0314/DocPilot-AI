import { dbService } from '../services/dbService.js';
import { analyzeDocumentWithGemini } from '../services/geminiService.js';

export const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a valid file (PDF, PNG, JPG, JPEG).' });
    }

    const { originalname, mimetype, size, buffer } = req.file;
    const userId = req.user.id;

    // Convert file buffer to base64 data URI for easy previewing & persistent storage
    const base64Data = `data:${mimetype};base64,${buffer.toString('base64')}`;
    const filename = `${Date.now()}_${originalname.replace(/\s+/g, '_')}`;

    const doc = await dbService.createDocument({
      userId,
      filename,
      originalName: originalname,
      fileType: mimetype,
      fileSize: size,
      fileData: base64Data
    });

    res.status(201).json({
      message: 'Document uploaded successfully',
      document: doc
    });
  } catch (error) {
    console.error('[Upload Document Error]:', error);
    res.status(500).json({ error: 'Failed to upload document.' });
  }
};

export const analyzeDocument = async (req, res) => {
  try {
    const { documentId } = req.body;
    const userId = req.user.id;

    if (!documentId) {
      return res.status(400).json({ error: 'documentId is required for analysis.' });
    }

    const doc = await dbService.getDocumentById(documentId, userId);
    if (!doc) {
      return res.status(404).json({ error: 'Document not found or access denied.' });
    }

    // Convert base64 back to buffer for Gemini API processing
    const base64Content = doc.file_data.split(',')[1];
    const fileBuffer = Buffer.from(base64Content, 'base64');

    console.log(`[Analyzing Document] ID: ${documentId}, Type: ${doc.file_type}, File: ${doc.original_name}`);

    // Call Gemini Service
    const aiAnalysis = await analyzeDocumentWithGemini(fileBuffer, doc.file_type, doc.original_name);

    // Save to Database
    const savedResult = await dbService.saveAnalysisResult({
      documentId: doc.id,
      documentType: aiAnalysis.documentType,
      confidence: aiAnalysis.confidence,
      summary: aiAnalysis.summary,
      riskLevel: aiAnalysis.riskLevel,
      riskExplanation: aiAnalysis.riskExplanation,
      recommendations: aiAnalysis.recommendations,
      extractedData: aiAnalysis.extractedData,
      healthScore: aiAnalysis.healthScore,
      fraudDetection: aiAnalysis.fraudDetection,
      nextAction: aiAnalysis.nextAction
    });

    res.json({
      message: 'Document analysis completed successfully',
      documentId: doc.id,
      analysis: savedResult
    });
  } catch (error) {
    console.error('[Analyze Document Error]:', error);
    res.status(500).json({ error: 'Failed to analyze document with AI engine.' });
  }
};

export const getUserDocuments = async (req, res) => {
  try {
    const userId = req.user.id;
    const documents = await dbService.getUserDocuments(userId);
    res.json({ documents });
  } catch (error) {
    console.error('[Get User Documents Error]:', error);
    res.status(500).json({ error: 'Failed to fetch user documents.' });
  }
};

export const getDocumentById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const doc = await dbService.getDocumentById(id, userId);
    if (!doc) {
      return res.status(404).json({ error: 'Document not found.' });
    }

    res.json({ document: doc });
  } catch (error) {
    console.error('[Get Document By ID Error]:', error);
    res.status(500).json({ error: 'Failed to fetch document details.' });
  }
};

export const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await dbService.deleteDocument(id, userId);
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('[Delete Document Error]:', error);
    res.status(500).json({ error: 'Failed to delete document.' });
  }
};
