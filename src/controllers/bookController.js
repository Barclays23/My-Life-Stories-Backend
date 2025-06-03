const { db, admin } = require('../config/firebaseAdmin');



// FOR BOOKS PAGE
exports.getBooks = async (req, res) => {
  try {
    // console.log('Fetching books from Firestore...');
    const booksSnapshot = await db.collection('books').get();
    
    // console.log('Books snapshot:', {
    //     isEmpty: booksSnapshot.empty,
    //     docCount: booksSnapshot.size,
    //     docs: booksSnapshot.docs.map(doc => doc.id)
    // });

    const publishedBooks = booksSnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(book => book.isPublished === true);

    console.log('Returning books :', { publishedBooks });
    res.json({ publishedBooks });

  } catch (error) {
    console.error('Error fetching books:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    res.status(500).json({ error: 'Failed to fetch books', details: error.message });
  }
};


// FOR HOME PAGE
exports.getRandomBooks = async (req, res) => {
    try {
        const booksSnapshot = await db.collection('books').get();
        
        // console.log('Books snapshot:', {
        //   isEmpty: booksSnapshot.empty,
        //   docCount: booksSnapshot.size,
        //   docs: booksSnapshot.docs.map(doc => doc.id)
        // });

        const books = booksSnapshot.empty
        ? []
        : booksSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Match frontend expectation: { books, randomBooks }
        const randomBooks = books.length > 0
            ? books.sort(() => 0.5 - Math.random()).slice(0, 3)
            : [];

        // console.log('Returning random books:', { randomBooks });
        res.json({ randomBooks });

    } catch (error) {
        console.error('Error fetching random books:', {
            message: error.message,
            stack: error.stack,
            code: error.code
        });
        res.status(500).json({ error: 'Failed to fetch random books', details: error.message });
    }
};


