const { onDocumentCreated, onDocumentUpdated, onDocumentDeleted } = require('firebase-functions/v2/firestore');
const Book = require('../schemas/bookSchema');
const { connectMongoDB } = require('../db/mongoose');
// const { db } = require('./firebase');



exports.syncBookCreated = onDocumentCreated('books/{bookId}', async (event) => {
  try {
    await connectMongoDB();

    const bookData = event.data.data();
    const id = event.params.bookId;

    const book = new Book({
      id: id,
      title: bookData.title,
      isPublished: bookData.isPublished || false,
      accessType: bookData.accessType || 'Paid',
      releaseStatus: bookData.releaseStatus || 'Draft',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await book.save();

    return { status: 'success', message: 'Book synced to MongoDB' };
  } catch (error) {
    console.error('Error syncing book (create):', error);
    throw new Error('Failed to sync book');
  }
});

exports.syncBookUpdated = onDocumentUpdated('books/{bookId}', async (event) => {
  try {
    await connectMongoDB();

    const bookData = event.data.after.data();
    const id = event.params.bookId;

    await Book.updateOne(
      { id },
      {
        title: bookData.title,
        isPublished: bookData.isPublished,
        accessType: bookData.accessType,
        releaseStatus: bookData.releaseStatus,
        updatedAt: new Date(),
      }
    );

    return { status: 'success', message: 'Book updated in MongoDB' };
  } catch (error) {
    console.error('Error syncing book (update):', error);
    throw new Error('Failed to sync book');
  }
});

exports.syncBookDeleted = onDocumentDeleted('books/{bookId}', async (event) => {
  try {
    await connectMongoDB();

    const id = event.params.bookId;
    await Book.deleteOne({ id });

    return { status: 'success', message: 'Book deleted from MongoDB' };
  } catch (error) {
    console.error('Error syncing book (delete):', error);
    throw new Error('Failed to sync book');
  }
});