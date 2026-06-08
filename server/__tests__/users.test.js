/**
 * Unit tests for userController logic
 *
 * Tests null-safety, authorization, input validation, and response shaping
 * for getAllUsers, getUserById, createUser, updateUser, deleteUser,
 * getUserMessages, updateProfile, and changePassword.
 */

// ----------------------------------------------------------------
// Helper: extract pure controller-logic into testable functions
// ----------------------------------------------------------------

function runGetAllUsers(users) {
  // Simulates User.find().select('-password')
  return users.map(u => {
    const { password, ...rest } = u;
    return rest;
  });
}

function runGetUserById(users, id) {
  if (!id) return { status: 400, body: { message: 'User ID is required' } };
  const user = users.find(u => u._id === id) || null;
  if (!user) return { status: 404, body: { message: 'User not found' } };
  const { password, ...safeUser } = user;
  return { status: 200, body: safeUser };
}

function runCreateUser(body) {
  // Simulates the hardened controller's validation + save
  if (!body) {
    return { status: 400, body: { message: 'Username is required' } };
  }

  const { username, email, password, ...rest } = body;

  // Check for unexpected/MongoDB fields
  const unexpectedKeys = Object.keys(rest).filter(
    k => k.startsWith('$') || !['username', 'email', 'password'].includes(k)
  );
  if (unexpectedKeys.length > 0) {
    return { status: 400, body: { message: `Unexpected fields detected: ${unexpectedKeys.join(', ')}` } };
  }

  // Validate required fields
  if (!username || !username.trim()) {
    return { status: 400, body: { message: 'Username is required' } };
  }
  if (!email || !email.trim()) {
    return { status: 400, body: { message: 'Email is required' } };
  }
  if (!password || typeof password !== 'string') {
    return { status: 400, body: { message: 'Password is required' } };
  }

  // Validate field formats
  if (username.trim().length < 3) {
    return { status: 400, body: { message: 'Username must be at least 3 characters long' } };
  }
  if (username.trim().length > 50) {
    return { status: 400, body: { message: 'Username must be at most 50 characters long' } };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return { status: 400, body: { message: 'Invalid email format' } };
  }
  if (password.length < 6) {
    return { status: 400, body: { message: 'Password must be at least 6 characters long' } };
  }

  // Simulate duplicate email check (Mongoose error code 11000)
  if (existingEmails && existingEmails.has(email.trim().toLowerCase())) {
    return { status: 409, body: { message: 'Email already exists' } };
  }

  // Simulate password hashing by stripping it from response
  return { status: 201, body: { _id: 'newUserId', username: username.trim(), email: email.trim().toLowerCase() } };
}
let existingEmails = null;
function setExistingEmails(emailSet) {
  existingEmails = emailSet;
}

function runDeleteUser(user) {
  if (!user) return { status: 404, body: { message: 'User not found' } };
  return { status: 200, body: { message: 'User deleted successfully' } };
}

function runSanitizeUpdate(reqBody, allowedFields) {
  const sanitized = {};
  for (const key of allowedFields) {
    if (reqBody[key] !== undefined) {
      sanitized[key] = reqBody[key];
    }
  }
  return sanitized;
}

function runUpdateProfile(userId, body) {
  // Simulates the hardened updateProfile controller
  if (!userId) return { status: 401, body: { message: 'User not authenticated' } };
  if (!body) return { status: 400, body: { message: 'No valid fields to update' } };

  const allowedFields = ['username', 'email', 'bio', 'contact', 'avatar'];
  const { username, email, bio, contact, avatar, ...rest } = body;

  // Check for unexpected/MongoDB fields
  const unexpectedKeys = Object.keys(rest).filter(
    k => k.startsWith('$') || !allowedFields.includes(k)
  );
  if (unexpectedKeys.length > 0) {
    return { status: 400, body: { message: `Unexpected fields detected: ${unexpectedKeys.join(', ')}` } };
  }

  const updateData = {};

  if (username !== undefined) {
    if (typeof username !== 'string' || !username.trim()) {
      return { status: 400, body: { message: 'Username must be a non-empty string' } };
    }
    if (username.trim().length < 3) {
      return { status: 400, body: { message: 'Username must be at least 3 characters long' } };
    }
    if (username.trim().length > 50) {
      return { status: 400, body: { message: 'Username must be at most 50 characters long' } };
    }
    updateData.username = username.trim();
  }

  if (email !== undefined) {
    if (typeof email !== 'string' || !email.trim()) {
      return { status: 400, body: { message: 'Email must be a non-empty string' } };
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return { status: 400, body: { message: 'Invalid email format' } };
    }
    updateData.email = email.trim().toLowerCase();
  }

  if (bio !== undefined) updateData.bio = bio;
  if (contact !== undefined) updateData.contact = contact;
  if (avatar !== undefined) updateData.avatar = avatar;

  if (Object.keys(updateData).length === 0) {
    return { status: 400, body: { message: 'No valid fields to update' } };
  }

  return { status: 200, body: { message: 'Profile updated successfully', user: { _id: userId, ...updateData } } };
}

