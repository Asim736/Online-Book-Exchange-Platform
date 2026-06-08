import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Register a new user
export const register = async (req, res) => {
    try {
        // Destructure only allowed fields to prevent NoSQL injection
        const { username, email, password, ...rest } = req.body;

        // Check for unexpected/MongoDB fields in the request
        const unexpectedKeys = Object.keys(rest).filter(
            k => k.startsWith('$') || !['username', 'email', 'password'].includes(k)
        );
        if (unexpectedKeys.length > 0) {
            return res.status(400).json({
                message: `Unexpected fields detected: ${unexpectedKeys.join(', ')}`
            });
        }

        // Validate required fields
        if (!username || typeof username !== 'string' || !username.trim()) {
            return res.status(400).json({ message: 'Username is required' });
        }
        if (!email || typeof email !== 'string' || !email.trim()) {
            return res.status(400).json({ message: 'Email is required' });
        }
        if (!password || typeof password !== 'string') {
            return res.status(400).json({ message: 'Password is required' });
        }

        // Validate field formats
        if (username.trim().length < 3) {
            return res.status(400).json({ message: 'Username must be at least 3 characters long' });
        }
        if (username.trim().length > 50) {
            return res.status(400).json({ message: 'Username must be at most 50 characters long' });
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            return res.status(400).json({ message: 'Invalid email format' });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            username: username.trim(),
            email: email.trim().toLowerCase(),
            password: hashedPassword
        });
        await newUser.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        // Handle duplicate email (Mongoose code 11000)
        if (error.code === 11000) {
            return res.status(409).json({ message: 'Email already exists' });
        }
        res.status(400).json({ message: error.message });
    }
};

// Login user
export const login = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            {
                _id: user._id,  // Changed from id to _id to match MongoDB
                email: user.email,
                username: user.username,
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            token,
            user: {
                _id: user._id,
                email: user.email,
                username: user.username,
                avatar: user.avatar,
                bio: user.bio,
                contact: user.contact,
                createdAt: user.createdAt
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Forgot password
export const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Implementation for sending reset password email

        res.status(200).json({ message: 'Reset password email sent' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Reset password
export const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        // Implementation for verifying token and resetting password

        res.status(200).json({ message: 'Password reset successful' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const validateToken = async (req, res) => {
  try {
    // If middleware passed, token is valid
    res.json({
      valid: true,
      user: {
        _id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        avatar: req.user.avatar,
        bio: req.user.bio,
        contact: req.user.contact,
        createdAt: req.user.createdAt
      }
    });
  } catch (error) {
    console.error('Validation error:', error);
    res.status(401).json({
      valid: false,
      message: error.message
    });
  }
};