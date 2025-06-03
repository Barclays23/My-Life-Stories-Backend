const { db, admin, storage } = require('../config/firebaseAdmin');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { getDownloadURL } = require('firebase-admin/storage');
const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY;
const axios = require('axios');







exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, mobile } = req.body;
    const file = req.file;

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in Firebase Auth (not in firestore)
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: name,  // name is not a valid field for createUser or updateUser. The Firebase Auth SDK expects displayName.
    });

    let photoURL = '';

    // Upload profile picture to Firebase Storage
    if (file) {
      const fileName = `profile-pics/${userRecord.uid}-${uuidv4()}`;
      const fileRef = storage.bucket().file(fileName);

      await fileRef.save(file.buffer, {
        metadata: { contentType: file.mimetype },
      });

      // photoURL = `https://firebasestorage.googleapis.com/v0/b/${storage.bucket().name}/o/${encodeURIComponent(fileName)}?alt=media`;
      photoURL = await getDownloadURL(fileRef);
    }

    // Update display name and photo in Firebase Auth (not in firestore).
    await admin.auth().updateUser(userRecord.uid, {
      displayName: name,  // name is not a valid field for createUser or updateUser. The Firebase Auth SDK expects displayName.
      photoURL,
    });

    // Also Save user in Firestore
    await db.collection('users').doc(userRecord.uid).set({
      name,
      email,
      mobile,
      photoURL,
      hashedPassword: hashedPassword,
      isAdmin: false,   // manage from firestore
    });

    res.status(201).json({ success: true, userId: userRecord.uid });

    
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Registration failed' });
  }
};



// NOTE: currently doing with Client SDK (Bcoz, cannot store the auth user data in authContext from Admin SDK)
exports.signInUser = async (req, res) => {
   try {
      const { email, password } = req.body;

      const usersRef = admin.firestore().collection('users');
      const querySnapshot = await usersRef.where('email', '==', email).limit(1).get();

      if (querySnapshot.empty) {
         return res.status(404).json({ error: 'User not found. Please enter a registered email.' });
      }


      // Get user doc and uid
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();
      const userId = userDoc.id; // userId = uid

      // Firebase Identity Toolkit "signInWithPassword"
      const response = await axios.post(
         `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
         { email, password, returnSecureToken: true }
      );

      const data = response.data;

      res.status(200).json({
         success: true,
         idToken:       data.idToken,
         refreshToken:  data.refreshToken,
         expiresIn:     data.expiresIn,
         localId:       data.localId,
         message:       'Login successful',
      });
      
   } catch (err) {
      console.error('catch error in signIn :', err.response.data);
      const fbMsg = err?.response?.data?.error?.message;

      // 2️⃣  Map it to the auth/… codes you already use on the frontend
      const codeTable = {
         INVALID_LOGIN_CREDENTIALS:  'auth/wrong-password',
         INVALID_PASSWORD:           'auth/wrong-password',
         EMAIL_NOT_FOUND:            'auth/user-not-found',
         USER_DISABLED:              'auth/user-disabled',
         TOO_MANY_ATTEMPTS_TRY_LATER:'auth/too-many-requests',
      };

      const code = codeTable[fbMsg] || 'auth/internal-error';

      return res.status(400).json({
         code, // <-- frontend looks this up
         error: fbMsg || "Sign-in failed",
      });
   }
};



// NOTE: currently doing with Client SDK (API is not called this function)
exports.sendResetEmail = async (req, res) => {
   const { email } = req.body;

   if (!email) return res.status(400).json({ error: 'Email is required' });

   try {
      await axios.post(
         `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${FIREBASE_API_KEY}`,
         { requestType: 'PASSWORD_RESET', email }
      );

      return res.status(200).json({ message: 'Reset link sent' });

   } catch (err) {
      const msg = err.response?.data?.error?.message || 'Reset failed';
      return res.status(400).json({ error: msg });
   }
};




// PENDING (TO DO WITH ADMIN SDK)
exports.getUserProfile = async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    if (!userDoc.exists) return res.status(404).json({ error: 'User not found' });
    res.json(userDoc.data());
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
};

// PENDING (TO DO WITH ADMIN SDK)
exports.updateUserProfile = async (req, res) => {
  const { name, bio, profilePicUrl } = req.body;
  try {
    await db.collection('users').doc(req.user.uid).update({
      name,
      bio,
      profilePicUrl,
      updatedAt: admin.firestore.Timestamp.now()
    });
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
};