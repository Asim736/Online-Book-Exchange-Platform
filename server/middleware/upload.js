import multer from 'multer';

// Use memory storage to hold files in RAM, then convert to Base64
const storage = multer.memoryStorage();

// Filter to accept only image files
const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Only JPEG, PNG, and WebP are allowed. Received: ${file.mimetype}`));
  }
};

// Configure multer with 2MB max file size
const uploadConfig = {
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB
  }
};

export const upload = multer(uploadConfig);
