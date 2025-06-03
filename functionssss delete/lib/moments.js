const functions = require('firebase-functions');
const { getFirestore, Timestamp } = require('firebase-admin/firestore');
const { momentSchema, toDate } = require('./schemas');

const db = getFirestore();

exports.fetchMoments = functions.https.onRequest(async (req, res) => {
  try {
    const snapshot = await db.collection('moments').get();
    const moments = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: toDate(doc.data().createdAt),
      updatedAt: toDate(doc.data().updatedAt)
    }));
    res.status(200).json({ status: 'success', data: moments });
  } catch (error) {
    console.error('fetchMoments - Error:', error);
    res.status(500).json({ error: 'Failed to fetch moments' });
  }
});

exports.getMomentById = functions.https.onRequest(async (req, res) => {
  try {
    const momentId = req.query.id;
    if (!momentId) {
      return res.status(400).json({ error: 'Moment ID is required' });
    }
    const doc = await db.collection('moments').doc(momentId).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Moment not found' });
    }
    const momentData = {
      id: doc.id,
      ...doc.data(),
      createdAt: toDate(doc.data().createdAt),
      updatedAt: toDate(doc.data().updatedAt)
    };
    res.status(200).json({ status: 'success', data: momentData });
  } catch (error) {
    console.error('getMomentById - Error:', error);
    res.status(500).json({ error: 'Failed to fetch moment' });
  }
});

exports.fetchMomentsByChapterId = functions.https.onRequest(async (req, res) => {
  try {
    const chapterId = req.query.chapterId;
    if (!chapterId) {
      return res.status(400).json({ error: 'Chapter ID is required' });
    }
    const snapshot = await db.collection('moments').where('chapterRef', '==', chapterId).get();
    const moments = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: toDate(doc.data().createdAt),
      updatedAt: toDate(doc.data().updatedAt)
    }));
    res.status(200).json({ status: 'success', data: moments });
  } catch (error) {
    console.error('fetchMomentsByChapterId - Error:', error);
    res.status(500).json({ error: 'Failed to fetch moments by chapter ID' });
  }
});

exports.addMoment = functions.https.onRequest(async (req, res) => {
  try {
    const momentData = req.body;
    if (!momentData.chapterRef || !momentData.momentTitle || !momentData.momentNumber || !momentData.content) {
      return res.status(400).json({ error: 'Chapter reference, moment title, moment number, and content are required' });
    }
    const newMoment = {
      ...momentSchema,
      chapterRef: momentData.chapterRef,
      momentTitle: momentData.momentTitle,
      momentNumber: momentData.momentNumber,
      content: momentData.content,
      isVisible: momentData.isVisible || true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    const docRef = await db.collection('moments').add(newMoment);
    res.status(201).json({ status: 'success', id: docRef.id });
  } catch (error) {
    console.error('addMoment - Error:', error);
    res.status(500).json({ error: 'Failed to add moment' });
  }
});

exports.updateMoment = functions.https.onRequest(async (req, res) => {
  try {
    const momentId = req.body.id;
    const updates = req.body;
    if (!momentId) {
      return res.status(400).json({ error: 'Moment ID is required' });
    }
    const momentRef = db.collection('moments').doc(momentId);
    const doc = await momentRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Moment not found' });
    }
    const updatedData = {
      ...updates,
      updatedAt: Timestamp.now()
    };
    delete updatedData.id;
    await momentRef.update(updatedData);
    res.status(200).json({ status: 'success', message: 'Moment updated' });
  } catch (error) {
    console.error('updateMoment - Error:', error);
    res.status(500).json({ error: 'Failed to update moment' });
  }
});

exports.deleteMoment = functions.https.onRequest(async (req, res) => {
  try {
    const momentId = req.query.id;
    if (!momentId) {
      return res.status(400).json({ error: 'Moment ID is required' });
    }
    const momentRef = db.collection('moments').doc(momentId);
    const doc = await momentRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Moment not found' });
    }
    await momentRef.delete();
    res.status(200).json({ status: 'success', message: 'Moment deleted' });
  } catch (error) {
    console.error('deleteMoment - Error:', error);
    res.status(500).json({ error: 'Failed to delete moment' });
  }
});