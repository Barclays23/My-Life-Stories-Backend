const { db, admin } = require('../config/firebaseAdmin');
const bcrypt = require('bcrypt');
// const { uploadImageToFirebaseStorage } = require("../utils/firebaseImageUploader");
const { extractStoragePath, uploadToStorage, deleteFromStorage } = require('../utils/firebaseStorageUtils');
// const FIREBASE_STORAGE_BUCKET = process.env.FIREBASE_STORAGE_BUCKET;





// ----------------------------------------------- BOOK FUNCTIONS --------------
exports.getBooksList = async (req, res) => {
  try {
    const booksSnapshot = await db.collection('books').get();

    // If the collection doesn't exist, booksSnapshot will be empty
    const allBooks = booksSnapshot.empty 
      ? [] 
      : booksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

   //  console.log('Returning allBooks:', { allBooks });
    res.json({ allBooks });

  } catch (error) {
    console.error('Error fetching allBooks :', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    res.status(500).json({ error: 'Failed to fetch books', message: error.message });
  }
};


exports.getBookDetails = async (req, res) => {
   try {
      // console.log('req.params :', req.params);
      const bookId = req.params.id;  // provided param name in adminRoutes.js
      
      const bookDoc = await db.collection('books').doc(bookId).get();

      if (!bookDoc.exists) {
         return res.status(404).json({ error: 'Book not found' });
      }

      const bookData = { id: bookDoc.id, ...bookDoc.data() };

      // console.log('Returning bookData:', { bookData });
      res.json({ bookData });


   } catch (error) {
      console.error('Error fetching Book Details :', {
         message: error.message,
         stack: error.stack,
         code: error.code
      });
      res.status(500).json({ error: 'Failed to fetch Book Details', details: error.message });
   }
};



exports.createBook = async (req, res) => {
   try {
      const { title, englishTitle, slug, tagline, blurb, genre, language, accessType, price } = req.body;
      // console.log('FORM FIELDS:', req.body);
      // console.log('FILE INFO  :', req.file); // coverImage

      const existingBook = await db.collection('books').where('slug', '==', slug).get();  // if same slug exist, it will conflict to URL paths.

      if (!existingBook.empty) {
         // return res.status(409).json({ error: `Book with slug: ${slug} already exists.` });
         return res.status(409).json({ message: `Book title: "${title}" already exists.` });
      }

      // First create the book document to get the bookId
      const bookRef = db.collection('books').doc();
      const bookId = bookRef.id;

      let coverImageUrl = '';
      let uploadError = null;

      // Handle image upload if present
      if (req.file) {
         try {
            const originalFilename = req.file.originalname; // image_name.jpg
            const firebaseStoragePath = `book-covers/${bookId}/${originalFilename}`; // folder/path in Firebase Storage

            coverImageUrl = await uploadToStorage(
               req.file.buffer,
               req.file.originalname,
               req.file.mimetype,
               firebaseStoragePath
            );

         } catch (error) {
            console.error('Image upload failed:', error);
            uploadError = error;
            // Don't return yet - we'll handle this after transaction
         }
      }


      // 5. Create book document in transaction
      await db.runTransaction(async (transaction) => {
         if (uploadError) throw new Error('Image upload failed: ' + uploadError.message);

         transaction.set(bookRef, {
            id: bookId, // Include the ID in the document
            title,
            englishTitle: englishTitle || '',
            slug: slug,
            tagline: tagline || '',
            blurb: blurb || '',
            coverImageUrl : coverImageUrl,
            genre: genre || 'General',
            language: language || 'English',
            releaseStatus: 'Draft',
            publicationDate: null,
            accessType: accessType || 'Free',
            price: accessType === 'Free' ? 0 : (price || 0),
            isPublished: false,
            chapterCount: 0,
            momentCount: 0,
            viewCount: 0,
            ratingAverage: 0,
            ratingCount: 0,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
         });
      });

  
      // 6. Success response
      res.json({ bookId, message: 'Book created successfully', title, coverImageUrl });

   } catch (error) {
      console.error('Error creating book:', error);

      // Clean up if image was uploaded but transaction failed
      if (coverImageUrl) {
         try {
            const imagePath = extractStoragePath(coverImageUrl);
            await deleteFromStorage(imagePath);
         } catch (cleanupError) {
            console.error('Failed to cleanup image:', cleanupError);
         }
      }

      res.status(500).json({ error: 'Failed to create book' });
   }
};



const computeReleaseStatus = (publicationDate, chapterCount) => {
   const now = new Date();
   const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago

   if (!publicationDate) {
      return 'Draft';
   }

   const pubDate = new Date(publicationDate);
   if (chapterCount === 0) {
      return 'Temporarily Unavailable';
   }
   if (pubDate > now) {
      return 'Coming Soon';
   }
   if (pubDate >= thirtyDaysAgo && pubDate <= now) {
      return 'New Release';
   }
   return 'Published';
};



exports.updateBook = async (req, res) => {
   try {
      const bookId = req.params.bookId;
      const { title, englishTitle, slug, tagline, blurb, language, publicationDate, accessType, price, genre, shouldRemoveImage } = req.body;
      const file = req.file;

      console.log('should Remove Book Image ? :', shouldRemoveImage);
      console.log('New cover image attached ? :', file ? 'Yes' : 'No');

      // Check if book exists
      const bookRef = db.collection('books').doc(bookId);
      const bookSnap = await bookRef.get();
      if (!bookSnap.exists) {
         return res.status(404).json({ error: 'Book not found' });
      }

      
      // Check for slug conflict (excluding the current book)
      const existingBook = await db.collection('books').where('slug', '==', slug).get();
      if (!existingBook.empty && existingBook.docs.some(doc => doc.id !== bookId)) {
         return res.status(409).json({ error: `Book title: ${title} already exists.` });
      }
      

      // IMAGE HANDLING LOGIC
      const bookData = bookSnap.data();
      const oldCoverImageUrl = bookData.coverImageUrl || '';
      let coverImageUrl = oldCoverImageUrl;
      
      if (req.file) {
         // New image uploaded - delete old image if exists and upload new one
         if (oldCoverImageUrl) {
            const coverImagePath = extractStoragePath(oldCoverImageUrl);
            await deleteFromStorage(coverImagePath);
         }

         const originalFilename = req.file.originalname; // image_name.jpg
         const firebaseStoragePath = `book-covers/${bookId}/${originalFilename}`; // folder/path in Firebase Storage

         coverImageUrl = await uploadToStorage(
            req.file.buffer,
            req.file.originalname,
            req.file.mimetype,
            firebaseStoragePath
         );
         // console.error('Image upload failed:', uploadError);
         // return res.status(500).json({ error: 'Image upload failed' });

      } else if (shouldRemoveImage === true || shouldRemoveImage === 'true') {
         // Explicit request to remove image
         if (oldCoverImageUrl) {
            const coverImagePath = extractStoragePath(oldCoverImageUrl);
            await deleteFromStorage(coverImagePath);
         }
         coverImageUrl = '';

      } else {
         // Keep existing image (default behavior)
         coverImageUrl = oldCoverImageUrl;
      }

      // Compute releaseStatus
      const chapterCount = bookSnap.data().chapterCount || 0;
      const releaseStatus = bookSnap.data().isPublished ? computeReleaseStatus(publicationDate, chapterCount) : 'Draft';

      // Prepare updated book data
      const updatedBookData = {
         title,
         englishTitle,
         slug,
         tagline,
         blurb,
         coverImageUrl,
         genre: Array.isArray(genre) ? genre : genre.split(','),
         language,
         releaseStatus: releaseStatus,
         publicationDate: publicationDate || null,
         accessType,
         price: accessType === 'Paid' ? parseFloat(price) : 0,
         updatedAt: admin.firestore.Timestamp.now(),
      };

      // Update book in Firestore
      await bookRef.set(updatedBookData, { merge: true });

      res.json({ updatedBookData, message: 'Book updated successfully' });

   } catch (error) {
      console.error('Error updating book:', error);
      res.status(500).json({ error: 'Failed to update book', message: error.message });
   }
};



exports.deleteBook = async (req, res) => {
   try {
      const { bookId } = req.params;
      const { password } = req.body;
      // console.log('bookId, password in controller  :', bookId, password);

      // Create local references to deleteChapter function (to delete all the chapters in the book)
      const { deleteChapter } = exports;

      // Step 1: Validate admin password
      const adminDoc = await db.collection('users').doc(req.user.uid).get();
      // console.log('adminDoc.data :', adminDoc.data);
      const hashedPassword = adminDoc.data()?.hashedPassword;
      // console.log('hashedPassword :', hashedPassword);
      if (!hashedPassword) {
         return res.status(403).json({ message: 'Admin Password Not Found!' });
      }

      const isMatch = await bcrypt.compare(password, hashedPassword);
      if (!isMatch) {
         return res.status(401).json({ message: 'Incorrect Admin Password!' });
      }


      // Step 2: Check and fetch book document
      const bookRef = db.collection('books').doc(bookId);
      const bookSnap = await bookRef.get();
      if (!bookSnap.exists) return res.status(404).json({ message: 'Book not found' });

      const bookData = bookSnap.data();
      // console.log('book to delete :', bookData.title);


      // Step 3: delete all chapters in this book (which will delete all of them and their moments)
      const chaptersSnapshot = await db.collection('chapters')
         .where('bookRef', '==', bookId)
         .get();


      // Delete each chapter using the deleteChapter function
      for (const chapterDoc of chaptersSnapshot.docs) {
         const mockReq = {
            params: { 
               bookId, 
               chapterId: chapterDoc.id 
            },
            body: { password },
            user: req.user
         };
         
         const mockRes = {
            json: () => {}, // No action needed on success
            status: (code) => ({
               json: (err) => { throw new Error(err.message); }
            })
         };

         await deleteChapter(mockReq, mockRes);
      }


      // Step 4: Delete coverImage from Firebase Storage
      if (bookData.coverImageUrl) {
         const coverImagePath = extractStoragePath(bookData.coverImageUrl);
         await deleteFromStorage(coverImagePath);
      }

      // Step 5: also delete the book document from firestore database.
      const deletedBook = await bookRef.delete();
      console.log(`Deleted Book: ${bookData.title} - ${bookData.chapterCount} Chapters - ${bookData.momentCount} Moments`);
      

      res.json({ 
         success: true, 
         message: 'Book and all its contents deleted successfully',
         bookData 
      });

   } catch (err) {
      console.error('Delete book error:', err);
      res.status(500).json({ 
         error: err || 'Failed to delete book',
         message: err.message || 'Failed to delete book',
         details: err.stack 
      });
   }
};



exports.togglePublishBook = async (req, res) => {
   try {
      const { bookId } = req.params;
      const { shouldPublish, publishDate } = req.body; // boolean
      console.log('togglePublishBook in controller :', shouldPublish, publishDate);


      const bookRef = db.collection('books').doc(bookId);
      const bookSnap = await bookRef.get();

      if (!bookSnap.exists) {
         return res.status(404).json({ error: 'Book not found' });
      }

      // Compute releaseStatus
      const chapterCount = bookSnap.data().chapterCount || 0;
      const publicationDate = shouldPublish ? publishDate : bookSnap.data().publicationDate || null;
      const releaseStatus = shouldPublish ? computeReleaseStatus(publicationDate, chapterCount) : 'Draft';

      await bookRef.update({
         isPublished: shouldPublish,
         publicationDate: publicationDate,
         releaseStatus: releaseStatus,
      });

      res.json({ success: true, id: bookId, isPublished: shouldPublish });

   } catch (err) {
      res.status(500).json({ error: 'Unable to toggle publish', details: err.message });
   }
};



// ----------------------------------------------- CHAPTER FUNCTIONS --------------
exports.createChapter = async (req, res) => {
   const { chapterTitle } = req.body;
   const { bookId } = req.params;

   // console.log('createChapter DATA in backend :', bookId, chapterTitle);

   if (!chapterTitle?.trim()) {
      return res.status(400).json({ error: 'chapterTitle required' });
   }


   try {
      // Check if book exists
      const bookRef = db.collection('books').doc(bookId);
      const bookSnap = await bookRef.get();

      if (!bookSnap.exists) {
         return res.status(404).json({ error: 'Book not found to add chapter!' });
      }

      // If you want to prevent duplicate chapter titles in the same book
      const existingChapters = await db.collection('chapters')
         .where('bookRef', '==', bookId)  // here the bookRef is the document field, not the bookRef above declared.
         .where('chapterTitle', '==', chapterTitle.trim())
         .get();

      if (!existingChapters.empty) {
         return res.status(400).json({ error: 'Chapter with the same title already exists' });
      }

      

      const bookData = bookSnap.data();

      // generate next chapter number
      const nextChapterNumber = bookData.chapterCount + 1;
      // console.log('chapterCount :', bookData.chapterCount, 'nextChapterNumber :', nextChapterNumber);

      // Add the chapter to chapters collection
      const newChapterRef = await db.collection('chapters').add({
         bookRef : bookId,
         chapterNumber: nextChapterNumber,
         chapterTitle: chapterTitle.trim(),
         isPublished: false,
         momentCount: 0,
         createdAt: admin.firestore.Timestamp.now(),
         updatedAt: admin.firestore.Timestamp.now()
      });

      // Update book's chapterCount
      await bookRef.update({ chapterCount: nextChapterNumber });

      res.status(201).json({ 
         id: newChapterRef.id,
         chapterNumber: nextChapterNumber,
         chapterTitle: chapterTitle.trim(),
         message: 'Chapter created successfully',
      });

   } catch (error) {
      console.error('Error creating chapter:', error);
      res.status(500).json({ error: 'Failed to create chapter' });
   }
};


exports.updateChapter = async (req, res) => {
   const { bookId, chapterId } = req.params;
   const { newChapterTitle, newChapterNumber } = req.body;
   const newNum = Number(newChapterNumber);

   if (!newChapterTitle?.trim() || isNaN(newNum)) {
      return res.status(400).json({ error: 'Invalid title or number' });
   }

   try {
      const bookRef    = db.collection('books').doc(bookId);
      const chapterRef = db.collection('chapters').doc(chapterId);

      let oldNumber, maxNumber;

      // 1️⃣ validate inside a transaction
      await db.runTransaction(async (t) => {
         const [bookSnap, chapSnap] = await Promise.all([
         t.get(bookRef),
         t.get(chapterRef)
         ]);

         if (!bookSnap.exists)  throw new Error('Book not found');
         if (!chapSnap.exists)  throw new Error('Chapter not found');

         const data = chapSnap.data();
         if (data.bookRef !== bookId)
         throw new Error('Chapter not in this book');

         oldNumber  = data.chapterNumber;
         maxNumber  = bookSnap.data().chapterCount;

         if (newNum < 1 || newNum > maxNumber)
         throw new Error(`chapterNumber out of range. Expected a value from 1 to ${maxNumber}.`);
   

         // update title immediately; number handled later
         t.update(chapterRef, { chapterTitle: newChapterTitle.trim() });
      });

      if (oldNumber === newNum) {
         return res.json({ success: true, message: 'Chapter Title Updated' });
      }

      /* 2️⃣ re-index other chapters */
      const batch = db.batch();
      const direction = newNum > oldNumber ? -1 : +1;     // shift others
      const [start, end] = newNum > oldNumber
         ? [oldNumber + 1, newNum]   // moving downwards
         : [newNum, oldNumber - 1];  // moving upwards

      const snap = await db.collection('chapters')
         .where('bookRef', '==', bookId)
         .where('chapterNumber', '>=', start)
         .where('chapterNumber', '<=', end)
         .get();

      snap.forEach(doc => {
         const n = doc.data().chapterNumber;
         batch.update(doc.ref, {
         chapterNumber: n + direction,
         updatedAt    : admin.firestore.FieldValue.serverTimestamp()
         });
      });

      // finally update the moved chapter number
      batch.update(chapterRef, {
         chapterNumber: newNum,
         updatedAt    : admin.firestore.FieldValue.serverTimestamp()
      });

      await batch.commit();

      res.json({ success: true, message: 'Chapter updated & reordered' });

   } catch (err) {
      console.error('updateChapter error:', err);
      res.status(500).json({ error: err.message || 'Update failed' });
   }
};


exports.deleteChapter = async (req, res) => {
   const { bookId, chapterId } = req.params;
   const { password } = req.body;
   // console.log('req.params in deleteChapter :', req.params);
   // console.log('req.body in deleteChapter :', req.body);

   // Create local reference to deleteMoment (to delete all the moments in the chapter)
   const { deleteMoment } = exports;


   // Validate admin password
   const adminDoc = await db.collection('users').doc(req.user.uid).get();
   const hashedPassword = adminDoc.data()?.hashedPassword;

   if (!hashedPassword) {
      return res.status(403).json({ message: 'Admin Password Not Found!' });
   }

   const isMatch = await bcrypt.compare(password, hashedPassword);
   if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect Admin Password!' });
   }

   let deletedChapterNumber = null;

   try {
      const bookRef    = db.collection('books').doc(bookId);
      const chapterRef = db.collection('chapters').doc(chapterId);

      // First, get all the moments in the chapter to delete all of them.
      const momentsSnapshot = await db.collection('moments')
         .where('chapterRef', '==', chapterId)
         .get();


      // Delete each moment using the deleteMoment function
      for (const momentDoc of momentsSnapshot.docs) {
         const mockReq = {
            params: { 
               bookId, 
               chapterId, 
               momentId: momentDoc.id 
            },
            body: { password },
            user: req.user
         };
         
         const mockRes = {
            json: () => {}, // No action needed on success
            status: (code) => ({
               json: (err) => { throw new Error(err.message); }
            })
         };

         await deleteMoment(mockReq, mockRes);
      }

      // Now proceed with chapter deletion
      await db.runTransaction(async (t) => {

         /* 1️⃣  Make sure the book exists */
         const bookSnap = await t.get(bookRef);
         if (!bookSnap.exists) {
            throw new Error('Book not found to delete chapter.');
         }

         /* 2️⃣  Make sure the chapter exists and belongs to the same book */
         const chapterSnap = await t.get(chapterRef);
         if (!chapterSnap.exists) {
            throw new Error('Chapter not found to delete chapter.');
         }
         if (chapterSnap.data().bookRef !== bookId) {
            throw new Error('Chapter does not belong to this book');
         }

         deletedChapterNumber = chapterSnap.data().chapterNumber;

         /* 3️⃣  Delete the chapter */
         t.delete(chapterRef);

         /* 4️⃣  Decrement chapterCount on the book */
         t.update(bookRef, {
            chapterCount: admin.firestore.FieldValue.increment(-1),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
         });
      });

      /* 5️⃣  Shift later chapter numbers down by 1 */
      const laterSnap = await db.collection('chapters')
         .where('bookRef', '==', bookId)
         .where('chapterNumber', '>', deletedChapterNumber)
         .get();

      const batch = db.batch();
      
      laterSnap.forEach((doc) =>
         batch.update(doc.ref, {
            chapterNumber: doc.data().chapterNumber - 1,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
         })
      );

      // Commit all batches
      await batch.commit();

      return res.json({
         success: true,
         deletedChapterNumber,
         message: 'Chapter and all its moments deleted successfully',
      });

   } catch (err) {
      console.error('deleteChapter error:', err);
      return res.status(500).json({ error: err.message || 'Failed to delete chapter' });
   }
};


