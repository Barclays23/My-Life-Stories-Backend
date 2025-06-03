const express = require('express');
const adminController = require('../controllers/adminController');
const auth = require('../middlewares/userAuth');
const adminCheck = require('../middlewares/adminAuth');

const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { admin, db, storage } = require('../config/firebaseAdmin');
const { getDownloadURL } = require('firebase-admin/storage');

const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() }); // or diskStorage



const router = express.Router();

// for books
router.get('/books', auth, adminCheck, adminController.getBooksList);
router.get('/book-details/:id', auth, adminCheck, adminController.getBookDetails);
router.post('/create-book', auth, adminCheck, upload.single('coverImage'), adminController.createBook);
router.put('/update-book/:bookId', auth, adminCheck, upload.single('coverImage'), adminController.updateBook);
router.delete('/delete-book/:bookId', auth, adminCheck, adminController.deleteBook);
router.patch('/publish-book/:bookId', auth, adminCheck, adminController.togglePublishBook);

// for chapters
router.get('/book-chapters/:bookId', auth, adminCheck, adminController.getChaptersByBook);
router.post('/add-chapter/:bookId', auth, adminCheck, adminController.createChapter);
router.put('/edit-chapter/:bookId/:chapterId', auth, adminCheck, adminController.updateChapter);
router.delete('/delete-chapter/:bookId/:chapterId', auth, adminCheck, adminController.deleteChapter);

// for moments
router.get('/chapter-moments/:bookId/:chapterNumber', auth, adminCheck, adminController.getMomentsByChapter);
router.post('/add-moment/:bookId/:chapterId', auth, adminCheck, upload.single('momentImage'), adminController.createMoment);
router.put('/edit-moment/:bookId/:chapterId/:momentId', auth, adminCheck, upload.single('updatedMomentImage'), adminController.updateMoment);
router.delete('/delete-moment/:bookId/:chapterId/:momentId', auth, adminCheck, adminController.deleteMoment);



module.exports = router;