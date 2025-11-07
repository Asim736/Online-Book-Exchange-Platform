import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Load env early
dotenv.config();

if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI not set');
  process.exit(1);
}

// Import models to register indexes
import Book from '../models/Book.js';
import User from '../models/User.js';
import Exchange from '../models/Exchange.js';
import Request from '../models/Request.js';

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('[INDEX] Connected to MongoDB');

    // Build indexes explicitly regardless of autoIndex in prod
    await Promise.all([
      Book.createIndexes(),
      User.createIndexes?.() || Promise.resolve(),
      Exchange.createIndexes?.() || Promise.resolve(),
      Request.createIndexes?.() || Promise.resolve(),
    ]);

    // Print the Book indexes for verification
    const specs = await Book.collection.indexes();
    console.log('[INDEX] Book indexes:', specs.map(i => i.name));

    console.log('[INDEX] Done.');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('[INDEX] Error building indexes:', err?.message || err);
    try { await mongoose.disconnect(); } catch (_) {}
    process.exit(1);
  }
}

run();
