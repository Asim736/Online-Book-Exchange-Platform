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
        const user = await User.findById(req.params.id).select('-password');
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
        const newUser = new User(req.body);
        const savedUser = await newUser.save();
        res.status(201).json(savedUser);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const updateUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
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
        const user = await User.findByIdAndDelete(req.params.id);
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

        const messages = recentRequests.map(request => {
            const otherUser = request.requester._id.toString() === userId ? request.owner : request.requester;
            return {
                id: request._id,
                userName: otherUser.username,
                avatar: `https://images.unsplash.com/photo-150716231${Math.floor(Math.random() * 10)}?w=150&h=150&fit=crop&crop=face`,
                lastMessage: request.message || `Interested in "${request.book.title}"`,
                timestamp: request.createdAt,
                bookTitle: request.book.title
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
        console.log('Update profile request received');
        console.log('User ID:', req.user?._id);
        console.log('Request body:', JSON.stringify(req.body, null, 2));
        
        const userId = req.user._id;
        const { username, email, bio, avatar, contact } = req.body;

        // Validation
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const updateData = {};
        if (username && username.trim()) updateData.username = username.trim();
        if (email && email.trim()) updateData.email = email.trim();
        if (bio !== undefined) updateData.bio = bio;
        if (contact !== undefined) updateData.contact = contact;
        if (avatar !== undefined) updateData.avatar = avatar; // Changed to handle null values

        console.log('Update data:', JSON.stringify(updateData, null, 2));

        const user = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        console.log('Profile updated successfully for user:', user.username);

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
        const { currentPassword, newPassword } = req.body;
        const userId = req.user._id;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Current password and new password are required' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'New password must be at least 6 characters long' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify current password
        const bcrypt = await import('bcrypt');
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