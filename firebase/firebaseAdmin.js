import admin from 'firebase-admin';
import fs from 'fs';
import dotenv from 'dotenv';


dotenv.config(); // load .env

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT;

// Only initialize once
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(
    // fs.readFileSync('./firebase/serviceAccountKey.json', 'utf8')
    fs.readFileSync('serviceAccountPath', 'utf8')
  );

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'my-life-stories-23.appspot.com',
  });
}

const db = admin.firestore();
const auth = admin.auth();
const bucket = admin.storage().bucket();

export { admin, db, auth, bucket };
