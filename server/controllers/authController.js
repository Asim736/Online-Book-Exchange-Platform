import crypto from 'crypto';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sendVerificationEmail, sendResetPasswordEmail } from '../utils/emailService.js';

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

        // Generate email verification token (24-hour expiry)
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

        const newUser = new User({
            username: username.trim(),
            email: email.trim().toLowerCase(),
            password: hashedPassword,
            isVerified: false,
            verificationToken,
            verificationTokenExpiry
        });
        await newUser.save();

        // Send verification email (non-blocking — don't fail signup if email send fails)
        try {
            await sendVerificationEmail(newUser.email, verificationToken);
            console.log(`[EMAIL] Verification email sent to ${newUser.email}`);
        } catch (emailError) {
            console.error(`[EMAIL] Failed to send verification email to ${newUser.email}:`, emailError.message);
        }

        res.status(201).json({
            message: 'Account created! Please check your email to verify your account.'
        });
    } catch (error) {
        // Handle duplicate email (Mongoose code 11000)
        if (error.code === 11000) {
            return res.status(409).json({ message: 'Email already exists' });
        }
        res.status(400).json({ message: error.message });
    }
};

// Verify email address via token from query param
export const verifyEmail = async (req, res) => {
    try {
        const { token } = req.query;

        if (!token || typeof token !== 'string' || !token.trim()) {
            return res.status(400).json({ message: 'Verification token is required' });
        }

        const user = await User.findOne({
            verificationToken: token.trim(),
            verificationTokenExpiry: { $gt: new Date() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired verification token' });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpiry = undefined;
        await user.save();

        console.log(`[EMAIL] User ${user.email} verified successfully`);
        res.json({ message: 'Email verified successfully! You can now log in.' });
    } catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({ message: 'Verification failed. Please try again.' });
    }
};

// Login user — blocks unverified accounts
export const login = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Block unverified users from logging in
        if (!user.isVerified) {
            return res.status(403).json({
                message: 'Please verify your email before logging in. Check your inbox for the verification link.'
            });
        }

        const token = jwt.sign(
            {
                _id: user._id,
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

// Forgot password — send reset email (don't reveal if email exists)
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // Validate email
        if (!email || typeof email !== 'string' || !email.trim()) {
            return res.status(400).json({ message: 'Email is required' });
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        // Don't reveal whether the email exists (security best practice)
        const user = await User.findOne({ email: email.trim().toLowerCase() });

        if (user) {
            // Generate secure reset token (1-hour expiry)
            const resetToken = crypto.randomBytes(32).toString('hex');
            user.resetPasswordToken = resetToken;
            user.resetPasswordTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
            await user.save();

            // Send reset email (non-blocking)
            try {
                await sendResetPasswordEmail(user.email, resetToken);
                console.log(`[EMAIL] Password reset email sent to ${user.email}`);
            } catch (emailError) {
                console.error(`[EMAIL] Failed to send reset email to ${user.email}:`, emailError.message);
            }
        } else {
            // Log the attempt without revealing to the user
            console.log(`[EMAIL] Password reset requested for unknown email: ${email}`);
        }

        // Always return the same message regardless of whether the email exists
        res.json({
            message: 'If an account with that email exists, a password reset link has been sent.'
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Something went wrong. Please try again.' });
    }
};

// Reset password — update password using reset token
export const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        // Validate inputs
        if (!token || typeof token !== 'string') {
            return res.status(400).json({ message: 'Reset token is required' });
        }
        if (!newPassword || typeof newPassword !== 'string') {
            return res.status(400).json({ message: 'New password is required' });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'New password must be at least 6 characters long' });
        }

        // Find user with valid (non-expired) reset token
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordTokenExpiry: { $gt: new Date() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        // Hash and update password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordTokenExpiry = undefined;
        await user.save();

        console.log(`[EMAIL] Password reset successful for ${user.email}`);
        res.json({ message: 'Password reset successful! You can now log in with your new password.' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Something went wrong. Please try again.' });
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