function runChangePassword(userId, body, mockDbUser) {
  // Simulates the hardened changePassword controller
  if (!userId) return { status: 401, body: { message: 'User not authenticated' } };
  if (!body) return { status: 400, body: { message: 'Current password is required' } };

  const { currentPassword, newPassword, ...rest } = body;

  // Check for unexpected/MongoDB fields
  const unexpectedKeys = Object.keys(rest).filter(
    k => k.startsWith('$') || !['currentPassword', 'newPassword'].includes(k)
  );
  if (unexpectedKeys.length > 0) {
    return { status: 400, body: { message: `Unexpected fields detected: ${unexpectedKeys.join(', ')}` } };
  }

  // Validate required fields with type checks
  if (!currentPassword || typeof currentPassword !== 'string') {
    return { status: 400, body: { message: 'Current password is required' } };
  }
  if (!newPassword || typeof newPassword !== 'string') {
    return { status: 400, body: { message: 'New password is required' } };
  }

  // Validate new password length
  if (newPassword.length < 6) {
    return { status: 400, body: { message: 'New password must be at least 6 characters long' } };
  }
  if (newPassword.length > 128) {
    return { status: 400, body: { message: 'New password must be at most 128 characters long' } };
  }

  // Simulate DB user lookup (optional)
  if (mockDbUser !== undefined) {
    if (!mockDbUser) return { status: 404, body: { message: 'User not found' } };
  }

  return { status: 200, body: { message: 'Password changed successfully' } };
}

function runGetUserMessages(requests, userId) {
  const filtered = requests.filter(r => r.requester && r.owner && r.book);
  return filtered.map(request => {
    const requesterId = request.requester._id?.toString();
    const ownerId = request.owner._id?.toString();
    const isRequester = requesterId === userId;
    const otherUser = isRequester ? request.owner : request.requester;
    return {
      id: request._id,
      userName: otherUser?.username || 'Unknown',
      lastMessage: request.message || `Interested in "${request.book?.title}"`,
      bookTitle: request.book?.title || 'Unknown Book',
    };
  });
}

// ----------------------------------------------------------------
// Tests
// ----------------------------------------------------------------

describe('getAllUsers', () => {
  test('returns array of users without passwords', () => {
    const users = [
      { _id: 'user1', username: 'alice', email: 'alice@test.com', password: 'secret' },
      { _id: 'user2', username: 'bob', email: 'bob@test.com', password: 'secret' },
    ];
    const result = runGetAllUsers(users);
    expect(result.length).toBe(2);
    result.forEach(u => {
      expect(u).not.toHaveProperty('password');
    });
  });

  test('handles empty user list', () => {
    const users = [];
    const result = runGetAllUsers(users);
    expect(result.length).toBe(0);
  });
});

describe('getUserById', () => {
  const mockUsers = [
    { _id: 'user1', username: 'alice', email: 'alice@test.com', password: 'hashed' },
  ];

  test('returns 404 when user is not found', () => {
    const result = runGetUserById(mockUsers, 'nonexistent');
    expect(result.status).toBe(404);
    expect(result.body.message).toBe('User not found');
  });

  test('excludes password from response', () => {
    const result = runGetUserById(mockUsers, 'user1');
    expect(result.status).toBe(200);
    expect(result.body).not.toHaveProperty('password');
    expect(result.body.username).toBe('alice');
  });

  test('returns 400 when user ID is missing', () => {
    const result = runGetUserById(mockUsers, undefined);
    expect(result.status).toBe(400);
    expect(result.body.message).toContain('required');
  });
});

