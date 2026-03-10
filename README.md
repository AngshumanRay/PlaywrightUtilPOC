# Playwright AutoAgent – AI Automation Framework
# =============================================================================

> **Beginner-friendly** AI-powered automation framework that runs browser (UI) and API tests,
> then reports results directly into JIRA XRAY — with a beautiful HTML report.
> No coding experience needed to run it; this guide walks you through every step.

---

## ⚡ Quick Start (Already Set Up? Run Tests in 10 Seconds)

```bash
npm test                       # Run all 14 tests (4 Login + 3 API + 5 Navigation + 2 Iframe) → results go to JIRA + HTML report
open reports/execution-report-*.html   # View the visual report in your browser
```

> First time here? Keep reading from [Prerequisites](#prerequisites) onward.

---

## 📖 Documentation Guide — Where to Go Next

| Document | What You'll Learn | Best For |
|----------|-------------------|----------|
| **[README.md](README.md)** (you're here) | Setup, install, run commands, iframe guide, troubleshooting | **Everyone — start here** |
| **[GETTING_STARTED.md](GETTING_STARTED.md)** | Quick start for NEW consumers (clone → init → run) | **People receiving this framework for the first time** |
| **[WRITE_A_TEST.md](WRITE_A_TEST.md)** | Copy-paste guide to write your first test (includes iframe section) | **Non-technical users** |
| **[CAPABILITIES.md](CAPABILITIES.md)** | Every feature explained in plain English (includes iframe guide) | **New team members exploring the framework** |
| **[SKILLS.md](SKILLS.md)** | Framework skills & techniques at a glance | **Quick reference for what the framework can do** |
| **[WALKTHROUGH.md](WALKTHROUGH.md)** | End-to-end XRAY flow with diagrams | **Anyone learning how JIRA reporting works** |
| **[HOWTO_5_NAVIGATION_TESTS.md](HOWTO_5_NAVIGATION_TESTS.md)** | Step-by-step guide: how the 5 navigation tests were built | **Anyone adding new test suites** |
| **[docs/RUN_REPORT_*.md](docs/)** | Auto-generated run reports | Anyone reviewing past test runs |

> 💡 **Not a developer?** Read this README for setup, then go straight to **[WRITE_A_TEST.md](WRITE_A_TEST.md)** — it explains how to write a test with zero coding knowledge, including iframe tests.
> 
> 💡 **Developer?** After setup, read **[CAPABILITIES.md](CAPABILITIES.md)** to see everything the framework can do.
>
> 💡 **Need to test iframes?** (Salesforce, ServiceNow, Workday) Jump to the [Iframe Testing Guide](#️-iframe-testing-guide--how-to-test-inside-iframes) section in this file, or see the detailed guide in [WRITE_A_TEST.md](WRITE_A_TEST.md#️-iframe-testing--a-beginners-guide).

---

## 📚 Table of Contents

1. [Quick Start](#-quick-start-already-set-up-run-tests-in-10-seconds)
2. [What Is This Project?](#what-is-this-project)
3. [Project Structure Explained](#project-structure-explained)
4. [Prerequisites](#prerequisites)
5. [First-Time Setup](#first-time-setup)
6. [Configure Your Environment](#configure-your-environment)
7. [How to Run Tests](#how-to-run-tests)
8. [Understanding the Test Results](#understanding-the-test-results)
9. [How the XRAY Integration Works](#how-the-xray-integration-works)
10. [Adding New Tests](#adding-new-tests)
11. [Adding New Page Objects](#adding-new-page-objects)
12. [🖼️ Iframe Testing Guide](#️-iframe-testing-guide--how-to-test-inside-iframes)
13. [Troubleshooting](#troubleshooting)
14. [Glossary (Key Terms)](#glossary)

---

## What Is This Project?

A one-command test framework that does three things automatically:

| Phase | What Happens |
|-------|-------------|
| **Before tests** | Connects to JIRA → fetches test cases from XRAY → creates a Test Execution → seeds database (if configured) |
| **During tests** | Opens Chrome for UI tests, calls REST APIs for API tests, checks assertions, captures failure screenshots |
| **After tests** | Uploads PASS/FAIL to JIRA XRAY → attaches screenshots → generates HTML report → writes PASS/FAIL summary to log file → cleans up test data |

> **UI tests** (browser automation), **API tests** (direct backend calls), and **Navigation tests** (cross-site browsing) are all supported.
> All types report to JIRA XRAY and appear in the HTML report.

---

## Project Structure Explained

```
project-root/
│
├── tests/                        ← TEST FILES (what to test — only .test.ts files live here)
│   ├── login.test.ts             ← UI tests: Login feature (3 test cases: TC01-TC03)
│   ├── api.test.ts               ← API tests: Backend REST API (3 test cases: TC04-TC06)
│   ├── playwright-dev.test.ts    ← Navigation tests: playwright.dev (5 test cases: TC07-TC11)
│   └── salesforce-iframe.test.ts ← Iframe tests: Salesforce-style multi-iframe (2 test cases: TC12-TC13)
│
├── pages/                        ← PAGE OBJECTS (how to interact with pages)
│   ├── BasePage.ts               ← Common actions: click, fill, navigate, cookies...
│   ├── LoginPage.ts              ← Login-specific actions and locators
│   ├── PlaywrightDevPage.ts      ← playwright.dev navigation actions and locators
│   └── SalesforceIframePage.ts   ← Salesforce-style iframe actions (fill forms inside iframes)
│
├── utils/                        ← UTILITIES (helper code — one folder per tool)
│   ├── framework/                ← Framework plumbing (setup, teardown, test fixture)
│   │   ├── global-setup.ts       ←   Runs ONCE before all tests (XRAY setup, DB seed)
│   │   ├── global-teardown.ts    ←   Runs ONCE after all tests (upload results, HTML report)
│   │   ├── xray-test-fixture.ts  ←   Adds XRAY reporting + a11y scan to every test automatically
│   │   └── xray-state-helper.ts  ←   Small bridge file for shared state
│   ├── jira-xray/                ← JIRA XRAY integration
│   │   ├── jira-auth.ts          ←   JIRA API authentication
│   │   ├── xray-test-set.ts      ←   Fetch test cases from XRAY Test Set
│   │   ├── xray-test-execution.ts←   Create Test Execution in JIRA
│   │   ├── xray-result-updater.ts←   Update PASS/FAIL results in JIRA
│   │   └── xray-state.ts         ←   Shared state file during test run
│   ├── reporting/                ← HTML report generator
│   │   └── report-generator.ts   ←   Builds the full HTML execution report with charts
│   ├── database/                 ← Database / test data management
│   │   ├── test-data-manager.ts  ←   Seed, query, and cleanup test data
│   │   └── db-connection.ts      ←   Secure database connection wrapper
│   ├── email/                    ← Email verification
│   │   └── email-verifier.ts     ←   Wait for emails, extract OTPs & links
│   ├── api/                      ← REST API testing helper
│   │   └── api-helper.ts         ←   GET, POST, PUT, DELETE convenience functions
│   ├── excel/                    ← Excel data-driven testing
│   │   ├── excel-reader.ts       ←   Read test data from .xlsx files
│   │   └── data-pool.ts          ←   Manage pools of test data rows
│   ├── security/                 ← Encryption / credential protection
│   │   └── crypto-helper.ts      ←   AES-256 encrypt/decrypt passwords & secrets
│   ├── helpers/                  ← Shared helpers (used by all utilities)
│   │   ├── logger.ts             ←   Formatted, color-coded log messages
│   │   ├── enhanced-logger.ts    ←   Structured data collector for the HTML report
│   │   ├── test-data-loader.ts   ←   Reads test data from YAML files (data-driven)
│   │   └── screenshot.ts         ←   Capture browser screenshots
│   └── index.ts                  ← Barrel file (import anything from '../utils')
│
├── test-data/                    ← YAML TEST DATA (data-driven — tests read inputs from here)
│   ├── ui-tests.yaml             ←   UI test data: Login + Navigation + Iframe (credentials, URLs, form data)
│   └── api-tests.yaml            ←   API test data: endpoints, payloads, expected status codes
│
├── test-fixtures/                ← LOCAL HTML FIXTURES (self-hosted pages for reliable testing)
│   └── iframe-form.html          ←   Salesforce-style page with 2 iframes and form fields
│
├── config/
│   └── environment.ts            ← Reads .env file, exports clean config object
│
├── scripts/                      ← BUILD & INIT SCRIPTS
│   └── init-project.ts           ← Project initializer for new consumers (npm run init)
│
├── playwright.config.ts          ← Playwright settings (browsers, timeouts, etc.)
├── .env                          ← YOUR credentials (DO NOT COMMIT TO GIT!)
├── .env.example                  ← Template showing what .env should look like
├── .frameworkrc                  ← Feature toggle config (enable/disable capabilities)
├── .gitignore                    ← Files excluded from Git
├── tsconfig.json                 ← TypeScript compiler settings
├── package.json                  ← Project dependencies and npm scripts
│
├── GETTING_STARTED.md            ← 🚀 Quick start for NEW consumers
├── WRITE_A_TEST.md               ← ✍️  How to write a test (zero coding knowledge needed)
├── CAPABILITIES.md               ← 🧰 What can this framework do?
├── SKILLS.md                     ← 🎯 Framework skills & techniques at a glance
├── WALKTHROUGH.md                ← 📖 How the XRAY flow works end-to-end
├── HOWTO_5_NAVIGATION_TESTS.md   ← 🧭 Step-by-step: how the 5 navigation tests were built
├── README.md                     ← 📚 Setup guide (this file)
│
├── reports/                      ← HTML execution reports (auto-generated)
│   └── execution-report-*.html   ←   Visual report with charts, steps, and a11y results
├── logs/                         ← LOG FILES (auto-generated, one per day)
│   └── test-run-*.log            ←   PASS/FAIL summary at top + detailed step-by-step logs
└── docs/
    └── RUN_REPORT_*.md           ← 📋 Reports generated for each test run
```

---

## Prerequisites

Before you can run this project, you need to install:

| Tool | Why You Need It | How to Get It |
|------|----------------|---------------|
| **Node.js** (v18+) | Runs JavaScript/TypeScript on your machine | https://nodejs.org → Download "LTS" version |
| **npm** | Installs project dependencies (comes with Node.js) | Installed with Node.js |
| **Git** (optional) | Source control | https://git-scm.com |

**Verify your installations:**
```bash
node --version    # Should show v18.x.x or higher
npm --version     # Should show 9.x.x or higher
```

---

## First-Time Setup

### Step 1: Install all dependencies
```bash
npm install
```
This downloads all the libraries listed in `package.json` into the `node_modules/` folder.

### Step 2: Install Playwright browsers
```bash
npx playwright install chromium
```
This downloads the Chromium browser that Playwright uses for testing.
(You only need to do this once, or when you update Playwright.)

### Step 3: Set up your environment file
```bash
cp .env.example .env
```
This copies the template to create your actual `.env` file.
Then open `.env` and fill in your real values (see next section).

---

## Configure Your Environment

Open the `.env` file and fill in your details:

```env
# ──── JIRA CONNECTION ────
# Your JIRA instance URL
JIRA_BASE_URL=https://your-company.atlassian.net

# Your JIRA email address
JIRA_USERNAME=your-email@company.com

# Your JIRA API Token
# Get it from: https://id.atlassian.com/manage-profile/security/api-tokens
JIRA_API_TOKEN=your-api-token-here

# ──── XRAY SETTINGS ────
# Your JIRA project key (visible in ticket numbers like "PROJ-123" → key is "PROJ")
XRAY_PROJECT_KEY=PROJ

# The XRAY Test Set ticket ID — created MANUALLY by QA in JIRA (Issue Type: "Test Set")
# This groups your test cases together. See CAPABILITIES.md for the full setup guide.
XRAY_TEST_SET_ID=PROJ-456

# Current Sprint number (update this at the start of each sprint)
XRAY_SPRINT_NUMBER=5

# ──── APP UNDER TEST ────
# The URL of the application you're testing
BASE_URL=https://your-app.com

# ──── ENCRYPTION (for encrypted passwords in YAML) ────
# Set a strong passphrase (min 16 characters). This enables ${ENC:...}
# auto-decryption in YAML test data files. Run: npm run encrypt-password
ENCRYPTION_KEY=your-strong-passphrase-min-16-chars
```

### How to get a JIRA API Token:
1. Log into Jira → Click your profile picture (top-right)
2. Click **"Manage Account"**
3. Go to the **"Security"** tab
4. Click **"Create and manage API tokens"**
5. Click **"Create API token"**, give it a name (e.g., "Playwright Tests")
6. Copy the token and paste it into `.env` as `JIRA_API_TOKEN`

---

## How to Run Tests

All commands are run from the project root directory in your terminal:

```bash
# Initialize project for first-time consumers (creates .env, starter templates, installs browsers)
npm run init

# Run ALL tests (UI + API + Navigation + Iframe, with JIRA XRAY integration)
npm test

# Run ONLY the UI login tests (TC01–TC03)
npm run test:login

# Run ONLY the API tests (TC04–TC06)
npm run test:api

# Run ONLY the navigation tests (TC07–TC11)
npm run test:nav

# Run ONLY the iframe tests (TC12–TC13)
npm run test:iframe

# Run ALL tests with a VISIBLE browser window (good for debugging UI tests)
npm run run:headed

# Run ALL tests in headless mode (no visible window, faster — default)
npm run run:headless

# Run tests in DEBUG mode (step through tests interactively)
npm run test:debug

# Run tests with Playwright's visual UI mode
npm run test:ui

# View the Playwright HTML trace report after running tests
npm run test:report

# Check TypeScript for errors without running tests
npm run lint

# Encrypt a password for use in YAML files or .env
npm run encrypt-password

# Clean up generated artifacts (reports, logs, test-results)
npm run clean
```

> **New to tests?** Just run `npm test` — it runs everything and generates the HTML report in `reports/`.

---

## Understanding the Test Results

After running tests, you'll see output like this in the terminal:

```
──────────────────────────────────────────────────────────
  🚀 GLOBAL SETUP — Starting Playwright AutoAgent
──────────────────────────────────────────────────────────

📋 Utility Status Dashboard
  🔹 JIRA XRAY:  ✅ Configured
  🔹 Database:   ⚪ Not configured (will skip)
  🔹 Email:      ⚪ Not configured (will skip)
  🔹 API Helper: ⚪ Using BASE_URL as fallback
  🔹 Encryption: ✅ Configured (YAML passwords auto-decrypted via ${ENC:...})

✅ [JIRA Auth] Connected successfully as: John Doe (john@company.com)
✅ Loaded 13 test case(s) from "Sprint 5 Test Set"
✅ Test Execution created: PROJ-789
✅ State saved.

▶ STEP   Step 1: Navigate to the login page
ℹ INFO   Page loaded: Login | MyApp
▶ STEP   Step 2: Enter valid credentials and submit
✅ PASS  TC01 | XRAY: PROJ-101

❌ FAIL  TC02 | XRAY: PROJ-102
         Error: Expected error message to contain "Invalid" but found "Error"
📸 Screenshot saved: TC02_FAILURE_2026-03-03.png

──────────────────────────────────────────────────────────
  📊 FINAL XRAY EXECUTION STATUS
  Execution: PROJ-789  |  Sprint: 5
  ✅ Passed: 5  |  ❌ Failed: 1  |  ⏳ Pending: 0
  View in JIRA: https://your-company.atlassian.net/browse/PROJ-789
──────────────────────────────────────────────────────────

📊 REPORT — Generating HTML Execution Report
✅ Execution report generated: reports/execution-report-2026-03-03.html
   Open it in any browser to view charts & detailed results.
```

**View the HTML Execution Report:**

The HTML report is saved to `reports/execution-report-YYYY-MM-DD.html` automatically after every run.
Open it in any browser — it contains:
- Summary cards: total tests, pass rate, test type breakdown (UI vs API)
- Pass/Fail/Aborted status for each test with 🖥️ UI / 🔌 API badge
- Start time and duration per test
- Screenshots of failed tests (click to zoom)
- Step-by-step log accordion per test
- Accessibility (a11y) issues table
- Performance metrics table
- XRAY integration status and links

**View the Playwright Trace Report:**
```bash
npm run test:report
```
Opens Playwright's built-in trace viewer — great for replaying individual test steps.

---

## How the XRAY Integration Works

### The Manual-vs-Automated Boundary

```
✋ QA does MANUALLY (one-time in JIRA):        🤖 Playwright does AUTOMATICALLY (every run):
──────────────────────────────────────          ──────────────────────────────────────────────
1. Create Test Cases in XRAY (PROJ-101...)     5. Authenticates with JIRA
2. Create a Test Set (PROJ-456)                6. Fetches test cases from the Test Set
3. Add Test Cases to the Test Set              7. Creates a Test Execution (PROJ-789)
4. Put XRAY_TEST_SET_ID=PROJ-456 in .env       8. Runs tests + captures PASS/FAIL
                                                9. Uploads results + screenshots to JIRA
                                               10. Generates HTML report
```

> **For the complete step-by-step XRAY setup guide** (with JIRA screenshots, API endpoints,
> best practices, and sprint checklist), see **[CAPABILITIES.md → JIRA XRAY Integration](CAPABILITIES.md#-jira-xray-integration)**.

### End-to-End Flow Diagram

```
YOUR .env FILE
    │
    ▼
global-setup.ts
    ├─ Authenticates with JIRA API (jira-auth.ts)
    ├─ Fetches test cases from Test Set PROJ-456 (xray-test-set.ts)
    ├─ Creates new Test Execution "Sprint 5 Run" in JIRA (xray-test-execution.ts)
    └─ Saves execution key "PROJ-789" to xray-state.json
    │
    ▼
TESTS RUN (login.test.ts, api.test.ts, playwright-dev.test.ts, salesforce-iframe.test.ts)
    ├─ Each test has: annotation: { type: 'xray', description: 'PROJ-101' }
    ├─ UI tests use Page Objects (LoginPage, PlaywrightDevPage, SalesforceIframePage)
    ├─ API tests call REST endpoints via api-helper.ts
    ├─ Iframe tests use BasePage iframe helpers (getIframe, fillInIframe, etc.)
    ├─ After each test: result (PASS/FAIL + screenshot) saved to xray-state.json
    │
    ▼
global-teardown.ts
    ├─ Reads xray-state.json
    ├─ For each test result: calls XRAY API to update status (xray-result-updater.ts)
    ├─ Attaches failure screenshots to JIRA test runs
    ├─ Generates the HTML execution report (report-generator.ts)
    └─ Logs final summary (Passed: 12, Failed: 1)
    │
    ▼
JIRA XRAY shows:
    PROJ-789 (Test Execution)
        ├─ PROJ-101: ✅ PASS  (UI — Login)
        ├─ PROJ-102: ❌ FAIL  (UI — Login, screenshot attached)
        ├─ PROJ-103: ✅ PASS  (UI — Login)
        ├─ PROJ-104: ✅ PASS  (API)
        ├─ PROJ-105: ✅ PASS  (API)
        ├─ PROJ-106: ✅ PASS  (API)
        ├─ PROJ-107: ✅ PASS  (UI — Navigation)
        ├─ PROJ-108: ✅ PASS  (UI — Navigation)
        ├─ PROJ-109: ✅ PASS  (UI — Navigation)
        ├─ PROJ-110: ✅ PASS  (UI — Navigation)
        ├─ PROJ-111: ✅ PASS  (UI — Navigation)
        ├─ PROJ-112: ✅ PASS  (UI — Iframe)
        └─ PROJ-113: ✅ PASS  (UI — Iframe)

HTML REPORT (reports/execution-report-2026-03-06.html):
    ├─ Summary: 13 tests | 12 passed | 1 failed | 10 UI | 3 API
    ├─ Charts: pass rate, test types, duration, a11y issues
    └─ Per-test: status badge, type badge, start time, step log, screenshot
```

### Each Sprint Checklist

```
□ (If needed) Create new Test Cases in JIRA for new features
□ (If needed) Update the Test Set with new/removed test cases
□ Update .env: XRAY_SPRINT_NUMBER=6 (and XRAY_TEST_SET_ID if changed)
□ Write new Playwright tests with annotation: { type: 'xray', description: 'PROJ-NEW' }
□ Run: npm test
□ Review: Open JIRA → find the new Test Execution → review results
```

> **JIRA not configured?** No problem. Set placeholder values in `.env` and tests run
> normally — the HTML report is still generated with full results.

---

## Adding New Tests

> **Non-developer?** Skip this section and read **[WRITE_A_TEST.md](WRITE_A_TEST.md)** instead — it's much simpler.

### Writing a UI Test (browser-based)

### Step 1: Create or open a test file
Create `tests/your-feature.test.ts` (or add to an existing test file).

### Step 2: Use this template:
```typescript
// Import our custom test function (includes XRAY integration + a11y scan)
import { test, expect } from '../utils/framework/xray-test-fixture';

// Import the page object for the page you're testing
import { YourPage } from '../pages/YourPage';

test.describe('Your Feature Tests', () => {

  test(
    'TC01: Description of what this test checks',
    {
      // ⬇ LINK THIS TEST TO YOUR XRAY TEST CASE KEY ⬇
      annotation: { type: 'xray', description: 'PROJ-XXX' },
    },
    async ({ page }) => {
      const yourPage = new YourPage(page);

      // Navigate to the page
      await yourPage.navigateToPage();

      // Perform actions
      await yourPage.doSomething();

      // Assert the expected result
      await yourPage.verifyExpectedOutcome();
    }
  );

});
```

### Writing an API Test (direct backend call)

```typescript
import { test, expect } from '../utils/framework/xray-test-fixture';
import { apiGet, apiPost } from '../utils';

test.describe('User API Tests', () => {

  test(
    'TC04: GET /users/1 should return valid user data',
    {
      annotation: { type: 'xray', description: 'PROJ-104' },
    },
    async () => {  // Note: no "page" needed for API tests
      const response = await apiGet('https://api.your-app.com/users/1');

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('id', 1);
    }
  );

});
```

### Step 3: Run your new test:
```bash
npx playwright test tests/your-feature.test.ts
```

### 💡 Data-Driven Tip: Load Test Data from YAML

Instead of hardcoding test values (credentials, URLs, expected results), load them from external YAML files in `test-data/`. This makes tests reusable — change data without modifying code. You can also selectively run/skip tests using the `run: yes/no` toggle:

```typescript
import { getTestData, isTestEnabled } from '../utils/helpers/test-data-loader';

// In your test:
const td = getTestData('ui-tests.yaml', 'PROJ-101');
if (!isTestEnabled('ui-tests.yaml', 'PROJ-101')) test.skip(); // skip if run: no
await page.getByLabel('Username').fill(td.username as string);
await page.getByLabel('Password').fill(td.password as string);
```

YAML file structure (`test-data/ui-tests.yaml`):
```yaml
PROJ-101:
  run: yes                          # ← yes = run, no = skip
  testCase: "TC01: Valid login"
  username: "tomsmith"              # ← flat data fields (no nesting)
  password: "${ENC:U2FsdGVkX1+8pM...}"  # ← encrypted! (never plain text)
  expectedUrlFragment: "/secure"
```

### 💡 Parameterized Testing: Run the SAME Test with MULTIPLE Data Sets

Use `getTestDataSets()` + `dataSets:` in YAML to run a test N times with different inputs:

```typescript
import { getTestDataSets, isTestEnabled } from '../utils/helpers/test-data-loader';

const DATA_FILE = 'ui-tests.yaml';
const proj101Enabled = isTestEnabled(DATA_FILE, 'PROJ-101');
const proj101Sets    = getTestDataSets(DATA_FILE, 'PROJ-101');

for (const ds of proj101Sets) {
  test(`TC01: Login [${ds.label}]`,
    { annotation: { type: 'xray', description: 'PROJ-101' } },
    async ({ page, xrayTestKey }) => {
      if (!proj101Enabled) test.skip();
      await page.getByLabel('Username').fill(ds.username as string);
      await page.getByLabel('Password').fill(ds.password as string);
    }
  );
}
```

YAML with `dataSets:` array:
```yaml
PROJ-101:
  run: yes
  testCase: "TC01: Login"
  dataSets:
    - label: "Standard user"
      username: "tomsmith"
      password: "${ENC:U2FsdGVkX1+8pM...}"
    - label: "Admin user"
      username: "admin"
      password: "${ENC:U2FsdGVkX1/xyz...}"
```

This generates **two tests**: `TC01: Login [Standard user]` and `TC01: Login [Admin user]`. If there is NO `dataSets:` array, `getTestDataSets()` returns a single `[{ label: 'default', ...allFields }]` — fully backward compatible.

> 🔐 **Encrypt passwords in YAML** — Use `${ENC:ciphertext}` to store encrypted values.
> Run `npm run encrypt-password` to generate the ciphertext. The loader auto-decrypts at runtime.
> See the [Encryption section in CAPABILITIES.md](CAPABILITIES.md#-security--encryption) for details.

---

## Adding New Page Objects

For every new PAGE in your application, create a new file in `pages/`.

### Step 1: Create `pages/DashboardPage.ts`:
```typescript
import { type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class DashboardPage extends BasePage {

  // Define locators for elements on this page
  private get welcomeHeading() {
    return this.page.getByRole('heading', { level: 1 });
  }

  constructor(page: Page) {
    super(page);
  }

  async navigateToDashboard() {
    await this.navigate('/dashboard');
  }

  async verifyDashboardLoaded() {
    await this.assertElementVisible(this.welcomeHeading, 'Dashboard heading');
  }
}
```

### Step 2: Use it in a test:
```typescript
import { DashboardPage } from '../pages/DashboardPage';

const dashboardPage = new DashboardPage(page);
await dashboardPage.navigateToDashboard();
await dashboardPage.verifyDashboardLoaded();
```

---

## 🖼️ Iframe Testing Guide — How to Test Inside Iframes

> **What is an iframe?** An `<iframe>` is a "page inside a page." Enterprise apps like **Salesforce, ServiceNow, and Workday** embed forms and editors inside iframes. Playwright **cannot** see elements inside an iframe with normal `page.locator()` — you must use our iframe helpers.

This framework provides **10 generic iframe helper methods** in `BasePage.ts` so you never have to manually "switch" in and out of frames like you would in Selenium.

### The Core Pattern (3 Steps — That's It)

```typescript
import { BasePage } from '../pages/BasePage';

// Step 1: Create a BasePage
const basePage = new BasePage(page);

// Step 2: Get the iframe handle (do this ONCE per iframe)
const frame = basePage.getIframe('#my-iframe');

// Step 3: Use helpers — NO switching, NO frame management
await basePage.fillInIframe(frame, '#name', 'John', 'Name field');
await basePage.clickInIframe(frame, '.save-btn', 'Save button');
await basePage.selectInIframe(frame, '#country', 'India', 'Country dropdown');
await basePage.assertTextInIframe(frame, '.msg', 'Saved!', 'Success message');

// Back to main page? Just use page.locator() — no switch needed
await expect(page.locator('#heading')).toBeVisible();
```

### All 10 Iframe Helper Methods

| Method | What It Does | Example |
|--------|-------------|--------|
| `getIframe(selector)` | Get an iframe handle | `const frame = basePage.getIframe('#myFrame')` |
| `getNestedIframe(outer, inner)` | Get an iframe inside another iframe | `const frame = basePage.getNestedIframe('#outer', '#inner')` |
| `locatorInIframe(frame, selector)` | Get a Locator inside an iframe | `const el = basePage.locatorInIframe(frame, 'h1')` |
| `fillInIframe(frame, selector, text, desc)` | Type into an input inside iframe | `await basePage.fillInIframe(frame, '#email', 'a@b.com', 'Email')` |
| `clickInIframe(frame, selector, desc)` | Click a button/link inside iframe | `await basePage.clickInIframe(frame, '.btn', 'Submit')` |
| `selectInIframe(frame, selector, value, desc)` | Pick a dropdown option inside iframe | `await basePage.selectInIframe(frame, '#dd', 'Option', 'DD')` |
| `typeInIframe(frame, selector, text, desc)` | Type into rich text editor inside iframe | `await basePage.typeInIframe(frame, '#body', 'Hello', 'Editor')` |
| `assertTextInIframe(frame, selector, text, desc)` | Verify text inside iframe | `await basePage.assertTextInIframe(frame, '.msg', 'OK', 'Msg')` |
| `assertVisibleInIframe(frame, selector, desc)` | Verify element visible inside iframe | `await basePage.assertVisibleInIframe(frame, '#name', 'Name')` |
| `getIframeFieldValue(frame, selector)` | Read input value inside iframe | `const val = await basePage.getIframeFieldValue(frame, '#name')` |
| `getIframeTextContent(frame, selector)` | Read text content inside iframe | `const txt = await basePage.getIframeTextContent(frame, '.label')` |

### Working with Multiple Iframes

```typescript
// Get handles for BOTH iframes — hold them simultaneously
const leadFrame    = basePage.getIframe('#lead-iframe');
const contactFrame = basePage.getIframe('#contact-iframe');

// Fill in iframe #1
await basePage.fillInIframe(leadFrame, '#name', 'John', 'Name');

// Jump to iframe #2 — just use the other handle (NO switchToDefault!)
await basePage.fillInIframe(contactFrame, '#city', 'Mumbai', 'City');

// Jump BACK to iframe #1 — just use the first handle again
const name = await basePage.getIframeFieldValue(leadFrame, '#name');
expect(name).toBe('John');

// Main page — just use page.locator() as normal
await expect(page.locator('#title')).toHaveText('My App');
```

### Complete Iframe Test Template — Copy & Paste

Save this as `tests/your-iframe-test.test.ts`:

```typescript
import path from 'path';
import { test, expect } from '../utils/framework/xray-test-fixture';
import { BasePage } from '../pages/BasePage';
import { enhancedLogger } from '../utils/helpers/enhanced-logger';
import { getTestData, isTestEnabled } from '../utils/helpers/test-data-loader';

const DATA_FILE = 'ui-tests.yaml';

test.describe('Your Iframe Tests', () => {

  test('TC##: Fill form fields inside an iframe', {
    annotation: { type: 'xray', description: 'PROJ-XXX' },
  }, async ({ page, xrayTestKey }) => {
    const td = getTestData(DATA_FILE, 'PROJ-XXX');
    if (!isTestEnabled(DATA_FILE, 'PROJ-XXX')) test.skip();

    const basePage = new BasePage(page);

    // Navigate to your page
    enhancedLogger.step('Step 1: Navigate to the page', xrayTestKey);
    await page.goto('https://your-app.com/record');        // ← CHANGE

    // Get the iframe
    enhancedLogger.step('Step 2: Get the iframe handle', xrayTestKey);
    const frame = basePage.getIframe('#your-iframe');       // ← CHANGE

    // Fill fields inside the iframe
    enhancedLogger.step('Step 3: Fill form fields', xrayTestKey);
    await basePage.fillInIframe(frame, '#field1', td.value1 as string, 'Field 1');  // ← CHANGE
    await basePage.fillInIframe(frame, '#field2', td.value2 as string, 'Field 2');  // ← CHANGE

    // Verify
    enhancedLogger.step('Step 4: Verify', xrayTestKey);
    const actual = await basePage.getIframeFieldValue(frame, '#field1');
    expect(actual).toBe(td.value1);

    enhancedLogger.pass('TC## passed', xrayTestKey);
  });
});
```

> 📖 **See real working examples:** `tests/salesforce-iframe.test.ts` (TC12 + TC13)
> 📖 **All iframe helpers:** `pages/BasePage.ts` → search for "IFRAME HELPERS"
> 📖 **Page Object example:** `pages/SalesforceIframePage.ts`
> 📖 **HTML fixture:** `test-fixtures/iframe-form.html`

---

## Troubleshooting

### ❌ "Missing required environment variable: JIRA_BASE_URL"
**Fix:** Make sure your `.env` file exists and has the correct values.
```bash
cat .env   # Check if file exists and has content
```

### ❌ "Cannot connect to JIRA"
**Fix:** Check your `.env` credentials:
- Is `JIRA_BASE_URL` correct? (e.g., `https://company.atlassian.net`)
- Is your `JIRA_API_TOKEN` valid? (generate a new one if expired)
- Do you have internet access?

### ❌ "Test case PROJ-101 not found in execution"
**Fix:** Make sure the test case key in your test annotation matches the keys
in your XRAY Test Set (`XRAY_TEST_SET_ID` in `.env`).

### ❌ "Browser not installed"
**Fix:** Run: `npx playwright install chromium`

### ❌ TypeScript errors
**Fix:** Run `npm run lint` to see all type errors, then fix them.

### 🐛 Tests are failing but you're not sure why
**Fix:** Run with a visible browser:
```bash
npm run test:headed
```
Or use the interactive debugger:
```bash
npm run test:debug
```

---

## Glossary

| Term | Plain English Explanation |
|------|--------------------------|
| **Playwright** | A tool from Microsoft that controls web browsers like a robot |
| **JIRA** | A project management tool where teams track work (tickets/issues) |
| **XRAY** | A plugin for JIRA that adds test management (test cases, executions) |
| **Test Case** | A single scenario to verify: "Can the user log in with valid credentials?" |
| **Test Set** | A collection/folder of related test cases in XRAY |
| **Test Execution** | A record in JIRA that shows which tests ran and their results |
| **POM (Page Object Model)** | A pattern where each web page gets its own class with its actions |
| **Locator** | How Playwright finds an element on a page (by text, role, ID, etc.) |
| **Assertion** | A check — "I expect THIS to be true, fail the test if it's not" |
| **API** | A way for two programs to talk to each other (we use it to talk to JIRA and to test backends) |
| **UI Test** | A test that opens a real browser and clicks/types/checks like a human |
| **API Test** | A test that sends HTTP requests to a backend and checks the response — no browser needed |
| **Environment Variable** | A named setting stored outside code (keeps secrets safe) |
| **TypeScript** | JavaScript with type-checking — catches bugs before running code |
| **async/await** | Way to write code that waits for slow operations (like API calls) |
| **npm** | Node Package Manager — installs libraries for your project |
| **Sprint** | A fixed work period (usually 2 weeks) in Scrum/Agile methodology |
| **CI/CD** | Continuous Integration/Delivery — automated pipelines that run tests |
| **Fixture** | Reusable setup/teardown logic injected into tests automatically |
| **Iframe** | A "page inside a page" — enterprise apps (Salesforce, ServiceNow) use them to embed forms |
| **FrameLocator** | Playwright's way to find and interact with elements inside an iframe |
| **Headless** | Running the browser without a visible window (faster) |
| **Headed** | Running the browser WITH a visible window (useful for debugging) |
| **a11y** | Short for "accessibility" — checks that the page is usable for everyone |
| **Barrel file** | A single file that re-exports everything — simplifies imports |
| **HTML Report** | A visual web page showing test results, charts, and screenshots after a run |
| **Encryption** | Scrambling text so it's unreadable without a secret key (AES-256) |
| **`${ENC:...}`** | Syntax used in YAML files to store encrypted passwords — auto-decrypted at runtime |
| **`${ENV:...}`** | Syntax used in YAML files to reference environment variables from `.env` |
| **ENCRYPTION_KEY** | The secret passphrase in `.env` used to encrypt/decrypt passwords (min 16 chars) |
| **YAML** | A human-readable file format used to store test data (`.yaml` files in `test-data/`) |
| **Data-Driven Testing** | Running the same test code with different input data from external files (YAML/Excel) |
| **Parameterized Testing** | One test definition × N data sets = N test runs. Use `dataSets:` in YAML + `getTestDataSets()` in code |
| **`dataSets:`** | YAML array under a test case key — each item becomes a separate test run with its own `label` |
| **`getTestDataSets()`** | Function that returns `DataSetEntry[]` — one item per data set, or a single `[{label:'default',...}]` if no `dataSets:` |
| **`.frameworkrc`** | Feature toggle config file — enable/disable capabilities without changing code |
| **`npm run init`** | Project initializer for new consumers — creates `.env`, starter templates, installs browsers |

---

*Last updated: 7 March 2026*
*Framework: Playwright AutoAgent – AI Automation Framework*
*Tests: 4 Login (UI, parameterized) + 3 API (REST) + 5 Navigation (UI) + 2 Iframe (UI) = 14 total*
*XRAY: Test Set = manual setup, Test Execution onward = fully automated*
*Packaging: `npm run init` for new consumers | `.frameworkrc` for feature toggles*
