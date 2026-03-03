// =============================================================================
// config/environment.ts — ENVIRONMENT CONFIGURATION LOADER
// =============================================================================
// PURPOSE:
//   This file reads your environment variables from the ".env" file and makes
//   them available as a strongly-typed object throughout the project.
//
// WHAT IS AN ENVIRONMENT VARIABLE?
//   An environment variable is a named setting stored outside your code.
//   Example: JIRA_BASE_URL=https://company.atlassian.net
//   Instead of hardcoding "https://company.atlassian.net" everywhere in code,
//   we read it from the .env file. This means:
//     - You can change settings WITHOUT changing code
//     - Secrets (passwords) stay out of your code files
//
// HOW IT WORKS:
//   1. "dotenv" is a library that reads the .env file
//   2. It loads each line into Node.js's process.env object
//   3. We read process.env here and export a clean "config" object
//   4. The rest of the project imports "config" from this file
// =============================================================================

// "dotenv/config" automatically reads your .env file when this module is loaded.
// It MUST be imported before any code that reads process.env values.
import 'dotenv/config';

// -----------------------------------------------------------------------------
// HELPER FUNCTION: getRequiredEnvVar
// -----------------------------------------------------------------------------
// PURPOSE:
//   Safely reads an environment variable and throws a clear error if it's missing.
//   This is better than silently getting "undefined" and having a confusing crash later.
//
// PARAMETERS:
//   - name: The name of the environment variable (e.g., "JIRA_BASE_URL")
//
// RETURNS:
//   The value of the environment variable as a string.
// -----------------------------------------------------------------------------
function getRequiredEnvVar(name: string): string {
  const value = process.env[name];

  // If the variable is missing or empty, stop everything and show a helpful message
  if (!value) {
    throw new Error(
      `\n❌ Missing required environment variable: "${name}"\n` +
      `   Please add it to your .env file.\n` +
      `   See .env.example for a template.\n`
    );
  }

  return value;
}

// -----------------------------------------------------------------------------
// HELPER FUNCTION: getOptionalEnvVar
// -----------------------------------------------------------------------------
// PURPOSE:
//   Reads an environment variable but returns a default value if it's not set.
//   Use this for variables that have a sensible default.
//
// PARAMETERS:
//   - name:         The name of the environment variable
//   - defaultValue: The value to use if the variable is not set
// -----------------------------------------------------------------------------
function getOptionalEnvVar(name: string, defaultValue: string): string {
  return process.env[name] || defaultValue;
}

