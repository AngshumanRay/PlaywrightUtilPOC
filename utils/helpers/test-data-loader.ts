// =============================================================================
// utils/helpers/test-data-loader.ts — DATA-DRIVEN TEST DATA LOADER
// =============================================================================
// PURPOSE:
//   Loads test data from external YAML files so tests are DATA-DRIVEN.
//   Instead of hardcoding values in test files, each test reads its inputs
//   from a YAML file in the test-data/ folder.
//
// WHY DATA-DRIVEN TESTING?
//   ┌────────────────────────────────────────────────────────────────────┐
//   │  BEFORE (hardcoded):                                               │
//   │    const username = 'tomsmith';                                    │
//   │    const password = 'SuperSecretPassword!';                        │
//   │                                                                    │
//   │  AFTER (data-driven):                                              │
//   │    const td = getTestData('ui-tests.yaml', 'PROJ-101');           │
//   │    const username = td.username;                                   │
//   │    const password = td.password;                                   │
//   │                                                                    │
//   │  BENEFITS:                                                         │
//   │    ✅ Change test data WITHOUT modifying test code                 │
//   │    ✅ Same tests can run with different data sets (environments)   │
//   │    ✅ QA can update data in YAML without knowing TypeScript        │
//   │    ✅ Selectively run/skip tests via  run: yes / run: no          │
//   │    ✅ Easy to add new test cases — just add YAML entries           │
//   └────────────────────────────────────────────────────────────────────┘
//
// YAML FILE FORMAT (simple & flat):
//   ┌────────────────────────────────────────────────────────────────────┐
//   │  PROJ-101:                                                         │
//   │    run: yes                    ← toggle: yes = run, no = skip     │
//   │    testCase: "TC01: Login"     ← friendly name for logs           │
//   │    username: "tomsmith"        ← your data fields (any key name)  │
//   │    password: "SuperSecret!"    ← test reads these by key name     │
//   │    expectedUrl: "/secure"                                          │
//   └────────────────────────────────────────────────────────────────────┘
//
// ENVIRONMENT VARIABLE SUBSTITUTION:
//   Use ${ENV:VARIABLE_NAME} in YAML values to reference .env variables:
//     password: "${ENV:TEST_PASSWORD}"
//   The loader replaces these at runtime with the actual env value.
//
// ENCRYPTED VALUE SUBSTITUTION:
//   Use ${ENC:ciphertext} in YAML values to store encrypted secrets:
//     password: "${ENC:U2FsdGVkX1/abc123...}"
//   The loader auto-decrypts these at runtime using ENCRYPTION_KEY from .env.
//   Generate encrypted values with:  npm run encrypt-password
//   This way passwords are NEVER stored as plain text in YAML files.
//
// USAGE IN TESTS:
//   import { getTestData, isTestEnabled } from '../utils/helpers/test-data-loader';
//
//   const td = getTestData('ui-tests.yaml', 'PROJ-101');
//   // td.testCase  → "TC01: Valid credentials should log the user in"
//   // td.username   → "tomsmith"
//   // td.password   → "SuperSecretPassword!"
//
//   // Check if test should run (based on  run: yes/no  in YAML):
//   if (!isTestEnabled('ui-tests.yaml', 'PROJ-101')) test.skip();
//
// FILE LOCATION:
//   Test data files live in: <project-root>/test-data/
//   Only 2 files:
//     ui-tests.yaml   — Login + Navigation UI tests
//     api-tests.yaml  — REST API tests
// =============================================================================

import * as fs   from 'fs';
import * as path from 'path';
import { parse }  from 'yaml';
import { logger } from './logger';
import { decrypt, isEncryptionConfigured } from '../security/crypto-helper';

// =============================================================================
// TYPES
// =============================================================================

