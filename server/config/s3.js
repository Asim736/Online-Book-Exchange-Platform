import { S3Client, DeleteObjectsCommand, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl as awsGetSignedUrl } from '@aws-sdk/s3-request-presigner';

const required = (name, fallback) => {
  const v = process.env[name] ?? fallback;
  return v;
};

export const S3_REGION = required('AWS_REGION');
export const S3_BUCKET = required('S3_BUCKET');
export const S3_PREFIX = process.env.S3_PREFIX || 'uploads/books';
export const S3_SIGNED_URLS = (process.env.S3_SIGNED_URLS || 'false').toLowerCase() === 'true';
export const S3_SIGNED_TTL = parseInt(process.env.S3_SIGNED_TTL || '21600', 10); // 6 hours

// Single shared S3 client; relies on default credentials chain (env vars or IAM role)
export const s3 = new S3Client({
  region: S3_REGION,
});

// Helper to convert a full S3/CloudFront URL back to an object key (best-effort)
export function keyFromUrl(url) {
  if (!url || typeof url !== 'string') return null;
  try {
    const u = new URL(url);
    // Remove leading slash
    return decodeURIComponent(u.pathname.replace(/^\//, ''));
  } catch (_) {
    return null;
  }
}

export async function deleteS3Objects(urls = []) {
  const keys = urls
    .map(u => typeof u === 'string' ? keyFromUrl(u) : null)
    .filter(Boolean)
    // Only delete keys under our prefix if defined
    .filter(k => !S3_PREFIX || k.startsWith(S3_PREFIX));

  if (!keys.length) return { deleted: 0 };

  const unique = Array.from(new Set(keys));

  try {
    const cmd = new DeleteObjectsCommand({
      Bucket: S3_BUCKET,
      Delete: {
        Objects: unique.map(Key => ({ Key }))
      }
    });
    await s3.send(cmd);
    return { deleted: unique.length };
  } catch (err) {
    console.error('[S3] delete error:', err?.message || err);
    return { deleted: 0, error: err?.message || String(err) };
  }
}

// Generate a presigned GET URL if enabled; otherwise return the original URL
export async function presignUrlIfEnabled(urlOrKey) {
  try {
    if (!S3_SIGNED_URLS) return urlOrKey;
    if (!urlOrKey) return urlOrKey;

    // Only operate on string inputs; leave other types untouched
    if (typeof urlOrKey !== 'string') return urlOrKey;

    const val = urlOrKey.trim();
    if (!val) return urlOrKey;

    // Do NOT presign data: or blob: URLs (legacy base64 or in-memory blobs)
    const lower = val.toLowerCase();
    if (lower.startsWith('data:') || lower.startsWith('blob:')) return urlOrKey;

    let key = null;
    if (lower.startsWith('http')) {
      // Only presign if the URL points to our S3 bucket host
      const expectedHost = S3_BUCKET && S3_REGION ? `${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com` : null;
      try {
        const u = new URL(val);
        if (!expectedHost || u.hostname !== expectedHost) {
          // Not our S3 host → return original URL unchanged
          return urlOrKey;
        }
        key = decodeURIComponent(u.pathname.replace(/^\//, ''));
      } catch {
        // If URL parsing fails, fall back to returning as-is
        return urlOrKey;
      }
    } else {
      // Treat as a key string
      key = val.replace(/^\//, '');
    }

    if (!key) return urlOrKey;

    const command = new GetObjectCommand({ Bucket: S3_BUCKET, Key: key });
    const signed = await awsGetSignedUrl(s3, command, { expiresIn: S3_SIGNED_TTL });
    return signed;
  } catch (err) {
    console.error('[S3] presign error:', err?.message || err);
    return urlOrKey; // fall back to original
  }
}

// Utility: stream to buffer (for S3 getObject Body)
async function streamToBuffer(stream) {
  if (!stream) return Buffer.alloc(0);
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (c) => chunks.push(c));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });
}

// Create a 320x320 webp thumbnail for an S3 object key; returns full HTTPS URL
export async function createThumbnailForKey(originalKey) {
  try {
    const key = originalKey.replace(/^\//, '');
    // Derive thumb key inside the same prefix for easy cleanup
    let thumbKey;
    if (key.startsWith(S3_PREFIX)) {
      thumbKey = key.replace(S3_PREFIX, `${S3_PREFIX}/thumbs`);
    } else {
      thumbKey = `${S3_PREFIX}/thumbs/${key.split('/').pop()}`;
    }

    const obj = await s3.send(new GetObjectCommand({ Bucket: S3_BUCKET, Key: key }));
    const inputBuf = await streamToBuffer(obj.Body);
    const sharp = (await import('sharp')).default;
    const out = await sharp(inputBuf)
      .resize(320, 320, { fit: 'cover', position: 'entropy' })
      .toFormat('webp', { quality: 78 })
      .toBuffer();

    await s3.send(new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: thumbKey,
      Body: out,
      ContentType: 'image/webp',
      CacheControl: 'public, max-age=31536000, immutable'
    }));

    const url = `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${thumbKey}`;
    console.log(`[THUMBNAIL] Created thumb for ${key} -> ${thumbKey}`);
    return url;
  } catch (err) {
    console.error('[S3] thumbnail error:', err?.message || err);
    return null;
  }
}