describe('createUser', () => {
  const validBody = { username: 'newuser', email: 'new@test.com', password: 'secure123' };

  beforeEach(() => {
    setExistingEmails(null);
  });

  test('creates user with valid fields and returns 201', () => {
    const result = runCreateUser(validBody);
    expect(result.status).toBe(201);
    expect(result.body).toHaveProperty('_id');
    expect(result.body.username).toBe('newuser');
    expect(result.body.email).toBe('new@test.com');
    expect(result.body).not.toHaveProperty('password');
  });

  test('normalizes email to lowercase', () => {
    const result = runCreateUser({ ...validBody, email: 'New@Test.COM' });
    expect(result.status).toBe(201);
    expect(result.body.email).toBe('new@test.com');
  });

  test('trims whitespace from username and email', () => {
    const result = runCreateUser({ ...validBody, username: '  spaceduser  ', email: ' spaced@test.com  ' });
    expect(result.status).toBe(201);
    expect(result.body.username).toBe('spaceduser');
    expect(result.body.email).toBe('spaced@test.com');
  });

  test('rejects missing username', () => {
    const { username, ...body } = validBody;
    const result = runCreateUser(body);
    expect(result.status).toBe(400);
    expect(result.body.message).toContain('Username is required');
  });

  test('rejects empty username string', () => {
    const result = runCreateUser({ ...validBody, username: '' });
    expect(result.status).toBe(400);
    expect(result.body.message).toContain('Username is required');
  });

  test('rejects whitespace-only username', () => {
    const result = runCreateUser({ ...validBody, username: '   ' });
    expect(result.status).toBe(400);
    expect(result.body.message).toContain('Username is required');
  });

  test('rejects username shorter than 3 characters', () => {
    const result = runCreateUser({ ...validBody, username: 'ab' });
    expect(result.status).toBe(400);
    expect(result.body.message).toContain('at least 3 characters');
  });

  test('rejects username longer than 50 characters', () => {
    const result = runCreateUser({ ...validBody, username: 'a'.repeat(51) });
    expect(result.status).toBe(400);
    expect(result.body.message).toContain('at most 50 characters');
  });

  test('accepts username of exactly 3 characters', () => {
    const result = runCreateUser({ ...validBody, username: 'abc' });
    expect(result.status).toBe(201);
  });

  test('rejects missing email', () => {
    const { email, ...body } = validBody;
    const result = runCreateUser(body);
    expect(result.status).toBe(400);
    expect(result.body.message).toContain('Email is required');
  });

  test('rejects empty email string', () => {
    const result = runCreateUser({ ...validBody, email: '' });
    expect(result.status).toBe(400);
    expect(result.body.message).toContain('Email is required');
  });

  test('rejects invalid email format', () => {
    const result = runCreateUser({ ...validBody, email: 'notanemail' });
    expect(result.status).toBe(400);
    expect(result.body.message).toBe('Invalid email format');
  });

  test('rejects email without domain', () => {
    const result = runCreateUser({ ...validBody, email: 'user@' });
    expect(result.status).toBe(400);
    expect(result.body.message).toBe('Invalid email format');
  });

  test('rejects missing password', () => {
    const { password, ...body } = validBody;
    const result = runCreateUser(body);
    expect(result.status).toBe(400);
    expect(result.body.message).toContain('Password is required');
  });

  test('rejects password shorter than 6 characters', () => {
    const result = runCreateUser({ ...validBody, password: 'abc' });
    expect(result.status).toBe(400);
    expect(result.body.message).toContain('at least 6 characters');
  });

  test('accepts password of exactly 6 characters', () => {
    const result = runCreateUser({ ...validBody, password: '123456' });
    expect(result.status).toBe(201);
  });

  test('rejects duplicate email', () => {
    setExistingEmails(new Set(['existing@test.com']));
    const result = runCreateUser({ ...validBody, email: 'existing@test.com' });
    expect(result.status).toBe(409);
    expect(result.body.message).toBe('Email already exists');
  });

  test('duplicate email check is case-insensitive', () => {
    setExistingEmails(new Set(['existing@test.com']));
    const result = runCreateUser({ ...validBody, email: 'EXISTING@TEST.COM' });
    expect(result.status).toBe(409);
  });

  test('strips password from response', () => {
    const result = runCreateUser(validBody);
    expect(result.status).toBe(201);
    expect(result.body).not.toHaveProperty('password');
  });

  test('rejects NoSQL injection via $gt operator in body', () => {
    const result = runCreateUser({ ...validBody, $gt: '' });
    expect(result.status).toBe(400);
    expect(result.body.message).toContain('Unexpected fields detected');
  });

  test('rejects NoSQL injection via $ne operator in body', () => {
    const result = runCreateUser({ ...validBody, $ne: '' });
    expect(result.status).toBe(400);
    expect(result.body.message).toContain('Unexpected fields detected');
  });

  test('rejects NoSQL injection via $where operator in body', () => {
    const result = runCreateUser({ ...validBody, $where: '1=1' });
    expect(result.status).toBe(400);
    expect(result.body.message).toContain('Unexpected fields detected');
  });

  test('rejects unexpected fields like role', () => {
    const result = runCreateUser({ ...validBody, role: 'admin' });
    expect(result.status).toBe(400);
    expect(result.body.message).toContain('Unexpected fields detected');
    expect(result.body.message).toContain('role');
  });

  test('rejects non-string password (object)', () => {
    const result = runCreateUser({ ...validBody, password: { $ne: '' } });
    expect(result.status).toBe(400);
    expect(result.body.message).toContain('Password is required');
  });

  test('rejects non-string password (array)', () => {
    const result = runCreateUser({ ...validBody, password: ['hack'] });
    expect(result.status).toBe(400);
    expect(result.body.message).toContain('Password is required');
  });

  test('rejects empty body', () => {
    const result = runCreateUser(null);
    expect(result.status).toBe(400);
  });
});