/**
 * A single test case entry from a YAML data file.
 *
 * The YAML format is FLAT — all fields sit directly under the XRAY key:
 *
 *   PROJ-101:
 *     run: yes
 *     testCase: "TC01: Valid credentials should log the user in"
 *     username: "tomsmith"
 *     password: "SuperSecretPassword!"
 *     expectedUrl: "/secure"
 *
 * This becomes a TestDataEntry where:
 *   - run      → boolean (yes = true, no = false)
 *   - testCase → friendly name shown in logs/reports
 *   - All other fields are accessible directly: td.username, td.password, etc.
 */
export interface TestDataEntry {
  /** Whether this test should run (true) or be skipped (false) */
  run: boolean;
  /** Friendly test case name (shown in logs/reports) */
  testCase: string;
  /** Any additional data fields — accessible directly by key name */
  [key: string]: unknown;
}

/**
 * The full parsed YAML file — a map of XRAY keys → TestDataEntry.
 *
 * EXAMPLE:
 *   {
 *     'PROJ-101': { run: true, testCase: '...', username: '...', password: '...' },
 *     'PROJ-102': { run: true, testCase: '...', username: '...', password: '...' },
 *   }
 */
export type TestDataFile = Record<string, TestDataEntry>;

// =============================================================================
// CACHE — avoid re-reading the same YAML file multiple times
// =============================================================================
const fileCache = new Map<string, TestDataFile>();

// =============================================================================
// PUBLIC API
// =============================================================================

/**
 * Load and parse an entire YAML test data file.
 *
 * @param fileName  Name of the YAML file (e.g., 'ui-tests.yaml')
 *                  The file is looked up in <project-root>/test-data/
 * @returns         A map of XRAY key → TestDataEntry
 *
 * @example
 *   const allUiData = loadTestDataFile('ui-tests.yaml');
 *   // Returns: { 'PROJ-101': { run: true, testCase: '...', username: '...' }, ... }
 */
export function loadTestDataFile(fileName: string): TestDataFile {
  // Check cache first
  if (fileCache.has(fileName)) {
    return fileCache.get(fileName)!;
  }

  const filePath = resolveTestDataPath(fileName);

  if (!fs.existsSync(filePath)) {
    throw new Error(
      `Test data file not found: ${filePath}\n` +
      `  → Create it in the test-data/ folder at the project root.\n` +
      `  → See test-data/ui-tests.yaml for an example.`
    );
  }

  const rawContent = fs.readFileSync(filePath, 'utf-8');
  const parsed = parse(rawContent) as Record<string, Record<string, unknown>>;

  // Normalize the flat YAML entries into TestDataEntry objects
  const normalized: TestDataFile = {};
  for (const [xrayKey, rawEntry] of Object.entries(parsed)) {
    const { run, testCase, ...rest } = rawEntry;

    // Convert "yes"/"no" string → boolean (YAML `yes` parses as boolean true)
    let runFlag: boolean;
    if (typeof run === 'boolean') {
      runFlag = run;
    } else if (typeof run === 'string') {
      runFlag = run.toLowerCase() === 'yes' || run.toLowerCase() === 'true';
    } else {
      runFlag = true; // default: run the test if `run` field is missing
    }

    normalized[xrayKey] = {
      run: runFlag,
      testCase: (testCase as string) || xrayKey,
      ...rest,
    };
  }

  // Substitute environment variables in all string values
  const resolved = resolveEnvVariables(normalized);

  // Cache for subsequent calls
  fileCache.set(fileName, resolved);

  logger.debug(`📂 Loaded test data: ${fileName} (${Object.keys(resolved).length} test case(s))`);

  return resolved;
}

/**
 * Get the test data for a specific XRAY test case from a YAML file.
 *
 * All fields are accessible directly on the returned object:
 *   td.testCase, td.username, td.password, td.expectedUrl, etc.
 *
 * @param fileName  Name of the YAML file (e.g., 'ui-tests.yaml')
 * @param xrayKey   The XRAY test case key (e.g., 'PROJ-101')
 * @returns         The TestDataEntry for that test case
 *
 * @throws          Error if the file or key is not found
 *
 * @example
 *   const td = getTestData('ui-tests.yaml', 'PROJ-101');
 *   console.log(td.testCase);   // "TC01: Valid credentials..."
 *   console.log(td.username);   // "tomsmith"
 *   console.log(td.password);   // "SuperSecretPassword!"
 */
