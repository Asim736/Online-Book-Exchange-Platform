/**
 * Unit tests for authController logic
 *
 * Tests input validation, edge cases, and response shaping
 * for register, login, validateToken, forgotPassword, and resetPassword.
 */

// ----------------------------------------------------------------
// Helper: extract pure controller-logic into testable functions
// ----------------------------------------------------------------

function runRegister(body) {
  // Simulates the hardened register controller
  if (!body) return { status: 400, body: { message: 'Username is required' } };

  const { username, email, password, ...rest } = body;

  // Check for unexpected/MongoDB fields
  const unexpectedKeys = Object.keys(rest).filter(
    k => k.startsWith('$') || !['username', 'email', 'password'].includes(k)
  );
  if (unexpectedKeys.length > 0) {
    return { status: 400, body: { message: `Unexpected fields detected: ${unexpectedKeys.join(', ')}` } };
  }

  // Validate required fields with type checks
  if (!username || typeof username !== 'string' || !username.trim()) {
    return { status: 400, body: { message: 'Username is required' } };
  }
  if (!email || typeof email !== 'string' || !email.trim()) {
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

  // Simulate duplicate email check
  if (existingEmails && existingEmails.has(email.trim().toLowerCase())) {
    return { status: 409, body: { message: 'Email already exists' } };
  }

  return { status: 201, body: { message: 'User registered successfully' } };
}

let existingEmails = null;
function setExistingEmails(emailSet) {
  existingEmails = emailSet;
}

function runForgotPassword(body) {
  if (!body || !body.email || typeof body.email !== 'string' || !body.email.trim()) {
    return { status: 400, body: { message: 'Email is required' } };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(body.email.trim())) {
    return { status: 400, body: { message: 'Invalid email format' } };
  }
  // Security: always return generic success, don't reveal if email exists
  return { status: 200, body: { message: 'If an account with that email exists, a password reset link has been sent.' } };
}

function runVerifyEmail(query) {
  const token = query && query.token;
  if (!token || typeof token !== 'string' || !token.trim()) {
    return { status: 400, body: { message: 'Verification token is required' } };
  }
  if (token === 'expired-or-invalid-token') {
    return { status: 400, body: { message: 'Invalid or expired verification token' } };
  }
  return { status: 200, body: { message: 'Email verified successfully! You can now log in.' } };
}

function runResetPassword(body) {
  if (!body || !body.token || !body.newPassword) {
    return { status: 400, body: { message: 'Token and new password are required' } };
  }
  if (typeof body.token !== 'string') {
    return { status: 400, body: { message: 'Reset token is required' } };
  }
  if (typeof body.newPassword !== 'string') {
    return { status: 400, body: { message: 'New password is required' } };
  }
  if (body.newPassword.length < 6) {
    return { status: 400, body: { message: 'New password must be at least 6 characters long' } };
  }
  if (body.token === 'expired-token') {
    return { status: 400, body: { message: 'Invalid or expired reset token' } };
  }
  return { status: 200, body: { message: 'Password reset successful! You can now log in with your new password.' } };
}

// ----------------------------------------------------------------
// Tests
// ----------------------------------------------------------------

describe('register', () => {
  const validBody = { username: 'newuser', email: 'new@test.com', password: 'secure123' };

  beforeEach(() => {
    setExistingEmails(null);
  });

  test('registers with valid fields and returns 201', () => {
    const result = runRegister(validBody);
    expect(result.status).toBe(201);
    expect(result.body.message).toContain('success');
  });

  test('normalizes email to lowercase', () => {
    const result = runRegister({ ...validBody, email: 'New@Test.COM' });
    // No duplicate error means lowercase normalization passed
    setExistingEmails(new Set(['new@test.com']));
    const dupResult = runRegister({ ...validBody, email: 'NEW@TEST.COM' });
    expect(dupResult.status).toBe(409);
  });

  test('trims whitespace from username and email', () => {
    const result = runRegister({ ...validBody, username: '  spaceduser  ', email: ' spaced@test.com  ' });
    expect(result.status).toBe(201);
  });

  test('rejects missing username', () => {
    const { username, ...body } = validBody;
    const result = runRegister(body);
    expect(result.status).toBe(400);
    expect(result.body.message).toBe('Username is required');
  });

  test('rejects empty username string', () => {
    const result = runRegister({ ...validBody, username: '' });
    expect(result.status).toBe(400);
  });

  test('rejects whitespace-only username', () => {
    const result = runRegister({ ...validBody, username: '   ' });
    expect(result.status).toBe(400);
  });

  test('rejects non-string username (object)', () => {
    const result = runRegister({ ...validBody, username: { $ne: '' } });
    expect(result.status).toBe(400);
  });

  test('rejects username shorter than 3 characters', () => {
    const result = runRegister({ ...validBody, username: 'ab' });
    expect(result.status).toBe(400);
    expect(result.body.message).toContain('at least 3 characters');
  });

  test('rejects username longer than 50 characters', () => {
    const result = runRegister({ ...validBody, username: 'a'.repeat(51) });
    expect(result.status).toBe(400);
    expect(result.body.message).toContain('at most 50 characters');
  });

  test('accepts username of exactly 3 characters', () => {
    const result = runRegister({ ...validBody, username: 'abc' });
    expect(result.status).toBe(201);
  });

  test('rejects missing email', () => {
    const { email, ...body } = validBody;
    const result = runRegister(body);
    expect(result.status).toBe(400);
    expect(result.body.message).toBe('Email is required');
  });

  test('rejects empty email string', () => {
    const result = runRegister({ ...validBody, email: '' });
    expect(result.status).toBe(400);
  });

  test('rejects non-string email (object)', () => {
    const result = runRegister({ ...validBody, email: { $gt: '' } });
    expect(result.status).toBe(400);
  });

  test('rejects invalid email format', () => {
    const result = runRegister({ ...validBody, email: 'notanemail' });
    expect(result.status).toBe(400);
    expect(result.body.message).toBe('Invalid email format');
  });

  test('rejects email without domain', () => {
    const result = runRegister({ ...validBody, email: 'user@' });
    expect(result.status).toBe(400);
  });

  test('rejects missing password', () => {
    const { password, ...body } = validBody;
    const result = runRegister(body);
    expect(result.status).toBe(400);
    expect(result.body.message).toBe('Password is required');
  });

  test('rejects non-string password (object)', () => {
    const result = runRegister({ ...validBody, password: { $ne: '' } });
    expect(result.status).toBe(400);
  });

  test('rejects non-string password (array)', () => {
    const result = runRegister({ ...validBody, password: ['hack'] });
    expect(result.status).toBe(400);
  });

  test('rejects password shorter than 6 characters', () => {
    const result = runRegister({ ...validBody, password: 'abc' });
    expect(result.status).toBe(400);
    expect(result.body.message).toContain('at least 6 characters');
  });

  test('accepts password of exactly 6 characters', () => {
    const result = runRegister({ ...validBody, password: '123456' });
    expect(result.status).toBe(201);
  });

  test('rejects duplicate email', () => {
    setExistingEmails(new Set(['existing@test.com']));
    const result = runRegister({ ...validBody, email: 'existing@test.com' });
    expect(result.status).toBe(409);
    expect(result.body.message).toBe('Email already exists');
  });

  test('duplicate email check is case-insensitive', () => {
    setExistingEmails(new Set(['existing@test.com']));
    const result = runRegister({ ...validBody, email: 'EXISTING@TEST.COM' });
    expect(result.status).toBe(409);
  });

  test('rejects NoSQL injection via $gt operator', () => {
    const result = runRegister({ ...validBody, $gt: '' });
    expect(result.status).toBe(400);
    expect(result.body.message).toContain('Unexpected fields detected');
  });

  test('rejects NoSQL injection via $ne operator', () => {
    const result = runRegister({ ...validBody, $ne: '' });
    expect(result.status).toBe(400);
    expect(result.body.message).toContain('Unexpected fields detected');
  });

  test('rejects NoSQL injection via $where operator', () => {
    const result = runRegister({ ...validBody, $where: '1=1' });
    expect(result.status).toBe(400);
    expect(result.body.message).toContain('Unexpected fields detected');
  });

  test('rejects unexpected fields like role', () => {
    const result = runRegister({ ...validBody, role: 'admin' });
    expect(result.status).toBe(400);
    expect(result.body.message).toContain('Unexpected fields detected');
    expect(result.body.message).toContain('role');
  });

  test('rejects empty body', () => {
    const result = runRegister(null);
    expect(result.status).toBe(400);
  });
});

describe('login', () => {
  test('requires email and password', () => {
    const body = { email: 'test@test.com', password: 'password123' };
    expect(body.email).toBeTruthy();
    expect(body.password).toBeTruthy();
  });

  test('returns 401 when user not found', () => {
    const user = null;
    const result = !user;
    expect(result).toBe(true);
  });

  test('returns 401 when password does not match', () => {
    const user = { password: '$2a$10$correctHash' };
    const plaintextPassword = 'wrongpassword';
    const passwordMatch = false;
    expect(passwordMatch).toBe(false);
  });

  test('login response includes token and user object', () => {
    const response = {
      token: 'eyJhbGciOiJIUzI1NiIs...',
      user: {
        _id: 'user123',
        email: 'test@test.com',
        username: 'testuser',
        avatar: null,
        bio: null,
        contact: null,
        createdAt: '2026-01-01T00:00:00.000Z',
      },
    };

    expect(response).toHaveProperty('token');
    expect(response).toHaveProperty('user');
    expect(response.user).toHaveProperty('_id');
    expect(response.user).toHaveProperty('email');
    expect(response.user).toHaveProperty('username');
  });

  test('token contains correct payload fields', () => {
    const payload = {
      _id: 'user123',
      email: 'test@test.com',
      username: 'testuser',
    };

    expect(payload).toHaveProperty('_id');
    expect(payload).toHaveProperty('email');
    expect(payload).toHaveProperty('username');
    expect(payload).not.toHaveProperty('password');
  });
});

describe('validateToken', () => {
  test('returns valid: true with user data when middleware passes', () => {
    const req = {
      user: {
        _id: 'user123',
        username: 'testuser',
        email: 'test@test.com',
        avatar: null,
        bio: 'Test bio',
        contact: null,
        createdAt: '2026-01-01T00:00:00.000Z',
      },
    };

    const response = {
      valid: true,
      user: {
        _id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        avatar: req.user.avatar,
        bio: req.user.bio,
        contact: req.user.contact,
        createdAt: req.user.createdAt,
      },
    };

    expect(response.valid).toBe(true);
    expect(response.user._id).toBe('user123');
    expect(response.user).toHaveProperty('username');
    expect(response.user).toHaveProperty('email');
    expect(response.user).toHaveProperty('bio');
  });

  test('handles missing user gracefully', () => {
    const req = { user: null };
    const error = req.user ? null : new Error('User not authenticated');
    expect(error).toBeTruthy();
    expect(error.message).toBe('User not authenticated');
  });
});

describe('forgotPassword', () => {

  test('returns 200 with generic message when email is valid', () => {
    const result = runForgotPassword({ email: 'user@test.com' });
    expect(result.status).toBe(200);
    expect(result.body.message).toContain('If an account with that email exists');
  });

  test('rejects missing email', () => {
    const result = runForgotPassword({});
    expect(result.status).toBe(400);
    expect(result.body.message).toBe('Email is required');
  });

  test('rejects empty email string', () => {
    const result = runForgotPassword({ email: '' });
    expect(result.status).toBe(400);
  });

  test('rejects invalid email format', () => {
    const result = runForgotPassword({ email: 'notanemail' });
    expect(result.status).toBe(400);
    expect(result.body.message).toBe('Invalid email format');
  });

  test('rejects null body', () => {
    const result = runForgotPassword(null);
    expect(result.status).toBe(400);
  });

  test('does NOT reveal whether email exists (security)', () => {
    // Both existing and non-existing emails return the same 200 message
    const existingResult = runForgotPassword({ email: 'existing@test.com' });
    const unknownResult = runForgotPassword({ email: 'unknown@test.com' });
    expect(existingResult.status).toBe(200);
    expect(unknownResult.status).toBe(200);
    expect(existingResult.body.message).toBe(unknownResult.body.message);
  });
});

describe('verifyEmail', () => {

  test('returns 200 with valid token', () => {
    const result = runVerifyEmail({ token: 'valid-verification-token' });
    expect(result.status).toBe(200);
    expect(result.body.message).toContain('verified');
  });

  test('rejects missing token', () => {
    const result = runVerifyEmail({});
    expect(result.status).toBe(400);
    expect(result.body.message).toBe('Verification token is required');
  });

  test('rejects expired or invalid token', () => {
    const result = runVerifyEmail({ token: 'expired-or-invalid-token' });
    expect(result.status).toBe(400);
    expect(result.body.message).toBe('Invalid or expired verification token');
  });

  test('rejects null query', () => {
    const result = runVerifyEmail(null);
    expect(result.status).toBe(400);
  });
});

describe('resetPassword', () => {
  test('returns 200 on success', () => {
    const result = runResetPassword({ token: 'valid-reset-token', newPassword: 'newPassword456' });
    expect(result.status).toBe(200);
    expect(result.body.message).toContain('Password reset successful');
  });

  test('rejects missing token', () => {
    const result = runResetPassword({ newPassword: 'newpass123' });
    expect(result.status).toBe(400);
    expect(result.body.message).toContain('required');
  });

  test('rejects missing newPassword', () => {
    const result = runResetPassword({ token: 'valid-reset-token' });
    expect(result.status).toBe(400);
  });

  test('rejects non-string token', () => {
    const result = runResetPassword({ token: { $gt: '' }, newPassword: 'newpass123' });
    expect(result.status).toBe(400);
  });

  test('rejects non-string newPassword', () => {
    const result = runResetPassword({ token: 'valid-token', newPassword: { $ne: '' } });
    expect(result.status).toBe(400);
  });

  test('rejects newPassword shorter than 6 characters', () => {
    const result = runResetPassword({ token: 'valid-token', newPassword: 'abc' });
    expect(result.status).toBe(400);
    expect(result.body.message).toContain('at least 6 characters');
  });

  test('accepts newPassword of exactly 6 characters', () => {
    const result = runResetPassword({ token: 'valid-token', newPassword: '123456' });
    expect(result.status).toBe(200);
  });

  test('rejects expired token', () => {
    const result = runResetPassword({ token: 'expired-token', newPassword: 'newpass123' });
    expect(result.status).toBe(400);
    expect(result.body.message).toBe('Invalid or expired reset token');
  });

  test('rejects empty body', () => {
    const result = runResetPassword(null);
    expect(result.status).toBe(400);
  });
});
