const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const auth = require('../middlewares/userAuth');
const adminCheck = require('../middlewares/adminAuth');


router.post('/reviews', auth, reviewController.createReview);
router.delete('/reviews', auth, reviewController.deleteReview);

module.exports = router;