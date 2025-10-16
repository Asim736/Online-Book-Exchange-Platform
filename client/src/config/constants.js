// API Configuration - Dynamic based on environment
export const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD 
    ? 'https://your-ec2-domain.com/api'  // Replace with your EC2 domain
    : 'http://localhost:5001/api');

// Environment detection
export const IS_PRODUCTION = import.meta.env.PROD;
export const IS_DEVELOPMENT = import.meta.env.DEV;

// Development mode settings
export const DEVELOPMENT_MODE = {
  FRONTEND_ONLY: IS_DEVELOPMENT && import.meta.env.VITE_FRONTEND_ONLY === 'true',
  MOCK_AUTH: false // Set to true for testing with mock authentication
};

// Production configuration
export const PRODUCTION_CONFIG = {
  API_TIMEOUT: 10000, // 10 seconds
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp']
};
