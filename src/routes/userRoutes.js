const express = require('express');

const userController = require('../controllers/userController');
const auth = require('../middlewares/userAuth');

const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() }); // or diskStorage



const router = express.Router();


router.post('/register', upload.single('photo'), userController.registerUser);
router.post('/login', userController.signInUser);  // CURRENTLY HANDLING FROM CLIENT SDK FUNCTIONS (NOT FROM NODE JS / USER CONTROLLER FUNCTION)
router.get('/profile', auth, userController.getUserProfile);
router.put('/profile', auth, userController.updateUserProfile);

module.exports = router;

