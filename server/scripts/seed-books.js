#!/usr/bin/env node
/**
 * Seed Script – populates the database with sample books for testing.
 *
 * Usage:
 *   node server/scripts/seed-books.js          # connect using .env MONGODB_URI
 *   node server/scripts/seed-books.js --clear  # drop existing books first
 *   node server/scripts/seed-books.js --count=5  # insert only 5 books
 *
 * The script creates a seed owner user (seed@bookexchange.local) if it does
 * not already exist, then inserts the configured number of books.
 */

import { ENV_PATH } from '../config/env.js';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── CLI flags ────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const CLEAR_FIRST = args.includes('--clear');
const COUNT_FLAG = args.find((a) => a.startsWith('--count='));
const BOOK_COUNT = COUNT_FLAG ? parseInt(COUNT_FLAG.split('=')[1], 10) || 20 : 20;

// ── Seed user details ─────────────────────────────────────────────────────────
const SEED_USER = {
  username: 'seedadmin',
  email: 'seed@bookexchange.local',
  password: 'seedpassword123',
  bio: 'Library seed account for test data',
  avatar: null,
};

// ── Sample data pools ─────────────────────────────────────────────────────────
const TITLES = [
  'The Silent Echo',
  'Beyond the Horizon',
  'Midnight in Paris',
  'The Last Kingdom',
  'Quantum Dreams',
  'Ocean of Memories',
  'The Crimson Shadow',
  'Whispers in the Wind',
  'Digital Fortress',
  'The Art of Simplicity',
  'Beneath the Surface',
  'Starlight Serenade',
  'The Iron Rose',
  'Echoes of Tomorrow',
  'The Glass Garden',
  'Shadows of the Past',
  'The Golden Hour',
  'Dancing with Fireflies',
  'The Ivory Tower',
  'Secrets of the Deep',
  'The Velvet Underground',
  'A Walk in the Clouds',
  'The Paper Moon',
  'Fragments of Time',
  'The Sapphire Sea',
  'The Broken Compass',
  'Letters from the Edge',
  'The Hidden Path',
  'The Silver Lining',
  'The Winding Road',
  'Under the Autumn Sky',
  'The Crystal Cave',
  'The Lonely Lighthouse',
  'River of Stars',
  'The Forgotten Garden',
  'The Enchanted Forest',
  'City of Dreams',
  'The Desert Rose',
  'The Twisted Vine',
  'The Frozen Flame',
];

const AUTHORS = [
  'Harper Collins',
  'Elena Martinez',
  'James O. Brien',
  'Sarah Mitchell',
  'David Chen',
  'Amara Singh',
  'Michael Torres',
  'Lily Nakamura',
  'Robert Kim',
  'Fatima Al-Rashid',
  'Thomas Blackwood',
  'Isabella Rossi',
  'Kenji Watanabe',
  'Olivia Parker',
  'Marcus Johnson',
  'Aisha Patel',
  'William Turner',
  'Sophie Laurent',
  'Carlos Mendez',
  'Priya Sharma',
  'Daniel Fischer',
  'Emma Thompson',
  'Lucas Andersen',
  'Maya Gupta',
  'Alexander Petrov',
];

const GENRES = [
  'fiction',
  'non-fiction',
  'mystery',
  'sci-fi',
  'romance',
  'thriller',
  'self-help',
];

const CONDITIONS = ['new', 'like-new', 'good', 'fair', 'poor'];

const LOCATIONS = [
  'Islamabad',
  'Lahore',
  'Karachi',
  'Rawalpindi',
  'Peshawar',
  'Quetta',
  'Multan',
  'Faisalabad',
  'Hyderabad',
  'Sialkot',
  'Gujranwala',
  'Murree',
  'Abbottabad',
  'Swat',
  'Gilgit',
];

