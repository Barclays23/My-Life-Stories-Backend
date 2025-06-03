const express = require('express');
const router = express.Router();
const heroController = require('../controllers/heroController');
const auth = require('../middlewares/userAuth');
const adminCheck = require('../middlewares/adminAuth');

router.post('/heroes', auth, adminCheck, heroController.createHero);
router.get('/heroes', heroController.getHeroes);

module.exports = router;