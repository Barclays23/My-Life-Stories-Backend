const { db } = require('../config/firebaseAdmin');

const adminAuth = async (req, res, next) => {
  try {
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    const userData = userDoc.data();

    if (!userDoc.exists || !userData.isAdmin) {
      return res.status(403).json({ error: 'Admin Access Required!' });
    }
    
    // Attach necessary admin info to req.admin (to store the hashed password in admin auth)
    req.admin = {
      uid: req.user.uid,
      hashedPassword: userData.hashedPassword
    };
    // console.log('admin middleware :', req.admin);

    next();

  } catch (error) {
    res.status(500).json({ error: 'Failed to verify admin status' });
  }
};

module.exports = adminAuth;