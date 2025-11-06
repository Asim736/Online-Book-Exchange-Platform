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
import { deleteS3Objects, S3_BUCKET, S3_REGION, presignUrlIfEnabled, S3_SIGNED_URLS } from '../config/s3.js';

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

    let [books, total] = await Promise.all([
      Book.find(filter)
        .select('title author genre location images owner status createdAt')
        .populate('owner', 'username avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Book.countDocuments(filter)
    ]);

    // If presigned URLs are enabled, convert image URLs for each book
    if (S3_SIGNED_URLS) {
      books = await Promise.all(books.map(async (b) => {
        const signedImages = await Promise.all((b.images || []).map(u => presignUrlIfEnabled(u)));
        // Avoid mutating Mongoose internals directly; toObject preserves lean copy
        const copy = b.toObject();
        copy.images = signedImages;
        return copy;
      }));
    }

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
    let book = await Book.findById(req.params.id)
      .populate('owner', 'username email avatar bio');
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }
    if (S3_SIGNED_URLS) {
      const signedImages = await Promise.all((book.images || []).map(u => presignUrlIfEnabled(u)));
      const copy = book.toObject();
      copy.images = signedImages;
      return res.status(200).json(copy);
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

    // Parse JSON-like fields that may have come via multipart/form-data
    const parseMaybeJson = (v) => {
      if (v == null) return undefined;
      try { return typeof v === 'string' ? JSON.parse(v) : v; } catch { return v; }
    };

    const externalUrls = parseMaybeJson(req.body.externalUrls) || [];

    // Gather uploaded image URLs from multer-s3
    const rawUploads = Array.isArray(req.files)
      ? req.files.map(f => f.location || f.key || f.path).filter(Boolean)
      : [];

    // Normalize to full HTTPS URLs if we only received keys
    const toUrl = (u) => {
      if (!u) return null;
      if (/^https?:\/\//i.test(u)) return u;
      // ensure no leading slash duplication
      const key = u.replace(/^\//, '');
      return `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${key}`;
    };
    const uploadedUrls = rawUploads.map(toUrl).filter(Boolean);

    // Debug visibility for uploads (safe fields only)
    try {
      const count = Array.isArray(req.files) ? req.files.length : 0;
      const types = (req.files || []).map(f => f.mimetype);
      console.log(`[UPLOAD] Received ${count} file(s) | types=${types.join(', ')} | urls=${uploadedUrls.length}`);
    } catch (_) {}

    const bookData = {
      title: req.body.title,
      author: req.body.author,
      genre: req.body.genre,
      condition: req.body.condition,
      location: req.body.location,
      description: req.body.description,
      externalUrls,
      images: uploadedUrls,
      owner: req.user._id,
      status: 'available'
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

        // Allow multipart form updates: keep existing images and add newly uploaded ones
        const parseMaybeJson = (v) => {
          if (v == null) return undefined;
          try { return typeof v === 'string' ? JSON.parse(v) : v; } catch { return v; }
        };

        const existingImages = parseMaybeJson(req.body.existingImages) || book.images || [];
            const rawUploads = Array.isArray(req.files)
              ? req.files.map(f => f.location || f.key || f.path).filter(Boolean)
              : [];
            const toUrl = (u) => {
              if (!u) return null;
              if (/^https?:\/\//i.test(u)) return u;
              const key = u.replace(/^\//, '');
              return `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${key}`;
            };
            const uploadedUrls = rawUploads.map(toUrl).filter(Boolean);

        const update = {
          title: req.body.title ?? book.title,
          author: req.body.author ?? book.author,
          genre: req.body.genre ?? book.genre,
          condition: req.body.condition ?? book.condition,
          location: req.body.location ?? book.location,
          description: req.body.description ?? book.description,
          externalUrls: parseMaybeJson(req.body.externalUrls) ?? book.externalUrls,
          images: [...existingImages, ...uploadedUrls].slice(0, 3),
          status: req.body.status ?? book.status
        };

        const updatedBook = await Book.findByIdAndUpdate(
            req.params.id,
            { $set: update },
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

    // Best-effort: delete images from S3 (ignore non-URL/base64)
    try { await deleteS3Objects(book.images || []); } catch (e) { /* noop */ }

    // Mongoose v7 removed document.remove(). Use deleteOne() or findByIdAndDelete
    await book.deleteOne();
    res.status(200).json({ 
      message: 'Book deleted successfully',
      id: book._id
    });
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
    let [books, total] = await Promise.all([
      Book.find({ owner: req.user._id })
        .sort({ createdAt: -1 })
        .select('-__v')
        .skip(skip)
        .limit(limit),
      Book.countDocuments({ owner: req.user._id })
    ]);

    if (S3_SIGNED_URLS) {
      books = await Promise.all(books.map(async (b) => {
        const signedImages = await Promise.all((b.images || []).map(u => presignUrlIfEnabled(u)));
        const copy = b.toObject();
        copy.images = signedImages;
        return copy;
      }));
    }

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