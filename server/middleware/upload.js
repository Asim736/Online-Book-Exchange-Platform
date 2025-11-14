import multer from 'multer';
import multerS3 from 'multer-s3';
import { s3, S3_BUCKET, S3_PREFIX } from '../config/s3.js';
import { validateS3Env } from '../config/env.js';

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

// If S3 is not configured locally, fall back to in-memory storage so the server can start.
// Upload endpoints will still accept files, but controllers should treat them as unsupported.
const { valid: s3EnvValid, summary } = validateS3Env({ exitOnError: false });
const useS3 = Boolean(S3_BUCKET) && s3EnvValid;
let storage;
if (useS3) {
  storage = multerS3({
    s3,
    bucket: S3_BUCKET,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    cacheControl: 'public, max-age=31536000, immutable',
    key: objectKey
  });
  console.log(`[UPLOAD] Using S3 storage | bucket=${S3_BUCKET} region=${process.env.AWS_REGION} prefix=${S3_PREFIX}`);
} else {
  console.warn(`[UPLOAD] Using memoryStorage. S3 disabled or misconfigured. Summary: ${JSON.stringify(summary)}`);
  storage = multer.memoryStorage();
}

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

// Export a flag so other modules can detect if S3 uploads are active
export const S3_UPLOADS_ENABLED = useS3;

// NOTE: We still stream originals directly to S3 via multer-s3, then later
// thumbnail generation reads them back. Future optimization: switch to
// memoryStorage + single pass sharp processing before upload.