const DESCRIPTIONS = [
  'A captivating story that keeps you turning pages late into the night.',
  'An insightful exploration of modern life and its challenges.',
  'A gripping mystery with unexpected twists and turns.',
  'A thought-provoking journey through science and imagination.',
  'A heartwarming tale of love and redemption.',
  'An edge-of-your-seat thriller that will leave you breathless.',
  'A practical guide to personal growth and self-discovery.',
  'A beautifully written novel about family and belonging.',
  'A fascinating look at history through a unique lens.',
  'An inspiring story of courage and perseverance.',
  'A masterfully crafted narrative that blurs reality and fiction.',
  'A deep dive into the human psyche and our collective consciousness.',
  'A hilarious and touching memoir of life lessons learned.',
  'A spellbinding fantasy that transports you to another world.',
  'A concise yet powerful treatise on modern philosophy.',
  'An epic saga spanning generations and continents.',
  'A collection of short stories that illuminate the human condition.',
  'A groundbreaking work that challenges conventional wisdom.',
  'A lyrical meditation on nature and our place in it.',
  'A fast-paced adventure across uncharted territories.',
];

// ── Helper: pick a random element ────────────────────────────────────────────
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ── Helper: generate a random book object ─────────────────────────────────────
function generateBook(ownerId, index) {
  // Cycle through titles so we don't repeat if count exceeds pool
  const title = TITLES[index % TITLES.length];
  const suffix = index >= TITLES.length ? ` (Vol. ${Math.floor(index / TITLES.length) + 1})` : '';
  const author = pick(AUTHORS);
  const genre = pick(GENRES);
  const condition = pick(CONDITIONS);
  const location = pick(LOCATIONS);
  const description = pick(DESCRIPTIONS);

  return {
    title: title + suffix,
    author,
    genre,
    condition,
    location,
    description,
    // Use picsum for consistent, safe placeholder images
    images: [
      `https://picsum.photos/seed/book${index}a/400/600`,
      `https://picsum.photos/seed/book${index}b/400/600`,
    ],
    externalUrls: [],
    owner: ownerId,
    status: 'available',
  };
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('[SEED] Starting seed script…');
  console.log(`[SEED] Target book count: ${BOOK_COUNT}`);
  if (CLEAR_FIRST) console.log('[SEED] --clear flag set: will drop existing books');

  // Connect
  if (!process.env.MONGODB_URI) {
    console.error('[SEED] MONGODB_URI not set in environment or .env');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('[SEED] Connected to MongoDB');

  // Import models (after connection so schemas are registered)
  const { default: User } = await import('../models/User.js');
  const { default: Book } = await import('../models/Book.js');

  // ── Seed user ───────────────────────────────────────────────────────────
  let owner = await User.findOne({ email: SEED_USER.email });
  if (!owner) {
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.default.hash(SEED_USER.password, 10);
    owner = await User.create({
      username: SEED_USER.username,
      email: SEED_USER.email,
      password: hashedPassword,
      bio: SEED_USER.bio,
      avatar: SEED_USER.avatar,
    });
    console.log(`[SEED] Created seed user: ${owner.email} (id: ${owner._id})`);
  } else {
    console.log(`[SEED] Using existing seed user: ${owner.email} (id: ${owner._id})`);
  }

  // ── Clear existing books (optional) ─────────────────────────────────────
  if (CLEAR_FIRST) {
    // Scope deletion to only the seed user's books to avoid wiping production data
    const deleted = await Book.deleteMany({ owner: owner._id });
    console.log(`[SEED] Cleared ${deleted.deletedCount} books owned by seed user`);
  }

  // ── Generate and insert books ───────────────────────────────────────────
  const existingCount = await Book.countDocuments({});
  if (existingCount >= BOOK_COUNT && !CLEAR_FIRST) {
    console.log(
      `[SEED] Database already has ${existingCount} books (target ${BOOK_COUNT}). Use --clear to re-seed.`
    );
  } else {
    const books = [];
    for (let i = 0; i < BOOK_COUNT; i++) {
      books.push(generateBook(owner._id, i));
    }
    const inserted = await Book.insertMany(books);
    console.log(`[SEED] Inserted ${inserted.length} books into the database`);

    // Print summary
    const byGenre = {};
    for (const b of inserted) {
      byGenre[b.genre] = (byGenre[b.genre] || 0) + 1;
    }
    console.log('[SEED] Books by genre:', byGenre);
  }

  // ── Final count ─────────────────────────────────────────────────────────
  const finalCount = await Book.countDocuments({});
  console.log(`[SEED] Total books in database: ${finalCount}`);

  await mongoose.disconnect();
  console.log('[SEED] Done. Disconnected from MongoDB.');
  process.exit(0);
}

main().catch((err) => {
  console.error('[SEED] Fatal error:', err?.message || err);
  mongoose.disconnect().catch(() => {});
  process.exit(1);
});
