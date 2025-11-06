import multer from 'multer';
import multerS3 from 'multer-s3';
import { s3, S3_BUCKET, S3_PREFIX } from '../config/s3.js';

// Generate unique keys: prefix/yyyy/mm/dd/uuid-filename
function objectKey(req, file, cb) {
  const today = new Date();
  const yyyy = today.getUTCFullYear();
  const mm = String(today.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(today.getUTCDate()).padStart(2, '0');
  const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
  const uid = Math.random().toString(36).slice(2, 10);
  const key = `${S3_PREFIX}/${yyyy}/${mm}/${dd}/${uid}-${safeName}`;
  cb(null, key);
}

const storage = multerS3({
  s3,
  bucket: S3_BUCKET,
  contentType: multerS3.AUTO_CONTENT_TYPE,
  cacheControl: 'public, max-age=31536000, immutable',
  key: objectKey
});

export const upload = multer({
  storage,
  limits: {
    files: 3,           // at most 3 images
    fileSize: 5 * 1024 * 1024 // 5MB per file
  },
  fileFilter: (req, file, cb) => {
    // Some browsers/devices report JPG as image/jpg; allow common types
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) return cb(null, true);
    cb(new Error('Only JPEG, PNG, or WEBP images are allowed'));
  }
});

// NOTE: We still stream originals directly to S3 via multer-s3, then later
// thumbnail generation reads them back. Future optimization: switch to
// memoryStorage + single pass sharp processing before upload.
