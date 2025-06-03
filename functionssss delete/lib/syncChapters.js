const { onDocumentCreated, onDocumentUpdated, onDocumentDeleted } = require('firebase-functions/v2/firestore');
const Chapter = require('../schemas/chapterSchema');
const { connectMongoDB } = require('../db/mongoose');
// const { db } = require('./firebase');



exports.syncChapterCreated = onDocumentCreated('chapters/{chapterId}', async (event) => {
  try {
    await connectMongoDB();

    const chapterData = event.data.data();
    const id = event.params.chapterId;

    const chapter = new Chapter({
      id: id,
      bookId: chapterData.bookId,
      chapterTitle: chapterData.chapterTitle,
      chapterNumber: chapterData.chapterNumber,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await chapter.save();

    return { status: 'success', message: 'Chapter synced to MongoDB' };
  } catch (error) {
    console.error('Error syncing chapter (create):', error);
    throw new Error('Failed to sync chapter');
  }
});

exports.syncChapterUpdated = onDocumentUpdated('chapters/{chapterId}', async (event) => {
  try {
    await connectMongoDB();

    const chapterData = event.data.after.data();
    const id = event.params.chapterId;

    await Chapter.updateOne(
      { id },
      {
        bookId: chapterData.bookId,
        chapterTitle: chapterData.chapterTitle,
        chapterNumber: chapterData.chapterNumber,
        updatedAt: new Date(),
      }
    );

    return { status: 'success', message: 'Chapter updated in MongoDB' };
  } catch (error) {
    console.error('Error syncing chapter (update):', error);
    throw new Error('Failed to sync chapter');
  }
});

exports.syncChapterDeleted = onDocumentDeleted('chapters/{chapterId}', async (event) => {
  try {
    await connectMongoDB();

    const id = event.params.chapterId;
    await Chapter.deleteOne({ id });

    return { status: 'success', message: 'Chapter deleted from MongoDB' };
  } catch (error) {
    console.error('Error syncing chapter (delete):', error);
    throw new Error('Failed to sync chapter');
  }
});