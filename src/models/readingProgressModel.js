const readingProgressSchema = {
  userId: { type: 'string', required: true },
  bookId: { type: 'string', required: true },
  lastReadChapterId: { type: 'string', required: true },
  lastReadMomentId: { type: 'string', required: true },
  completedMomentIds: { type: 'array', default: [] },
  lastReadAt: { type: 'timestamp', required: true }
};

module.exports = readingProgressSchema;