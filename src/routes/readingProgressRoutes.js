const express = require('express');
const router = express.Router();
const readingProgressController = require('../controllers/readingProgressController');
const auth = require('../middlewares/userAuth');
const adminCheck = require('../middlewares/adminAuth');



router.post('/reading-progress', auth, readingProgressController.updateReadingProgress);

module.exports = router;