exports.getChaptersByBook = async (req, res) => {
   const { bookId } = req.params;
   // console.log('bookId in getChaptersByBook :', bookId);

   try {
      const chaptersRef = db.collection('chapters');
      const chapterSnapshot = await chaptersRef
         .where('bookRef', '==', bookId)
         .orderBy('chapterNumber', 'asc')  // order by chapter number (composite index created in firestore)
         .get();

      if (chapterSnapshot.empty) {
         return res.status(200).json({ chapters: [] });
      }

      const chapters = chapterSnapshot.docs.map(doc => ({
         id: doc.id,
         ...doc.data(),
      }));

      // console.log('chapters in adminController :', chapters);
      
      res.status(200).json({ chapters });

   } catch (error) {
      console.error('Error fetching chapters by book:', error);
      res.status(500).json({ error: 'Failed to create chapter' });
   }
};



// ----------------------------------------------- MOMENT FUNCTIONS --------------
exports.getMomentsByChapter = async (req, res) => {
   const { bookId, chapterNumber } = req.params;
   // console.log('params in getMomentsByChapter :', req.params);

   try {
      // 1. Fetch the book data
      const bookDoc = await db.collection('books').doc(bookId).get();
      if (!bookDoc.exists) {
         return res.status(404).json({ message: 'Book not found' });
      }
      const bookData = { id: bookDoc.id, ...bookDoc.data() };

      // 1. Find the chapter in Firestore
      const chapterSnapshot = await db
         .collection('chapters')
         .where('bookRef', '==', bookId)
         .where('chapterNumber', '==', parseInt(chapterNumber))
         .limit(1)
         .get();

      if (chapterSnapshot.empty){
         return res.status(404).json({ message: 'Chapter not found' });
      }

      const chapterDoc = chapterSnapshot.docs[0];
      const chapterId = chapterDoc.id;

      const chapterData = { id: chapterId, ...chapterDoc.data() };  // only the data of chapter document (name & number)


      // 2. Get all moments where chapterRef == chapterDoc.id
      const momentsSnapshot = await db
         .collection('moments')
         .where('chapterRef', '==', chapterId)
         .orderBy('momentNumber', 'asc')
         .get();

         
      // Convert to array and add client-side sort as fallback
      const momentsData = momentsSnapshot.docs
         .map(doc => ({ id: doc.id, ...doc.data() }))
         .sort((a, b) => a.momentNumber - b.momentNumber);


      res.json({ bookData, chapterData, momentsData });

   } catch (err) {
      res.status(500).json({ message: 'Error fetching moments', error: err.message });
   }
};

