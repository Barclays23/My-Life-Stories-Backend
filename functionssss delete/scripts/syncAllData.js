
// const { collection, getDocs } = require('firebase/firestore');
const { db } = require('../lib/firebase');
const { connectMongoDB } = require('../db/mongoose');

const Book = require('../schemas/bookSchema');
const Chapter = require('../schemas/chapterSchema');
const Comment = require('../schemas/commentSchema');
const Hero = require('../schemas/heroSchema');
const Moment = require('../schemas/momentSchema');
const Payment = require('../schemas/paymentSchema');
const Review = require('../schemas/reviewSchema');
const User = require('../schemas/userSchema');




async function syncAllData() {
  try {
    // Connect to MongoDB
    await connectMongoDB();
    console.log('Starting initial sync from Firestore to MongoDB...');

    // Sync Users
    console.log('Syncing users...');
    // const usersSnapshot = await getDocs(collection(db, 'users'));
    const usersSnapshot = await db.collection('users').get();

    for (const doc of usersSnapshot.docs) {
      const userData = doc.data();
      const id = doc.id;
      let user = await User.findOne({ id });

      if (!user) {
        user = new User({
          id: id,
          uid: id,
          email: userData.email,
          name: userData.displayName || userData.email.split('@')[0],
          profilePicUrl: userData.photoURL || '',
          isAdmin: userData.isAdmin || false,
          isBlocked: false,
          createdAt: userData.createdAt?.toDate() || new Date(),
          updatedAt: userData.updatedAt?.toDate() || new Date(),
        });

        await user.save();
      }
    }
    console.log(`Synced ${usersSnapshot.size} users.`);

    // Sync Books
    console.log('Syncing books...');
    // const booksSnapshot = await getDocs(collection(db, 'books'));
    const booksSnapshot = await db.collection('books').get();

    for (const doc of booksSnapshot.docs) {
      const bookData = doc.data();
      const id = doc.id;
      let book = await Book.findOne({ id });

      if (!book) {
        book = new Book({
          id: id,
          title: bookData.title,
          isPublished: bookData.isPublished || false,
          accessType: bookData.accessType || 'Paid',
          releaseStatus: bookData.releaseStatus || 'Draft',
          createdAt: bookData.createdAt?.toDate() || new Date(),
          updatedAt: bookData.updatedAt?.toDate() || new Date(),
        });

        await book.save();
      }
    }
    console.log(`Synced ${booksSnapshot.size} books.`);

    // Sync Chapters
    console.log('Syncing chapters...');
    // const chaptersSnapshot = await getDocs(collection(db, 'chapters'));
    const chaptersSnapshot = await db.collection('chapters').get();

    for (const doc of chaptersSnapshot.docs) {
      const chapterData = doc.data();
      const id = doc.id;
      let chapter = await Chapter.findOne({ id });

      if (!chapter) {
        chapter = new Chapter({
          id: id,
          bookId: chapterData.bookId,
          chapterTitle: chapterData.chapterTitle,
          chapterNumber: chapterData.chapterNumber,
          createdAt: chapterData.createdAt?.toDate() || new Date(),
          updatedAt: chapterData.updatedAt?.toDate() || new Date(),
        });

        await chapter.save();
      }
    }
    console.log(`Synced ${chaptersSnapshot.size} chapters.`);


    // Sync Moments
    console.log('Syncing moments...');
    // const momentsSnapshot = await getDocs(collection(db, 'moments'));
    const momentsSnapshot = await db.collection('moments').get();

    for (const doc of momentsSnapshot.docs) {
      const momentData = doc.data();
      const id = doc.id;
      let moment = await Moment.findOne({ id });

      if (!moment) {
        moment = new Moment({
          id: id,
          chapterId: momentData.chapterId,
          content: momentData.content,
          createdAt: momentData.createdAt?.toDate() || new Date(),
          updatedAt: momentData.updatedAt?.toDate() || new Date(),
        });

        await moment.save();
      }
    }
    console.log(`Synced ${momentsSnapshot.size} moments.`);


    // Sync Hero
    console.log('Syncing hero...');
    // const heroSnapshot = await getDocs(collection(db, 'hero'));
    const heroSnapshot = await db.collection('hero').get();

    for (const doc of heroSnapshot.docs) {
      const heroData = doc.data();
      const id = doc.id;
      let hero = await Hero.findOne({ id });

      if (!hero) {
        hero = new Hero({
          id: id,
          title: heroData.title,
          description: heroData.description,
          imageUrl: heroData.imageUrl,
          createdAt: heroData.createdAt?.toDate() || new Date(),
          updatedAt: heroData.updatedAt?.toDate() || new Date(),
        });

        await hero.save();
      }
    }
    console.log(`Synced ${heroSnapshot.size} hero entries.`);



    // Sync Reviews
    console.log('Syncing reviews...');
    // const reviewsSnapshot = await getDocs(collection(db, 'reviews'));
    const reviewsSnapshot = await db.collection('reviews').get();

    for (const doc of reviewsSnapshot.docs) {
      const reviewData = doc.data();
      const id = doc.id;
      let review = await Review.findOne({ id });

      if (!review) {
        review = new Review({
          id: id,
          userId: reviewData.userId,
          bookId: reviewData.bookId,
          rating: reviewData.rating,
          reviewText: reviewData.reviewText,
          createdAt: reviewData.createdAt?.toDate() || new Date(),
          updatedAt: reviewData.updatedAt?.toDate() || new Date(),
        });

        await review.save();
      }
    }
    console.log(`Synced ${reviewsSnapshot.size} reviews.`);





    // Sync Comments
    console.log('Syncing comments...');
    // const commentsSnapshot = await getDocs(collection(db, 'comments'));
    const commentsSnapshot = await db.collection('comments').get();

    for (const doc of commentsSnapshot.docs) {
      const commentData = doc.data();
      const id = doc.id;
      let comment = await Comment.findOne({ id });

      if (!comment) {
        comment = new Comment({
          id: id,
          userId: commentData.userId,
          chapterId: commentData.chapterId,
          commentText: commentData.commentText,
          adminReply: commentData.adminReply,
          createdAt: commentData.createdAt?.toDate() || new Date(),
          updatedAt: commentData.updatedAt?.toDate() || new Date(),
        });

        await comment.save();
      }
    }
    console.log(`Synced ${commentsSnapshot.size} comments.`);




    // Sync Payments
    console.log('Syncing payments...');
    // const paymentsSnapshot = await getDocs(collection(db, 'payments'));
    const paymentsSnapshot = await db.collection('payments').get();

    for (const doc of paymentsSnapshot.docs) {
      const paymentData = doc.data();
      const id = doc.id;
      let payment = await Payment.findOne({ id });

      if (!payment) {
        payment = new Payment({
          id: id,
          userId: paymentData.userId,
          bookId: paymentData.bookId,
          status: paymentData.status,
          amount: paymentData.amount,
          createdAt: paymentData.createdAt?.toDate() || new Date(),
          updatedAt: paymentData.updatedAt?.toDate() || new Date(),
        });

        await payment.save();
      }
    }
    console.log(`Synced ${paymentsSnapshot.size} payments.`);

    console.log('Initial sync completed successfully!');
    
  } catch (error) {
    console.error('Error during initial sync:', error);
    throw error;
  }
}

syncAllData().catch(console.error);