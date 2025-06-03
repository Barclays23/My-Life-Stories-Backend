const { db, admin } = require('../config/firebaseAdmin');

exports.logView = async (req, res) => {
  const { bookId } = req.body;
  try {
    await db.collection('views').add({
      bookId,
      userId: req.user?.uid || '',
      timestamp: admin.firestore.Timestamp.now()
    });

    const bookRef = db.collection('books').doc(bookId);
    const bookDoc = await bookRef.get();
    const viewCount = (bookDoc.data().viewCount || 0) + 1;
    await bookRef.update({ viewCount });

    res.json({ message: 'View logged successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to log view' });
  }
};