# Playwright AutoAgent – AI Automation Framework
# =============================================================================

> **Beginner-friendly** AI-powered automation framework that runs browser (UI) and API tests,
> then reports results directly into JIRA XRAY — with a beautiful HTML report.
> No coding experience needed to run it; this guide walks you through every step.

---

## ⚡ Quick Start (Already Set Up? Run Tests in 10 Seconds)

```bash
npm test                       # Run all 13 tests (3 Login + 3 API + 5 Navigation + 2 Iframe) → results go to JIRA + HTML report
open reports/execution-report-*.html   # View the visual report in your browser
```

> First time here? Keep reading from [Prerequisites](#prerequisites) onward.

---

## 📖 Documentation Guide — Where to Go Next

| Document | What You'll Learn | Best For |
|----------|-------------------|----------|
| **[README.md](README.md)** (you're here) | Setup, install, run commands, troubleshooting | **Everyone — start here** |
| **[WRITE_A_TEST.md](WRITE_A_TEST.md)** | Copy-paste guide to write your first test | **Non-technical users** |
| **[CAPABILITIES.md](CAPABILITIES.md)** | Every feature explained in plain English | **New team members exploring the framework** |
| **[WALKTHROUGH.md](WALKTHROUGH.md)** | End-to-end XRAY flow with diagrams | **Anyone learning how JIRA reporting works** |
| **[HOWTO_5_NAVIGATION_TESTS.md](HOWTO_5_NAVIGATION_TESTS.md)** | Step-by-step guide: how the 5 navigation tests were built | **Anyone adding new test suites** |
| **[docs/RUN_REPORT_*.md](docs/)** | Auto-generated run reports | Anyone reviewing past test runs |

> 💡 **Not a developer?** Read this README for setup, then go straight to **[WRITE_A_TEST.md](WRITE_A_TEST.md)** — it explains how to write a test with zero coding knowledge.
> 
> 💡 **Developer?** After setup, read **[CAPABILITIES.md](CAPABILITIES.md)** to see everything the framework can do.

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
12. [Troubleshooting](#troubleshooting)
13. [Glossary (Key Terms)](#glossary)

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
├── tests/                        ← TEST FILES (what to test)
│   ├── login.test.ts             ← UI tests: Login feature (3 test cases: TC01-TC03)
│   ├── api.test.ts               ← API tests: Backend REST API (3 test cases: TC04-TC06)
│   ├── playwright-dev.test.ts    ← Navigation tests: playwright.dev (5 test cases: TC07-TC11)
│   ├── salesforce-iframe.test.ts  ← Iframe tests: Salesforce-style multi-iframe (2 test cases: TC12-TC13)
│   ├── global-setup.ts           ← Runs ONCE before all tests (XRAY setup, DB seed)
│   ├── global-teardown.ts        ← Runs ONCE after all tests (upload results, HTML report)
│   ├── xray-test-fixture.ts      ← Adds XRAY reporting + a11y scan to every test automatically
│   └── xray-state-helper.ts      ← Small bridge file for shared state
│
├── pages/                        ← PAGE OBJECTS (how to interact with pages)
│   ├── BasePage.ts               ← Common actions: click, fill, navigate, cookies...
│   ├── LoginPage.ts              ← Login-specific actions and locators
│   ├── PlaywrightDevPage.ts      ← playwright.dev navigation actions and locators
│   └── SalesforceIframePage.ts   ← Salesforce-style iframe actions (fill forms inside iframes)
│
├── utils/                        ← UTILITIES (helper code — one folder per tool)
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
├── playwright.config.ts          ← Playwright settings (browsers, timeouts, etc.)
├── .env                          ← YOUR credentials (DO NOT COMMIT TO GIT!)
├── .env.example                  ← Template showing what .env should look like
├── .gitignore                    ← Files excluded from Git
├── tsconfig.json                 ← TypeScript compiler settings
├── package.json                  ← Project dependencies and npm scripts
│
├── WRITE_A_TEST.md               ← ✍️  How to write a test (zero coding knowledge needed)
├── CAPABILITIES.md               ← 🧰 What can this framework do?
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
# Run ALL tests (UI + API, with JIRA XRAY integration)
npm test

# Run ONLY the UI login tests
npm run test:login

# Run ONLY the API tests
npm run test:api

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
  🔹 Encryption: ⚠️  Not set (passwords stored as plain text)

✅ [JIRA Auth] Connected successfully as: John Doe (john@company.com)
✅ Loaded 6 test case(s) from "Sprint 5 Test Set"
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
TESTS RUN (login.test.ts, api.test.ts)
    ├─ Each test has: annotation: { type: 'xray', description: 'PROJ-101' }
    ├─ UI tests use LoginPage (POM) to interact with the browser
    ├─ API tests call REST endpoints via api-helper.ts
    ├─ After each test: result (PASS/FAIL + screenshot) saved to xray-state.json
    │
    ▼
global-teardown.ts
    ├─ Reads xray-state.json
    ├─ For each test result: calls XRAY API to update status (xray-result-updater.ts)
    ├─ Attaches failure screenshots to JIRA test runs
    ├─ Generates the HTML execution report (report-generator.ts)
    └─ Logs final summary (Passed: 5, Failed: 1)
    │
    ▼
JIRA XRAY shows:
    PROJ-789 (Test Execution)
        ├─ PROJ-101: ✅ PASS  (UI)
        ├─ PROJ-102: ❌ FAIL  (UI, screenshot attached)
        ├─ PROJ-103: ✅ PASS  (UI)
        ├─ PROJ-104: ✅ PASS  (API)
        ├─ PROJ-105: ✅ PASS  (API)
        └─ PROJ-106: ✅ PASS  (API)

HTML REPORT (reports/execution-report-2026-03-03.html):
    ├─ Summary: 6 tests | 5 passed | 1 failed | 3 UI | 3 API
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
import { test, expect } from './xray-test-fixture';

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
import { test, expect } from './xray-test-fixture';
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
  password: "SuperSecretPassword!"
  expectedUrlFragment: "/secure"
```

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
| **Headless** | Running the browser without a visible window (faster) |
| **Headed** | Running the browser WITH a visible window (useful for debugging) |
| **a11y** | Short for "accessibility" — checks that the page is usable for everyone |
| **Barrel file** | A single file that re-exports everything — simplifies imports |
| **HTML Report** | A visual web page showing test results, charts, and screenshots after a run |

---

*Last updated: 4 March 2026*
*Framework: Playwright AutoAgent – AI Automation Framework*
*Tests: 3 Login (UI) + 3 API (REST) + 5 Navigation (UI) = 11 total*
*XRAY: Test Set = manual setup, Test Execution onward = fully automated*
