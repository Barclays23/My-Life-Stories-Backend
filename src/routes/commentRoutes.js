const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const auth = require('../middlewares/userAuth');
const adminCheck = require('../middlewares/adminAuth');

router.post('/comments', auth, commentController.createComment);
router.put('/comments/reply', auth, adminCheck, commentController.addAdminReply);

module.exports = router;