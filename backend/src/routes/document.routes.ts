import { Router } from 'express';
import { DocumentController } from '../controllers/document.controller';
import { authenticate, optionalAuth } from '../middleware/auth.middleware';

const router = Router();

router.post('/upload', optionalAuth, DocumentController.uploadMiddleware, DocumentController.upload);
router.get('/my', authenticate, DocumentController.getUserDocuments);
router.get('/:id', optionalAuth, DocumentController.getDocument);
router.delete('/:id', authenticate, DocumentController.deleteDocument);

export default router;
