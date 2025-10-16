import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const authenticateToken = async (req, res, next) => {
  try {

    // console.log("Authorization header:", req.headers.authorization);

    
    const authHeader = req.headers['authorization'];
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ 
        message: 'Authentication required', 
        detail: 'No bearer token provided' 
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded._id);
    if (!user) {
      return res.status(401).json({ 
        message: 'Authentication failed', 
        detail: 'User not found' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth Error:', error);
    return res.status(401).json({ 
      message: 'Authentication failed', 
      detail: error.message 
    });
  }
};