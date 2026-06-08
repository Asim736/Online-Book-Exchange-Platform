#!/usr/bin/env node
/**
 * Verify MongoDB Atlas Credentials
 * 
 * Usage:
 *   Set MONGODB_PASSWORD env var, then run:
 *     node verify-atlas-credentials.js
 *   
 *   Or pass password as argument:
 *     node verify-atlas-credentials.js YOUR_PASSWORD_HERE
 * 
 * Steps:
 * 1. Get your password from MongoDB Atlas > Database Access > Reset Password
 * 2. Run this script with your password
 * 3. If it says "✅ Connected!", credentials are correct
 */

import mongoose from 'mongoose';

// Read password from command-line argument or environment variable
const PASSWORD = process.argv[2] || process.env.MONGODB_PASSWORD;

if (!PASSWORD) {
  console.error('\n❌ No password provided.');
  console.error('Usage: node verify-atlas-credentials.js <password>');
  console.error('   or: export MONGODB_PASSWORD=your_password && node verify-atlas-credentials.js\n');
  process.exit(1);
}

const USERNAME = 'upskillasim_db_user';
const mongoUri = `mongodb+srv://${USERNAME}:${encodeURIComponent(PASSWORD)}@bookexchangecluster.vrqhqv8.mongodb.net/bookexchange?appName=BookExchangeCluster`;

console.log('\n📋 Testing MongoDB Connection...');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`Username: ${USERNAME}`);
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
    console.log(`Database: ${mongoose.connection.name || 'bookexchange'}`);
    console.log('\n✅ Your credentials are CORRECT!');
    console.log('Update your .env MONGODB_URI with the password you provided.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Connection FAILED!');
    console.error(`Error: ${error.message}`);
    if (error.message.includes('authentication failed') || error.message.includes('bad auth')) {
      console.error('\n💡 This means:');
      console.error('  1. The password is WRONG or has special characters not URL-encoded');
      console.error(`  2. The username "${USERNAME}" doesn\'t exist`);
      console.error('  3. Reset the password in Atlas and try again');
    }
    process.exit(1);
  });
