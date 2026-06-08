import User from '../models/User.js';
import Book from '../models/Book.js';
import Request from '../models/Request.js';
import Exchange from '../models/Exchange.js';

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getUserById = async (req, res) => {
    try {
        const user = await User.findById({ $eq: req.params.id }).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createUser = async (req, res) => {
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
        if (!username || !username.trim()) {
            return res.status(400).json({ message: 'Username is required' });
        }
        if (!email || !email.trim()) {
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

        // Hash password
        const bcrypt = await import('bcryptjs');
        const hashedPassword = await bcrypt.default.hash(password, 10);

        const newUser = new User({
            username: username.trim(),
            email: email.trim().toLowerCase(),
            password: hashedPassword
        });
        const savedUser = await newUser.save();

        // Return user without password
        const { password: removedPassword, ...safeUser } = savedUser.toObject();
        res.status(201).json(safeUser);
    } catch (error) {
        // Handle duplicate email (Mongoose code 11000)
        if (error.code === 11000) {
            return res.status(409).json({ message: 'Email already exists' });
        }
        res.status(400).json({ message: error.message });
    }
};

export const updateUser = async (req, res) => {
    try {
        // Whitelist allowed fields to prevent NoSQL injection
        const allowedFields = ['username', 'email', 'bio', 'avatar'];
        const sanitized = {};
        for (const key of allowedFields) {
            if (req.body[key] !== undefined) {
                sanitized[key] = req.body[key];
            }
        }
        const user = await User.findByIdAndUpdate(
            { $eq: req.params.id },
            { $set: sanitized },
            { new: true, runValidators: true }
        );
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete({ $eq: req.params.id });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



// Get user's recent messages/conversations
export const getUserMessages = async (req, res) => {
    try {
        const userId = req.user._id;
        
        // This is a simplified version - in a real app you'd have a Message model
        // For now, we'll return mock data based on user requests/exchanges
        const recentRequests = await Request.find({
            $or: [{ requester: userId }, { owner: userId }]
        })
        .populate('requester', 'username email')
        .populate('owner', 'username email')
        .populate('book', 'title')
        .sort({ createdAt: -1 })
        .limit(5);

        const messages = recentRequests
          .filter(request => request.requester && request.owner && request.book)
          .map(request => {
            const requesterId = request.requester._id ? request.requester._id.toString() : null;
            const ownerId = request.owner._id ? request.owner._id.toString() : null;
            const otherUser = requesterId === userId ? request.owner : request.requester;
            return {
                id: request._id,
                userName: otherUser?.username || 'Unknown',
                avatar: `https://i.pravatar.cc/150?u=${otherUser?.email || 'unknown'}`,
                lastMessage: request.message || (request.book?.title ? `Interested in "${request.book.title}"` : 'Book request'),
                timestamp: request.createdAt,
                bookTitle: request.book?.title || 'Unknown Book'
            };
        });

        res.status(200).json(messages);

    } catch (error) {
        console.error('Messages error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Update user profile (for authenticated users)
export const updateProfile = async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        // Destructure only allowed fields to prevent NoSQL injection
        const { username, email, bio, avatar, contact, ...rest } = req.body;

        // Check for unexpected/MongoDB fields in the request
        const allowedFields = ['username', 'email', 'bio', 'contact', 'avatar'];
        const unexpectedKeys = Object.keys(rest).filter(
            k => k.startsWith('$') || !allowedFields.includes(k)
        );
        if (unexpectedKeys.length > 0) {
            return res.status(400).json({
                message: `Unexpected fields detected: ${unexpectedKeys.join(', ')}`
            });
        }

        // Build update data with whitelisted fields only
        const updateData = {};

        if (username !== undefined) {
            if (typeof username !== 'string' || !username.trim()) {
                return res.status(400).json({ message: 'Username must be a non-empty string' });
            }
            if (username.trim().length < 3) {
                return res.status(400).json({ message: 'Username must be at least 3 characters long' });
            }
            if (username.trim().length > 50) {
                return res.status(400).json({ message: 'Username must be at most 50 characters long' });
            }
            updateData.username = username.trim();
        }

        if (email !== undefined) {
            if (typeof email !== 'string' || !email.trim()) {
                return res.status(400).json({ message: 'Email must be a non-empty string' });
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email.trim())) {
                return res.status(400).json({ message: 'Invalid email format' });
            }
            updateData.email = email.trim().toLowerCase();
        }

        if (bio !== undefined) updateData.bio = bio;
        if (contact !== undefined) updateData.contact = contact;
        if (avatar !== undefined) updateData.avatar = avatar;

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: 'No valid fields to update' });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            message: 'Profile updated successfully',
            user
        });
    } catch (error) {
        console.error('Profile update error:', error);
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Email already exists' });
        }
        res.status(400).json({ message: error.message });
    }
};

// Change user password
export const changePassword = async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        // Destructure only allowed fields to prevent NoSQL injection
        const { currentPassword, newPassword, ...rest } = req.body;

        // Check for unexpected/MongoDB fields in the request
        const unexpectedKeys = Object.keys(rest).filter(
            k => k.startsWith('$') || !['currentPassword', 'newPassword'].includes(k)
        );
        if (unexpectedKeys.length > 0) {
            return res.status(400).json({
                message: `Unexpected fields detected: ${unexpectedKeys.join(', ')}`
            });
        }

        // Validate required fields with type checks
        if (!currentPassword || typeof currentPassword !== 'string') {
            return res.status(400).json({ message: 'Current password is required' });
        }
        if (!newPassword || typeof newPassword !== 'string') {
            return res.status(400).json({ message: 'New password is required' });
        }

        // Validate new password length
        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'New password must be at least 6 characters long' });
        }
        if (newPassword.length > 128) {
            return res.status(400).json({ message: 'New password must be at most 128 characters long' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify current password
        const bcrypt = await import('bcryptjs');
        const isCurrentPasswordValid = await bcrypt.default.compare(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        // Hash new password
        const hashedNewPassword = await bcrypt.default.hash(newPassword, 10);

        // Update password
        await User.findByIdAndUpdate(userId, { password: hashedNewPassword });

        res.status(200).json({
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.error('Password change error:', error);
        res.status(500).json({ message: 'Error changing password' });
    }
};