// -----------------------------------------------------------------------------
// EXPORTED CONFIGURATION OBJECT
// -----------------------------------------------------------------------------
// This is the main export. Import "config" in any file to access these settings.
//
// Example usage in another file:
//   import { config } from '../config/environment';
//   console.log(config.jira.baseUrl);  // → "https://company.atlassian.net"
// -----------------------------------------------------------------------------
export const config = {

  // --------------------------------------------------------------------------
  // JIRA Settings
  // These are used to connect to your JIRA instance via its API (web service).
  // --------------------------------------------------------------------------
  jira: {
    // The root URL of your JIRA site (no trailing slash)
    baseUrl: getRequiredEnvVar('JIRA_BASE_URL'),

    // Your JIRA login email
    username: getRequiredEnvVar('JIRA_USERNAME'),

    // Your JIRA API token (acts as a password for API calls)
    apiToken: getRequiredEnvVar('JIRA_API_TOKEN'),
  },

  // --------------------------------------------------------------------------
  // XRAY Settings
  // XRAY is a test management plugin for JIRA.
  // These settings control which tests to run and where to report results.
  // --------------------------------------------------------------------------
  xray: {
    // The short code for your JIRA project (e.g., "PROJ")
    projectKey: getRequiredEnvVar('XRAY_PROJECT_KEY'),

    // The JIRA ticket ID of the Test Set to fetch test cases from (e.g., "PROJ-456")
    testSetId: getRequiredEnvVar('XRAY_TEST_SET_ID'),

    // The current sprint (iteration) number — used to name the Test Execution
    sprintNumber: getOptionalEnvVar('XRAY_SPRINT_NUMBER', '1'),

    // The JIRA board ID (used to look up sprint details)
    boardId: getOptionalEnvVar('XRAY_BOARD_ID', '1'),
  },

  // --------------------------------------------------------------------------
  // Application Under Test (AUT) Settings
  // These control WHERE and WHAT Playwright is testing.
  // --------------------------------------------------------------------------
  app: {
    // The web address where your application is running
    baseUrl: getRequiredEnvVar('BASE_URL'),

    // Which environment: "dev", "staging", or "prod"
    environment: getOptionalEnvVar('TEST_ENVIRONMENT', 'staging'),
  },

  // --------------------------------------------------------------------------
  // DATABASE / TEST DATA (Optional)
  // --------------------------------------------------------------------------
  // Seed and clean up test data before/after test runs.
  // To enable: set DB_ENABLED=true and fill in connection details.
  // To disable: set DB_ENABLED=false or leave it absent.
  // --------------------------------------------------------------------------
  database: {
    enabled:  getOptionalEnvVar('DB_ENABLED', 'false') === 'true',
    host:     getOptionalEnvVar('DB_HOST', 'localhost-placeholder'),
    port:     parseInt(getOptionalEnvVar('DB_PORT', '5432'), 10),
    name:     getOptionalEnvVar('DB_NAME', ''),
    user:     getOptionalEnvVar('DB_USER', ''),
    password: getOptionalEnvVar('DB_PASSWORD', ''),
  },

  // --------------------------------------------------------------------------
  // EMAIL VERIFICATION (Optional)
  // --------------------------------------------------------------------------
  // For tests involving email (forgot password, OTP, signup confirmation).
  // Uses a test mailbox service like Mailosaur, MailSlurp, or Mailtrap.
  // To enable: set EMAIL_ENABLED=true and fill in API details.
  // To disable: set EMAIL_ENABLED=false or leave it absent.
  // --------------------------------------------------------------------------
  email: {
    enabled:   getOptionalEnvVar('EMAIL_ENABLED', 'false') === 'true',
    service:   getOptionalEnvVar('EMAIL_SERVICE', 'mailosaur'),
    apiKey:    getOptionalEnvVar('EMAIL_API_KEY', ''),
    serverId:  getOptionalEnvVar('EMAIL_SERVER_ID', ''),
  },

  // --------------------------------------------------------------------------
  // API TESTING (Optional)
  // --------------------------------------------------------------------------
  // For tests that call backend REST APIs directly (not through the browser).
  // Defaults to BASE_URL if API_BASE_URL is not set.
  // --------------------------------------------------------------------------
  api: {
    baseUrl:   getOptionalEnvVar('API_BASE_URL', ''),
    authToken: getOptionalEnvVar('API_AUTH_TOKEN', ''),
  },

  // --------------------------------------------------------------------------
  // EXECUTION MODES
  // --------------------------------------------------------------------------
  // Control HOW tests run without changing code.
  // All these can also be set as CLI environment variables:
  //   RUN_HEADLESS=false npm test   ← shows browser window
  //   RUN_PARALLEL=true npm test    ← runs tests in parallel
  // --------------------------------------------------------------------------
  execution: {
    /** true = no visible browser window (faster); false = show browser (debug) */
    headless:  getOptionalEnvVar('RUN_HEADLESS', 'true') === 'true',

    /** true = test files run simultaneously (faster but uses more CPU) */
    parallel:  getOptionalEnvVar('RUN_PARALLEL', 'false') === 'true',

    /** How many parallel workers (test processes) to use */
    workers:   parseInt(getOptionalEnvVar('RUN_WORKERS', '2'), 10),

    /** How many times to retry a failed test (0 = no retries) */
    retries:   parseInt(getOptionalEnvVar('RUN_RETRIES', '0'), 10),
  },

  // --------------------------------------------------------------------------
  // LOGGING
  // --------------------------------------------------------------------------
  // Controls how much information is written to the terminal and log files.
  // --------------------------------------------------------------------------
  logging: {
    /** Log detail level: 'debug' | 'info' | 'warn' | 'error' */
    level:       getOptionalEnvVar('LOG_LEVEL', 'info'),

    /** true = write logs to logs/test-run-YYYY-MM-DD.log */
    toFile:      getOptionalEnvVar('LOG_TO_FILE', 'true') === 'true',

    /** How many days of log files to keep before auto-deleting old ones */
    maxFileDays: parseInt(getOptionalEnvVar('LOG_FILE_MAX_DAYS', '14'), 10),
  },

  // --------------------------------------------------------------------------
  // SECURITY / ENCRYPTION
  // --------------------------------------------------------------------------
  // When ENCRYPTION_KEY is set, all DB passwords and secrets are stored
  // encrypted. Use: npm run encrypt-password to generate an encrypted value.
  // --------------------------------------------------------------------------
  security: {
    /** Secret key for AES-256 encryption (min 16 chars) */
    encryptionKey: getOptionalEnvVar('ENCRYPTION_KEY', ''),
  },

  // --------------------------------------------------------------------------
  // REPORTING
  // --------------------------------------------------------------------------
  // Controls the HTML execution report generated after every test run.
  // Output: reports/execution-report-YYYY-MM-DD.html
  // --------------------------------------------------------------------------
  reporting: {
    /** Folder where the HTML report is saved */
    outputDir: getOptionalEnvVar('REPORT_OUTPUT_DIR', 'reports'),
  },
};

// Export the type of the config so TypeScript can check it elsewhere
export type Config = typeof config;
