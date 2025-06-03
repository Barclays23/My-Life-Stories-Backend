const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const auth = require('../middlewares/userAuth');
const adminCheck = require('../middlewares/adminAuth');

router.get('/books', bookController.getBooks);
router.get('/random-books', bookController.getRandomBooks);

module.exports = router;