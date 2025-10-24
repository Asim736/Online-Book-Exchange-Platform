import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: String,
    required: true,
    trim: true
  },
  genre: {
    type: String,
    required: true,
    enum: ['fiction', 'non-fiction', 'mystery', 'sci-fi', 'romance', 'thriller', 'self-help']
  },
  condition: {
    type: String,
    required: true,
    enum: ['new', 'like-new', 'good', 'fair', 'poor']
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  externalUrls: [{
    type: String,
    trim: true
  }],
  images: [{
    type: String
  }],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'exchanged', 'unavailable'],
    default: 'available'
  }
}, {
  timestamps: true
});

// Compound index for search performance
bookSchema.index({ title: 1, author: 1, genre: 1, location: 1 });

export default mongoose.model('Book', bookSchema);