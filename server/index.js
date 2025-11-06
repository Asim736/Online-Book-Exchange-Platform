import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';

// Load environment variables EARLY
dotenv.config();

// Dynamically import routes AFTER env is loaded so any middleware
// initialized at import time (e.g., multer-s3) can read process.env
const [
    { default: authRoutes },
    { default: bookRoutes },
    { default: userRoutes },
    { default: exchangeRoutes },
    { default: requestRoutes }
] = await Promise.all([
    import('./routes/auth.js'),
    import('./routes/books.js'),
    import('./routes/users.js'),
    import('./routes/exchanges.js'),
    import('./routes/requests.js')
]);

// Verify required environment variables
if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is not defined in environment variables');
    process.exit(1);
}

const app = express();

// Middleware
// Robust CORS handling: allow specific origins from env in production, with exact match
const allowedOrigins = (process.env.NODE_ENV === 'production'
    ? (process.env.CORS_ORIGINS || '')
    : 'http://localhost:5173,http://localhost:5174,http://localhost:5175')
    .split(',')
    .map(o => o.trim())
    .filter(Boolean);

const corsOptions = {
    origin: (origin, callback) => {
        // Allow non-browser requests (no Origin header)
        if (!origin) return callback(null, true);
        const isAllowed = allowedOrigins.includes(origin);
        if (isAllowed) return callback(null, true);
        return callback(new Error(`CORS: Origin not allowed (${origin})`), false);
    },
    credentials: true,
    optionsSuccessStatus: 200 // Some legacy browsers choke on 204
};
app.use((req, res, next) => {
    // Lightweight visibility for CORS decisions (safe in production logs)
    if (req.headers.origin) {
        console.log(`CORS check - Origin: ${req.headers.origin} | Allowed: ${allowedOrigins.includes(req.headers.origin)}`);
    }
    next();
});
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' })); // Increase payload limit for images
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Debug middleware to log requests
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// MongoDB Connection with error handling
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Successfully connected to MongoDB');
    })
    .catch((error) => {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    });

// Test route
app.get('/api/test', (req, res) => {
    res.json({ message: 'API is working!' });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// Test user creation and login
app.post('/api/test-user', async (req, res) => {
    try {
    const bcrypt = await import('bcryptjs');
        const jwt = await import('jsonwebtoken');
        const User = (await import('./models/User.js')).default;
        
        // Check if test user exists
        let user = await User.findOne({ email: 'test@example.com' });
        
        if (!user) {
            const hashedPassword = await bcrypt.default.hash('password123', 10);
            user = new User({
                username: 'testuser',
                email: 'test@example.com',
                password: hashedPassword
            });
            await user.save();
        }
        
        const token = jwt.default.sign(
            { _id: user._id, email: user.email, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.json({
            token,
            user: {
                _id: user._id,
                email: user.email,
                username: user.username,
            }
        });
    } catch (error) {
        console.error('Test user error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/users', userRoutes);
app.use('/api/exchanges', exchangeRoutes);
app.use("/api/requests", requestRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});