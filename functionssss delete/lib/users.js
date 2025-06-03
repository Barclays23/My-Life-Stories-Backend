const functions = require('firebase-functions');
const { getFirestore, Timestamp } = require('firebase-admin/firestore');
const { userSchema, toDate } = require('./schemas');

const db = getFirestore();

exports.fetchUsers = functions.https.onRequest(async (req, res) => {
  try {
    const snapshot = await db.collection('users').get();
    const users = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: toDate(doc.data().createdAt),
      updatedAt: toDate(doc.data().updatedAt)
    }));
    res.status(200).json({ status: 'success', data: users });
  } catch (error) {
    console.error('fetchUsers - Error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

exports.getUserById = functions.https.onRequest(async (req, res) => {
  try {
    const userId = req.query.id;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    const doc = await db.collection('users').doc(userId).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }
    const userData = {
      id: doc.id,
      ...doc.data(),
      createdAt: toDate(doc.data().createdAt),
      updatedAt: toDate(doc.data().updatedAt)
    };
    res.status(200).json({ status: 'success', data: userData });
  } catch (error) {
    console.error('getUserById - Error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

exports.addUser = functions.https.onRequest(async (req, res) => {
  try {
    const userData = req.body;
    if (!userData.uid || !userData.email || !userData.name) {
      return res.status(400).json({ error: 'UID, email, and name are required' });
    }
    const newUser = {
      ...userSchema,
      uid: userData.uid,
      email: userData.email,
      name: userData.name,
      isAdmin: userData.isAdmin || false,
      profilePicUrl: userData.profilePicUrl || '',
      bio: userData.bio || '',
      readingRef: userData.readingRef || '',
      readCount: userData.readCount || 0,
      reviewRef: userData.reviewRef || '',
      notificationRef: userData.notificationRef || '',
      isBlocked: userData.isBlocked || false,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    const docRef = await db.collection('users').add(newUser);
    res.status(201).json({ status: 'success', id: docRef.id });
  } catch (error) {
    console.error('addUser - Error:', error);
    res.status(500).json({ error: 'Failed to add user' });
  }
});

exports.updateUser = functions.https.onRequest(async (req, res) => {
  try {
    const userId = req.body.id;
    const updates = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    const userRef = db.collection('users').doc(userId);
    const doc = await userRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }
    const updatedData = {
      ...updates,
      updatedAt: Timestamp.now()
    };
    delete updatedData.id; // Remove ID from updates
    await userRef.update(updatedData);
    res.status(200).json({ status: 'success', message: 'User updated' });
  } catch (error) {
    console.error('updateUser - Error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

exports.deleteUser = functions.https.onRequest(async (req, res) => {
  try {
    const userId = req.query.id;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    const userRef = db.collection('users').doc(userId);
    const doc = await userRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }
    await userRef.delete();
    res.status(200).json({ status: 'success', message: 'User deleted' });
  } catch (error) {
    console.error('deleteUser - Error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});