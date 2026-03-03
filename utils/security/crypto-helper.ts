// =============================================================================
// utils/security/crypto-helper.ts — PASSWORD ENCRYPTION & DECRYPTION
// =============================================================================
// PURPOSE:
//   Encrypts and decrypts sensitive values (passwords, API tokens, secrets)
//   so they are NEVER stored as plain text — not in .env, not in Excel files,
//   not anywhere.
//
// WHY IS THIS IMPORTANT?
//   Imagine your .env file looks like this (BAD ❌):
//     DB_PASSWORD=MySuperSecret123
//
//   If someone sees your .env file (or if it's accidentally pushed to GitHub),
//   your production database password is exposed forever.
//
//   With encryption (GOOD ✅):
//     DB_PASSWORD_ENCRYPTED=U2FsdGVkX19abc123...
//     ENCRYPTION_KEY=my-private-key   ← Keep this one truly secret!
//
//   Even if the encrypted value is seen, it's useless without the ENCRYPTION_KEY.
//
// HOW IT WORKS (in plain English):
//   Encryption = scrambling text with a secret key
//     "MySuperSecret123" + key → "U2FsdGVkX19abc123..."
//
//   Decryption = unscrambling with the same key
//     "U2FsdGVkX19abc123..." + key → "MySuperSecret123"
//
//   The algorithm used is AES-256 (Advanced Encryption Standard, 256-bit key).
//   This is the same algorithm used by banks and governments.
//
// STEP BY STEP: How to encrypt a password
//   1. Add your secret key to .env:   ENCRYPTION_KEY=my-very-secret-phrase
//   2. Run:                           npm run encrypt-password
//   3. Type the password you want to encrypt
//   4. Copy the output (e.g., U2FsdGVkX1...)
//   5. Put it in .env:                DB_PASSWORD_ENCRYPTED=U2FsdGVkX1...
//   6. Delete the plain text password from .env (or never put it there)
//
// HOW TO USE IN CODE:
//   import { encrypt, decrypt } from '../security/crypto-helper';
//
//   // Encrypt (do this once to generate the stored value)
//   const encrypted = encrypt('MySuperSecret123');
//   // → "U2FsdGVkX19abc123..."
//
//   // Decrypt (use this at runtime to get back the real value)
//   const plain = decrypt('U2FsdGVkX19abc123...');
//   // → "MySuperSecret123"
// =============================================================================

import CryptoJS from 'crypto-js';
import * as readline from 'readline';

// =============================================================================
// PRIVATE: getEncryptionKey
// =============================================================================
// Gets the encryption key from the ENCRYPTION_KEY environment variable.
// Throws a clear error if the key is not set.
// =============================================================================
function getEncryptionKey(): string {
  const key = process.env['ENCRYPTION_KEY'];

  if (!key) {
    throw new Error(
      '\n❌ ENCRYPTION_KEY is not set in your .env file!\n' +
      '   Add a line like:  ENCRYPTION_KEY=my-very-secret-phrase\n' +
      '   This key is used to encrypt and decrypt passwords.\n' +
      '   Keep it secret — never commit it to Git!\n'
    );
  }

  if (key.length < 16) {
    throw new Error(
      '\n❌ ENCRYPTION_KEY is too short (minimum 16 characters).\n' +
      '   A longer key is more secure. Try something like:\n' +
      '   ENCRYPTION_KEY=myCompanyFramework2026SecretKey\n'
    );
  }

  return key;
}

// =============================================================================
// FUNCTION: encrypt
// =============================================================================
/**
 * Encrypts a plain text string using AES-256 encryption.
 * The result is a Base64-encoded string safe to store in .env files.
 *
 * @param plainText - The value to encrypt (e.g., 'MyPassword123')
 * @param key       - Optional custom key. Defaults to ENCRYPTION_KEY from .env.
 * @returns         Encrypted string (e.g., 'U2FsdGVkX19abc...')
 *
 * EXAMPLE:
 *   const encrypted = encrypt('MyDatabasePassword!');
 *   // → 'U2FsdGVkX19abc123...'
 *   // Store this in .env as: DB_PASSWORD_ENCRYPTED=U2FsdGVkX19abc123...
 */
export function encrypt(plainText: string, key?: string): string {
  const encryptionKey = key ?? getEncryptionKey();
  const encrypted = CryptoJS.AES.encrypt(plainText, encryptionKey);
  return encrypted.toString();
}

// =============================================================================
// FUNCTION: decrypt
// =============================================================================
/**
 * Decrypts an AES-256 encrypted string back to plain text.
 *
 * @param encryptedText - The encrypted string from .env (e.g., 'U2FsdGVkX19...')
 * @param key           - Optional custom key. Defaults to ENCRYPTION_KEY from .env.
 * @returns             Plain text string (e.g., 'MyPassword123')
 *
 * EXAMPLE:
 *   const password = decrypt(process.env.DB_PASSWORD_ENCRYPTED);
 *   // → 'MyDatabasePassword!'
 */
