#!/usr/bin/env node
/**
 * Verify MongoDB Atlas Credentials
 * Steps:
 * 1. Replace PASSWORD below with your newly reset password from Atlas
 * 2. Run: node verify-atlas-credentials.js
 * 3. If it says "✅ Connected!", credentials are correct
 */

import mongoose from 'mongoose';

// ⚠️ REPLACE THIS WITH YOUR ACTUAL PASSWORD FROM ATLAS
const PASSWORD = 'ITrGGMA19pjA9ash';

const mongoUri = `mongodb+srv://upskillasim_db_user:${encodeURIComponent(PASSWORD)}@bookexchangecluster.vrqhqv8.mongodb.net/bookexchange?appName=BookExchangeCluster`;

console.log('\n📋 Testing MongoDB Connection...');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`Username: upskillasim_db_user`);
console.log(`Password: ${PASSWORD.slice(0, 3)}${'*'.repeat(PASSWORD.length - 3)} (masked)`);
console.log(`Database: bookexchange`);
console.log(`Cluster: bookexchangecluster`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

mongoose.connect(mongoUri, { 
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 10000,
})
  .then(() => {
    console.log('✅ SUCCESS! MongoDB Connected!');
    const dbName = mongoose.connection.name || 'bookexchange';
    console.log(`Database: ${dbName}`);
    console.log(`Collections: ${Object.keys(mongoose.connection.collections).join(', ') || '(empty)'}`);
    console.log('\n✅ Your credentials are CORRECT!');
    console.log('Update your .env MONGODB_URI with:');
    console.log(`mongodb+srv://upskillasim_db_user:ITrGGMA19pjA9ash@bookexchangecluster.vrqhqv8.mongodb.net/bookexchange`);
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Connection FAILED!');
    console.error(`Error: ${error.message}`);
    if (error.message.includes('authentication failed') || error.message.includes('bad auth')) {
      console.error('\n💡 This means:');
      console.error('  1. The password is WRONG or has special characters not URL-encoded');
      console.error('  2. The username "upskillasim_db_user" doesn\'t exist');
      console.error('  3. Reset the password in Atlas and try again');
    }
    process.exit(1);
  });
