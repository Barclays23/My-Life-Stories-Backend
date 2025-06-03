// const functions = require('firebase-functions');
// const { initializeApp, getApps, getApp } = require('firebase/app');
// const { getFirestore } = require('firebase/firestore');

const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config({ path: '../.env' });

// Validate environment variable
if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
  throw new Error('FIREBASE_SERVICE_ACCOUNT environment variable is not set in backend/.env');
}

// Resolve the absolute path for debugging
const serviceAccountPath = path.resolve(__dirname, process.env.FIREBASE_SERVICE_ACCOUNT);
console.log('Attempting to load service account from:', serviceAccountPath);


// Load the service account key
let serviceAccount;

try {
  serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT);
} catch (error) {
  throw new Error(`Failed to load service account key from ${serviceAccountPath}: ${error.message}`);
}


// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`,
  });
}




// Get Firestore instance
const db = admin.firestore();

module.exports = { db };


// const firebaseConfig = {
//   apiKey: process.env.FIREBASE_API_KEY || functions.config().mylifestoryapp?.api_key,
//   authDomain: process.env.FIREBASE_AUTH_DOMAIN || functions.config().mylifestoryapp?.auth_domain,
//   projectId: process.env.FIREBASE_PROJECT_ID || functions.config().mylifestoryapp?.project_id,
//   storageBucket: process.env.FIREBASE_STORAGE_BUCKET || functions.config().mylifestoryapp?.storage_bucket,
//   messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || functions.config().mylifestoryapp?.messaging_sender_id,
//   appId: process.env.FIREBASE_APP_ID || functions.config().mylifestoryapp?.app_id,
// };

// // Initialize Firebase app only if it hasn't been initialized
// const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
// const db = getFirestore(app);

// module.exports = { db };