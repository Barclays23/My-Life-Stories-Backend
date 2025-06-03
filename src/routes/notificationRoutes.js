const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const auth = require('../middlewares/userAuth');
const adminCheck = require('../middlewares/adminAuth');

router.post('/notifications', auth, notificationController.createNotification);
router.put('/notifications/read', auth, notificationController.markAsRead);

module.exports = router;