export function decrypt(encryptedText: string, key?: string): string {
  if (!encryptedText) {
    throw new Error('❌ Cannot decrypt: encrypted text is empty or undefined.');
  }

  const encryptionKey = key ?? getEncryptionKey();

  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedText, encryptionKey);
    const plainText = decrypted.toString(CryptoJS.enc.Utf8);

    if (!plainText) {
      throw new Error(
        'Decryption produced empty result. ' +
        'Check that ENCRYPTION_KEY is the same key used to encrypt the value.'
      );
    }

    return plainText;
  } catch (err) {
    throw new Error(
      `❌ Decryption failed: ${(err as Error).message}\n` +
      `   Make sure ENCRYPTION_KEY in .env matches the key used to encrypt this value.\n`
    );
  }
}

// =============================================================================
// FUNCTION: encryptObject
// =============================================================================
/**
 * Encrypts every value in a plain object.
 * Useful for encrypting all credentials in one call.
 *
 * @param obj - Object with string values to encrypt
 * @returns   New object with all values encrypted
 *
 * EXAMPLE:
 *   const encrypted = encryptObject({ username: 'admin', password: 'secret' });
 *   // → { username: 'U2FsdGVkX1...', password: 'U2FsdGVkX1...' }
 */
export function encryptObject(obj: Record<string, string>): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj)) {
    result[key] = encrypt(value);
  }
  return result;
}

// =============================================================================
// FUNCTION: decryptObject
// =============================================================================
/**
 * Decrypts every value in an encrypted object.
 *
 * @param obj - Object with encrypted string values
 * @returns   New object with all values decrypted
 */
export function decryptObject(obj: Record<string, string>): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj)) {
    result[key] = decrypt(value);
  }
  return result;
}

// =============================================================================
// FUNCTION: hashPassword
// =============================================================================
/**
 * Creates a one-way hash of a password using SHA-256.
 * Unlike encrypt/decrypt, a hash CANNOT be reversed — it's a fingerprint.
 *
 * Use this to compare passwords without ever storing the plain text:
 *   Store: hash('MyPassword') → '9f86d081...'
 *   Login: hash(userInput) === storedHash?
 *
 * @param text - The text to hash
 * @returns    Hex string hash
 */
export function hashPassword(text: string): string {
  return CryptoJS.SHA256(text).toString(CryptoJS.enc.Hex);
}

// =============================================================================
// FUNCTION: isEncryptionConfigured
// =============================================================================
/**
 * Returns true if ENCRYPTION_KEY is set in the environment.
 * Use this to guard encryption code gracefully.
 *
 * EXAMPLE:
 *   if (isEncryptionConfigured()) {
 *     const password = decrypt(process.env.DB_PASSWORD_ENCRYPTED);
 *   } else {
 *     // Fall back to plain text password
 *   }
 */
export function isEncryptionConfigured(): boolean {
  const key = process.env['ENCRYPTION_KEY'];
  return !!(key && key.length >= 16);
}

// =============================================================================
// INTERACTIVE CLI TOOL: encryptPasswordInteractive
// =============================================================================
/**
 * Interactive command-line tool to encrypt a password.
 * Run with: npm run encrypt-password
 *
 * This is what gets called when you run the npm script.
 * It asks you to type a password and prints the encrypted version.
 */
export async function encryptPasswordInteractive(): Promise<void> {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║         🔐 Password Encryption Tool                         ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');
  console.log('This tool encrypts a password so you can safely store it in .env.\n');

  const rl = readline.createInterface({
    input:  process.stdin,
    output: process.stdout,
  });

  const question = (prompt: string): Promise<string> =>
    new Promise(resolve => rl.question(prompt, resolve));

  try {
    // Check if ENCRYPTION_KEY is set
    if (!isEncryptionConfigured()) {
      console.log('⚠️  ENCRYPTION_KEY is not set or too short in .env');
      const key = await question('Enter an encryption key (min 16 chars): ');
      if (key.length < 16) {
        console.log('❌ Key too short. Please use at least 16 characters.');
        rl.close();
        return;
      }
      process.env['ENCRYPTION_KEY'] = key;
      console.log(`\n✅ Add this to your .env file:\n   ENCRYPTION_KEY=${key}\n`);
    }

    const plainText = await question('Enter the password/value to encrypt: ');

    if (!plainText) {
      console.log('❌ Nothing to encrypt. Exiting.');
      rl.close();
      return;
    }

    const encrypted = encrypt(plainText);

    console.log('\n╔══════════════════════════════════════════════════════════════╗');
    console.log('║  ✅ Encryption successful!                                   ║');
    console.log('╚══════════════════════════════════════════════════════════════╝\n');
    console.log('Add this to your .env file:\n');
    console.log(`   DB_PASSWORD_ENCRYPTED=${encrypted}`);
    console.log('\nOR for other values:');
    console.log(`   MY_SECRET_ENCRYPTED=${encrypted}`);
    console.log('\n⚠️  IMPORTANT:');
    console.log('   - Keep your ENCRYPTION_KEY private (never commit to Git)');
    console.log('   - The encrypted value above is useless without the key');
    console.log('   - Delete the plain text password from .env once encrypted\n');

    // Verify by decrypting
    const verified = decrypt(encrypted);
    if (verified === plainText) {
      console.log('✅ Verified: decryption matches original value.\n');
    }

  } finally {
    rl.close();
  }
}

// If this file is run directly (via ts-node), launch the interactive tool
if (require.main === module) {
  import('dotenv/config').then(() => encryptPasswordInteractive());
}
