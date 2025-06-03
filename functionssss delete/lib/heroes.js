const functions = require('firebase-functions');
const { getFirestore, Timestamp } = require('firebase-admin/firestore');
const { heroSchema, toDate } = require('./schemas');

const db = getFirestore();

exports.fetchHeroes = functions.https.onRequest(async (req, res) => {
  try {
    const snapshot = await db.collection('heroes').get();
    const heroes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: toDate(doc.data().createdAt),
      updatedAt: toDate(doc.data().updatedAt)
    }));
    res.status(200).json({ status: 'success', data: heroes });
  } catch (error) {
    console.error('fetchHeroes - Error:', error);
    res.status(500).json({ error: 'Failed to fetch heroes' });
  }
});

exports.getHeroById = functions.https.onRequest(async (req, res) => {
  try {
    const heroId = req.query.id;
    if (!heroId) {
      return res.status(400).json({ error: 'Hero ID is required' });
    }
    const doc = await db.collection('heroes').doc(heroId).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Hero not found' });
    }
    const heroData = {
      id: doc.id,
      ...doc.data(),
      createdAt: toDate(doc.data().createdAt),
      updatedAt: toDate(doc.data().updatedAt)
    };
    res.status(200).json({ status: 'success', data: heroData });
  } catch (error) {
    console.error('getHeroById - Error:', error);
    res.status(500).json({ error: 'Failed to fetch hero' });
  }
});

exports.addHero = functions.https.onRequest(async (req, res) => {
  try {
    const heroData = req.body;
    if (!heroData.title || !heroData.imageUrl) {
      return res.status(400).json({ error: 'Title and image URL are required' });
    }
    const newHero = {
      ...heroSchema,
      title: heroData.title,
      subtitle: heroData.subtitle || '',
      description: heroData.description || '',
      imageUrl: heroData.imageUrl,
      buttonText: heroData.buttonText || '',
      buttonLink: heroData.buttonLink || '',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    const docRef = await db.collection('heroes').add(newHero);
    res.status(201).json({ status: 'success', id: docRef.id });
  } catch (error) {
    console.error('addHero - Error:', error);
    res.status(500).json({ error: 'Failed to add hero' });
  }
});

exports.updateHero = functions.https.onRequest(async (req, res) => {
  try {
    const heroId = req.body.id;
    const updates = req.body;
    if (!heroId) {
      return res.status(400).json({ error: 'Hero ID is required' });
    }
    const heroRef = db.collection('heroes').doc(heroId);
    const doc = await heroRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Hero not found' });
    }
    const updatedData = {
      ...updates,
      updatedAt: Timestamp.now()
    };
    delete updatedData.id;
    await heroRef.update(updatedData);
    res.status(200).json({ status: 'success', message: 'Hero updated' });
  } catch (error) {
    console.error('updateHero - Error:', error);
    res.status(500).json({ error: 'Failed to update hero' });
  }
});

exports.deleteHero = functions.https.onRequest(async (req, res) => {
  try {
    const heroId = req.query.id;
    if (!heroId) {
      return res.status(400).json({ error: 'Hero ID is required' });
    }
    const heroRef = db.collection('heroes').doc(heroId);
    const doc = await heroRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Hero not found' });
    }
    await heroRef.delete();
    res.status(200).json({ status: 'success', message: 'Hero deleted' });
  } catch (error) {
    console.error('deleteHero - Error:', error);
    res.status(500).json({ error: 'Failed to delete hero' });
  }
});