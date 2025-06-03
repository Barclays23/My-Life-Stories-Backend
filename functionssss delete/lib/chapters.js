const functions = require('firebase-functions');
const { getFirestore, Timestamp } = require('firebase-admin/firestore');
const { chapterSchema, toDate } = require('./schemas');

const db = getFirestore();

exports.fetchChapters = functions.https.onRequest(async (req, res) => {
  try {
    const snapshot = await db.collection('chapters').get();
    const chapters = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: toDate(doc.data().createdAt),
      updatedAt: toDate(doc.data().updatedAt)
    }));
    res.status(200).json({ status: 'success', data: chapters });
  } catch (error) {
    console.error('fetchChapters - Error:', error);
    res.status(500).json({ error: 'Failed to fetch chapters' });
  }
});

exports.getChapterById = functions.https.onRequest(async (req, res) => {
  try {
    const chapterId = req.query.id;
    if (!chapterId) {
      return res.status(400).json({ error: 'Chapter ID is required' });
    }
    const doc = await db.collection('chapters').doc(chapterId).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Chapter not found' });
    }
    const chapterData = {
      id: doc.id,
      ...doc.data(),
      createdAt: toDate(doc.data().createdAt),
      updatedAt: toDate(doc.data().updatedAt)
    };
    res.status(200).json({ status: 'success', data: chapterData });
  } catch (error) {
    console.error('getChapterById - Error:', error);
    res.status(500).json({ error: 'Failed to fetch chapter' });
  }
});

exports.fetchChaptersByBookId = functions.https.onRequest(async (req, res) => {
  try {
    const bookId = req.query.bookId;
    if (!bookId) {
      return res.status(400).json({ error: 'Book ID is required' });
    }
    const snapshot = await db.collection('chapters').where('bookRef', '==', bookId).get();
    const chapters = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: toDate(doc.data().createdAt),
      updatedAt: toDate(doc.data().updatedAt)
    }));
    res.status(200).json({ status: 'success', data: chapters });
  } catch (error) {
    console.error('fetchChaptersByBookId - Error:', error);
    res.status(500).json({ error: 'Failed to fetch chapters by book ID' });
  }
});

exports.addChapter = functions.https.onRequest(async (req, res) => {
  try {
    const chapterData = req.body;
    if (!chapterData.bookRef || !chapterData.chapterTitle || !chapterData.chapterNumber) {
      return res.status(400).json({ error: 'Book reference, chapter title, and chapter number are required' });
    }
    const newChapter = {
      ...chapterSchema,
      bookRef: chapterData.bookRef,
      chapterTitle: chapterData.chapterTitle,
      chapterNumber: chapterData.chapterNumber,
      isPublished: chapterData.isPublished || false,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    const docRef = await db.collection('chapters').add(newChapter);
    res.status(201).json({ status: 'success', id: docRef.id });
  } catch (error) {
    console.error('addChapter - Error:', error);
    res.status(500).json({ error: 'Failed to add chapter' });
  }
});

exports.updateChapter = functions.https.onRequest(async (req, res) => {
  try {
    const chapterId = req.body.id;
    const updates = req.body;
    if (!chapterId) {
      return res.status(400).json({ error: 'Chapter ID is required' });
    }
    const chapterRef = db.collection('chapters').doc(chapterId);
    const doc = await chapterRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Chapter not found' });
    }
    const updatedData = {
      ...updates,
      updatedAt: Timestamp.now()
    };
    delete updatedData.id;
    await chapterRef.update(updatedData);
    res.status(200).json({ status: 'success', message: 'Chapter updated' });
  } catch (error) {
    console.error('updateChapter - Error:', error);
    res.status(500).json({ error: 'Failed to update chapter' });
  }
});

exports.deleteChapter = functions.https.onRequest(async (req, res) => {
  try {
    const chapterId = req.query.id;
    if (!chapterId) {
      return res.status(400).json({ error: 'Chapter ID is required' });
    }
    const chapterRef = db.collection('chapters').doc(chapterId);
    const doc = await chapterRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Chapter not found' });
    }
    await chapterRef.delete();
    res.status(200).json({ status: 'success', message: 'Chapter deleted' });
  } catch (error) {
    console.error('deleteChapter - Error:', error);
    res.status(500).json({ error: 'Failed to delete chapter' });
  }
});