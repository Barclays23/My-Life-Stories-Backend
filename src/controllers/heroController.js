const { db, admin } = require('../config/firebaseAdmin');

exports.createHero = async (req, res) => {
  const { title, subtitle, description, imageUrl, buttonText, buttonLink } = req.body;
  try {
    const heroRef = await db.collection('heroes').add({
      title,
      subtitle,
      description,
      imageUrl,
      buttonText,
      buttonLink,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    });
    res.json({ id: heroRef.id, message: 'Hero created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create hero' });
  }
};

exports.getHeroes = async (req, res) => {
  try {
    const heroesSnapshot = await db.collection('heroes').get();
    const heroes = heroesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(heroes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch heroes' });
  }
};