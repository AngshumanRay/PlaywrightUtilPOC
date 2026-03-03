# =============================================================================
# Playwright + JIRA XRAY Automated Testing Framework
# =============================================================================

> **Beginner-friendly** automated test framework using Playwright (browser automation)
> integrated with JIRA XRAY (test management). Even with zero coding experience,
> this guide will walk you through everything step by step.

---

## 📖 Documentation Guide

| Document | What's Inside | Who Should Read |
|----------|---------------|-----------------|
| **[README.md](README.md)** (this file) | Setup, installation, run commands | Everyone (start here) |
| **[CAPABILITIES.md](CAPABILITIES.md)** | All framework features explained in plain English | New team members / beginners |
| **[WALKTHROUGH.md](WALKTHROUGH.md)** | Step-by-step XRAY flow with diagrams | Anyone learning the XRAY integration |
| **[docs/RUN_REPORT_*.md](docs/)** | Auto-generated run reports | Anyone reviewing past test runs |

> 💡 **New here?** Read this README first for setup, then open `CAPABILITIES.md` to see
> everything this framework can do.

---

## 📚 Table of Contents

1. [What Is This Project?](#what-is-this-project)
2. [Project Structure Explained](#project-structure-explained)
3. [Prerequisites](#prerequisites)
4. [First-Time Setup](#first-time-setup)
5. [Configure Your Environment](#configure-your-environment)
6. [How to Run Tests](#how-to-run-tests)
7. [Understanding the Test Results](#understanding-the-test-results)
8. [How the XRAY Integration Works](#how-the-xray-integration-works)
9. [Adding New Tests](#adding-new-tests)
10. [Adding New Page Objects](#adding-new-page-objects)
11. [Troubleshooting](#troubleshooting)
12. [Glossary (Key Terms)](#glossary)

---

## What Is This Project?

This project does THREE things automatically:

```
BEFORE TESTS:
  1. Connects to JIRA (your project management tool)
  2. Fetches test cases from an XRAY Test Set (your list of tests to run)
  3. Creates a Test Execution in JIRA (a "results container" for this run)

DURING TESTS:
  4. Opens a web browser (Chrome)
  5. Performs actions on your web app (clicking, typing, navigating)
  6. Checks if things work correctly (assertions)
  7. Takes screenshots if anything fails

AFTER TESTS:
  8. Uploads PASS/FAIL results to JIRA XRAY (so your team can see results)
  9. Attaches failure screenshots to failed test cases in JIRA
  10. Generates an HTML report you can view in a browser
```

---

## Project Structure Explained

```
project-root/
│
├── tests/                        ← TEST FILES (what to test)
│   ├── login.test.ts             ← Login feature tests (example)
│   ├── global-setup.ts           ← Runs ONCE before all tests (utility setup)
│   ├── global-teardown.ts        ← Runs ONCE after all tests (upload + notify)
│   ├── xray-test-fixture.ts      ← Adds XRAY reporting to every test automatically
│   └── xray-state-helper.ts      ← Small bridge file for shared state
│
├── pages/                        ← PAGE OBJECTS (how to interact with pages)
│   ├── BasePage.ts               ← Common actions: click, fill, navigate, cookies...
│   └── LoginPage.ts              ← Login-specific actions and locators
│
├── utils/                        ← UTILITIES (helper code — one folder per tool)
│   ├── jira-xray/                ← JIRA XRAY integration
│   │   ├── jira-auth.ts          ←   JIRA API authentication
│   │   ├── xray-test-set.ts      ←   Fetch test cases from XRAY Test Set
│   │   ├── xray-test-execution.ts←   Create Test Execution in JIRA
│   │   ├── xray-result-updater.ts←   Update PASS/FAIL results in JIRA
│   │   └── xray-state.ts         ←   Shared state file during test run
│   ├── database/                 ← Database / test data management
│   │   └── test-data-manager.ts  ←   Seed, query, and cleanup test data
│   ├── email/                    ← Email verification
│   │   └── email-verifier.ts     ←   Wait for emails, extract OTPs & links
│   ├── api/                      ← REST API testing helper
│   │   └── api-helper.ts         ←   GET, POST, PUT, DELETE convenience functions
│   ├── helpers/                  ← Shared helpers (used by all utilities)
│   │   ├── logger.ts             ←   Formatted, color-coded log messages
│   │   └── screenshot.ts         ←   Capture browser screenshots
│   └── index.ts                  ← Barrel file (import anything from '../utils')
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
├── CAPABILITIES.md               ← 🧰 What can this framework do? (start here!)
├── WALKTHROUGH.md                ← 📖 How the XRAY flow works end-to-end
├── README.md                     ← 📚 Setup guide (this file)
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
# Your JIRA instance URL
JIRA_BASE_URL=https://your-company.atlassian.net

# Your JIRA email address
JIRA_USERNAME=your-email@company.com

# Your JIRA API Token
# Get it from: https://id.atlassian.com/manage-profile/security/api-tokens
JIRA_API_TOKEN=your-api-token-here

# Your JIRA project key (visible in ticket numbers like "PROJ-123" → key is "PROJ")
XRAY_PROJECT_KEY=PROJ

# The XRAY Test Set ticket ID (the collection of tests to run)
XRAY_TEST_SET_ID=PROJ-456

# Current Sprint number
XRAY_SPRINT_NUMBER=5

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
# Run ALL tests (with JIRA XRAY integration)
npm test

# Run ONLY the login tests
npm run test:login

# Run tests with a VISIBLE browser window (good for debugging)
npm run test:headed

# Run tests in DEBUG mode (step through tests interactively)
npm run test:debug

# Run tests with Playwright's visual UI mode
npm run test:ui

# View the HTML test report after running tests
npm run test:report

# Check TypeScript for errors without running tests
npm run lint
```

---

## Understanding the Test Results

After running tests, you'll see output like this in the terminal:

```
──────────────────────────────────────────────────────────
  🚀 GLOBAL SETUP — Starting XRAY Integration
──────────────────────────────────────────────────────────

✅ [JIRA Auth] Connected successfully as: John Doe (john@company.com)
✅ Loaded 3 test case(s) from "Login Feature Tests"
✅ Test Execution created: PROJ-789
✅ State saved.

▶ STEP   Step 1: Navigate to the login page
ℹ INFO   Page loaded: Login | MyApp
▶ STEP   Step 2: Enter valid credentials and submit
✅ PASS  TC01: Valid credentials should log the user in successfully

❌ FAIL  TC02: Wrong password should show an error message
         Error: Expected error message to contain "Invalid" but found "Error"

──────────────────────────────────────────────────────────
  📊 FINAL XRAY EXECUTION STATUS
  Execution: PROJ-789
  ✅ Passed: 2  |  ❌ Failed: 1  |  ⏳ Pending: 0
  View in JIRA: https://your-company.atlassian.net/browse/PROJ-789
──────────────────────────────────────────────────────────
```

**View the HTML Report:**
```bash
npm run test:report
```
Opens `playwright-report/index.html` — a visual report with:
- Pass/Fail status for each test
- Screenshots of failures
- Step-by-step trace viewer
- Timeline of test execution

---

## How the XRAY Integration Works

Here's the end-to-end flow explained simply:

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
TESTS RUN (login.test.ts, etc.)
    ├─ Each test has: annotation: { type: 'xray', description: 'PROJ-101' }
    ├─ Tests use LoginPage (POM) to interact with the browser
    ├─ After each test: result (PASS/FAIL + screenshot) saved to xray-state.json
    │
    ▼
global-teardown.ts
    ├─ Reads xray-state.json
    ├─ For each test result: calls XRAY API to update status (xray-result-updater.ts)
    ├─ Attaches failure screenshots to JIRA test runs
    └─ Logs final summary (Passed: 2, Failed: 1)
    │
    ▼
JIRA XRAY shows:
    PROJ-789 (Test Execution)
        ├─ PROJ-101: ✅ PASS
        ├─ PROJ-102: ❌ FAIL (screenshot attached)
        └─ PROJ-103: ✅ PASS
```

---

## Adding New Tests

### Step 1: Create or open a test file
Create `tests/your-feature.test.ts` (or add to an existing test file).

### Step 2: Use this template:
```typescript
// Import our custom test function (includes XRAY integration)
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

### Step 3: Run your new test:
```bash
npx playwright test tests/your-feature.test.ts
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
| **API** | A way for two programs to talk to each other (we use it to talk to JIRA) |
| **Environment Variable** | A named setting stored outside code (keeps secrets safe) |
| **TypeScript** | JavaScript with type-checking — catches bugs before running code |
| **async/await** | Way to write code that waits for slow operations (like API calls) |
| **npm** | Node Package Manager — installs libraries for your project |
| **Sprint** | A fixed work period (usually 2 weeks) in Scrum/Agile methodology |
| **CI/CD** | Continuous Integration/Delivery — automated pipelines that run tests |
| **Fixture** | Reusable setup/teardown logic injected into tests automatically |
| **Headless** | Running the browser without a visible window (faster) |