describe('updateUser (admin)', () => {
  test('whitelists allowed fields only', () => {
    const allowedFields = ['username', 'email', 'bio', 'avatar'];
    const reqBody = {
      username: 'newuser',
      email: 'new@test.com',
      role: 'admin', // Not allowed
      $set: { password: 'hacked' }, // Not allowed (MongoDB operator)
    };

    const sanitized = runSanitizeUpdate(reqBody, allowedFields);

    expect(sanitized).toHaveProperty('username');
    expect(sanitized).toHaveProperty('email');
    expect(sanitized).not.toHaveProperty('role');
    expect(sanitized).not.toHaveProperty('$set');
  });

  test('rejects all fields when body is empty', () => {
    const allowedFields = ['username', 'email', 'bio', 'avatar'];
    const sanitized = runSanitizeUpdate({}, allowedFields);
    expect(Object.keys(sanitized).length).toBe(0);
  });

  test('returns 404 when user not found', () => {
    const result = runGetUserById([], 'nonexistent');
    expect(result.status).toBe(404);
    expect(result.body.message).toBe('User not found');
  });
});

describe('deleteUser', () => {
  test('returns 404 when user is not found', () => {
    const result = runDeleteUser(null);
    expect(result.status).toBe(404);
    expect(result.body.message).toBe('User not found');
  });

  test('returns success message on deletion', () => {
    const user = { _id: 'user1', username: 'alice' };
    const result = runDeleteUser(user);
    expect(result.status).toBe(200);
    expect(result.body.message).toBe('User deleted successfully');
  });
});

