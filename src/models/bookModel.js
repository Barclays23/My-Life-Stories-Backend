const bookSchema = {
  title: { type: 'string', required: true },
  englishTitle: { type: 'string', required: false },       // Convert to English if title is Malayalam.
  slug: {type: 'String'},                                  // for friendly URL paths if using title as paths. Eg: books/ente-katha
  tagline: { type: 'string', required: false },
  blurb: { type: 'string', required: true },
  coverImage: { type: 'string', required: false },
  genre: { type: 'array', required: true },                 // enum: [ 'Memoir', 'Fiction', 'Non-Fiction', 'Sports', 'Romance', 'Spiritual', 'Articles']
  language: { type: 'string', required: true },             // enum: ['English', 'Malayalam'],
  releaseStatus: { type: 'string', default: 'Draft' },      // enum: ['Draft', 'Coming Soon', 'New Release', 'Published', 'Temporarily Unavailable'],  
  publicationDate: { type: 'timestamp', required: false },
  accessType: { type: 'string', required: true },           // enum: ['Free', 'Paid'],
  price: { type: 'number', default: 0 },
  isPublished: { type: 'boolean', default: false },
  chapterCount: {type: 'number', default: 0},               // Number of chapters in the book
  momentCount: {type: 'number', default: 0},                // Number of moments inside all chapters in the book
  viewCount: { type: 'number', default: 0 },
  ratingAverage: { type: 'number', default: 0 },            // round to 1 decimal place
  ratingCount: { type: 'number', default: 0 },
  createdAt: { type: 'timestamp', required: true },
  updatedAt: { type: 'timestamp', required: true }
};

module.exports = bookSchema;