export function getTestData(fileName: string, xrayKey: string): TestDataEntry {
  const allData = loadTestDataFile(fileName);

  if (!allData[xrayKey]) {
    throw new Error(
      `Test data not found for XRAY key "${xrayKey}" in file "${fileName}".\n` +
      `  → Available keys: ${Object.keys(allData).join(', ')}\n` +
      `  → Add a "${xrayKey}" entry to test-data/${fileName}`
    );
  }

  return allData[xrayKey];
}

/**
 * Check if a test case is enabled (run: yes) in the YAML file.
 *
 * Use this at the top of each test to skip disabled tests:
 *   if (!isTestEnabled('ui-tests.yaml', 'PROJ-101')) test.skip();
 *
 * @param fileName  Name of the YAML file
 * @param xrayKey   The XRAY test case key
 * @returns         true if run: yes, false if run: no
 */
export function isTestEnabled(fileName: string, xrayKey: string): boolean {
  const td = getTestData(fileName, xrayKey);
  return td.run === true;
}

// =============================================================================
// ONE-TO-MANY: PARAMETERIZED DATA SETS
// =============================================================================

/**
 * A single data set for parameterized testing.
 *
 * When a YAML entry has a `dataSets:` array, each item becomes a DataSetEntry.
 * The `label` field is shown in the test name to distinguish iterations.
 *
 * YAML format:
 *   PROJ-101:
 *     run: yes
 *     testCase: "TC01: Valid login"
 *     dataSets:
 *       - label: "Standard user"
 *         username: "tomsmith"
 *         password: "SuperSecret!"
 *       - label: "Admin user"
 *         username: "admin"
 *         password: "AdminPass!"
 */
export interface DataSetEntry {
  /** Human-readable label shown in test name (e.g., "Standard user") */
  label: string;
  /** Index of this data set (0-based) — auto-assigned by the loader */
  index: number;
  /** All data fields from this data set item */
  [key: string]: unknown;
}

/**
 * Get parameterized data sets for a test case.
 *
 * If the YAML entry has a `dataSets:` array, returns each item as a DataSetEntry.
 * If there is NO `dataSets:` array, returns a SINGLE DataSetEntry containing
 * all the flat fields (backward compatible — existing tests don't need to change).
 *
 * @param fileName  Name of the YAML file (e.g., 'ui-tests.yaml')
 * @param xrayKey   The XRAY test case key (e.g., 'PROJ-101')
 * @returns         Array of DataSetEntry objects (always at least 1 item)
 *
 * @example ONE-TO-MANY (YAML has dataSets array):
 *   const sets = getTestDataSets('ui-tests.yaml', 'PROJ-101');
 *   // Returns: [
 *   //   { label: "Standard user", index: 0, username: "tomsmith", password: "..." },
 *   //   { label: "Admin user",    index: 1, username: "admin",    password: "..." },
 *   // ]
 *
 * @example SINGLE DATA (YAML has no dataSets — backward compatible):
 *   const sets = getTestDataSets('ui-tests.yaml', 'PROJ-102');
 *   // Returns: [
 *   //   { label: "default", index: 0, username: "tomsmith", password: "wrong", ... }
 *   // ]
 */
export function getTestDataSets(fileName: string, xrayKey: string): DataSetEntry[] {
  const td = getTestData(fileName, xrayKey);

  // ── CASE 1: dataSets array exists → return each item ──
  if (Array.isArray(td.dataSets)) {
    return (td.dataSets as Record<string, unknown>[]).map((item, idx) => ({
      label: (item.label as string) || `Data set ${idx + 1}`,
      index: idx,
      ...item,
    }));
  }

  // ── CASE 2: No dataSets → wrap the flat fields into a single-item array ──
  // Strip out the control fields (run, testCase) — return only data fields
  const { run: _run, testCase: _tc, ...dataFields } = td;
  return [
    {
      label: 'default',
      index: 0,
      ...dataFields,
    },
  ];
}

