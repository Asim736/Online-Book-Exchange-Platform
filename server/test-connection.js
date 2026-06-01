import mongoose from 'mongoose';

const mongoUri = 'mongodb+srv://upskillasim_db_user:ITrGGMA19pjA9ash@bookexchangecluster.vrqhqv8.mongodb.net/bookexchange?appName=BookExchangeCluster';

mongoose.connect(mongoUri)
  .then(() => {
    console.log('✅ MongoDB Connected Successfully!');
    console.log('Database:', mongoose.connection.db.getName());
    console.log('Collections:', Object.keys(mongoose.connection.collections));
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ MongoDB Connection Failed:');
    console.error('Error Type:', error.name);
    console.error('Error Message:', error.message);
    console.error('Full Error:', error);
    process.exit(1);
  });
  