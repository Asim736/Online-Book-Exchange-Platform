// Fetch multiple books by array of IDs (for wishlist)
export const getBooksByIds = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'No book IDs provided' });
    }
    const books = await Book.find({ _id: { $in: ids } })
      .populate('owner', 'username email avatar bio');
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching wishlist books', error: error.message });
  }
};
import Book from '../models/Book.js';
import User from '../models/User.js';

// Example usage
export const getAllBooks = async (req, res) => {
  try {
    // Pagination params
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const skip = (page - 1) * limit;

    // Filtering params
  const filter = {};
  // Only show available books by default
  filter.status = 'available';
  if (req.query.title) filter.title = { $regex: req.query.title, $options: 'i' };
  if (req.query.author) filter.author = { $regex: req.query.author, $options: 'i' };
  if (req.query.genre) filter.genre = req.query.genre;
  if (req.query.location) filter.location = { $regex: req.query.location, $options: 'i' };

    // Log query start
    const start = Date.now();

    const [books, total] = await Promise.all([
      Book.find(filter)
        .select('title author genre location images owner status createdAt')
        .populate('owner', 'username avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Book.countDocuments(filter)
    ]);

    // Log query end
    const duration = Date.now() - start;
    console.log(`[BOOKS] Query took ${duration}ms | Filter:`, filter);

    res.status(200).json({
      books,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ 
      message: 'Error fetching books', 
      error: error.message 
    });
  }
};

export const getBookById = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id)
            .populate('owner', 'username email avatar bio');
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }
        res.status(200).json(book);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createBook = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ 
        message: 'Authentication required',
        detail: 'User ID not found in request' 
      });
    }

    // Calculate estimated document size to prevent MongoDB 16MB limit issues
    const requestSize = JSON.stringify(req.body).length;
    const maxSize = 10 * 1024 * 1024; // 10MB safety limit (MongoDB limit is 16MB)
    
    if (requestSize > maxSize) {
      return res.status(413).json({
        message: 'Document too large',
        detail: 'Please reduce image sizes or number of images. Total size should be under 10MB.'
      });
    }

    const bookData = {
      ...req.body,
      owner: req.user._id,
      status: 'available' // Automatically set new books as available
    };

    const book = new Book(bookData);
    await book.save();

    res.status(201).json({
      message: 'Book created successfully',
      book: await book.populate('owner', 'username email avatar bio')
    });
  } catch (error) {
    console.error('Book creation error:', error);
    
    // Handle specific MongoDB errors
    if (error.code === 'ERR_OUT_OF_RANGE' || error.message.includes('out of range')) {
      return res.status(413).json({ 
        message: 'Document too large for database',
        detail: 'Please use smaller images or fewer images.' 
      });
    }
    
    res.status(error.name === 'ValidationError' ? 400 : 500).json({ 
      message: 'Error creating book', 
      detail: error.message 
    });
  }
};

export const updateBook = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }
        
        // Check if user is the owner
        if (book.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this book' });
        }

        const updatedBook = await Book.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        ).populate('owner', 'username email avatar bio');
        
        res.status(200).json({
            message: 'Book updated successfully',
            book: updatedBook
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteBook = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        // Check if user is the owner
        if (book.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this book' });
        }

        await book.remove();
        res.status(200).json({ message: 'Book deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};




// Get user's own books
export const getUserBooks = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Pagination params
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Query for user's books
    const [books, total] = await Promise.all([
      Book.find({ owner: req.user._id })
        .sort({ createdAt: -1 })
        .select('-__v')
        .skip(skip)
        .limit(limit),
      Book.countDocuments({ owner: req.user._id })
    ]);

    res.status(200).json({
      books,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching user books',
      error: error.message
    });
  }
};