import { scryptSync, randomBytes, timingSafeEqual } from 'node:crypto';

/**
 * Password hashing utilities built on Node's built-in `node:crypto` scrypt.
 *
 * We deliberately avoid `bcrypt`/`argon2` here so the backend has no native
 * compilation step — it installs and runs anywhere Node does. scrypt is
 * memory-hard and a fine choice for password storage.
 *
 * Format: `scrypt:<saltHex>:<hashHex>`
 */

const KEY_LEN = 64;
const SCRYPT_N = 16384; // CPU/memory cost

export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, KEY_LEN, { N: SCRYPT_N });
  return `scrypt:${salt.toString('hex')}:${hash.toString('hex')}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  if (!stored) return false;
  const parts = stored.split(':');
  if (parts.length !== 3 || parts[0] !== 'scrypt') return false;
  try {
    const salt = Buffer.from(parts[1], 'hex');
    const expected = Buffer.from(parts[2], 'hex');
    const actual = scryptSync(password, salt, expected.length, { N: SCRYPT_N });
    // Constant-time comparison to avoid timing attacks.
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

/** Minimal password policy enforcer. */
export function validatePasswordStrength(password: string): string | null {
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Z]/.test(password)) return 'Password must contain an uppercase letter';
  if (!/[0-9]/.test(password)) return 'Password must contain a number';
  if (!/[^A-Za-z0-9]/.test(password)) return 'Password must contain a special character';
  return null;
}
