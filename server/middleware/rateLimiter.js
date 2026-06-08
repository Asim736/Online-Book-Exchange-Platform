import rateLimit from 'express-rate-limit';

// General API limiter: 100 requests per 15 minutes per IP
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests',
    message: 'You have exceeded the rate limit. Please try again later.',
    retryAfter: '15 minutes'
  }
});

// Stricter limiter for auth routes (login/register): 10 requests per 15 minutes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many authentication attempts',
    message: 'Please try again after 15 minutes.'
  }
});

// Moderate limiter for request/exchange routes: 30 requests per 15 minutes
export const dataOperationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests',
    message: 'Please slow down and try again later.'
  }
});

// Strict limiter for user creation (admin operation): 5 requests per 15 minutes
export const userCreationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many user creation attempts',
    message: 'You have exceeded the limit for creating users. Please try again later.'
  }
});

// Strict limiter for profile/password changes: 10 requests per 15 minutes
export const profileUpdateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many profile update attempts',
    message: 'You have exceeded the limit for profile changes. Please try again later.'
  }
});

// Moderate limiter for book create/update: 15 requests per 15 minutes
export const bookOperationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many book operations',
    message: 'You have exceeded the limit for book operations. Please try again later.'
  }
});

// Strict limiter for destructive operations (delete): 5 requests per 15 minutes
export const deleteOperationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many delete attempts',
    message: 'You have exceeded the limit for delete operations. Please try again later.'
  }
});


