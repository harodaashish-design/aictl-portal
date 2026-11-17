const express = require('express');
const {
  createApplication,
  getMyApplications,
  getApplicationById,
  updateDraftApplication,
  submitDraftApplication,
  deleteDraftApplication,
  uploadApplicationDocument,
  getMyDocuments,
  downloadOrPreviewDocument,
  deleteApplicationDocument,
} = require('../controllers/applicationController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { uploadDocument } = require('../middleware/uploadMiddleware');

const router = express.Router();

router.use(protect);

// Student-specific routes
router.get('/my', requireRole('student'), getMyApplications);
router.get('/documents/my', requireRole('student'), getMyDocuments);
router.post('/', requireRole('student'), createApplication);
router.put('/:id', requireRole('student'), updateDraftApplication);
router.post('/:id/submit', requireRole('student'), submitDraftApplication);
router.delete('/:id', requireRole('student'), deleteDraftApplication);
router.post(
  '/:id/documents',
  requireRole('student'),
  uploadDocument.single('file'),
  uploadApplicationDocument
);
router.delete('/:id/documents/:filename', requireRole('student'), deleteApplicationDocument);

// Accessible by owning student OR admin (ownership enforced in controller)
router.get('/:id', getApplicationById);
router.get('/:id/documents/:filename', downloadOrPreviewDocument);

module.exports = router;
