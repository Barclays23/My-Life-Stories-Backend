const viewSchema = {
  bookId: { type: 'string', required: true },
  userId: { type: 'string', default: '' },
  timestamp: { type: 'timestamp', required: true }
};

module.exports = viewSchema;