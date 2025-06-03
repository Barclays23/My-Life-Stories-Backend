const admin = require('firebase-admin');
const dotenv = require('dotenv');

dotenv.config({ path: '../../.env' }); // Adjusted path: src/config/ -> backend/.env




try {
  if (!admin.apps.length) {
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      throw new Error('GOOGLE_APPLICATION_CREDENTIALS not set in .env');
    }

    admin.initializeApp({
      credential: admin.credential.cert(process.env.GOOGLE_APPLICATION_CREDENTIALS),
      // credential: admin.credential.cert(require(process.env.GOOGLE_APPLICATION_CREDENTIALS)), ✅
      // storageBucket: 'my-life-stories-23.appspot.com',  // not this.
      // storageBucket: 'my-life-stories-23.firebasestorage.app',// ✅ need to add this to .env file?
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET, // ✅ safer via env
    });

    console.log('Firebase Admin initialized successfully');
  }

} catch (error) {
  console.error('Firebase initialization error:', error.message);
  throw error; // Stop the app if Firebase fails
}


const db = admin.firestore();
const auth = admin.auth();
// const bucket = admin.storage().bucket();
const storage = admin.storage();

module.exports = { admin, db, auth, storage };