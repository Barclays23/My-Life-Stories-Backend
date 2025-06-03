const express = require('express');
const cors = require('cors');
// const admin = require('firebase-admin');
require('dotenv').config();



const app = express();

app.use(cors());
app.use(express.json());


// Initialize Firebase Admin
// admin.initializeApp({
// credential: admin.credential.applicationDefault(),
// });
// const db = admin.firestore();



const userRoutes = require('./routes/userRoutes');
const bookRoutes = require('./routes/bookRoutes');
const chapterRoutes = require('./routes/chapterRoutes');
const momentRoutes = require('./routes/momentRoutes');
const heroRoutes = require('./routes/heroRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const commentRoutes = require('./routes/commentRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const readingProgressRoutes = require('./routes/readingProgressRoutes');
const viewRoutes = require('./routes/viewRoutes');

const adminRoutes = require('./routes/adminRoutes');


// Routes
app.use('/', userRoutes);                   // make these routes to a single one '/'
app.use('/', bookRoutes);                   // make these routes to a single one '/'
app.use('/', chapterRoutes);                   // make these routes to a single one '/'
app.use('/', momentRoutes);                   // make these routes to a single one '/'
app.use('/', heroRoutes);                   // make these routes to a single one '/'
app.use('/', reviewRoutes);                   // make these routes to a single one '/'
app.use('/', commentRoutes);                   // make these routes to a single one '/'
app.use('/', paymentRoutes);                   // make these routes to a single one '/'
app.use('/', notificationRoutes);                   // make these routes to a single one '/'
app.use('/', readingProgressRoutes);                   // make these routes to a single one '/'
app.use('/', viewRoutes);                   // make these routes to a single one '/'

app.use('/admin', adminRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on localhost:${PORT}`));