exports.createMoment = async (req, res) => {
   try {
      const { bookId, chapterId } = req.params;
      const { momentTitle, momentContent } = req.body;
      const file = req.file;

      // console.log('req.body in createMoment:', req.body);
      // console.log('req.file in createMoment:', req.file);

      // Validate required fields
      if (!momentTitle || !momentContent) {
         return res.status(400).json({ message: 'momentTitle and momentContent are required' });
      }
      
      const bookRef = db.collection('books').doc(bookId); // Reference to the book document
      const chapterRef = db.collection('chapters').doc(chapterId);
      const momentsCollection = db.collection('moments');
      let momentImageUrl = "";

      if (file) {
         const originalFilename = req.file.originalname; // image_name.jpg
         const firebaseStoragePath = `moment-images/${bookId}/${chapterId}/${originalFilename}`    // folder/path in Firebase Storage
         
         momentImageUrl = await uploadToStorage(
            req.file.buffer,
            req.file.originalname,
            req.file.mimetype,
            firebaseStoragePath
         );
         // console.log('Image uploaded, URL:', momentImageUrl);
      }


      // Run a transaction to ensure atomic updates
      const newMoment = await db.runTransaction(async (transaction) => {
         const bookDoc = await transaction.get(bookRef);
         const chapterDoc = await transaction.get(chapterRef);
         if (!bookDoc.exists) {
            throw new Error('Book not found');
         }
         if (!chapterDoc.exists) {
            throw new Error('Chapter not found');
         }

         const currentChapterMomentCount = chapterDoc.data().momentCount || 0;  // current moments in chapter
         const currentBookMomentCount = bookDoc.data().momentCount || 0;  // total moments in book

         const newMomentData = {
            chapterRef: chapterId,
            momentNumber: currentChapterMomentCount + 1,
            momentTitle,
            momentContent,
            momentImage: momentImageUrl || '',
            isVisible: true,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
         };

         // Add the moment and update momentCount atomically
         const newMomentRef = momentsCollection.doc();
         transaction.set(newMomentRef, newMomentData);  // saving the document in moments collection.
         transaction.update(chapterRef, { momentCount: currentChapterMomentCount + 1 });  // updating the momentCount in chapter document
         transaction.update(bookRef, { momentCount: currentBookMomentCount + 1 }); // updating the momentCount in book document

         return newMomentData;
      });

      // console.log('Moment created and momentCount updated:', newMoment);

      res.status(201).json({ message: 'Moment Created', newMoment });

   } catch (err) {
      console.error('Error in createMoment :', err);
      res.status(500).json({ message: 'Error creating moment', error: err.message });
   }
};