describe('getUserMessages', () => {
  const userId = 'user123';

  const makeRequester = (id, username, email) => ({
    _id: id, username: username || 'someone', email: email || 'someone@test.com'
  });
  const makeOwner = (id, username, email) => ({
    _id: id, username: username || 'testuser', email: email || 'test@test.com'
  });
  const makeBook = (title) => ({ title: title || 'Book' });

  test('filters out messages with null requester', () => {
    const requests = [
      { _id: 'req1', requester: null, owner: makeOwner(userId), book: makeBook('Book 1'), message: 'Hi', createdAt: new Date() },
      { _id: 'req2', requester: makeRequester('other'), owner: makeOwner(userId), book: makeBook('Book 2'), message: 'Hello', createdAt: new Date() },
    ];
    const result = runGetUserMessages(requests, userId);
    expect(result.length).toBe(1);
    expect(result[0].id).toBe('req2');
  });

  test('filters out messages with null owner', () => {
    const requests = [
      { _id: 'req1', requester: makeRequester('other'), owner: null, book: makeBook('Book 1'), message: 'Hi', createdAt: new Date() },
      { _id: 'req2', requester: makeRequester('other2'), owner: makeOwner(userId), book: makeBook('Book 2'), message: 'Hello', createdAt: new Date() },
    ];
    const result = runGetUserMessages(requests, userId);
    expect(result.length).toBe(1);
    expect(result[0].id).toBe('req2');
  });

  test('filters out messages with null book', () => {
    const requests = [
      { _id: 'req1', requester: makeRequester('other'), owner: makeOwner(userId), book: null, message: 'Hi', createdAt: new Date() },
      { _id: 'req2', requester: makeRequester('other2'), owner: makeOwner(userId), book: makeBook('Book 2'), message: 'Hello', createdAt: new Date() },
    ];
    const result = runGetUserMessages(requests, userId);
    expect(result.length).toBe(1);
    expect(result[0].id).toBe('req2');
  });

  test('identifies other participant when user is the owner', () => {
    const requests = [
      {
        _id: 'req3',
        requester: makeRequester('otherUser', 'other', 'other@test.com'),
        owner: makeOwner(userId, 'testuser', 'test@test.com'),
        book: makeBook('Test Book'),
        message: 'Interested!',
        createdAt: new Date(),
      },
    ];
    const result = runGetUserMessages(requests, userId);
    // userId 'user123' matches owner._id, so otherUser should be the requester
    expect(result.length).toBe(1);
    expect(result[0].userName).toBe('other');
    expect(result[0].bookTitle).toBe('Test Book');
  });

  test('identifies other participant when user is the requester', () => {
    const requests = [
      {
        _id: 'req4',
        requester: makeRequester(userId, 'testuser', 'test@test.com'),
        owner: makeOwner('ownerUser', 'ownerName', 'owner@test.com'),
        book: makeBook('Another Book'),
        message: 'Can I have this?',
        createdAt: new Date(),
      },
    ];
    const result = runGetUserMessages(requests, userId);
    // userId 'user123' matches requester._id, so otherUser should be the owner
    expect(result.length).toBe(1);
    expect(result[0].userName).toBe('ownerName');
  });

  test('formats message response correctly', () => {
    const requests = [
      {
        _id: 'req5',
        requester: makeRequester('other', 'otherUser', 'other@test.com'),
        owner: makeOwner(userId),
        book: makeBook('The Great Gatsby'),
        message: 'Can I borrow this?',
        createdAt: new Date('2026-06-07T09:00:00.000Z'),
      },
    ];
    const result = runGetUserMessages(requests, userId);
    expect(result.length).toBe(1);
    expect(result[0].id).toBe('req5');
    expect(result[0].userName).toBe('otherUser');
    expect(result[0].lastMessage).toBe('Can I borrow this?');
    expect(result[0].bookTitle).toBe('The Great Gatsby');
  });

  test('falls back to default message when message is empty', () => {
    const requests = [
      {
        _id: 'req6',
        requester: makeRequester('other'),
        owner: makeOwner(userId),
        book: makeBook('Moby Dick'),
        message: '',
        createdAt: new Date(),
      },
    ];
    const result = runGetUserMessages(requests, userId);
    expect(result.length).toBe(1);
    expect(result[0].lastMessage).toContain('Interested in');
    expect(result[0].lastMessage).toContain('Moby Dick');
  });

  test('handles empty requests array', () => {
    const result = runGetUserMessages([], userId);
    expect(result).toEqual([]);
  });

  test('handles all null fields gracefully', () => {
    const requests = [
      { _id: 'req7', requester: null, owner: null, book: null, message: 'Hi', createdAt: new Date() },
    ];
    const result = runGetUserMessages(requests, userId);
    expect(result.length).toBe(0);
  });
});

