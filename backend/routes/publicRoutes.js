const express = require('express');
const {
  getHomepageData,
  downloadPublicDocument,
  getInstitutions,
  searchPortal,
  submitPublicSupportQuery,
} = require('../controllers/publicController');

const router = express.Router();

router.get('/homepage', getHomepageData);
router.get('/documents/:slug/download', downloadPublicDocument);
router.get('/institutions', getInstitutions);
router.get('/search', searchPortal);
router.post('/support-query', submitPublicSupportQuery);

module.exports = router;