exports.updateMoment = async (req, res) => {
   try {
      const { bookId, chapterId, momentId } = req.params;
      const { updatedMomentNumber, updatedMomentTitle, updatedMomentContent, shouldRemoveImage } = req.body;
      const file = req.file;

      // console.log('Params:', { bookId, chapterId, momentId });
      // console.log('Body:', req.body);
      console.log('should Remove Moment Image ? :', shouldRemoveImage);
      console.log('New file attached ? :', file ? 'Yes' : 'No');


      // References
      const momentRef = db.collection('moments').doc(momentId);
      const chapterRef = db.collection('chapters').doc(chapterId);
      const bookRef = db.collection('books').doc(bookId);

      let oldMomentNumber, maxMomentNumber, momentData;

      // 1️⃣ Validate and process in a transaction
      await db.runTransaction(async (t) => {
         const [momentSnap, chapterSnap, bookSnap] = await Promise.all([
            t.get(momentRef),
            t.get(chapterRef),
            t.get(bookRef)
         ]);

         // Check document existence
         if (!momentSnap.exists) throw new Error('Moment not found');
         if (!chapterSnap.exists) throw new Error('Chapter not found');
         if (!bookSnap.exists) throw new Error('Book not found');

         momentData = momentSnap.data();
         oldMomentNumber = momentData.momentNumber;
         maxMomentNumber = chapterSnap.data().momentCount || 0;

         // Validate moment belongs to chapter
         if (momentData.chapterRef !== chapterId) {
            throw new Error('Moment not in this chapter');
         }

         // Validate chapter belongs to book
         if (chapterSnap.data().bookRef !== bookId) {
            throw new Error('Chapter not in this book');
         }

         // Validate moment number range if changing
         if (updatedMomentNumber && updatedMomentNumber !== oldMomentNumber) {
            const newNum = Number(updatedMomentNumber);
            if (newNum < 1 || newNum > maxMomentNumber) {
               throw new Error(
                  maxMomentNumber === 1
                     ? `Only one moments in this chapter. Moment number must be 1.`
                     : `Moment number out of range. Expected a value from 1 to ${maxMomentNumber}.`
               );
            }
         }

         // Update title/content immediately if provided
         const updates = {};
         if (updatedMomentTitle) updates.momentTitle = updatedMomentTitle.trim();
         if (updatedMomentContent) updates.momentContent = updatedMomentContent.trim();
         updates.updatedAt = admin.firestore.FieldValue.serverTimestamp();

         if (Object.keys(updates).length > 1) { // More than just updatedAt
            t.update(momentRef, updates);
         }
      });



      // 2️⃣ Handle moment number change if needed
      if (updatedMomentNumber && updatedMomentNumber !== oldMomentNumber) {
         const newNum = Number(updatedMomentNumber);
         const batch = db.batch();
         
         const direction = newNum > oldMomentNumber ? -1 : +1;
         const [start, end] = newNum > oldMomentNumber
            ? [oldMomentNumber + 1, newNum]   // moving down
            : [newNum, oldMomentNumber - 1]; // moving up

         const snap = await db.collection('moments')
            .where('chapterRef', '==', chapterId)
            .where('momentNumber', '>=', start)
            .where('momentNumber', '<=', end)
            .get();

         snap.forEach(doc => {
            const n = doc.data().momentNumber;
            batch.update(doc.ref, {
               momentNumber: n + direction,
               updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
         });

         // Update the moved moment
         batch.update(momentRef, {
            momentNumber: newNum,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
         });

         await batch.commit();
      }



      // 3️⃣ Handle image updates (outside transaction)
      const updates = {
         updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      if (file) {
         // New image uploaded - delete old image if exists
         if (momentData.momentImage) {
            const momentImagePath = extractStoragePath(momentData.momentImage);
            await deleteFromStorage(momentImagePath);
         }

         const originalFilename = file.originalname;
         const firebaseStoragePath = `moment-images/${bookId}/${chapterId}/${originalFilename}`;
         
         const newMomentImageUrl = await uploadToStorage(
            file.buffer,
            file.originalname,
            file.mimetype,
            firebaseStoragePath
         );

         updates.momentImage = newMomentImageUrl;
      } else if (shouldRemoveImage === true || shouldRemoveImage === 'true') {
         // Explicit request to remove image
         if (momentData.momentImage) {
            const momentImagePath = extractStoragePath(momentData.momentImage);
            await deleteFromStorage(momentImagePath);
         }
         updates.momentImage = '';
      } else {
         // Keep existing image
         updates.momentImage = momentData.momentImage;
      }

      // Apply final updates (image changes)
      await momentRef.update(updates);

      res.json({ 
         message: 'Moment updated successfully',
         updatedMoment: {
            ...updates,
            momentTitle: updatedMomentTitle || momentData.momentTitle,
            momentContent: updatedMomentContent || momentData.momentContent,
            momentNumber: updatedMomentNumber || oldMomentNumber
         }
      });

   } catch (err) {
      console.error('Error in updateMoment:', err.message);
      res.status(500).json({ 
         error: 'Error updating moment', 
         message: err.message 
      });
   }
};


exports.deleteMoment = async (req, res) => {
   try {      
      const { bookId, chapterId, momentId } = req.params;
      const { password } = req.body;

      // Step 1: Validate admin password
      const adminDoc = await db.collection('users').doc(req.user.uid).get();
      const hashedPassword = adminDoc.data()?.hashedPassword;

      if (!hashedPassword) {
         return res.status(403).json({ message: 'Admin Password Not Found!' });
      }

      const isMatch = await bcrypt.compare(password, hashedPassword);
      if (!isMatch) {
         return res.status(401).json({ message: 'Incorrect Admin Password!' });
      }

      // References
      const momentRef = db.collection('moments').doc(momentId);
      
      // Get the moment data FIRST, before any deletion
      const momentSnap = await momentRef.get();
      if (!momentSnap.exists) {
         return res.status(404).json({ message: 'Moment not found' });
      }

      const momentData = momentSnap.data();
      
      // Delete momentImage from Firebase Storage if it exists
      if (momentData.momentImage) {
         const momentImagePath = extractStoragePath(momentData.momentImage);
         await deleteFromStorage(momentImagePath);
      }

      // Now proceed with the transaction to delete the document and update counts
      const chapterRef = db.collection('chapters').doc(chapterId);
      const bookRef = db.collection('books').doc(bookId);

      const result = await db.runTransaction(async (transaction) => {
         const [chapterSnap, bookSnap] = await Promise.all([
            transaction.get(chapterRef),
            transaction.get(bookRef)
         ]);

         if (!chapterSnap.exists) throw new Error('Chapter not found');
         if (!bookSnap.exists) throw new Error('Book not found');

         const deletedMomentNumber = momentData.momentNumber;

         // Delete moment document
         transaction.delete(momentRef);

         // Update moment numbers for remaining moments in chapter
         const momentsSnapshot = await db.collection('moments')
            .where('chapterRef', '==', chapterId)
            .get();

         momentsSnapshot.docs.forEach(doc => {
            if (doc.data().momentNumber > deletedMomentNumber) {
               transaction.update(doc.ref, { 
                  momentNumber: doc.data().momentNumber - 1 
               });
            }
         });

         // Decrement counts
         transaction.update(chapterRef, { 
            momentCount: admin.firestore.FieldValue.increment(-1) 
         });
         transaction.update(bookRef, { 
            momentCount: admin.firestore.FieldValue.increment(-1) 
         });

         return {
            deletedMomentNumber,
            deletedMomentTitle: momentData.momentTitle
         };
      });

      console.log(`Deleted Moment: ${result.deletedMomentNumber} - ${result.deletedMomentTitle}`);
      res.json({ 
         message: 'Moment deleted successfully',
         deletedMomentNumber: result.deletedMomentNumber,
         deletedMomentTitle: result.deletedMomentTitle
      });

   } catch (err) {
      console.error('Error in deleteMoment:', err);
      res.status(500).json({ message: 'Error deleting moment', error: err.message });
   }
};




