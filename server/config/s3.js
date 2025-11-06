import { S3Client, DeleteObjectsCommand, GetObjectCommand } from '@aws-sdk/client-s3';
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
    .map(keyFromUrl)
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

    // If a full URL was stored, derive the key; if a key was stored, use it directly
    const key = urlOrKey.startsWith('http') ? keyFromUrl(urlOrKey) : urlOrKey.replace(/^\//, '');
    if (!key) return urlOrKey;

    const command = new GetObjectCommand({ Bucket: S3_BUCKET, Key: key });
    const signed = await awsGetSignedUrl(s3, command, { expiresIn: S3_SIGNED_TTL });
    return signed;
  } catch (err) {
    console.error('[S3] presign error:', err?.message || err);
    return urlOrKey; // fall back to original
  }
}
