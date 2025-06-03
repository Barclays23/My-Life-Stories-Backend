const express = require('express');
const router = express.Router();
const chapterController = require('../controllers/chapterController');
const auth = require('../middlewares/userAuth');
// const adminCheck = require('../middlewares/adminAuth');



// router.post('/add-chapter', auth, adminCheck, chapterController.createChapter);
// router.delete('/delete-chapter', auth, adminCheck, chapterController.deleteChapter);

module.exports = router;