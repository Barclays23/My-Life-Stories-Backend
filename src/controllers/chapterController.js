const { db, admin } = require('../config/firebaseAdmin');


// exports.createChapter = async (req, res) => {
//   const { bookId, chapterTitle } = req.body;
//   try {
//     const chaptersSnapshot = await db.collection('chapters')
//       .where('bookRef', '==', bookId)
//       .get();
//     const chapterNumber = chaptersSnapshot.size + 1;

//     const chapterRef = await db.collection('chapters').add({
//       bookRef: bookId,
//       chapterTitle,
//       chapterNumber,
//       isPublished: false,
//       createdAt: admin.firestore.Timestamp.now(),
//       updatedAt: admin.firestore.Timestamp.now()
//     });
//     res.json({ id: chapterRef.id, message: 'Chapter created successfully' });
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to create chapter' });
//   }
// };


exports.deleteChapter = async (req, res) => {
  const { chapterId, bookId, chapterNumber } = req.body;
  try {
    await db.collection('chapters').doc(chapterId).delete();
    const momentsSnapshot = await db.collection('moments')
      .where('chapterRef', '==', chapterId)
      .get();
    const batch = db.batch();
    momentsSnapshot.forEach(doc => batch.delete(doc.ref));
    await batch.commit();

    const remainingChaptersSnapshot = await db.collection('chapters')
      .where('bookRef', '==', bookId)
      .get();
    remainingChaptersSnapshot.forEach(doc => {
      const chapter = doc.data();
      if (chapter.chapterNumber > chapterNumber) {
        batch.update(doc.ref, { chapterNumber: chapter.chapterNumber - 1 });
      }
    });
    await batch.commit();

    res.json({ message: 'Chapter deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete chapter' });
  }
};