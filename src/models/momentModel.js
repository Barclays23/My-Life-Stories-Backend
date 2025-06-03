const momentSchema = {
  chapterRef: { type: 'string', required: true },
  momentTitle: { type: 'string', required: true },
  momentNumber: { type: 'number', required: true },
  momentContent: { type: 'string', required: true },
  momentImage: { type: 'string', required: false, default: '' }, // Added field for attaching a photo
  isVisible: { type: 'boolean', default: true },
  createdAt: { type: 'timestamp', required: true },
  updatedAt: { type: 'timestamp', required: true }
};

module.exports = momentSchema;