/**
 * Get all XRAY keys defined in a test data file.
 * Useful for generating test permutations or listing available test cases.
 *
 * @param fileName  Name of the YAML file
 * @returns         Array of XRAY keys (e.g., ['PROJ-101', 'PROJ-102', 'PROJ-103'])
 */
export function getTestDataKeys(fileName: string): string[] {
  const allData = loadTestDataFile(fileName);
  return Object.keys(allData);
}

/**
 * Clear the internal file cache.
 * Call this if you modify YAML files at runtime and need a fresh read.
 */
export function clearTestDataCache(): void {
  fileCache.clear();
}

// =============================================================================
// PRIVATE HELPERS
// =============================================================================

/**
 * Resolves the absolute path to a test data file.
 * Looks in <project-root>/test-data/ by default.
 */
function resolveTestDataPath(fileName: string): string {
  return path.resolve(process.cwd(), 'test-data', fileName);
}

/**
 * Recursively walks through the parsed YAML object and replaces any
 * ${ENV:VARIABLE_NAME} patterns with the actual environment variable value,
 * and ${ENC:ciphertext} patterns with their decrypted plain-text value.
 *
 * EXAMPLE (environment variable):
 *   Input:  { password: "${ENV:TEST_PASSWORD}" }
 *   Output: { password: "actual-password-from-env" }
 *
 * EXAMPLE (encrypted value):
 *   Input:  { password: "${ENC:U2FsdGVkX1/abc123...}" }
 *   Output: { password: "MyActualPassword" }
 *
 * If the env variable is not set, the placeholder remains as-is and a
 * warning is logged. If ENCRYPTION_KEY is not configured, encrypted
 * placeholders remain as-is with a warning.
 */
function resolveEnvVariables(obj: TestDataFile): TestDataFile {
  const envPattern = /\$\{ENV:([^}]+)\}/g;
  const encPattern = /\$\{ENC:([^}]+)\}/g;

  function resolveValue(value: unknown): unknown {
    if (typeof value === 'string') {
      // 1) Replace ${ENV:VARIABLE_NAME} with env var values
      let resolved = value.replace(envPattern, (_match, varName: string) => {
        const envValue = process.env[varName];
        if (envValue === undefined) {
          logger.warn(`⚠ Environment variable "${varName}" is not set (used in test data YAML).`);
          return `\${ENV:${varName}}`; // leave placeholder as-is
        }
        return envValue;
      });

      // 2) Replace ${ENC:ciphertext} with decrypted values
      resolved = resolved.replace(encPattern, (_match, cipherText: string) => {
        if (!isEncryptionConfigured()) {
          logger.warn(
            '⚠ ENCRYPTION_KEY is not set in .env — cannot decrypt $' + '{ENC:...} values in YAML.\n' +
            '   Set ENCRYPTION_KEY in .env (min 16 characters) and re-run.'
          );
          return `\${ENC:${cipherText}}`; // leave placeholder as-is
        }
        try {
          const plainText = decrypt(cipherText);
          logger.debug('🔓 Decrypted an $' + '{ENC:...} value in YAML test data.');
          return plainText;
        } catch (err) {
          logger.error(
            '❌ Failed to decrypt $' + '{ENC:...} value in YAML: ' + (err as Error).message + '\n' +
            '   Make sure ENCRYPTION_KEY matches the key used to encrypt this value.'
          );
          return `\${ENC:${cipherText}}`; // leave placeholder as-is on failure
        }
      });

      return resolved;
    }

    if (Array.isArray(value)) {
      return value.map(resolveValue);
    }

    if (value !== null && typeof value === 'object') {
      const resolved: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
        resolved[k] = resolveValue(v);
      }
      return resolved;
    }

    return value; // numbers, booleans, null — return as-is
  }

  return resolveValue(obj) as TestDataFile;
}
