const functions = require('firebase-functions');
const { getFirestore, Timestamp } = require('firebase-admin/firestore');
const { bookSchema, toDate } = require('./schemas');

const db = getFirestore();

exports.fetchBooks = functions.https.onRequest(async (req, res) => {
  try {
    const snapshot = await db.collection('books').get();
    const books = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: toDate(doc.data().createdAt),
      updatedAt: toDate(doc.data().updatedAt),
      publicationDate: toDate(doc.data().publicationDate)
    }));
    res.status(200).json({ status: 'success', data: books });
  } catch (error) {
    console.error('fetchBooks - Error:', error);
    res.status(500).json({ error: 'Failed to fetch books' });
  }
});

exports.getBookById = functions.https.onRequest(async (req, res) => {
  try {
    const bookId = req.query.id;
    if (!bookId) {
      return res.status(400).json({ error: 'Book ID is required' });
    }
    const doc = await db.collection('books').doc(bookId).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Book not found' });
    }
    const bookData = {
      id: doc.id,
      ...doc.data(),
      createdAt: toDate(doc.data().createdAt),
      updatedAt: toDate(doc.data().updatedAt),
      publicationDate: toDate(doc.data().publicationDate)
    };
    res.status(200).json({ status: 'success', data: bookData });
  } catch (error) {
    console.error('getBookById - Error:', error);
    res.status(500).json({ error: 'Failed to fetch book' });
  }
});

exports.addBook = functions.https.onRequest(async (req, res) => {
  try {
    const bookData = req.body;
    if (!bookData.title || !bookData.language) {
      return res.status(400).json({ error: 'Title and language are required' });
    }
    const newBook = {
      ...bookSchema,
      title: bookData.title,
      englishTitle: bookData.englishTitle || '',
      tagline: bookData.tagline || '',
      blurb: bookData.blurb || '',
      coverImage: bookData.coverImage || '',
      genre: bookData.genre || [],
      language: bookData.language,
      releaseStatus: bookData.releaseStatus || 'Draft',
      publicationDate: bookData.publicationDate ? Timestamp.fromDate(new Date(bookData.publicationDate)) : null,
      accessType: bookData.accessType || 'Free',
      price: bookData.price || 0,
      isPublished: bookData.isPublished || false,
      viewCount: bookData.viewCount || 0,
      ratingAverage: bookData.ratingAverage || 0,
      ratingCount: bookData.ratingCount || 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    const docRef = await db.collection('books').add(newBook);
    res.status(201).json({ status: 'success', id: docRef.id });
  } catch (error) {
    console.error('addBook - Error:', error);
    res.status(500).json({ error: 'Failed to add book' });
  }
});

exports.updateBook = functions.https.onRequest(async (req, res) => {
  try {
    const bookId = req.body.id;
    const updates = req.body;
    if (!bookId) {
      return res.status(400).json({ error: 'Book ID is required' });
    }
    const bookRef = db.collection('books').doc(bookId);
    const doc = await bookRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Book not found' });
    }
    const updatedData = {
      ...updates,
      publicationDate: updates.publicationDate ? Timestamp.fromDate(new Date(updates.publicationDate)) : doc.data().publicationDate,
      updatedAt: Timestamp.now()
    };
    delete updatedData.id;
    await bookRef.update(updatedData);
    res.status(200).json({ status: 'success', message: 'Book updated' });
  } catch (error) {
    console.error('updateBook - Error:', error);
    res.status(500).json({ error: 'Failed to update book' });
  }
});

exports.deleteBook = functions.https.onRequest(async (req, res) => {
  try {
    const bookId = req.query.id;
    if (!bookId) {
      return res.status(400).json({ error: 'Book ID is required' });
    }
    const bookRef = db.collection('books').doc(bookId);
    const doc = await bookRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Book not found' });
    }
    await bookRef.delete();
    res.status(200).json({ status: 'success', message: 'Book deleted' });
  } catch (error) {
    console.error('deleteBook - Error:', error);
    res.status(500).json({ error: 'Failed to delete book' });
  }
});