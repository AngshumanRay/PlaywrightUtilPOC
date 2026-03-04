// =============================================================================
// playwright.config.ts — PLAYWRIGHT TEST RUNNER CONFIGURATION
// =============================================================================
// PURPOSE:
//   This is the MAIN configuration file for Playwright.
//   It controls HOW Playwright runs your tests:
//     - Which browser(s) to use
//     - How many tests to run at the same time (parallel vs. sequential)
//     - What to do when tests fail (retries, screenshots, videos)
//     - Global setup and teardown hooks
//     - Where to save test reports
//
// HOW PLAYWRIGHT USES THIS FILE:
//   When you run "npx playwright test", Playwright automatically reads this file.
//   You don't need to pass it as a parameter — it's auto-detected.
//
// OFFICIAL DOCS: https://playwright.dev/docs/test-configuration
// =============================================================================

// Import Playwright's configuration types
import { defineConfig, devices } from '@playwright/test';

// Load environment variables from .env BEFORE reading process.env
// "dotenv/config" reads the .env file and populates process.env
import 'dotenv/config';

// =============================================================================
// EXPORT DEFAULT CONFIGURATION
// =============================================================================
// "defineConfig()" wraps our configuration object and provides type-checking.
// TypeScript will catch typos or wrong values in this config.
// =============================================================================
export default defineConfig({

  // ==========================================================================
  // TEST DIRECTORY
  // ==========================================================================
  // Where Playwright looks for test files.
  // It will find any file matching the "testMatch" pattern below inside this folder.
  testDir: './tests',

  // ==========================================================================
  // TEST FILE PATTERN
  // ==========================================================================
  // Which files are test files? Only files matching this pattern will be run.
  // "**/*.test.ts" means: any .test.ts file in any subfolder under testDir
  // Example matches: tests/login.test.ts, tests/checkout/payment.test.ts
  testMatch: '**/*.test.ts',

  // ==========================================================================
  // PARALLEL EXECUTION
  // ==========================================================================
  // fullyParallel: true  = test FILES run in parallel (faster, more CPU)
  // fullyParallel: false = test files run one after another (safer for beginners)
  //
  // Controlled by RUN_PARALLEL=true in .env, defaults to false
  fullyParallel: (process.env['RUN_PARALLEL'] ?? 'false') === 'true',

  // ==========================================================================
  // WORKERS (PARALLEL TEST PROCESSES)
  // ==========================================================================
  // RUN_WORKERS in .env overrides the default.
  //   LOCAL:    2 workers  → RUN_WORKERS=2
  //   CI/CD:    1 worker   → RUN_WORKERS=1
  //   FAST:     4 workers  → RUN_WORKERS=4
  workers: process.env['CI'] ? 1 : parseInt(process.env['RUN_WORKERS'] ?? '2', 10),

  // ==========================================================================
  // RETRIES ON FAILURE
  // ==========================================================================
  // RUN_RETRIES in .env overrides default.
  // CI retries 2 times; local retries 0 by default.
  retries: process.env['CI'] ? 2 : parseInt(process.env['RUN_RETRIES'] ?? '0', 10),

  // ==========================================================================
  // TEST TIMEOUT
  // ==========================================================================
  // Maximum time (in milliseconds) a SINGLE TEST can take before it's marked
  // as "timed out" (failed due to taking too long).
  //
  // Controlled by TEST_TIMEOUT in .env (default: 60000 = 60 seconds).
  // Increase for slow apps or large file uploads.
  timeout: parseInt(process.env['TEST_TIMEOUT'] ?? '60000', 10),

  // ==========================================================================
  // EXPECT TIMEOUT
  // ==========================================================================
  // Maximum time for a single "expect()" assertion to wait.
  // Playwright auto-waits for assertions — this is how long it waits.
  //
  // Controlled by EXPECT_TIMEOUT in .env (default: 10000 = 10 seconds).
  expect: {
    timeout: parseInt(process.env['EXPECT_TIMEOUT'] ?? '10000', 10),
  },

  // ==========================================================================
  // GLOBAL SETUP & TEARDOWN
  // ==========================================================================
  // Files to run ONCE before and after ALL tests.
  //
  // globalSetup:    Runs once before any test starts
  //   → Creates XRAY Test Execution, fetches test cases
  //
  // globalTeardown: Runs once after all tests finish
  //   → Uploads all results to XRAY
  globalSetup:    './tests/global-setup.ts',
  globalTeardown: './tests/global-teardown.ts',

  // ==========================================================================
  // REPORTER
  // ==========================================================================
  // How to display test results after running.
  // You can have multiple reporters at the same time!
  //
  // Reporters available:
  //   'list'   → Simple list in the terminal (default)
  //   'html'   → Beautiful HTML report saved to playwright-report/
  //   'json'   → Results as a JSON file (for CI/CD processing)
  //   'dot'    → Minimal output (one dot per test — good for CI)
  //   'line'   → One line per test
  //
  // We use both "list" (for terminal readability) and "html" (for sharing reports)
  reporter: [
    // Terminal output — shows test names and pass/fail as tests run
    ['list'],

    // HTML report — open playwright-report/index.html after tests to see a
    // beautiful visual report with screenshots, traces, and error details
    ['html', {
      outputFolder: 'playwright-report',  // Where to save the HTML report
      open: 'never',                      // Don't auto-open browser after tests
                                          // Change to 'on-failure' to auto-open on failure
    }],
  ],

  // ==========================================================================
  // GLOBAL TEST SETTINGS (use)
  // ==========================================================================
  // Settings that apply to ALL tests unless overridden in the test file.
  use: {

    // ------------------------------------------------------------------------
    // BASE URL
    // ------------------------------------------------------------------------
    // The root URL of the application under test.
    // When tests call page.goto('/login'), Playwright prepends this URL.
    // Example: baseURL = "https://myapp.com" + "/login" = "https://myapp.com/login"
    baseURL: process.env['BASE_URL'],

    // ------------------------------------------------------------------------
    // HEADLESS MODE
    // ------------------------------------------------------------------------
    // headless: true  = No browser window (faster, used in CI/CD)
    // headless: false = Browser window visible (great for watching/debugging)
    //
    // Set in .env:  RUN_HEADLESS=false   to watch tests run
    // Or via CLI:   npm run test:headed
    headless: (process.env['RUN_HEADLESS'] ?? 'true') === 'true',

    // ------------------------------------------------------------------------
    // SCREENSHOT ON FAILURE
    // ------------------------------------------------------------------------
    // 'only-on-failure' → Take screenshot automatically when a test fails
    // 'on':              → Take screenshot after EVERY test
    // 'off':             → Never take screenshots automatically
    //
    // Screenshots are saved to test-results/ folder.
    screenshot: 'only-on-failure',

    // ------------------------------------------------------------------------
    // VIDEO RECORDING
    // ------------------------------------------------------------------------
    // 'on-first-retry' → Record video only when retrying a failed test
    // 'on':             → Always record (uses lots of disk space)
    // 'off':            → Never record
    //
    // Videos are great for debugging complex failures — you can watch exactly
    // what happened in the browser step by step.
    video: 'on-first-retry',

    // ------------------------------------------------------------------------
    // TRACES (Playwright Inspector recordings)
    // ------------------------------------------------------------------------
    // A "trace" is a detailed recording of all browser actions, network
    // requests, screenshots at each step, and console logs.
    //
    // 'on-first-retry' → Record trace only when retrying a failed test
    //
    // View traces with: npx playwright show-trace trace.zip
    trace: 'on-first-retry',

    // ------------------------------------------------------------------------
    // BROWSER VIEWPORT SIZE
    // ------------------------------------------------------------------------
    // The size of the browser window for tests.
    // Controlled by VIEWPORT_WIDTH and VIEWPORT_HEIGHT in .env.
    // Default: 1280x720 (common desktop resolution).
    viewport: {
      width:  parseInt(process.env['VIEWPORT_WIDTH']  ?? '1280', 10),
      height: parseInt(process.env['VIEWPORT_HEIGHT'] ?? '720',  10),
    },

    // ------------------------------------------------------------------------
    // ACTION TIMEOUT
    // ------------------------------------------------------------------------
    // Maximum time for a single ACTION (click, fill, etc.) before it times out.
    // Controlled by ACTION_TIMEOUT in .env (default: 10000 = 10 seconds).
    actionTimeout: parseInt(process.env['ACTION_TIMEOUT'] ?? '10000', 10),

    // ------------------------------------------------------------------------
    // NAVIGATION TIMEOUT
    // ------------------------------------------------------------------------
    // Maximum time to wait for a page navigation (page.goto(), page.click() that
    // triggers navigation, etc.) to complete.
    // Controlled by NAVIGATION_TIMEOUT in .env (default: 30000 = 30 seconds).
    navigationTimeout: parseInt(process.env['NAVIGATION_TIMEOUT'] ?? '30000', 10),
  },

  // ==========================================================================
  // BROWSER PROJECTS
  // ==========================================================================
  // Define which browsers to run tests on.
  // Each "project" is a separate browser configuration.
  // Tests will be run in EACH project unless you specify otherwise.
  //
  // To run only specific browsers:
  //   npx playwright test --project=chromium
  //   npx playwright test --project=firefox
  projects: [
    {
      // -----------------------------------------------------------------------
      // PROJECT 1: Chromium (Google Chrome / Microsoft Edge engine)
      // Run with: npm test  OR  npm run test:chromium
      // -----------------------------------------------------------------------
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },

    // -----------------------------------------------------------------------
    // PROJECT 2: Firefox — uncomment to run cross-browser tests
    // Run with: npm run test:firefox
    // -----------------------------------------------------------------------
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // -----------------------------------------------------------------------
    // PROJECT 3: WebKit (Safari) — uncomment for Safari testing
    // Run with: npm run test:webkit
    // -----------------------------------------------------------------------
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    // -----------------------------------------------------------------------
    // PROJECT 4: Mobile Chrome — uncomment for mobile testing
    // -----------------------------------------------------------------------
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },

    // -----------------------------------------------------------------------
    // PROJECT 5: Mobile Safari — uncomment for iPhone testing
    // -----------------------------------------------------------------------
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 14'] },
    // },
  ],

  // ==========================================================================
  // OUTPUT DIRECTORY
  // ==========================================================================
  // Where to save test artifacts (screenshots, videos, traces).
  // Each test run creates a folder inside test-results/
  outputDir: 'test-results/',
});
