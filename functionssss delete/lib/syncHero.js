const { onDocumentCreated, onDocumentUpdated, onDocumentDeleted } = require('firebase-functions/v2/firestore');
const Hero = require('../schemas/heroSchema');
const { connectMongoDB } = require('../db/mongoose');
// const { db } = require('./firebase');





exports.syncHeroCreated = onDocumentCreated('hero/{heroId}', async (event) => {
  try {
    await connectMongoDB();

    const heroData = event.data.data();
    const id = event.params.heroId;

    const hero = new Hero({
      id: id,
      title: heroData.title,
      description: heroData.description,
      imageUrl: heroData.imageUrl,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await hero.save();

    return { status: 'success', message: 'Hero synced to MongoDB' };
  } catch (error) {
    console.error('Error syncing hero (create):', error);
    throw new Error('Failed to sync hero');
  }
});

exports.syncHeroUpdated = onDocumentUpdated('hero/{heroId}', async (event) => {
  try {
    await connectMongoDB();

    const heroData = event.data.after.data();
    const id = event.params.heroId;

    await Hero.updateOne(
      { id },
      {
        title: heroData.title,
        description: heroData.description,
        imageUrl: heroData.imageUrl,
        updatedAt: new Date(),
      }
    );

    return { status: 'success', message: 'Hero updated in MongoDB' };
  } catch (error) {
    console.error('Error syncing hero (update):', error);
    throw new Error('Failed to sync hero');
  }
});

exports.syncHeroDeleted = onDocumentDeleted('hero/{heroId}', async (event) => {
  try {
    await connectMongoDB();

    const id = event.params.heroId;
    await Hero.deleteOne({ id });

    return { status: 'success', message: 'Hero deleted from MongoDB' };
  } catch (error) {
    console.error('Error syncing hero (delete):', error);
    throw new Error('Failed to sync hero');
  }
});