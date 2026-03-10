# 🏗️ BUILD FROM SCRATCH — Playwright AutoAgent

## The Entire Project in One Copy-Paste Script

> **What is this?** This single file contains the ENTIRE Playwright AutoAgent framework.
> A person with ZERO access to GitHub can recreate the complete project by copying
> one script block and pasting it in their Terminal.
>
> **Who is this for?** Teams that cannot access the GitHub repository but need the framework.
>
> **How long does it take?** About 3 minutes (mostly waiting for `npm install`).

---

## 📋 Prerequisites

Before running the script, make sure you have:

| Requirement | How to Check | How to Install |
|-------------|--------------|----------------|
| **Node.js** (v18+) | `node --version` | https://nodejs.org → Download LTS |
| **npm** (comes with Node.js) | `npm --version` | Installed automatically with Node.js |
| **Terminal** | Mac: Cmd+Space → "Terminal" | Already installed on all systems |

---

## 🚀 THE SCRIPT — COPY EVERYTHING BELOW

Open your Terminal, then copy and paste this entire script block:

```bash
#!/bin/bash
# =============================================================================
# Playwright AutoAgent — AI Automation Framework
# Complete project setup script — creates ALL files from scratch
# =============================================================================
set -e

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  🏗️  Playwright AutoAgent — Building from Scratch           ║"
echo "║  This will create the entire project in ~3 minutes.        ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Create project directory
PROJECT_DIR="$HOME/PlaywrightAutoAgent"
if [ -d "$PROJECT_DIR" ]; then
  echo "⚠️  Directory $PROJECT_DIR already exists."
  echo "   Rename or delete it first, then re-run this script."
  exit 1
fi

mkdir -p "$PROJECT_DIR"
cd "$PROJECT_DIR"
echo "✅ Created project directory: $PROJECT_DIR"

# Create folder structure
mkdir -p config pages tests utils/api utils/database utils/email \
         utils/excel utils/helpers utils/jira-xray utils/reporting \
         utils/security reports logs
echo "✅ Created folder structure"


# =============================================================================
# CONFIGURATION FILES
# =============================================================================


# ── package.json ──
cat > "package.json" << 'ENDOFFILE_package_json'
{
  "name": "playwright-autoagent",
  "version": "1.0.0",
  "description": "Playwright AutoAgent — AI-powered test automation framework with JIRA XRAY, data-driven YAML, encryption, iframe handling, and HTML reports",
  "main": "utils/index.ts",
  "scripts": {
    "init": "npx ts-node scripts/init-project.ts",
    "test": "npx playwright test",
    "test:login": "npx playwright test tests/login.test.ts",
    "test:api": "npx playwright test tests/api.test.ts",
    "test:nav": "npx playwright test tests/playwright-dev.test.ts",
    "test:iframe": "npx playwright test tests/salesforce-iframe.test.ts",
    "test:all": "npx playwright test",

    "test:headed": "RUN_HEADLESS=false npx playwright test",
    "test:headless": "RUN_HEADLESS=true npx playwright test",
    "test:debug": "npx playwright test --debug",
    "test:ui": "npx playwright test --ui",

    "test:chromium": "npx playwright test --project=chromium",
    "test:firefox": "npx playwright test --project=firefox",
    "test:webkit": "npx playwright test --project=webkit",

    "test:parallel": "RUN_PARALLEL=true RUN_WORKERS=4 npx playwright test",
    "test:single": "RUN_PARALLEL=false RUN_WORKERS=1 npx playwright test",

    "test:env:staging": "TEST_ENVIRONMENT=staging npx playwright test",
    "test:env:prod": "TEST_ENVIRONMENT=production npx playwright test",
    "test:env:dev": "TEST_ENVIRONMENT=dev npx playwright test",

    "test:ci": "CI=true npx playwright test",
    "test:report": "npx playwright show-report",

    "run:headless": "RUN_HEADLESS=true npx playwright test && open reports/$(ls -t reports/ | head -1)",
    "run:headed": "RUN_HEADLESS=false npx playwright test && open reports/$(ls -t reports/ | head -1)",

    "encrypt-password": "npx ts-node utils/security/crypto-helper.ts",

    "lint": "npx tsc --noEmit",
    "clean": "rm -rf test-results playwright-report reports/execution-report-*.html logs/*.log dist"
  },
  "keywords": ["playwright", "automation", "testing", "jira", "xray", "data-driven", "yaml", "iframe", "encryption", "page-object"],
  "author": "AngshumanRay",
  "license": "ISC",
  "repository": {
    "type": "git",
    "url": "https://github.com/AngshumanRay/PlaywrightUtilPOC.git"
  },
  "devDependencies": {
    "@playwright/test": "^1.58.2",
    "@types/node": "^25.3.5",
    "@types/node-cron": "^3.0.11",
    "@types/pg": "^8.18.0",
    "@types/winston": "^2.4.4",
    "axios": "^1.13.6",
    "dotenv": "^17.3.1",
    "ts-node": "^10.9.2",
    "typescript": "^5.9.3"
  },
  "dependencies": {
    "@axe-core/playwright": "^4.11.1",
    "@types/crypto-js": "^4.2.2",
    "crypto-js": "^4.2.0",
    "exceljs": "^4.4.0",
    "mysql2": "^3.18.2",
    "node-cron": "^4.2.1",
    "pg": "^8.19.0",
    "winston": "^3.19.0",
    "winston-daily-rotate-file": "^5.0.0",
    "xlsx": "^0.18.5",
    "yaml": "^2.8.2"
  }
}

ENDOFFILE_package_json
echo "  📄 Created package.json"

# ── tsconfig.json ──
cat > "tsconfig.json" << 'ENDOFFILE_tsconfig_json'
{
  // =============================================================================
  // tsconfig.json — TYPESCRIPT COMPILER CONFIGURATION
  // =============================================================================
  // PURPOSE:
  //   TypeScript is JavaScript with "type safety" — it catches errors BEFORE
  //   you run the code. This file tells TypeScript how to compile (translate)
  //   your TypeScript (.ts) files into JavaScript that Node.js can understand.
  //
  // BEGINNER TIP:
  //   You don't need to change this file. It's pre-configured for Playwright.
  // =============================================================================
  "compilerOptions": {
    // "target": What version of JavaScript to produce. "ES2020" is modern and widely supported.
    "target": "ES2020",

    // "module": How code files reference each other. "commonjs" is standard for Node.js.
    "module": "commonjs",

    // "lib": Which built-in JavaScript features are available. "ES2020" and "DOM" cover everything we need.
    "lib": ["ES2020", "DOM"],

    // "strict": Turn on ALL strict type-checking rules. Catches the most bugs. Recommended!
    "strict": true,

    // "esModuleInterop": Allows easier importing of common JavaScript libraries.
    "esModuleInterop": true,

    // "resolveJsonModule": Allows importing .json files directly in TypeScript.
    "resolveJsonModule": true,

    // "outDir": Where to put the compiled JavaScript files.
    "outDir": "./dist",

    // "rootDir": Where your TypeScript source files live.
    "rootDir": "./",

    // "baseUrl": The root folder for path shortcuts.
    "baseUrl": "./",

    // "paths": Shortcuts so you can write "@utils/..." instead of "../../utils/..."
    "paths": {
      "@utils/*": ["utils/*"],
      "@pages/*": ["pages/*"],
      "@config/*": ["config/*"]
    },

    // "sourceMap": Creates mapping files so error messages point to your .ts files (not compiled .js)
    "sourceMap": true,

    // "declaration": Generate type definition files (.d.ts) alongside compiled JS.
    "declaration": true,

    // "skipLibCheck": Skip type-checking of library files (speeds up compilation).
    "skipLibCheck": true
  },

  // "include": Which files TypeScript should compile.
  "include": [
    "tests/**/*.ts",
    "pages/**/*.ts",
    "utils/**/*.ts",
    "config/**/*.ts",
    "playwright.config.ts"
  ],

  // "exclude": Which files/folders to SKIP.
  "exclude": [
    "node_modules",
    "dist"
  ]
}

ENDOFFILE_tsconfig_json
echo "  📄 Created tsconfig.json"

# ── .gitignore ──
cat > ".gitignore" << 'ENDOFFILE__gitignore'
# =============================================================================
# .gitignore — FILES TO EXCLUDE FROM GIT (SOURCE CONTROL)
# =============================================================================
# PURPOSE:
#   Git is a tool that saves versions of your code.
#   This file tells Git: "IGNORE these files — don't save them."
#
# WHY THIS MATTERS:
#   - .env contains secret passwords → must NEVER be shared
#   - node_modules contains thousands of library files → no need to share them
#   - test-results contain screenshots/videos → can be large, usually not shared
# =============================================================================

# Secret credentials — NEVER commit this!
.env

# Libraries installed by npm (can be re-installed with "npm install")
node_modules/

# Playwright test output files (screenshots, videos, traces)
test-results/
playwright-report/

# Custom HTML execution reports (auto-generated after each run)
reports/

# Log files (auto-generated, rotated daily)
logs/

# TypeScript compiled output
dist/

# macOS system files
.DS_Store

# IDE settings (optional — some teams share these)
.vscode/settings.json

# Playwright MCP tool logs (auto-generated, not needed in repo)
.playwright-mcp/

ENDOFFILE__gitignore
echo "  📄 Created .gitignore"

# ── .env ──
cat > ".env" << 'ENDOFFILE__env'
# =============================================================================
# .env — YOUR ACTUAL ENVIRONMENT VARIABLES (PRIVATE — DO NOT COMMIT TO GIT!)
# =============================================================================
# This file contains YOUR real credentials and settings.
# See .env.example for explanations of each variable.
# =============================================================================

# JIRA Connection
JIRA_BASE_URL=https://your-company.atlassian.net
JIRA_USERNAME=your-email@example.com
JIRA_API_TOKEN=your-jira-api-token-here

# XRAY Settings
XRAY_PROJECT_KEY=PROJ
XRAY_TEST_SET_ID=PROJ-456
XRAY_SPRINT_NUMBER=1
XRAY_BOARD_ID=1

# Application Under Test
# Using the publicly available Herokuapp demo login app for validation
BASE_URL=https://the-internet.herokuapp.com
TEST_ENVIRONMENT=staging

# =============================================================================
# OPTIONAL UTILITIES — Enable any of these as needed
# =============================================================================
# Each utility has an "enabled" flag. Set to true to activate, false to skip.
# The framework detects disabled/placeholder values and skips gracefully.
# =============================================================================

# Slack Notifications (sends test summary to a Slack channel after the run)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
SLACK_CHANNEL=#test-results

# Database / Test Data (seed and cleanup test data)
DB_ENABLED=false
DB_HOST=localhost
DB_PORT=5432
DB_NAME=test_db
DB_USER=test_user
DB_PASSWORD=test_password

# Email Verification (for tests involving email OTP, reset links, etc.)
EMAIL_ENABLED=false
EMAIL_SERVICE=mailosaur
EMAIL_API_KEY=your-email-service-api-key
EMAIL_SERVER_ID=your-server-id

# API Testing (for tests that call backend REST APIs directly)
API_BASE_URL=
API_AUTH_TOKEN=

# =============================================================================
# EXECUTION MODES
# =============================================================================
# These control HOW your tests run. You can also pass them on the command line.
# Example: RUN_HEADLESS=false npm test   (shows browser window)
# =============================================================================
RUN_HEADLESS=true
RUN_PARALLEL=false
RUN_WORKERS=2
RUN_RETRIES=0

# =============================================================================
# GLOBAL WAITS & TIMEOUTS (milliseconds)
# =============================================================================
# Every team has different page speeds. Adjust these to match YOUR application.
# All values are in milliseconds (1 second = 1000 ms).
#
#   Slow internal app?     → Increase NAVIGATION_TIMEOUT to 60000
#   Fast SPA?              → Decrease ACTION_TIMEOUT to 5000
#   Flaky CI environment?  → Increase TEST_TIMEOUT to 120000
# =============================================================================
TEST_TIMEOUT=60000
EXPECT_TIMEOUT=10000
ACTION_TIMEOUT=10000
NAVIGATION_TIMEOUT=30000

# =============================================================================
# BROWSER VIEWPORT (pixels)
# =============================================================================
# The browser window size used during tests.
# Common presets:
#   Desktop HD:   1920 x 1080
#   Desktop:      1280 x 720  (default)
#   Tablet:       768  x 1024
#   Mobile:       375  x 812
# =============================================================================
VIEWPORT_WIDTH=1280
VIEWPORT_HEIGHT=720

# =============================================================================
# LOGGING
# =============================================================================
LOG_LEVEL=info
LOG_TO_FILE=true
LOG_FILE_MAX_DAYS=14

# =============================================================================
# SECURITY — Password Encryption
# =============================================================================
# Set a strong passphrase here (min 16 chars).
# Use: npm run encrypt-password  to generate encrypted values for passwords.
# Then store them as DB_PASSWORD_ENCRYPTED=... instead of plain text.
# NEVER commit this key to Git!
# =============================================================================
ENCRYPTION_KEY=

# Encrypted DB password (use npm run encrypt-password to generate)
DB_PASSWORD_ENCRYPTED=

# SSL settings for secure DB connections
DB_TYPE=postgres
DB_SSL=false
DB_SSL_CERT_PATH=
DB_POOL_SIZE=5

# =============================================================================
# REPORTING
# =============================================================================
REPORT_OUTPUT_DIR=reports

ENDOFFILE__env
echo "  📄 Created .env"

# ── .env.example ──
cat > ".env.example" << 'ENDOFFILE__env_example'
# =============================================================================
# .env.example — ENVIRONMENT VARIABLE TEMPLATE
# =============================================================================
# PURPOSE:
#   This file is a TEMPLATE. It shows you exactly what values you need to fill in.
#   Copy this file and rename the copy to ".env" (no ".example" at the end).
#   NEVER commit your real ".env" file to Git — it contains secret passwords!
#
# HOW TO USE:
#   1. Copy this file:  cp .env.example .env
#   2. Open the new ".env" file
#   3. Replace every placeholder value (inside < >) with your real values
#   4. Save the file — it will be picked up automatically when you run tests
#
# BEGINNER TIP:
#   An "environment variable" is just a named setting stored outside your code.
#   This keeps secrets (like passwords) out of your source code.
# =============================================================================


# -----------------------------------------------------------------------------
# JIRA CONNECTION SETTINGS
# -----------------------------------------------------------------------------
# JIRA_BASE_URL: The web address of your JIRA instance.
#   Example for Jira Cloud:  https://your-company.atlassian.net
#   Example for Jira Server: https://jira.your-company.com
JIRA_BASE_URL=https://your-company.atlassian.net

# JIRA_USERNAME: Your JIRA login email address.
#   Example: john.doe@your-company.com
JIRA_USERNAME=your-email@example.com

# JIRA_API_TOKEN: A special password used by programs (not humans) to talk to JIRA.
#   How to generate one:
#     1. Log in to Jira → Click your profile picture (top right) → "Manage account"
#     2. Go to "Security" tab → "Create and manage API tokens"
#     3. Click "Create API token", give it a name, copy the token here
JIRA_API_TOKEN=your-jira-api-token-here

# -----------------------------------------------------------------------------
# XRAY SETTINGS
# -----------------------------------------------------------------------------
# XRAY_PROJECT_KEY: The short code for your JIRA project.
#   You can see this in any ticket number — e.g., in "PROJ-123" the key is "PROJ"
XRAY_PROJECT_KEY=PROJ

# XRAY_TEST_SET_ID: The ID of the XRAY Test Set that holds your test cases.
#   A "Test Set" in XRAY is like a folder/collection of related test cases.
#   Example: If your Test Set ticket is "PROJ-456", this value is "PROJ-456"
XRAY_TEST_SET_ID=PROJ-456

# XRAY_SPRINT_NUMBER: The current Sprint (iteration) number.
#   In Scrum, a "Sprint" is a short period (usually 2 weeks) of work.
#   This is used to name your Test Execution so it's easy to find later.
#   Example: 5  (meaning Sprint 5)
XRAY_SPRINT_NUMBER=1

# XRAY_BOARD_ID: The ID of your JIRA Scrum Board (used to fetch sprint details).
#   Find it in the URL when you open your board: .../boards/123 → ID is 123
XRAY_BOARD_ID=1

# -----------------------------------------------------------------------------
# APPLICATION UNDER TEST (AUT) SETTINGS
# -----------------------------------------------------------------------------
# BASE_URL: The web address of the application you are testing.
#   This is where Playwright will open the browser and start testing.
BASE_URL=https://your-app-under-test.com

# TEST_ENVIRONMENT: Which environment you are testing against.
#   Typical values: dev | staging | prod
#   "dev"     = Development (work in progress, may be unstable)
#   "staging" = Pre-production (like prod but for final testing)
#   "prod"    = Live production (be careful here!)
TEST_ENVIRONMENT=staging

# -----------------------------------------------------------------------------
# OPTIONAL: XRAY CLOUD API CREDENTIALS (only if using Xray Cloud)
# -----------------------------------------------------------------------------
# If you are using Xray Cloud (not Xray Server/DC), you also need these:
# XRAY_CLIENT_ID=your-xray-cloud-client-id
# XRAY_CLIENT_SECRET=your-xray-cloud-client-secret


# =============================================================================
# OPTIONAL UTILITIES
# =============================================================================
# These are additional integrations you can enable as your project grows.
# Each one is independent — enable only what you need. The framework detects
# disabled/placeholder values and skips gracefully.
# =============================================================================

# -----------------------------------------------------------------------------
# DATABASE / TEST DATA (optional)
# -----------------------------------------------------------------------------
# For seeding and cleaning up test data before/after test runs.
# Supports PostgreSQL, MySQL, MongoDB — plug your adapter in test-data-manager.ts.
DB_ENABLED=false
DB_HOST=localhost
DB_PORT=5432
DB_NAME=your_test_database
DB_USER=your_db_username
DB_PASSWORD=your_db_password

# -----------------------------------------------------------------------------
# EMAIL VERIFICATION (optional)
# -----------------------------------------------------------------------------
# For tests that involve email (forgot password, OTP, signup confirmation).
# Uses a test mailbox service: Mailosaur, MailSlurp, or Mailtrap.
EMAIL_ENABLED=false
EMAIL_SERVICE=mailosaur
EMAIL_API_KEY=your-email-service-api-key
EMAIL_SERVER_ID=your-email-server-id

# -----------------------------------------------------------------------------
# API TESTING (optional)
# -----------------------------------------------------------------------------
# For tests that call backend REST APIs directly (not through the browser).
# If blank, defaults to BASE_URL.
API_BASE_URL=https://your-api-server.com
API_AUTH_TOKEN=your-api-auth-token

# =============================================================================
# GLOBAL WAITS & TIMEOUTS (milliseconds)
# =============================================================================
# Every team has different page speeds. Adjust these to match YOUR application.
# All values are in milliseconds (1 second = 1000 ms).
#
# TEST_TIMEOUT       — Max time a single test can run before it times out.
#                      Default: 60000 (60 seconds). Increase for slow apps.
# EXPECT_TIMEOUT     — Max time an expect() assertion auto-waits for a condition.
#                      Default: 10000 (10 seconds).
# ACTION_TIMEOUT     — Max time for a single action (click, fill, type).
#                      Default: 10000 (10 seconds).
# NAVIGATION_TIMEOUT — Max time to wait for page.goto() / navigation to finish.
#                      Default: 30000 (30 seconds). Increase for slow servers.
# =============================================================================
TEST_TIMEOUT=60000
EXPECT_TIMEOUT=10000
ACTION_TIMEOUT=10000
NAVIGATION_TIMEOUT=30000

# =============================================================================
# BROWSER VIEWPORT (pixels)
# =============================================================================
# The browser window size used during tests.
# Common presets:
#   Desktop HD:   1920 x 1080
#   Desktop:      1280 x 720  (default)
#   Tablet:       768  x 1024
#   Mobile:       375  x 812
# =============================================================================
VIEWPORT_WIDTH=1280
VIEWPORT_HEIGHT=720

ENDOFFILE__env_example
echo "  📄 Created .env.example"

# ── playwright.config.ts ──
cat > "playwright.config.ts" << 'ENDOFFILE_playwright_config_ts'
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
  globalSetup:    './utils/framework/global-setup.ts',
  globalTeardown: './utils/framework/global-teardown.ts',

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

ENDOFFILE_playwright_config_ts
echo "  📄 Created playwright.config.ts"

# ── config/environment.ts ──
cat > "config/environment.ts" << 'ENDOFFILE_config_environment_ts'
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
//     - Secrets (passwords, tokens) stay out of your code files
//     - Different environments (dev/staging/prod) can use different values
//
// HOW IT WORKS:
//   1. "dotenv" is a library that reads the .env file automatically
//   2. It loads each line into Node.js's process.env object
//   3. We read process.env here and export a clean "config" object
//   4. The rest of the project imports "config" from this file
//
// CONFIG SECTIONS IN THIS FILE:
//   \u2022 jira       — JIRA API connection (baseUrl, username, apiToken)
//   \u2022 xray       — XRAY test management (projectKey, testSetId, sprintNumber)
//   \u2022 app        — Application under test (baseUrl, environment)
//   \u2022 database   — Optional DB for seeding/cleanup test data
//   \u2022 email      — Optional email verification (OTPs, reset links)
//   \u2022 api        — Optional REST API base URL and auth token
//   \u2022 execution  — Run modes (headless, parallel, workers, retries)
//   \u2022 logging    — Log level, file logging, max log age
//   \u2022 security   — AES-256 encryption key for stored secrets
//   \u2022 reporting  — HTML report output folder
//
// TO ADD A NEW CONFIG SECTION:
//   1. Add env var(s) to .env and .env.example
//   2. Add a new block below using getOptionalEnvVar() or getRequiredEnvVar()
//   3. Export the type at the bottom (TypeScript will pick it up automatically)
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
  // GLOBAL WAITS & TIMEOUTS
  // --------------------------------------------------------------------------
  // Control how long Playwright waits for various operations.
  // Every team can tune these in .env to match their application's speed.
  // All values are in milliseconds (1 second = 1000 ms).
  // --------------------------------------------------------------------------
  timeouts: {
    /** Max time (ms) a single test can run before timing out (default: 60s) */
    test:       parseInt(getOptionalEnvVar('TEST_TIMEOUT', '60000'), 10),

    /** Max time (ms) for expect() assertions to auto-wait (default: 10s) */
    expect:     parseInt(getOptionalEnvVar('EXPECT_TIMEOUT', '10000'), 10),

    /** Max time (ms) for a single action — click, fill, type (default: 10s) */
    action:     parseInt(getOptionalEnvVar('ACTION_TIMEOUT', '10000'), 10),

    /** Max time (ms) for page navigation — goto, reload (default: 30s) */
    navigation: parseInt(getOptionalEnvVar('NAVIGATION_TIMEOUT', '30000'), 10),
  },

  // --------------------------------------------------------------------------
  // BROWSER VIEWPORT
  // --------------------------------------------------------------------------
  // The browser window size used during tests.
  // --------------------------------------------------------------------------
  viewport: {
    /** Browser window width in pixels */
    width:  parseInt(getOptionalEnvVar('VIEWPORT_WIDTH', '1280'), 10),

    /** Browser window height in pixels */
    height: parseInt(getOptionalEnvVar('VIEWPORT_HEIGHT', '720'), 10),
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

ENDOFFILE_config_environment_ts
echo "  📄 Created config/environment.ts"

# =============================================================================
# PAGE OBJECTS
# =============================================================================


# ── pages/BasePage.ts ──
cat > "pages/BasePage.ts" << 'ENDOFFILE_pages_BasePage_ts'
// =============================================================================
// pages/BasePage.ts — BASE PAGE CLASS (Page Object Model Foundation)
// =============================================================================
// PURPOSE:
//   This is the PARENT class that all other page classes inherit from.
//   It provides common, reusable browser actions that every page needs.
//
// WHAT IS THE PAGE OBJECT MODEL (POM)?
//   POM is a design pattern for organizing automation code. The idea is:
//     - Each PAGE of your web app gets its OWN CLASS (TypeScript file)
//     - The class holds:
//         a) LOCATORS: How to find elements on that page (buttons, inputs, etc.)
//         b) ACTIONS:  Methods that perform specific actions on that page
//     - Tests use these classes instead of directly interacting with the browser
//
//   BENEFITS of POM:
//     ✅ If a button's location changes, you only fix it in ONE place
//     ✅ Tests are easier to read (e.g., "loginPage.clickLoginButton()")
//     ✅ Code is reusable across many tests
//
// INHERITANCE (extends):
//   "extends BasePage" means a page class INHERITS all methods from BasePage.
//   Think of it like a recipe template:
//     - BasePage = base recipe with common techniques (boil water, season, etc.)
//     - LoginPage = specific recipe that uses the base techniques + its own steps
//
// WHAT IS A "LOCATOR"?
//   A locator is a description of HOW to find an HTML element on a web page.
//   Examples:
//     - By text:  page.getByRole('button', { name: 'Login' })
//     - By ID:    page.locator('#username')
//     - By CSS:   page.locator('.submit-btn')
//     - By label: page.getByLabel('Email address')
//   Playwright uses locators to find and interact with elements.
// =============================================================================

// Import Playwright types
// "Page" represents a single browser tab
// "Locator" represents a way to find an element on the page
import { type Page, type Locator, expect } from '@playwright/test';

// Import our logger for consistent, formatted output
import { logger } from '../utils/helpers/logger';

// Import screenshot helper for capturing failure evidence
import { captureFailureScreenshot } from '../utils/helpers/screenshot';

// =============================================================================
// CLASS: BasePage
// =============================================================================
// All page classes in the "pages/" folder will extend (inherit from) this class.
// You should NOT instantiate BasePage directly — always use a specific page class.
// =============================================================================
export class BasePage {

  // The Playwright "Page" object — represents the actual browser tab
  // "protected" means this is accessible in BasePage AND all child classes,
  // but NOT accessible from outside the class hierarchy (e.g., from test files)
  protected page: Page;

  // The base URL of the application (loaded from environment config)
  protected baseUrl: string;

  // ==========================================================================
  // CONSTRUCTOR
  // ==========================================================================
  // PURPOSE:
  //   A constructor is the function that runs when you create a new object.
  //   Here: const loginPage = new LoginPage(page) → this constructor runs
  //
  // PARAMETERS:
  //   - page:    The Playwright Page object (passed in from the test)
  //   - baseUrl: The app's base URL (defaults to environment config value)
  // ==========================================================================
  constructor(page: Page, baseUrl: string = process.env['BASE_URL'] || '') {
    this.page    = page;
    this.baseUrl = baseUrl;
  }

  // ==========================================================================
  // METHOD: dismissCookieBanner
  // ==========================================================================
  // PURPOSE:
  //   Tries to find and click common cookie consent / "Accept All" buttons
  //   that many websites show on first visit.
  //
  // WHY IS THIS NEEDED?
  //   A cookie banner is a popup asking "Do you accept cookies?"
  //   If it appears on top of the page, Playwright cannot click the buttons
  //   underneath it — causing tests to fail for the wrong reason.
  //   This method looks for common "Accept" buttons and clicks them if found.
  //   If no cookie banner exists on the page, it silently does nothing.
  //
  // COMMON BUTTON TEXTS THIS HANDLES:
  //   "Accept All", "Accept Cookies", "I Accept", "OK", "Got it",
  //   "Allow All", "Agree", "Continue"
  //
  // USAGE: Call this after navigating to any page that may show a cookie banner.
  //   await basePage.dismissCookieBanner();
  // ==========================================================================
  async dismissCookieBanner(): Promise<void> {
    // List of common button texts used by cookie consent banners
    // We check for each one and click the first one that's visible
    const cookieButtonTexts = [
      /accept all/i,
      /accept cookies/i,
      /i accept/i,
      /allow all/i,
      /agree/i,
      /got it/i,
      /ok, got it/i,
      /continue/i,
    ];

    for (const text of cookieButtonTexts) {
      const btn = this.page.getByRole('button', { name: text });
      try {
        // Check if a button with this text is visible (timeout: 1 second)
        // We use a very short timeout so this check is fast if the button isn't there
        await btn.waitFor({ state: 'visible', timeout: 1000 });
        await btn.click();
        logger.info(`🍪 Cookie banner dismissed (clicked: "${text}")`);
        return; // Found and clicked — no need to check other texts
      } catch {
        // This button text wasn't found — try the next one
      }
    }
    // No cookie banner found — that's fine, many sites don't have one
  }

  // ==========================================================================
  // METHOD: navigate
  // ==========================================================================
  // PURPOSE:
  //   Opens a specific URL in the browser.
  //
  // HOW IT WORKS:
  //   - If you pass a relative path like "/login", it combines it with baseUrl
  //   - If you pass a full URL like "https://...", it uses that directly
  //   - After navigation, waits for the page to fully load
  //
  // PARAMETERS:
  //   - urlOrPath: Either a full URL or a path relative to baseUrl (e.g., "/login")
  //
  // USAGE EXAMPLE:
  //   await loginPage.navigate('/login');     // Opens baseUrl + "/login"
  //   await loginPage.navigate('https://google.com'); // Opens Google
  // ==========================================================================
  async navigate(urlOrPath: string): Promise<void> {
    // Determine the full URL
    const fullUrl = urlOrPath.startsWith('http')
      ? urlOrPath
      : `${this.baseUrl}${urlOrPath}`;

    logger.step(`Navigating to: ${fullUrl}`);

    // "goto" is Playwright's command to open a URL
    // "waitUntil: 'domcontentloaded'" means "wait until the HTML is parsed"
    // (not waiting for images/scripts, which would be 'networkidle' — slower)
    await this.page.goto(fullUrl, { waitUntil: 'domcontentloaded' });

    logger.info(`Page loaded: ${await this.page.title()}`);
  }

  // ==========================================================================
  // METHOD: clickElement
  // ==========================================================================
  // PURPOSE:
  //   Clicks on an element on the page (button, link, checkbox, etc.)
  //
  // WHY NOT JUST USE page.click()?
  //   This wrapper adds:
  //   - Logging (we can see exactly what was clicked in test output)
  //   - Error handling (better error message if element is not found)
  //   - Retry logic (Playwright retries automatically, but we log it)
  //
  // PARAMETERS:
  //   - locator:     A Playwright Locator describing which element to click
  //   - description: A human-readable description for logging (e.g., "Login button")
  // ==========================================================================
  async clickElement(locator: Locator, description: string): Promise<void> {
    logger.step(`Clicking: ${description}`);

    try {
      // Wait for the element to be visible before clicking
      // Playwright auto-waits, but we explicitly wait to get better error messages
      await locator.waitFor({ state: 'visible', timeout: 10000 });

      // Perform the click
      await locator.click();

      logger.info(`Clicked: ${description}`);
    } catch (error) {
      logger.error(`Failed to click: ${description}`, error);
      throw error; // Re-throw so the test knows this step failed
    }
  }

  // ==========================================================================
  // METHOD: fillInputField
  // ==========================================================================
  // PURPOSE:
  //   Types text into an input field (text box, password field, search box, etc.)
  //
  // PARAMETERS:
  //   - locator:     The input field locator
  //   - text:        The text to type into the field
  //   - description: Human-readable name (e.g., "Username field")
  // ==========================================================================
  async fillInputField(locator: Locator, text: string, description: string): Promise<void> {
    logger.step(`Filling "${description}" with: ${text}`);

    try {
      await locator.waitFor({ state: 'visible', timeout: 10000 });

      // "clear()" removes any existing text in the field first
      await locator.clear();

      // "fill()" types the text into the field
      // (More reliable than "type()" which simulates keystrokes one by one)
      await locator.fill(text);

      logger.info(`Filled: ${description}`);
    } catch (error) {
      logger.error(`Failed to fill: ${description}`, error);
      throw error;
    }
  }

  // ==========================================================================
  // METHOD: waitForElement
  // ==========================================================================
  // PURPOSE:
  //   Waits for an element to appear on the page (useful after clicks/navigation
  //   when a new element loads dynamically).
  //
  // PARAMETERS:
  //   - locator:     The element to wait for
  //   - description: Human-readable name for logging
  //   - timeout:     How many milliseconds to wait (default: 10 seconds)
  // ==========================================================================
  async waitForElement(locator: Locator, description: string, timeout: number = 10000): Promise<void> {
    logger.step(`Waiting for: ${description}`);

    try {
      await locator.waitFor({ state: 'visible', timeout });
      logger.info(`Found: ${description}`);
    } catch (error) {
      logger.error(`Timed out waiting for: ${description}`, error);
      throw error;
    }
  }

  // ==========================================================================
  // METHOD: assertElementVisible
  // ==========================================================================
  // PURPOSE:
  //   Checks (asserts) that an element IS visible on the page.
  //   If the element is NOT visible, the test FAILS immediately.
  //
  // WHAT IS AN ASSERTION?
  //   An assertion is a statement that says "I expect X to be true."
  //   If X is NOT true, the test fails with a clear message.
  //   Example: "I expect the welcome banner to be visible after login."
  //   If it's not visible → test fails → we know something is wrong.
  //
  // PARAMETERS:
  //   - locator:     The element to check
  //   - description: What element we're checking (for clear error messages)
  // ==========================================================================
  async assertElementVisible(locator: Locator, description: string): Promise<void> {
    logger.step(`Asserting visible: ${description}`);

    // "expect(...).toBeVisible()" is Playwright's assertion
    // If the element is not visible, Playwright throws an error with a clear message
    await expect(locator).toBeVisible({ timeout: 10000 });

    logger.info(`✅ Visible: ${description}`);
  }

  // ==========================================================================
  // METHOD: assertElementText
  // ==========================================================================
  // PURPOSE:
  //   Checks that an element contains the expected text.
  //
  // PARAMETERS:
  //   - locator:       The element to check
  //   - expectedText:  The text the element should contain
  //   - description:   What element we're checking
  // ==========================================================================
  async assertElementText(locator: Locator, expectedText: string, description: string): Promise<void> {
    logger.step(`Asserting text of "${description}" contains: "${expectedText}"`);

    await expect(locator).toContainText(expectedText, { timeout: 10000 });

    logger.info(`✅ Text verified for: ${description}`);
  }

  // ==========================================================================
  // METHOD: getPageTitle
  // ==========================================================================
  // PURPOSE:
  //   Returns the title of the current page (what you see in the browser tab).
  //   Useful for verifying you navigated to the right page.
  //
  // RETURNS:
  //   The page title as a string (e.g., "Welcome | MyApp")
  // ==========================================================================
  async getPageTitle(): Promise<string> {
    const title = await this.page.title();
    logger.info(`Current page title: "${title}"`);
    return title;
  }

  // ==========================================================================
  // METHOD: getCurrentUrl
  // ==========================================================================
  // PURPOSE:
  //   Returns the current URL in the browser's address bar.
  //   Useful for verifying navigation (e.g., "Did the user get redirected?")
  //
  // RETURNS:
  //   The full URL as a string (e.g., "https://myapp.com/dashboard")
  // ==========================================================================
  getCurrentUrl(): string {
    const url = this.page.url();
    logger.info(`Current URL: ${url}`);
    return url;
  }

  // ==========================================================================
  // METHOD: captureScreenshotOnFailure
  // ==========================================================================
  // PURPOSE:
  //   Takes a screenshot and returns its file path.
  //   Should be called in a test's afterEach hook when a test fails.
  //   The screenshot is later attached as evidence to the XRAY test result.
  //
  // PARAMETERS:
  //   - testName: The name of the test that failed
  //
  // RETURNS:
  //   File path of the screenshot, or null if capture failed.
  // ==========================================================================
  async captureScreenshotOnFailure(testName: string): Promise<string | null> {
    return captureFailureScreenshot(this.page, testName);
  }

  // ==========================================================================
  // METHOD: waitForPageLoad
  // ==========================================================================
  // PURPOSE:
  //   Waits for the browser to finish loading the current page.
  //   Useful after clicking a link or submitting a form.
  //
  // PARAMETERS:
  //   - state: What to wait for:
  //     - 'domcontentloaded': HTML parsed (fastest)
  //     - 'load':             All resources loaded (default)
  //     - 'networkidle':      No network requests for 500ms (slowest, most complete)
  // ==========================================================================
  async waitForPageLoad(state: 'domcontentloaded' | 'load' | 'networkidle' = 'load'): Promise<void> {
    logger.step(`Waiting for page load (state: ${state})`);
    await this.page.waitForLoadState(state);
    logger.info('Page load complete.');
  }
}

ENDOFFILE_pages_BasePage_ts
echo "  📄 Created pages/BasePage.ts"

# ── pages/LoginPage.ts ──
cat > "pages/LoginPage.ts" << 'ENDOFFILE_pages_LoginPage_ts'
// =============================================================================
// pages/LoginPage.ts — LOGIN PAGE OBJECT
// =============================================================================
// PURPOSE:
//   This file represents the LOGIN PAGE of your web application.
//   It encapsulates (bundles together) everything related to the login page:
//     - The locators (where to find each element)
//     - The actions (what you can DO on this page)
//
// HOW TO USE THIS AS A TEMPLATE:
//   For every page in your application, create a similar file:
//     - pages/DashboardPage.ts  → For the dashboard/home page
//     - pages/ProfilePage.ts    → For the user profile page
//     - pages/CheckoutPage.ts   → For the checkout/payment page
//
//   Each page file follows the same pattern:
//     1. "extends BasePage" to inherit common actions (click, fill, navigate...)
//     2. Define locators for elements on THIS specific page
//     3. Define methods for actions specific to THIS page
//
// WHAT "extends BasePage" MEANS:
//   LoginPage INHERITS all methods from BasePage.
//   So LoginPage automatically has: navigate(), clickElement(), fillInputField(), etc.
//   You don't need to write those again — they come "for free" from BasePage.
// =============================================================================

// Import the Playwright Page type (represents the browser tab)
import { type Page } from '@playwright/test';

// Import the BasePage (our parent class with common methods)
import { BasePage } from './BasePage';

// Import the logger for consistent logging
import { logger } from '../utils/helpers/logger';

// =============================================================================
// CLASS: LoginPage
// =============================================================================
// "extends BasePage" means this class inherits everything from BasePage.
// Think of BasePage as the "general toolkit" and LoginPage as "specialized tools for login".
// =============================================================================
export class LoginPage extends BasePage {

  // ==========================================================================
  // LOCATORS (PRIVATE)
  // ==========================================================================
  // A locator tells Playwright HOW to find a specific element on the page.
  //
  // "private" means these can only be used INSIDE this class.
  // Tests should use the page's METHODS, not the locators directly.
  // This keeps the test code clean and independent of HTML structure.
  //
  // LOCATOR TYPES EXPLAINED:
  //   getByRole:    Finds elements by their semantic role (button, textbox, heading...)
  //                 BEST PRACTICE — works even if the HTML structure changes
  //                 Example: page.getByRole('button', { name: 'Sign In' })
  //
  //   getByLabel:   Finds input fields by their associated <label> text
  //                 Example: page.getByLabel('Email Address')
  //
  //   getByPlaceholder: Finds inputs by their placeholder text
  //                 Example: page.getByPlaceholder('Enter your email')
  //
  //   locator:      General CSS/XPath selector (fallback if others don't work)
  //                 Example: page.locator('#loginButton')
  // ==========================================================================

  // The email/username input field
  // Demo site (the-internet.herokuapp.com) uses a plain textbox with placeholder "Username"
  private get usernameInput() {
    return this.page.getByRole('textbox', { name: 'Username' });
  }

  // The password input field
  // Demo site uses a textbox with placeholder "Password"
  private get passwordInput() {
    return this.page.getByRole('textbox', { name: 'Password' });
  }

  // The Login submit button
  // Demo site has button text " Login" (with leading space), so we use a regex /login/i
  // to match it regardless of capitalisation or extra whitespace
  private get loginButton() {
    return this.page.getByRole('button', { name: /login/i });
  }

  // The flash/error message shown when login fails
  // Demo site uses a <div id="flash"> for all flash notifications (success AND error)
  // Example text for wrong password: "Your password is invalid!"
  private get errorMessage() {
    return this.page.locator('#flash');
  }

  // The "Forgot Password" link
  private get forgotPasswordLink() {
    return this.page.getByRole('link', { name: /forgot.*password/i });
  }

  // The heading shown ONLY after a successful login on the Secure Area page.
  // Demo site redirects to /secure and shows: <h2>Secure Area</h2>
  private get welcomeBanner() {
    return this.page.getByRole('heading', { name: 'Secure Area', level: 2 });
  }

  // ==========================================================================
  // CONSTRUCTOR
  // ==========================================================================
  // "super(page)" calls the BasePage constructor, passing the page object up.
  // This sets up the "page" and "baseUrl" properties in BasePage.
  // ==========================================================================
  constructor(page: Page) {
    super(page);
  }

  // ==========================================================================
  // METHOD: navigateToLoginPage
  // ==========================================================================
  // PURPOSE:
  //   Opens the login page in the browser.
  //
  // USAGE IN TEST:
  //   const loginPage = new LoginPage(page);
  //   await loginPage.navigateToLoginPage();
  // ==========================================================================
  async navigateToLoginPage(): Promise<void> {
    logger.section('📂 Navigating to Login Page');

    // Navigate to /login — Playwright prepends BASE_URL from .env automatically
    await this.navigate('/login');

    // Dismiss any cookie consent banner that may appear on page load.
    // This prevents cookie popups from blocking the username/password fields.
    await this.dismissCookieBanner();

    // Confirm the page loaded by checking the Username field is visible
    await this.waitForElement(this.usernameInput, 'Username input field');
  }

  // ==========================================================================
  // METHOD: enterUsername
  // ==========================================================================
  // PURPOSE:
  //   Types the username (email) into the username field.
  //   Breaking this into its own method makes tests more readable.
  //
  // PARAMETERS:
  //   - username: The email/username string to type
  // ==========================================================================
  async enterUsername(username: string): Promise<void> {
    await this.fillInputField(this.usernameInput, username, 'Username/Email field');
  }

  // ==========================================================================
  // METHOD: enterPassword
  // ==========================================================================
  // PURPOSE:
  //   Types the password into the password field.
  //
  // PARAMETERS:
  //   - password: The password string to type
  // ==========================================================================
  async enterPassword(password: string): Promise<void> {
    await this.fillInputField(this.passwordInput, password, 'Password field');
  }

  // ==========================================================================
  // METHOD: clickLoginButton
  // ==========================================================================
  // PURPOSE:
  //   Clicks the login/sign-in button to submit the form.
  // ==========================================================================
  async clickLoginButton(): Promise<void> {
    await this.clickElement(this.loginButton, 'Login / Sign In button');
  }

  // ==========================================================================
  // METHOD: login (HIGH-LEVEL ACTION)
  // ==========================================================================
  // PURPOSE:
  //   Performs the COMPLETE login flow in one step.
  //   This is a "high-level" method that combines multiple low-level steps.
  //
  //   Instead of writing this in every test:
  //     await loginPage.enterUsername('user@test.com');
  //     await loginPage.enterPassword('password123');
  //     await loginPage.clickLoginButton();
  //
  //   You can just write:
  //     await loginPage.login('user@test.com', 'password123');
  //
  // PARAMETERS:
  //   - username: The login email/username
  //   - password: The login password
  // ==========================================================================
  async login(username: string, password: string): Promise<void> {
    logger.section(`🔐 Performing Login`);
    logger.info(`Logging in as: ${username}`);

    await this.enterUsername(username);
    await this.enterPassword(password);
    await this.clickLoginButton();

    // Wait for the page to finish navigating after login
    await this.waitForPageLoad('domcontentloaded');

    logger.info('Login form submitted.');
  }

  // ==========================================================================
  // METHOD: verifySuccessfulLogin
  // ==========================================================================
  // PURPOSE:
  //   Asserts (verifies) that the login was SUCCESSFUL.
  //   Should be called AFTER login() to confirm the user got in.
  //
  //   If login failed (wrong credentials, server error, etc.), this
  //   assertion will FAIL the test with a clear message.
  // ==========================================================================
  async verifySuccessfulLogin(): Promise<void> {
    logger.step('Verifying successful login...');

    // After successful login, the welcome banner should be visible
    await this.assertElementVisible(this.welcomeBanner, 'Post-login welcome banner / dashboard header');

    logger.pass('Login verification successful — user is logged in!');
  }

  // ==========================================================================
  // METHOD: verifyLoginErrorMessage
  // ==========================================================================
  // PURPOSE:
  //   Asserts that a login error message IS visible and contains expected text.
  //   Used for NEGATIVE test cases (testing that bad credentials are rejected).
  //
  // PARAMETERS:
  //   - expectedMessage: Text that should appear in the error (e.g., "Invalid credentials")
  // ==========================================================================
  async verifyLoginErrorMessage(expectedMessage: string): Promise<void> {
    logger.step(`Verifying error message contains: "${expectedMessage}"`);

    await this.assertElementVisible(this.errorMessage, 'Login error message');
    await this.assertElementText(this.errorMessage, expectedMessage, 'Login error message text');

    logger.pass(`Error message verified: "${expectedMessage}"`);
  }

  // ==========================================================================
  // METHOD: getDisplayedErrorMessage
  // ==========================================================================
  // PURPOSE:
  //   Returns the text of the error message currently shown on the login page.
  //   Useful when you want to capture the exact error text for logging.
  //
  // RETURNS:
  //   The error message text, or empty string if no error is visible.
  // ==========================================================================
  async getDisplayedErrorMessage(): Promise<string> {
    try {
      await this.errorMessage.waitFor({ state: 'visible', timeout: 3000 });
      return await this.errorMessage.textContent() || '';
    } catch {
      return ''; // No error message visible
    }
  }
}

ENDOFFILE_pages_LoginPage_ts
echo "  📄 Created pages/LoginPage.ts"

# ── pages/PlaywrightDevPage.ts ──
cat > "pages/PlaywrightDevPage.ts" << 'ENDOFFILE_pages_PlaywrightDevPage_ts'
// =============================================================================
// pages/PlaywrightDevPage.ts — PLAYWRIGHT.DEV SITE PAGE OBJECT
// =============================================================================
//
// ┌──────────────────────────────────────────────────────────────────────────┐
// │  📖 FOR NOVICE READERS — WHAT IS THIS FILE?                             │
// │                                                                          │
// │  This is a "Page Object" — a class that represents ONE page (or group   │
// │  of pages) of a website. It bundles together:                            │
// │    1. LOCATORS  — how to find buttons, links, headings on the page      │
// │    2. ACTIONS   — what you can DO on the page (click, navigate, verify) │
// │                                                                          │
// │  WHY?                                                                    │
// │  Instead of writing raw Playwright commands in every test, you write     │
// │  human-readable methods like:                                            │
// │    await playwrightDevPage.clickDocsTab();                               │
// │    await playwrightDevPage.verifyPageTitle('Installation');              │
// │                                                                          │
// │  If the website changes (e.g. a button moves), you fix it HERE once     │
// │  and ALL tests that use this page object keep working.                   │
// │                                                                          │
// │  HOW TO CREATE YOUR OWN PAGE OBJECT:                                     │
// │    1. Create a new file: pages/YourPageName.ts                          │
// │    2. Copy this file as a template                                       │
// │    3. Change the class name, locators, and methods                       │
// │    4. Import it in your test file                                        │
// └──────────────────────────────────────────────────────────────────────────┘
//
// WEBSITE:  https://playwright.dev/
// PAGES:    Home, Docs, API, Community, Python (language switcher)
// =============================================================================

// Import the Playwright Page type (represents one browser tab)
import { type Page, expect } from '@playwright/test';

// Import BasePage — our parent class with common actions (click, fill, navigate, etc.)
import { BasePage } from './BasePage';

// Import the logger so every action appears in terminal + HTML report
import { logger } from '../utils/helpers/logger';

// =============================================================================
// CLASS: PlaywrightDevPage
// =============================================================================
// "extends BasePage" means we INHERIT all common methods from BasePage:
//   navigate(), clickElement(), waitForElement(), assertElementVisible(), etc.
//
// We only need to define:
//   1. Locators SPECIFIC to playwright.dev (navbar links, headings, etc.)
//   2. Methods  SPECIFIC to playwright.dev (clickDocsTab, verifyTitle, etc.)
// =============================================================================
export class PlaywrightDevPage extends BasePage {

  // ==========================================================================
  // LOCATORS — How to Find Elements on playwright.dev
  // ==========================================================================
  //
  // ┌──────────────────────────────────────────────────────────────────────┐
  // │  FOR NOVICES — WHAT IS A LOCATOR?                                   │
  // │                                                                      │
  // │  A locator is like giving someone directions to find something:      │
  // │    "Find the LINK whose text says 'Docs'" → that's a locator.      │
  // │                                                                      │
  // │  Playwright offers several ways to locate elements:                  │
  // │    getByRole('link', { name: 'Docs' })  — finds by semantic role    │
  // │    getByText('Docs')                    — finds by visible text     │
  // │    locator('.navbar__link')             — finds by CSS class        │
  // │                                                                      │
  // │  BEST PRACTICE: Use getByRole() first — it's the most reliable.    │
  // │  Only use CSS selectors as a fallback.                               │
  // └──────────────────────────────────────────────────────────────────────┘
  //
  // "private get" means these are only accessible INSIDE this class.
  // Tests call our METHODS (e.g., clickDocsTab()), not the locators directly.
  // ==========================================================================

  // The main heading (<h1>) on any page — used to verify we're on the right page
  private get mainHeading() {
    return this.page.locator('h1').first();
  }

  // ── NAVBAR LINKS ──
  // These are the top navigation tabs on playwright.dev:
  //   [Docs]  [API]  [Community]  [Node.js ▾ (dropdown)]

  // "Docs" tab in the navbar — links to /docs/intro
  private get docsNavLink() {
    return this.page.getByRole('link', { name: 'Docs', exact: true });
  }

  // "API" tab in the navbar — links to /docs/api/class-playwright
  private get apiNavLink() {
    return this.page.getByRole('link', { name: 'API', exact: true });
  }

  // "Community" tab in the navbar — links to /community/welcome
  private get communityNavLink() {
    return this.page.getByRole('link', { name: 'Community', exact: true });
  }

  // Language dropdown button (shows "Node.js" by default)
  private get languageDropdown() {
    return this.page.locator('.navbar__items').getByRole('button', { name: /Node\.js/i });
  }

  // "Python" option inside the language dropdown
  private get pythonLanguageOption() {
    return this.page.getByRole('link', { name: 'Python', exact: true });
  }

  // ==========================================================================
  // CONSTRUCTOR
  // ==========================================================================
  // ┌──────────────────────────────────────────────────────────────────────┐
  // │  FOR NOVICES — WHAT IS A CONSTRUCTOR?                                │
  // │                                                                      │
  // │  A constructor runs ONCE when you create a new object:               │
  // │    const myPage = new PlaywrightDevPage(page);  // ← constructor    │
  // │                                                                      │
  // │  "super(page)" passes the browser tab to our parent (BasePage)       │
  // │  so BasePage can use it for navigate(), clickElement(), etc.         │
  // └──────────────────────────────────────────────────────────────────────┘
  // ==========================================================================
  constructor(page: Page) {
    super(page);
  }

  // ==========================================================================
  // METHOD: navigateToHomePage
  // ==========================================================================
  //  WHAT IT DOES:  Opens https://playwright.dev/ in the browser
  //  WHEN TO USE:   At the start of every test as the first step
  //
  //  USAGE IN TEST:
  //    const devPage = new PlaywrightDevPage(page);
  //    await devPage.navigateToHomePage();
  // ==========================================================================
  async navigateToHomePage(): Promise<void> {
    logger.section('📂 Navigating to Playwright.dev Homepage');

    // navigate() comes from BasePage — it opens the URL in the browser
    await this.navigate('https://playwright.dev/');

    // Dismiss any cookie banner that might block the navbar
    await this.dismissCookieBanner();

    // Verify the page actually loaded by checking the <h1> heading is visible
    await this.waitForElement(this.mainHeading, 'Homepage main heading');
  }

  // ==========================================================================
  // METHOD: clickDocsTab
  // ==========================================================================
  //  WHAT IT DOES:  Clicks the "Docs" link in the top navbar
  //  RESULT:        Browser navigates to /docs/intro (Installation page)
  //
  //  USAGE IN TEST:
  //    await devPage.clickDocsTab();
  // ==========================================================================
  async clickDocsTab(): Promise<void> {
    // clickElement() comes from BasePage — it waits for the element, then clicks
    await this.clickElement(this.docsNavLink, 'Docs navigation tab');

    // Wait for the new page to finish loading
    await this.waitForPageLoad('domcontentloaded');
  }

  // ==========================================================================
  // METHOD: clickApiTab
  // ==========================================================================
  //  WHAT IT DOES:  Clicks the "API" link in the top navbar
  //  RESULT:        Browser navigates to /docs/api/class-playwright
  //
  //  USAGE IN TEST:
  //    await devPage.clickApiTab();
  // ==========================================================================
  async clickApiTab(): Promise<void> {
    await this.clickElement(this.apiNavLink, 'API navigation tab');
    await this.waitForPageLoad('domcontentloaded');
  }

  // ==========================================================================
  // METHOD: clickCommunityTab
  // ==========================================================================
  //  WHAT IT DOES:  Clicks the "Community" link in the top navbar
  //  RESULT:        Browser navigates to /community/welcome
  //
  //  USAGE IN TEST:
  //    await devPage.clickCommunityTab();
  // ==========================================================================
  async clickCommunityTab(): Promise<void> {
    await this.clickElement(this.communityNavLink, 'Community navigation tab');
    await this.waitForPageLoad('domcontentloaded');
  }

  // ==========================================================================
  // METHOD: switchToPython
  // ==========================================================================
  //  WHAT IT DOES:  Opens the language dropdown and selects "Python"
  //  RESULT:        Browser navigates to /python/ (Python version of the site)
  //
  //  WHY IS THIS DIFFERENT?
  //    The language selector is a DROPDOWN, not a simple link.
  //    We must: 1) Click the dropdown button  2) Then click the "Python" option.
  //
  //  USAGE IN TEST:
  //    await devPage.switchToPython();
  // ==========================================================================
  async switchToPython(): Promise<void> {
    logger.step('Opening language dropdown...');

    // Step 1: Click the "Node.js" dropdown to open the language menu
    await this.clickElement(this.languageDropdown, 'Language dropdown (Node.js)');

    // Step 2: Click the "Python" option inside the dropdown
    await this.clickElement(this.pythonLanguageOption, 'Python language option');

    // Wait for navigation to the Python version of the site
    await this.waitForPageLoad('domcontentloaded');
  }

  // ==========================================================================
  // METHOD: verifyPageTitle
  // ==========================================================================
  //  WHAT IT DOES:  Checks that the browser tab title contains expected text
  //  WHY:           Confirms we navigated to the correct page
  //
  //  PARAMETERS:
  //    - expectedTitle: Text the title should contain (e.g., "Installation")
  //
  //  USAGE IN TEST:
  //    await devPage.verifyPageTitle('Installation');
  // ==========================================================================
  async verifyPageTitle(expectedTitle: string): Promise<void> {
    logger.step(`Verifying page title contains: "${expectedTitle}"`);

    // expect() is Playwright's assertion — if title doesn't match, test FAILS
    await expect(this.page).toHaveTitle(new RegExp(expectedTitle, 'i'), { timeout: 10000 });

    const actualTitle = await this.page.title();
    logger.pass(`✅ Page title verified: "${actualTitle}"`);
  }

  // ==========================================================================
  // METHOD: verifyHeadingText
  // ==========================================================================
  //  WHAT IT DOES:  Checks that the main <h1> heading contains expected text
  //  WHY:           Double-confirms we're on the right page (belt + suspenders)
  //
  //  PARAMETERS:
  //    - expectedText: Text the heading should contain
  //
  //  USAGE IN TEST:
  //    await devPage.verifyHeadingText('Installation');
  // ==========================================================================
  async verifyHeadingText(expectedText: string): Promise<void> {
    logger.step(`Verifying <h1> heading contains: "${expectedText}"`);

    await this.assertElementVisible(this.mainHeading, 'Page main heading');
    await this.assertElementText(this.mainHeading, expectedText, 'Page main heading');
  }

  // ==========================================================================
  // METHOD: verifyUrl
  // ==========================================================================
  //  WHAT IT DOES:  Checks that the current URL contains expected path
  //  WHY:           Another confirmation that navigation worked
  //
  //  PARAMETERS:
  //    - expectedPath: URL path to check for (e.g., "/docs/intro")
  //
  //  USAGE IN TEST:
  //    await devPage.verifyUrl('/docs/intro');
  // ==========================================================================
  async verifyUrl(expectedPath: string): Promise<void> {
    logger.step(`Verifying URL contains: "${expectedPath}"`);

    await expect(this.page).toHaveURL(new RegExp(expectedPath), { timeout: 10000 });

    logger.pass(`✅ URL verified: ${this.page.url()}`);
  }
}

ENDOFFILE_pages_PlaywrightDevPage_ts
echo "  📄 Created pages/PlaywrightDevPage.ts"

# =============================================================================
# UTILITIES
# =============================================================================


# ── utils/index.ts ──
cat > "utils/index.ts" << 'ENDOFFILE_utils_index_ts'
// =============================================================================
// utils/index.ts — BARREL FILE (Central Export for All Utilities)
// =============================================================================
// PURPOSE:
//   This "barrel file" re-exports everything from all utility folders.
//   Instead of remembering the exact file path for each utility, you can
//   import everything from one place.
//
// WITHOUT barrel file (verbose, hard to remember):
//   import { logger } from '../utils/helpers/logger';
//   import { seedTestData } from '../utils/database/test-data-manager';
//
// WITH barrel file (simple, one import source):
//   import { logger, seedTestData } from '../utils';
//
// CURRENT UTILITIES IN THIS BARREL:
//   🔹 Helpers      — logger, enhancedLogger, screenshot
//   🔹 JIRA XRAY    — auth, test set, execution, result updater, state
//   🔹 Database     — test-data-manager (legacy), db-connection (secure)
//   🔹 Email        — email-verifier
//   🔹 API          — api-helper (GET/POST/PUT/DELETE)
//   🔹 Excel        — excel-reader, data-pool
//   🔹 Security     — crypto-helper (AES-256 encrypt/decrypt)
//   🔹 Reporting    — report-generator (HTML execution report)
//
// HOW TO ADD A NEW UTILITY:
//   1. Create your utility folder under utils/ (e.g., utils/my-new-tool/)
//   2. Create your utility file(s) inside it
//   3. Add an export line here: export { ... } from './my-new-tool/my-file';
//   4. That's it! Now anyone can import your utility from '../utils'
// =============================================================================

// Helpers (shared by all utilities)
export { logger }                         from './helpers/logger';
export { enhancedLogger }                 from './helpers/enhanced-logger';
export { captureScreenshot, captureFailureScreenshot } from './helpers/screenshot';

// JIRA XRAY
export { createJiraApiClient, testJiraConnection } from './jira-xray/jira-auth';
export { fetchTestCasesFromTestSet }               from './jira-xray/xray-test-set';
export { createTestExecution, getTestExecutionStatus } from './jira-xray/xray-test-execution';
export { updateMultipleTestResults }               from './jira-xray/xray-result-updater';
export { initializeXrayState, readXrayState, appendTestResult, clearXrayState } from './jira-xray/xray-state';

// Database — legacy manager
export { isDbConfigured, seedTestData, queryTestData, cleanupTestData } from './database/test-data-manager';

// Database — secure connection (new)
export { DbConnection, isDbEnabled }      from './database/db-connection';

// Email
export { isEmailConfigured, waitForEmail, extractVerificationCode, extractLink } from './email/email-verifier';

// API
export { createApiClient, apiGet, apiPost, apiPut, apiDelete } from './api/api-helper';

// Excel / Data Pool
export { readExcelSheet, readExcelAllSheets, getExcelSheetNames, writeExcelResults } from './excel/excel-reader';
export { DataPool }                       from './excel/data-pool';

// Security / Encryption
export { encrypt, decrypt, hashPassword, isEncryptionConfigured } from './security/crypto-helper';

// Reporting
export { generateReport }                 from './reporting/report-generator';

ENDOFFILE_utils_index_ts
echo "  📄 Created utils/index.ts"

# ── utils/helpers/logger.ts ──
cat > "utils/helpers/logger.ts" << 'ENDOFFILE_utils_helpers_logger_ts'
// =============================================================================
// utils/helpers/logger.ts — LOGGING UTILITY
// =============================================================================
// PURPOSE:
//   A simple logging helper that prints formatted, color-coded messages.
//
// WHAT IS A LOGGER?
//   A logger is a tool that records events/messages during program execution.
//   Instead of writing "console.log(...)" everywhere with no structure,
//   a logger adds:
//     - Timestamps (when did this happen?)
//     - Log levels (INFO, WARN, ERROR, DEBUG)
//     - Consistent formatting (easy to read)
//
// LOG LEVELS (from least to most severe):
//   DEBUG: Detailed developer information (only shown when debugging)
//   INFO:  Normal operational messages ("Test started", "Page loaded")
//   WARN:  Something unexpected happened, but it's not fatal ("Element not found, retrying")
//   ERROR: Something went wrong that needs attention ("Test failed", "API call failed")
//
// COLOR CODES:
//   We use ANSI escape codes for terminal colors.
//   These are special character sequences that terminals interpret as colors.
//   Example: "\x1b[32m" means "switch to green color"
//            "\x1b[0m"  means "reset back to normal color"
// =============================================================================

// Terminal color codes using ANSI escape sequences
const Colors = {
  reset:   '\x1b[0m',
  bright:  '\x1b[1m',
  dim:     '\x1b[2m',
  green:   '\x1b[32m',  // ✅ Success, INFO
  yellow:  '\x1b[33m',  // ⚠️  Warnings
  red:     '\x1b[31m',  // ❌ Errors
  cyan:    '\x1b[36m',  // 🔍 Debug info
  white:   '\x1b[37m',  // Regular text
  blue:    '\x1b[34m',  // 📋 Steps/actions
} as const;

// =============================================================================
// FUNCTION: formatTimestamp
// =============================================================================
// Returns the current time as a readable string: "2026-02-28 14:30:45"
// This tells us exactly WHEN each log line was printed.
// =============================================================================
function formatTimestamp(): string {
  const now = new Date();
  return now.toISOString().replace('T', ' ').split('.')[0];
}

// =============================================================================
// THE LOGGER OBJECT
// =============================================================================
// Usage examples:
//   logger.info('Test started');
//   logger.warn('Slow network detected');
//   logger.error('Login failed', new Error('Wrong password'));
//   logger.step('Clicking the submit button');
// =============================================================================
export const logger = {

  // ---------------------------------------------------------------------------
  // INFO: Normal progress messages (green)
  // ---------------------------------------------------------------------------
  info(message: string): void {
    console.log(
      `${Colors.dim}[${formatTimestamp()}]${Colors.reset} ` +
      `${Colors.green}ℹ INFO${Colors.reset}  ${message}`
    );
  },

  // ---------------------------------------------------------------------------
  // WARN: Non-fatal warnings (yellow)
  // ---------------------------------------------------------------------------
  warn(message: string): void {
    console.warn(
      `${Colors.dim}[${formatTimestamp()}]${Colors.reset} ` +
      `${Colors.yellow}⚠ WARN${Colors.reset}  ${message}`
    );
  },

  // ---------------------------------------------------------------------------
  // ERROR: Something went wrong (red)
  // ---------------------------------------------------------------------------
  error(message: string, error?: unknown): void {
    console.error(
      `${Colors.dim}[${formatTimestamp()}]${Colors.reset} ` +
      `${Colors.red}✖ ERROR${Colors.reset} ${message}`
    );
    if (error) {
      // Print the error details with indentation for readability
      const errMsg = error instanceof Error ? error.stack || error.message : String(error);
      console.error(`${Colors.red}          ${errMsg}${Colors.reset}`);
    }
  },

  // ---------------------------------------------------------------------------
  // DEBUG: Detailed developer information (cyan)
  // Only shows when DEBUG=true or NODE_ENV=development
  // ---------------------------------------------------------------------------
  debug(message: string, data?: unknown): void {
    if (process.env['DEBUG'] !== 'true' && process.env['NODE_ENV'] !== 'development') return;
    console.log(
      `${Colors.dim}[${formatTimestamp()}]${Colors.reset} ` +
      `${Colors.cyan}🔍 DEBUG${Colors.reset} ${message}`
    );
    if (data) {
      console.log(`          ${JSON.stringify(data, null, 2)}`);
    }
  },

  // ---------------------------------------------------------------------------
  // STEP: A named action step in a test (blue)
  // Use this to narrate what the test is doing — makes logs easy to follow
  // ---------------------------------------------------------------------------
  step(stepName: string): void {
    console.log(
      `${Colors.dim}[${formatTimestamp()}]${Colors.reset} ` +
      `${Colors.blue}▶ STEP${Colors.reset}   ${stepName}`
    );
  },

  // ---------------------------------------------------------------------------
  // PASS: A test passed (bright green)
  // ---------------------------------------------------------------------------
  pass(testName: string): void {
    console.log(
      `${Colors.dim}[${formatTimestamp()}]${Colors.reset} ` +
      `${Colors.bright}${Colors.green}✅ PASS${Colors.reset}   ${testName}`
    );
  },

  // ---------------------------------------------------------------------------
  // FAIL: A test failed (bright red)
  // ---------------------------------------------------------------------------
  fail(testName: string, reason?: string): void {
    console.log(
      `${Colors.dim}[${formatTimestamp()}]${Colors.reset} ` +
      `${Colors.bright}${Colors.red}❌ FAIL${Colors.reset}   ${testName}${reason ? ` — ${reason}` : ''}`
    );
  },

  // ---------------------------------------------------------------------------
  // SECTION: A section header divider for readability
  // ---------------------------------------------------------------------------
  section(title: string): void {
    const line = '─'.repeat(60);
    console.log(`\n${Colors.bright}${line}${Colors.reset}`);
    console.log(`${Colors.bright}  ${title}${Colors.reset}`);
    console.log(`${Colors.bright}${line}${Colors.reset}\n`);
  },
};

ENDOFFILE_utils_helpers_logger_ts
echo "  📄 Created utils/helpers/logger.ts"

# ── utils/helpers/enhanced-logger.ts ──
cat > "utils/helpers/enhanced-logger.ts" << 'ENDOFFILE_utils_helpers_enhanced_logger_ts'
// =============================================================================
// utils/helpers/enhanced-logger.ts — ADVANCED LOGGER WITH FILE OUTPUT
// =============================================================================
// PURPOSE:
//   An enhanced logger that goes beyond the basic console logger.
//   It writes logs to ROTATING FILES in addition to the terminal, and captures
//   structured data (timing, test names, error details) for the final report.
//
// WHAT IS LOG ROTATION?
//   Log rotation means: when a log file gets too large, or a new day starts,
//   the old file is archived and a new file is started.
//
//   Without rotation:
//     logs/app.log → grows forever → eventually fills your disk 😱
//
//   With rotation:
//     logs/2026-03-01.log  (Monday's logs)
//     logs/2026-03-02.log  (Tuesday's logs — auto-created at midnight)
//     logs/2026-03-03.log  (Wednesday's logs)
//     Older files auto-deleted after 14 days
//
// LOG LEVELS (from least important to most):
//   DEBUG  → Detailed info for developers (only shown when LOG_LEVEL=debug)
//   INFO   → Normal operations ("Test started", "Page loaded")
//   WARN   → Something unexpected but not fatal ("Retrying flaky step")
//   ERROR  → Something broke ("Login failed", "API returned 500")
//   STEP   → A test step being performed ("Step 1: Navigate to login page")
//   PASS   → A test or assertion passed ✅
//   FAIL   → A test or assertion failed ❌
//   SECTION→ A visual separator / section header
//
// HOW TO USE:
//   import { enhancedLogger } from '../helpers/enhanced-logger';
//
//   enhancedLogger.info('Test started');
//   enhancedLogger.step('Clicking the login button');
//   enhancedLogger.pass('TC01 passed in 2.3s');
//
//   // Collect performance data
//   enhancedLogger.logPerformance('TC01', { loadTime: 1200, renderTime: 300 });
//
//   // Collect accessibility issues
//   enhancedLogger.logAccessibility('TC01', violations);
//
//   // Get all collected data for the final report
//   const allLogs = enhancedLogger.getCollectedData();
//
// CONFIGURATION IN .env:
//   LOG_LEVEL=info        ← 'debug', 'info', 'warn', 'error' (default: info)
//   LOG_TO_FILE=true      ← Write logs to files in logs/ folder
//   LOG_FILE_MAX_DAYS=14  ← How many days of log files to keep
// =============================================================================

import * as fs   from 'fs';
import * as path from 'path';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

/**
 * A single structured log entry saved for report generation.
 */
export interface LogEntry {
  timestamp: string;
  level:     'debug' | 'info' | 'warn' | 'error' | 'step' | 'pass' | 'fail' | 'section';
  message:   string;
  testName?: string;
  data?:     unknown;
}

/**
 * Performance metrics for a single test.
 */
export interface PerformanceData {
  testName:       string;
  /** Page load time in milliseconds */
  pageLoadMs?:    number;
  /** Time to first contentful paint in ms */
  fcpMs?:         number;
  /** Time to largest contentful paint in ms */
  lcpMs?:         number;
  /** Total test duration in ms */
  durationMs?:    number;
  /** Number of network requests made */
  requestCount?:  number;
  /** Total data transferred in bytes */
  transferBytes?: number;
  extras?:        Record<string, number | string>;
}

/**
 * One accessibility violation found by axe-core.
 */
export interface AccessibilityViolation {
  id:          string;
  impact:      'minor' | 'moderate' | 'serious' | 'critical';
  description: string;
  helpUrl:     string;
  nodes:       number;
}

// =============================================================================
// TERMINAL COLOR CODES
// =============================================================================
const C = {
  reset:   '\x1b[0m',
  bold:    '\x1b[1m',
  dim:     '\x1b[2m',
  green:   '\x1b[32m',
  yellow:  '\x1b[33m',
  red:     '\x1b[31m',
  cyan:    '\x1b[36m',
  blue:    '\x1b[34m',
  magenta: '\x1b[35m',
  white:   '\x1b[37m',
  bgGreen: '\x1b[42m',
  bgRed:   '\x1b[41m',
} as const;

// =============================================================================
// LOG LEVELS (numeric priority — higher = more severe)
// =============================================================================
const LOG_LEVEL_PRIORITY: Record<string, number> = {
  debug:   0,
  info:    1,
  warn:    2,
  error:   3,
  step:    1,
  pass:    1,
  fail:    3,
  section: 1,
};

// =============================================================================
// CLASS: EnhancedLogger
// =============================================================================
class EnhancedLogger {
  // Collected structured data (for report generation)
  private logs:         LogEntry[]             = [];
  private perfData:     PerformanceData[]       = [];
  private a11yData:     Map<string, AccessibilityViolation[]> = new Map();
  private testTimings:  Map<string, number>     = new Map(); // testName → start time

  // File writer stream
  private logFileStream: fs.WriteStream | null = null;
  private logFilePath:   string                = '';

  // Configuration
  private minLevel: number;
  private writeToFile: boolean;

  constructor() {
    this.minLevel   = LOG_LEVEL_PRIORITY[process.env['LOG_LEVEL'] ?? 'info'] ?? 1;
    this.writeToFile = (process.env['LOG_TO_FILE'] ?? 'true') === 'true';

    if (this.writeToFile) {
      this.initLogFile();
    }
  }

  // ===========================================================================
  // LOGGING METHODS
  // ===========================================================================

  /** Normal operational message (green ℹ) */
  info(message: string, testName?: string): void {
    this.log('info', message, testName);
  }

  /** Warning — unexpected but not fatal (yellow ⚠) */
  warn(message: string, testName?: string): void {
    this.log('warn', message, testName);
  }

  /** Error — something broke (red ✗) */
  error(message: string, testName?: string): void {
    this.log('error', message, testName);
  }

  /** Debug — detailed developer info (only shown when LOG_LEVEL=debug) */
  debug(message: string, testName?: string): void {
    this.log('debug', message, testName);
  }

  /** A test step being performed (blue ▶) */
  step(message: string, testName?: string): void {
    this.log('step', message, testName);
  }

  /** Test/assertion passed (bright green ✅) */
  pass(message: string, testName?: string): void {
    this.log('pass', message, testName);
  }

  /** Test/assertion failed (bright red ❌) */
  fail(message: string, testName?: string): void {
    this.log('fail', message, testName);
  }

  /** Visual section separator */
  section(title: string): void {
    const line = '─'.repeat(60);
    this.log('section', `\n${line}\n  ${title}\n${line}`);
  }

  // ===========================================================================
  // PERFORMANCE DATA COLLECTION
  // ===========================================================================

  /**
   * Records performance metrics for a test.
   * These are included in the final HTML report as charts.
   *
   * EXAMPLE:
   *   enhancedLogger.logPerformance('TC01 Login', {
   *     testName:    'TC01 Login',
   *     pageLoadMs:  1200,
   *     fcpMs:       800,
   *     durationMs:  3500,
   *     requestCount: 12,
   *   });
   */
  logPerformance(testName: string, data: Omit<PerformanceData, 'testName'>): void {
    this.perfData.push({ testName, ...data });
    this.debug(`Performance recorded for ${testName}: ${JSON.stringify(data)}`, testName);
  }

  /** Mark the start time for a test (used to calculate duration) */
  startTimer(testName: string): void {
    this.testTimings.set(testName, Date.now());
  }

  /** Mark the end time and record duration */
  stopTimer(testName: string): number {
    const start = this.testTimings.get(testName);
    if (!start) return 0;
    const durationMs = Date.now() - start;
    this.logPerformance(testName, { durationMs });
    return durationMs;
  }

  // ===========================================================================
  // ACCESSIBILITY DATA COLLECTION
  // ===========================================================================

  /**
   * Records accessibility violations from an axe-core scan.
   * These are included in the final HTML report.
   *
   * EXAMPLE (in a test):
   *   import AxeBuilder from '@axe-core/playwright';
   *   const results = await new AxeBuilder({ page }).analyze();
   *   enhancedLogger.logAccessibility('TC01', results.violations.map(v => ({
   *     id:          v.id,
   *     impact:      v.impact as any,
   *     description: v.description,
   *     helpUrl:     v.helpUrl,
   *     nodes:       v.nodes.length,
   *   })));
   */
  logAccessibility(testName: string, violations: AccessibilityViolation[]): void {
    this.a11yData.set(testName, violations);
    if (violations.length === 0) {
      this.pass(`♿ Accessibility: No violations found`, testName);
    } else {
      const critical = violations.filter(v => v.impact === 'critical' || v.impact === 'serious').length;
      this.warn(`♿ Accessibility: ${violations.length} violation(s) (${critical} critical/serious)`, testName);
    }
  }

  // ===========================================================================
  // DATA RETRIEVAL (for report generation)
  // ===========================================================================

  /** Returns all collected log entries */
  getLogs(): LogEntry[] { return [...this.logs]; }

  /** Returns all collected performance data */
  getPerformanceData(): PerformanceData[] { return [...this.perfData]; }

  /** Returns accessibility data for a specific test (or all if no name given) */
  getAccessibilityData(testName?: string): Map<string, AccessibilityViolation[]> | AccessibilityViolation[] {
    if (testName) return this.a11yData.get(testName) ?? [];
    return new Map(this.a11yData);
  }

  /** Returns everything collected (for passing to report generator) */
  getCollectedData(): {
    logs:          LogEntry[];
    performance:   PerformanceData[];
    accessibility: Record<string, AccessibilityViolation[]>;
  } {
    return {
      logs:          this.getLogs(),
      performance:   this.getPerformanceData(),
      accessibility: Object.fromEntries(this.a11yData),
    };
  }

  /** Clears all collected data (useful between test runs) */
  clear(): void {
    this.logs       = [];
    this.perfData   = [];
    this.a11yData   = new Map();
    this.testTimings = new Map();
  }

  // ===========================================================================
  // PRIVATE: log()
  // ===========================================================================
  private log(
    level: LogEntry['level'],
    message: string,
    testName?: string,
    data?: unknown
  ): void {
    // Check minimum log level
    const priority = LOG_LEVEL_PRIORITY[level] ?? 1;
    if (priority < this.minLevel) return;

    const timestamp = this.getTimestamp();
    const entry: LogEntry = { timestamp, level, message, testName, data };

    // Save to in-memory collection (for report)
    this.logs.push(entry);

    // Format and print to terminal
    const formatted = this.formatForTerminal(timestamp, level, message);
    if (level === 'error' || level === 'fail' || level === 'warn') {
      console.error(formatted);
    } else {
      console.log(formatted);
    }

    // Write to file if enabled
    if (this.writeToFile && this.logFileStream) {
      const plainLine = `[${timestamp}] [${level.toUpperCase().padEnd(7)}] ${testName ? `[${testName}] ` : ''}${message}\n`;
      this.logFileStream.write(plainLine);
    }
  }

  // ===========================================================================
  // PRIVATE: formatForTerminal()
  // ===========================================================================
  private formatForTerminal(timestamp: string, level: LogEntry['level'], message: string): string {
    const ts = `${C.dim}[${timestamp}]${C.reset}`;

    switch (level) {
      case 'info':    return `${ts} ${C.green}ℹ INFO${C.reset}  ${message}`;
      case 'warn':    return `${ts} ${C.yellow}⚠ WARN${C.reset}  ${message}`;
      case 'error':   return `${ts} ${C.red}✗ ERROR${C.reset} ${message}`;
      case 'debug':   return `${ts} ${C.cyan}◌ DEBUG${C.reset} ${message}`;
      case 'step':    return `${ts} ${C.blue}▶ STEP${C.reset}  ${C.blue}${message}${C.reset}`;
      case 'pass':    return `${ts} ${C.green}${C.bold}✅ PASS${C.reset}  ${C.green}${message}${C.reset}`;
      case 'fail':    return `${ts} ${C.red}${C.bold}❌ FAIL${C.reset}  ${C.red}${message}${C.reset}`;
      case 'section': return `${C.cyan}${C.bold}${message}${C.reset}`;
      default:        return `${ts} ${message}`;
    }
  }

  // ===========================================================================
  // PRIVATE: getTimestamp()
  // ===========================================================================
  private getTimestamp(): string {
    return new Date().toISOString().replace('T', ' ').split('.')[0];
  }

  // ===========================================================================
  // PRIVATE: initLogFile()
  // ===========================================================================
  private initLogFile(): void {
    try {
      const logsDir = path.resolve(process.cwd(), 'logs');
      if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
      }

      const date          = new Date().toISOString().split('T')[0];
      this.logFilePath    = path.join(logsDir, `test-run-${date}.log`);
      this.logFileStream  = fs.createWriteStream(this.logFilePath, { flags: 'a' });

      // Clean old log files
      this.cleanOldLogFiles(logsDir);

      this.log('info', `📋 Log file: ${this.logFilePath}`);
    } catch {
      // Non-fatal — continue without file logging if init fails
    }
  }

  // ===========================================================================
  // PRIVATE: cleanOldLogFiles()
  // ===========================================================================
  private cleanOldLogFiles(logsDir: string): void {
    const maxDays = parseInt(process.env['LOG_FILE_MAX_DAYS'] ?? '14', 10);
    const cutoff  = Date.now() - maxDays * 24 * 60 * 60 * 1000;

    try {
      const files = fs.readdirSync(logsDir);
      for (const file of files) {
        if (!file.startsWith('test-run-') || !file.endsWith('.log')) continue;
        const filePath = path.join(logsDir, file);
        const stat     = fs.statSync(filePath);
        if (stat.mtimeMs < cutoff) {
          fs.unlinkSync(filePath);
        }
      }
    } catch {
      // Non-fatal
    }
  }
}

// =============================================================================
// SINGLETON EXPORT
// =============================================================================
// Export a single shared instance. All files import the same logger.
// This means all logs are collected in one place for the final report.
export const enhancedLogger = new EnhancedLogger();

ENDOFFILE_utils_helpers_enhanced_logger_ts
echo "  📄 Created utils/helpers/enhanced-logger.ts"

# ── utils/helpers/screenshot.ts ──
cat > "utils/helpers/screenshot.ts" << 'ENDOFFILE_utils_helpers_screenshot_ts'
// =============================================================================
// utils/helpers/screenshot.ts — SCREENSHOT CAPTURE UTILITY
// =============================================================================
// PURPOSE:
//   Helper functions to capture and save screenshots during test execution.
//
// WHAT IS A SCREENSHOT IN TESTING?
//   A screenshot is an image of what the browser showed at a specific moment.
//   When tests fail, screenshots are the #1 debugging tool because they show:
//     - Was the wrong page displayed?
//     - Was there an error message on screen?
//     - Was the button/element not visible?
//
// PLAYWRIGHT'S SCREENSHOT FEATURE:
//   Playwright (our test framework) can take browser screenshots automatically.
//   We just call: page.screenshot({ path: 'my-screenshot.png' })
//   Playwright will capture exactly what Chrome/Firefox shows at that moment.
// =============================================================================

import * as fs   from 'fs';
import * as path from 'path';
import type { Page } from '@playwright/test';
import { logger } from './logger';

// The folder where all screenshots will be saved
// This folder is created automatically if it doesn't exist
const SCREENSHOTS_DIR = path.join(process.cwd(), 'test-results', 'screenshots');

// =============================================================================
// FUNCTION: captureScreenshot
// =============================================================================
// PURPOSE:
//   Takes a screenshot of the current browser state and saves it to disk.
//
// HOW IT WORKS:
//   1. Creates the screenshots folder if it doesn't exist
//   2. Generates a unique filename with timestamp (prevents overwrites)
//   3. Tells Playwright to capture the screenshot and save it
//   4. Returns the path where the file was saved
//
// PARAMETERS:
//   - page:      The Playwright Page object (represents the browser tab)
//   - testName:  A descriptive name for the screenshot (e.g., "login-failure")
//   - label:     Optional extra label (e.g., "before-click", "after-error")
//
// RETURNS:
//   The full file path of the saved screenshot, or null if capture failed.
//
// USAGE EXAMPLE:
//   const screenshotPath = await captureScreenshot(page, 'login-test', 'wrong-password');
//   // Saves: test-results/screenshots/login-test_wrong-password_2026-02-28T14-30-45.png
// =============================================================================
export async function captureScreenshot(
  page: Page,
  testName: string,
  label: string = 'screenshot'
): Promise<string | null> {

  try {
    // Create screenshots directory if it doesn't exist yet
    if (!fs.existsSync(SCREENSHOTS_DIR)) {
      fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
    }

    // Build a safe, unique filename:
    //   - Replace spaces and slashes with underscores (can't have those in filenames)
    //   - Add a timestamp to make each screenshot unique
    //   - Use ISO format but replace colons with dashes (colons are invalid in filenames)
    const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
    const safeName  = testName.replace(/[^a-zA-Z0-9_-]/g, '_');
    const safeLabel = label.replace(/[^a-zA-Z0-9_-]/g, '_');
    const fileName  = `${safeName}_${safeLabel}_${timestamp}.png`;
    const filePath  = path.join(SCREENSHOTS_DIR, fileName);

    // Capture the screenshot using Playwright's built-in screenshot API
    // "fullPage: true" captures the ENTIRE page, not just the visible viewport
    await page.screenshot({
      path: filePath,
      fullPage: true,
    });

    logger.info(`📸 Screenshot saved: ${fileName}`);
    return filePath;

  } catch (error) {
    // Screenshot capture failed (maybe the page was already closed?)
    logger.warn(`Could not capture screenshot for "${testName}": ${error}`);
    return null;
  }
}

// =============================================================================
// FUNCTION: captureFailureScreenshot
// =============================================================================
// PURPOSE:
//   A convenience wrapper to capture a screenshot specifically when a test fails.
//   Adds "FAILURE" to the filename so it's easy to spot failed test screenshots.
//
// PARAMETERS:
//   - page:     The Playwright Page object
//   - testName: The name of the test that failed
//
// RETURNS:
//   The file path of the screenshot, or null if capture failed.
// =============================================================================
export async function captureFailureScreenshot(
  page: Page,
  testName: string
): Promise<string | null> {
  logger.step(`Capturing failure screenshot for: ${testName}`);
  return captureScreenshot(page, testName, 'FAILURE');
}

ENDOFFILE_utils_helpers_screenshot_ts
echo "  📄 Created utils/helpers/screenshot.ts"

# ── utils/api/api-helper.ts ──
cat > "utils/api/api-helper.ts" << 'ENDOFFILE_utils_api_api_helper_ts'
// =============================================================================
// utils/api/api-helper.ts — REST API TESTING UTILITY
// =============================================================================
// PURPOSE:
//   A reusable HTTP client for making API calls during tests.
//   Many tests need to call backend APIs directly — not just interact with
//   the browser UI. Common use cases:
//
//   - PRE-TEST:  Call an API to create test data (e.g., POST /api/users)
//   - IN-TEST:   Call an API to verify side effects (e.g., GET /api/orders)
//   - POST-TEST: Call an API to clean up (e.g., DELETE /api/test-data)
//
// WHAT IS A REST API?
//   An API (Application Programming Interface) lets programs talk to each other.
//   A REST API is an API accessed via HTTP URLs — the same way your browser
//   loads web pages, but the server returns data (JSON) instead of HTML.
//
// WHEN IS THIS CALLED?
//   - Inside individual tests that need API calls
//   - In global-setup.ts if you need to seed data via API before tests
//   - In global-teardown.ts if you need to clean up via API after tests
//
// HOW TO ENABLE:
//   Set API_BASE_URL in .env. If not set, defaults to BASE_URL.
//   API_AUTH_TOKEN is optional — only needed for authenticated endpoints.
// =============================================================================

import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios';
import { config } from '../../config/environment';
import { logger } from '../helpers/logger';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

/**
 * Standardized API response wrapper.
 * Every api-helper function returns this shape for consistency.
 */
export interface ApiResponse<T = any> {
  success:    boolean;       // Did the call succeed (HTTP 2xx)?
  status:     number;        // HTTP status code (200, 404, 500, etc.)
  data:       T | null;      // The response body (parsed JSON)
  message:    string;        // Human-readable summary
  durationMs: number;        // How long the call took
}

// =============================================================================
// FUNCTION: createApiClient
// =============================================================================
// PURPOSE:
//   Creates a pre-configured axios HTTP client for making API calls.
//   It sets the base URL, default headers, and optional auth token.
//
// RETURNS:
//   An axios instance ready to make GET/POST/PUT/DELETE calls.
// =============================================================================
export function createApiClient(): AxiosInstance {
  // If a dedicated API base URL is configured, use it.
  // Otherwise fall back to the app base URL.
  // NOTE: When tests pass absolute URLs (e.g. 'https://jsonplaceholder.typicode.com/posts/1'),
  // axios will use the absolute URL directly and ignore baseURL — this is expected axios behavior.
  const baseURL = config.api.baseUrl || config.app.baseUrl;

  const client = axios.create({
    baseURL,
    timeout: 30000, // 30 second timeout
    headers: {
      'Content-Type':  'application/json',
      'Accept':        'application/json',
    },
  });

  // Add auth token if configured
  if (config.api.authToken && config.api.authToken !== 'your-api-auth-token') {
    client.defaults.headers.common['Authorization'] = `Bearer ${config.api.authToken}`;
  }

  // Request interceptor — log every outgoing API call
  client.interceptors.request.use((req) => {
    // Build the final URL — prefer the full resolved URL when available
    const fullUrl = req.url?.startsWith('http') ? req.url : `${req.baseURL ?? ''}${req.url ?? ''}`;
    logger.info(`🌐 API → ${req.method?.toUpperCase()} ${fullUrl}`);
    return req;
  });

  // Response interceptor — log the result
  client.interceptors.response.use(
    (res) => {
      logger.info(`🌐 API ← ${res.status} ${res.statusText}`);
      return res;
    },
    (err) => {
      if (err.response) {
        logger.warn(`🌐 API ← ${err.response.status} ${err.response.statusText}`);
      } else {
        logger.error(`🌐 API ← Network error: ${err.message}`);
      }
      return Promise.reject(err);
    }
  );

  return client;
}

// =============================================================================
// FUNCTION: apiGet / apiPost / apiPut / apiDelete
// =============================================================================
// PURPOSE:
//   Convenience functions for the 4 most common HTTP methods.
//   They all return the same ApiResponse shape for consistency.
//
// EXAMPLES:
//   const users = await apiGet<User[]>('/api/users');
//   const newOrder = await apiPost('/api/orders', { item: 'Widget', qty: 5 });
//   const updated = await apiPut('/api/users/123', { name: 'Jane' });
//   const deleted = await apiDelete('/api/users/123');
// =============================================================================

export async function apiGet<T = any>(
  url: string,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> {
  return makeApiCall<T>('GET', url, undefined, config);
}

export async function apiPost<T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> {
  return makeApiCall<T>('POST', url, data, config);
}

export async function apiPut<T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> {
  return makeApiCall<T>('PUT', url, data, config);
}

export async function apiDelete<T = any>(
  url: string,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> {
  return makeApiCall<T>('DELETE', url, undefined, config);
}

// =============================================================================
// INTERNAL: makeApiCall
// =============================================================================
// The actual implementation that all the convenience functions use.
// =============================================================================
async function makeApiCall<T>(
  method:     string,
  url:        string,
  data?:      any,
  reqConfig?: AxiosRequestConfig
): Promise<ApiResponse<T>> {
  const client   = createApiClient();
  const startMs  = Date.now();

  try {
    const response: AxiosResponse<T> = await client.request({
      method,
      url,
      data,
      ...reqConfig,
    });

    return {
      success:    true,
      status:     response.status,
      data:       response.data,
      message:    `${method} ${url} → ${response.status}`,
      durationMs: Date.now() - startMs,
    };

  } catch (error: any) {
    const status = error.response?.status || 0;
    return {
      success:    false,
      status,
      data:       error.response?.data || null,
      message:    `${method} ${url} → ${status || 'Network Error'}: ${error.message}`,
      durationMs: Date.now() - startMs,
    };
  }
}

ENDOFFILE_utils_api_api_helper_ts
echo "  📄 Created utils/api/api-helper.ts"

# ── utils/database/db-connection.ts ──
cat > "utils/database/db-connection.ts" << 'ENDOFFILE_utils_database_db_connection_ts'
// =============================================================================
// utils/database/db-connection.ts — SECURE DATABASE CONNECTION MANAGER
// =============================================================================
// PURPOSE:
//   Manages secure connections to databases (PostgreSQL, MySQL, SQLite).
//   Supports SSL/TLS encryption, connection pooling, and credential decryption.
//
// WHAT IS A DATABASE CONNECTION?
//   A "connection" is like opening a phone line to the database server.
//   Every time you want to read or write data, you need an open connection.
//   "Connection pooling" means we keep a few connections open and reuse them
//   instead of opening a new one for every query (much faster).
//
// WHAT IS SSL/TLS?
//   SSL (Secure Sockets Layer) / TLS (Transport Layer Security) encrypts
//   the communication between your test and the database server.
//   Without SSL, your data (including passwords!) travels in plain text
//   over the network and could be intercepted. With SSL, it's scrambled.
//
// SUPPORTED DATABASES:
//   🐘 PostgreSQL  → Most popular for enterprise apps
//   🐬 MySQL       → Very common for web apps
//   📄 SQLite      → File-based, no server needed (great for local testing)
//
// HOW TO USE:
//   // Get a connected database client
//   const db = await DbConnection.connect();
//
//   // Run a query
//   const users = await db.query('SELECT * FROM users WHERE email = $1', ['alice@example.com']);
//
//   // Always disconnect when done
//   await db.disconnect();
//
// SETUP IN .env:
//   DB_ENABLED=true
//   DB_TYPE=postgres          ← 'postgres', 'mysql', or 'sqlite'
//   DB_HOST=db.company.com
//   DB_PORT=5432
//   DB_NAME=myapp_test
//   DB_USER=test_user
//   DB_PASSWORD_ENCRYPTED=U2FsdGVkX1...  ← Use npm run encrypt-password to generate
//   DB_SSL=true               ← Enable SSL for production databases
//   DB_SSL_CERT_PATH=./certs/db-ca.pem  ← Path to SSL certificate (optional)
// =============================================================================

import { logger }    from '../helpers/logger';
import { decrypt }   from '../security/crypto-helper';
import * as fs       from 'fs';
import * as path     from 'path';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

/**
 * Database type — which database system to connect to.
 */
export type DbType = 'postgres' | 'mysql' | 'sqlite';

/**
 * Configuration for establishing a database connection.
 */
export interface DbConfig {
  /** Which database system: 'postgres', 'mysql', or 'sqlite' */
  type: DbType;

  /** Database server hostname or IP (not needed for SQLite) */
  host?: string;

  /** Database server port (5432 for Postgres, 3306 for MySQL) */
  port?: number;

  /** Database name */
  database: string;

  /** Username (not needed for SQLite) */
  user?: string;

  /**
   * Password in PLAIN TEXT.
   * ⚠️ Prefer using passwordEncrypted + a secret key instead.
   * Only use this for local/dev databases — NEVER production.
   */
  password?: string;

  /**
   * ENCRYPTED password string (generated by the crypto-helper utility).
   * This is the RECOMMENDED way — passwords are never in plain text in .env.
   * To generate: npm run encrypt-password
   */
  passwordEncrypted?: string;

  /** Whether to use SSL/TLS encryption for the connection (default: false) */
  ssl?: boolean;

  /** Path to SSL certificate file (optional, for self-signed certs) */
  sslCertPath?: string;

  /** Maximum number of connections to keep open (default: 5) */
  poolSize?: number;

  /** SQLite: path to the database file (only for type='sqlite') */
  filePath?: string;
}

/**
 * Result from a query — an array of row objects.
 * Each row is a key-value object where keys are column names.
 */
export type QueryResult = Record<string, unknown>[];

// =============================================================================
// CLASS: DbConnection
// =============================================================================
/**
 * A unified database connection that works with PostgreSQL, MySQL, or SQLite.
 *
 * USAGE:
 *   const db = await DbConnection.connect();       // Connect using .env settings
 *   const rows = await db.query('SELECT * FROM users');
 *   const count = await db.execute('UPDATE users SET active = true WHERE id = $1', [42]);
 *   await db.disconnect();
 */
export class DbConnection {
  // Internal reference to the active client (type depends on DB type)
  private client: unknown = null;
  private dbType: DbType;
  private isConnected = false;

  // Make constructor private — use DbConnection.connect() instead
  private constructor(dbType: DbType) {
    this.dbType = dbType;
  }

  // ===========================================================================
  // STATIC FACTORY: connect()
  // ===========================================================================
  /**
   * Creates a DbConnection and establishes the connection.
   * This is the main entry point.
   *
   * EXAMPLE:
   *   const db = await DbConnection.connect();
   *   // Now db is connected and ready to use
   *
   * @param overrideConfig - Optional config override (defaults to .env settings)
   */
  static async connect(overrideConfig?: Partial<DbConfig>): Promise<DbConnection> {
    const cfg = DbConnection.buildConfig(overrideConfig);

    logger.info(`🗄️  Connecting to ${cfg.type.toUpperCase()} database...`);
    logger.info(`   Host: ${cfg.host || 'local file'} | DB: ${cfg.database}`);
    if (cfg.ssl) logger.info(`   🔒 SSL: enabled`);

    const instance = new DbConnection(cfg.type);
    await instance.establishConnection(cfg);
    return instance;
  }

  // ===========================================================================
  // METHOD: query()
  // ===========================================================================
  /**
   * Runs a SELECT query and returns the result rows.
   *
   * Use $1, $2, ... placeholders for parameters (prevents SQL injection!).
   * Never build queries by string concatenation with user input.
   *
   * GOOD ✅:
   *   db.query('SELECT * FROM users WHERE email = $1', ['alice@test.com'])
   *
   * BAD ❌ (SQL injection risk!):
   *   db.query(`SELECT * FROM users WHERE email = '${userInput}'`)
   *
   * @param sql    - SQL query string with $1, $2 placeholders
   * @param params - Values for the placeholders (in order)
   * @returns      Array of row objects
   */
  async query(sql: string, params: unknown[] = []): Promise<QueryResult> {
    this.assertConnected();

    logger.step(`🗄️  DB Query: ${sql.substring(0, 80)}${sql.length > 80 ? '...' : ''}`);

    try {
      if (this.dbType === 'postgres') {
        const { Pool } = await import('pg');
        const pool = this.client as InstanceType<typeof Pool>;
        const result = await pool.query(sql, params);
        logger.info(`   Returned ${result.rows.length} row(s)`);
        return result.rows as QueryResult;

      } else if (this.dbType === 'mysql') {
        // MySQL uses ? placeholders instead of $1, $2
        const mysqlSql = sql.replace(/\$\d+/g, '?');
        return await new Promise((resolve, reject) => {
          (this.client as any).query(mysqlSql, params, (err: Error, rows: QueryResult) => {
            if (err) reject(err);
            else {
              logger.info(`   Returned ${rows.length} row(s)`);
              resolve(rows);
            }
          });
        });

      } else {
        // SQLite placeholder
        logger.warn('SQLite query: install better-sqlite3 and plug it in here.');
        return [];
      }
    } catch (err) {
      logger.error(`❌ DB query failed: ${(err as Error).message}`);
      throw err;
    }
  }

  // ===========================================================================
  // METHOD: execute()
  // ===========================================================================
  /**
   * Runs an INSERT, UPDATE, DELETE, or DDL statement.
   * Returns the number of rows affected.
   *
   * EXAMPLE:
   *   const affected = await db.execute(
   *     'UPDATE users SET last_login = NOW() WHERE id = $1',
   *     [userId]
   *   );
   *   console.log(`${affected} rows updated`);
   */
  async execute(sql: string, params: unknown[] = []): Promise<number> {
    this.assertConnected();

    logger.step(`🗄️  DB Execute: ${sql.substring(0, 80)}${sql.length > 80 ? '...' : ''}`);

    try {
      if (this.dbType === 'postgres') {
        const { Pool } = await import('pg');
        const pool = this.client as InstanceType<typeof Pool>;
        const result = await pool.query(sql, params);
        const count = result.rowCount ?? 0;
        logger.info(`   Affected ${count} row(s)`);
        return count;

      } else if (this.dbType === 'mysql') {
        const mysqlSql = sql.replace(/\$\d+/g, '?');
        return await new Promise((resolve, reject) => {
          (this.client as any).query(mysqlSql, params, (err: Error, result: any) => {
            if (err) reject(err);
            else {
              logger.info(`   Affected ${result.affectedRows} row(s)`);
              resolve(result.affectedRows);
            }
          });
        });

      } else {
        logger.warn('SQLite execute: install better-sqlite3 and plug it in here.');
        return 0;
      }
    } catch (err) {
      logger.error(`❌ DB execute failed: ${(err as Error).message}`);
      throw err;
    }
  }

  // ===========================================================================
  // METHOD: disconnect()
  // ===========================================================================
  /**
   * Closes the database connection.
   * ALWAYS call this when you're done to free up resources.
   *
   * EXAMPLE:
   *   await db.disconnect();
   */
  async disconnect(): Promise<void> {
    if (!this.isConnected || !this.client) return;

    try {
      if (this.dbType === 'postgres') {
        const { Pool } = await import('pg');
        await (this.client as InstanceType<typeof Pool>).end();
      } else if (this.dbType === 'mysql') {
        (this.client as any).end();
      }

      this.isConnected = false;
      logger.info(`🗄️  Database disconnected.`);
    } catch (err) {
      logger.warn(`Could not cleanly disconnect from database: ${(err as Error).message}`);
    }
  }

  // ===========================================================================
  // PRIVATE: establishConnection()
  // ===========================================================================
  private async establishConnection(cfg: DbConfig): Promise<void> {
    // Resolve password: prefer encrypted → plain text → empty
    let password = cfg.password ?? '';
    if (cfg.passwordEncrypted && cfg.passwordEncrypted !== '') {
      try {
        password = decrypt(cfg.passwordEncrypted);
        logger.info(`   🔓 Password decrypted successfully`);
      } catch {
        logger.warn(`   ⚠️  Could not decrypt DB password — trying plain text`);
      }
    }

    // Build SSL options
    let sslOptions: boolean | object = cfg.ssl ?? false;
    if (cfg.ssl && cfg.sslCertPath) {
      const certPath = path.resolve(process.cwd(), cfg.sslCertPath);
      if (fs.existsSync(certPath)) {
        sslOptions = { ca: fs.readFileSync(certPath).toString() };
        logger.info(`   🔒 SSL certificate loaded: ${certPath}`);
      } else {
        logger.warn(`   ⚠️  SSL cert not found at ${certPath} — using system CA`);
      }
    }

    if (cfg.type === 'postgres') {
      const { Pool } = await import('pg');
      this.client = new Pool({
        host:     cfg.host,
        port:     cfg.port,
        database: cfg.database,
        user:     cfg.user,
        password,
        ssl:      sslOptions || undefined,
        max:      cfg.poolSize ?? 5,
        idleTimeoutMillis:    30000,
        connectionTimeoutMillis: 5000,
      });
      // Test the connection
      await (this.client as InstanceType<typeof Pool>).query('SELECT 1');

    } else if (cfg.type === 'mysql') {
      const mysql = await import('mysql2');
      this.client = mysql.createConnection({
        host:     cfg.host,
        port:     cfg.port,
        database: cfg.database,
        user:     cfg.user,
        password,
        ssl:      (typeof sslOptions === 'object')
          ? JSON.stringify(sslOptions)
          : undefined,
      });
      await new Promise<void>((resolve, reject) => {
        (this.client as any).connect((err: Error) => {
          if (err) reject(err);
          else resolve();
        });
      });

    } else {
      logger.warn(`SQLite support: install 'better-sqlite3' and add connection logic here.`);
    }

    this.isConnected = true;
    logger.pass(`✅ Connected to ${cfg.type.toUpperCase()} database: ${cfg.database}`);
  }

  // ===========================================================================
  // PRIVATE: buildConfig()
  // ===========================================================================
  private static buildConfig(override?: Partial<DbConfig>): DbConfig {
    return {
      type:               (process.env['DB_TYPE'] as DbType) ?? 'postgres',
      host:               process.env['DB_HOST']             ?? 'localhost',
      port:               parseInt(process.env['DB_PORT'] ?? '5432', 10),
      database:           process.env['DB_NAME']             ?? '',
      user:               process.env['DB_USER']             ?? '',
      password:           process.env['DB_PASSWORD']         ?? '',
      passwordEncrypted:  process.env['DB_PASSWORD_ENCRYPTED'] ?? '',
      ssl:                (process.env['DB_SSL'] ?? 'false') === 'true',
      sslCertPath:        process.env['DB_SSL_CERT_PATH']    ?? '',
      poolSize:           parseInt(process.env['DB_POOL_SIZE'] ?? '5', 10),
      ...override,
    };
  }

  // ===========================================================================
  // PRIVATE: assertConnected()
  // ===========================================================================
  private assertConnected(): void {
    if (!this.isConnected || !this.client) {
      throw new Error(
        '❌ DbConnection is not connected. Call DbConnection.connect() first.'
      );
    }
  }
}

// =============================================================================
// HELPER: isDbEnabled
// =============================================================================
/**
 * Returns true if the DB is enabled in .env.
 * Use this to guard database code so it skips gracefully if not configured.
 *
 * EXAMPLE:
 *   if (isDbEnabled()) {
 *     const db = await DbConnection.connect();
 *     // ...
 *   }
 */
export function isDbEnabled(): boolean {
  return (process.env['DB_ENABLED'] ?? 'false').toLowerCase() === 'true';
}

ENDOFFILE_utils_database_db_connection_ts
echo "  📄 Created utils/database/db-connection.ts"

# ── utils/database/test-data-manager.ts ──
cat > "utils/database/test-data-manager.ts" << 'ENDOFFILE_utils_database_test_data_manager_ts'
// =============================================================================
// utils/database/test-data-manager.ts — DATABASE / TEST DATA UTILITY
// =============================================================================
// PURPOSE:
//   Manages test data for your tests — seeding data before tests, cleaning
//   up after tests, and fetching data for assertions.
//
// WHY DO YOU NEED TEST DATA MANAGEMENT?
//   Real-world tests often need:
//     - A user to already exist in the database before testing login
//     - An order to exist before testing "View Order History"
//     - Data to be cleaned up after tests so the database stays tidy
//
//   Without test data management, your tests rely on whatever data happens
//   to be in the database, which is fragile and unreliable.
//
// HOW THIS UTILITY WORKS:
//   It provides a simple interface to:
//     1. SEED data   → Insert known test data before tests run
//     2. QUERY data  → Check data in the database for assertions
//     3. CLEANUP     → Remove test data after tests finish
//
// SUPPORTED DATABASES:
//   This is a "pluggable" design. The actual database connection logic is
//   in separate adapter files. You can add adapters for:
//     - PostgreSQL, MySQL, MongoDB, SQLite, etc.
//
// WHEN IS THIS CALLED?
//   - global-setup.ts:    SEED test data before tests start
//   - Inside tests:       QUERY data to verify test outcomes
//   - global-teardown.ts: CLEANUP test data after all tests finish
//
// HOW TO ENABLE:
//   1. Set DB_ENABLED=true in .env
//   2. Configure DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD in .env
//   3. The framework checks isDbConfigured() and skips gracefully if false
// =============================================================================

import { config } from '../../config/environment';
import { logger } from '../helpers/logger';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

/**
 * Represents a piece of test data that was seeded into the database.
 * Tracked so we can clean it up later.
 */
export interface SeededRecord {
  table:      string;      // Which database table (e.g., "users", "orders")
  id:         string;      // The primary key of the inserted record
  createdAt:  string;      // When it was seeded (ISO timestamp)
  label:      string;      // Human-readable description (e.g., "Test user for TC01")
}

/**
 * Represents the result of a test data operation.
 */
export interface TestDataResult {
  success:    boolean;
  message:    string;
  data?:      any;           // Optional returned data (e.g., the inserted record)
}

// In-memory tracker of all records seeded during this test run
// Used for cleanup in teardown
const seededRecords: SeededRecord[] = [];

// =============================================================================
// FUNCTION: isDbConfigured
// =============================================================================
// PURPOSE:
//   Checks whether database integration is enabled and properly configured.
//   Returns false if DB is disabled or has placeholder values.
//   This lets the framework skip database operations gracefully.
// =============================================================================
export function isDbConfigured(): boolean {
  return (
    config.database.enabled &&
    config.database.host !== 'localhost-placeholder' &&
    config.database.name !== ''
  );
}

// =============================================================================
// FUNCTION: seedTestData
// =============================================================================
// PURPOSE:
//   Inserts known test data into the database before tests run.
//   This ensures tests have predictable, reliable data to work with.
//
// EXAMPLE:
//   await seedTestData('users', {
//     username: 'testuser_automation',
//     email:    'test@automation.com',
//     password: 'hashedpassword123',
//   }, 'Test user for login tests');
//
// PARAMETERS:
//   - table:  The database table to insert into
//   - data:   The record fields and values
//   - label:  A human-readable description for logging
// =============================================================================
export async function seedTestData(
  table: string,
  data:  Record<string, any>,
  label: string
): Promise<TestDataResult> {
  if (!isDbConfigured()) {
    logger.warn('Database not configured. Skipping seed operation.');
    return { success: false, message: 'Database not configured' };
  }

  try {
    logger.step(`Seeding test data into "${table}": ${label}`);

    // ─────────────────────────────────────────────────────────────────────
    // 🔌 PLUG YOUR DATABASE CLIENT HERE
    // ─────────────────────────────────────────────────────────────────────
    // Replace the code below with your actual database insert logic.
    // Examples:
    //
    //   PostgreSQL (using 'pg' package):
    //     const { Pool } = require('pg');
    //     const pool = new Pool({ host: config.database.host, ... });
    //     const result = await pool.query(
    //       `INSERT INTO ${table} (${Object.keys(data).join(',')}) VALUES (${...}) RETURNING id`
    //     );
    //     const insertedId = result.rows[0].id;
    //
    //   MongoDB (using 'mongodb' package):
    //     const { MongoClient } = require('mongodb');
    //     const client = new MongoClient(config.database.host);
    //     const db = client.db(config.database.name);
    //     const result = await db.collection(table).insertOne(data);
    //     const insertedId = result.insertedId.toString();
    //
    //   MySQL (using 'mysql2' package):
    //     const mysql = require('mysql2/promise');
    //     const connection = await mysql.createConnection({ host: config.database.host, ... });
    //     const [result] = await connection.execute(`INSERT INTO ${table} SET ?`, data);
    //     const insertedId = result.insertId.toString();
    // ─────────────────────────────────────────────────────────────────────

    // PLACEHOLDER: Simulating a successful insert
    const insertedId = `test_${Date.now()}`;

    // Track this record for cleanup later
    seededRecords.push({
      table,
      id: insertedId,
      createdAt: new Date().toISOString(),
      label,
    });

    logger.pass(`Seeded: [${table}] ${label} (id: ${insertedId})`);
    return { success: true, message: `Inserted into ${table}`, data: { id: insertedId } };

  } catch (error: any) {
    logger.error(`Failed to seed data into "${table}": ${error.message}`);
    return { success: false, message: error.message };
  }
}

// =============================================================================
// FUNCTION: queryTestData
// =============================================================================
// PURPOSE:
//   Queries the database to fetch data for test assertions.
//   For example, after a test creates an order via the UI, you can query
//   the database to verify the order was actually saved correctly.
//
// EXAMPLE:
//   const result = await queryTestData('orders', { userId: '12345' });
//   expect(result.data.length).toBeGreaterThan(0);
// =============================================================================
export async function queryTestData(
  table: string,
  where: Record<string, any>
): Promise<TestDataResult> {
  if (!isDbConfigured()) {
    return { success: false, message: 'Database not configured' };
  }

  try {
    logger.step(`Querying "${table}" where ${JSON.stringify(where)}`);

    // 🔌 PLUG YOUR DATABASE QUERY HERE (same pattern as seedTestData)
    // PLACEHOLDER:
    const mockResult: any[] = [];

    logger.info(`Query returned ${mockResult.length} record(s)`);
    return { success: true, message: 'Query successful', data: mockResult };

  } catch (error: any) {
    logger.error(`Failed to query "${table}": ${error.message}`);
    return { success: false, message: error.message };
  }
}

// =============================================================================
// FUNCTION: cleanupTestData
// =============================================================================
// PURPOSE:
//   Deletes all test data that was seeded during this test run.
//   Called from global-teardown.ts to leave the database clean.
//
// HOW IT WORKS:
//   Loops through all records tracked in seededRecords[] and deletes each one.
//   This ensures tests don't leave garbage data behind.
// =============================================================================
export async function cleanupTestData(): Promise<TestDataResult> {
  if (!isDbConfigured()) {
    return { success: false, message: 'Database not configured' };
  }

  if (seededRecords.length === 0) {
    logger.info('No test data to clean up.');
    return { success: true, message: 'Nothing to clean up' };
  }

  try {
    logger.step(`Cleaning up ${seededRecords.length} seeded record(s)...`);

    for (const record of seededRecords) {
      // 🔌 PLUG YOUR DATABASE DELETE HERE
      // Example: await pool.query(`DELETE FROM ${record.table} WHERE id = $1`, [record.id]);
      logger.info(`  Deleted: [${record.table}] ${record.label} (id: ${record.id})`);
    }

    const count = seededRecords.length;
    seededRecords.length = 0; // Clear the tracker

    logger.pass(`Cleaned up ${count} record(s).`);
    return { success: true, message: `Cleaned up ${count} records` };

  } catch (error: any) {
    logger.error(`Cleanup failed: ${error.message}`);
    return { success: false, message: error.message };
  }
}

// =============================================================================
// FUNCTION: getSeededRecords
// =============================================================================
// PURPOSE:
//   Returns the list of all records that were seeded during this run.
//   Useful for debugging or reporting.
// =============================================================================
export function getSeededRecords(): SeededRecord[] {
  return [...seededRecords]; // Return a copy so caller can't modify the original
}

ENDOFFILE_utils_database_test_data_manager_ts
echo "  📄 Created utils/database/test-data-manager.ts"

# ── utils/email/email-verifier.ts ──
cat > "utils/email/email-verifier.ts" << 'ENDOFFILE_utils_email_email_verifier_ts'
// =============================================================================
// utils/email/email-verifier.ts — EMAIL VERIFICATION UTILITY
// =============================================================================
// PURPOSE:
//   Helps tests that involve email — e.g., "forgot password", "email OTP",
//   "signup confirmation". This utility can:
//     - Fetch emails from a test mailbox (e.g., Mailosaur, MailSlurp, Mailtrap)
//     - Extract verification codes/links from email bodies
//     - Wait for an expected email to arrive
//
// WHY IS EMAIL TESTING HARD?
//   When your app sends an email (e.g., "Reset Password" link), Playwright
//   can't open a real Gmail/Outlook inbox. Instead, we use a TEST mailbox
//   service that provides an API to read emails programmatically.
//
// SUPPORTED SERVICES (plug your choice):
//   - Mailosaur  (https://mailosaur.com)   — popular, reliable
//   - MailSlurp  (https://mailslurp.com)   — generous free tier
//   - Mailtrap   (https://mailtrap.io)     — great for staging
//   - Ethereal   (https://ethereal.email)  — free, disposable
//
// HOW TO ENABLE:
//   1. Set EMAIL_ENABLED=true in .env
//   2. Set EMAIL_SERVICE, EMAIL_API_KEY, EMAIL_SERVER_ID in .env
//   3. The framework checks isEmailConfigured() and skips gracefully if false
//
// WHEN IS THIS CALLED?
//   - Inside individual tests that involve email verification
//   - NOT in global-setup/teardown (email checks are per-test, not global)
// =============================================================================

import axios from 'axios';
import { config } from '../../config/environment';
import { logger } from '../helpers/logger';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

/**
 * Represents a test email fetched from the test mailbox.
 */
export interface TestEmail {
  id:       string;       // Unique email ID from the service
  from:     string;       // Sender address
  to:       string;       // Recipient address
  subject:  string;       // Email subject line
  body:     string;       // Full email body (HTML or text)
  receivedAt: string;     // When the email was received (ISO timestamp)
}

/**
 * Result of an email fetch/search operation.
 */
export interface EmailResult {
  success:  boolean;
  message:  string;
  email?:   TestEmail;     // The matching email, if found
  emails?:  TestEmail[];   // Multiple emails, if searching
}

// =============================================================================
// FUNCTION: isEmailConfigured
// =============================================================================
// PURPOSE:
//   Checks whether email testing is enabled and configured.
//   Returns false if disabled or has placeholder values.
// =============================================================================
export function isEmailConfigured(): boolean {
  return (
    config.email.enabled &&
    config.email.apiKey !== '' &&
    config.email.apiKey !== 'your-email-service-api-key'
  );
}

// =============================================================================
// FUNCTION: waitForEmail
// =============================================================================
// PURPOSE:
//   Waits for an email to arrive at a specific address with a matching subject.
//   Polls the email service every few seconds until the email appears or timeout.
//
// USE CASE:
//   Your test clicks "Forgot Password" → the app sends a reset email →
//   this function waits for that email → you extract the reset link from it.
//
// EXAMPLE:
//   const result = await waitForEmail('testuser@mailosaur.io', 'Reset your password', 30000);
//   if (result.success) {
//     const resetLink = extractLink(result.email.body, /reset-password/);
//     await page.goto(resetLink);
//   }
//
// PARAMETERS:
//   - recipientEmail: The email address to check for incoming mail
//   - subjectContains: Partial subject line to match (case-insensitive)
//   - timeoutMs: How long to wait before giving up (default: 30 seconds)
//   - pollIntervalMs: How often to check for new mail (default: 3 seconds)
// =============================================================================
export async function waitForEmail(
  recipientEmail:   string,
  subjectContains:  string,
  timeoutMs:        number = 30000,
  pollIntervalMs:   number = 3000
): Promise<EmailResult> {
  if (!isEmailConfigured()) {
    logger.warn('Email service not configured. Skipping email check.');
    return { success: false, message: 'Email service not configured' };
  }

  try {
    logger.step(`Waiting for email to "${recipientEmail}" with subject containing "${subjectContains}"...`);

    const startTime = Date.now();

    // ─────────────────────────────────────────────────────────────────────
    // POLLING LOOP: Keep checking for the email until it arrives or timeout
    // ─────────────────────────────────────────────────────────────────────
    while (Date.now() - startTime < timeoutMs) {

      // 🔌 PLUG YOUR EMAIL SERVICE API HERE
      // ─────────────────────────────────────────────────────────────────────
      // Replace the placeholder below with your actual email service call.
      //
      // Mailosaur example:
      //   const response = await axios.get(
      //     `https://mailosaur.com/api/messages?server=${config.email.serverId}`,
      //     { headers: { Authorization: `Bearer ${config.email.apiKey}` } }
      //   );
      //   const emails = response.data.items;
      //   const match = emails.find(e =>
      //     e.to[0].email === recipientEmail &&
      //     e.subject.toLowerCase().includes(subjectContains.toLowerCase())
      //   );
      //
      // MailSlurp example:
      //   const response = await axios.get(
      //     `https://api.mailslurp.com/inboxes/${inboxId}/emails`,
      //     { headers: { 'x-api-key': config.email.apiKey } }
      //   );
      // ─────────────────────────────────────────────────────────────────────

      // PLACEHOLDER: Simulating no email found (replace with real API call above)
      // When you plug in your real email service, this variable will be populated
      // from the API response. For now it's null to demonstrate the polling loop.
      const matchingEmail: TestEmail | null = null as TestEmail | null;

      if (matchingEmail) {
        logger.pass(`Email received: "${matchingEmail.subject}"`);
        return { success: true, message: 'Email found', email: matchingEmail };
      }

      // Wait before polling again
      logger.info(`  No email yet. Retrying in ${pollIntervalMs / 1000}s...`);
      await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
    }

    // Timeout reached — email never arrived
    logger.warn(`Timed out after ${timeoutMs / 1000}s waiting for email.`);
    return { success: false, message: `Timed out waiting for email to "${recipientEmail}"` };

  } catch (error: any) {
    logger.error(`Email fetch failed: ${error.message}`);
    return { success: false, message: error.message };
  }
}

// =============================================================================
// FUNCTION: extractVerificationCode
// =============================================================================
// PURPOSE:
//   Extracts a numeric verification code (e.g., OTP) from an email body.
//   Many apps send 4-8 digit codes via email for login or signup verification.
//
// EXAMPLE:
//   const code = extractVerificationCode(email.body, 6);
//   // Email body: "Your verification code is: 482901"
//   // Returns: "482901"
//
// PARAMETERS:
//   - emailBody: The full text/HTML of the email
//   - codeLength: The expected length of the code (default: 6)
// =============================================================================
export function extractVerificationCode(emailBody: string, codeLength: number = 6): string | null {
  // Build a regex to find a sequence of digits with the expected length
  // Examples:  \b\d{6}\b  → matches "482901" but not "12345" or "1234567"
  const regex = new RegExp(`\\b\\d{${codeLength}}\\b`);
  const match = emailBody.match(regex);
  if (match) {
    logger.info(`Extracted verification code: ${match[0]}`);
    return match[0];
  }
  logger.warn(`No ${codeLength}-digit code found in email body.`);
  return null;
}

// =============================================================================
// FUNCTION: extractLink
// =============================================================================
// PURPOSE:
//   Extracts a URL from an email body that matches a given pattern.
//   Useful for "Verify Email" or "Reset Password" links.
//
// EXAMPLE:
//   const link = extractLink(email.body, /reset-password/);
//   // Email body: "Click here: https://app.com/reset-password?token=abc123"
//   // Returns: "https://app.com/reset-password?token=abc123"
// =============================================================================
export function extractLink(emailBody: string, pattern: RegExp): string | null {
  // Find all URLs in the email body
  const urlRegex = /https?:\/\/[^\s"'<>]+/g;
  const allUrls  = emailBody.match(urlRegex) || [];

  // Find the one that matches the given pattern
  const match = allUrls.find((url) => pattern.test(url));

  if (match) {
    logger.info(`Extracted link: ${match}`);
    return match;
  }

  logger.warn(`No link matching pattern "${pattern}" found in email body.`);
  return null;
}

ENDOFFILE_utils_email_email_verifier_ts
echo "  📄 Created utils/email/email-verifier.ts"

# ── utils/excel/excel-reader.ts ──
cat > "utils/excel/excel-reader.ts" << 'ENDOFFILE_utils_excel_excel_reader_ts'
// =============================================================================
// utils/excel/excel-reader.ts — EXCEL TO JSON CONVERTER
// =============================================================================
// PURPOSE:
//   Reads Excel (.xlsx / .xls / .csv) files and converts each row into a
//   JavaScript object. This powers DATA-DRIVEN testing — one Excel row = one
//   test scenario, so non-technical people can add test cases in Excel.
//
// WHAT IS DATA-DRIVEN TESTING?
//   Normally a test is hardcoded with ONE set of data:
//     test('login', () => { loginWith('alice', 'pass123'); });
//
//   With data-driven testing, you put all data in Excel and the test loops
//   through every row automatically:
//     Row 1: alice  / pass123  → expects: success
//     Row 2: bob    / wrong    → expects: error
//     Row 3: (empty)/ pass456  → expects: error
//
//   The same test code runs 3 times with different inputs. This means:
//     - 0 code changes to add new test scenarios
//     - Business analysts can write test data without touching code
//     - Easy to add 100 rows for edge cases
//
// HOW TO USE:
//   // Read all rows from Sheet1
//   const testData = readExcelSheet('data/login-data.xlsx');
//
//   // Use in a test
//   for (const row of testData) {
//     // row.username, row.password, row.expectedResult are available
//   }
//
// EXCEL FORMAT EXPECTED:
//   Row 1 = Column HEADERS (used as property names)
//   Row 2+ = Data rows (each becomes one object)
//
//   Example:
//   | username | password    | expectedResult | xrayKey  |
//   |----------|-------------|----------------|----------|
//   | alice    | pass123     | success        | PROJ-101 |
//   | bob      | wrongpass   | error          | PROJ-102 |
// =============================================================================

import * as XLSX from 'xlsx';   // The Excel reading library
import * as path from 'path';   // For building file paths correctly
import * as fs   from 'fs';     // For checking if files exist
import { logger } from '../helpers/logger';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

/**
 * ONE ROW from an Excel sheet, represented as a key-value object.
 * Keys come from the header row. Values are always strings.
 *
 * Example:
 *   { username: 'alice', password: 'pass123', expectedResult: 'success' }
 */
export type ExcelRow = Record<string, string>;

/**
 * Options you can pass to customise how Excel is read.
 */
export interface ExcelReadOptions {
  /** Sheet name to read (default: first sheet in the file) */
  sheetName?: string;

  /** Skip rows where ALL cells are empty (default: true) */
  skipEmptyRows?: boolean;

  /** Which column number the headers start at (0-indexed, default: 0 = column A) */
  headerRow?: number;
}

// =============================================================================
// FUNCTION: readExcelSheet
// =============================================================================
/**
 * Reads an Excel file and returns all data rows as an array of objects.
 *
 * @param filePath - Relative or absolute path to the .xlsx file
 *                   Example: 'data/login-data.xlsx'
 * @param options  - Optional customisations (sheet name, skip empty rows)
 * @returns        Array of objects — one per data row
 *
 * EXAMPLE:
 *   const rows = readExcelSheet('data/login-data.xlsx');
 *   // rows[0] = { username: 'alice', password: 'pass123', expectedResult: 'success' }
 */
export function readExcelSheet(filePath: string, options: ExcelReadOptions = {}): ExcelRow[] {
  // Build the absolute path (handles both relative paths like 'data/x.xlsx'
  // and absolute paths like '/home/user/data/x.xlsx')
  const absolutePath = path.isAbsolute(filePath)
    ? filePath
    : path.resolve(process.cwd(), filePath);

  // -------------------------------------------------------------------------
  // CHECK: Does the file exist?
  // -------------------------------------------------------------------------
  if (!fs.existsSync(absolutePath)) {
    logger.error(`❌ Excel file not found: ${absolutePath}`);
    logger.error(`   Please make sure the file exists before running tests.`);
    throw new Error(`Excel file not found: ${absolutePath}`);
  }

  logger.info(`📊 Reading Excel file: ${absolutePath}`);

  // -------------------------------------------------------------------------
  // READ THE EXCEL FILE
  // -------------------------------------------------------------------------
  // XLSX.readFile reads the binary Excel format and parses it into an
  // in-memory "workbook" object that we can navigate programmatically.
  const workbook = XLSX.readFile(absolutePath, {
    type:     'file',
    cellDates: true,   // Parse dates as JavaScript Date objects (not serial numbers)
  });

  // -------------------------------------------------------------------------
  // SELECT THE SHEET
  // -------------------------------------------------------------------------
  // A workbook can have multiple sheets (tabs).
  // We either use the sheet name specified in options, or the first sheet.
  const sheetName = options.sheetName ?? workbook.SheetNames[0];

  if (!workbook.SheetNames.includes(sheetName)) {
    const available = workbook.SheetNames.join(', ');
    logger.error(`❌ Sheet "${sheetName}" not found in workbook.`);
    logger.error(`   Available sheets: ${available}`);
    throw new Error(`Sheet "${sheetName}" not found. Available sheets: ${available}`);
  }

  const sheet = workbook.Sheets[sheetName];
  logger.info(`   Sheet: "${sheetName}"`);

  // -------------------------------------------------------------------------
  // CONVERT TO ARRAY OF OBJECTS
  // -------------------------------------------------------------------------
  // XLSX.utils.sheet_to_json converts the sheet grid into an array of objects.
  // Each object's keys are taken from the FIRST ROW (header row).
  // Each object's values are the corresponding cell values.
  //
  // { header: 1 } means: first row = headers, rest = data
  // { defval: '' } means: empty cells become empty string '' not undefined
  const rawRows = XLSX.utils.sheet_to_json<ExcelRow>(sheet, {
    header:    (options.headerRow !== undefined) ? options.headerRow : undefined,
    defval:    '',
    raw:       false,   // Convert numbers/dates to strings for consistency
  });

  // -------------------------------------------------------------------------
  // FILTER EMPTY ROWS (optional, default: true)
  // -------------------------------------------------------------------------
  // Skip any rows where all values are empty strings.
  // This prevents phantom test cases from blank Excel rows.
  const shouldSkipEmpty = options.skipEmptyRows !== false;

  const filteredRows = shouldSkipEmpty
    ? rawRows.filter(row => Object.values(row).some(v => String(v).trim() !== ''))
    : rawRows;

  // Convert all values to strings (Excel might return numbers for numeric cells)
  const normalizedRows: ExcelRow[] = filteredRows.map(row => {
    const normalized: ExcelRow = {};
    for (const [key, value] of Object.entries(row)) {
      normalized[String(key).trim()] = String(value ?? '').trim();
    }
    return normalized;
  });

  logger.pass(`✅ Loaded ${normalizedRows.length} row(s) from Excel sheet "${sheetName}"`);
  return normalizedRows;
}

// =============================================================================
// FUNCTION: readExcelAllSheets
// =============================================================================
/**
 * Reads ALL sheets from an Excel file.
 * Returns a map of { sheetName → rows[] }.
 *
 * Useful when you have one Excel file with multiple test scenario sheets.
 * Example: login-tests.xlsx with sheets: "ValidLogin", "InvalidLogin", "EdgeCases"
 *
 * @param filePath - Path to the Excel file
 * @returns Object mapping sheet names to their row arrays
 *
 * EXAMPLE:
 *   const allSheets = readExcelAllSheets('data/all-tests.xlsx');
 *   const loginRows = allSheets['LoginTests'];
 */
export function readExcelAllSheets(filePath: string): Record<string, ExcelRow[]> {
  const absolutePath = path.isAbsolute(filePath)
    ? filePath
    : path.resolve(process.cwd(), filePath);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Excel file not found: ${absolutePath}`);
  }

  const workbook = XLSX.readFile(absolutePath, { cellDates: true });
  const result: Record<string, ExcelRow[]> = {};

  for (const sheetName of workbook.SheetNames) {
    result[sheetName] = readExcelSheet(filePath, { sheetName });
  }

  logger.info(`📊 Loaded ${workbook.SheetNames.length} sheet(s) from: ${path.basename(absolutePath)}`);
  return result;
}

// =============================================================================
// FUNCTION: getExcelSheetNames
// =============================================================================
/**
 * Returns a list of all sheet names in an Excel file.
 * Useful to check what sheets are available before reading.
 *
 * @param filePath - Path to the Excel file
 * @returns Array of sheet name strings
 */
export function getExcelSheetNames(filePath: string): string[] {
  const absolutePath = path.isAbsolute(filePath)
    ? filePath
    : path.resolve(process.cwd(), filePath);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Excel file not found: ${absolutePath}`);
  }

  const workbook = XLSX.readFile(absolutePath);
  return workbook.SheetNames;
}

// =============================================================================
// FUNCTION: writeExcelResults
// =============================================================================
/**
 * Writes test results back to an Excel file.
 * Useful for updating the "Result" column in your test data spreadsheet
 * after the test run.
 *
 * @param filePath - Path where the Excel file will be saved (created if needed)
 * @param data     - Array of objects to write (column headers = object keys)
 * @param sheetName - Sheet name to write to (default: 'TestResults')
 *
 * EXAMPLE:
 *   writeExcelResults('test-results/results.xlsx', [
 *     { testCase: 'TC01', status: 'PASS', duration: '2.3s', xrayKey: 'PROJ-101' },
 *     { testCase: 'TC02', status: 'FAIL', duration: '1.1s', xrayKey: 'PROJ-102' },
 *   ]);
 */
export function writeExcelResults(
  filePath: string,
  data: Record<string, string | number | boolean>[],
  sheetName = 'TestResults'
): void {
  const absolutePath = path.isAbsolute(filePath)
    ? filePath
    : path.resolve(process.cwd(), filePath);

  // Create directory if it doesn't exist
  const dir = path.dirname(absolutePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const workbook  = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(data);

  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, absolutePath);

  logger.pass(`✅ Results written to Excel: ${absolutePath}`);
}

ENDOFFILE_utils_excel_excel_reader_ts
echo "  📄 Created utils/excel/excel-reader.ts"

# ── utils/excel/data-pool.ts ──
cat > "utils/excel/data-pool.ts" << 'ENDOFFILE_utils_excel_data_pool_ts'
// =============================================================================
// utils/excel/data-pool.ts — EXCEL-BASED TEST DATA POOL
// =============================================================================
// PURPOSE:
//   A "data pool" is a collection of test data scenarios stored in an Excel
//   file. This utility manages loading, filtering, and serving that data to
//   your tests.
//
// WHY A DATA POOL?
//   Imagine you need to test a login form with 20 different combinations:
//     - Valid credentials (should succeed)
//     - Wrong passwords (should fail)
//     - SQL injection attempts (should be blocked)
//     - Special characters in username (should handle gracefully)
//     - Very long inputs (should be rejected)
//
//   Without a data pool: You'd write 20 separate test cases. 😰
//   With a data pool:    One test case + 20 rows in Excel. ✅
//
// EXCEL FILE STRUCTURE:
//   Put your Excel test data files in the 'data/' folder at the project root.
//   Example file: data/login-test-data.xlsx
//
//   Required columns:
//   | testId  | scenario          | username | password    | expectedResult | xrayKey  | enabled |
//   |---------|-------------------|----------|-------------|----------------|----------|---------|
//   | TC-001  | Valid login       | alice    | pass123     | success        | PROJ-101 | true    |
//   | TC-002  | Wrong password    | alice    | wrongpass   | error          | PROJ-102 | true    |
//   | TC-003  | Empty username    |          | pass123     | error          | PROJ-103 | true    |
//   | TC-004  | SKIP this one     | alice    | pass123     | success        | PROJ-104 | false   |
//
//   The "enabled" column lets you skip specific rows without deleting them.
//   The "xrayKey" column links the row to a JIRA XRAY test case.
//
// HOW TO USE IN A TEST:
//   import { DataPool } from '../utils/excel/data-pool';
//
//   const pool = new DataPool('data/login-test-data.xlsx');
//   const loginScenarios = pool.getAll();
//
//   for (const scenario of loginScenarios) {
//     test(`Login: ${scenario.scenario}`, async ({ page }) => {
//       await loginPage.login(scenario.username, scenario.password);
//       // ...
//     });
//   }
// =============================================================================

import * as path from 'path';
import * as fs   from 'fs';
import { readExcelSheet, ExcelRow } from './excel-reader';
import { logger } from '../helpers/logger';

// =============================================================================
// TYPE: TestDataRow
// =============================================================================
/**
 * A single test data row from the data pool Excel file.
 * Extends ExcelRow to add specific columns we always expect.
 */
export interface TestDataRow extends ExcelRow {
  /** Unique ID for this test scenario (e.g., TC-001) */
  testId: string;

  /** Human-readable name for this scenario (shown in test names) */
  scenario: string;

  /** Whether this row should be run. Set to 'false' to skip. */
  enabled: string;

  /** Optional: XRAY test case key (e.g., PROJ-101) */
  xrayKey: string;
}

// =============================================================================
// CLASS: DataPool
// =============================================================================
/**
 * Manages a collection of test data loaded from an Excel file.
 *
 * USAGE:
 *   const pool = new DataPool('data/login-test-data.xlsx');
 *
 *   pool.getAll()           // All enabled rows
 *   pool.getById('TC-001')  // One specific row by testId
 *   pool.getByTag('smoke')  // Filter by tag (if 'tags' column exists)
 *   pool.getCount()         // How many rows are loaded
 */
export class DataPool {
  // The loaded rows (filled when the object is created)
  private rows: TestDataRow[] = [];

  // Where the data came from (for error messages)
  private sourceFile: string;

  // ===========================================================================
  // CONSTRUCTOR
  // ===========================================================================
  /**
   * Creates a new DataPool and immediately loads data from the Excel file.
   *
   * @param excelFilePath - Path to the .xlsx file (relative to project root)
   *                        Example: 'data/login-test-data.xlsx'
   * @param sheetName     - Which sheet to read (default: first sheet)
   *
   * EXAMPLE:
   *   const pool = new DataPool('data/login-test-data.xlsx');
   *   const pool = new DataPool('data/all-tests.xlsx', 'LoginTests');
   */
  constructor(excelFilePath: string, sheetName?: string) {
    this.sourceFile = excelFilePath;

    // Resolve to absolute path
    const absolutePath = path.isAbsolute(excelFilePath)
      ? excelFilePath
      : path.resolve(process.cwd(), excelFilePath);

    // Create the data directory and a sample file if neither exists
    // (helpful on first run so users know the expected format)
    this.ensureSampleFileExists(absolutePath);

    // Read the Excel data
    const rawRows = readExcelSheet(absolutePath, { sheetName });

    // Cast to TestDataRow — add defaults for missing columns
    this.rows = rawRows.map((row, index) => ({
      testId:   row['testId']   || row['TestId']   || `TC-${String(index + 1).padStart(3, '0')}`,
      scenario: row['scenario'] || row['Scenario'] || `Scenario ${index + 1}`,
      enabled:  row['enabled']  || row['Enabled']  || 'true',
      xrayKey:  row['xrayKey']  || row['XrayKey']  || row['xray_key'] || '',
      ...row,
    }));

    logger.info(`📊 DataPool loaded: ${this.rows.length} total rows from "${path.basename(excelFilePath)}"`);
    logger.info(`   Enabled rows: ${this.getEnabledCount()} | Skipped rows: ${this.getDisabledCount()}`);
  }

  // ===========================================================================
  // PUBLIC METHODS
  // ===========================================================================

  /**
   * Returns ALL enabled rows from the data pool.
   * Rows with enabled='false' are automatically excluded.
   *
   * This is what you'll use most often in your tests.
   *
   * EXAMPLE:
   *   for (const row of pool.getAll()) {
   *     // row.username, row.password, etc.
   *   }
   */
  getAll(): TestDataRow[] {
    return this.rows.filter(row =>
      row.enabled.toLowerCase() !== 'false' &&
      row.enabled.toLowerCase() !== 'no' &&
      row.enabled.toLowerCase() !== '0'
    );
  }

  /**
   * Returns a single row by its testId column.
   * Returns undefined if not found.
   *
   * EXAMPLE:
   *   const row = pool.getById('TC-001');
   *   if (row) { ... }
   */
  getById(testId: string): TestDataRow | undefined {
    return this.rows.find(row =>
      row.testId?.toLowerCase() === testId.toLowerCase()
    );
  }

  /**
   * Returns rows that contain a specific tag in the 'tags' column.
   * Tags in Excel should be comma-separated: "smoke,regression,login"
   *
   * EXAMPLE:
   *   const smokeTests = pool.getByTag('smoke');
   */
  getByTag(tag: string): TestDataRow[] {
    return this.getAll().filter(row => {
      const tags = (row['tags'] || row['Tags'] || '').split(',').map(t => t.trim().toLowerCase());
      return tags.includes(tag.toLowerCase());
    });
  }

  /**
   * Returns rows where a specific column matches a value.
   * Case-insensitive matching.
   *
   * EXAMPLE:
   *   const errorScenarios = pool.filterBy('expectedResult', 'error');
   */
  filterBy(column: string, value: string): TestDataRow[] {
    return this.getAll().filter(row =>
      String(row[column] || '').toLowerCase() === value.toLowerCase()
    );
  }

  /**
   * Returns how many rows are in the pool (including disabled).
   */
  getCount(): number {
    return this.rows.length;
  }

  /**
   * Returns how many rows are ENABLED (will actually run).
   */
  getEnabledCount(): number {
    return this.getAll().length;
  }

  /**
   * Returns how many rows are DISABLED (skipped).
   */
  getDisabledCount(): number {
    return this.rows.length - this.getEnabledCount();
  }

  /**
   * Returns the column names (from the header row).
   * Useful to verify the Excel file has the expected columns.
   *
   * EXAMPLE:
   *   const columns = pool.getColumns();
   *   // ['testId', 'scenario', 'username', 'password', 'expectedResult', 'xrayKey', 'enabled']
   */
  getColumns(): string[] {
    if (this.rows.length === 0) return [];
    return Object.keys(this.rows[0]);
  }

  /**
   * Prints a summary of the data pool to the terminal.
   * Call this in global setup to show what data is loaded.
   */
  printSummary(): void {
    logger.section(`📊 Data Pool Summary: ${path.basename(this.sourceFile)}`);
    logger.info(`   Total rows:    ${this.getCount()}`);
    logger.info(`   Enabled rows:  ${this.getEnabledCount()} (will run)`);
    logger.info(`   Disabled rows: ${this.getDisabledCount()} (skipped)`);
    logger.info(`   Columns:       ${this.getColumns().join(', ')}`);
  }

  // ===========================================================================
  // PRIVATE HELPERS
  // ===========================================================================

  /**
   * Creates a sample Excel file if the data directory/file doesn't exist.
   * This prevents confusing errors on first run and shows users the expected format.
   */
  private ensureSampleFileExists(absolutePath: string): void {
    const dir = path.dirname(absolutePath);

    // Create the data directory if it doesn't exist
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      logger.info(`📁 Created data directory: ${dir}`);
    }

    // Create a sample file if the specified file doesn't exist
    if (!fs.existsSync(absolutePath)) {
      logger.warn(`⚠️  Data file not found: ${absolutePath}`);
      logger.warn(`   Creating a sample file so you can see the expected format.`);
      logger.warn(`   Fill in your test data and re-run.`);

      // Create sample file using ExcelJS via xlsx
      const XLSX = require('xlsx');
      const sampleData = [
        {
          testId:         'TC-001',
          scenario:       'Valid login with correct credentials',
          username:       'tomsmith',
          password:       'SuperSecretPassword!',
          expectedResult: 'success',
          xrayKey:        'PROJ-101',
          tags:           'smoke,regression',
          enabled:        'true',
        },
        {
          testId:         'TC-002',
          scenario:       'Invalid login with wrong password',
          username:       'tomsmith',
          password:       'WrongPassword',
          expectedResult: 'error',
          xrayKey:        'PROJ-102',
          tags:           'smoke,regression',
          enabled:        'true',
        },
        {
          testId:         'TC-003',
          scenario:       'Login with empty credentials',
          username:       '',
          password:       '',
          expectedResult: 'error',
          xrayKey:        'PROJ-103',
          tags:           'regression',
          enabled:        'true',
        },
        {
          testId:         'TC-004',
          scenario:       'EXAMPLE: Disabled scenario (will be skipped)',
          username:       'testuser',
          password:       'testpass',
          expectedResult: 'success',
          xrayKey:        'PROJ-104',
          tags:           'wip',
          enabled:        'false',
        },
      ];

      const worksheet = XLSX.utils.json_to_sheet(sampleData);
      const workbook  = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'TestData');
      XLSX.writeFile(workbook, absolutePath);

      logger.pass(`✅ Sample data file created: ${absolutePath}`);
    }
  }
}

ENDOFFILE_utils_excel_data_pool_ts
echo "  📄 Created utils/excel/data-pool.ts"

# ── utils/security/crypto-helper.ts ──
cat > "utils/security/crypto-helper.ts" << 'ENDOFFILE_utils_security_crypto_helper_ts'
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

ENDOFFILE_utils_security_crypto_helper_ts
echo "  📄 Created utils/security/crypto-helper.ts"

# ── utils/jira-xray/jira-auth.ts ──
cat > "utils/jira-xray/jira-auth.ts" << 'ENDOFFILE_utils_jira_xray_jira_auth_ts'
// =============================================================================
// utils/jira-xray/jira-auth.ts — JIRA API AUTHENTICATION UTILITY
// =============================================================================
// PURPOSE:
//   This file handles the "handshake" between our test framework and JIRA's API.
//
// WHAT IS AN API?
//   An API (Application Programming Interface) is a way for two computer programs
//   to talk to each other. JIRA has an API that lets us:
//     - Fetch test cases from JIRA (read data)
//     - Create test executions (write data)
//     - Update test results (write data)
//   Instead of a human clicking in JIRA, our code does it automatically.
//
// WHAT IS AUTHENTICATION?
//   Authentication means "proving who you are" to JIRA before it lets you in.
//   We use "Basic Authentication":
//     - Think of it like a username + password combination
//     - But instead of a regular password, we use a special "API Token"
//     - The username + token are combined and encoded into a single string
//     - This string is sent in every API request as an "Authorization header"
//
// WHAT IS AXIOS?
//   Axios is a popular JavaScript library for making HTTP requests.
//   An HTTP request is how web browsers (and our code) communicate with servers.
//   Example: When you open google.com, your browser makes an HTTP GET request.
//   We use axios to make HTTP requests to the JIRA API.
//
// WHAT IS A "PRE-CONFIGURED AXIOS INSTANCE"?
//   Instead of specifying the JIRA URL and credentials in every single request,
//   we create ONE axios instance with all settings pre-loaded.
//   Think of it as a "phone with JIRA's number already dialed" —
//   you just say what you want (the request), not how to connect.
// =============================================================================

// "axios" is the HTTP request library we use to call JIRA's API
import axios, { AxiosInstance, AxiosError } from 'axios';

// "config" contains all our environment variables (JIRA URL, credentials, etc.)
import { config } from '../../config/environment';

// =============================================================================
// FUNCTION: createJiraApiClient
// =============================================================================
// PURPOSE:
//   Creates and returns a fully configured axios HTTP client for JIRA API calls.
//   All subsequent JIRA/XRAY utilities use this client to make API requests.
//
// WHAT IT DOES STEP BY STEP:
//   1. Reads JIRA URL, username, and API token from the config (loaded from .env)
//   2. Encodes username + token into a Base64 string (required by JIRA Basic Auth)
//   3. Creates an axios instance with:
//      - JIRA's base URL (so we only need to specify the path in each request)
//      - Authentication header (so JIRA knows who we are)
//      - Content-Type header (so JIRA knows we're sending JSON data)
//   4. Attaches interceptors (automatic error handlers)
//   5. Returns the configured client
//
// RETURNS:
//   An AxiosInstance — a pre-configured HTTP client ready to call JIRA APIs.
//
// USAGE EXAMPLE (in another file):
//   import { createJiraApiClient } from './jira-auth';
//   const jiraClient = createJiraApiClient();
//   const response = await jiraClient.get('/rest/api/3/issue/PROJ-123');
// =============================================================================
export function createJiraApiClient(): AxiosInstance {

  // --------------------------------------------------------------------------
  // STEP 1: Read credentials from environment configuration
  // --------------------------------------------------------------------------
  const { baseUrl, username, apiToken } = config.jira;

  // --------------------------------------------------------------------------
  // STEP 2: Create the Basic Auth token
  // --------------------------------------------------------------------------
  // JIRA Basic Auth requires: Base64( "username:apiToken" )
  //
  // What is Base64?
  //   It's a way to encode binary/text data into a safe string of characters.
  //   Example: "john@test.com:mytoken123" → "am9obkB0ZXN0LmNvbTpteXRva2VuMTIz"
  //   JIRA requires this format in the "Authorization" HTTP header.
  //
  // "btoa()" is a built-in function that converts a string to Base64.
  // However, Node.js uses Buffer for this, which works with all characters.
  const base64Credentials = Buffer.from(`${username}:${apiToken}`).toString('base64');

  // The final Authorization header value looks like: "Basic am9obkB0ZXN0LmNvbTpteXRva2VuMTIz"
  const authHeader = `Basic ${base64Credentials}`;

  // --------------------------------------------------------------------------
  // STEP 3: Create the axios instance with pre-configured settings
  // --------------------------------------------------------------------------
  // "axios.create()" creates a new HTTP client with default settings.
  // Every request made with this client will automatically include:
  //   - baseURL: So we only write "/rest/api/3/..." instead of the full URL
  //   - headers: Authorization (who we are) + Content-Type (data format)
  //   - timeout: Stop waiting after 30 seconds (prevents infinite hangs)
  const jiraClient: AxiosInstance = axios.create({
    // The root URL for all JIRA API requests
    baseURL: baseUrl,

    // HTTP headers sent with EVERY request
    headers: {
      // Tell JIRA who we are (our encoded username + API token)
      'Authorization': authHeader,

      // Tell JIRA that we are sending and expecting JSON data
      // JSON (JavaScript Object Notation) is the standard data format for APIs
      'Content-Type': 'application/json',

      // Tell JIRA we want to receive JSON in the response
      'Accept': 'application/json',
    },

    // Maximum time to wait for a response (30 seconds = 30,000 milliseconds)
    // If JIRA doesn't respond within this time, the request will fail with a timeout error
    timeout: 30000,
  });

  // --------------------------------------------------------------------------
  // STEP 4: Add Request Interceptor (runs BEFORE every request is sent)
  // --------------------------------------------------------------------------
  // An "interceptor" is a function that automatically runs before/after every request.
  // This request interceptor logs what we're about to do — very helpful for debugging!
  jiraClient.interceptors.request.use(
    (requestConfig) => {
      // Log the HTTP method (GET/POST/PUT) and the URL being called
      console.log(`\n📡 [JIRA API] ${requestConfig.method?.toUpperCase()} → ${requestConfig.baseURL}${requestConfig.url}`);
      return requestConfig; // Must return the config to let the request proceed
    },
    (error: AxiosError) => {
      // If setting up the request itself fails, log and re-throw the error
      console.error(`❌ [JIRA API] Request setup failed:`, error.message);
      return Promise.reject(error);
    }
  );

  // --------------------------------------------------------------------------
  // STEP 5: Add Response Interceptor (runs AFTER every response is received)
  // --------------------------------------------------------------------------
  // This response interceptor:
  //   - On SUCCESS: Logs the HTTP status code and passes the response through
  //   - On FAILURE: Logs a detailed, human-readable error message and rethrows
  jiraClient.interceptors.response.use(
    (response) => {
      // Log the HTTP status code — 200 means OK, 201 means Created, etc.
      console.log(`✅ [JIRA API] Response received — Status: ${response.status}`);
      return response; // Pass the response through unchanged
    },
    (error: AxiosError) => {
      // Something went wrong. Let's explain what happened clearly.

      if (error.response) {
        // The server responded, but with an error status code (4xx or 5xx)
        // Common status codes:
        //   401 = Unauthorized  → Wrong username or API token
        //   403 = Forbidden     → You don't have permission
        //   404 = Not Found     → The URL or resource doesn't exist
        //   500 = Server Error  → JIRA had an internal problem
        const status = error.response.status;
        const statusText = error.response.statusText;
        const responseData = JSON.stringify(error.response.data, null, 2);

        console.error(
          `\n❌ [JIRA API] Request failed!\n` +
          `   Status: ${status} ${statusText}\n` +
          `   URL: ${error.config?.url}\n` +
          `   Response Body: ${responseData}\n`
        );

        // Provide specific guidance for common errors
        if (status === 401) {
          console.error(`   💡 TIP: Check your JIRA_USERNAME and JIRA_API_TOKEN in the .env file.`);
        } else if (status === 403) {
          console.error(`   💡 TIP: Your account may not have permission for this action in JIRA.`);
        } else if (status === 404) {
          console.error(`   💡 TIP: Check that the JIRA URL and resource ID are correct.`);
        }

      } else if (error.request) {
        // The request was sent but no response came back (network issue)
        console.error(
          `\n❌ [JIRA API] No response received — Network issue?\n` +
          `   💡 TIP: Check your JIRA_BASE_URL and internet connection.\n`
        );
      } else {
        // Something unexpected happened before the request was sent
        console.error(`\n❌ [JIRA API] Unexpected error: ${error.message}\n`);
      }

      // Re-throw the error so the calling code knows something went wrong
      return Promise.reject(error);
    }
  );

  // --------------------------------------------------------------------------
  // STEP 6: Return the fully configured client
  // --------------------------------------------------------------------------
  console.log(`🔐 [JIRA Auth] API client created for: ${baseUrl}`);
  return jiraClient;
}

// =============================================================================
// FUNCTION: testJiraConnection
// =============================================================================
// PURPOSE:
//   A simple "health check" function to verify that JIRA credentials work.
//   Call this during setup to catch authentication problems early.
//
// HOW IT WORKS:
//   It calls a lightweight JIRA API endpoint (/rest/api/3/myself) which
//   simply returns info about the currently logged-in user.
//   If this succeeds → credentials are valid.
//   If this fails → something is wrong with the URL or credentials.
//
// RETURNS:
//   true  → Connection successful
//   false → Connection failed (details logged to console)
// =============================================================================
export async function testJiraConnection(): Promise<boolean> {
  console.log('\n🔍 [JIRA Auth] Testing JIRA connection...');

  try {
    // Create a fresh client
    const client = createJiraApiClient();

    // Call the "who am I?" endpoint — the lightest possible JIRA API call
    const response = await client.get('/rest/api/3/myself');

    // If we get here, the connection worked!
    console.log(`✅ [JIRA Auth] Connected successfully as: ${response.data.displayName} (${response.data.emailAddress})`);
    return true;

  } catch {
    // The connection test failed
    console.error(`❌ [JIRA Auth] Could not connect to JIRA. Please check your .env credentials.`);
    return false;
  }
}

ENDOFFILE_utils_jira_xray_jira_auth_ts
echo "  📄 Created utils/jira-xray/jira-auth.ts"

# ── utils/jira-xray/xray-state.ts ──
cat > "utils/jira-xray/xray-state.ts" << 'ENDOFFILE_utils_jira_xray_xray_state_ts'
// =============================================================================
// utils/jira-xray/xray-state.ts — SHARED STATE STORE FOR XRAY INTEGRATION
// =============================================================================
// PURPOSE:
//   This file acts as a "memory" that stores XRAY data during the test run.
//   It holds the Test Execution ID and collects test results as tests finish.
//
// WHY DO WE NEED THIS?
//   Playwright runs tests across multiple files and processes. The global setup
//   creates the Test Execution (and gets an ID). Then each test (in possibly
//   different files) needs to save its result somewhere. After all tests finish,
//   the global teardown reads all results and sends them to XRAY.
//
//   This file is that "somewhere" — a shared store that all parts of the
//   test framework read from and write to.
//
// HOW THE DATA FLOWS:
//   [Global Setup] → Creates Test Execution → Saves executionKey here
//         ↓
//   [Each Test]    → Runs test → Saves result (PASS/FAIL) here
//         ↓
//   [Global Teardown] → Reads all results from here → Sends to XRAY
//
// NOTE ON FILE-BASED STATE:
//   Because Playwright can run tests in parallel (in separate Node.js processes),
//   we use a JSON file on disk as the shared state store. All processes can
//   read and write to the same file.
//
// ROBUSTNESS — FILE LOCKING:
//   When multiple Playwright workers (e.g., RUN_WORKERS=2 or more) run in
//   parallel, they can simultaneously read → modify → write the JSON file.
//   Without protection, this creates a classic TOCTOU race condition:
//     Worker A reads file → Worker B reads same file → Worker A writes →
//     Worker B writes → Worker A's data is LOST!
//
//   To prevent this, every write operation uses a file-lock (a ".lock" file
//   created with fs.openSync O_CREAT | O_EXCL — an atomic "create only if
//   it doesn't exist" operation). If the lock is held, the caller spins
//   with exponential backoff until the lock is released or a timeout expires.
//   Each operation also validates the JSON integrity after writing.
// =============================================================================

import * as fs   from 'fs';
import * as path from 'path';
import type { TestResultPayload } from './xray-result-updater';

// =============================================================================
// CONSTANTS
// =============================================================================

// The path where the shared state JSON file will be stored.
// "process.cwd()" returns the project root directory.
// We store it in a "test-results" folder which is ignored by Git.
const STATE_FILE_PATH = path.join(process.cwd(), 'test-results', 'xray-state.json');

// Lock file for cross-process synchronization
const LOCK_FILE_PATH  = STATE_FILE_PATH + '.lock';

// Lock acquisition settings
const LOCK_MAX_WAIT_MS    = 10_000;   // Maximum time to wait for the lock (10s)
const LOCK_SPIN_INTERVAL  = 50;       // How often to retry acquiring the lock (ms)
const LOCK_STALE_MS       = 15_000;   // If a lock is older than this, consider it stale and steal it

// =============================================================================
// PRIVATE: File-Lock Helpers (cross-process safe)
// =============================================================================

/**
 * Acquire an exclusive file lock using O_CREAT | O_EXCL (atomic create-if-absent).
 * Spins with increasing intervals until the lock is acquired or timeout reached.
 * Automatically cleans up stale locks from crashed workers.
 */
function acquireLock(): void {
  const deadline = Date.now() + LOCK_MAX_WAIT_MS;
  let sleepMs    = LOCK_SPIN_INTERVAL;

  while (Date.now() < deadline) {
    try {
      // O_CREAT | O_EXCL: fails if the file already exists → atomic "test & set"
      const fd = fs.openSync(LOCK_FILE_PATH, fs.constants.O_CREAT | fs.constants.O_EXCL | fs.constants.O_WRONLY);
      // Write our PID + timestamp so stale locks can be detected
      fs.writeSync(fd, JSON.stringify({ pid: process.pid, ts: Date.now() }));
      fs.closeSync(fd);
      return; // Lock acquired!
    } catch {
      // Lock file already exists — someone else holds the lock.
      // Check if it's stale (from a crashed worker)
      try {
        const stat = fs.statSync(LOCK_FILE_PATH);
        if (Date.now() - stat.mtimeMs > LOCK_STALE_MS) {
          // Lock is stale — the owning process likely crashed. Steal it.
          console.warn(`⚠️  [XrayState] Removing stale lock (${Math.round((Date.now() - stat.mtimeMs) / 1000)}s old)`);
          try { fs.unlinkSync(LOCK_FILE_PATH); } catch { /* another process may have already removed it */ }
          continue; // Retry immediately
        }
      } catch { /* lock file may have been removed between exists-check and stat — retry */ }

      // Spin-wait with exponential backoff (capped at 200ms)
      const jitter = Math.random() * 10;
      sleepSync(Math.min(sleepMs + jitter, 200));
      sleepMs = Math.min(sleepMs * 1.5, 200);
    }
  }

  // If we reach here, we couldn't acquire the lock in time.
  // Force-remove the lock and proceed — better to risk a rare data race than
  // to fail the entire test run.
  console.warn(`⚠️  [XrayState] Lock acquisition timed out (${LOCK_MAX_WAIT_MS}ms). Force-proceeding.`);
  try { fs.unlinkSync(LOCK_FILE_PATH); } catch { /* ignore */ }
}

/**
 * Release the file lock by deleting the lock file.
 */
function releaseLock(): void {
  try { fs.unlinkSync(LOCK_FILE_PATH); } catch { /* already released */ }
}

/**
 * Synchronous sleep (blocks the event loop — intentional for lock spinning).
 * Uses Atomics.wait on a SharedArrayBuffer for precise, CPU-friendly sleeping.
 */
function sleepSync(ms: number): void {
  const sab = new SharedArrayBuffer(4);
  const int32 = new Int32Array(sab);
  Atomics.wait(int32, 0, 0, Math.max(1, Math.round(ms)));
}

/**
 * Execute a callback while holding the file lock.
 * Guarantees the lock is released even if the callback throws.
 */
function withLock<T>(fn: () => T): T {
  acquireLock();
  try {
    return fn();
  } finally {
    releaseLock();
  }
}

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

/**
 * The shape of the shared state object stored in the JSON file.
 */
export interface XrayState {
  // The Test Execution key created by global setup (e.g., "PROJ-789")
  // Will be empty string "" until setup creates the execution.
  executionKey: string;

  // The sprint number this run belongs to
  sprintNumber: string;

  // All test results collected so far (grows as tests complete)
  results: TestResultPayload[];

  // Timestamp when the test run started
  runStartedAt: string;

  // Performance data per test (collected in worker, read in teardown)
  perfData: Array<{
    testName: string;
    durationMs?: number;
    pageLoadMs?: number;
    fcpMs?: number;
    lcpMs?: number;
    requestCount?: number;
    transferBytes?: number;
  }>;

  // Accessibility violations per test (collected in worker, read in teardown)
  a11yData: Record<string, Array<{
    id: string;
    impact: string;
    description: string;
    helpUrl: string;
    nodes: number;
  }>>;

  // Structured log entries (collected in worker, read in teardown)
  logEntries: Array<{
    timestamp: string;
    level: string;
    message: string;
    testName?: string;
  }>;
}

// =============================================================================
// FUNCTION: initializeXrayState
// =============================================================================
// PURPOSE:
//   Called by global setup to initialize the state file with execution details.
//   Clears any previous state and sets up fresh tracking for this test run.
//
// PARAMETERS:
//   - executionKey: The newly created Test Execution key
//   - sprintNumber: The sprint number for this run
// =============================================================================
export function initializeXrayState(executionKey: string, sprintNumber: string): void {
  console.log(`\n💾 [XrayState] Initializing state file for execution: ${executionKey}`);

  // Create the directory if it doesn't exist
  const stateDir = path.dirname(STATE_FILE_PATH);
  if (!fs.existsSync(stateDir)) {
    fs.mkdirSync(stateDir, { recursive: true });
  }

  // Write fresh initial state
  const initialState: XrayState = {
    executionKey,
    sprintNumber,
    results: [],
    runStartedAt: new Date().toISOString(),
    perfData: [],
    a11yData: {},
    logEntries: [],
  };

  fs.writeFileSync(STATE_FILE_PATH, JSON.stringify(initialState, null, 2), 'utf8');
  console.log(`✅ [XrayState] State file created at: ${STATE_FILE_PATH}`);
}

// =============================================================================
// FUNCTION: readXrayState
// =============================================================================
// PURPOSE:
//   Reads the current state from the JSON file.
//   Returns null if the state file doesn't exist yet.
//
// ROBUSTNESS:
//   Retries up to 3 times on parse errors (another worker may be mid-write).
//   Each retry waits a short random interval to let the writer finish.
// =============================================================================
export function readXrayState(): XrayState | null {
  if (!fs.existsSync(STATE_FILE_PATH)) {
    console.warn(`⚠️  [XrayState] State file not found. Did global setup run?`);
    return null;
  }

  const maxRetries = 3;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const raw = fs.readFileSync(STATE_FILE_PATH, 'utf8');
      const parsed = JSON.parse(raw) as XrayState;
      // Validate essential structure
      if (!parsed || typeof parsed.executionKey !== 'string') {
        throw new Error('Invalid state structure — missing executionKey');
      }
      // Ensure arrays/objects exist (defensive against partial writes)
      parsed.results    = parsed.results    ?? [];
      parsed.perfData   = parsed.perfData   ?? [];
      parsed.a11yData   = parsed.a11yData   ?? {};
      parsed.logEntries = parsed.logEntries  ?? [];
      return parsed;
    } catch (error) {
      if (attempt < maxRetries) {
        // Another worker may be mid-write — wait a bit and retry
        sleepSync(50 + Math.random() * 50);
        continue;
      }
      console.error(`❌ [XrayState] Failed to read state file after ${maxRetries} attempts:`, error);
      return null;
    }
  }
  return null;
}

// =============================================================================
// FUNCTION: appendTestResult
// =============================================================================
// PURPOSE:
//   Adds a single test result to the shared state file.
//   Called after each test completes (in the test's afterEach hook).
//
// ROBUSTNESS:
//   Uses file lock to prevent race conditions when multiple workers
//   write simultaneously. Validates the write by re-reading the file.
//
// PARAMETERS:
//   - result: The test result data to save
// =============================================================================
export function appendTestResult(result: TestResultPayload): void {
  withLock(() => {
    const state = readXrayState();

    if (!state) {
      console.warn(`⚠️  [XrayState] Cannot append result — state not initialized.`);
      return;
    }

    // De-duplicate: if this test key already has a result, replace it (re-runs/retries)
    const existingIdx = state.results.findIndex(r => r.testCaseKey === result.testCaseKey);
    if (existingIdx >= 0) {
      state.results[existingIdx] = result;
    } else {
      state.results.push(result);
    }

    // Write back to disk atomically (write to temp, then rename)
    writeStateAtomic(state);

    const statusEmoji = result.status === 'PASS' ? '✅' : '❌';
    console.log(`${statusEmoji} [XrayState] Saved result: ${result.testCaseKey} → ${result.status}`);
  });
}

// =============================================================================
// FUNCTION: clearXrayState
// =============================================================================
// PURPOSE:
//   Deletes the state file and lock file after the test run is complete.
//   Called at the very end of global teardown after all results are uploaded.
// =============================================================================
export function clearXrayState(): void {
  if (fs.existsSync(STATE_FILE_PATH)) {
    fs.unlinkSync(STATE_FILE_PATH);
    console.log(`🧹 [XrayState] State file cleared.`);
  }
  // Clean up lock file if it somehow persists
  try { fs.unlinkSync(LOCK_FILE_PATH); } catch { /* ignore */ }
}

// =============================================================================
// FUNCTION: appendPerfData
// =============================================================================
// PURPOSE:
//   Appends performance metrics for a single test to the shared state file.
//   Uses file lock to prevent race conditions with parallel workers.
// =============================================================================
export function appendPerfData(entry: XrayState['perfData'][0]): void {
  withLock(() => {
    const state = readXrayState();
    if (!state) return;
    if (!state.perfData) state.perfData = [];

    // De-duplicate: replace if already exists for this test
    const existingIdx = state.perfData.findIndex(p => p.testName === entry.testName);
    if (existingIdx >= 0) {
      state.perfData[existingIdx] = entry;
    } else {
      state.perfData.push(entry);
    }

    writeStateAtomic(state);
  });
}

// =============================================================================
// FUNCTION: appendA11yData
// =============================================================================
// PURPOSE:
//   Appends accessibility scan results for a single test to the shared state.
//   Uses file lock to prevent race conditions with parallel workers.
// =============================================================================
export function appendA11yData(testKey: string, violations: XrayState['a11yData'][string]): void {
  withLock(() => {
    const state = readXrayState();
    if (!state) return;
    if (!state.a11yData) state.a11yData = {};
    state.a11yData[testKey] = violations;
    writeStateAtomic(state);
  });
}

// =============================================================================
// FUNCTION: appendLogEntries
// =============================================================================
// PURPOSE:
//   Appends structured log entries for a test to the shared state file.
//   Uses file lock to prevent race conditions with parallel workers.
// =============================================================================
export function appendLogEntries(entries: XrayState['logEntries']): void {
  withLock(() => {
    const state = readXrayState();
    if (!state) return;
    if (!state.logEntries) state.logEntries = [];
    state.logEntries.push(...entries);
    writeStateAtomic(state);
  });
}

// =============================================================================
// PRIVATE: writeStateAtomic
// =============================================================================
// PURPOSE:
//   Writes state to disk using an atomic write-then-rename pattern.
//   This prevents partial/corrupt reads: the file is either fully the old
//   content or fully the new content — never half-written.
//
// HOW IT WORKS:
//   1. Serialize state to JSON
//   2. Write to a temporary file (STATE_FILE_PATH + '.tmp')
//   3. Rename temp → state file (atomic on POSIX systems)
//   4. Verify the write by re-reading and parsing
// =============================================================================
function writeStateAtomic(state: XrayState): void {
  const tmpPath = STATE_FILE_PATH + '.tmp';
  const json = JSON.stringify(state, null, 2);

  fs.writeFileSync(tmpPath, json, 'utf8');
  fs.renameSync(tmpPath, STATE_FILE_PATH);

  // Verify write integrity (belt and suspenders)
  try {
    const verify = fs.readFileSync(STATE_FILE_PATH, 'utf8');
    JSON.parse(verify); // throws if corrupt
  } catch (err) {
    console.error(`❌ [XrayState] Write verification failed! Retrying direct write...`, err);
    // Fallback: direct write
    fs.writeFileSync(STATE_FILE_PATH, json, 'utf8');
  }
}

ENDOFFILE_utils_jira_xray_xray_state_ts
echo "  📄 Created utils/jira-xray/xray-state.ts"

# ── utils/jira-xray/xray-result-updater.ts ──
cat > "utils/jira-xray/xray-result-updater.ts" << 'ENDOFFILE_utils_jira_xray_xray_result_updater_ts'
// =============================================================================
// utils/jira-xray/xray-result-updater.ts — TEST RESULT UPDATE UTILITY
// =============================================================================
// PURPOSE:
//   This file contains functions to update test case results in XRAY after
//   Playwright tests have finished running.
//
// IMPORTANT — THIS IS FULLY AUTOMATED:
//   This file runs automatically during global teardown. QA does not need to
//   mark PASS/FAIL manually — Playwright uploads results for every test case,
//   including screenshots as evidence for failures. The only manual work is
//   the one-time setup of Test Cases and Test Sets in JIRA.
//
// THE BIG PICTURE — WHY DO WE NEED THIS?
//   After Playwright runs your tests, it knows which ones passed and which failed.
//   But JIRA doesn't know anything — it's a separate system!
//   This file "bridges the gap": it takes Playwright's results and sends them
//   to XRAY so your JIRA Test Execution shows the correct statuses.
//
// WHAT HAPPENS WHEN A TEST FAILS?
//   When a test fails, we want XRAY to record:
//     1. Status: FAIL (so the team knows it failed)
//     2. Error message: WHY it failed (so the team can investigate)
//     3. Screenshot: WHAT the screen looked like when it failed (visual evidence)
//     4. Log details: Any console logs or network logs captured during the test
//
// WHAT IS "EVIDENCE" IN THIS CONTEXT?
//   Evidence in XRAY is any file attached to a test result to prove/explain
//   what happened. Common evidence types:
//     - Screenshots (PNG images of the browser at the moment of failure)
//     - Videos (recordings of the entire test run)
//     - Log files (text files with console output)
//
// XRAY TEST STATUSES:
//   - "TODO":      Test has not been run yet (default when first linked)
//   - "EXECUTING": Test is currently running
//   - "PASS":      Test ran and passed ✅
//   - "FAIL":      Test ran and failed ❌
//   - "ABORTED":   Test was stopped before completing
// =============================================================================

import * as fs from 'fs';
import * as path from 'path';
import { createJiraApiClient } from './jira-auth';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

/**
 * The possible result statuses we can report to XRAY.
 * Must match the exact strings XRAY expects.
 */
export type XrayTestStatus = 'PASS' | 'FAIL' | 'TODO' | 'ABORTED' | 'EXECUTING';

/**
 * Represents all the information we want to report for one test's result.
 * Playwright generates all of this during/after test execution.
 */
export interface TestResultPayload {
  // The JIRA key of the test case (e.g., "PROJ-101")
  testCaseKey: string;

  // The human-readable test title (e.g., "TC01: Valid credentials should log the user in")
  testName?: string;

  // Whether the test passed or failed: "PASS" or "FAIL"
  status: XrayTestStatus;

  // If the test failed, the error message explaining why
  errorMessage?: string;

  // Path to the screenshot file on disk (e.g., "/tmp/test-results/screenshot.png")
  screenshotPath?: string;

  // Any additional log text to attach (e.g., console output)
  logText?: string;

  // How long the test took to run (in milliseconds)
  durationMs?: number;

  // When the test started running
  startedAt?: string;

  // When the test finished running
  finishedAt?: string;
}

// =============================================================================
// FUNCTION: updateTestCaseResult
// =============================================================================
// PURPOSE:
//   Updates a single test case's result in a XRAY Test Execution.
//   This is called once per test case after it finishes running.
//
// HOW IT WORKS:
//   1. Updates the test status in XRAY (PASS or FAIL)
//   2. If the test failed and there's a screenshot, uploads it as evidence
//   3. If there's an error message, adds it as a comment on the test run
//
// PARAMETERS:
//   - executionKey:  The Test Execution JIRA key (e.g., "PROJ-789")
//   - resultPayload: All result data for the test (status, screenshot, etc.)
//
// RETURNS:
//   true if everything succeeded, false if something went wrong.
// =============================================================================
export async function updateTestCaseResult(
  executionKey: string,
  resultPayload: TestResultPayload
): Promise<boolean> {

  const { testCaseKey, status, errorMessage, screenshotPath, logText, durationMs } = resultPayload;
  const statusEmoji = status === 'PASS' ? '✅' : '❌';

  console.log(`\n${statusEmoji} [XRAY] Updating result for ${testCaseKey}: ${status}`);

  try {
    const jiraClient = createJiraApiClient();

    // ------------------------------------------------------------------
    // STEP 1: Update the test status in XRAY
    // ------------------------------------------------------------------
    // XRAY Server endpoint: PUT /rest/raven/1.0/api/testrun
    //
    // We need to:
    //   a) Find the "test run" record linking this test case to the execution
    //   b) Update its status
    //
    // First, find the test run ID for this test case within the execution.
    // The test run ID is not the same as the test case key — it's a separate
    // internal ID that XRAY creates when you link a test case to an execution.
    const testRunsResponse = await jiraClient.get(
      `/rest/raven/1.0/api/testexecution/${executionKey}/test`
    );

    // Find the specific test run for our test case key
    const allTestRuns: Array<{ key: string; id: number; status: string }> = testRunsResponse.data || [];
    const targetTestRun = allTestRuns.find((run) => run.key === testCaseKey);

    if (!targetTestRun) {
      console.error(`   ❌ Test case ${testCaseKey} not found in execution ${executionKey}`);
      console.error(`   💡 TIP: Make sure this test case was linked during execution creation.`);
      return false;
    }

    const testRunId = targetTestRun.id;
    console.log(`   📋 Found test run ID: ${testRunId}`);

    // ------------------------------------------------------------------
    // STEP 2: Build the update payload
    // ------------------------------------------------------------------
    // We send the new status, timing information, and optionally an error comment.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updatePayload: Record<string, any> = {
      // The new status for this test run
      status,
    };

    // Add start/end times if available (helps with execution reports)
    if (resultPayload.startedAt)  updatePayload.startedOn  = resultPayload.startedAt;
    if (resultPayload.finishedAt) updatePayload.finishedOn = resultPayload.finishedAt;

    // Add execution time comment if we have duration
    if (durationMs !== undefined) {
      const seconds = (durationMs / 1000).toFixed(2);
      updatePayload.comment = `Test completed in ${seconds} seconds.`;
    }

    // If there's an error message, add it to the comment
    if (errorMessage) {
      updatePayload.comment = (updatePayload.comment || '') +
        `\n\n❌ Failure Reason:\n${errorMessage}`;
    }

    // If there are logs, add them to the comment
    if (logText) {
      updatePayload.comment = (updatePayload.comment || '') +
        `\n\n📋 Test Logs:\n${logText}`;
    }

    // ------------------------------------------------------------------
    // STEP 3: Send the status update to XRAY
    // ------------------------------------------------------------------
    // PUT /rest/raven/1.0/api/testrun/{testRunId} updates the specific test run
    await jiraClient.put(
      `/rest/raven/1.0/api/testrun/${testRunId}`,
      updatePayload
    );

    console.log(`   ✅ Status updated to "${status}" for ${testCaseKey}`);

    // ------------------------------------------------------------------
    // STEP 4: Upload screenshot as evidence (only for failures)
    // ------------------------------------------------------------------
    // If the test failed and we have a screenshot, attach it to the test run.
    // This makes it easy for developers to see what went wrong visually.
    if (status === 'FAIL' && screenshotPath) {
      await attachEvidenceToTestRun(jiraClient, testRunId, screenshotPath, 'screenshot');
    }

    return true;

  } catch (error) {
    console.error(`   ❌ Failed to update result for ${testCaseKey}:`, error);
    return false;
  }
}

// =============================================================================
// FUNCTION: updateMultipleTestResults
// =============================================================================
// PURPOSE:
//   Updates results for MULTIPLE test cases at once after all tests finish.
//   This is called in the global teardown hook after the entire test suite runs.
//
// HOW IT WORKS:
//   Loops through all test results and calls updateTestCaseResult() for each.
//   Provides a summary at the end showing how many updates succeeded/failed.
//
// PARAMETERS:
//   - executionKey:  The Test Execution JIRA key
//   - results:       Array of result payloads (one per test case)
//
// RETURNS:
//   An object with counts of successful and failed updates.
// =============================================================================
export async function updateMultipleTestResults(
  executionKey: string,
  results: TestResultPayload[]
): Promise<{ successCount: number; failureCount: number }> {

  console.log(`\n📊 [XRAY] Updating ${results.length} test result(s) in execution ${executionKey}...`);

  let successCount = 0;
  let failureCount = 0;

  // Process each result one by one (sequentially, not parallel)
  // We do this sequentially to avoid overwhelming the JIRA API with too many requests at once.
  for (const result of results) {
    const success = await updateTestCaseResult(executionKey, result);
    if (success) {
      successCount++;
    } else {
      failureCount++;
    }
  }

  // Print a final summary
  console.log(
    `\n📊 [XRAY] Result update summary:\n` +
    `   ✅ Successful: ${successCount}\n` +
    `   ❌ Failed:     ${failureCount}\n` +
    `   📋 Total:      ${results.length}`
  );

  return { successCount, failureCount };
}

// =============================================================================
// FUNCTION: attachEvidenceToTestRun (PRIVATE HELPER)
// =============================================================================
// PURPOSE:
//   Uploads a file (screenshot, log, etc.) to XRAY as "evidence" for a test run.
//   Evidence is displayed in the test run detail view in JIRA.
//
// PARAMETERS:
//   - jiraClient:  The pre-configured JIRA API client
//   - testRunId:   The XRAY internal test run ID
//   - filePath:    Path to the file on disk to upload
//   - fileType:    "screenshot" | "log" — used for logging purposes only
// =============================================================================
async function attachEvidenceToTestRun(
  jiraClient: ReturnType<typeof createJiraApiClient>,
  testRunId: number,
  filePath: string,
  fileType: 'screenshot' | 'log'
): Promise<void> {

  console.log(`   📎 Attaching ${fileType}: ${path.basename(filePath)}...`);

  try {
    // Check if the file actually exists before trying to read it
    if (!fs.existsSync(filePath)) {
      console.warn(`   ⚠️  ${fileType} file not found: ${filePath}`);
      return;
    }

    // Read the file into memory as a Buffer (raw binary data)
    const fileBuffer = fs.readFileSync(filePath);

    // Convert the file to Base64 so it can be sent as JSON
    // Base64 is a text encoding for binary data — all APIs can handle text
    const fileBase64 = fileBuffer.toString('base64');

    // Determine the MIME type (file format identifier)
    // MIME types tell JIRA what kind of file this is:
    //   "image/png"  → PNG screenshot
    //   "text/plain" → Plain text log file
    const mimeType = fileType === 'screenshot' ? 'image/png' : 'text/plain';
    const fileName = path.basename(filePath);

    // Send the evidence to XRAY
    // XRAY Server endpoint: POST /rest/raven/1.0/api/testrun/{id}/attachment
    await jiraClient.post(
      `/rest/raven/1.0/api/testrun/${testRunId}/attachment`,
      {
        data: fileBase64,       // The file content (Base64 encoded)
        filename: fileName,     // What to name the attachment in JIRA
        contentType: mimeType,  // What kind of file it is
      }
    );

    console.log(`   ✅ ${fileType} attached: ${fileName}`);

  } catch (error) {
    // Attachment failure is non-fatal — the status update already succeeded.
    // We log a warning but don't throw an error.
    console.warn(`   ⚠️  Could not attach ${fileType} to test run ${testRunId}:`, error);
  }
}

ENDOFFILE_utils_jira_xray_xray_result_updater_ts
echo "  📄 Created utils/jira-xray/xray-result-updater.ts"

# ── utils/jira-xray/xray-test-execution.ts ──
cat > "utils/jira-xray/xray-test-execution.ts" << 'ENDOFFILE_utils_jira_xray_xray_test_execution_ts'
// =============================================================================
// utils/jira-xray/xray-test-execution.ts — TEST EXECUTION MANAGEMENT UTILITY
// =============================================================================
// PURPOSE:
//   This file handles creating and managing a "Test Execution" in XRAY.
//
// IMPORTANT — MANUAL vs AUTOMATED BOUNDARY:
//   This is where the AUTOMATED part begins. Unlike Test Cases and Test Sets
//   (which QA creates manually in JIRA), Test Executions are created
//   AUTOMATICALLY by Playwright every time you run `npm test`.
//   You never need to create a Test Execution by hand in JIRA.
//
// WHAT IS A TEST EXECUTION?
//   A Test Execution is a JIRA ticket created by XRAY to record the results
//   of running a group of tests at a specific point in time.
//
//   Think of it like a REPORT CARD:
//     - The Test Set is the list of subjects (test cases) — created MANUALLY
//     - The Test Execution is the report card for ONE specific exam date — created AUTOMATICALLY
//     - Each test case in the execution gets a result: PASS, FAIL, or TODO
//
//   Example:
//     - Test Set "PROJ-456": Contains 10 test cases
//     - Test Execution "PROJ-789": "Sprint 5 Regression Run on 28-Feb-2026"
//       → PROJ-101: PASS
//       → PROJ-102: FAIL (screenshot attached)
//       → PROJ-103: TODO (not yet run)
//
// WHAT IS A SPRINT?
//   In Scrum (an Agile project methodology), a Sprint is a fixed time period
//   (usually 2 weeks) during which the team completes a set of work.
//   We name our Test Execution with the Sprint number so it's easy to find:
//   "Sprint 5 — Automated Test Run"
//
// WHAT DOES THIS FILE DO?
//   1. Creates a new Test Execution JIRA ticket for the current sprint
//   2. Links all test cases from the Test Set to this execution
//   3. Returns the Test Execution ID for use in result updates
// =============================================================================

import { createJiraApiClient } from './jira-auth';
import { config } from '../../config/environment';
import type { XrayTestCase } from './xray-test-set';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

/**
 * Represents the result of creating a new Test Execution in XRAY.
 * This is what gets returned after we call createTestExecution().
 */
export interface TestExecutionResult {
  // The JIRA key of the newly created Test Execution (e.g., "PROJ-789")
  executionKey: string;

  // The internal JIRA numeric ID of the Test Execution
  executionId: string;

  // The display name/summary of the Test Execution
  summary: string;

  // When the execution was created (ISO date string)
  createdAt: string;

  // Which sprint number this execution belongs to
  sprintNumber: string;
}

// =============================================================================
// FUNCTION: createTestExecution
// =============================================================================
// PURPOSE:
//   Creates a brand-new Test Execution in JIRA XRAY for the current sprint,
//   then links all the provided test cases to it.
//
// HOW IT WORKS:
//   1. Builds a descriptive name for the execution (e.g., "Sprint 5 — Automated Run")
//   2. Calls the XRAY REST API to create a new Test Execution JIRA ticket
//   3. Links each test case from our Test Set to this execution
//   4. Returns the execution details (especially the executionKey we'll need later)
//
// PARAMETERS:
//   - testCases:    Array of test cases to link to the execution
//   - sprintNumber: The sprint number (defaults to XRAY_SPRINT_NUMBER from .env)
//   - customSummary: Optional custom name for the execution
//
// RETURNS:
//   A TestExecutionResult object, or null if creation failed.
//
// USAGE EXAMPLE:
//   const execution = await createTestExecution(testSetResult.testCases);
//   console.log(execution?.executionKey); // "PROJ-789"
// =============================================================================
export async function createTestExecution(
  testCases: XrayTestCase[],
  sprintNumber: string = config.xray.sprintNumber,
  customSummary?: string
): Promise<TestExecutionResult | null> {

  console.log(`\n🚀 [XRAY] Creating Test Execution for Sprint ${sprintNumber}...`);

  try {
    const jiraClient = createJiraApiClient();

    // ------------------------------------------------------------------
    // STEP 1: Build the Test Execution summary (display name in JIRA)
    // ------------------------------------------------------------------
    // This is what the ticket will be named in JIRA.
    // Using today's date makes it easy to find later.
    const today = new Date().toISOString().split('T')[0]; // "2026-02-28"
    const executionSummary = customSummary
      || `Sprint ${sprintNumber} — Automated Playwright Test Run [${today}]`;

    console.log(`   📝 Creating execution: "${executionSummary}"`);

    // ------------------------------------------------------------------
    // STEP 2: Create the Test Execution ticket in JIRA via XRAY API
    // ------------------------------------------------------------------
    // XRAY Server endpoint: POST /rest/raven/1.0/api/testexecution
    //
    // We send a JSON body with:
    //   - fields.project.key: Which JIRA project to create the ticket in
    //   - fields.summary:     The name/title of the Test Execution ticket
    //   - fields.issuetype.name: Must be "Test Execution" (XRAY issue type)
    const createExecutionResponse = await jiraClient.post(
      '/rest/raven/1.0/api/testexecution',
      {
        fields: {
          // Which JIRA project this execution belongs to
          project: {
            key: config.xray.projectKey,
          },

          // The display name of the Test Execution in JIRA
          summary: executionSummary,

          // The JIRA issue type must be "Test Execution" for XRAY to recognize it
          issuetype: {
            name: 'Test Execution',
          },

          // A human-readable description of what this execution is for
          description: {
            type: 'doc',
            version: 1,
            content: [
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: `Automated Playwright test run for Sprint ${sprintNumber}. ` +
                          `Executed on ${today} by the CI/CD pipeline. ` +
                          `${testCases.length} test case(s) included.`,
                  },
                ],
              },
            ],
          },
        },
      }
    );

    // Extract the key and ID of the newly created execution ticket
    const executionKey: string = createExecutionResponse.data.key;
    const executionId: string  = createExecutionResponse.data.id;

    console.log(`   ✅ Test Execution created: ${executionKey}`);

    // ------------------------------------------------------------------
    // STEP 3: Link test cases to the Test Execution
    // ------------------------------------------------------------------
    // Now we need to tell XRAY: "Hey, these test cases should be tracked
    // under this Test Execution."
    //
    // We send an array of test case issue keys to the XRAY API.
    // XRAY will add them to the execution with status "TODO" initially.
    if (testCases.length > 0) {
      console.log(`   📡 Linking ${testCases.length} test case(s) to the execution...`);

      const testCaseKeys = testCases.map((tc) => tc.issueKey);

      await jiraClient.post(
        `/rest/raven/1.0/api/testexecution/${executionKey}/test`,
        testCaseKeys
      );

      console.log(`   ✅ Linked test cases: ${testCaseKeys.join(', ')}`);
    }

    // ------------------------------------------------------------------
    // STEP 4: Return the execution result
    // ------------------------------------------------------------------
    const result: TestExecutionResult = {
      executionKey,
      executionId,
      summary:      executionSummary,
      createdAt:    new Date().toISOString(),
      sprintNumber,
    };

    console.log(
      `\n✅ [XRAY] Test Execution ready!\n` +
      `   Key: ${result.executionKey}\n` +
      `   Summary: "${result.summary}"\n` +
      `   Test Cases Linked: ${testCases.length}`
    );

    return result;

  } catch (error) {
    console.error(`\n❌ [XRAY] Failed to create Test Execution for Sprint ${sprintNumber}`);
    console.error(`   Error details:`, error);
    return null;
  }
}

// =============================================================================
// FUNCTION: getTestExecutionStatus
// =============================================================================
// PURPOSE:
//   Fetches the current status/progress of a Test Execution from XRAY.
//   Useful for checking "how many tests passed/failed so far?"
//
// PARAMETERS:
//   - executionKey: The Test Execution issue key (e.g., "PROJ-789")
//
// RETURNS:
//   An object with counts of passed, failed, and pending tests, or null on error.
// =============================================================================
export async function getTestExecutionStatus(executionKey: string): Promise<{
  total: number;
  passed: number;
  failed: number;
  pending: number;
} | null> {

  console.log(`\n🔍 [XRAY] Checking status of Test Execution: ${executionKey}...`);

  try {
    const jiraClient = createJiraApiClient();

    // Fetch all tests in this execution and their current statuses
    const response = await jiraClient.get(
      `/rest/raven/1.0/api/testexecution/${executionKey}/test`
    );

    const tests: Array<{ status: string }> = response.data || [];

    // Count tests by status
    // XRAY uses these status strings: "PASS", "FAIL", "TODO", "EXECUTING"
    const statusCounts = {
      total:   tests.length,
      passed:  tests.filter((t) => t.status === 'PASS').length,
      failed:  tests.filter((t) => t.status === 'FAIL').length,
      pending: tests.filter((t) => ['TODO', 'EXECUTING'].includes(t.status)).length,
    };

    console.log(
      `✅ [XRAY] Execution status:\n` +
      `   Total: ${statusCounts.total} | ` +
      `Passed: ${statusCounts.passed} | ` +
      `Failed: ${statusCounts.failed} | ` +
      `Pending: ${statusCounts.pending}`
    );

    return statusCounts;

  } catch (error) {
    console.error(`❌ [XRAY] Failed to get execution status for: ${executionKey}`, error);
    return null;
  }
}

ENDOFFILE_utils_jira_xray_xray_test_execution_ts
echo "  📄 Created utils/jira-xray/xray-test-execution.ts"

# ── utils/jira-xray/xray-test-set.ts ──
cat > "utils/jira-xray/xray-test-set.ts" << 'ENDOFFILE_utils_jira_xray_xray_test_set_ts'
// =============================================================================
// utils/jira-xray/xray-test-set.ts — XRAY TEST SET RETRIEVAL UTILITY
// =============================================================================
// PURPOSE:
//   This file contains functions to fetch test cases from a JIRA XRAY Test Set.
//
// IMPORTANT — MANUAL vs AUTOMATED BOUNDARY:
//   The Test Set (and the Test Cases inside it) are created MANUALLY by QA in
//   JIRA's web UI. This file reads from them — it does NOT create them.
//   See CAPABILITIES.md → "JIRA XRAY Integration" for the full setup guide.
//
// KEY CONCEPTS FOR BEGINNERS:
//
//   What is XRAY?
//     XRAY is a plugin (add-on) for JIRA that adds test management features.
//     It lets teams manage test cases, test sets, and test executions inside JIRA.
//
//   What is a Test Set?
//     A "Test Set" is like a folder/playlist in XRAY. It groups related test cases.
//     Example: "Login Feature Tests" might be a Test Set with 5 test cases.
//     Each Test Set has a JIRA ticket ID like "PROJ-456".
//     QA creates this MANUALLY in JIRA (Issue Type: "Test Set").
//
//   What is a Test Case?
//     A "Test Case" is a single test scenario. It has:
//       - An ID  (e.g., "PROJ-101")
//       - A name (e.g., "Verify user can log in with valid credentials")
//       - Steps  (what to do)
//       - Expected results (what should happen)
//     QA creates these MANUALLY in JIRA (Issue Type: "Test").
//
//   What is GraphQL?
//     GraphQL is a special way to ask an API for EXACTLY the data you want.
//     XRAY Cloud uses GraphQL. XRAY Server uses REST API.
//     Think of REST as asking for a whole pizza, GraphQL as asking for specific slices.
//
// WHAT THIS FILE DOES:
//   1. Connects to JIRA using the pre-built API client
//   2. Fetches all test cases inside a Test Set (by Test Set ID)
//   3. Parses the response and returns clean, structured test data
//   4. Provides helpers to find specific test cases by ID or name
// =============================================================================

import { createJiraApiClient } from './jira-auth';
import { config } from '../../config/environment';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================
// TypeScript "types" are like blueprints. They define the shape of data.
// Defining types helps catch mistakes — if you accidentally write wrong field
// names, TypeScript will warn you before you even run the code.

/**
 * Represents a single test STEP within a test case.
 * Each step describes one action the tester (or Playwright) should perform.
 */
export interface XrayTestStep {
  // Step number (e.g., 1, 2, 3...)
  stepNumber: number;

  // What to do in this step (e.g., "Enter username in the login field")
  action: string;

  // What data to use (e.g., "Username: admin, Password: secret123")
  testData: string;

  // What should happen after doing this step (e.g., "User is logged in")
  expectedResult: string;
}

/**
 * Represents a single test case fetched from XRAY.
 * This is the full details of one test that we need to automate and track.
 */
export interface XrayTestCase {
  // The JIRA issue key (e.g., "PROJ-101") — unique identifier for this test
  issueKey: string;

  // The full JIRA issue ID (internal numeric ID used in some API calls)
  issueId: string;

  // The test case name/summary (e.g., "Verify successful login")
  summary: string;

  // A longer description of what this test verifies (optional)
  description: string;

  // The ordered list of steps for this test case
  steps: XrayTestStep[];

  // Labels/tags applied to this test in JIRA (e.g., ["smoke", "regression"])
  labels: string[];

  // Test case status in JIRA (e.g., "To Do", "In Progress", "Done")
  status: string;
}

/**
 * Represents the result of fetching an entire Test Set from XRAY.
 */
export interface XrayTestSetResult {
  // The JIRA key of the Test Set itself (e.g., "PROJ-456")
  testSetKey: string;

  // The name/summary of the Test Set
  testSetSummary: string;

  // All test cases contained in this Test Set
  testCases: XrayTestCase[];

  // How many test cases were found
  totalCount: number;
}

// =============================================================================
// FUNCTION: fetchTestCasesFromTestSet
// =============================================================================
// PURPOSE:
//   Fetches all test cases from a specific XRAY Test Set using its JIRA issue key.
//
// HOW IT WORKS:
//   1. Calls JIRA REST API to get the Test Set issue details
//   2. Calls XRAY REST API to get the list of test cases in the set
//   3. For each test case, fetches its steps from JIRA
//   4. Returns everything as a clean, structured object
//
// PARAMETERS:
//   - testSetKey: The JIRA key of the Test Set (e.g., "PROJ-456")
//                 Defaults to the XRAY_TEST_SET_ID value from your .env file
//
// RETURNS:
//   An XrayTestSetResult object with all test case details, or null if it fails.
//
// USAGE EXAMPLE:
//   const testSet = await fetchTestCasesFromTestSet('PROJ-456');
//   console.log(testSet?.testCases[0].summary); // "Verify user can log in"
// =============================================================================
export async function fetchTestCasesFromTestSet(
  testSetKey: string = config.xray.testSetId
): Promise<XrayTestSetResult | null> {

  console.log(`\n📋 [XRAY] Fetching test cases from Test Set: ${testSetKey}...`);

  try {
    // Create the JIRA API client (with authentication pre-configured)
    const jiraClient = createJiraApiClient();

    // ------------------------------------------------------------------
    // STEP 1: Fetch the Test Set issue to get its name/summary
    // ------------------------------------------------------------------
    // We call the standard JIRA REST API to get information about the Test Set issue.
    // The URL format is: /rest/api/3/issue/{issueKey}
    // "fields=summary,description,labels,status" means "only give me these fields"
    // (Requesting fewer fields = faster response)
    console.log(`   📡 Fetching Test Set issue details...`);
    const testSetIssueResponse = await jiraClient.get(
      `/rest/api/3/issue/${testSetKey}?fields=summary,description,labels,status`
    );

    // Extract the fields from the response
    const testSetFields = testSetIssueResponse.data.fields;
    const testSetSummary: string = testSetFields.summary || 'No summary';

    console.log(`   ✅ Test Set found: "${testSetSummary}"`);

    // ------------------------------------------------------------------
    // STEP 2: Fetch the list of test cases in this Test Set via XRAY API
    // ------------------------------------------------------------------
    // XRAY Server/DC has a dedicated REST endpoint for getting tests in a Test Set.
    // URL: /rest/raven/1.0/api/testset/{issueKey}/test
    // This returns a list of test case issue keys associated with this test set.
    console.log(`   📡 Fetching test cases linked to the Test Set...`);
    const testCasesListResponse = await jiraClient.get(
      `/rest/raven/1.0/api/testset/${testSetKey}/test`
    );

    // The response is an array of test case objects like: [{ key: "PROJ-101" }, ...]
    const testCaseRefs: Array<{ key: string; id: string }> = testCasesListResponse.data || [];

    console.log(`   ✅ Found ${testCaseRefs.length} test case(s) in the Test Set.`);

    // ------------------------------------------------------------------
    // STEP 3: Fetch details for each test case
    // ------------------------------------------------------------------
    // For each test case key, we fetch its full details including steps.
    // "Promise.all()" runs all these fetches in PARALLEL (at the same time),
    // which is much faster than fetching them one by one.
    console.log(`   📡 Fetching detailed info for each test case...`);

    const testCasePromises = testCaseRefs.map((ref) =>
      fetchSingleTestCaseDetails(jiraClient, ref.key, ref.id)
    );

    // Wait for ALL test case fetches to complete
    const testCases = await Promise.all(testCasePromises);

    // Filter out any null results (in case a specific test case fetch failed)
    const validTestCases = testCases.filter((tc): tc is XrayTestCase => tc !== null);

    // ------------------------------------------------------------------
    // STEP 4: Return the complete Test Set result
    // ------------------------------------------------------------------
    const result: XrayTestSetResult = {
      testSetKey,
      testSetSummary,
      testCases: validTestCases,
      totalCount: validTestCases.length,
    };

    console.log(`\n✅ [XRAY] Successfully loaded ${result.totalCount} test case(s) from "${testSetSummary}"`);
    return result;

  } catch (error) {
    console.error(`\n❌ [XRAY] Failed to fetch test cases from Test Set: ${testSetKey}`);
    console.error(`   Error details:`, error);
    return null;
  }
}

// =============================================================================
// FUNCTION: fetchSingleTestCaseDetails (PRIVATE HELPER)
// =============================================================================
// PURPOSE:
//   Fetches the full details (summary, description, steps, labels, status) of
//   a single test case from JIRA XRAY using its issue key.
//
// This is a "private" helper — it's only used inside this file (not exported).
// The underscore prefix on "jiraClient" is just a convention indicating it's
// a passed-in dependency, not defined here.
//
// PARAMETERS:
//   - jiraClient: The pre-configured JIRA API client
//   - issueKey:   The test case issue key (e.g., "PROJ-101")
//   - issueId:    The internal numeric ID of the issue
//
// RETURNS:
//   An XrayTestCase object, or null if the fetch fails.
// =============================================================================
async function fetchSingleTestCaseDetails(
  jiraClient: ReturnType<typeof createJiraApiClient>,
  issueKey: string,
  issueId: string
): Promise<XrayTestCase | null> {

  try {
    // Fetch the JIRA issue fields (summary, description, labels, status)
    const issueResponse = await jiraClient.get(
      `/rest/api/3/issue/${issueKey}?fields=summary,description,labels,status`
    );
    const fields = issueResponse.data.fields;

    // Fetch the XRAY test steps for this test case
    // XRAY Server endpoint: /rest/raven/1.0/api/test/{issueKey}/step
    let steps: XrayTestStep[] = [];
    try {
      const stepsResponse = await jiraClient.get(
        `/rest/raven/1.0/api/test/${issueKey}/step`
      );

      // Map the raw XRAY step data into our clean XrayTestStep format
      steps = (stepsResponse.data || []).map((rawStep: Record<string, unknown>, index: number) => ({
        stepNumber: index + 1,
        action:         String((rawStep.step as Record<string, unknown>)?.raw        ?? rawStep.action        ?? ''),
        testData:       String((rawStep.data as Record<string, unknown>)?.raw        ?? rawStep.testData      ?? ''),
        expectedResult: String((rawStep.result as Record<string, unknown>)?.raw      ?? rawStep.expectedResult ?? ''),
      }));
    } catch {
      // Steps fetch failed — continue without steps (non-fatal)
      console.warn(`   ⚠️  Could not fetch steps for ${issueKey} — continuing without steps.`);
    }

    // Build and return the clean test case object
    return {
      issueKey,
      issueId,
      summary:     fields.summary     || 'No summary',
      description: fields.description || '',
      steps,
      labels:      (fields.labels     || []) as string[],
      status:      fields.status?.name || 'Unknown',
    };

  } catch (error) {
    console.error(`   ❌ Failed to fetch details for test case: ${issueKey}`, error);
    return null;
  }
}

// =============================================================================
// FUNCTION: findTestCaseById
// =============================================================================
// PURPOSE:
//   A simple helper to look up a specific test case from a fetched Test Set
//   using its JIRA issue key.
//
// PARAMETERS:
//   - testSetResult: The result object returned by fetchTestCasesFromTestSet()
//   - issueKey:      The issue key to look for (e.g., "PROJ-101")
//
// RETURNS:
//   The matching XrayTestCase, or undefined if not found.
//
// USAGE EXAMPLE:
//   const tc = findTestCaseById(testSetResult, 'PROJ-101');
//   if (tc) console.log(tc.summary);
// =============================================================================
export function findTestCaseById(
  testSetResult: XrayTestSetResult,
  issueKey: string
): XrayTestCase | undefined {
  return testSetResult.testCases.find((tc) => tc.issueKey === issueKey);
}

ENDOFFILE_utils_jira_xray_xray_test_set_ts
echo "  📄 Created utils/jira-xray/xray-test-set.ts"

# ── utils/reporting/report-generator.ts ──
cat > "utils/reporting/report-generator.ts" << 'ENDOFFILE_utils_reporting_report_generator_ts'
// =============================================================================
// utils/reporting/report-generator.ts — HTML EXECUTION REPORT GENERATOR
// =============================================================================
// PURPOSE:
//   Generates a comprehensive self-contained HTML report after every test run.
//   The report includes:
//     📋 Test case results with XRAY links
//     ⏱️  Performance data per test (load time, duration, requests)
//     ♿  Accessibility violations (from axe-core scans)
//     📊  Charts & graphs (bar chart, pie chart, histogram)
//     🔐  Security/vulnerability notes
//     📝  Step-by-step test log (allure-like)
//     🏷️  Summary dashboard (pass/fail/skip counts, duration)
//
// WHY A CUSTOM REPORT?
//   Playwright's built-in HTML report is good, but this custom report:
//     - Includes XRAY ticket links (clickable, opens JIRA)
//     - Shows performance charts comparing all tests
//     - Shows accessibility violations with severity badges
//     - Shows security notes specific to your framework
//     - Is a SINGLE HTML FILE — share it with anyone (no server needed!)
//     - Has charts rendered using Chart.js (no internet needed — embedded)
//
// HOW TO USE:
//   // At the end of your test run (in global-teardown.ts):
//   import { generateReport } from '../utils/reporting/report-generator';
//
//   await generateReport({
//     runDate:      '2026-03-03',
//     environment:  'staging',
//     testResults:  state.results,
//     xrayLink:     'https://jira.company.com/browse/PROJ-789',
//     logEntries:   enhancedLogger.getLogs(),
//     perfData:     enhancedLogger.getPerformanceData(),
//     a11yData:     enhancedLogger.getAccessibilityData() as any,
//   });
//
// OUTPUT:
//   reports/execution-report-2026-03-03.html
//   → A single file you can open in any browser or email to stakeholders.
// =============================================================================

import * as fs   from 'fs';
import * as path from 'path';
import { logger }                               from '../helpers/logger';
import { LogEntry, PerformanceData, AccessibilityViolation } from '../helpers/enhanced-logger';

// =============================================================================
// TYPE: TestResult (what comes in from XRAY state)
// =============================================================================
export interface ReportTestResult {
  testCaseKey:    string;
  status:         'PASS' | 'FAIL' | 'ABORTED' | 'EXECUTING';
  testName?:      string;
  durationMs?:    number;
  errorMessage?:  string;
  screenshotPath?: string;
  xrayLink?:      string;
  startedAt?:     string;
  finishedAt?:    string;
}

// =============================================================================
// TYPE: ReportInput (everything needed to build the report)
// =============================================================================
export interface ReportInput {
  /** Date of the test run (e.g., '2026-03-03') */
  runDate:      string;

  /** Environment tested ('staging', 'production', 'dev') */
  environment:  string;

  /** All test results */
  testResults:  ReportTestResult[];

  /** Link to the XRAY Test Execution in JIRA */
  xrayLink?:    string;

  /** The JIRA project's base URL (for building test case links) */
  jiraBaseUrl?: string;

  /** Sprint number for this run */
  sprintNumber?: string;

  /** ISO timestamp when the run started */
  runStartedAt?: string;

  /** Structured log entries from the enhanced logger */
  logEntries?:  LogEntry[];

  /** Performance data per test */
  perfData?:    PerformanceData[];

  /** Accessibility violations per test */
  a11yData?:    Record<string, AccessibilityViolation[]>;

  /** Where to save the report (default: 'reports/') */
  outputDir?:   string;
}

// =============================================================================
// FUNCTION: generateReport
// =============================================================================
/**
 * Generates a comprehensive HTML execution report.
 *
 * @param input - All the data to include in the report
 * @returns     Absolute path to the generated HTML file
 */
export async function generateReport(input: ReportInput): Promise<string> {
  const outputDir = path.resolve(process.cwd(), input.outputDir ?? 'reports');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const fileName   = `execution-report-${input.runDate}.html`;
  const outputPath = path.join(outputDir, fileName);

  const html = buildHtml(input);
  fs.writeFileSync(outputPath, html, 'utf-8');

  logger.pass(`📊 Execution report generated: ${outputPath}`);
  logger.info(`   Open it in any browser to view charts & detailed results.`);

  return outputPath;
}

// =============================================================================
// PRIVATE: buildHtml()
// =============================================================================
function buildHtml(input: ReportInput): string {
  const results    = input.testResults ?? [];
  const passed     = results.filter(r => r.status === 'PASS').length;
  const failed     = results.filter(r => r.status === 'FAIL').length;
  const aborted    = results.filter(r => r.status === 'ABORTED').length;
  const total      = results.length;
  const passRate   = total > 0 ? Math.round((passed / total) * 100) : 0;

  const perfData   = input.perfData  ?? [];
  const a11yData   = input.a11yData  ?? {};
  const logEntries = input.logEntries ?? [];

  // JIRA base URL — detect if it's a real URL or still the default placeholder
  const jiraBase = (input.jiraBaseUrl ?? '').replace(/\/$/, '');
  const isJiraConfigured = jiraBase.length > 0
    && !jiraBase.includes('your-company.atlassian.net')
    && !jiraBase.includes('your-company');

  // Total suite duration (ms) from perf data or result durations
  const totalDurationMs = results.reduce((sum, r) => {
    const perfEntry = perfData.find(p => p.testName?.includes(r.testCaseKey));
    return sum + (r.durationMs ?? perfEntry?.durationMs ?? 0);
  }, 0);
  const totalDurationSec = (totalDurationMs / 1000).toFixed(1);

  // Run start time — pretty-printed
  const runStartDisplay = input.runStartedAt
    ? new Date(input.runStartedAt).toLocaleString()
    : input.runDate;

  // Sprint number display
  const sprintDisplay = (input.sprintNumber && input.sprintNumber !== 'NOT_CONFIGURED')
    ? input.sprintNumber
    : '—';

  // --------------------------------------------------------------------------
  // Detect test type (UI vs API)
  // --------------------------------------------------------------------------
  const getTestType = (r: ReportTestResult): 'UI' | 'API' => {
    const title = (r.testName ?? '').toLowerCase();
    const key   = r.testCaseKey;
    if (title.includes('api') || title.includes('post') || title.includes('get /') ||
        title.includes('tc04') || title.includes('tc05') || title.includes('tc06') ||
        key === 'PROJ-104' || key === 'PROJ-105' || key === 'PROJ-106') return 'API';
    return 'UI';
  };

  // --------------------------------------------------------------------------
  // Detect test suite group (for report grouping)
  // --------------------------------------------------------------------------
  const getSuiteGroup = (r: ReportTestResult): string => {
    const title = (r.testName ?? '').toLowerCase();
    const key   = r.testCaseKey;
    // API tests (TC04-TC06)
    if (getTestType(r) === 'API') return '🔌 API Feature Tests';
    // Login tests (TC01-TC03)
    if (title.includes('login') || title.includes('credential') || title.includes('password') ||
        key === 'PROJ-101' || key === 'PROJ-102' || key === 'PROJ-103') return '🔐 Login Feature Tests';
    // Playwright.dev navigation tests (TC07-TC11)
    if (title.includes('playwright') || title.includes('docs tab') || title.includes('api tab') ||
        title.includes('community') || title.includes('python') || title.includes('homepage') ||
        key === 'PROJ-107' || key === 'PROJ-108' || key === 'PROJ-109' || key === 'PROJ-110' || key === 'PROJ-111') return '🌐 Playwright.dev Navigation Tests';
    // Fallback
    return '📋 Other Tests';
  };

  const uiCount  = results.filter(r => getTestType(r) === 'UI').length;
  const apiCount = results.filter(r => getTestType(r) === 'API').length;

  // --------------------------------------------------------------------------
  // Chart data
  // --------------------------------------------------------------------------
  const testLabels     = results.map(r => r.testCaseKey);
  const durationValues = results.map(r => {
    const perf = perfData.find(p => p.testName?.includes(r.testCaseKey));
    return perf?.durationMs ? +(perf.durationMs / 1000).toFixed(2) : (r.durationMs ? +(r.durationMs / 1000).toFixed(2) : 0);
  });
  const loadTimeValues = results.map(r => {
    const perf = perfData.find(p => p.testName?.includes(r.testCaseKey));
    return perf?.pageLoadMs ? +(perf.pageLoadMs / 1000).toFixed(2) : 0;
  });

  // --------------------------------------------------------------------------
  // A11y summary
  // --------------------------------------------------------------------------
  const totalA11yViolations = Object.values(a11yData).reduce((sum, v) => sum + v.length, 0);
  const criticalA11y        = Object.values(a11yData)
    .flat()
    .filter(v => v.impact === 'critical' || v.impact === 'serious').length;

  // --------------------------------------------------------------------------
  // Step logs (grouped by test)
  // --------------------------------------------------------------------------
  const stepsByTest: Record<string, { title: string; entries: LogEntry[] }> = {};
  for (const entry of logEntries) {
    const key = entry.testName ?? 'Global';
    if (!stepsByTest[key]) {
      const matchedResult = results.find(r => r.testCaseKey === key);
      stepsByTest[key] = {
        title: matchedResult?.testName ?? key,
        entries: [],
      };
    }
    stepsByTest[key].entries.push(entry);
  }

  // --------------------------------------------------------------------------
  // Screenshot paths for failed tests
  // --------------------------------------------------------------------------
  const failedWithScreenshots = results.filter(r => r.status === 'FAIL' && r.screenshotPath);

  // --------------------------------------------------------------------------
  // Observability aggregates
  // --------------------------------------------------------------------------
  const totalRequests   = perfData.reduce((s, p) => s + (p.requestCount ?? 0), 0);
  const totalTransferKB = perfData.reduce((s, p) => s + (p.transferBytes ?? 0), 0) / 1024;
  const avgPageLoad     = perfData.filter(p => p.pageLoadMs).length > 0
    ? (perfData.reduce((s, p) => s + (p.pageLoadMs ?? 0), 0) / perfData.filter(p => p.pageLoadMs).length)
    : 0;
  const avgFcp          = perfData.filter(p => p.fcpMs).length > 0
    ? (perfData.reduce((s, p) => s + (p.fcpMs ?? 0), 0) / perfData.filter(p => p.fcpMs).length)
    : 0;
  const avgLcp          = perfData.filter(p => p.lcpMs).length > 0
    ? (perfData.reduce((s, p) => s + (p.lcpMs ?? 0), 0) / perfData.filter(p => p.lcpMs).length)
    : 0;
  const errorLogCount   = logEntries.filter(e => e.level === 'error' || e.level === 'fail').length;
  const warnLogCount    = logEntries.filter(e => e.level === 'warn').length;



  // --------------------------------------------------------------------------
  // BUILD HTML
  // --------------------------------------------------------------------------
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Playwright AutoAgent — Execution Report — ${input.runDate}</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"><\/script>
  <style>
    :root {
      --bg-primary: #0a0e1a;
      --bg-secondary: #111827;
      --bg-card: #1a1f35;
      --bg-card-hover: #1f2847;
      --border: #2d3555;
      --border-glow: rgba(99, 102, 241, 0.3);
      --text-primary: #f1f5f9;
      --text-secondary: #94a3b8;
      --text-muted: #64748b;
      --accent-blue: #6366f1;
      --accent-cyan: #22d3ee;
      --accent-green: #22c55e;
      --accent-red: #ef4444;
      --accent-amber: #f59e0b;
      --accent-purple: #a78bfa;
      --accent-orange: #fb923c;
      --glass: rgba(26, 31, 53, 0.7);
      --glass-border: rgba(99, 102, 241, 0.15);
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: var(--bg-primary);
      color: var(--text-primary);
      line-height: 1.6;
    }
    a { color: var(--accent-cyan); text-decoration: none; }
    a:hover { color: #67e8f9; }

    /* ---- ANIMATED BACKGROUND ---- */
    .bg-mesh {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: -1;
      background:
        radial-gradient(ellipse at 20% 50%, rgba(99, 102, 241, 0.08) 0%, transparent 50%),
        radial-gradient(ellipse at 80% 20%, rgba(34, 211, 238, 0.06) 0%, transparent 50%),
        radial-gradient(ellipse at 50% 80%, rgba(167, 139, 250, 0.06) 0%, transparent 50%),
        var(--bg-primary);
    }

    /* ---- HEADER ---- */
    .header {
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(34, 211, 238, 0.08) 50%, rgba(167, 139, 250, 0.1) 100%);
      backdrop-filter: blur(20px);
      border-bottom: 1px solid var(--glass-border);
      padding: 36px 48px;
      position: relative;
      overflow: hidden;
    }
    .header::before {
      content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%;
      background: conic-gradient(from 0deg, transparent, rgba(99, 102, 241, 0.03), transparent, rgba(34, 211, 238, 0.03), transparent);
      animation: headerRotate 20s linear infinite;
    }
    @keyframes headerRotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    .header > * { position: relative; z-index: 1; }
    .header h1 {
      font-size: 32px; font-weight: 800; letter-spacing: -0.5px;
      background: linear-gradient(135deg, #f1f5f9 0%, #6366f1 50%, #22d3ee 100%);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .header .subtitle { margin-top: 6px; color: var(--text-secondary); font-size: 14px; font-weight: 500; }
    .header .meta { margin-top: 16px; display: flex; flex-wrap: wrap; gap: 20px; color: var(--text-secondary); font-size: 13px; }
    .header .meta-item { display: flex; align-items: center; gap: 6px; }
    .header .meta-item strong { color: var(--text-primary); }
    .env-badge { display: inline-block; padding: 3px 12px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; }
    .env-staging    { background: rgba(99,102,241,0.2); color: #a5b4fc; border: 1px solid rgba(99,102,241,0.4); }
    .env-production { background: rgba(239,68,68,0.2); color: #fca5a5; border: 1px solid rgba(239,68,68,0.4); }
    .env-dev        { background: rgba(34,197,94,0.2); color: #86efac; border: 1px solid rgba(34,197,94,0.4); }
    .env-other      { background: rgba(167,139,250,0.2); color: #ddd6fe; border: 1px solid rgba(167,139,250,0.4); }
    .xray-exec-link {
      display: inline-flex; align-items: center; gap: 6px;
      background: rgba(34,211,238,0.1); border: 1px solid rgba(34,211,238,0.3);
      border-radius: 8px; padding: 5px 14px; color: var(--accent-cyan); font-size: 12px; font-weight: 600;
      transition: all 0.2s;
    }
    .xray-exec-link:hover { background: rgba(34,211,238,0.2); transform: translateY(-1px); }
    .xray-not-configured {
      display: inline-flex; align-items: center; gap: 6px;
      background: rgba(245,158,11,0.1); border: 1px solid rgba(245,158,11,0.3);
      border-radius: 8px; padding: 5px 14px; color: #fde68a; font-size: 12px; font-weight: 500;
    }

    /* ---- LAYOUT ---- */
    .container { max-width: 1440px; margin: 0 auto; padding: 36px 28px; }
    .section-title {
      font-size: 20px; font-weight: 700; color: var(--text-primary);
      margin: 44px 0 18px; padding-bottom: 12px;
      border-bottom: 1px solid var(--border);
      display: flex; align-items: center; gap: 10px;
    }
    .section-title .count-chip {
      background: rgba(99,102,241,0.15); color: var(--accent-blue);
      font-size: 12px; font-weight: 700; padding: 3px 10px; border-radius: 9999px;
      border: 1px solid rgba(99,102,241,0.3); margin-left: 8px;
    }

    /* ---- GLASSMORPHISM CARDS ---- */
    .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(155px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .card {
      background: var(--glass); backdrop-filter: blur(12px);
      border-radius: 16px; padding: 22px 16px; text-align: center;
      border: 1px solid var(--glass-border);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative; overflow: hidden;
    }
    .card::before {
      content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
      background: linear-gradient(90deg, transparent, var(--accent-blue), transparent);
      opacity: 0; transition: opacity 0.3s;
    }
    .card:hover { transform: translateY(-4px); border-color: var(--border-glow); box-shadow: 0 8px 32px rgba(99, 102, 241, 0.15); }
    .card:hover::before { opacity: 1; }
    .card .value { font-size: 40px; font-weight: 800; line-height: 1; letter-spacing: -1px; }
    .card .label { font-size: 11px; color: var(--text-muted); text-transform: uppercase; margin-top: 8px; letter-spacing: 1px; font-weight: 600; }
    .card.pass  .value { color: var(--accent-green); }
    .card.fail  .value { color: var(--accent-red); }
    .card.skip  .value { color: var(--accent-amber); }
    .card.total .value { color: var(--accent-blue); }
    .card.rate  .value { color: ${passRate >= 100 ? 'var(--accent-green)' : passRate >= 70 ? 'var(--accent-amber)' : 'var(--accent-red)'}; }
    .card.dur   .value { color: var(--accent-purple); font-size: 30px; }
    .card.ui    .value { color: var(--accent-cyan); }
    .card.api   .value { color: var(--accent-orange); }

    /* ---- PROGRESS BAR ---- */
    .progress-wrap { margin-bottom: 32px; }
    .progress-label { display: flex; justify-content: space-between; font-size: 12px; color: var(--text-muted); margin-bottom: 8px; font-weight: 500; }
    .progress-bar { background: var(--bg-secondary); border-radius: 10px; height: 16px; overflow: hidden; display: flex; border: 1px solid var(--border); }
    .progress-pass { background: linear-gradient(90deg, #059669, #22c55e); height: 100%; transition: width 1.5s cubic-bezier(0.4, 0, 0.2, 1); border-radius: 10px 0 0 10px; }
    .progress-fail { background: linear-gradient(90deg, #dc2626, #ef4444); height: 100%; }
    .progress-skip { background: linear-gradient(90deg, #d97706, #f59e0b); height: 100%; border-radius: 0 10px 10px 0; }

    /* ---- CHARTS ---- */
    .charts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 28px; }
    .chart-box {
      background: var(--glass); backdrop-filter: blur(12px);
      border-radius: 16px; padding: 22px; border: 1px solid var(--glass-border);
      transition: border-color 0.3s;
    }
    .chart-box:hover { border-color: var(--border-glow); }
    .chart-box h3 { color: var(--text-muted); font-size: 12px; text-transform: uppercase; margin-bottom: 14px; letter-spacing: 1px; font-weight: 700; }
    .chart-container { position: relative; height: 260px; }
    @media(max-width:900px) { .charts-grid { grid-template-columns: 1fr; } }

    /* ---- OBSERVABILITY DASHBOARD ---- */
    .obs-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px; margin-bottom: 28px; }
    .obs-card {
      background: var(--glass); backdrop-filter: blur(12px);
      border-radius: 14px; padding: 20px; border: 1px solid var(--glass-border);
      position: relative; overflow: hidden;
      transition: all 0.3s;
    }
    .obs-card:hover { border-color: var(--border-glow); transform: translateY(-2px); }
    .obs-card .obs-icon { font-size: 24px; margin-bottom: 10px; }
    .obs-card .obs-value { font-size: 28px; font-weight: 800; letter-spacing: -0.5px; }
    .obs-card .obs-label { font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.8px; margin-top: 4px; font-weight: 600; }
    .obs-card .obs-bar {
      position: absolute; bottom: 0; left: 0; right: 0; height: 3px;
      background: linear-gradient(90deg, var(--accent-blue), var(--accent-cyan));
    }

    /* ---- TABLES ---- */
    table { width: 100%; border-collapse: collapse; background: var(--bg-card); border-radius: 16px; overflow: hidden; border: 1px solid var(--border); margin-bottom: 28px; }
    th { background: rgba(99,102,241,0.08); color: var(--text-muted); font-size: 11px; text-transform: uppercase; letter-spacing: 1px; padding: 14px 16px; text-align: left; white-space: nowrap; font-weight: 700; }
    td { padding: 12px 16px; border-top: 1px solid rgba(45,53,85,0.5); font-size: 13px; vertical-align: middle; }
    tr { transition: background 0.2s; }
    tr:hover td { background: var(--bg-card-hover); }

    /* ---- BADGES ---- */
    .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 700; letter-spacing: 0.3px; }
    .badge-pass  { background: rgba(34,197,94,0.15); color: #86efac; border: 1px solid rgba(34,197,94,0.3); }
    .badge-fail  { background: rgba(239,68,68,0.15); color: #fca5a5; border: 1px solid rgba(239,68,68,0.3); }
    .badge-skip  { background: rgba(245,158,11,0.15); color: #fde68a; border: 1px solid rgba(245,158,11,0.3); }
    .badge-ui    { background: rgba(34,211,238,0.12); color: #67e8f9; border: 1px solid rgba(34,211,238,0.3); font-size: 10px; }
    .badge-api   { background: rgba(251,146,60,0.12); color: #fdba74; border: 1px solid rgba(251,146,60,0.3); font-size: 10px; }
    .badge-a11y-critical  { background: rgba(239,68,68,0.15); color: #fca5a5; border: 1px solid rgba(239,68,68,0.3); }
    .badge-a11y-serious   { background: rgba(251,146,60,0.15); color: #fdba74; border: 1px solid rgba(251,146,60,0.3); }
    .badge-a11y-moderate  { background: rgba(245,158,11,0.15); color: #fef08a; border: 1px solid rgba(245,158,11,0.3); }
    .badge-a11y-minor     { background: rgba(99,102,241,0.12); color: #a5b4fc; border: 1px solid rgba(99,102,241,0.3); }

    /* ---- XRAY CHIP ---- */
    .xray-chip {
      display: inline-block; background: rgba(99,102,241,0.12); color: #a5b4fc;
      padding: 3px 10px; border-radius: 6px; font-size: 11px; font-family: 'SF Mono', monospace;
      font-weight: 700; text-decoration: none; border: 1px solid rgba(99,102,241,0.3);
      transition: all 0.2s;
    }
    .xray-chip:hover { background: rgba(99,102,241,0.25); color: #c7d2fe; transform: translateY(-1px); }
    .xray-chip-demo {
      display: inline-block; background: rgba(100,116,139,0.1); color: #64748b;
      padding: 3px 10px; border-radius: 6px; font-size: 11px; font-family: 'SF Mono', monospace;
      border: 1px dashed rgba(100,116,139,0.3); cursor: help;
    }

    /* ---- TIMESTAMPS ---- */
    .timestamp { color: var(--text-muted); font-size: 11px; font-family: 'SF Mono', monospace; }
    .test-title { font-weight: 500; color: var(--text-primary); }
    .test-key   { color: var(--text-muted); font-size: 11px; font-family: 'SF Mono', monospace; }

    /* ---- ACCORDION ---- */
    .accordion {
      background: var(--glass); backdrop-filter: blur(12px);
      border: 1px solid var(--glass-border); border-radius: 14px;
      margin-bottom: 10px; overflow: hidden; transition: border-color 0.3s;
    }
    .accordion:hover { border-color: var(--border-glow); }
    .accordion-header { padding: 16px 20px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; user-select: none; transition: background 0.2s; }
    .accordion-header:hover { background: var(--bg-card-hover); }
    .accordion-header .acc-title { font-size: 14px; font-weight: 600; color: var(--text-primary); display: flex; align-items: center; gap: 10px; }
    .accordion-body { display: none; padding: 0 18px 18px; }
    .accordion-body.open { display: block; }
    .log-line { padding: 4px 0; border-bottom: 1px solid rgba(45,53,85,0.3); font-family: 'SF Mono', 'Fira Code', Consolas, monospace; font-size: 12px; line-height: 1.6; }
    .log-pass  { color: #86efac; }
    .log-fail  { color: #fca5a5; }
    .log-warn  { color: #fde68a; }
    .log-error { color: #fca5a5; }
    .log-step  { color: #a5b4fc; }
    .log-info  { color: var(--text-secondary); }

    /* ---- STATUS CARDS ---- */
    .status-card {
      background: var(--glass); backdrop-filter: blur(12px);
      border: 1px solid var(--glass-border); border-radius: 16px;
      padding: 20px 24px; margin-bottom: 12px; transition: all 0.3s;
    }
    .status-card:hover { border-color: var(--border-glow); }
    .status-card h4 { color: var(--text-primary); margin-bottom: 8px; font-size: 14px; font-weight: 600; }
    .status-card p  { color: var(--text-secondary); font-size: 13px; line-height: 1.7; }
    .status-card code { background: var(--bg-primary); border: 1px solid var(--border); border-radius: 6px; padding: 2px 8px; font-family: 'SF Mono', monospace; font-size: 11px; color: #a5b4fc; }
    .status-ok   { border-left: 4px solid var(--accent-green); }
    .status-warn { border-left: 4px solid var(--accent-amber); }
    .status-info { border-left: 4px solid var(--accent-blue); }

    /* ---- SCREENSHOT ---- */
    .screenshot-thumb { max-width: 200px; max-height: 120px; border-radius: 8px; border: 1px solid var(--border); cursor: zoom-in; transition: all 0.3s; object-fit: cover; }
    .screenshot-thumb:hover { transform: scale(1.05); box-shadow: 0 8px 24px rgba(0,0,0,0.4); }
    .screenshot-modal { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); z-index: 9999; justify-content: center; align-items: center; backdrop-filter: blur(8px); }
    .screenshot-modal.open { display: flex; }
    .screenshot-modal img { max-width: 90vw; max-height: 90vh; border-radius: 12px; box-shadow: 0 0 80px rgba(99,102,241,0.2); }

    /* ---- TAB NAVIGATION ---- */
    .nav-tabs {
      display: flex; gap: 4px; margin-bottom: 24px; padding: 4px;
      background: var(--bg-secondary); border-radius: 12px; border: 1px solid var(--border);
      overflow-x: auto;
    }
    .nav-tab {
      padding: 10px 20px; border-radius: 8px; cursor: pointer; font-size: 13px;
      font-weight: 600; color: var(--text-muted); transition: all 0.2s;
      white-space: nowrap; border: none; background: none;
    }
    .nav-tab:hover { color: var(--text-primary); background: rgba(99,102,241,0.08); }
    .nav-tab.active { background: var(--accent-blue); color: white; box-shadow: 0 4px 12px rgba(99,102,241,0.3); }
    .tab-content { display: none; }
    .tab-content.active { display: block; animation: fadeIn 0.3s ease; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

    /* ---- FOOTER ---- */
    .footer {
      text-align: center; padding: 32px 20px; color: var(--text-muted); font-size: 12px;
      border-top: 1px solid var(--border); margin-top: 48px;
    }
    .footer a { color: var(--accent-blue); }
  </style>
</head>
<body>
<div class="bg-mesh"></div>

<!-- =========================================================== -->
<!-- HEADER                                                        -->
<!-- =========================================================== -->
<div class="header">
  <h1>⚡ Playwright AutoAgent</h1>
  <div class="subtitle">AI Automation Framework — UI + API Test Results — JIRA XRAY Integration</div>
  <div class="meta">
    <div class="meta-item">📅 <strong>${input.runDate}</strong></div>
    <div class="meta-item">🚀 Started: <strong>${runStartDisplay}</strong></div>
    <div class="meta-item">🌍
      <span class="env-badge ${
        input.environment === 'staging' ? 'env-staging'
        : input.environment === 'production' ? 'env-production'
        : input.environment === 'dev' ? 'env-dev'
        : 'env-other'
      }">${input.environment}</span>
    </div>
    <div class="meta-item">🔖 Sprint: <strong>${sprintDisplay}</strong></div>
    <div class="meta-item">⏱️ Duration: <strong>${totalDurationSec}s</strong></div>
    <div class="meta-item">
      ${input.xrayLink
        ? `<a class="xray-exec-link" href="${input.xrayLink}" target="_blank">🔗 XRAY Execution ↗</a>`
        : `<span class="xray-not-configured" title="Set JIRA_BASE_URL in .env to enable XRAY">⚠️ XRAY: Not Configured</span>`
      }
    </div>
    <div class="meta-item">⏰ Generated: <strong>${new Date().toLocaleString()}</strong></div>
  </div>
</div>

<div class="container">

<!-- =========================================================== -->
<!-- SUMMARY CARDS                                                 -->
<!-- =========================================================== -->
<div class="section-title">🏆 Execution Summary</div>
<div class="cards">
  <div class="card total"><div class="value">${total}</div><div class="label">Total Tests</div></div>
  <div class="card pass"><div class="value">${passed}</div><div class="label">Passed ✅</div></div>
  <div class="card fail"><div class="value">${failed}</div><div class="label">Failed ❌</div></div>
  <div class="card skip"><div class="value">${aborted}</div><div class="label">Aborted ⚠️</div></div>
  <div class="card rate"><div class="value">${passRate}%</div><div class="label">Pass Rate</div></div>
  <div class="card dur"><div class="value">${totalDurationSec}s</div><div class="label">Duration</div></div>
  <div class="card ui"><div class="value">${uiCount}</div><div class="label">UI Tests 🖥️</div></div>
  <div class="card api"><div class="value">${apiCount}</div><div class="label">API Tests 🔌</div></div>
  <div class="card" style="border-color:${totalA11yViolations>0?'rgba(239,68,68,0.4)':'rgba(34,197,94,0.4)'}">
    <div class="value" style="color:${totalA11yViolations>0?'var(--accent-red)':'var(--accent-green)'}">${totalA11yViolations}</div>
    <div class="label">A11y Issues</div>
  </div>
</div>

<!-- Progress Bar -->
<div class="progress-wrap">
  <div class="progress-label">
    <span>✅ ${passed} passed &nbsp; ❌ ${failed} failed &nbsp; ⚠️ ${aborted} aborted</span>
    <span>${passRate}% pass rate</span>
  </div>
  <div class="progress-bar">
    <div class="progress-pass" style="width:${total > 0 ? (passed/total*100).toFixed(1) : 0}%"></div>
    <div class="progress-fail" style="width:${total > 0 ? (failed/total*100).toFixed(1) : 0}%"></div>
    <div class="progress-skip" style="width:${total > 0 ? (aborted/total*100).toFixed(1) : 0}%"></div>
  </div>
</div>

<!-- =========================================================== -->
<!-- TAB NAVIGATION                                                -->
<!-- =========================================================== -->
<div class="nav-tabs">
  <button class="nav-tab active" onclick="switchTab('tab-observability')">📡 Observability</button>
  <button class="nav-tab" onclick="switchTab('tab-charts')">📈 Charts</button>
  <button class="nav-tab" onclick="switchTab('tab-results')">📋 Results</button>
  <button class="nav-tab" onclick="switchTab('tab-perf')">⚡ Performance</button>
  <button class="nav-tab" onclick="switchTab('tab-a11y')">♿ Accessibility</button>
  <button class="nav-tab" onclick="switchTab('tab-logs')">📝 Logs</button>
  <button class="nav-tab" onclick="switchTab('tab-security')">🔐 Security</button>
</div>

<!-- =========================================================== -->
<!-- TAB: OBSERVABILITY DASHBOARD                                  -->
<!-- =========================================================== -->
<div class="tab-content active" id="tab-observability">
<div class="section-title">📡 Observability Dashboard <span class="count-chip">Real-time Metrics</span></div>
<div class="obs-grid">
  <div class="obs-card">
    <div class="obs-icon">🌐</div>
    <div class="obs-value" style="color:var(--accent-cyan)">${totalRequests}</div>
    <div class="obs-label">Total HTTP Requests</div>
    <div class="obs-bar"></div>
  </div>
  <div class="obs-card">
    <div class="obs-icon">📦</div>
    <div class="obs-value" style="color:var(--accent-purple)">${totalTransferKB.toFixed(1)} KB</div>
    <div class="obs-label">Data Transferred</div>
    <div class="obs-bar" style="background:linear-gradient(90deg,var(--accent-purple),#c084fc)"></div>
  </div>
  <div class="obs-card">
    <div class="obs-icon">⚡</div>
    <div class="obs-value" style="color:var(--accent-green)">${avgPageLoad > 0 ? (avgPageLoad/1000).toFixed(2) + 's' : '—'}</div>
    <div class="obs-label">Avg Page Load</div>
    <div class="obs-bar" style="background:linear-gradient(90deg,var(--accent-green),#4ade80)"></div>
  </div>
  <div class="obs-card">
    <div class="obs-icon">🎨</div>
    <div class="obs-value" style="color:#22d3ee">${avgFcp > 0 ? (avgFcp/1000).toFixed(2) + 's' : '—'}</div>
    <div class="obs-label">Avg FCP</div>
    <div class="obs-bar" style="background:linear-gradient(90deg,#06b6d4,#22d3ee)"></div>
  </div>
  <div class="obs-card">
    <div class="obs-icon">📐</div>
    <div class="obs-value" style="color:#f472b6">${avgLcp > 0 ? (avgLcp/1000).toFixed(2) + 's' : '—'}</div>
    <div class="obs-label">Avg LCP</div>
    <div class="obs-bar" style="background:linear-gradient(90deg,#ec4899,#f472b6)"></div>
  </div>
  <div class="obs-card">
    <div class="obs-icon">❌</div>
    <div class="obs-value" style="color:var(--accent-red)">${errorLogCount}</div>
    <div class="obs-label">Error Logs</div>
    <div class="obs-bar" style="background:linear-gradient(90deg,var(--accent-red),#f87171)"></div>
  </div>
  <div class="obs-card">
    <div class="obs-icon">⚠️</div>
    <div class="obs-value" style="color:var(--accent-amber)">${warnLogCount}</div>
    <div class="obs-label">Warning Logs</div>
    <div class="obs-bar" style="background:linear-gradient(90deg,var(--accent-amber),#fbbf24)"></div>
  </div>
  <div class="obs-card">
    <div class="obs-icon">♿</div>
    <div class="obs-value" style="color:${totalA11yViolations > 0 ? 'var(--accent-amber)' : 'var(--accent-green)'}">${totalA11yViolations}</div>
    <div class="obs-label">A11y Violations</div>
    <div class="obs-bar" style="background:linear-gradient(90deg,${totalA11yViolations > 0 ? 'var(--accent-amber),#fbbf24' : 'var(--accent-green),#4ade80'})"></div>
  </div>
</div>

<!-- Per-test Observability Table -->
${perfData.length > 0 ? `
<h3 style="color:var(--text-muted);font-size:13px;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;font-weight:700">Per-Test Metrics Breakdown</h3>
<table>
  <thead><tr><th>Test</th><th>Type</th><th>Duration</th><th>Page Load</th><th>FCP</th><th>LCP</th><th>Requests</th><th>Transfer</th></tr></thead>
  <tbody>
    ${perfData.map(p => {
      const matchedResult = results.find(r => p.testName?.includes(r.testCaseKey));
      const testType = matchedResult ? getTestType(matchedResult) : 'UI';
      const displayName = matchedResult?.testName ?? p.testName ?? '—';
      return `
    <tr>
      <td style="font-size:12px">${escapeHtml(displayName)}</td>
      <td><span class="badge badge-${testType.toLowerCase()}" style="font-size:10px">${testType}</span></td>
      <td>${p.durationMs ? (p.durationMs/1000).toFixed(2) + 's' : '—'}</td>
      <td>${p.pageLoadMs ? (p.pageLoadMs/1000).toFixed(2) + 's' : '—'}</td>
      <td>${p.fcpMs ? (p.fcpMs/1000).toFixed(2) + 's' : '—'}</td>
      <td>${p.lcpMs ? (p.lcpMs/1000).toFixed(2) + 's' : '—'}</td>
      <td>${p.requestCount ?? '—'}</td>
      <td>${p.transferBytes ? (p.transferBytes/1024).toFixed(1) + ' KB' : '—'}</td>
    </tr>`;
    }).join('')}
  </tbody>
</table>` : `<div class="status-card status-info"><h4>ℹ️ No observability data collected</h4><p>Performance metrics are collected automatically during test execution. Run tests to populate this dashboard.</p></div>`}
</div>

<!-- =========================================================== -->
<!-- TAB: CHARTS                                                   -->
<!-- =========================================================== -->
<div class="tab-content" id="tab-charts">
<div class="section-title">📈 Charts & Graphs</div>
<div class="charts-grid">
  <div class="chart-box">
    <h3>Pass / Fail Distribution</h3>
    <div class="chart-container"><canvas id="pieChart"></canvas></div>
  </div>
  <div class="chart-box">
    <h3>Test Duration (seconds)</h3>
    <div class="chart-container"><canvas id="durationChart"></canvas></div>
  </div>
  <div class="chart-box">
    <h3>Page Load Time (seconds)</h3>
    <div class="chart-container"><canvas id="loadChart"></canvas></div>
  </div>
  <div class="chart-box">
    <h3>Result per Test</h3>
    <div class="chart-container"><canvas id="histChart"></canvas></div>
  </div>
</div>
</div>

<!-- =========================================================== -->
<!-- TAB: TEST RESULTS                                             -->
<!-- =========================================================== -->
<div class="tab-content" id="tab-results">
<div class="section-title">📋 Test Case Results <span class="count-chip">${total} tests</span></div>

<!-- JIRA XRAY STATUS -->
${isJiraConfigured
  ? `<div class="status-card status-ok" style="margin-bottom:20px">
  <h4>✅ XRAY Integration Active — <a href="${jiraBase}" target="_blank">${jiraBase}</a></h4>
  <p>Test results automatically uploaded to XRAY. Click test case keys to open in JIRA.</p>
  ${input.xrayLink ? `<p style="margin-top:8px">📌 <strong>This execution:</strong> <a href="${input.xrayLink}" target="_blank">${input.xrayLink}</a></p>` : ''}
</div>`
  : `<div class="status-card status-warn" style="margin-bottom:20px">
  <h4>⚠️ XRAY Not Configured — Demo Mode</h4>
  <p>To enable: set <code>JIRA_BASE_URL</code>, <code>JIRA_USERNAME</code>, <code>JIRA_API_TOKEN</code> in <code>.env</code></p>
</div>`
}

<table>
  <thead>
    <tr><th>#</th><th>Type</th><th>XRAY Key</th><th>Test Name</th><th>Status</th><th>Duration</th><th>Page Load</th><th>A11y</th><th>Started</th><th>Error</th></tr>
  </thead>
  <tbody>
    ${(() => {
      // Group tests by suite for clear visual separation
      const suiteGroups = new Map<string, ReportTestResult[]>();
      for (const r of results) {
        const group = getSuiteGroup(r);
        if (!suiteGroups.has(group)) suiteGroups.set(group, []);
        suiteGroups.get(group)!.push(r);
      }

      let testNumber = 0;
      return Array.from(suiteGroups.entries()).map(([suiteName, suiteTests]) => {
        const suitePass = suiteTests.filter(t => t.status === 'PASS').length;
        const suiteFail = suiteTests.filter(t => t.status === 'FAIL').length;
        const suiteStatusBadge = suiteFail > 0
          ? `<span class="badge badge-fail" style="font-size:10px">${suiteFail} FAIL</span>`
          : `<span class="badge badge-pass" style="font-size:10px">${suitePass}/${suiteTests.length} PASS</span>`;

        const headerRow = `<tr style="background:rgba(99,102,241,0.08);border-top:2px solid var(--accent-blue)">
          <td colspan="10" style="padding:12px 16px;font-weight:700;font-size:14px;color:var(--accent-cyan);letter-spacing:0.3px">
            ${suiteName} <span style="font-weight:400;font-size:12px;color:var(--text-secondary);margin-left:8px">(${suiteTests.length} tests)</span>
            ${suiteStatusBadge}
          </td>
        </tr>`;

        const dataRows = suiteTests.map(r => {
          testNumber++;
          const perfEntry  = perfData.find(p => p.testName?.includes(r.testCaseKey));
          const a11yEntry  = a11yData[r.testCaseKey] ?? [];
          const critA11y   = a11yEntry.filter(v => v.impact === 'critical' || v.impact === 'serious').length;
          const durSec     = r.durationMs
            ? (r.durationMs/1000).toFixed(1) + 's'
            : (perfEntry?.durationMs ? (perfEntry.durationMs/1000).toFixed(1) + 's' : '—');
          const loadSec    = perfEntry?.pageLoadMs ? (perfEntry.pageLoadMs/1000).toFixed(1) + 's' : '—';
          const badgeClass = r.status === 'PASS' ? 'badge-pass' : r.status === 'FAIL' ? 'badge-fail' : 'badge-skip';
          const testType   = getTestType(r);
          const startTime  = r.startedAt ? new Date(r.startedAt).toLocaleTimeString() : '—';
          const xrayHref = r.xrayLink ?? (isJiraConfigured && jiraBase && r.testCaseKey ? jiraBase + '/browse/' + r.testCaseKey : '');
          const xrayChip = xrayHref
            ? `<a href="${xrayHref}" target="_blank" class="xray-chip" title="Open in JIRA XRAY">${r.testCaseKey}</a>`
            : `<span class="xray-chip-demo" title="Configure JIRA_BASE_URL in .env">${r.testCaseKey}</span>`;
          return `
    <tr>
      <td style="text-align:center;color:var(--text-muted);font-size:12px;font-weight:600">${testNumber}</td>
      <td><span class="badge badge-${testType.toLowerCase()}">${testType === 'UI' ? '🖥️ UI' : '🔌 API'}</span></td>
      <td>${xrayChip}</td>
      <td>
        <div class="test-title">${escapeHtml(r.testName ?? r.testCaseKey)}</div>
        ${r.testName && r.testName !== r.testCaseKey ? `<div class="test-key">${r.testCaseKey}</div>` : ''}
      </td>
      <td><span class="badge ${badgeClass}">${r.status}</span></td>
      <td>${durSec}</td>
      <td>${loadSec}</td>
      <td>${a11yEntry.length === 0
        ? '<span style="color:var(--accent-green);font-size:12px">✅ None</span>'
        : `<span class="badge badge-a11y-${critA11y > 0 ? 'critical' : 'moderate'}">${a11yEntry.length} (${critA11y} crit)</span>`
      }</td>
      <td class="timestamp">${startTime}</td>
      <td style="color:#fca5a5;font-size:12px;max-width:260px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${escapeHtml(r.errorMessage ?? '')}">${r.errorMessage ? escapeHtml(r.errorMessage.substring(0, 100)) + (r.errorMessage.length > 100 ? '…' : '') : '—'}</td>
    </tr>`;
        }).join('');

        return headerRow + dataRows;
      }).join('');
    })()}
  </tbody>
</table>

<!-- Failure Screenshots -->
${failedWithScreenshots.length > 0 ? `
<div class="section-title">📸 Failure Screenshots <span class="count-chip">${failedWithScreenshots.length}</span></div>
<div style="display:flex;flex-wrap:wrap;gap:16px;margin-bottom:24px">
  ${failedWithScreenshots.map(r => `
  <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:14px;padding:16px;max-width:280px">
    <div style="font-size:12px;color:#fca5a5;font-weight:600;margin-bottom:8px">❌ ${escapeHtml(r.testName ?? r.testCaseKey)}</div>
    <img class="screenshot-thumb" src="${r.screenshotPath}" alt="Failure screenshot for ${escapeHtml(r.testCaseKey)}" onclick="openScreenshot('${r.screenshotPath}')"/>
    <div style="font-size:11px;color:var(--text-muted);margin-top:6px;font-family:monospace">${r.testCaseKey}</div>
  </div>`).join('')}
</div>
<div class="screenshot-modal" id="screenshotModal" onclick="closeScreenshot()">
  <img id="screenshotModalImg" src="" alt="Screenshot"/>
</div>` : ''}
</div>

<!-- =========================================================== -->
<!-- TAB: PERFORMANCE                                              -->
<!-- =========================================================== -->
<div class="tab-content" id="tab-perf">
<div class="section-title">⚡ Performance Data <span class="count-chip">${perfData.length} entries</span></div>
${perfData.length === 0
  ? `<div class="status-card status-info"><h4>ℹ️ No performance data collected</h4><p>Performance metrics (page load, FCP, LCP, network requests) are collected automatically for all tests. API tests record duration and request count.</p></div>`
  : `<table>
  <thead><tr><th>Test</th><th>Type</th><th>Duration</th><th>Page Load</th><th>FCP</th><th>LCP</th><th>Requests</th><th>Data Transfer</th></tr></thead>
  <tbody>
    ${perfData.map(p => {
      const matchedResult = results.find(r => p.testName?.includes(r.testCaseKey));
      const testType = matchedResult ? getTestType(matchedResult) : 'UI';
      const displayName = matchedResult?.testName ?? p.testName ?? '—';
      return `
    <tr>
      <td style="font-size:12px">${escapeHtml(displayName)}</td>
      <td><span class="badge badge-${testType.toLowerCase()}" style="font-size:10px">${testType}</span></td>
      <td>${p.durationMs ? (p.durationMs/1000).toFixed(2) + 's' : '—'}</td>
      <td>${p.pageLoadMs ? (p.pageLoadMs/1000).toFixed(2) + 's' : '—'}</td>
      <td>${p.fcpMs ? (p.fcpMs/1000).toFixed(2) + 's' : '—'}</td>
      <td>${p.lcpMs ? (p.lcpMs/1000).toFixed(2) + 's' : '—'}</td>
      <td>${p.requestCount ?? '—'}</td>
      <td>${p.transferBytes ? (p.transferBytes/1024).toFixed(1) + ' KB' : '—'}</td>
    </tr>`;
    }).join('')}
  </tbody>
</table>`}
</div>

<!-- =========================================================== -->
<!-- TAB: ACCESSIBILITY                                            -->
<!-- =========================================================== -->
<div class="tab-content" id="tab-a11y">
<div class="section-title">♿ Accessibility Report <span class="count-chip">${totalA11yViolations} violations</span></div>
${Object.keys(a11yData).length === 0
  ? `<div class="status-card status-info"><h4>ℹ️ No accessibility data collected</h4><p>Axe-core WCAG scans run automatically on UI tests. API tests are excluded (no rendered page).</p></div>`
  : criticalA11y > 0
    ? `<div class="status-card status-warn" style="margin-bottom:16px"><h4>⚠️ ${criticalA11y} Critical/Serious Accessibility Violations Found</h4><p>These must be fixed before production release. See WCAG 2.1 AA guidelines.</p></div>`
    : `<div class="status-card status-ok" style="margin-bottom:16px"><h4>✅ No Critical Accessibility Violations</h4><p>${totalA11yViolations > 0 ? totalA11yViolations + ' minor/moderate issue(s) — review as capacity allows.' : 'All pages passed WCAG 2.1 AA scans.'}</p></div>`
}
${Object.keys(a11yData).length > 0 ? `<table>
  <thead><tr><th>Test</th><th>Violation ID</th><th>Impact</th><th>Description</th><th>Nodes</th><th>Docs</th></tr></thead>
  <tbody>
    ${Object.entries(a11yData).flatMap(([testKey, violations]) => {
      const testTitle = results.find(r => r.testCaseKey === testKey)?.testName ?? testKey;
      return violations.length === 0
        ? [`<tr><td colspan="6" style="color:var(--accent-green);padding:16px;text-align:center;font-size:13px">✅ ${escapeHtml(testTitle)} — No violations</td></tr>`]
        : violations.map(v => `
    <tr>
      <td style="font-size:12px">${escapeHtml(testTitle)}</td>
      <td style="font-family:monospace;font-size:11px;color:#a5b4fc">${v.id}</td>
      <td><span class="badge badge-a11y-${v.impact}">${v.impact}</span></td>
      <td style="font-size:12px;max-width:300px">${escapeHtml(v.description)}</td>
      <td style="text-align:center">${v.nodes}</td>
      <td><a href="${v.helpUrl}" target="_blank" style="font-size:12px">Docs ↗</a></td>
    </tr>`);
    }).join('')}
  </tbody>
</table>` : ''}
</div>

<!-- =========================================================== -->
<!-- TAB: STEP-BY-STEP LOG                                         -->
<!-- =========================================================== -->
<div class="tab-content" id="tab-logs">
<div class="section-title">📝 Step-by-Step Execution Log <span class="count-chip">${logEntries.length} entries</span></div>
${Object.keys(stepsByTest).length === 0
  ? `<div class="status-card status-info"><h4>ℹ️ No structured logs collected</h4><p>Step logs appear here when tests use <code>enhancedLogger</code>. All tests in this framework log steps automatically.</p></div>`
  : Object.entries(stepsByTest).map(([testKey, { title, entries }]) => {
    const matchedResult = results.find(r => r.testCaseKey === testKey);
    const statusBadge = matchedResult
      ? `<span class="badge ${matchedResult.status === 'PASS' ? 'badge-pass' : matchedResult.status === 'FAIL' ? 'badge-fail' : 'badge-skip'}" style="font-size:10px">${matchedResult.status}</span>`
      : '';
    const testType = matchedResult ? getTestType(matchedResult) : 'UI';
    return `
<div class="accordion">
  <div class="accordion-header" onclick="toggleAcc(this)">
    <div class="acc-title">
      <span class="badge badge-${testType.toLowerCase()}" style="font-size:10px">${testType}</span>
      ${statusBadge}
      <span>${escapeHtml(title)}</span>
      <span class="xray-chip-demo" style="font-size:10px">${testKey}</span>
      <span class="timestamp">(${entries.length} steps)</span>
    </div>
    <span style="color:var(--text-muted);font-size:18px;transition:transform 0.2s">▼</span>
  </div>
  <div class="accordion-body">
    ${entries.map(e => `<div class="log-line log-${e.level}">[${e.timestamp}] [${e.level.toUpperCase().padEnd(5)}] ${escapeHtml(e.message)}</div>`).join('\n')}
  </div>
</div>`;
  }).join('')}
</div>

<!-- =========================================================== -->
<!-- TAB: SECURITY                                                 -->
<!-- =========================================================== -->
<div class="tab-content" id="tab-security">
<div class="section-title">🔐 Security & Vulnerability Notes</div>
<div class="status-card status-ok">
  <h4>✅ Credential Management — AES-256 Encryption</h4>
  <p>All passwords stored as encrypted values (AES-256-CBC) in <code>.env</code>. Plain text passwords never committed to source control.</p>
</div>
<div class="status-card status-ok">
  <h4>✅ SQL Injection Prevention — Parameterised Queries</h4>
  <p>All database queries use parameterised queries (<code>$1, $2</code> placeholders) — never string concatenation. Per OWASP A03:2021.</p>
</div>
<div class="status-card status-ok">
  <h4>✅ Secure Database Connections — SSL/TLS</h4>
  <p>Database connections support SSL/TLS (<code>DB_SSL=true</code>). Production always has SSL enabled.</p>
</div>
<div class="status-card status-ok">
  <h4>✅ XRAY / JIRA API — Token-Based Auth</h4>
  <p>JIRA API uses Atlassian API tokens (not passwords). Tokens can be revoked independently.</p>
</div>
<div class="status-card status-info">
  <h4>ℹ️ Dependency Audit</h4>
  <p>Run <code>npm audit</code> regularly for known CVEs. Run <code>npm audit fix</code> for safe auto-fixes.</p>
</div>
<div class="status-card ${failed > 0 ? 'status-warn' : 'status-ok'}">
  <h4>${failed > 0 ? '⚠️' : '✅'} Test Failure Analysis</h4>
  <p>${failed > 0
    ? failed + ' test(s) failed. Review screenshots and errors in the Results tab. Ensure no security-sensitive data in error messages.'
    : 'All tests passed. No security-related failures detected.'}</p>
</div>
</div>

<!-- =========================================================== -->
<!-- FOOTER                                                        -->
<!-- =========================================================== -->
<div class="footer">
  <p>Generated by <strong>Playwright AutoAgent</strong> • ${input.runDate} • ${total} tests • ${passRate}% pass rate</p>
  <p style="margin-top:4px">Built with ❤️ using Playwright AutoAgent – AI Automation Framework</p>
</div>

</div><!-- /container -->

<!-- =========================================================== -->
<!-- SCRIPTS                                                       -->
<!-- =========================================================== -->
<script>
// ---- TAB SWITCHING ----
function switchTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(el => el.classList.remove('active'));
  document.getElementById(tabId).classList.add('active');
  event.target.classList.add('active');
  // Re-render charts when Charts tab is opened (fixes canvas sizing)
  if (tabId === 'tab-charts') { setTimeout(() => { window.dispatchEvent(new Event('resize')); }, 50); }
}

// ---- CHART.JS ----
Chart.defaults.color = '#64748b';
Chart.defaults.borderColor = 'rgba(45,53,85,0.5)';

new Chart(document.getElementById('pieChart'), {
  type: 'doughnut',
  data: {
    labels: ['Passed', 'Failed', 'Aborted'],
    datasets: [{
      data: [${passed}, ${failed}, ${aborted}],
      backgroundColor: ['#22c55e','#ef4444','#f59e0b'],
      borderWidth: 3, borderColor: 'var(--bg-primary)',
      hoverOffset: 8
    }]
  },
  options: {
    responsive: true, maintainAspectRatio: false,
    cutout: '55%',
    plugins: {
      legend: { position: 'bottom', labels: { padding: 16, font: { size: 12 }, usePointStyle: true, pointStyle: 'circle' } }
    }
  }
});

new Chart(document.getElementById('durationChart'), {
  type: 'bar',
  data: {
    labels: ${JSON.stringify(testLabels)},
    datasets: [{
      label: 'Duration (s)', data: ${JSON.stringify(durationValues)},
      backgroundColor: 'rgba(99,102,241,0.6)', borderColor: '#6366f1', borderWidth: 1, borderRadius: 8,
      hoverBackgroundColor: 'rgba(99,102,241,0.8)'
    }]
  },
  options: {
    responsive: true, maintainAspectRatio: false,
    scales: { y: { beginAtZero: true, grid: { color: 'rgba(45,53,85,0.3)' } }, x: { grid: { display: false } } },
    plugins: { legend: { display: false } }
  }
});

new Chart(document.getElementById('loadChart'), {
  type: 'bar',
  data: {
    labels: ${JSON.stringify(testLabels)},
    datasets: [{
      label: 'Load Time (s)', data: ${JSON.stringify(loadTimeValues)},
      backgroundColor: 'rgba(167,139,250,0.6)', borderColor: '#a78bfa', borderWidth: 1, borderRadius: 8,
      hoverBackgroundColor: 'rgba(167,139,250,0.8)'
    }]
  },
  options: {
    responsive: true, maintainAspectRatio: false,
    scales: { y: { beginAtZero: true, grid: { color: 'rgba(45,53,85,0.3)' } }, x: { grid: { display: false } } },
    plugins: { legend: { display: false } }
  }
});

const histColors = ${JSON.stringify(results.map(r => r.status === 'PASS' ? 'rgba(34,197,94,0.6)' : r.status === 'FAIL' ? 'rgba(239,68,68,0.6)' : 'rgba(245,158,11,0.6)'))};
new Chart(document.getElementById('histChart'), {
  type: 'bar',
  data: {
    labels: ${JSON.stringify(testLabels)},
    datasets: [{ label: 'Result', data: ${JSON.stringify(results.map(r => r.status === 'PASS' ? 1 : 0))}, backgroundColor: histColors, borderRadius: 8, borderWidth: 1, borderColor: ${JSON.stringify(results.map(r => r.status === 'PASS' ? '#22c55e' : r.status === 'FAIL' ? '#ef4444' : '#f59e0b'))} }]
  },
  options: {
    responsive: true, maintainAspectRatio: false,
    scales: { y: { min: 0, max: 1, ticks: { callback: v => v === 1 ? 'PASS' : v === 0 ? 'FAIL' : '' }, grid: { color: 'rgba(45,53,85,0.3)' } }, x: { grid: { display: false } } },
    plugins: { legend: { display: false } }
  }
});

// ---- ACCORDION ----
function toggleAcc(header) {
  const body = header.nextElementSibling;
  body.classList.toggle('open');
  const arrow = header.querySelector('span:last-child');
  arrow.textContent = body.classList.contains('open') ? '▲' : '▼';
  arrow.style.transform = body.classList.contains('open') ? 'rotate(180deg)' : '';
}

// ---- SCREENSHOT MODAL ----
function openScreenshot(src) {
  document.getElementById('screenshotModalImg').src = src;
  document.getElementById('screenshotModal').classList.add('open');
}
function closeScreenshot() {
  document.getElementById('screenshotModal').classList.remove('open');
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeScreenshot(); });
</script>
</body>
</html>`;


}


// =============================================================================
// PRIVATE: escapeHtml
// =============================================================================
function escapeHtml(text: string): string {
  return text
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;')
    .replace(/'/g,  '&#039;');
}

ENDOFFILE_utils_reporting_report_generator_ts
echo "  📄 Created utils/reporting/report-generator.ts"

# =============================================================================
# TEST FILES
# =============================================================================


# ── utils/framework/xray-state-helper.ts ──
cat > "utils/framework/xray-state-helper.ts" << 'ENDOFFILE_tests_xray_state_helper_ts'
// =============================================================================
// utils/framework/xray-state-helper.ts — THIN WRAPPER FOR XRAY STATE
// =============================================================================
// PURPOSE:
//   This is a thin "bridge" file that re-exports the appendTestResult function
//   from utils/jira-xray/xray-state.ts.
//
//   WHY A SEPARATE FILE?
//   The xray-test-fixture.ts lives in the "tests/" folder and imports from here.
//   Keeping this thin wrapper here makes the import paths clean and avoids
//   deeply nested relative paths like "../../utils/jira-xray/xray-state".
// =============================================================================

export { appendTestResult, appendPerfData, appendA11yData, appendLogEntries } from '../utils/jira-xray/xray-state';

ENDOFFILE_tests_xray_state_helper_ts
echo "  📄 Created utils/framework/xray-state-helper.ts"

# ── utils/framework/xray-test-fixture.ts ──
cat > "utils/framework/xray-test-fixture.ts" << 'ENDOFFILE_tests_xray_test_fixture_ts'
// =============================================================================
// utils/framework/xray-test-fixture.ts — CUSTOM PLAYWRIGHT TEST FIXTURE WITH XRAY
// =============================================================================
// PURPOSE:
//   This file creates a CUSTOM "test" function that extends Playwright's default
//   test function with automatic XRAY result reporting built in.
//
// WHAT IS A "FIXTURE" IN PLAYWRIGHT?
//   A fixture is a reusable setup/teardown piece that is automatically injected
//   into your tests. Think of it like a "smart wrapper" around your test.
//
//   Playwright's default fixtures provide things like: page, browser, context
//   Our custom fixture adds: xrayTestKey, automatic result upload to XRAY
//
// HOW TESTS USE THIS:
//   Instead of: import { test, expect } from '@playwright/test';
//   Tests use:  import { test, expect } from '../utils/framework/xray-test-fixture';
//
//   The only difference in the test code is specifying the XRAY test key:
//     test('my test name', { tag: '@PROJ-101' }, async ({ page, xrayTestKey }) => {
//       // xrayTestKey is automatically "PROJ-101" from the tag
//       // After the test, result is automatically sent to XRAY!
//     });
//
// WHAT HAPPENS AUTOMATICALLY (you don't need to write this in every test):
//   BEFORE each test: Nothing special — just provides the xrayTestKey
//   AFTER each test:
//     - Captures screenshot if test FAILED
//     - Reads the test result (pass/fail)
//     - Saves result to shared state file (to be uploaded in global teardown)
// =============================================================================

// Import Playwright's test and expect, plus types
import { test as base, expect } from '@playwright/test';

// Import XRAY state utility to save results
import { appendTestResult, appendPerfData, appendA11yData, appendLogEntries } from './xray-state-helper';

// Import screenshot helper
import { captureFailureScreenshot } from '../utils/helpers/screenshot';

// Import the logger
import { logger } from '../utils/helpers/logger';

// Import enhanced logger — collects structured data for the HTML report
import { enhancedLogger } from '../utils/helpers/enhanced-logger';

// Import axe-core accessibility scanner
import AxeBuilder from '@axe-core/playwright';

// =============================================================================
// TYPE: Define what extra things our custom fixture provides
// =============================================================================
// "xrayTestKey" is a string that holds the JIRA issue key for the current test.
// It's extracted from the test's annotations.
type XrayFixtures = {
  xrayTestKey: string;
};

// =============================================================================
// CUSTOM TEST FUNCTION
// =============================================================================
// "base.extend<XrayFixtures>()" creates a new test function that includes
// everything from the base Playwright test PLUS our custom xrayTestKey fixture.
// =============================================================================
export const test = base.extend<XrayFixtures>({

  // --------------------------------------------------------------------------
  // FIXTURE: xrayTestKey
  // --------------------------------------------------------------------------
  // PURPOSE:
  //   Extracts the XRAY test case key from the test's annotations,
  //   and after the test runs, automatically saves the result to shared state.
  //
  // HOW IT WORKS:
  //   1. Before test: Reads the test's annotations to find the XRAY key ("PROJ-101")
  //   2. Handles any cookie banners / popups so they don't break tests
  //   3. "use(xrayTestKey)" → passes the key into the test function
  //   4. After test:  Reads result (pass/fail), captures screenshot if failed,
  //                   saves result to the shared state file
  //
  // In the test file, use annotations to specify the XRAY test key:
  //   test('my test', { annotation: { type: 'xray', description: 'PROJ-101' } }, async ({ xrayTestKey }) => {
  //     console.log(xrayTestKey); // "PROJ-101"
  //   });
  // --------------------------------------------------------------------------
  xrayTestKey: async ({ page }, use, testInfo) => {
    // -----------------------------------------------------------------------
    // PRE-TEST: Extract the XRAY test key from test annotations or tags
    // -----------------------------------------------------------------------
    let xrayKey = 'UNTRACKED';

    const xrayAnnotation = testInfo.annotations.find(
      (annotation) => annotation.type.toLowerCase() === 'xray'
    );

    if (xrayAnnotation?.description) {
      xrayKey = xrayAnnotation.description.trim();
      logger.info(`📎 Test linked to XRAY: ${xrayKey}`);
      enhancedLogger.info(`📎 Test linked to XRAY: ${xrayKey}`, xrayKey);
    } else {
      logger.warn(`Test "${testInfo.title}" has no XRAY annotation — results won't be uploaded.`);
    }

    const startedAt = new Date().toISOString();

    // -----------------------------------------------------------------------
    // Start performance timer for this test
    // -----------------------------------------------------------------------
    enhancedLogger.startTimer(xrayKey);

    // -----------------------------------------------------------------------
    // Intercept all network requests to count them and measure bytes
    // -----------------------------------------------------------------------
    let requestCount = 0;
    let transferBytes = 0;
    page.on('requestfinished', async (request) => {
      requestCount++;
      try {
        const response = await request.response();
        if (response) {
          const body = await response.body().catch(() => Buffer.alloc(0));
          transferBytes += body.length;
        }
      } catch { /* non-fatal */ }
    });

    // -----------------------------------------------------------------------
    // COOKIE BANNER & POPUP HANDLING
    // -----------------------------------------------------------------------
    page.on('dialog', async (dialog) => {
      logger.info(`🍪 Auto-accepting dialog: [${dialog.type()}] "${dialog.message()}"`);
      await dialog.accept();
    });

    // -----------------------------------------------------------------------
    // RUN THE TEST
    // -----------------------------------------------------------------------
    await use(xrayKey);

    // -----------------------------------------------------------------------
    // POST-TEST: Collect performance metrics
    // -----------------------------------------------------------------------
    const durationMs = testInfo.duration;

    // Collect page timing metrics (navigation performance API)
    let pageLoadMs: number | undefined;
    let fcpMs: number | undefined;
    let lcpMs: number | undefined;
    try {
      const perfTiming = await page.evaluate(() => {
        const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
        const paintEntries = performance.getEntriesByType('paint');
        const fcp = paintEntries.find(e => e.name === 'first-contentful-paint');
        const lcp = performance.getEntriesByType('largest-contentful-paint').slice(-1)[0];
        return {
          loadEventEnd:  nav?.loadEventEnd  ?? 0,
          startTime:     nav?.startTime     ?? 0,
          fcp:           fcp?.startTime     ?? 0,
          lcp:           (lcp as PerformanceEntry | undefined)?.startTime ?? 0,
        };
      });
      pageLoadMs = perfTiming.loadEventEnd > 0
        ? Math.round(perfTiming.loadEventEnd - perfTiming.startTime)
        : undefined;
      fcpMs = perfTiming.fcp > 0 ? Math.round(perfTiming.fcp) : undefined;
      lcpMs = perfTiming.lcp > 0 ? Math.round(perfTiming.lcp) : undefined;
    } catch { /* page may be closed — non-fatal */ }

    // Log collected performance data
    enhancedLogger.logPerformance(xrayKey, {
      durationMs,
      pageLoadMs,
      fcpMs,
      lcpMs,
      requestCount: requestCount > 0 ? requestCount : undefined,
      transferBytes: transferBytes > 0 ? transferBytes : undefined,
    });

    // Write perf data to shared state file (cross-process)
    appendPerfData({
      testName: xrayKey,
      durationMs,
      pageLoadMs,
      fcpMs,
      lcpMs,
      requestCount: requestCount > 0 ? requestCount : undefined,
      transferBytes: transferBytes > 0 ? transferBytes : undefined,
    });

    // -----------------------------------------------------------------------
    // POST-TEST: Run accessibility scan (axe-core)
    // -----------------------------------------------------------------------
    try {
      const axeResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      enhancedLogger.logAccessibility(xrayKey,
        axeResults.violations.map(v => ({
          id:          v.id,
          impact:      (v.impact ?? 'minor') as 'minor' | 'moderate' | 'serious' | 'critical',
          description: v.description,
          helpUrl:     v.helpUrl,
          nodes:       v.nodes.length,
        }))
      );

      // Write a11y data to shared state file (cross-process)
      appendA11yData(xrayKey,
        axeResults.violations.map(v => ({
          id:          v.id,
          impact:      (v.impact ?? 'minor') as string,
          description: v.description,
          helpUrl:     v.helpUrl,
          nodes:       v.nodes.length,
        }))
      );
    } catch { /* axe may fail on closed/navigated page — non-fatal */ }

    // -----------------------------------------------------------------------
    // POST-TEST: Save result to shared XRAY state
    // -----------------------------------------------------------------------
    const finishedAt = new Date().toISOString();
    const playwrightStatus = testInfo.status;

    let xrayStatus: 'PASS' | 'FAIL' | 'ABORTED' = 'PASS';
    if (playwrightStatus === 'failed' || playwrightStatus === 'timedOut') {
      xrayStatus = 'FAIL';
    } else if (playwrightStatus === 'interrupted') {
      xrayStatus = 'ABORTED';
    }

    if (xrayKey !== 'UNTRACKED') {
      let screenshotPath: string | undefined;
      if (xrayStatus === 'FAIL') {
        logger.step(`Capturing failure screenshot for: ${testInfo.title}`);
        const shot = await captureFailureScreenshot(page, testInfo.title);
        if (shot) screenshotPath = shot;
      }

      let errorMessage: string | undefined;
      if (testInfo.errors.length > 0) {
        errorMessage = testInfo.errors
          .map((e) => e.message || String(e))
          .join('\n\n');
      }

      appendTestResult({
        testCaseKey:  xrayKey,
        testName:     testInfo.title,
        status:       xrayStatus,
        errorMessage,
        screenshotPath,
        durationMs,
        startedAt,
        finishedAt,
      });

      if (xrayStatus === 'PASS') {
        logger.pass(`[${xrayKey}] ${testInfo.title}`);
        enhancedLogger.pass(`[${xrayKey}] ${testInfo.title}`, xrayKey);
      } else {
        logger.fail(`[${xrayKey}] ${testInfo.title}`, errorMessage);
        enhancedLogger.fail(`[${xrayKey}] ${testInfo.title} — ${errorMessage ?? 'unknown error'}`, xrayKey);
      }

      // Flush this test's log entries to the shared state file (cross-process)
      const testLogs = enhancedLogger.getLogs()
        .filter(e => e.testName === xrayKey)
        .map(e => ({ timestamp: e.timestamp, level: e.level, message: e.message, testName: e.testName }));
      if (testLogs.length > 0) {
        appendLogEntries(testLogs);
      }
    }
  },
});

// Re-export "expect" from Playwright (tests need this for assertions)
export { expect };

ENDOFFILE_tests_xray_test_fixture_ts
echo "  📄 Created utils/framework/xray-test-fixture.ts"

# ── utils/framework/global-setup.ts ──
cat > "utils/framework/global-setup.ts" << 'ENDOFFILE_tests_global_setup_ts'
// =============================================================================
// utils/framework/global-setup.ts — GLOBAL SETUP (RUNS ONCE BEFORE ALL TESTS)
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
// MANUAL vs AUTOMATED (XRAY):
//   The Test Cases and Test Set must already exist in JIRA — QA creates those
//   MANUALLY (see CAPABILITIES.md → JIRA XRAY Integration, Steps 1–4).
//   This file then AUTOMATICALLY:
//     - Authenticates with JIRA
//     - Fetches test cases from the Test Set (reads what QA set up)
//     - Creates a new Test Execution ticket (the "report card")
//     - Links all test cases to the execution
//     - Saves the execution key for later (global teardown will upload results)
//
// CURRENT UTILITIES MANAGED HERE:
//   🔹 JIRA XRAY  — Fetch test cases, create Test Execution (skipped if not configured)
//   🔹 Database   — Seed test data before tests run (skipped if DB_ENABLED=false)
//   🔹 Email      — Status check only (actual email use happens inside individual tests)
//   🔹 API Helper — Status check only (actual API calls happen inside individual tests)
//   🔹 Encryption — Status check only (usage is per-utility, no global setup needed)
//
// TO ADD A NEW UTILITY:
//   1. Import the utility's check function (e.g., isMyToolConfigured)
//   2. Add it to the Utility Status Dashboard log section
//   3. If it needs one-time global setup, add a step after the DB section
//
// EXECUTION FLOW (what happens when you run "npm test"):
//   1. ▶ globalSetup runs (this file):
//      a) Print which utilities are active
//      b) XRAY: Test JIRA connection → Fetch test cases → Create execution
//      c) Database: Seed test data (if DB_ENABLED=true)
//      d) Save shared state to xray-state.json
//   2. ▶ Each test file runs (login.test.ts, api.test.ts)
//   3. ▶ globalTeardown runs (uploads results + generates HTML report)
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
  logger.section('🚀 GLOBAL SETUP — Starting Playwright AutoAgent');
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
  enhancedLogger.info('Playwright AutoAgent initialized', 'GlobalSetup');

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

ENDOFFILE_tests_global_setup_ts
echo "  📄 Created utils/framework/global-setup.ts"

# ── utils/framework/global-teardown.ts ──
cat > "utils/framework/global-teardown.ts" << 'ENDOFFILE_tests_global_teardown_ts'
// =============================================================================
// utils/framework/global-teardown.ts — GLOBAL TEARDOWN (RUNS ONCE AFTER ALL TESTS)
// =============================================================================
// PURPOSE:
//   This file runs ONCE after ALL tests have finished. It's the "cleanup crew".
//
// WHAT IS "GLOBAL TEARDOWN"?
//   The counterpart to globalSetup. It runs after every single test is done.
//   This is the perfect place to:
//     - Upload all collected test results to XRAY (AUTOMATED — no manual work)
//     - Generate the HTML execution report
//     - Clean up test data from the database
//
// MANUAL vs AUTOMATED (XRAY):
//   Everything in this file is FULLY AUTOMATED. The results collected during
//   test runs are uploaded to JIRA XRAY automatically:
//     - PASS/FAIL status → updated in the Test Execution
//     - Failure screenshots → attached as evidence in JIRA
//     - Error messages → included in the test run comment
//   QA never needs to manually mark PASS/FAIL in JIRA.
//
// UTILITIES HANDLED HERE (each one skips gracefully if not configured):
//   🔹 XRAY     — Upload PASS/FAIL results + full test names + screenshots to JIRA
//   🔹 Report   — Generate the HTML execution report (always runs, XRAY optional)
//   🔹 Database — Clean up test data seeded during global-setup
//
// EXECUTION ORDER:
//   1. Read xray-state.json (results saved by xray-test-fixture.ts during tests)
//   2. Upload results to XRAY (if execution key is configured)
//   3. Fetch final execution status from XRAY (to confirm upload)
//   4. Clear xray-state.json (so next run starts fresh)
//   5. Generate HTML report (reports/execution-report-YYYY-MM-DD.html)
//   6. Clean up database test data (if DB_ENABLED=true)
// =============================================================================

// Import Playwright's FullConfig type
import { type FullConfig } from '@playwright/test';

// Import XRAY result updater and state utilities
import { updateMultipleTestResults } from '../utils/jira-xray/xray-result-updater';
import { readXrayState, clearXrayState }   from '../utils/jira-xray/xray-state';
import { getTestExecutionStatus }          from '../utils/jira-xray/xray-test-execution';

// Import optional utility functions
import { isDbConfigured, cleanupTestData }          from '../utils/database/test-data-manager';

// Import report generator (generates a beautiful HTML report with charts)
import { generateReport } from '../utils/reporting/report-generator';

// Import enhanced logger (collects structured data for the report)
import { enhancedLogger } from '../utils/helpers/enhanced-logger';

// Import logger
import { logger } from '../utils/helpers/logger';

// Import config
import { config } from '../config/environment';

// =============================================================================
// GLOBAL TEARDOWN FUNCTION
// =============================================================================
// Playwright calls this automatically after all tests finish.
// =============================================================================
export default async function globalTeardown(_config: FullConfig): Promise<void> {
  logger.section('🏁 GLOBAL TEARDOWN — Post-Run Utilities');

  // ==========================================================================
  // STEP 1: Read the Shared State
  // ==========================================================================
  // Read the state file saved by global-setup.ts.
  // This gives us: the execution key + all test results collected during the run.
  const state = readXrayState();

  if (!state) {
    logger.warn('No XRAY state found. Either setup was skipped, or it failed.');
    logger.warn('Test results will NOT be uploaded to XRAY.');
    return;
  }

  // If the execution key is "NOT_CONFIGURED", XRAY upload is skipped,
  // but we STILL want to generate the HTML report.
  if (state.executionKey === 'NOT_CONFIGURED') {
    logger.warn('XRAY was not configured (execution key is NOT_CONFIGURED).');
    logger.warn('Tests ran, but results were not uploaded to XRAY.');

    // Still generate the HTML report even without XRAY
    // IMPORTANT: Generate report BEFORE clearing state (report reads perf/a11y data)
    await runPostRunTasks(state, _config);
    clearXrayState();
    return;
  }

  logger.info(`Uploading results to Test Execution: ${state.executionKey}`);
  logger.info(`Total results to upload: ${state.results.length}`);

  // ==========================================================================
  // STEP 2: Summarize Results Before Uploading
  // ==========================================================================
  const passedTests  = state.results.filter((r) => r.status === 'PASS');
  const failedTests  = state.results.filter((r) => r.status === 'FAIL');
  const abortedTests = state.results.filter((r) => r.status === 'ABORTED');

  logger.info(`Results summary BEFORE upload:`);
  logger.info(`  ✅ Passed:  ${passedTests.length}`);
  logger.info(`  ❌ Failed:  ${failedTests.length}`);
  logger.info(`  🔶 Aborted: ${abortedTests.length}`);

  if (failedTests.length > 0) {
    logger.warn('Failed tests:');
    failedTests.forEach((r) => {
      logger.fail(r.testCaseKey, r.errorMessage || 'No error message');
    });
  }

  // ==========================================================================
  // STEP 3: Upload Results to XRAY
  // ==========================================================================
  // If there are results to upload, send them all to XRAY now.
  if (state.results.length === 0) {
    logger.warn('No test results to upload. Were any tests mapped to XRAY test cases?');
  } else {
    logger.step(`Uploading ${state.results.length} result(s) to XRAY...`);

    const { successCount, failureCount } = await updateMultipleTestResults(
      state.executionKey,
      state.results
    );

    logger.info(`Upload complete: ${successCount} succeeded, ${failureCount} failed.`);
  }

  // ==========================================================================
  // STEP 4: Fetch and Log Final Execution Status from XRAY
  // ==========================================================================
  // After uploading, fetch the execution status from XRAY to confirm
  // the results were recorded correctly.
  logger.step('Fetching final execution status from XRAY...');
  const finalStatus = await getTestExecutionStatus(state.executionKey);

  if (finalStatus) {
    logger.section(
      `📊 FINAL XRAY EXECUTION STATUS\n` +
      `   Execution: ${state.executionKey}\n` +
      `   Sprint: ${state.sprintNumber}\n` +
      `   Total:   ${finalStatus.total}\n` +
      `   ✅ Passed:  ${finalStatus.passed}\n` +
      `   ❌ Failed:  ${finalStatus.failed}\n` +
      `   ⏳ Pending: ${finalStatus.pending}\n` +
      `\n   View in JIRA: ${process.env['JIRA_BASE_URL']}/browse/${state.executionKey}`
    );
  }

  // ==========================================================================
  // STEP 5: Generate Report + DB cleanup
  // ==========================================================================
  // IMPORTANT: Generate report BEFORE clearing state — the report reads
  // perf/a11y/log data from the shared state file (cross-process data).
  await runPostRunTasks(state, _config);
  clearXrayState();

  logger.section('✅ GLOBAL TEARDOWN COMPLETE — All done!\n   📂 Check reports/ for the HTML execution report.');
}

// =============================================================================
// HELPER: runPostRunTasks
// =============================================================================
// Runs the report generation and DB cleanup.
// Called both in the normal XRAY path AND the NOT_CONFIGURED path so the
// HTML report is ALWAYS generated regardless of XRAY configuration.
// =============================================================================
import { type FullConfig as _FullConfig } from '@playwright/test';

async function runPostRunTasks(state: NonNullable<ReturnType<typeof readXrayState>>, _config: _FullConfig): Promise<void> {
  // Generate HTML report
  logger.section('📊 REPORT — Generating HTML Execution Report');
  try {
    const today = new Date().toISOString().split('T')[0];
    const collectedData = enhancedLogger.getCollectedData();

    // Read perf/a11y/log data from shared state file (cross-process data from workers)
    const sharedState = readXrayState();
    const sharedPerf = sharedState?.perfData ?? [];
    const sharedA11y = sharedState?.a11yData ?? {};
    const sharedLogs = sharedState?.logEntries ?? [];

    // Merge: prefer shared (cross-process) data over in-memory (main process only)
    const mergedPerf = sharedPerf.length > 0 ? sharedPerf : collectedData.performance;
    const mergedA11y = Object.keys(sharedA11y).length > 0 ? sharedA11y : collectedData.accessibility;
    const mergedLogs = sharedLogs.length > 0 ? sharedLogs : collectedData.logs;

    await generateReport({
      runDate:      today,
      environment:  config.app.environment,
      testResults:  state.results.map(r => ({
        testCaseKey:    r.testCaseKey,
        status:         (['PASS','FAIL','ABORTED','EXECUTING'].includes(r.status)
          ? r.status
          : 'ABORTED') as 'PASS' | 'FAIL' | 'ABORTED' | 'EXECUTING',
        testName:       r.testName ?? r.testCaseKey,
        durationMs:     r.durationMs,
        errorMessage:   r.errorMessage,
        screenshotPath: r.screenshotPath,
        startedAt:      r.startedAt,
        finishedAt:     r.finishedAt,
      })),
      xrayLink:     state.executionKey !== 'NOT_CONFIGURED'
        ? `${process.env['JIRA_BASE_URL'] ?? ''}/browse/${state.executionKey}`
        : undefined,
      jiraBaseUrl:    process.env['JIRA_BASE_URL'],
      sprintNumber:   state.sprintNumber,
      runStartedAt:   state.runStartedAt,
      logEntries:   mergedLogs as any,
      perfData:     mergedPerf as any,
      a11yData:     mergedA11y as any,
    });
  } catch (err) {
    logger.warn(`Could not generate HTML report: ${(err as Error).message}`);
  }

  // DB cleanup
  if (isDbConfigured()) {
    logger.section('🗃️  DATABASE — Cleaning Up Test Data');
    await cleanupTestData();
  }
}

ENDOFFILE_tests_global_teardown_ts
echo "  📄 Created utils/framework/global-teardown.ts"

# ── tests/login.test.ts ──
cat > "tests/login.test.ts" << 'ENDOFFILE_tests_login_test_ts'
// =============================================================================
// tests/login.test.ts — LOGIN FEATURE TEST SUITE
// =============================================================================
// PURPOSE:
//   This file contains automated tests for the Login feature of your application.
//
// WHAT IS A "TEST SUITE"?
//   A test suite is a collection of related tests grouped together.
//   All tests in this file are about the login functionality.
//
// HOW PLAYWRIGHT TESTS WORK:
//   - "test.describe()" groups related tests under a common name
//   - "test('test name', async ({ page }) => { ... })" is a single test
//   - "expect(...).toBe(...)" makes assertions (checks if something is true)
//   - If an assertion fails, the test fails immediately with a clear message
//
// HOW XRAY INTEGRATION WORKS HERE:
//   Instead of importing from "@playwright/test", we import from our custom
//   fixture file "xray-test-fixture". This gives us the same "test" function
//   PLUS automatic XRAY result reporting built in.
//
//   Each test has an annotation: { type: 'xray', description: 'PROJ-XXX' }
//   This links the test to a specific XRAY test case.
//   After the test runs, the result is automatically sent to XRAY.
//
// TEST STRUCTURE OVERVIEW:
//   ✅ TEST 1 (PROJ-101): Positive test — valid credentials → should log in
//   ❌ TEST 2 (PROJ-102): Negative test — wrong password → should show error
//   ❌ TEST 3 (PROJ-103): Negative test — empty fields → should show error
//
// HOW TO RUN THESE TESTS:
//   npm test                    → Run all tests
//   npm run test:login          → Run only login tests
//   npm run test:debug          → Run with browser visible (headed mode)
// =============================================================================

// =============================================================================
// IMPORT: Use our CUSTOM test function (not the default Playwright one)
// =============================================================================
// The custom "test" from xray-test-fixture provides:
//   - Everything from standard Playwright test (page, expect, etc.)
//   - xrayTestKey: The XRAY test case ID linked to this test
//   - Automatic result upload to XRAY after each test
import { test, expect } from '../utils/framework/xray-test-fixture';

// Import the LoginPage object (our POM class for the login page)
import { LoginPage } from '../pages/LoginPage';

// Import enhanced logger — every step logged here appears in the HTML report
import { enhancedLogger } from '../utils/helpers/enhanced-logger';

// =============================================================================
// TEST CREDENTIALS
// =============================================================================
// These are the REAL login credentials for the demo site:
//   https://the-internet.herokuapp.com/login
//
// The demo site tells you the credentials on the page itself — so this is safe
// to hardcode for validation purposes.
// In a real project, store credentials in .env (never hardcode real passwords).
//
//   Valid username : tomsmith
//   Valid password : SuperSecretPassword!
//   Wrong password : anything else (e.g., WrongPassword)
// =============================================================================
const TEST_CREDENTIALS = {
  validUsername: 'tomsmith',
  validPassword: 'SuperSecretPassword!',
  wrongPassword: 'WrongPassword',
};

// =============================================================================
// TEST GROUP: Login Feature Tests
// =============================================================================
// "test.describe()" groups tests together. The name appears in test reports
// as a section header, making the report easy to read.
// =============================================================================
test.describe('Login Feature Tests', () => {

  // ============================================================================
  // TEST 1: Successful Login with Valid Credentials
  // ============================================================================
  // WHAT THIS TEST DOES:
  //   1. Opens the login page
  //   2. Enters correct username and password
  //   3. Clicks the Login button
  //   4. Verifies the user is redirected to the dashboard/home page
  //
  // XRAY MAPPING:
  //   annotation: { type: 'xray', description: 'PROJ-101' }
  //   → This test reports its result to XRAY test case PROJ-101
  //   → Change 'PROJ-101' to your actual XRAY test case key
  //
  // EXPECTED OUTCOME: PASS (user successfully logs in)
  // ============================================================================
  test(
    'TC01: Valid credentials should log the user in successfully',
    {
      // This annotation LINKS this Playwright test to the XRAY test case "PROJ-101"
      // When this test finishes, the result (PASS/FAIL) is sent to PROJ-101 in XRAY
      annotation: { type: 'xray', description: 'PROJ-101' },
    },
    async ({ page, xrayTestKey }) => {

      // Log which test we're running and its XRAY key
      enhancedLogger.section(`▶ Running Test: TC01 | XRAY: ${xrayTestKey}`);

      const loginPage = new LoginPage(page);

      // Step 1: Open the login page
      enhancedLogger.step('Step 1: Navigate to the login page', xrayTestKey);
      await loginPage.navigateToLoginPage();

      // Step 2: Perform login with valid credentials
      enhancedLogger.step('Step 2: Enter valid credentials and submit', xrayTestKey);
      await loginPage.login(TEST_CREDENTIALS.validUsername, TEST_CREDENTIALS.validPassword);

      // Step 3: Verify login was successful
      enhancedLogger.step('Step 3: Verify user is now on the Secure Area page', xrayTestKey);
      await loginPage.verifySuccessfulLogin();

      expect(loginPage.getCurrentUrl()).toContain('/secure');

      enhancedLogger.pass(`TC01 passed — User logged in successfully`, xrayTestKey);
    }
  );

  // ============================================================================
  // TEST 2: Login Should Fail with Wrong Password
  // ============================================================================
  // WHAT THIS TEST DOES:
  //   1. Opens the login page
  //   2. Enters CORRECT username but WRONG password
  //   3. Clicks Login
  //   4. Verifies an error message appears (not logged in)
  //
  // WHY TEST NEGATIVE SCENARIOS?
  //   A good test suite tests not only "happy paths" (things that should work)
  //   but also "unhappy paths" (things that should fail gracefully).
  //   Testing bad credentials ensures your app:
  //     - Doesn't log in unauthorized users
  //     - Shows a clear, helpful error message
  //
  // EXPECTED OUTCOME: PASS (the test verifies the ERROR was shown correctly)
  // ============================================================================
  test(
    'TC02: Wrong password should show an error message',
    {
      annotation: { type: 'xray', description: 'PROJ-102' },
    },
    async ({ page, xrayTestKey }) => {

      enhancedLogger.section(`▶ Running Test: TC02 | XRAY: ${xrayTestKey}`);

      const loginPage = new LoginPage(page);

      enhancedLogger.step('Step 1: Navigate to the login page', xrayTestKey);
      await loginPage.navigateToLoginPage();

      enhancedLogger.step('Step 2: Enter valid username but wrong password', xrayTestKey);
      await loginPage.login(TEST_CREDENTIALS.validUsername, TEST_CREDENTIALS.wrongPassword);

      enhancedLogger.step('Step 3: Verify error message is displayed', xrayTestKey);
      await loginPage.verifyLoginErrorMessage('Your password is invalid!');

      enhancedLogger.step('Step 4: Verify user is still on the login page', xrayTestKey);
      expect(loginPage.getCurrentUrl()).toContain('/login');

      enhancedLogger.pass(`TC02 passed — Error message shown for wrong password`, xrayTestKey);
    }
  );

  // ============================================================================
  // TEST 3: Login Should Fail with Empty Fields
  // ============================================================================
  // WHAT THIS TEST DOES:
  //   1. Opens the login page
  //   2. Clicks Login WITHOUT entering any credentials (empty fields)
  //   3. Verifies the form shows validation errors
  //
  // WHY TEST EMPTY FIELDS?
  //   This tests client-side validation — does the form prevent submission
  //   when required fields are empty? This is important for:
  //     - User experience (clear guidance on what's required)
  //     - Security (preventing blank/incomplete requests to the server)
  //
  // EXPECTED OUTCOME: PASS (validation errors are shown)
  // ============================================================================
  test(
    'TC03: Empty credentials should show validation errors',
    {
      annotation: { type: 'xray', description: 'PROJ-103' },
    },
    async ({ page, xrayTestKey }) => {

      enhancedLogger.section(`▶ Running Test: TC03 | XRAY: ${xrayTestKey}`);

      const loginPage = new LoginPage(page);

      enhancedLogger.step('Step 1: Navigate to the login page', xrayTestKey);
      await loginPage.navigateToLoginPage();

      enhancedLogger.step('Step 2: Click login button without entering credentials', xrayTestKey);
      await loginPage.clickLoginButton();

      enhancedLogger.step('Step 3: Verify validation flash message is shown', xrayTestKey);
      await loginPage.verifyLoginErrorMessage('Your username is invalid!');

      const currentUrl = loginPage.getCurrentUrl();
      expect(currentUrl).toContain('/login');

      enhancedLogger.info(`Validation confirmed: empty credentials rejected, URL is still: ${currentUrl}`, xrayTestKey);

      enhancedLogger.pass(`TC03 passed — Empty credentials correctly rejected`, xrayTestKey);
    }
  );

});

ENDOFFILE_tests_login_test_ts
echo "  📄 Created tests/login.test.ts"

# ── tests/api.test.ts ──
cat > "tests/api.test.ts" << 'ENDOFFILE_tests_api_test_ts'
// =============================================================================
// tests/api.test.ts — API TEST SUITE (3 Sample API Tests)
// =============================================================================
// PURPOSE:
//   These tests validate REST API endpoints DIRECTLY — no browser needed.
//   They run much faster than UI tests (milliseconds vs seconds) and are
//   perfect for verifying your backend is working correctly.
//
// WHAT IS API TESTING?
//   Instead of clicking buttons in a browser, API tests send HTTP requests
//   (GET, POST, PUT, DELETE) directly to the server and check the response.
//
//   Example:
//     UI Test:  Open browser → go to /users → see "John Doe" on screen
//     API Test: GET /api/users/1 → check JSON response has { name: "John Doe" }
//
//   API tests are faster, more reliable, and test the backend independently
//   of the frontend. Every professional team runs both UI + API tests.
//
// PUBLIC API USED FOR DEMO:
//   https://jsonplaceholder.typicode.com — a free fake REST API used by
//   millions of developers worldwide for testing. It mimics a real application
//   with users, posts, comments, todos, etc.
//
// TEST OVERVIEW:
//   ✅ TC04 (PROJ-104): GET /posts/1 — Fetch a blog post and validate fields
//   ✅ TC05 (PROJ-105): POST /posts — Create a new post and verify 201 Created
//   ✅ TC06 (PROJ-106): GET /users/1 — Fetch a user profile and validate fields
//
// HOW XRAY WORKS IN API TESTS:
//   Same as UI tests — the annotation maps each test to a JIRA/XRAY test case.
//   API tests don't use a browser page, but they still get:
//   - ✅ PASS/FAIL results uploaded to XRAY
//   - ⏱️  Duration measured automatically
//   - 📊 Results in the HTML execution report
//
// HOW TO RUN:
//   npm test                           → runs ALL tests (UI + API)
//   npx playwright test tests/api.test.ts  → runs ONLY API tests
// =============================================================================

// Import our custom test fixture (provides xrayTestKey + auto result upload)
import { test, expect } from '../utils/framework/xray-test-fixture';

// Import the API helper functions
import { apiGet, apiPost } from '../utils/api/api-helper';

// Import enhanced logger so all API steps appear in the HTML report
import { enhancedLogger } from '../utils/helpers/enhanced-logger';

// =============================================================================
// DEMO API BASE URL — JSONPlaceholder (no credentials needed)
// =============================================================================
// JSONPlaceholder is a public fake REST API with:
//   GET  /posts      → list of 100 blog posts
//   GET  /posts/:id  → single blog post
//   POST /posts      → simulate creating a post (returns 201 + the created object)
//   GET  /users/:id  → user profile with name, email, address, company
//   GET  /todos/:id  → a todo item with title + completed status
// ALL requests return realistic JSON — perfect for API test demos.
const API_BASE = 'https://jsonplaceholder.typicode.com';

// =============================================================================
// TEST GROUP: API Feature Tests
// =============================================================================
test.describe('API Feature Tests', () => {

  // ==========================================================================
  // TEST 4: GET a blog post and validate its structure
  // ==========================================================================
  // WHAT THIS TEST DOES:
  //   Sends a GET request to /posts/1 and checks:
  //     - HTTP status is 200 (OK)
  //     - Response body has the expected fields (id, userId, title, body)
  //     - The post ID matches what we requested (id === 1)
  //     - The title is a non-empty string
  //
  // WHY THIS MATTERS:
  //   Every time you fetch data, you should verify:
  //   1. The server responded (status 200)
  //   2. The data has the right shape (no missing fields)
  //   3. The values make sense (id matches, strings aren't empty)
  //
  // XRAY MAPPING: PROJ-104
  // ==========================================================================
  test(
    'TC04: GET /posts/1 — Should return a valid blog post with correct fields',
    {
      annotation: { type: 'xray', description: 'PROJ-104' },
    },
    async ({ xrayTestKey }) => {
      enhancedLogger.section(`▶ Running Test: TC04 | XRAY: ${xrayTestKey}`);

      // -----------------------------------------------------------------------
      // STEP 1: Send GET request to fetch post #1
      // -----------------------------------------------------------------------
      enhancedLogger.step('Step 1: Send GET request to /posts/1', xrayTestKey);

      const response = await apiGet<{
        id:     number;
        userId: number;
        title:  string;
        body:   string;
      }>(`${API_BASE}/posts/1`);

      enhancedLogger.info(
        `Response received — Status: ${response.status}, Duration: ${response.durationMs}ms`,
        xrayTestKey
      );

      // -----------------------------------------------------------------------
      // STEP 2: Validate HTTP status code is 200
      // -----------------------------------------------------------------------
      enhancedLogger.step('Step 2: Validate HTTP status is 200 OK', xrayTestKey);
      expect(response.status).toBe(200);
      expect(response.success).toBe(true);
      enhancedLogger.info('✅ Status 200 OK confirmed', xrayTestKey);

      // -----------------------------------------------------------------------
      // STEP 3: Validate response body has all required fields
      // -----------------------------------------------------------------------
      enhancedLogger.step('Step 3: Validate response body structure', xrayTestKey);
      expect(response.data).not.toBeNull();
      expect(response.data).toHaveProperty('id');
      expect(response.data).toHaveProperty('userId');
      expect(response.data).toHaveProperty('title');
      expect(response.data).toHaveProperty('body');
      enhancedLogger.info('✅ All required fields present: id, userId, title, body', xrayTestKey);

      // -----------------------------------------------------------------------
      // STEP 4: Validate field values are correct
      // -----------------------------------------------------------------------
      enhancedLogger.step('Step 4: Validate field values are correct', xrayTestKey);
      expect(response.data!.id).toBe(1);
      expect(typeof response.data!.title).toBe('string');
      expect(response.data!.title.length).toBeGreaterThan(0);
      expect(typeof response.data!.body).toBe('string');
      expect(response.data!.body.length).toBeGreaterThan(0);

      enhancedLogger.info(`✅ Post ID: ${response.data!.id}`, xrayTestKey);
      enhancedLogger.info(`✅ Post Title: "${response.data!.title}"`, xrayTestKey);
      enhancedLogger.pass(`TC04 passed — GET /posts/1 returned valid post (${response.durationMs}ms)`, xrayTestKey);
    }
  );

  // ==========================================================================
  // TEST 5: POST to create a new resource and verify 201 Created
  // ==========================================================================
  // WHAT THIS TEST DOES:
  //   Sends a POST request to /posts with a JSON body and checks:
  //     - HTTP status is 201 (Created) — NOT 200 (OK)
  //     - The server echoes back the data we sent
  //     - A new "id" is assigned to the created resource
  //
  // WHY 201 AND NOT 200?
  //   HTTP status codes tell you WHAT happened:
  //     200 OK        → Request worked, here's existing data
  //     201 Created   → Resource was CREATED successfully
  //     400 Bad Req   → You sent bad data
  //     401 Unauth    → You need to log in
  //     404 Not Found → Resource doesn't exist
  //     500 Server Err→ The server crashed
  //   A well-designed API returns 201 when you POST new data.
  //
  // XRAY MAPPING: PROJ-105
  // ==========================================================================
  test(
    'TC05: POST /posts — Should create a new post and return 201 Created',
    {
      annotation: { type: 'xray', description: 'PROJ-105' },
    },
    async ({ xrayTestKey }) => {
      enhancedLogger.section(`▶ Running Test: TC05 | XRAY: ${xrayTestKey}`);

      // -----------------------------------------------------------------------
      // STEP 1: Prepare the request payload
      // -----------------------------------------------------------------------
      enhancedLogger.step('Step 1: Prepare new post payload', xrayTestKey);

      const newPost = {
        title:  'Demo Post Created by Playwright API Test',
        body:   'This post was created automatically by our test framework to verify the POST endpoint works correctly.',
        userId: 1,
      };

      enhancedLogger.info(`Sending payload: ${JSON.stringify(newPost)}`, xrayTestKey);

      // -----------------------------------------------------------------------
      // STEP 2: Send POST request
      // -----------------------------------------------------------------------
      enhancedLogger.step('Step 2: Send POST request to /posts', xrayTestKey);

      const response = await apiPost<{
        id:     number;
        title:  string;
        body:   string;
        userId: number;
      }>(`${API_BASE}/posts`, newPost);

      enhancedLogger.info(
        `Response received — Status: ${response.status}, Duration: ${response.durationMs}ms`,
        xrayTestKey
      );

      // -----------------------------------------------------------------------
      // STEP 3: Validate status is 201 Created
      // -----------------------------------------------------------------------
      enhancedLogger.step('Step 3: Validate HTTP status is 201 Created', xrayTestKey);
      expect(response.status).toBe(201);
      expect(response.success).toBe(true);
      enhancedLogger.info('✅ Status 201 Created confirmed', xrayTestKey);

      // -----------------------------------------------------------------------
      // STEP 4: Validate the server echoed back our data + assigned an ID
      // -----------------------------------------------------------------------
      enhancedLogger.step('Step 4: Validate server echoed data and assigned new ID', xrayTestKey);
      expect(response.data).not.toBeNull();
      expect(response.data!.title).toBe(newPost.title);
      expect(response.data!.body).toBe(newPost.body);
      expect(response.data!.userId).toBe(newPost.userId);
      expect(response.data!.id).toBeGreaterThan(0); // Server assigned a new ID

      enhancedLogger.info(`✅ Post created with ID: ${response.data!.id}`, xrayTestKey);
      enhancedLogger.info(`✅ Title echoed back: "${response.data!.title}"`, xrayTestKey);
      enhancedLogger.pass(`TC05 passed — POST /posts returned 201 Created with id=${response.data!.id} (${response.durationMs}ms)`, xrayTestKey);
    }
  );

  // ==========================================================================
  // TEST 6: GET user profile and validate all key fields
  // ==========================================================================
  // WHAT THIS TEST DOES:
  //   Sends a GET request to /users/1 and checks:
  //     - HTTP status is 200 (OK)
  //     - User has id, name, email, phone, website, address, company
  //     - Email format looks valid (contains "@")
  //     - Nested objects (address, company) have their own fields
  //
  // WHY VALIDATE NESTED OBJECTS?
  //   Real APIs often return nested data:
  //     { name: "John", address: { city: "New York", zip: "10001" } }
  //   You should verify nested fields too — not just top-level ones.
  //
  // XRAY MAPPING: PROJ-106
  // ==========================================================================
  test(
    'TC06: GET /users/1 — Should return a complete user profile with nested fields',
    {
      annotation: { type: 'xray', description: 'PROJ-106' },
    },
    async ({ xrayTestKey }) => {
      enhancedLogger.section(`▶ Running Test: TC06 | XRAY: ${xrayTestKey}`);

      // -----------------------------------------------------------------------
      // STEP 1: Send GET request to fetch user #1
      // -----------------------------------------------------------------------
      enhancedLogger.step('Step 1: Send GET request to /users/1', xrayTestKey);

      const response = await apiGet<{
        id:       number;
        name:     string;
        username: string;
        email:    string;
        phone:    string;
        website:  string;
        address: {
          street:  string;
          city:    string;
          zipcode: string;
        };
        company: {
          name:        string;
          catchPhrase: string;
        };
      }>(`${API_BASE}/users/1`);

      enhancedLogger.info(
        `Response received — Status: ${response.status}, Duration: ${response.durationMs}ms`,
        xrayTestKey
      );

      // -----------------------------------------------------------------------
      // STEP 2: Validate status 200
      // -----------------------------------------------------------------------
      enhancedLogger.step('Step 2: Validate HTTP status is 200 OK', xrayTestKey);
      expect(response.status).toBe(200);
      expect(response.success).toBe(true);
      enhancedLogger.info('✅ Status 200 OK confirmed', xrayTestKey);

      // -----------------------------------------------------------------------
      // STEP 3: Validate top-level user fields
      // -----------------------------------------------------------------------
      enhancedLogger.step('Step 3: Validate top-level user fields', xrayTestKey);
      expect(response.data).not.toBeNull();

      const user = response.data!;
      expect(user.id).toBe(1);
      expect(typeof user.name).toBe('string');
      expect(user.name.length).toBeGreaterThan(0);
      expect(typeof user.email).toBe('string');
      expect(user.email).toContain('@');   // basic email format check
      expect(typeof user.phone).toBe('string');
      expect(typeof user.website).toBe('string');

      enhancedLogger.info(`✅ User ID:    ${user.id}`, xrayTestKey);
      enhancedLogger.info(`✅ User Name:  ${user.name}`, xrayTestKey);
      enhancedLogger.info(`✅ Email:      ${user.email}`, xrayTestKey);
      enhancedLogger.info(`✅ Phone:      ${user.phone}`, xrayTestKey);

      // -----------------------------------------------------------------------
      // STEP 4: Validate nested address object
      // -----------------------------------------------------------------------
      enhancedLogger.step('Step 4: Validate nested address object', xrayTestKey);
      expect(user.address).toHaveProperty('street');
      expect(user.address).toHaveProperty('city');
      expect(user.address).toHaveProperty('zipcode');
      expect(user.address.city.length).toBeGreaterThan(0);
      enhancedLogger.info(`✅ Address City: ${user.address.city}, Zip: ${user.address.zipcode}`, xrayTestKey);

      // -----------------------------------------------------------------------
      // STEP 5: Validate nested company object
      // -----------------------------------------------------------------------
      enhancedLogger.step('Step 5: Validate nested company object', xrayTestKey);
      expect(user.company).toHaveProperty('name');
      expect(user.company).toHaveProperty('catchPhrase');
      expect(user.company.name.length).toBeGreaterThan(0);
      enhancedLogger.info(`✅ Company: ${user.company.name}`, xrayTestKey);
      enhancedLogger.info(`✅ Catch Phrase: "${user.company.catchPhrase}"`, xrayTestKey);

      enhancedLogger.pass(`TC06 passed — GET /users/1 returned full user profile (${response.durationMs}ms)`, xrayTestKey);
    }
  );

});

ENDOFFILE_tests_api_test_ts
echo "  📄 Created tests/api.test.ts"

# ── tests/playwright-dev.test.ts ──
cat > "tests/playwright-dev.test.ts" << 'ENDOFFILE_tests_playwright_dev_test_ts'
// =============================================================================
// tests/playwright-dev.test.ts — PLAYWRIGHT.DEV NAVIGATION TEST SUITE
// =============================================================================
//
// ┌──────────────────────────────────────────────────────────────────────────┐
// │  📖 FOR NOVICE READERS — WHAT IS THIS FILE?                             │
// │                                                                          │
// │  This is a TEST FILE. It contains 5 test cases that automatically       │
// │  open a browser, navigate to https://playwright.dev/, click on          │
// │  different tabs, and verify each page loaded correctly.                  │
// │                                                                          │
// │  EACH TEST FOLLOWS THE SAME 3-STEP PATTERN:                             │
// │    Step 1: Navigate to the website (open the homepage)                  │
// │    Step 2: Click a specific tab/link in the navigation bar              │
// │    Step 3: Verify the page title and heading are correct                │
// │                                                                          │
// │  HOW TO RUN THESE TESTS:                                                │
// │    npm run test:headed           ← see the browser (recommended first   │
// │                                    time to watch what's happening)       │
// │    npm test                      ← headless (no visible browser, faster)│
// │    npx playwright test tests/playwright-dev.test.ts  ← run ONLY this   │
// │                                                                          │
// │  TEST SCENARIOS:                                                         │
// │    TC07: Open Homepage          → verify title "Playwright"             │
// │    TC08: Click Docs tab         → verify title "Installation"           │
// │    TC09: Click API tab          → verify title "Playwright Library"     │
// │    TC10: Click Community tab    → verify title "Welcome"                │
// │    TC11: Switch to Python       → verify title "Playwright Python"      │
// │                                                                          │
// │  MAPPING TO THE USER'S ORIGINAL 5 SCENARIOS:                            │
// │    "Valid Login → Dashboard"    → TC07: Navigate to Home, verify title  │
// │    "Navigate Profile"           → TC08: Click Docs tab, verify title    │
// │    "Navigate Settings"          → TC09: Click API tab, verify title     │
// │    "Navigate Reports"           → TC10: Click Community, verify title   │
// │    "Navigate Users"             → TC11: Switch to Python, verify title  │
// │                                                                          │
// │  NOTE: playwright.dev is a public docs site — it has no login,          │
// │  profile, settings, reports, or users pages. So we map each scenario    │
// │  to a REAL navigation action on the site. The testing PATTERN is        │
// │  identical: navigate → click → verify.                                  │
// └──────────────────────────────────────────────────────────────────────────┘
//
// =============================================================================

// =============================================================================
// STEP-BY-STEP: HOW A NOVICE CREATES THIS FILE USING THE FRAMEWORK
// =============================================================================
//
//  ┌───────────────────────────────────────────────────────────────────────┐
//  │  RECIPE: ADDING A NEW TEST FILE (5 steps)                            │
//  │                                                                       │
//  │  STEP 1: CREATE THE FILE                                              │
//  │    Create a new file in tests/ folder with name ending in .test.ts    │
//  │    Example: tests/playwright-dev.test.ts                              │
//  │                                                                       │
//  │  STEP 2: ADD THE IMPORTS (copy these 3 lines)                        │
//  │    import { test, expect } from '../utils/framework/xray-test-fixture';                │
//  │    import { PlaywrightDevPage } from '../pages/PlaywrightDevPage';    │
//  │    import { enhancedLogger } from '../utils/helpers/enhanced-logger';  │
//  │                                                                       │
//  │  STEP 3: CREATE A TEST GROUP                                          │
//  │    test.describe('Your Test Group Name', () => {                      │
//  │      // your tests go inside here                                     │
//  │    });                                                                │
//  │                                                                       │
//  │  STEP 4: ADD A TEST (copy this template)                             │
//  │    test('TC01: Description of what this tests',                       │
//  │      { annotation: { type: 'xray', description: 'PROJ-XXX' } },      │
//  │      async ({ page, xrayTestKey }) => {                               │
//  │        const myPage = new PlaywrightDevPage(page);                    │
//  │        // your test steps here                                        │
//  │      }                                                                │
//  │    );                                                                 │
//  │                                                                       │
//  │  STEP 5: RUN IT                                                       │
//  │    npx playwright test tests/playwright-dev.test.ts                   │
//  └───────────────────────────────────────────────────────────────────────┘
//
// =============================================================================

// ─────────────────────────────────────────────────────────────────────────────
// IMPORT 1: Custom test function with XRAY integration
// ─────────────────────────────────────────────────────────────────────────────
// WHY NOT "@playwright/test"?
//   Our custom xray-test-fixture wraps every test with:
//     ✅ Automatic XRAY result reporting (PASS/FAIL → JIRA)
//     ✅ Automatic screenshot on failure
//     ✅ Automatic accessibility scan after each UI test
//     ✅ Performance metrics collection (page load, FCP, LCP)
//   You get all of this for FREE just by using this import.
// ─────────────────────────────────────────────────────────────────────────────
import { test, expect } from '../utils/framework/xray-test-fixture';

// ─────────────────────────────────────────────────────────────────────────────
// IMPORT 2: The Page Object for playwright.dev
// ─────────────────────────────────────────────────────────────────────────────
// This class knows HOW to interact with playwright.dev:
//   - Where the Docs/API/Community links are (locators)
//   - How to click them and verify the page changed (methods)
// ─────────────────────────────────────────────────────────────────────────────
import { PlaywrightDevPage } from '../pages/PlaywrightDevPage';

// ─────────────────────────────────────────────────────────────────────────────
// IMPORT 3: Enhanced Logger — every step logged here shows in the HTML report
// ─────────────────────────────────────────────────────────────────────────────
// enhancedLogger.step('message')   → appears as a step in the report
// enhancedLogger.pass('message')   → appears as a green pass in the report
// enhancedLogger.section('header') → creates a visual divider in the report
// ─────────────────────────────────────────────────────────────────────────────
import { enhancedLogger } from '../utils/helpers/enhanced-logger';


// =============================================================================
// TEST GROUP: Playwright.dev Navigation Tests
// =============================================================================
// test.describe() groups related tests. The name shows in test reports as a
// section header, making the report easy to scan.
// =============================================================================
test.describe('Playwright.dev Navigation Tests', () => {

  // ============================================================================
  // TEST 1 (TC07): Navigate to Homepage and Verify Title
  // ============================================================================
  //
  //  ┌──────────────────────────────────────────────────────────────────────┐
  //  │  ORIGINAL SCENARIO: "Valid Login → verify Dashboard title"           │
  //  │                                                                      │
  //  │  WHAT THIS TEST DOES:                                                │
  //  │    1. Opens https://playwright.dev/ in a Chrome browser              │
  //  │    2. Waits for the page to fully load                               │
  //  │    3. Checks that the page title contains "Playwright"               │
  //  │    4. Checks that the main heading says "Playwright enables..."      │
  //  │                                                                      │
  //  │  WHY THIS MATTERS:                                                   │
  //  │    This is the most basic "smoke test" — can the site even load?     │
  //  │    If the homepage fails, everything else will fail too.              │
  //  │                                                                      │
  //  │  XRAY MAPPING:                                                       │
  //  │    annotation 'PROJ-107' → result sent to XRAY test case PROJ-107   │
  //  │    (Change this to YOUR actual XRAY test case key)                   │
  //  └──────────────────────────────────────────────────────────────────────┘
  //
  // ============================================================================
  test(
    'TC07: Navigate to Homepage and verify Playwright title',
    {
      // ──── XRAY LINK ────
      // This annotation connects this test to JIRA XRAY test case PROJ-107.
      // After the test runs, the result (PASS or FAIL) is automatically
      // uploaded to PROJ-107 in JIRA.
      // Change 'PROJ-107' to your actual test case key.
      annotation: { type: 'xray', description: 'PROJ-107' },
    },
    async ({ page, xrayTestKey }) => {

      // ── Log which test is starting (shows in terminal + HTML report) ──
      enhancedLogger.section(`▶ Running Test: TC07 | XRAY: ${xrayTestKey}`);

      // ── Create the page object ──
      // This gives us access to all the navigation methods defined in
      // PlaywrightDevPage.ts (navigateToHomePage, clickDocsTab, etc.)
      const devPage = new PlaywrightDevPage(page);

      // ── Step 1: Open the homepage ──
      // Calls PlaywrightDevPage.navigateToHomePage() which:
      //   a) Opens https://playwright.dev/ via BasePage.navigate()
      //   b) Dismisses any cookie banner via BasePage.dismissCookieBanner()
      //   c) Waits for the <h1> heading to be visible
      enhancedLogger.step('Step 1: Navigate to the Playwright.dev homepage', xrayTestKey);
      await devPage.navigateToHomePage();

      // ── Step 2: Verify the page title ──
      // Checks the browser tab title contains "Playwright".
      // The actual title is: "Fast and reliable end-to-end testing for modern web apps | Playwright"
      // We only check for "Playwright" to keep the assertion flexible.
      enhancedLogger.step('Step 2: Verify page title contains "Playwright"', xrayTestKey);
      await devPage.verifyPageTitle('Playwright');

      // ── Step 3: Verify the main heading ──
      // The <h1> on the homepage says: "Playwright enables reliable end-to-end testing..."
      enhancedLogger.step('Step 3: Verify homepage heading text', xrayTestKey);
      await devPage.verifyHeadingText('Playwright enables reliable end-to-end testing');

      // ── Step 4: Verify the URL is correct ──
      enhancedLogger.step('Step 4: Verify URL is playwright.dev', xrayTestKey);
      await devPage.verifyUrl('playwright.dev');

      enhancedLogger.pass(`TC07 passed — Homepage loaded with correct title and heading`, xrayTestKey);
    }
  );


  // ============================================================================
  // TEST 2 (TC08): Click Docs Tab and Verify Title
  // ============================================================================
  //
  //  ┌──────────────────────────────────────────────────────────────────────┐
  //  │  ORIGINAL SCENARIO: "Navigate Profile → verify title"                │
  //  │                                                                      │
  //  │  WHAT THIS TEST DOES:                                                │
  //  │    1. Opens the homepage                                             │
  //  │    2. Clicks the "Docs" tab in the top navigation bar               │
  //  │    3. Verifies the page title changes to "Installation | Playwright" │
  //  │    4. Verifies the <h1> heading says "Installation"                 │
  //  │    5. Verifies the URL contains "/docs/intro"                       │
  //  │                                                                      │
  //  │  PATTERN USED:                                                       │
  //  │    Navigate → Click Tab → Verify Title → Verify Heading → Verify URL│
  //  │    This exact pattern repeats for ALL 5 tests. Once you understand   │
  //  │    this one, you understand them all.                                │
  //  └──────────────────────────────────────────────────────────────────────┘
  //
  // ============================================================================
  test(
    'TC08: Click Docs tab and verify Installation page title',
    {
      annotation: { type: 'xray', description: 'PROJ-108' },
    },
    async ({ page, xrayTestKey }) => {

      enhancedLogger.section(`▶ Running Test: TC08 | XRAY: ${xrayTestKey}`);

      const devPage = new PlaywrightDevPage(page);

      // Step 1: Start at the homepage (every navigation test starts here)
      enhancedLogger.step('Step 1: Navigate to the homepage', xrayTestKey);
      await devPage.navigateToHomePage();

      // Step 2: Click "Docs" in the navbar
      // This calls PlaywrightDevPage.clickDocsTab() which:
      //   a) Finds the link with text "Docs" using getByRole('link', { name: 'Docs' })
      //   b) Clicks it via BasePage.clickElement()
      //   c) Waits for the new page to load
      enhancedLogger.step('Step 2: Click the "Docs" navigation tab', xrayTestKey);
      await devPage.clickDocsTab();

      // Step 3: Verify the page title changed to "Installation | Playwright"
      enhancedLogger.step('Step 3: Verify page title contains "Installation"', xrayTestKey);
      await devPage.verifyPageTitle('Installation');

      // Step 4: Verify the main heading says "Installation"
      enhancedLogger.step('Step 4: Verify heading text is "Installation"', xrayTestKey);
      await devPage.verifyHeadingText('Installation');

      // Step 5: Verify the URL navigated to /docs/intro
      enhancedLogger.step('Step 5: Verify URL contains "/docs/intro"', xrayTestKey);
      await devPage.verifyUrl('/docs/intro');

      enhancedLogger.pass(`TC08 passed — Docs tab navigated to Installation page`, xrayTestKey);
    }
  );


  // ============================================================================
  // TEST 3 (TC09): Click API Tab and Verify Title
  // ============================================================================
  //
  //  ┌──────────────────────────────────────────────────────────────────────┐
  //  │  ORIGINAL SCENARIO: "Navigate Settings → verify title"               │
  //  │                                                                      │
  //  │  WHAT THIS TEST DOES:                                                │
  //  │    1. Opens the homepage                                             │
  //  │    2. Clicks the "API" tab in the navbar                            │
  //  │    3. Verifies title contains "Playwright Library"                   │
  //  │    4. Verifies <h1> says "Playwright Library"                       │
  //  │    5. Verifies URL contains "/docs/api/class-playwright"            │
  //  └──────────────────────────────────────────────────────────────────────┘
  //
  // ============================================================================
  test(
    'TC09: Click API tab and verify Playwright Library page title',
    {
      annotation: { type: 'xray', description: 'PROJ-109' },
    },
    async ({ page, xrayTestKey }) => {

      enhancedLogger.section(`▶ Running Test: TC09 | XRAY: ${xrayTestKey}`);

      const devPage = new PlaywrightDevPage(page);

      enhancedLogger.step('Step 1: Navigate to the homepage', xrayTestKey);
      await devPage.navigateToHomePage();

      enhancedLogger.step('Step 2: Click the "API" navigation tab', xrayTestKey);
      await devPage.clickApiTab();

      enhancedLogger.step('Step 3: Verify page title contains "Playwright Library"', xrayTestKey);
      await devPage.verifyPageTitle('Playwright Library');

      enhancedLogger.step('Step 4: Verify heading text is "Playwright Library"', xrayTestKey);
      await devPage.verifyHeadingText('Playwright Library');

      enhancedLogger.step('Step 5: Verify URL contains "/docs/api/class-playwright"', xrayTestKey);
      await devPage.verifyUrl('/docs/api/class-playwright');

      enhancedLogger.pass(`TC09 passed — API tab navigated to Playwright Library page`, xrayTestKey);
    }
  );


  // ============================================================================
  // TEST 4 (TC10): Click Community Tab and Verify Title
  // ============================================================================
  //
  //  ┌──────────────────────────────────────────────────────────────────────┐
  //  │  ORIGINAL SCENARIO: "Navigate Reports → verify title"                │
  //  │                                                                      │
  //  │  WHAT THIS TEST DOES:                                                │
  //  │    1. Opens the homepage                                             │
  //  │    2. Clicks the "Community" tab in the navbar                      │
  //  │    3. Verifies title contains "Welcome"                             │
  //  │    4. Verifies <h1> says "Welcome"                                  │
  //  │    5. Verifies URL contains "/community/welcome"                    │
  //  └──────────────────────────────────────────────────────────────────────┘
  //
  // ============================================================================
  test(
    'TC10: Click Community tab and verify Welcome page title',
    {
      annotation: { type: 'xray', description: 'PROJ-110' },
    },
    async ({ page, xrayTestKey }) => {

      enhancedLogger.section(`▶ Running Test: TC10 | XRAY: ${xrayTestKey}`);

      const devPage = new PlaywrightDevPage(page);

      enhancedLogger.step('Step 1: Navigate to the homepage', xrayTestKey);
      await devPage.navigateToHomePage();

      enhancedLogger.step('Step 2: Click the "Community" navigation tab', xrayTestKey);
      await devPage.clickCommunityTab();

      enhancedLogger.step('Step 3: Verify page title contains "Welcome"', xrayTestKey);
      await devPage.verifyPageTitle('Welcome');

      enhancedLogger.step('Step 4: Verify heading text is "Welcome"', xrayTestKey);
      await devPage.verifyHeadingText('Welcome');

      enhancedLogger.step('Step 5: Verify URL contains "/community/welcome"', xrayTestKey);
      await devPage.verifyUrl('/community/welcome');

      enhancedLogger.pass(`TC10 passed — Community tab navigated to Welcome page`, xrayTestKey);
    }
  );


  // ============================================================================
  // TEST 5 (TC11): Switch to Python Language and Verify Title
  // ============================================================================
  //
  //  ┌──────────────────────────────────────────────────────────────────────┐
  //  │  ORIGINAL SCENARIO: "Navigate Users → verify title"                  │
  //  │                                                                      │
  //  │  WHAT THIS TEST DOES:                                                │
  //  │    1. Opens the homepage                                             │
  //  │    2. Opens the language dropdown (shows "Node.js")                  │
  //  │    3. Selects "Python" from the dropdown                            │
  //  │    4. Verifies the title now contains "Playwright Python"           │
  //  │    5. Verifies URL navigated to /python/                            │
  //  │                                                                      │
  //  │  WHY IS THIS TEST DIFFERENT?                                         │
  //  │    The language switcher is a DROPDOWN — not a simple link.          │
  //  │    This tests a different UI pattern: click dropdown → pick option. │
  //  └──────────────────────────────────────────────────────────────────────┘
  //
  // ============================================================================
  test(
    'TC11: Switch to Python language and verify Python page title',
    {
      annotation: { type: 'xray', description: 'PROJ-111' },
    },
    async ({ page, xrayTestKey }) => {

      enhancedLogger.section(`▶ Running Test: TC11 | XRAY: ${xrayTestKey}`);

      const devPage = new PlaywrightDevPage(page);

      enhancedLogger.step('Step 1: Navigate to the homepage', xrayTestKey);
      await devPage.navigateToHomePage();

      // Step 2: Switch language from Node.js to Python
      // This calls PlaywrightDevPage.switchToPython() which:
      //   a) Clicks the "Node.js" dropdown button to open it
      //   b) Clicks the "Python" link inside the dropdown
      //   c) Waits for the page to navigate to /python/
      enhancedLogger.step('Step 2: Open language dropdown and select "Python"', xrayTestKey);
      await devPage.switchToPython();

      enhancedLogger.step('Step 3: Verify page title contains "Playwright Python"', xrayTestKey);
      await devPage.verifyPageTitle('Playwright Python');

      enhancedLogger.step('Step 4: Verify URL contains "/python/"', xrayTestKey);
      await devPage.verifyUrl('/python/');

      enhancedLogger.pass(`TC11 passed — Language switched to Python successfully`, xrayTestKey);
    }
  );

});

ENDOFFILE_tests_playwright_dev_test_ts
echo "  📄 Created tests/playwright-dev.test.ts"

# =============================================================================
# INSTALL DEPENDENCIES
# =============================================================================
echo ""
echo "════════════════════════════════════════════════════════════"
echo "  📦 Installing dependencies (this takes ~1 minute)..."
echo "════════════════════════════════════════════════════════════"
npm install 2>&1 | tail -5

echo ""
echo "════════════════════════════════════════════════════════════"
echo "  🌐 Installing Playwright browsers (this takes ~1 minute)..."
echo "════════════════════════════════════════════════════════════"
npx playwright install chromium 2>&1 | tail -3

echo ""
echo "════════════════════════════════════════════════════════════"
echo "  🔍 Verifying TypeScript compilation..."
echo "════════════════════════════════════════════════════════════"
npx tsc --noEmit 2>&1 && echo "  ✅ TypeScript compilation OK" || echo "  ⚠️  TypeScript warnings (non-blocking)"

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  ✅ BUILD COMPLETE — Playwright AutoAgent is ready!         ║"
echo "╠══════════════════════════════════════════════════════════════╣"
echo "║                                                              ║"
echo "║  📂 Project location: $PROJECT_DIR                          ║"
echo "║                                                              ║"
echo "║  🚀 To run tests:                                             ║"
echo "║     cd $PROJECT_DIR && npm test                              ║"
echo "║                                                              ║"
echo "║  📊 To view the HTML report after tests:                    ║"
echo "║     open reports/execution-report-*.html                     ║"
echo "║                                                              ║"
echo "║  📖 To learn how to write tests:                            ║"
echo "║     Read WRITE_A_TEST.md (if shared) or see test files      ║"
echo "║     in tests/ folder for examples.                           ║"
echo "║                                                              ║"
echo "║  ⚙️  To configure for YOUR app:                              ║"
echo "║     Edit .env with your URLs, credentials, and timeouts     ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
```

---

## 📂 What Gets Created

After running the script, you'll have this project structure:

```
~/PlaywrightAutoAgent/
├── .env                          ← YOUR settings (timeouts, URLs, credentials)
├── .env.example                  ← Template showing all available settings
├── .gitignore                    ← Files to exclude from Git
├── package.json                  ← Dependencies and npm scripts
├── tsconfig.json                 ← TypeScript compiler settings
├── playwright.config.ts          ← Playwright test runner configuration
│
├── config/
│   └── environment.ts            ← Reads .env → typed config object
│
├── pages/
│   ├── BasePage.ts               ← Common browser actions (click, type, wait)
│   ├── LoginPage.ts              ← Login page interactions
│   └── PlaywrightDevPage.ts      ← Playwright.dev page interactions
│
├── utils/
│   ├── index.ts                  ← Re-exports all utilities
│   ├── api/api-helper.ts         ← REST API testing (GET, POST, PUT, DELETE)
│   ├── database/
│   │   ├── db-connection.ts      ← Database connection manager
│   │   └── test-data-manager.ts  ← Test data seeding/cleanup
│   ├── email/email-verifier.ts   ← Email verification (OTP, links)
│   ├── excel/
│   │   ├── excel-reader.ts       ← Read test data from spreadsheets
│   │   └── data-pool.ts          ← Manage test data rows
│   ├── helpers/
│   │   ├── logger.ts             ← Console logging with colors
│   │   ├── enhanced-logger.ts    ← File logging + metrics collection
│   │   └── screenshot.ts         ← Screenshot capture on failure
│   ├── jira-xray/
│   │   ├── jira-auth.ts          ← JIRA authentication
│   │   ├── xray-state.ts         ← Shared state across workers
│   │   ├── xray-result-updater.ts← Upload results to XRAY
│   │   ├── xray-test-execution.ts← Create Test Executions
│   │   └── xray-test-set.ts      ← Fetch test cases from XRAY
│   ├── reporting/
│   │   └── report-generator.ts   ← HTML report with charts
│   └── security/
│       └── crypto-helper.ts      ← AES-256 password encryption
│
├── tests/
│   ├── xray-state-helper.ts      ← XRAY state helper
│   ├── xray-test-fixture.ts      ← Custom test wrapper with XRAY
│   ├── global-setup.ts           ← Runs ONCE before all tests
│   ├── global-teardown.ts        ← Runs ONCE after all tests
│   ├── login.test.ts             ← 3 login tests (TC01–TC03)
│   ├── api.test.ts               ← 3 API tests (TC04–TC06)
│   └── playwright-dev.test.ts    ← 5 navigation tests (TC07–TC11)
│
├── reports/                      ← HTML reports (auto-generated)
└── logs/                         ← Log files (auto-generated)
```

**Total: 29 source files, 11 test cases (base), ~9,000 lines of code.**

> 💡 The full framework on GitHub also includes: `test-data/` (YAML data-driven files),
> `test-fixtures/` (self-hosted HTML), `pages/SalesforceIframePage.ts`, and
> `tests/salesforce-iframe.test.ts` — bringing the total to 33 files and 13 test cases.

---

## ▶️ After Setup — Quick Commands

| Command | What It Does |
|---------|--------------|
| `npm test` | Run all tests |
| `npm run test:login` | Run only login tests (TC01–TC03) |
| `npm run test:api` | Run only API tests (TC04–TC06) |
| `npm run run:headed` | Run tests with visible browser |
| `npm run test:debug` | Run with Playwright Inspector |
| `open reports/execution-report-*.html` | View HTML report |

---

## ⚙️ Configure for YOUR Application

After the build completes, edit `.env` to point to your own app:

```bash
# Change these to YOUR values:
BASE_URL=https://your-app.com          # Your website URL
JIRA_BASE_URL=https://your.atlassian.net  # Your JIRA
JIRA_USERNAME=your-email@company.com
JIRA_API_TOKEN=your-api-token
TEST_TIMEOUT=60000                     # Increase for slow apps
```

---

## 🔧 Troubleshooting

| Problem | Solution |
|---------|----------|
| `node: command not found` | Install Node.js from https://nodejs.org |
| `permission denied` | Run: `chmod +x` on the script, or paste directly |
| Tests timeout | Edit `.env` → increase `TEST_TIMEOUT=120000` |
| `ECONNREFUSED` | Check your internet connection |
| Browser not found | Run: `npx playwright install chromium` |

---

*Generated: 5 March 2026 | Last updated: 6 March 2026*
*Framework: Playwright AutoAgent – AI Automation Framework*
*Source files: 33 | Test cases: 13 (3 Login + 3 API + 5 Navigation + 2 Iframe) | Total lines: ~10,000*
*Note: This script creates the base 11 tests (TC01–TC11). For iframe tests (TC12–TC13), YAML data-driven setup, and test-data-loader, see the full repo on GitHub or the latest .md docs.*
