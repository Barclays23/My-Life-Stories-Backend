const ReadingProgressSchema = {
  _id: ObjectId,
  userId: ObjectId,
  bookId: ObjectId,
  lastReadChapterId: ObjectId,      // Last chapter the user read
  lastReadMomentId: ObjectId,       // Last moment the user read
  completedMomentIds: [ObjectId],   // Moments the user has fully read
  lastReadAt: Date
};