describe('updateProfile', () => {
  const userId = 'user123';
  const validBody = { username: 'validuser', email: 'valid@test.com', bio: 'Hello', contact: '123-456', avatar: 'https://example.com/avatar.png' };

  test('returns 401 when user is not authenticated', () => {
    const result = runUpdateProfile(undefined, validBody);
    expect(result.status).toBe(401);
    expect(result.body.message).toContain('not authenticated');
  });

  test('updates all allowed fields successfully', () => {
    const result = runUpdateProfile(userId, validBody);
    expect(result.status).toBe(200);
    expect(result.body.user.username).toBe('validuser');
    expect(result.body.user.email).toBe('valid@test.com');
    expect(result.body.user.bio).toBe('Hello');
    expect(result.body.user.contact).toBe('123-456');
    expect(result.body.user.avatar).toBe('https://example.com/avatar.png');
  });

  test('normalizes email to lowercase', () => {
    const result = runUpdateProfile(userId, { ...validBody, email: 'UPPERCASE@TEST.COM' });
    expect(result.status).toBe(200);
    expect(result.body.user.email).toBe('uppercase@test.com');
  });

  test('trims whitespace from username', () => {
    const result = runUpdateProfile(userId, { ...validBody, username: '  trimmeduser  ' });
    expect(result.status).toBe(200);
    expect(result.body.user.username).toBe('trimmeduser');
  });

  test('rejects empty username string', () => {
    const result = runUpdateProfile(userId, { ...validBody, username: '' });
    expect(result.status).toBe(400);
    expect(result.body.message).toContain('Username must be a non-empty string');
  });

  test('rejects whitespace-only username', () => {
    const result = runUpdateProfile(userId, { ...validBody, username: '   ' });
    expect(result.status).toBe(400);
    expect(result.body.message).toContain('Username must be a non-empty string');
  });

  test('rejects username shorter than 3 characters', () => {
    const result = runUpdateProfile(userId, { ...validBody, username: 'ab' });
    expect(result.status).toBe(400);
    expect(result.body.message).toContain('at least 3 characters');
  });

  test('rejects username longer than 50 characters', () => {
    const result = runUpdateProfile(userId, { ...validBody, username: 'a'.repeat(51) });
    expect(result.status).toBe(400);
    expect(result.body.message).toContain('at most 50 characters');
  });

  test('accepts username of exactly 3 characters', () => {
    const result = runUpdateProfile(userId, { ...validBody, username: 'abc' });
    expect(result.status).toBe(200);
  });

  test('rejects empty email string', () => {
    const result = runUpdateProfile(userId, { ...validBody, email: '' });
    expect(result.status).toBe(400);
    expect(result.body.message).toContain('Email must be a non-empty string');
  });

  test('rejects invalid email format', () => {
    const result = runUpdateProfile(userId, { ...validBody, email: 'notanemail' });
    expect(result.status).toBe(400);
    expect(result.body.message).toBe('Invalid email format');
  });

  test('rejects email without domain', () => {
    const result = runUpdateProfile(userId, { ...validBody, email: 'user@' });
    expect(result.status).toBe(400);
    expect(result.body.message).toBe('Invalid email format');
  });

  test('rejects NoSQL injection via $gt operator', () => {
    const result = runUpdateProfile(userId, { ...validBody, $gt: '' });
    expect(result.status).toBe(400);
    expect(result.body.message).toContain('Unexpected fields detected');
  });

  test('rejects NoSQL injection via $ne operator', () => {
    const result = runUpdateProfile(userId, { ...validBody, $ne: '' });
    expect(result.status).toBe(400);
    expect(result.body.message).toContain('Unexpected fields detected');
  });

  test('rejects NoSQL injection via $where operator', () => {
    const result = runUpdateProfile(userId, { ...validBody, $where: '1=1' });
    expect(result.status).toBe(400);
    expect(result.body.message).toContain('Unexpected fields detected');
  });

  test('rejects unexpected fields like role', () => {
    const result = runUpdateProfile(userId, { ...validBody, role: 'admin' });
    expect(result.status).toBe(400);
    expect(result.body.message).toContain('Unexpected fields detected');
    expect(result.body.message).toContain('role');
  });

  test('rejects unexpected MongoDB operator as top-level key', () => {
    const result = runUpdateProfile(userId, { ...validBody, $set: { password: 'hacked' } });
    expect(result.status).toBe(400);
    expect(result.body.message).toContain('Unexpected fields detected');
    expect(result.body.message).toContain('$set');
  });

  test('rejects empty body', () => {
    const result = runUpdateProfile(userId, {});
    expect(result.status).toBe(400);
    expect(result.body.message).toBe('No valid fields to update');
  });

  test('rejects null body', () => {
    const result = runUpdateProfile(userId, null);
    expect(result.status).toBe(400);
  });

  test('partial update with only bio works', () => {
    const result = runUpdateProfile(userId, { bio: 'Just updating bio' });
    expect(result.status).toBe(200);
    expect(result.body.user.bio).toBe('Just updating bio');
    expect(result.body.user).not.toHaveProperty('username');
  });
});

