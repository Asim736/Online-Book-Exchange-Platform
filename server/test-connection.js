#!/usr/bin/env node
/**
 * Test MongoDB Connection
 * Reads MONGODB_URI from the environment (loaded via .env or export)
 *
 * Usage: node test-connection.js
 */

import mongoose from 'mongoose';
import '../config/env.js';

const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  console.error('❌ MONGODB_URI is not set. Check your .env file or environment variables.');
  process.exit(1);
}

mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 })
  .then(() => {
    console.log('✅ MongoDB Connected Successfully!');
    const db = mongoose.connection.db;
    if (db) {
      console.log('Database:', db.databaseName);
    }
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ MongoDB Connection Failed:');
    console.error('Error Type:', error.name);
    console.error('Error Message:', error.message);
    process.exit(1);
  });
