// =============================================================================
// tests/global-setup.ts — GLOBAL SETUP (RUNS ONCE BEFORE ALL TESTS)
// =============================================================================
// PURPOSE:
//   This file runs ONCE before any test starts. It's the "pre-flight checklist".
//
// WHAT IS "GLOBAL SETUP"?
//   Playwright lets you define code that runs:
//     - globalSetup:    ONCE before ALL tests (this file)
//     - beforeEach:     Before EACH individual test (in test files)
//     - afterEach:      After EACH individual test
//     - globalTeardown: ONCE after ALL tests finish
//
//   Global Setup is perfect for expensive one-time operations like:
//     - Connecting to JIRA / XRAY
//     - Creating a Test Execution
//     - Seeding test data in a database
//     - Verifying all utility connections are healthy
//
// UTILITIES MANAGED HERE:
//   This setup handles MULTIPLE utilities. Each one is optional and skipped
//   gracefully if not configured. Add new utilities by following the pattern:
//     1. Import the utility's check function (e.g., isSlackConfigured)
//     2. Add a setup step that runs only if the utility is configured
//     3. Log a clear message either way so the user knows what happened
//
// CURRENT UTILITIES:
//   🔹 JIRA XRAY — Fetch test cases, create Test Execution
//   🔹 Database  — Seed test data before tests run
//   🔹 Slack     — removed (no longer in this framework)
//   🔹 Email     — (per-test, not global; just logs status here)
//   🔹 API       — (per-test, not global; just logs status here)
//
// EXECUTION FLOW (what happens when you run "npm test"):
//   1. ▶ globalSetup runs (this file):
//      a) Report which utilities are active
//      b) XRAY: Test JIRA connection → Fetch test cases → Create execution
//      c) Database: Seed test data (if enabled)
//      d) Save shared state
//   2. ▶ Each test file runs in parallel
//   3. ▶ globalTeardown runs (after all tests)
// =============================================================================

// Import Playwright's FullConfig type (the configuration object passed to setup)
import { type FullConfig } from '@playwright/test';

// Import our XRAY utilities
import { testJiraConnection }       from '../utils/jira-xray/jira-auth';
import { fetchTestCasesFromTestSet } from '../utils/jira-xray/xray-test-set';
import { createTestExecution }       from '../utils/jira-xray/xray-test-execution';
import { initializeXrayState }       from '../utils/jira-xray/xray-state';

// Import optional utility status checkers
import { isDbConfigured, seedTestData } from '../utils/database/test-data-manager';
import { isEmailConfigured }    from '../utils/email/email-verifier';

// Import enhanced logger (collects structured data for the HTML report)
import { enhancedLogger }       from '../utils/helpers/enhanced-logger';

// Import encryption helper (check if passwords are protected)
import { isEncryptionConfigured } from '../utils/security/crypto-helper';

// Import config (reads from .env)
import { config } from '../config/environment';

// Import the logger
import { logger } from '../utils/helpers/logger';

