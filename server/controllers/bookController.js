import Book from '../models/Book.js';
import User from '../models/User.js';

// Example usage
export const getAllBooks = async (req, res) => {
  try {
    const books = await Book.find()
      .populate('owner', 'username email avatar bio')
      .sort({ createdAt: -1 });
    
    res.status(200).json(books);
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
    console.log('getUserBooks called');
    console.log('User from req:', req.user);
    
    if (!req.user?._id) {
      console.log('No user ID found in request');
      return res.status(401).json({ 
        message: 'Authentication required' 
      });
    }

    console.log('Searching for books with owner:', req.user._id);
    const books = await Book.find({ owner: req.user._id })
      .sort({ createdAt: -1 })
      .select('-__v');
    
    console.log('Found books:', books.length);
    
    res.status(200).json({ 
      books,
      count: books.length
    });
  } catch (error) {
    console.error('Error fetching user books:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Error fetching user books', 
      error: error.message 
    });
  }
};