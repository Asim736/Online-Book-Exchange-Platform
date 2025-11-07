#!/usr/bin/env node
import 'dotenv/config';
import mongoose from 'mongoose';
import Book from '../models/Book.js';
import { keyFromUrl, createThumbnailForKey, S3_BUCKET, S3_REGION, S3_PREFIX } from '../config/s3.js';

const DRY_RUN = (process.env.BACKFILL_DRY_RUN || 'true').toLowerCase() === 'true';
const LIMIT = parseInt(process.env.BACKFILL_LIMIT || '100', 10);
const START_PAGE = parseInt(process.env.BACKFILL_START_PAGE || '1', 10);
const MAX_PAGES = parseInt(process.env.BACKFILL_MAX_PAGES || '0', 10); // 0 = no cap

function isDataUrl(url) {
  return typeof url === 'string' && url.startsWith('data:');
}

function getKeyFromOriginal(original) {
  if (!original) return null;
  if (typeof original === 'string') {
    if (original.startsWith('http')) {
      return keyFromUrl(original);
    }
    // If it's already a key-like path
    return original.replace(/^\//, '');
  }
  return null;
}

async function processBook(book) {
  let changed = false;
  let migrated = 0;
  let createdThumbs = 0;
  let skipped = 0;

  const outImages = [];

  for (const img of book.images || []) {
    try {
      if (typeof img === 'string') {
        // Legacy string: could be S3 URL, local path, or data URL (base64)
        const originalUrl = img;
        if (isDataUrl(originalUrl)) {
          // Can't thumbnail data URLs; leave as-is
          outImages.push(originalUrl);
          skipped++;
          continue;
        }
        const key = getKeyFromOriginal(originalUrl);
        if (!key) {
          outImages.push(originalUrl);
          skipped++;
          continue;
        }
        let thumbUrl = null;
        if (!DRY_RUN) {
          thumbUrl = await createThumbnailForKey(key);
        }
        outImages.push({ original: originalUrl, thumb: thumbUrl });
        changed = true;
        migrated++;
        if (thumbUrl) createdThumbs++;
      } else if (img && typeof img === 'object') {
        const original = img.original || img.url || img.href; // tolerate odd shapes
        let thumb = img.thumb || null;
        if (!thumb && original && !isDataUrl(original)) {
          const key = getKeyFromOriginal(original);
          if (key) {
            let newThumb = null;
            if (!DRY_RUN) {
              newThumb = await createThumbnailForKey(key);
            }
            thumb = newThumb || thumb;
            if (newThumb) {
              createdThumbs++;
              changed = true;
            }
          } else {
            skipped++;
          }
        }
        outImages.push({ original, thumb: thumb || null });
      } else {
        // Unknown entry; keep as-is
        outImages.push(img);
        skipped++;
      }
    } catch (e) {
      console.error(`[BACKFILL] Error processing image for book ${book._id}:`, e?.message || e);
      outImages.push(img);
      skipped++;
    }
  }

  if (changed && !DRY_RUN) {
    await Book.updateOne({ _id: book._id }, { $set: { images: outImages } });
  }

  return { changed, migrated, createdThumbs, skipped };
}

async function run() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('[BACKFILL] MONGODB_URI not set');
    process.exit(1);
  }

  if (!S3_BUCKET || !S3_REGION) {
    console.warn('[BACKFILL] S3 not configured (S3_BUCKET/region missing). This script requires originals in S3.');
  }

  await mongoose.connect(mongoUri);
  console.log('[BACKFILL] Connected to MongoDB');
  console.log(`[BACKFILL] Options: DRY_RUN=${DRY_RUN} LIMIT=${LIMIT} START_PAGE=${START_PAGE} MAX_PAGES=${MAX_PAGES}`);

  const baseFilter = { images: { $exists: true, $ne: [] } };
  const total = await Book.countDocuments(baseFilter);
  console.log(`[BACKFILL] Candidate books: ${total}`);

  let processed = 0;
  let updatedBooks = 0;
  let totalMigrated = 0;
  let totalThumbs = 0;
  let totalSkipped = 0;

  let page = START_PAGE;
  const pages = Math.ceil(total / LIMIT);

  while (true) {
    if (MAX_PAGES > 0 && (page - START_PAGE + 1) > MAX_PAGES) break;
    const skip = (page - 1) * LIMIT;
    if (skip >= total) break;

    const batch = await Book.find(baseFilter)
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(LIMIT)
      .select('images createdAt');

    if (!batch.length) break;

    console.log(`[BACKFILL] Page ${page}/${pages} | processing ${batch.length} books...`);

    for (const book of batch) {
      const { changed, migrated, createdThumbs, skipped } = await processBook(book);
      processed++;
      totalMigrated += migrated;
      totalThumbs += createdThumbs;
      totalSkipped += skipped;
      if (changed) updatedBooks++;
      if (processed % 50 === 0) {
        console.log(`[BACKFILL] Progress: books=${processed} updated=${updatedBooks} migrated=${totalMigrated} thumbs=${totalThumbs} skipped=${totalSkipped}`);
      }
    }

    page++;
  }

  console.log('[BACKFILL] Summary:', { processed, updatedBooks, totalMigrated, totalThumbs, totalSkipped, dryRun: DRY_RUN });
  await mongoose.disconnect();
  console.log('[BACKFILL] Done.');
}

run().catch(async (e) => {
  console.error('[BACKFILL] Fatal error:', e?.message || e);
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
});
