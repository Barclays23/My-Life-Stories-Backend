const express = require('express');
const router = express.Router();
const momentController = require('../controllers/momentController');
const auth = require('../middlewares/userAuth');
const adminCheck = require('../middlewares/adminAuth');

router.post('/moments', auth, adminCheck, momentController.createMoment);
router.delete('/moments', auth, adminCheck, momentController.deleteMoment);

module.exports = router;