// =============================================================================
// GLOBAL SETUP FUNCTION
// =============================================================================
// This is the default export — Playwright calls this function automatically.
// It receives the full Playwright configuration as an argument.
//
// "async" means this function can do things that take time (like API calls)
// without blocking. It uses "await" to wait for each step to finish.
// =============================================================================
export default async function globalSetup(_config: FullConfig): Promise<void> {
  logger.section('🚀 GLOBAL SETUP — Starting Framework Initialization');
  logger.info(`Environment: ${config.app.environment}`);
  logger.info(`Application URL: ${config.app.baseUrl}`);
  logger.info(`Sprint Number: ${config.xray.sprintNumber}`);

  // ==========================================================================
  // UTILITY STATUS DASHBOARD
  // ==========================================================================
  // Show which utilities are active/inactive at a glance.
  // This makes it immediately obvious what's configured and what's not.
  // Each utility has a check function that detects placeholders/missing values.
  // ==========================================================================
  logger.section('📋 Utility Status Dashboard');
  logger.info(`  🔹 JIRA XRAY:  ${isJiraPlaceholder() ? '⚠️  Placeholder (will skip)' : '✅ Configured'}`);
  logger.info(`  🔹 Database:   ${isDbConfigured() ? '✅ Configured' : '⚪ Not configured (will skip)'}`);
  logger.info(`  🔹 Email:      ${isEmailConfigured() ? '✅ Configured' : '⚪ Not configured (will skip)'}`);
  logger.info(`  🔹 API Helper: ${config.api.baseUrl ? '✅ Configured' : '⚪ Using BASE_URL as fallback'}`);
  logger.info(`  🔹 Encryption: ${isEncryptionConfigured() ? '✅ ENCRYPTION_KEY set' : '⚠️  Not set (passwords stored as plain text)'}`);
  logger.info(`  🔹 Log to File:${process.env['LOG_TO_FILE'] !== 'false' ? ' ✅ Enabled (logs/ folder)' : ' ⚪ Disabled'}`);
  logger.info(`  🔹 Log Level:  ${process.env['LOG_LEVEL'] ?? 'info'}`);

  // Clear any previous run's collected data in enhanced logger
  enhancedLogger.clear();
  enhancedLogger.info('Framework initialized', 'GlobalSetup');

  // ==========================================================================
  // JIRA/XRAY SETUP
  // ==========================================================================
  // PLACEHOLDER DETECTION — Skip JIRA when credentials are not yet configured
  // ==========================================================================
  // If the .env file still has the example placeholder values, skip JIRA entirely.
  // This lets the framework run Playwright tests even without real JIRA credentials,
  // which is useful during local development and validation.
  const isJiraConfigured =
    !isJiraPlaceholder();

  if (!isJiraConfigured) {
    logger.warn(
      '⚠️  JIRA credentials are still set to placeholder values in .env.\n' +
      '   Skipping JIRA/XRAY integration — Playwright tests will still run.\n' +
      '   Update JIRA_BASE_URL, JIRA_USERNAME, JIRA_API_TOKEN in .env to enable XRAY.'
    );
    initializeXrayState('NOT_CONFIGURED', config.xray.sprintNumber);
    return; // Skip all JIRA steps — tests run fine without it
  }

  // ==========================================================================
  // STEP 1: Test JIRA Connection
  // ==========================================================================
  // Before doing anything else, verify that our JIRA credentials work.
  // If they don't work, we should fail NOW (with a clear error) rather than
  // having all tests fail with confusing JIRA-related errors later.
  logger.step('Step 1/4: Testing JIRA connection...');

  const isConnected = await testJiraConnection();

  if (!isConnected) {
    // JIRA is configured but unreachable — warn and continue without XRAY
    // (tests will still run; results just won't be uploaded to JIRA)
    logger.warn(
      '⚠️  Could not connect to JIRA. Skipping XRAY integration.\n' +
      '   Please check: JIRA_BASE_URL, JIRA_USERNAME, JIRA_API_TOKEN in .env\n' +
      '   Playwright tests will still run normally.'
    );
    initializeXrayState('NOT_CONFIGURED', config.xray.sprintNumber);
    return;
  }

  logger.pass('JIRA connection verified.');

  // ==========================================================================
  // STEP 2: Fetch Test Cases from XRAY Test Set
  // ==========================================================================
  // Load all test cases from the Test Set defined in XRAY_TEST_SET_ID (.env).
  // This tells us: "Which tests should be part of this execution?"
  logger.step(`Step 2/4: Fetching test cases from Test Set: ${config.xray.testSetId}...`);

  const testSetResult = await fetchTestCasesFromTestSet(config.xray.testSetId);

  if (!testSetResult || testSetResult.testCases.length === 0) {
    // This is a warning, not a fatal error — tests can still run without XRAY test cases
    // But log a clear message so the user knows XRAY integration won't work
    logger.warn(
      `No test cases found in Test Set "${config.xray.testSetId}".\n` +
      `   Tests will run, but XRAY results will NOT be updated.\n` +
      `   Check that the Test Set ID is correct in your .env file.`
    );

    // Initialize state with empty execution key to signal XRAY is not connected
    initializeXrayState('NOT_CONFIGURED', config.xray.sprintNumber);
    return; // Exit setup early — skip execution creation
  }

  logger.pass(`Loaded ${testSetResult.totalCount} test case(s) from "${testSetResult.testSetSummary}".`);

  // Log the test cases we found for visibility
  logger.info('Test cases to be executed:');
  testSetResult.testCases.forEach((tc, index) => {
    logger.info(`  ${index + 1}. [${tc.issueKey}] ${tc.summary}`);
  });

  // ==========================================================================
  // STEP 3: Create XRAY Test Execution
  // ==========================================================================
  // Create a new Test Execution ticket in JIRA XRAY for this sprint.
  // This is the "container" that holds all our test results.
  logger.step(`Step 3/4: Creating Test Execution for Sprint ${config.xray.sprintNumber}...`);

  const testExecution = await createTestExecution(
    testSetResult.testCases,
    config.xray.sprintNumber
  );

  if (!testExecution) {
    logger.warn(
      'Could not create Test Execution in XRAY.\n' +
      '   Tests will run, but results will NOT be uploaded to XRAY.'
    );
    initializeXrayState('NOT_CONFIGURED', config.xray.sprintNumber);
    return;
  }

  logger.pass(`Test Execution created: ${testExecution.executionKey}`);

  // ==========================================================================
  // STEP 4: Save Execution Key to Shared State
  // ==========================================================================
  // Write the execution key to a shared JSON file so that:
  //   - Individual tests can read it to know which execution to report to
  //   - Global teardown can read it to finalize all results
  logger.step(`Step 4/4: Saving execution state...`);

  initializeXrayState(testExecution.executionKey, config.xray.sprintNumber);

  logger.pass(`State saved. Execution key: ${testExecution.executionKey}`);

  // ==========================================================================
  // SETUP COMPLETE
  // ==========================================================================
  logger.section(
    `✅ GLOBAL SETUP COMPLETE\n` +
    `   Test Execution: ${testExecution.executionKey}\n` +
    `   Sprint: ${config.xray.sprintNumber}\n` +
    `   Tests to run: ${testSetResult.totalCount}\n` +
    `   Starting tests now...`
  );

  // ==========================================================================
  // DATABASE: Seed Test Data (if configured)
  // ==========================================================================
  // If a database is configured, seed any test data needed before tests run.
  // Add your seedTestData() calls here.
  // This section runs AFTER XRAY setup so that even if DB seeding fails,
  // the XRAY execution is already created and tests can still run.
  // ==========================================================================
  if (isDbConfigured()) {
    logger.section('🗃️  DATABASE — Seeding Test Data');
    // Example: await seedTestData('users', { username: 'testuser', ... }, 'Test user for login');
    // Add your seed operations here as needed.
    logger.info('No seed operations configured yet. Add them in global-setup.ts.');
  }
}

// =============================================================================
// HELPER: Check if JIRA credentials are still placeholders
// =============================================================================
// Extracted into a named function so the utility dashboard can also use it.
// =============================================================================
function isJiraPlaceholder(): boolean {
  return (
    config.jira.baseUrl === 'https://your-company.atlassian.net' ||
    config.jira.username === 'your-email@example.com' ||
    config.jira.apiToken === 'your-jira-api-token-here'
  );
}