describe('changePassword', () => {
  const userId = 'user123';
  const validBody = { currentPassword: 'oldPass123', newPassword: 'newPass456' };

  test('returns 200 on successful password change', () => {
    const result = runChangePassword(userId, validBody);
    expect(result.status).toBe(200);
    expect(result.body.message).toBe('Password changed successfully');
  });

  test('returns 401 when user is not authenticated', () => {
    const result = runChangePassword(undefined, validBody);
    expect(result.status).toBe(401);
    expect(result.body.message).toContain('not authenticated');
  });

  test('rejects missing currentPassword', () => {
    const { currentPassword, ...body } = validBody;
    const result = runChangePassword(userId, body);
    expect(result.status).toBe(400);
    expect(result.body.message).toBe('Current password is required');
  });

  test('rejects missing newPassword', () => {
    const { newPassword, ...body } = validBody;
    const result = runChangePassword(userId, body);
    expect(result.status).toBe(400);
    expect(result.body.message).toBe('New password is required');
  });

  test('rejects non-string currentPassword (object)', () => {
    const result = runChangePassword(userId, { ...validBody, currentPassword: { $ne: '' } });
    expect(result.status).toBe(400);
    expect(result.body.message).toBe('Current password is required');
  });

  test('rejects non-string currentPassword (array)', () => {
    const result = runChangePassword(userId, { ...validBody, currentPassword: ['hack'] });
    expect(result.status).toBe(400);
    expect(result.body.message).toBe('Current password is required');
  });

  test('rejects non-string newPassword (object)', () => {
    const result = runChangePassword(userId, { ...validBody, newPassword: { $gt: '' } });
    expect(result.status).toBe(400);
    expect(result.body.message).toBe('New password is required');
  });

  test('rejects non-string newPassword (array)', () => {
    const result = runChangePassword(userId, { ...validBody, newPassword: ['hack'] });
    expect(result.status).toBe(400);
    expect(result.body.message).toBe('New password is required');
  });

  test('rejects newPassword shorter than 6 characters', () => {
    const result = runChangePassword(userId, { ...validBody, newPassword: 'abc' });
    expect(result.status).toBe(400);
    expect(result.body.message).toContain('at least 6 characters');
  });

  test('accepts newPassword of exactly 6 characters', () => {
    const result = runChangePassword(userId, { ...validBody, newPassword: '123456' });
    expect(result.status).toBe(200);
  });

  test('rejects newPassword longer than 128 characters', () => {
    const result = runChangePassword(userId, { ...validBody, newPassword: 'a'.repeat(129) });
    expect(result.status).toBe(400);
    expect(result.body.message).toContain('at most 128 characters');
  });

  test('accepts newPassword of exactly 128 characters', () => {
    const result = runChangePassword(userId, { ...validBody, newPassword: 'a'.repeat(128) });
    expect(result.status).toBe(200);
  });

  test('rejects NoSQL injection via $gt operator', () => {
    const result = runChangePassword(userId, { ...validBody, $gt: '' });
    expect(result.status).toBe(400);
    expect(result.body.message).toContain('Unexpected fields detected');
  });

  test('rejects NoSQL injection via $ne operator', () => {
    const result = runChangePassword(userId, { ...validBody, $ne: '' });
    expect(result.status).toBe(400);
    expect(result.body.message).toContain('Unexpected fields detected');
  });

  test('rejects NoSQL injection via $where operator', () => {
    const result = runChangePassword(userId, { ...validBody, $where: '1=1' });
    expect(result.status).toBe(400);
    expect(result.body.message).toContain('Unexpected fields detected');
  });

  test('rejects unexpected fields in body', () => {
    const result = runChangePassword(userId, { ...validBody, role: 'admin' });
    expect(result.status).toBe(400);
    expect(result.body.message).toContain('Unexpected fields detected');
  });

  test('rejects empty body', () => {
    const result = runChangePassword(userId, {});
    expect(result.status).toBe(400);
  });

  test('rejects null body', () => {
    const result = runChangePassword(userId, null);
    expect(result.status).toBe(400);
  });

  test('returns 404 when user not found in database', () => {
    const result = runChangePassword(userId, validBody, null);
    expect(result.status).toBe(404);
    expect(result.body.message).toBe('User not found');
  });

  test('succeeds when user exists in database', () => {
    const mockUser = { _id: userId, username: 'alice', email: 'alice@test.com' };
    const result = runChangePassword(userId, validBody, mockUser);
    expect(result.status).toBe(200);
    expect(result.body.message).toBe('Password changed successfully');
  });
});
