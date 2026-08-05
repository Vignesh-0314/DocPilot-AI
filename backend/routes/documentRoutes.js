import express from 'express';
import { 
  uploadDocument, 
  analyzeDocument, 
  getUserDocuments, 
  getDocumentById, 
  deleteDocument 
} from '../controllers/documentController.js';
import { authenticateJWT } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(authenticateJWT);

router.post('/upload', upload.single('file'), uploadDocument);
router.post('/analyze', analyzeDocument);
router.get('/list', getUserDocuments);
router.get('/:id', getDocumentById);
router.delete('/:id', deleteDocument);

export default router;
