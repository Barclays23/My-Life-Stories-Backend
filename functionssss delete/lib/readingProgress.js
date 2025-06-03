const functions = require('firebase-functions');
const { getFirestore, Timestamp } = require('firebase-admin/firestore');
const { readingProgressSchema, toDate } = require('./schemas');

const db = getFirestore();

exports.fetchReadingProgress = functions.https.onRequest(async (req, res) => {
  try {
    const snapshot = await db.collection('readingProgress').get();
    const progressRecords = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      lastReadAt: toDate(doc.data().lastReadAt)
    }));
    res.status(200).json({ status: 'success', data: progressRecords });
  } catch (error) {
    console.error('fetchReadingProgress - Error:', error);
    res.status(500).json({ error: 'Failed to fetch reading progress' });
  }
});

exports.getReadingProgressById = functions.https.onRequest(async (req, res) => {
  try {
    const progressId = req.query.id;
    if (!progressId) {
      return res.status(400).json({ error: 'Reading progress ID is required' });
    }
    const doc = await db.collection('readingProgress').doc(progressId).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Reading progress not found' });
    }
    const progressData = {
      id: doc.id,
      ...doc.data(),
      lastReadAt: toDate(doc.data().lastReadAt)
    };
    res.status(200).json({ status: 'success', data: progressData });
  } catch (error) {
    console.error('getReadingProgressById - Error:', error);
    res.status(500).json({ error: 'Failed to fetch reading progress' });
  }
});

exports.addReadingProgress = functions.https.onRequest(async (req, res) => {
  try {
    const progressData = req.body;
    if (!progressData.userId || !progressData.bookId) {
      return res.status(400).json({ error: 'User ID and book ID are required' });
    }
    const newProgress = {
      ...readingProgressSchema,
      userId: progressData.userId,
      bookId: progressData.bookId,
      lastReadChapterId: progressData.lastReadChapterId || '',
      lastReadMomentId: progressData.lastReadMomentId || '',
      completedMomentIds: progressData.completedMomentIds || [],
      lastReadAt: Timestamp.now()
    };
    const docRef = await db.collection('readingProgress').add(newProgress);
    res.status(201).json({ status: 'success', id: docRef.id });
  } catch (error) {
    console.error('addReadingProgress - Error:', error);
    res.status(500).json({ error: 'Failed to add reading progress' });
  }
});

exports.updateReadingProgress = functions.https.onRequest(async (req, res) => {
  try {
    const progressId = req.body.id;
    const updates = req.body;
    if (!progressId) {
      return res.status(400).json({ error: 'Reading progress ID is required' });
    }
    const progressRef = db.collection('readingProgress').doc(progressId);
    const doc = await progressRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Reading progress not found' });
    }
    const updatedData = {
      ...updates,
      lastReadAt: Timestamp.now()
    };
    delete updatedData.id;
    await progressRef.update(updatedData);
    res.status(200).json({ status: 'success', message: 'Reading progress updated' });
  } catch (error) {
    console.error('updateReadingProgress - Error:', error);
    res.status(500).json({ error: 'Failed to update reading progress' });
  }
});

exports.deleteReadingProgress = functions.https.onRequest(async (req, res) => {
  try {
    const progressId = req.query.id;
    if (!progressId) {
      return res.status(400).json({ error: 'Reading progress ID is required' });
    }
    const progressRef = db.collection('readingProgress').doc(progressId);
    const doc = await progressRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Reading progress not found' });
    }
    await progressRef.delete();
    res.status(200).json({ status: 'success', message: 'Reading progress deleted' });
  } catch (error) {
    console.error('deleteReadingProgress - Error:', error);
    res.status(500).json({ error: 'Failed to delete reading progress' });
  }
});