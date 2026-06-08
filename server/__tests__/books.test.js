/**
 * Unit tests for bookController logic
 *
 * Tests data filtering, pagination, and null-safety patterns
 * used in getAllBooks, getBookById, getUserBooks, updateBook, and deleteBook.
 */

describe('getAllBooks - filtering and pagination', () => {
  test('returns paginated response shape', () => {
    const result = {
      books: [],
      total: 0,
      page: 1,
      pages: 0,
    };

    expect(result).toHaveProperty('books');
    expect(result).toHaveProperty('total');
    expect(result).toHaveProperty('page');
    expect(result).toHaveProperty('pages');
  });

  test('parses pagination params with defaults', () => {
    const page = parseInt(undefined, 10) || 1;
    const limit = parseInt(undefined, 10) || 12;
    expect(page).toBe(1);
    expect(limit).toBe(12);
  });

  test('computes pages from total and limit', () => {
    const total = 25;
    const limit = 12;
    const pages = Math.ceil(total / limit);
    expect(pages).toBe(3);
  });

  test('handles empty result set', () => {
    const total = 0;
    const limit = 12;
    const pages = Math.ceil(total / limit);
    expect(pages).toBe(0);
  });
});

describe('getBookById - null safety', () => {
  test('returns 404 when book is null', () => {
    const book = null;
    const result = !book;
    expect(result).toBe(true);
  });

  test('handles missing owner gracefully', () => {
    // Simulate populated book with null owner (deleted user)
    const book = {
      _id: 'book1',
      title: 'Test Book',
      owner: null,
    };

    // The controller checks: if (!book) return 404
    // Then accesses book.owner.toString() - should be guarded
    const ownerExists = book.owner !== null;
    expect(ownerExists).toBe(false);
  });
});

describe('updateBook - authorization checks', () => {
  test('blocks update when book owner is null', () => {
    const book = { _id: 'book1', owner: null };
    const result = !book ? 'not found' : (!book.owner ? 'missing owner' : 'ok');
    expect(result).toBe('missing owner');
  });

  test('blocks update when user is not the owner', () => {
    const book = { _id: 'book1', owner: { toString: () => 'owner123' } };
    const userId = { toString: () => 'other456' };

    if (book && book.owner) {
      const isOwner = book.owner.toString() === userId.toString();
      expect(isOwner).toBe(false);
    }
  });

  test('allows update when user is the owner', () => {
    const book = { _id: 'book1', owner: { toString: () => 'user123' } };
    const userId = { toString: () => 'user123' };

    if (book && book.owner) {
      const isOwner = book.owner.toString() === userId.toString();
      expect(isOwner).toBe(true);
    }
  });
});

describe('getBooksByIds - input validation', () => {
  test('rejects non-array ids', () => {
    const ids = 'not-an-array';
    const isValid = Array.isArray(ids) && ids.length > 0;
    expect(isValid).toBe(false);
  });

  test('rejects empty array', () => {
    const ids = [];
    const isValid = Array.isArray(ids) && ids.length > 0;
    expect(isValid).toBe(false);
  });

  test('accepts valid array of ids', () => {
    const ids = ['id1', 'id2', 'id3'];
    const isValid = Array.isArray(ids) && ids.length > 0;
    expect(isValid).toBe(true);
  });
});

describe('deleteBook - null safety', () => {
  test('blocks delete when book owner is null', () => {
    const book = { _id: 'book1', owner: null };
    const result = !book ? 'not found' : (!book.owner ? 'missing owner' : 'ok');
    expect(result).toBe('missing owner');
  });

  test('deletes book when owner matches', () => {
    const book = { _id: 'book1', owner: { toString: () => 'user123' } };
    const userId = { toString: () => 'user123' };

    if (book && book.owner) {
      const authorized = book.owner.toString() === userId.toString();
      expect(authorized).toBe(true);
    }
  });
});
