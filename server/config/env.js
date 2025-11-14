// Centralized environment loading and validation (ESM-safe)
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve .env path relative to server/ regardless of PM2 cwd
export const ENV_PATH = process.env.ENV_PATH || path.resolve(__dirname, '..', '.env');

// Load .env before anything else
const result = dotenv.config({ path: ENV_PATH });
if (result.error) {
  console.warn(`[ENV] .env not found at ${ENV_PATH} (pm2 env_file may still provide vars)`);
} else {
  console.log(`[ENV] Loaded .env from ${ENV_PATH}`);
}

export function validateEnv(requiredKeys = [], { exitOnError = false, name = 'runtime' } = {}) {
  const missing = [];
  for (const key of requiredKeys) {
    const v = process.env[key];
    if (v === undefined || v === null || `${v}`.length === 0) missing.push(key);
  }
  const ok = missing.length === 0;
  if (!ok) {
    const msg = `[ENV] Missing required ${name} env vars: ${missing.join(', ')}`;
    if (exitOnError) {
      console.error(msg);
      process.exit(1);
    } else {
      console.warn(msg);
    }
  }
  return { ok, missing };
}

export function s3EnvSummary() {
  return {
    AWS_REGION: process.env.AWS_REGION || '(unset)',
    S3_BUCKET: process.env.S3_BUCKET || '(unset)',
    S3_PREFIX: process.env.S3_PREFIX || '(unset)',
    S3_SIGNED_URLS: process.env.S3_SIGNED_URLS || 'false',
  };
}

export function validateS3Env({ exitOnError = false } = {}) {
  const required = ['AWS_REGION', 'S3_BUCKET'];
  const res = validateEnv(required, { exitOnError, name: 'S3' });
  const summary = s3EnvSummary();
  console.log('[S3 ENV]', summary);
  return { valid: res.ok, missing: res.missing, summary };
}
