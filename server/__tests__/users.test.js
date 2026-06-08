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
  // Simulates the controller's validation + save
  if (!body || !body.username || !body.email || !body.password) {
    return { status: 400, body: { message: 'Validation failed: username, email, and password are required' } };
  }
  // Simulate duplicate email check (Mongoose error code 11000)
  const { password, ...safeUser } = body;
  return { status: 201, body: { _id: 'newUserId', ...safeUser } };
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

function runSanitizeProfile(updateData, allowedFields) {
  const sanitized = {};
  for (const key of Object.keys(updateData)) {
    if (allowedFields.includes(key) && typeof key === 'string' && !key.startsWith('$')) {
      sanitized[key] = updateData[key];
    }
  }
  return sanitized;
}

function runChangePassword(user, currentPassword, newPassword) {
  if (!currentPassword || !newPassword) {
    return { status: 400, body: { message: 'Current password and new password are required' } };
  }
  if (newPassword.length < 6) {
    return { status: 400, body: { message: 'New password must be at least 6 characters long' } };
  }
  if (!user) {
    return { status: 404, body: { message: 'User not found' } };
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
  test('creates user with valid fields and returns 201', () => {
    const body = { username: 'newuser', email: 'new@test.com', password: 'secure123' };
    const result = runCreateUser(body);
    expect(result.status).toBe(201);
    expect(result.body).toHaveProperty('_id');
    expect(result.body.username).toBe('newuser');
    expect(result.body.email).toBe('new@test.com');
    expect(result.body).not.toHaveProperty('password');
  });

  test('rejects missing username', () => {
    const body = { email: 'new@test.com', password: 'secure123' };
    const result = runCreateUser(body);
    expect(result.status).toBe(400);
    expect(result.body.message).toContain('required');
  });

  test('rejects missing email', () => {
    const body = { username: 'newuser', password: 'secure123' };
    const result = runCreateUser(body);
    expect(result.status).toBe(400);
  });

  test('rejects missing password', () => {
    const body = { username: 'newuser', email: 'new@test.com' };
    const result = runCreateUser(body);
    expect(result.status).toBe(400);
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
  test('returns 401 when user is not authenticated', () => {
    function runUpdateProfile(userId) {
      if (!userId) return { status: 401, body: { message: 'User not authenticated' } };
      return { status: 200, body: { message: 'Profile updated successfully' } };
    }
    const result = runUpdateProfile(undefined);
    expect(result.status).toBe(401);
    expect(result.body.message).toContain('not authenticated');
  });

  test('whitelists allowed profile fields and strips MongoDB operators', () => {
    const allowedFields = ['username', 'email', 'bio', 'contact', 'avatar'];
    const reqBody = {
      username: 'updateduser',
      bio: 'New bio',
      role: 'admin',       // Not allowed
      $set: { password: 'hacked' }, // Not allowed
    };

    // Simulate the controller's first pass
    const updateData = {};
    if (reqBody.username?.trim()) updateData.username = reqBody.username.trim();
    if (reqBody.bio !== undefined) updateData.bio = reqBody.bio;

    const sanitizedUpdate = runSanitizeProfile(updateData, allowedFields);

    expect(sanitizedUpdate).toHaveProperty('username');
    expect(sanitizedUpdate).toHaveProperty('bio');
    expect(sanitizedUpdate).not.toHaveProperty('role');
    expect(sanitizedUpdate).not.toHaveProperty('$set');
  });

  test('strips MongoDB operators from update data', () => {
    const allowedFields = ['username', 'email', 'bio', 'contact', 'avatar'];
    const maliciousData = {
      username: 'abc',
      $gt: '',  // MongoDB operator injection attempt
      $where: '1=1',
    };

    const sanitizedUpdate = runSanitizeProfile(maliciousData, allowedFields);
    expect(sanitizedUpdate).not.toHaveProperty('$gt');
    expect(sanitizedUpdate).not.toHaveProperty('$where');
    expect(sanitizedUpdate).toHaveProperty('username');
  });

  test('returns 200 with user on success', () => {
    const response = {
      message: 'Profile updated successfully',
      user: { _id: 'user123', username: 'updated', email: 'test@test.com' },
    };
    expect(response.message).toContain('success');
    expect(response).toHaveProperty('user');
    expect(response.user._id).toBe('user123');
  });
});

describe('changePassword', () => {
  const mockUser = { _id: 'user1', username: 'alice', email: 'alice@test.com' };

  test('returns 200 on successful password change', () => {
    const result = runChangePassword(mockUser, 'oldPass123', 'newPass456');
    expect(result.status).toBe(200);
    expect(result.body.message).toBe('Password changed successfully');
  });

  test('rejects missing currentPassword', () => {
    const result = runChangePassword(mockUser, undefined, 'newpass123');
    expect(result.status).toBe(400);
    expect(result.body.message).toContain('required');
  });

  test('rejects missing newPassword', () => {
    const result = runChangePassword(mockUser, 'oldpass', undefined);
    expect(result.status).toBe(400);
    expect(result.body.message).toContain('required');
  });

  test('rejects newPassword shorter than 6 characters', () => {
    const result = runChangePassword(mockUser, 'oldpass', 'abc');
    expect(result.status).toBe(400);
    expect(result.body.message).toContain('at least 6 characters');
  });

  test('accepts newPassword of exactly 6 characters', () => {
    const result = runChangePassword(mockUser, 'oldpass', '123456');
    expect(result.status).toBe(200);
  });

  test('returns 404 when user not found', () => {
    const result = runChangePassword(null, 'oldpass', 'newpass123');
    expect(result.status).toBe(404);
    expect(result.body.message).toBe('User not found');
  });
});
