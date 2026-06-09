import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String, default: null },
  bio: { type: String, default: '' },
  contact: { type: String, default: '' },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  verificationTokenExpiry: { type: Date },
  resetPasswordToken: { type: String },
  resetPasswordTokenExpiry: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('User', userSchema);