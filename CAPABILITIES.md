# 🧰 CAPABILITIES — What Can This Framework Do?

### A Plain-English Guide for Beginners (Zero Coding Knowledge Required)

---

> **Who is this for?**
> You just joined the team. Someone told you "we use this Playwright framework."
> You opened the project and thought: *"What does this thing actually do? What's available to me?"*
>
> This document answers that question. Every capability is explained in plain English.
>
> 📖 **Coming from README.md?** Good — this document goes deeper into *what* each feature does.
>
> 💡 **Want to write a test right now?** Skip to **[WRITE_A_TEST.md](WRITE_A_TEST.md)** — it's a copy-paste guide.
>
> 🔀 **Want to see how XRAY works end-to-end?** Read **[WALKTHROUGH.md](WALKTHROUGH.md)** — it's a step-by-step flow with diagrams.

---

### How to Read This Document

Each capability follows the same format:
1. **What is it?** — Plain-English explanation (no jargon)
2. **What can it do?** — Table of features
3. **How to use/enable it?** — Config and code examples
4. **Where is the code?** — Exact file paths

> **💡 Tip:** Use the Table of Contents to jump directly to any section.

---

## 📚 Table of Contents

1. [The One-Sentence Summary](#the-one-sentence-summary)
2. [All Capabilities at a Glance](#all-capabilities-at-a-glance)
3. [🌐 Browser Testing (Playwright)](#-browser-testing-playwright)
4. [📋 JIRA XRAY Integration](#-jira-xray-integration)
5. [🗃️ Database / Test Data](#️-database--test-data)
6. [📧 Email Verification](#-email-verification)
7. [🌐 API Testing Helper](#-api-testing-helper)
8. [📊 HTML Execution Report](#-html-execution-report)
9. [📸 Screenshot Capture](#-screenshot-capture)
10. [📝 Logger](#-logger)
11. [🍪 Cookie & Popup Handling](#-cookie--popup-handling)
12. [🔒 Security / Encryption](#-security--encryption)
13. [📑 Excel / Data-Driven Testing](#-excel--data-driven-testing)
14. [How to Add Your OWN New Utility](#how-to-add-your-own-new-utility)
15. [Which File Does What (Cheat Sheet)](#which-file-does-what-cheat-sheet)
16. [How to Enable/Disable Any Utility](#how-to-enabledisable-any-utility)

---

## The One-Sentence Summary

This framework opens a web browser (or calls REST APIs directly), tests your application automatically,
and then tells JIRA XRAY what happened — while generating a beautiful HTML report with charts, screenshots, and accessibility results.

---

## All Capabilities at a Glance

Here's everything this framework can do, at a glance:

```
┌──────────────────────────────────────────────────────────────────────────┐
│                     🧰 FRAMEWORK CAPABILITIES                            │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  🟢 ACTIVE (works out of the box):                                       │
│     ✅ Browser Testing (UI)  — open Chrome, click, type, verify things   │
│     ✅ API Testing           — call REST endpoints, check responses      │
│     ✅ Page Objects          — organized code for each page of your app  │
│     ✅ HTML Execution Report — charts, screenshots, a11y, step logs      │
│     ✅ Screenshots           — automatic photos of the browser on failure │
│     ✅ Logger                — color-coded terminal + log files w/ PASS/FAIL│
│     ✅ YAML Data-Driven     — tests read inputs from external YAML files │
│     ✅ Cookie/Popup handling — auto-dismisses banners and JS popups      │
│     ✅ Accessibility (a11y)  — WCAG scan run automatically after each UI test│
│                                                                          │
│  🟡 READY (just add credentials in .env to activate):                    │
│     📋 JIRA XRAY      — fetch test cases, create executions, push results│
│     🗃️  Database        — seed test data before, clean up after          │
│     📧 Email           — check test mailbox for OTPs, reset links, etc. │
│     🔒 Encryption      — AES-256 password protection for stored secrets  │
│     📑 Excel           — data-driven testing from .xlsx spreadsheets     │
│                                                                          │
│  ⚪ NOT configured utilities are SKIPPED automatically.                  │
│     Nothing crashes. You see a clear message in the terminal.            │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 🌐 Browser Testing (Playwright)

### What is it?
Playwright is the engine that drives this whole framework. It opens a real
web browser (Chrome) and controls it like a robot — clicking buttons, typing
text, navigating pages, and checking if things look right.

### What can it do?

| Action | Plain English | Example |
|--------|--------------|---------|
| Open a page | "Go to this web address" | `await page.goto('https://my-app.com/login')` |
| Click a button | "Click the Login button" | `await page.getByRole('button', { name: 'Login' }).click()` |
| Type text | "Type 'john@email.com' into the email box" | `await page.getByLabel('Email').fill('john@email.com')` |
| Check text exists | "Make sure the page says 'Welcome'" | `await expect(page.getByText('Welcome')).toBeVisible()` |
| Take a screenshot | "Take a photo of what the browser shows" | `await page.screenshot({ path: 'photo.png' })` |
| Wait for something | "Wait until the loading spinner disappears" | `await page.getByText('Loading').waitFor({ state: 'hidden' })` |

### Do I need to configure anything?
Just set `BASE_URL` in your `.env` file to your website's address. That's it.

```env
BASE_URL=https://your-app.com
```

### ⏱️ Global Waits & Timeouts

Every team has different application speeds. Instead of digging into config files, just set timeouts in `.env`:

| Setting | What It Controls | Default |
|---------|------------------|---------|
| `TEST_TIMEOUT` | Max time a single test can run | 60000 (60s) |
| `EXPECT_TIMEOUT` | Max time for `expect()` auto-wait | 10000 (10s) |
| `ACTION_TIMEOUT` | Max time for click/fill/type actions | 10000 (10s) |
| `NAVIGATION_TIMEOUT` | Max time for page.goto() navigation | 30000 (30s) |
| `VIEWPORT_WIDTH` | Browser window width in pixels | 1280 |
| `VIEWPORT_HEIGHT` | Browser window height in pixels | 720 |

> **No code changes needed!** Just edit `.env` and re-run tests.

### Where is the code?
- `pages/BasePage.ts` — reusable actions (click, fill, navigate, wait)
- `pages/LoginPage.ts` — login-specific actions (an example page)
- `tests/login.test.ts` — actual tests that use the page objects

---

## 📋 JIRA XRAY Integration

### What is it?
JIRA is where your team tracks work. XRAY is a plugin that adds test management.
This integration connects your automated Playwright tests to JIRA XRAY so that
test results appear directly inside your JIRA project — no manual work needed after initial setup.

---

### 🔑 The Most Important Rule to Understand

```
┌──────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│   YOU DO MANUALLY (one-time, in JIRA web UI):                            │
│   ──────────────────────────────────────────                             │
│     1. Create Test Cases in XRAY     (PROJ-101, PROJ-102, PROJ-103...)  │
│     2. Create a Test Set in XRAY     (PROJ-456) to group them           │
│     3. Add your Test Cases to the Test Set                               │
│     4. Put XRAY_TEST_SET_ID=PROJ-456 in your .env file                  │
│                                                                          │
│   PLAYWRIGHT DOES AUTOMATICALLY (every time you run npm test):           │
│   ────────────────────────────────────────────────────────────           │
│     5. Reads Test Cases from the Test Set (via XRAY API)                │
│     6. Creates a new Test Execution ticket (PROJ-789) in JIRA           │
│     7. Links all Test Cases to the Execution                             │
│     8. Runs the tests in the browser (or via API)                        │
│     9. Saves PASS/FAIL for each test case                                │
│    10. Uploads results to XRAY (PROJ-101 → PASS, PROJ-102 → FAIL)      │
│    11. Attaches failure screenshots as evidence in JIRA                  │
│    12. Generates the HTML execution report locally                       │
│                                                                          │
│   YOU NEVER NEED TO:                                                     │
│   ──────────────────                                                     │
│     ❌ Create Test Executions manually                                   │
│     ❌ Mark tests as PASS/FAIL manually                                  │
│     ❌ Upload screenshots manually                                       │
│     ❌ Change any code when a new sprint starts (just update .env)       │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

### 📐 Step-by-Step: Setting Up XRAY from Scratch (Complete Guide)

Follow these steps in order. Steps 1–4 are done **once** in JIRA. After that, everything is automated.

---

#### 🟢 Step 1: Create Test Cases in JIRA XRAY (Manual — One Time)

Open your JIRA project and create XRAY Test Case tickets for each scenario you want to test.

**How to create a Test Case:**
1. In JIRA, click **Create** (top menu bar)
2. Set **Issue Type** to **Test** (XRAY adds this type)
3. Fill in:
   - **Summary**: A clear one-sentence description (e.g., "Verify user can log in with valid credentials")
   - **Steps**: The manual steps a human would follow (XRAY shows a table for steps)
   - **Labels** (optional): Add labels like `smoke`, `regression`, `sprint5` for filtering
4. Click **Create**
5. Note down the issue key (e.g., `PROJ-101`)

**Repeat for each test scenario:**
```
PROJ-101  →  "Verify user can log in with valid credentials"
PROJ-102  →  "Verify wrong password shows an error message"
PROJ-103  →  "Verify empty fields shows validation errors"
PROJ-104  →  "Verify GET /posts/1 returns status 200 and valid post data"
PROJ-105  →  "Verify POST /posts creates a new resource with status 201"
PROJ-106  →  "Verify GET /users/1 returns user data with address"
```

> 💡 **Best Practice:** Name your test cases with a clear action + expected result.
> Use prefixes like `TC01:`, `TC02:` in the Playwright test name (not in JIRA).
> Keep the JIRA summary clean — the framework uses the Playwright test name in the report.

---

#### 🟢 Step 2: Create a Test Set in JIRA XRAY (Manual — One Time)

A Test Set is simply a **folder** that groups related Test Cases together.

**How to create a Test Set:**
1. In JIRA, click **Create**
2. Set **Issue Type** to **Test Set** (XRAY adds this type)
3. Fill in:
   - **Summary**: A descriptive name (e.g., "Sprint 5 — Login & API Tests")
4. Click **Create**
5. Note down the issue key (e.g., `PROJ-456`)

---

#### 🟢 Step 3: Add Test Cases to the Test Set (Manual — One Time)

1. Open your new Test Set ticket (e.g., `PROJ-456`) in JIRA
2. Scroll to the **Tests** section (added by XRAY)
3. Click **Add** → search for each test case key → add them:
   - PROJ-101, PROJ-102, PROJ-103, PROJ-104, PROJ-105, PROJ-106
4. Now your Test Set contains all 6 test cases

```
Test Set: PROJ-456 ("Sprint 5 — Login & API Tests")
├── PROJ-101  "Verify user can log in with valid credentials"
├── PROJ-102  "Verify wrong password shows an error message"
├── PROJ-103  "Verify empty fields shows validation errors"
├── PROJ-104  "Verify GET /posts/1 returns status 200"
├── PROJ-105  "Verify POST /posts creates a new resource"
└── PROJ-106  "Verify GET /users/1 returns user data"
```

> 💡 **Best Practice:** Create one Test Set per sprint or per feature.
> When a new sprint starts, create a new Test Set or update the existing one.
> The old Test Sets (and their Executions) stay in JIRA as history.

---

#### 🟢 Step 4: Configure Your `.env` File (Manual — One Time per Sprint)

Open your `.env` file and set the XRAY values:

```env
# ──── JIRA CONNECTION (get these from your JIRA admin) ────
JIRA_BASE_URL=https://your-company.atlassian.net
JIRA_USERNAME=your-email@company.com
JIRA_API_TOKEN=your-api-token-here

# ──── XRAY SETTINGS ────
XRAY_PROJECT_KEY=PROJ              # The short code in your ticket numbers
XRAY_TEST_SET_ID=PROJ-456         # The Test Set you just created (Step 2)
XRAY_SPRINT_NUMBER=5               # Current sprint number (update each sprint)
```

**How to get a JIRA API Token:**
1. Go to https://id.atlassian.com/manage-profile/security/api-tokens
2. Click **Create API token** → give it a name (e.g., "Playwright Automation")
3. Copy the token → paste it as `JIRA_API_TOKEN` in `.env`

> 💡 **Best Practice per Sprint:**
> At the start of each sprint, update TWO things in `.env`:
> 1. `XRAY_SPRINT_NUMBER` → increment by 1
> 2. `XRAY_TEST_SET_ID` → update if you created a new Test Set for this sprint

---

#### 🟢 Step 5: Link Each Playwright Test to Its XRAY Test Case (One Time per Test)

In your Playwright test file, each test has an **annotation** that says which
XRAY test case it represents. This is the bridge between your code and JIRA.

```typescript
test(
  'TC01: Valid credentials should log the user in successfully',
  {
    annotation: { type: 'xray', description: 'PROJ-101' },
    //                                        ^^^^^^^^
    //                                        This MUST match the JIRA key
    //                                        of the Test Case you created
    //                                        in Step 1
  },
  async ({ page, xrayTestKey }) => {
    // xrayTestKey is automatically "PROJ-101" — extracted from the annotation
    // Your test code here...
  }
);
```

**The mapping looks like this:**
```
Playwright Test File                        XRAY Test Case in JIRA
──────────────────────────                  ─────────────────────────
annotation: 'PROJ-101'   ←──── matches ──→  PROJ-101 in Test Set PROJ-456
annotation: 'PROJ-102'   ←──── matches ──→  PROJ-102 in Test Set PROJ-456
annotation: 'PROJ-103'   ←──── matches ──→  PROJ-103 in Test Set PROJ-456
annotation: 'PROJ-104'   ←──── matches ──→  PROJ-104 in Test Set PROJ-456
```

> ⚠️ **The annotation description MUST exactly match the JIRA test case key.**
> `'PROJ-101'` in your code must be the same as the issue key in JIRA.
> If they don't match, the result won't upload for that test.

---

#### 🟢 Step 6: Run Tests — Everything Else is Automatic (Every Run)

```bash
npm test
```

**Here's exactly what happens under the hood:**

```
┌──────────────────────────────────────────────────────────────────────────┐
│ PHASE 1: GLOBAL SETUP (runs ONCE before all tests)                       │
│                                                                          │
│  1. Framework reads .env → gets JIRA URL, credentials, Test Set ID      │
│  2. Calls JIRA API /rest/api/3/myself → verifies credentials work       │
│  3. Calls XRAY API /rest/raven/1.0/api/testset/PROJ-456/test            │
│     → gets list: [PROJ-101, PROJ-102, PROJ-103, ...]                    │
│  4. Calls XRAY API POST /rest/raven/1.0/api/testexecution               │
│     → JIRA creates new ticket: PROJ-789                                  │
│     → Title: "Sprint 5 — Automated Playwright Test Run [2026-03-03]"    │
│  5. Links all 6 test cases to PROJ-789                                   │
│     → All show status "TODO" in JIRA                                     │
│  6. Saves executionKey="PROJ-789" to xray-state.json                     │
│                                                                          │
├──────────────────────────────────────────────────────────────────────────┤
│ PHASE 2: TESTS RUN (each test independently)                             │
│                                                                          │
│  For EACH test:                                                          │
│  7. Fixture reads annotation → xrayTestKey = "PROJ-101"                 │
│  8. Test runs (browser clicks / API calls / assertions)                  │
│  9. After test finishes:                                                 │
│     a) Captures screenshot if FAIL                                       │
│     b) Runs accessibility scan (axe-core) if UI test                     │
│     c) Maps Playwright status → XRAY status:                             │
│        "passed"     → "PASS"                                             │
│        "failed"     → "FAIL"                                             │
│        "timedOut"   → "FAIL"                                             │
│        "interrupted"→ "ABORTED"                                          │
│     d) Appends { testCaseKey, status, screenshot, error } to             │
│        xray-state.json                                                   │
│                                                                          │
├──────────────────────────────────────────────────────────────────────────┤
│ PHASE 3: GLOBAL TEARDOWN (runs ONCE after all tests)                     │
│                                                                          │
│  10. Reads xray-state.json → gets executionKey + all results             │
│  11. For EACH result:                                                    │
│      a) Calls XRAY API GET /testexecution/PROJ-789/test → finds the     │
│         internal testRunId for this test case                             │
│      b) Calls XRAY API PUT /testrun/{id} → updates status to PASS/FAIL  │
│      c) If FAIL: calls XRAY API POST /testrun/{id}/attachment            │
│         → uploads screenshot as Base64 evidence                          │
│  12. Fetches final execution status from XRAY (confirmation)             │
│  13. Generates HTML report → reports/execution-report-YYYY-MM-DD.html   │
│  14. Cleans up xray-state.json for next run                              │
│  15. Cleans up database test data (if DB configured)                     │
│                                                                          │
├──────────────────────────────────────────────────────────────────────────┤
│ RESULT IN JIRA:                                                          │
│                                                                          │
│  PROJ-789 (Test Execution)                                               │
│  ├── PROJ-101: ✅ PASS  (3.2s)                                          │
│  ├── PROJ-102: ❌ FAIL  (4.1s) — screenshot attached as evidence        │
│  ├── PROJ-103: ✅ PASS  (2.8s)                                          │
│  ├── PROJ-104: ✅ PASS  (0.8s)                                          │
│  ├── PROJ-105: ✅ PASS  (1.1s)                                          │
│  └── PROJ-106: ✅ PASS  (0.6s)                                          │
│                                                                          │
│  Click PROJ-102 → see screenshot + error message + execution time        │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

### 🏗️ XRAY Architecture — Which File Does What

```
.env                              ← Your JIRA credentials + Test Set ID
    │
    ▼
config/environment.ts             ← Reads .env → exports config.jira.*, config.xray.*
    │
    ▼
tests/global-setup.ts             ← PHASE 1: Orchestrates the full setup flow
    │
    ├──→ utils/jira-xray/jira-auth.ts
    │      └─ createJiraApiClient()    → pre-configured HTTP client for JIRA API
    │      └─ testJiraConnection()     → calls /rest/api/3/myself to verify auth
    │
    ├──→ utils/jira-xray/xray-test-set.ts
    │      └─ fetchTestCasesFromTestSet()  → calls XRAY API to get test case list
    │
    ├──→ utils/jira-xray/xray-test-execution.ts
    │      └─ createTestExecution()    → creates JIRA ticket of type "Test Execution"
    │      └─ links all test cases     → sets them to "TODO" status
    │
    └──→ utils/jira-xray/xray-state.ts
           └─ initializeXrayState()    → saves executionKey to xray-state.json
    │
    ▼
tests/xray-test-fixture.ts       ← PHASE 2: Wraps every test with XRAY tracking
    │
    ├──→ Reads annotation → extracts xrayTestKey ("PROJ-101")
    ├──→ After test: maps Playwright status → XRAY status
    ├──→ Captures failure screenshot
    └──→ appendTestResult() → writes to xray-state.json
    │
    ▼
tests/global-teardown.ts          ← PHASE 3: Uploads all results to XRAY
    │
    ├──→ readXrayState()           → reads xray-state.json
    ├──→ utils/jira-xray/xray-result-updater.ts
    │      └─ updateMultipleTestResults()  → loops through each result
    │      └─ updateTestCaseResult()       → PUTs status + evidence to XRAY API
    │      └─ attachEvidenceToTestRun()    → uploads screenshot as Base64
    │
    ├──→ getTestExecutionStatus()  → confirmation check from XRAY
    ├──→ generateReport()          → HTML report with charts + step logs
    └──→ clearXrayState()          → cleanup for next run
```

---

### 🏆 Best Practices for XRAY Integration

| # | Best Practice | Why |
|---|--------------|-----|
| 1 | **Create Test Cases in JIRA first, then write the Playwright test** | The JIRA test case key (PROJ-101) is the link. If you write code first, you'll need to go back and add the annotation later. |
| 2 | **One Playwright test = One XRAY Test Case** | If two tests report to the same XRAY key, the second result overwrites the first. |
| 3 | **Keep XRAY test case summaries short and descriptive** | They show in JIRA dashboards. "Verify login with valid credentials" is better than "test1". |
| 4 | **Use clear Playwright test names with TC## prefix** | `TC01: Valid credentials should log the user in` — the TC## prefix makes it easy to match to JIRA. |
| 5 | **Update `XRAY_SPRINT_NUMBER` every sprint** | This names the Test Execution "Sprint 6 — Automated Run". Without it, executions are harder to find. |
| 6 | **Create a new Test Set per sprint (or reuse one)** | New sprints may add or remove test cases. Update `XRAY_TEST_SET_ID` accordingly. |
| 7 | **Never delete old Test Executions** | They are your test run history. JIRA keeps them forever so you can compare sprint-over-sprint. |
| 8 | **Add labels to Test Cases for filtering** | Labels like `smoke`, `regression`, `login` help filter which tests to include in a Test Set. |
| 9 | **Let the framework create Test Executions** | Never create them manually. The framework names them with the date and sprint, links test cases, and handles everything. |
| 10 | **If JIRA is down, tests still run** | The framework detects JIRA unavailability and skips the integration. Your tests and HTML report still work. |

---

### 🔁 What to Do Each Sprint (Checklist)

```
□ Step 1: (If needed) Create new Test Cases in JIRA for new features
□ Step 2: (If needed) Create a new Test Set or add new cases to the existing one
□ Step 3: (If new tests) Write the Playwright test with the annotation:
            annotation: { type: 'xray', description: 'PROJ-NEW' }
□ Step 4: Update .env:
            XRAY_SPRINT_NUMBER=6       ← new sprint number
            XRAY_TEST_SET_ID=PROJ-XXX  ← if you created a new Test Set
□ Step 5: Run: npm test
□ Step 6: Open JIRA → find the new Test Execution → review results
□ Step 7: (done — the framework did everything else automatically)
```

---

### 📊 XRAY API Endpoints Used by This Framework

For reference, here are the exact XRAY REST API endpoints our framework calls:

| Step | HTTP Method | Endpoint | Purpose |
|------|-------------|----------|---------|
| Auth check | `GET` | `/rest/api/3/myself` | Verify JIRA credentials work |
| Get Test Set | `GET` | `/rest/api/3/issue/{testSetKey}` | Fetch Test Set summary |
| List tests in set | `GET` | `/rest/raven/1.0/api/testset/{testSetKey}/test` | Get all test case keys in the set |
| Get test details | `GET` | `/rest/api/3/issue/{testCaseKey}` | Fetch test case summary, labels, status |
| Get test steps | `GET` | `/rest/raven/1.0/api/test/{testCaseKey}/step` | Fetch test steps for a test case |
| Create execution | `POST` | `/rest/raven/1.0/api/testexecution` | Create a new Test Execution JIRA ticket |
| Link tests to exec | `POST` | `/rest/raven/1.0/api/testexecution/{execKey}/test` | Link test cases to the execution |
| Get test runs | `GET` | `/rest/raven/1.0/api/testexecution/{execKey}/test` | Get test run IDs within the execution |
| Update result | `PUT` | `/rest/raven/1.0/api/testrun/{testRunId}` | Set PASS/FAIL status + comment |
| Attach evidence | `POST` | `/rest/raven/1.0/api/testrun/{testRunId}/attachment` | Upload screenshot as Base64 |

> These are **XRAY Server/Data Center** endpoints. If you use **XRAY Cloud**, the endpoints
> are different (GraphQL-based). See [XRAY Cloud docs](https://docs.getxray.app/display/XRAYCLOUD/).

---

### ❓ What if I DON'T Configure JIRA?

Nothing breaks. You see this friendly message and tests run normally:

```
⚠️  JIRA credentials are still set to placeholder values in .env.
   Skipping JIRA/XRAY integration — Playwright tests will still run.
```

The HTML report is **still generated** with full results, charts, and screenshots.
The only thing missing is the JIRA upload — results stay local only.

### Where is the code?
- `utils/jira-xray/jira-auth.ts` — JIRA API authentication (Basic Auth over HTTP)
- `utils/jira-xray/xray-test-set.ts` — fetches Test Cases from a Test Set via XRAY API
- `utils/jira-xray/xray-test-execution.ts` — creates Test Execution ticket, links Test Cases
- `utils/jira-xray/xray-result-updater.ts` — uploads PASS/FAIL status + screenshot evidence
- `utils/jira-xray/xray-state.ts` — shared JSON file that stores execution key + results between phases
- `tests/xray-test-fixture.ts` — the Playwright fixture that automatically reports results
- `tests/global-setup.ts` — orchestrates Phase 1 (auth → fetch → create execution)
- `tests/global-teardown.ts` — orchestrates Phase 3 (upload results → generate report)

---

## 🗃️ Database / Test Data

### What is it? (Explained Like You're 5)

Imagine you're testing a "My Orders" page. The page shows a list of past orders.
But if there are **no orders** in the database, the page shows "No orders found" — and your
test can't check anything useful.

That's where this utility comes in. It lets you:
- **SEED** = put fake test data INTO the database before your test starts
- **QUERY** = check what's IN the database during your test
- **CLEANUP** = remove all the fake data AFTER your test finishes (leave no mess behind)

Think of it like setting up a stage before a play, and tearing it down after the show.

```
┌──────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│  BEFORE TESTS:                                                           │
│    SEED → Insert fake user "testuser_auto" + fake order #9999            │
│                                                                          │
│  DURING TESTS:                                                           │
│    QUERY → "Is order #9999 in the database?" → Yes ✅                   │
│    UI TEST → Open "My Orders" page → see order #9999 → ✅               │
│                                                                          │
│  AFTER TESTS:                                                            │
│    CLEANUP → Delete "testuser_auto" and order #9999                      │
│    → Database is back to normal, as if the test never ran                │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### What databases does it support?
It's designed to work with ANY database. You just plug in your connection code:
- PostgreSQL ✅
- MySQL ✅
- MongoDB ✅
- SQLite ✅
- Any other database with a Node.js driver ✅

### How to enable it?

Add these lines to your `.env` file (get the values from your database admin):

```env
DB_ENABLED=true
DB_HOST=your-database-server.com
DB_PORT=5432
DB_NAME=your_test_database
DB_USER=your_db_username
DB_PASSWORD=your_db_password
```

> 💡 **Security tip:** Want to encrypt `DB_PASSWORD`? See the [Encryption section](#-security--encryption).
> Encrypt it with `npm run encrypt-password`, then use `DB_PASSWORD_ENCRYPTED=U2FsdGVkX1...` instead.

### How to use it in code?

```typescript
// ──── SEED: Create test data before tests ────
import { seedTestData, queryTestData } from '../utils';

await seedTestData('users', {
  username: 'testuser_automation',
  email: 'test@automation.com',
}, 'Test user for login tests');    // ← description (shows in logs)
// → Inserts a row into the "users" table

// ──── QUERY: Check data during tests ────
const result = await queryTestData('orders', { userId: '12345' });
// → Returns all rows in "orders" where userId = 12345
// result.data = [{ id: 9999, item: 'Widget', status: 'shipped' }]

// ──── CLEANUP happens automatically in global-teardown.ts ────
// Everything you seeded is deleted. You can also clean up manually:
import { cleanupTestData } from '../utils';
await cleanupTestData();
```

### Step-by-step: What happens during a test run?

```
1. global-setup.ts starts
2. Framework checks: is DB_ENABLED=true?
   - No  → prints "Database not configured — skipping" and moves on
   - Yes → connects to the database
3. seedTestData() runs → inserts your test data → remembers what it inserted
4. Tests run → your tests can see the seeded data
5. global-teardown.ts runs
6. cleanupTestData() runs → deletes everything that was seeded (and ONLY that)
7. Database is clean again ✅
```

### What if I DON'T configure the database?
Nothing breaks. Database operations are silently skipped. You see:
```
⚠️  Database not configured — skipping seed/cleanup.
```

### Where is the code?
- `utils/database/test-data-manager.ts` — seed, query, cleanup functions
- `utils/database/db-connection.ts` — secure database connection wrapper

### ⚠️ Important: You need to add your database driver
The file has placeholder comments showing EXACTLY where to plug in your
PostgreSQL/MySQL/MongoDB code. Search for `🔌 PLUG YOUR DATABASE CLIENT HERE`
in the file.

---

## 📧 Email Verification

### What is it? (Explained Like You're 5)

Imagine you're testing the "Forgot Password" feature. You click the button, the website
says "Check your email for a reset link." But how does your automated test **read** that email?

You can't open Gmail from a Playwright test. Instead, you use a **test mailbox** — a
special email address with an API that your code can read, like a mailbox with a peephole.

```
┌──────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│  SCENARIO: Testing "Forgot Password" feature                            │
│                                                                          │
│  1. Test clicks "Forgot Password?" on the website                       │
│  2. Test types a TEST email address into the email field                 │
│     (NOT a real Gmail — a special test mailbox address)                  │
│  3. Test clicks "Send Reset Link"                                        │
│  4. Website sends a real email to that test mailbox                      │
│  5. ✨ This utility calls the mailbox API:                               │
│     "Did an email with subject 'Reset your password' arrive?"           │
│  6. Utility waits up to 30 seconds for it to arrive                     │
│  7. Email arrives → utility reads the body                              │
│  8. Utility extracts the reset link:                                     │
│     "https://app.com/reset?token=abc123"                                │
│  9. Test navigates to that link → tests the reset flow                  │
│                                                                          │
│  The same approach works for:                                            │
│    • 6-digit OTP codes ("Your code is 482901")                          │
│    • Sign-up verification links                                          │
│    • Two-factor authentication codes                                     │
│    • Order confirmation emails                                           │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### How does it work?
You use a **test mailbox service** — a special email inbox with an API.

Popular services (pick one):

| Service | Free Tier | Website |
|---------|----------|---------|
| **Mailosaur** | 20 emails/day | https://mailosaur.com |
| **MailSlurp** | 100 emails/month | https://mailslurp.com |
| **Mailtrap** | 100 emails/month | https://mailtrap.io |

### How to enable it?

```env
EMAIL_ENABLED=true
EMAIL_SERVICE=mailosaur
EMAIL_API_KEY=your-api-key-from-the-service
EMAIL_SERVER_ID=your-server-id
```

### How to use it in code?

```typescript
import { waitForEmail, extractVerificationCode, extractLink } from '../utils';

// 1. Your test clicks "Forgot Password" on the website
await page.getByText('Forgot Password?').click();
await page.getByLabel('Email').fill('testuser@your-mailosaur-server.mailosaur.io');
await page.getByRole('button', { name: 'Send Reset Link' }).click();

// 2. Wait for the reset email to arrive (waits up to 30 seconds)
const result = await waitForEmail(
  'testuser@your-mailosaur-server.mailosaur.io',
  'Reset your password'    // ← partial subject line to match
);

// 3. Extract the reset link from the email body
if (result.success && result.email) {
  const resetLink = extractLink(result.email.body, /reset-password/);
  // resetLink = "https://app.com/reset-password?token=abc123def456"

  // 4. Navigate to the reset link
  await page.goto(resetLink!);
}

// ──── OR: Extract a 6-digit OTP code ────
const code = extractVerificationCode(result.email!.body, 6);
// code = "482901"
// Now type it into the OTP field:
await page.getByLabel('Verification Code').fill(code!);
```

### What if I DON'T configure email?
Nothing breaks. Email functions return `{ success: false, message: 'not configured' }`.

### Where is the code?
- `utils/email/email-verifier.ts`

### ⚠️ Important: You need to add your email service API calls
The file has placeholder comments showing EXACTLY where to plug in your
Mailosaur/MailSlurp/Mailtrap code. Search for `🔌 PLUG YOUR EMAIL SERVICE API HERE`.

---

## 🌐 API Testing Helper

### What is it? (Explained Like You're 5)

When you use a website, your browser (Chrome) talks to a **server** behind the scenes.
Every button click, every page load — the browser sends a **request** and the server
sends back a **response**. This invisible conversation uses something called an **API**.

Normally, Playwright tests the VISIBLE part (click buttons, check text on screen).
But sometimes you need to talk directly to the server — skip the browser entirely.

```
┌──────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│  UI Test (what you see):                                                 │
│    Browser → click "Create Order" button → see "Order Created!" text    │
│                                                                          │
│  API Test (what happens behind the scenes):                              │
│    Code → sends POST /api/orders { item: "Widget" } → server responds  │
│    with { id: 42, status: "created" } → we check that directly          │
│                                                                          │
│  WHY test the API directly?                                              │
│    • Faster (no browser to open, no page to load)                       │
│    • Can test things the UI doesn't show (hidden server logic)          │
│    • Great for setup/cleanup (create test data before UI test starts)   │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### What can it do?

| Method | What it does | Real-World Analogy | Example |
|--------|-------------|-------------------|---------|
| `apiGet(url)` | **Read** data | "Show me the menu" | Get a list of users |
| `apiPost(url, data)` | **Create** data | "I'd like to place an order" | Create a new user account |
| `apiPut(url, data)` | **Update** data | "Change my order to a large" | Update a user's email address |
| `apiDelete(url)` | **Delete** data | "Cancel my order" | Delete a test user |

### How to use it in code?

```typescript
import { apiGet, apiPost, apiPut, apiDelete } from '../utils';

// ──── GET: Fetch data from an API ────
const users = await apiGet('/api/users');
// users.data = [{ id: 1, name: "John" }, { id: 2, name: "Jane" }]

// ──── POST: Create something via API ────
const newOrder = await apiPost('/api/orders', {
  item: 'Widget',
  quantity: 5,
  price: 9.99,
});
// newOrder.data = { id: 42, item: "Widget", status: "created" }

// ──── PUT: Update something via API ────
await apiPut('/api/users/1', { name: 'Jane Doe' });

// ──── DELETE: Clean up after your test ────
await apiDelete('/api/orders/42');
```

### How to configure it?

```env
# If your API is at a different URL than your website:
API_BASE_URL=https://api.your-app.com

# If your API requires a token:
API_AUTH_TOKEN=your-bearer-token-here
```

If you leave `API_BASE_URL` blank, it defaults to `BASE_URL` (your website address).

### Real example from this framework

Our API tests (`tests/api.test.ts`) test https://jsonplaceholder.typicode.com:

```typescript
// TC04: GET a single post
const response = await apiGet('https://jsonplaceholder.typicode.com/posts/1');
expect(response.status).toBe(200);                    // Server says "OK"
expect(response.data.title).toBeDefined();             // Post has a title

// TC05: CREATE a new post
const newPost = await apiPost('https://jsonplaceholder.typicode.com/posts', {
  title: 'Automated Test Post',
  body: 'Created by Playwright',
  userId: 1,
});
expect(newPost.status).toBe(201);                      // Server says "Created"
expect(newPost.data.id).toBeDefined();                 // New post has an ID
```

### Where is the code?
- `utils/api/api-helper.ts` — `apiGet`, `apiPost`, `apiPut`, `apiDelete` + pre-configured HTTP client

---

## 📊 HTML Execution Report

### What is it? (Explained Like You're 5)

After every test run, the framework creates a **single HTML file** that you can open
in any browser. Think of it as a "report card" for your tests — it shows everything
that happened, with colors, charts, and screenshots.

No server needed, no login required, no special software — just double-click the file.

```
┌──────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│  You run: npm test                                                       │
│                                                                          │
│  Tests finish (pass or fail)                                             │
│                                                                          │
│  Framework automatically creates:                                        │
│    reports/execution-report-2026-03-03.html                              │
│                                                                          │
│  You open it in Chrome → see a beautiful dashboard with:                │
│    📊 Donut chart: 5 passed, 1 failed (83% pass rate)                   │
│    📋 Table: every test with PASS/FAIL badge, duration, start time      │
│    📸 Screenshots: failure screenshots inline (click to zoom)           │
│    📝 Step logs: expand any test to see every log message               │
│    ♿ Accessibility: all a11y violations found (WCAG scan results)      │
│    🔗 JIRA link: click to go to the XRAY Test Execution                │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### What does the report contain?

| Section | What You'll See |
|---------|----------------|
| **Header** | Environment (dev/staging/prod), sprint number, total duration, run date |
| **Summary Cards** | Total tests, passed, failed, pass rate %, suite duration, UI count, API count |
| **Observability Dashboard** | Network stats (total requests, transfer size), page load timing, FCP/LCP metrics |
| **Charts** | Pass/Fail donut, test type breakdown, duration bar chart, a11y issues |
| **Results Table** | Every test with: full name, 🖥️ UI / 🔌 API badge, PASS/FAIL badge, start time, duration |
| **Screenshots** | Failure screenshots shown inline — click to zoom |
| **Step Log Accordion** | Expand any test to see every log message from that test |
| **Accessibility Table** | All a11y violations found across tests (impact, element, message) |
| **Performance Table** | Page load and navigation timing per test |
| **XRAY Section** | Execution key, JIRA link, or demo-mode explanation if JIRA not configured |

### Where is the report saved?
```
reports/execution-report-YYYY-MM-DD.html
```
A new file is created for each day. Old reports are never deleted automatically.

### How to open it?

**Option 1 (easiest):** Double-click the file in Finder (macOS) or Explorer (Windows).

**Option 2 (from VS Code):** Right-click the file → **Open with Live Server** (if you have the extension).

**Option 3 (from terminal):**
```bash
open reports/execution-report-2026-03-03.html        # macOS
start reports/execution-report-2026-03-03.html       # Windows
```

### Do I need to do anything?
No. The report is generated automatically at the end of every `npm test` run.
You don't need to install anything extra or configure anything.

### Where is the code?
- `utils/reporting/report-generator.ts` — builds the full HTML with charts and screenshots
- `utils/helpers/enhanced-logger.ts` — collects structured data during the run (logs, performance, a11y)

---

## 📸 Screenshot Capture

### What is it? (Explained Like You're 5)

A screenshot is a **photo** of what the browser is showing at a specific moment.
When a test fails, the screenshot shows you exactly what the user would have seen —
maybe a wrong error message, a missing button, or a broken page layout.

Screenshots are the **#1 debugging tool**. Instead of guessing why a test failed,
you look at the picture and immediately see the problem.

```
┌──────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│  TEST FAILS: "Expected 'Welcome, John' but found 'Login Failed'"       │
│                                                                          │
│  Without screenshot: 🤷 "Why did it fail? What was on the screen?"     │
│                                                                          │
│  With screenshot:    📸 You see the login page with an error banner:    │
│                      "Invalid credentials. Please try again."           │
│                      → Now you know: the password was wrong!            │
│                                                                          │
│  Screenshot is also attached to JIRA XRAY as evidence (if configured)   │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### When are screenshots taken?
- **Automatically on failure** — the framework captures a screenshot whenever a
  test fails (you don't need to do anything, it just works)
- **Manually in your test** — you can capture screenshots at any point
- **Attached to JIRA** — failure screenshots are uploaded to XRAY as evidence

### How to use it in code?

```typescript
import { captureScreenshot } from '../utils';

// Take a screenshot at any point in your test
await captureScreenshot(page, 'my-test', 'after-login');
// Saves to: test-results/screenshots/my-test_after-login_2026-03-01T04-55-00.png

// Take a failure screenshot (used automatically by the framework)
import { captureFailureScreenshot } from '../utils';
await captureFailureScreenshot(page, 'TC01-login-test');
// Saves to: test-results/screenshots/TC01-login-test_FAILURE_2026-03-01T04-55-00.png
```

### Where are screenshots saved?
`test-results/screenshots/` — this folder is created automatically.

### Do I need to configure anything?
No. Failure screenshots are always captured automatically. You never need to enable this.

### Where is the code?
- `utils/helpers/screenshot.ts` — `captureScreenshot()` and `captureFailureScreenshot()`

---

## 📝 Logger

### What is it? (Explained Like You're 5)

When you run tests, messages appear in the terminal showing what's happening:
"Page loaded", "Clicking button", "Test passed!", etc. The Logger is the tool
that prints these messages — but instead of plain boring text, it uses **colors,
icons, and timestamps** so you can instantly tell what's important.

```
┌──────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│  Without logger (plain console.log):                                     │
│    Page loaded                                                           │
│    Clicking button                                                       │
│    Test passed                                                           │
│    Something went wrong                                                  │
│    → All looks the same. Hard to spot problems at a glance.             │
│                                                                          │
│  With logger (color-coded, timestamped):                                 │
│    [04:55:10] ℹ INFO   Page loaded: The Internet        ← blue          │
│    [04:55:10] ▶ STEP   Clicking: Login button            ← blue          │
│    [04:55:11] ✅ PASS  TC01 passed — Login successful    ← green         │
│    [04:55:11] ❌ FAIL  TC02 — Wrong error message shown  ← red           │
│    [04:55:11] ⚠ WARN   JIRA not configured, skipping     ← yellow        │
│    → Instant visibility. Green = good, Red = bad, Yellow = watch out.   │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### What message types are available?

| Method | Icon | Color | When to Use |
|--------|------|-------|-------------|
| `logger.info(msg)` | ℹ | Blue | General information ("Page loaded") |
| `logger.step(msg)` | ▶ | Blue | An action being taken ("Clicking submit button") |
| `logger.pass(msg)` | ✅ | Green | Something succeeded ("Test passed!") |
| `logger.fail(msg)` | ❌ | Red | Something failed ("Expected X but got Y") |
| `logger.warn(msg)` | ⚠ | Yellow | Something unusual but not broken ("JIRA not configured") |
| `logger.error(msg)` | ❌ | Red | A critical error ("Cannot connect to database") |
| `logger.section(msg)` | ── | White | A visual separator between sections |

### How to use it in code?

```typescript
import { logger } from '../utils';

logger.info('Page loaded successfully');     // Blue informational message
logger.step('Clicking the submit button');   // Blue action step
logger.pass('Test passed!');                 // Green success message
logger.fail('Test failed', 'Error details'); // Red failure message
logger.warn('Something unexpected');         // Yellow warning
logger.error('Critical failure');            // Red error
logger.section('=== NEW SECTION ===');       // Visual separator
```

### Do I need to configure anything?
No. The logger is always available. Just import it and use it.

### Where is the code?
- `utils/helpers/logger.ts` — color-coded terminal logging with timestamps

---

## 🍪 Cookie & Popup Handling

### What is it? (Explained Like You're 5)

You know those annoying banners that pop up on every website?
"Accept All Cookies", "Allow Notifications", "Subscribe to our newsletter"?
When a HUMAN visits a website, they click "Accept" and move on.
But an automated test doesn't know to click those buttons — it gets stuck.

This framework handles ALL of that automatically. No popups will block your tests.

```
┌──────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│  WITHOUT popup handling:                                                 │
│    Test opens website → Cookie banner covers the Login button           │
│    → Test tries to click Login → ❌ BLOCKED by the banner               │
│    → Test fails! (not because of a real bug, but because of a popup)    │
│                                                                          │
│  WITH popup handling (this framework):                                   │
│    Test opens website → Cookie banner appears                            │
│    → Framework auto-clicks "Accept All Cookies" → banner disappears    │
│    → Test clicks Login → ✅ Works perfectly                              │
│                                                                          │
│  Also handles JavaScript alerts/confirms/prompts:                        │
│    Website shows alert("Are you sure?")                                  │
│    → Framework auto-clicks "OK" → test continues                        │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### How does it work?

| Popup Type | How It's Handled | Where |
|-----------|-----------------|-------|
| **Browser alerts/confirms** (JavaScript popups) | Auto-accepted before every test | `tests/xray-test-fixture.ts` |
| **Cookie banners** (HTML overlay buttons) | Auto-clicked when navigating | `pages/BasePage.ts` → `dismissCookieBanner()` |

### What cookie button texts does it recognize?
The framework looks for buttons with these texts (case-insensitive):
- "Accept All" / "Accept Cookies"
- "I Accept" / "Allow All"
- "Agree" / "Got it" / "OK, got it"
- "Continue"

If no cookie banner is found, it silently moves on. No error, no delay.

### Do I need to configure anything?
No. This is always active automatically. You don't need to import anything,
set any `.env` variables, or write any code. It just works.

---

## 🔒 Security / Encryption

### What is it? (Explained Like You're 5)

Imagine you write your house key's PIN code on a sticky note and leave it on your desk.
Anyone who walks past can see it. That's what happens when you store passwords in plain text.

Now imagine you write it in a **secret code** that only YOU know how to read.
Even if someone finds the sticky note, they see gibberish: `U2FsdGVkX19abc123...`
That's **encryption**.

**In this framework:**
Your `.env` file holds passwords (database password, API tokens, etc.).
Instead of writing them in plain text where anyone (or any screen-share) can read them,
you **encrypt** them first, store the scrambled version, and the framework **decrypts**
them automatically at runtime.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  WITHOUT Encryption (❌ BAD — anyone can read your password):           │
│                                                                         │
│    .env file:                                                           │
│      DB_PASSWORD=MySuperSecret123                                       │
│      API_TOKEN=sk-live-abc123xyz                                        │
│                                                                         │
│  WITH Encryption (✅ GOOD — passwords are scrambled):                   │
│                                                                         │
│    .env file:                                                           │
│      DB_PASSWORD_ENCRYPTED=U2FsdGVkX19KxmE7...long-scrambled-text...    │
│      API_TOKEN_ENCRYPTED=U2FsdGVkX1+pLmN8...long-scrambled-text...      │
│      ENCRYPTION_KEY=myCompanyFramework2026SecretKey                      │
│                         ↑                                               │
│                         This is the ONLY thing you keep truly secret.   │
│                         The encrypted values are useless without it.    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### 🔑 How Encryption Works Behind the Scenes

You don't need to understand this to use it, but here's what actually happens:

```
ENCRYPTING (turning a password into scrambled text):
──────────────────────────────────────────────────────

Your password:      "MySuperSecret123"
        +
Your secret key:    "myCompanyFramework2026SecretKey"
        ↓
   [ AES-256 Algorithm ]     ← Same algorithm used by banks & governments
        ↓
Encrypted result:   "U2FsdGVkX19KxmE7qLz+3T8VjY9pR2wN..."

This scrambled text is safe to store. Without the key, it's gibberish.


DECRYPTING (turning scrambled text back into the password):
──────────────────────────────────────────────────────────

Encrypted text:     "U2FsdGVkX19KxmE7qLz+3T8VjY9pR2wN..."
        +
Your secret key:    "myCompanyFramework2026SecretKey"     ← Same key!
        ↓
   [ AES-256 Algorithm ]
        ↓
Original password:  "MySuperSecret123"
```

**The key rule:** The **same key** that encrypted the password **must** be used to decrypt it.
If someone changes the `ENCRYPTION_KEY` in `.env`, all previously encrypted passwords become unreadable.

---

### 🚀 Step-by-Step: How to Encrypt a Password (Just Follow These Steps)

This is the "I don't care how it works, just tell me what to type" guide.

---

#### Step 1: Make sure you have an encryption key in `.env`

Open your `.env` file. Look for a line that starts with `ENCRYPTION_KEY=`.

- **If it already exists** (someone on your team already set it up) → skip to Step 2.
- **If it doesn't exist** → add this line anywhere in your `.env` file:

```env
ENCRYPTION_KEY=myCompanyFramework2026SecretKey
```

> ⚠️ The key must be **at least 16 characters long**. The example above is 30 characters — perfect.
> ⚠️ Everyone on your team should use the **same** key. Ask your lead if one exists.

---

#### Step 2: Open a terminal and run the encryption tool

```bash
npm run encrypt-password
```

You'll see this interactive screen:

```
╔══════════════════════════════════════════════════════════════╗
║         🔐 Password Encryption Tool                         ║
╚══════════════════════════════════════════════════════════════╝

This tool encrypts a password so you can safely store it in .env.

Enter the password/value to encrypt: _
```

---

#### Step 3: Type the password you want to encrypt and press Enter

For example, if your database password is `MySuperSecret123`, just type it:

```
Enter the password/value to encrypt: MySuperSecret123
```

---

#### Step 4: Copy the encrypted result

The tool shows you the encrypted version:

```
╔══════════════════════════════════════════════════════════════╗
║  ✅ Encryption successful!                                   ║
╚══════════════════════════════════════════════════════════════╝

Add this to your .env file:

   DB_PASSWORD_ENCRYPTED=U2FsdGVkX19KxmE7qLz+3T8VjY9pR2wN...

OR for other values:
   MY_SECRET_ENCRYPTED=U2FsdGVkX19KxmE7qLz+3T8VjY9pR2wN...

⚠️  IMPORTANT:
   - Keep your ENCRYPTION_KEY private (never commit to Git)
   - The encrypted value above is useless without the key
   - Delete the plain text password from .env once encrypted

✅ Verified: decryption matches original value.
```

---

#### Step 5: Paste the encrypted value into your `.env` file

Open `.env` and replace the plain-text password with the encrypted one:

**Before (❌ plain text — anyone can read it):**
```env
DB_PASSWORD=MySuperSecret123
```

**After (✅ encrypted — safe to store):**
```env
DB_PASSWORD_ENCRYPTED=U2FsdGVkX19KxmE7qLz+3T8VjY9pR2wN...
ENCRYPTION_KEY=myCompanyFramework2026SecretKey
```

> 🎉 **That's it!** You just encrypted a password. The framework will automatically
> decrypt it at runtime when it needs the actual value.

---

### 📋 Complete Real-World Example: Encrypting a Database Password

Here's the entire flow, from start to finish, with no steps skipped:

```
┌──────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│  SCENARIO: You need to store your database password "Prod@2026#Secure"  │
│                                                                          │
│  YOUR .ENV FILE BEFORE:                                                  │
│  ─────────────────────                                                   │
│    JIRA_BASE_URL=https://company.atlassian.net                          │
│    JIRA_USERNAME=john@company.com                                        │
│    JIRA_API_TOKEN=ATATT3xFfGF0...                                       │
│    DB_PASSWORD=Prod@2026#Secure        ← ❌ BAD! Plain text!            │
│    ENCRYPTION_KEY=myCompanyFramework2026SecretKey                        │
│                                                                          │
│  WHAT YOU DO:                                                            │
│  ────────────                                                            │
│    1. Open terminal                                                      │
│    2. Type: npm run encrypt-password                                     │
│    3. When it asks, type: Prod@2026#Secure                              │
│    4. It outputs: U2FsdGVkX19KxmE7qLz+3T8VjY9pR2wN...                  │
│    5. Copy that scrambled text                                           │
│                                                                          │
│  YOUR .ENV FILE AFTER:                                                   │
│  ────────────────────                                                    │
│    JIRA_BASE_URL=https://company.atlassian.net                          │
│    JIRA_USERNAME=john@company.com                                        │
│    JIRA_API_TOKEN=ATATT3xFfGF0...                                       │
│    DB_PASSWORD_ENCRYPTED=U2FsdGVkX19KxmE7qLz+3T8VjY9pR2wN...  ← ✅    │
│    ENCRYPTION_KEY=myCompanyFramework2026SecretKey                        │
│                                                                          │
│  WHAT HAPPENS WHEN TESTS RUN:                                            │
│  ────────────────────────────                                            │
│    Framework reads DB_PASSWORD_ENCRYPTED from .env                       │
│    → calls decrypt("U2FsdGVkX19KxmE7qLz+...") using ENCRYPTION_KEY     │
│    → gets back "Prod@2026#Secure"                                        │
│    → uses it to connect to the database                                  │
│    → the plain text is NEVER stored on disk                              │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

### 📐 How to USE an Encrypted Password in Your Test Code

Once you've encrypted a password and stored it in `.env`, here's how to read it:

```typescript
import { decrypt, isEncryptionConfigured } from '../utils';

// Read the encrypted value from .env
const encryptedPassword = process.env.DB_PASSWORD_ENCRYPTED!;

// Decrypt it to get the real password
const realPassword = decrypt(encryptedPassword);
// realPassword = "Prod@2026#Secure"  ← the original, in memory only

// Now use it however you need:
await page.getByLabel('Password').fill(realPassword);
```

**For the developer writing the test code:**
```typescript
import { encrypt, decrypt, hashPassword, isEncryptionConfigured } from '../utils';

// ──── Encrypt (do this once to get the scrambled value) ────
const encrypted = encrypt('MySuperSecret123');
// → "U2FsdGVkX19KxmE7qLz+3T8VjY9pR2wN..."
// Store this in .env, then DELETE this line from code.

// ──── Decrypt (use this at runtime to get the real value) ────
const password = decrypt(process.env.DB_PASSWORD_ENCRYPTED!);
// → "MySuperSecret123"

// ──── Hash (one-way — CANNOT be reversed, like a fingerprint) ────
const fingerprint = hashPassword('MySuperSecret123');
// → "a1b2c3d4e5f6..."
// Use this to COMPARE passwords, never to store/retrieve them.

// ──── Check if encryption is set up ────
if (isEncryptionConfigured()) {
  // Safe to call encrypt() / decrypt()
} else {
  // ENCRYPTION_KEY is missing — fall back to plain text
}
```

---

### 🔐 Encrypt Multiple Values at Once

You can encrypt several secrets in one object:

```typescript
import { encryptObject, decryptObject } from '../utils/security/crypto-helper';

// Encrypt all values in one call
const encrypted = encryptObject({
  dbPassword:  'Prod@2026#Secure',
  apiToken:    'sk-live-abc123xyz',
  smtpPassword: 'email-pass-789',
});
// encrypted = {
//   dbPassword:   'U2FsdGVkX1...',
//   apiToken:     'U2FsdGVkX1...',
//   smtpPassword: 'U2FsdGVkX1...',
// }

// Decrypt them all back
const plain = decryptObject(encrypted);
// plain = { dbPassword: 'Prod@2026#Secure', apiToken: 'sk-live-abc123xyz', ... }
```

---

### ❓ Encryption FAQ (Common Questions)

| Question | Answer |
|----------|--------|
| **What if I forget the ENCRYPTION_KEY?** | You **cannot** decrypt previously encrypted values. You'll need to re-encrypt them with the new key. This is by design — it's what makes encryption secure. |
| **Can two team members use different keys?** | No. Everyone on the team must use the **same** `ENCRYPTION_KEY`. Otherwise their encrypted values won't work on each other's machines. |
| **What if I need to change a password?** | Run `npm run encrypt-password` again with the new password, copy the new encrypted value, and replace the old one in `.env`. |
| **Is the ENCRYPTION_KEY itself stored safely?** | The `.env` file is in `.gitignore` — it's never pushed to GitHub. But yes, whoever has access to your `.env` file can decrypt everything. Protect it. |
| **What's the difference between encrypt and hash?** | `encrypt` is **reversible** (you can get the original back). `hashPassword` is **one-way** (you can never get the original back — like a fingerprint). Use encrypt for passwords you need to use. Use hash for passwords you need to compare. |
| **What if `ENCRYPTION_KEY` is not set?** | The framework throws a clear error: `❌ ENCRYPTION_KEY is not set in your .env file!` with instructions on what to do. Nothing crashes silently. |
| **What if the key is too short?** | Must be at least 16 characters. If shorter, you get: `❌ ENCRYPTION_KEY is too short (minimum 16 characters)` with a suggestion. |
| **What algorithm does this use?** | AES-256 (Advanced Encryption Standard, 256-bit key) via the `crypto-js` library. This is the same standard used by banks, governments, and military. |
| **Can I encrypt things OTHER than passwords?** | Yes! API tokens, database connection strings, email credentials — anything sensitive. |
| **What does the encrypted text look like?** | It always starts with `U2FsdGVk` (this is a CryptoJS signature). Example: `U2FsdGVkX19KxmE7qLz+3T8VjY9pR2wN...` |

---

### ⚡ Quick-Reference: Encryption Cheat Sheet

```
┌──────────────────────────────────────────────────────────────────────────┐
│  🔒 ENCRYPTION CHEAT SHEET                                              │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ONE-TIME SETUP:                                                         │
│    1. Add to .env:  ENCRYPTION_KEY=myCompanyFramework2026SecretKey       │
│                                                                          │
│  ENCRYPT A PASSWORD:                                                     │
│    2. Run:          npm run encrypt-password                             │
│    3. Type your password when asked                                      │
│    4. Copy the output → paste into .env                                  │
│                                                                          │
│  USE IN CODE:                                                            │
│    const password = decrypt(process.env.MY_SECRET_ENCRYPTED!);           │
│                                                                          │
│  AVAILABLE FUNCTIONS:                                                    │
│    encrypt(text)           → scrambles text (reversible)                 │
│    decrypt(text)           → unscrambles text (needs same key)           │
│    hashPassword(text)      → fingerprints text (one-way, NOT reversible) │
│    encryptObject(obj)      → encrypts every value in an object           │
│    decryptObject(obj)      → decrypts every value in an object           │
│    isEncryptionConfigured()→ checks if ENCRYPTION_KEY is set             │
│                                                                          │
│  NPM SCRIPTS:                                                           │
│    npm run encrypt-password   → interactive CLI tool                     │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### Where is the code?
- `utils/security/crypto-helper.ts` — all encryption/decryption functions + the CLI tool

---

## 📑 Excel / Data-Driven Testing

### What is it? (Explained Like You're 5)

Imagine you need to test login with 50 different username/password combinations.
Writing 50 separate tests would be tedious and hard to maintain.
Instead, you put all 50 combinations in an **Excel spreadsheet**, and the framework
reads it automatically — running the same test once for each row.

```
┌──────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│  YOUR EXCEL FILE (test-data/users.xlsx, sheet "LoginData"):             │
│  ┌──────────┬────────────┬──────────────────────────┐                    │
│  │ username │ password   │ expectedResult            │                    │
│  ├──────────┼────────────┼──────────────────────────┤                    │
│  │ alice    │ pass123    │ Welcome, Alice            │                    │
│  │ bob      │ wrongpass  │ Your username is invalid! │                    │
│  │ charlie  │ (empty)    │ Your username is invalid! │                    │
│  │ admin    │ admin@2026 │ Welcome, Admin            │                    │
│  │  ...     │  ...       │  ...                      │                    │
│  └──────────┴────────────┴──────────────────────────┘                    │
│                                                                          │
│  THE FRAMEWORK:                                                          │
│    Reads each row → runs the login test with that row's data            │
│    Row 1: types "alice" + "pass123" → checks for "Welcome, Alice"       │
│    Row 2: types "bob" + "wrongpass" → checks for error message          │
│    Row 3: types "charlie" + "" → checks for validation error            │
│    ...and so on for all 50 rows.                                         │
│                                                                          │
│  BENEFIT: To add more test cases, just add rows to Excel.               │
│  No code changes needed!                                                 │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### What can it do?

| Action | Description |
|--------|------------|
| Read a sheet | Get all rows from a specific sheet as an array of objects |
| Read all sheets | Get every sheet from the workbook at once |
| Get sheet names | List all the tab names in an Excel file |
| Write results | Write pass/fail results back into the Excel file |
| Data Pool | Randomly pick test data rows to avoid conflicts in parallel runs |

### How to use it in code?

```typescript
import { readExcelSheet, DataPool } from '../utils';

// ──── Read all rows from the "LoginData" tab ────
const rows = readExcelSheet('test-data/users.xlsx', 'LoginData');
// rows = [
//   { username: 'alice', password: 'pass123', expectedResult: 'Welcome, Alice' },
//   { username: 'bob',   password: 'wrongpass', expectedResult: 'Your username is invalid!' },
//   ...
// ]

// ──── Use in a test ────
for (const row of rows) {
  await page.getByLabel('Username').fill(row.username);
  await page.getByLabel('Password').fill(row.password);
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page.getByText(row.expectedResult)).toBeVisible();
}

// ──── Data Pool — picks a unique row per parallel worker (no conflicts) ────
const pool = new DataPool(rows);
const myRow = pool.acquire();
// If 4 tests run in parallel, each gets a DIFFERENT row — no conflicts
```

### Do I need to configure anything?
No `.env` variables needed. Just put your `.xlsx` file in the `test-data/` folder
and import `readExcelSheet` in your test.

### Where is the code?
- `utils/excel/excel-reader.ts` — reads rows from Excel spreadsheets
- `utils/excel/data-pool.ts` — manages data rows for parallel test execution

---

## How to Add Your OWN New Utility

Want to add something new? Maybe Teams notifications, AWS S3 upload, or a
custom reporting tool? Follow this recipe:

### Step 1: Create a folder and file

```
utils/
└── my-new-tool/                    ← Create this folder
    └── my-new-tool.ts              ← Create this file
```

### Step 2: Write your utility with this template

```typescript
// utils/my-new-tool/my-new-tool.ts
import { config } from '../../config/environment';
import { logger } from '../helpers/logger';

// CHECK function: Is this utility configured?
export function isMyToolConfigured(): boolean {
  return config.myTool.apiKey !== '' && config.myTool.apiKey !== 'placeholder';
}

// MAIN function: Do the thing
export async function doSomethingCool(): Promise<void> {
  if (!isMyToolConfigured()) {
    logger.warn('MyTool not configured — skipping.');
    return;
  }

  // Your actual logic here
  logger.pass('MyTool did the thing!');
}
```

### Step 3: Add config to `config/environment.ts`

Open `config/environment.ts` and add a new section:

```typescript
myTool: {
  apiKey: getOptionalEnvVar('MY_TOOL_API_KEY', ''),
  someOtherSetting: getOptionalEnvVar('MY_TOOL_SETTING', 'default'),
},
```

### Step 4: Add env vars to `.env` and `.env.example`

```env
# My New Tool
MY_TOOL_API_KEY=your-key-here
MY_TOOL_SETTING=some-value
```

### Step 5: Wire it in (pick where it makes sense)

| If your utility should run... | Add it to... |
|------------------------------|-------------|
| Once BEFORE all tests | `tests/global-setup.ts` |
| Once AFTER all tests | `tests/global-teardown.ts` |
| Inside individual tests | Import it directly in your `.test.ts` file |
| Around every test (before + after) | `tests/xray-test-fixture.ts` |

### Step 6: Add to the barrel file (optional, for clean imports)

Open `utils/index.ts` and add:

```typescript
export { isMyToolConfigured, doSomethingCool } from './my-new-tool/my-new-tool';
```

Now anyone can import it with: `import { doSomethingCool } from '../utils';`

### That's it! 🎉

The framework will show your tool in the Utility Status Dashboard:
```
📋 Utility Status Dashboard
  🔹 JIRA XRAY:  ✅ Configured
  🔹 My Tool:    ✅ Configured          ← your new utility!
```

---

## Which File Does What (Cheat Sheet)

| File | One-Line Purpose |
|------|-----------------|
| **`.env`** | Your private settings (URLs, passwords, API keys) |
| **`config/environment.ts`** | Reads `.env` and makes it available as `config.xxx` |
| **`tests/global-setup.ts`** | Runs ONCE before tests — XRAY setup, DB seed, utility checks |
| **`tests/global-teardown.ts`** | Runs ONCE after all tests — XRAY upload, HTML report, DB cleanup |
| **`tests/xray-test-fixture.ts`** | Wraps every test with XRAY reporting + a11y scan + popup handling |
| **`tests/login.test.ts`** | UI test cases — 3 login tests (TC01–TC03) |
| **`tests/api.test.ts`** | API test cases — 3 REST API tests (TC04–TC06) |
| **`tests/playwright-dev.test.ts`** | Navigation test cases — 5 playwright.dev tests (TC07–TC11) |
| **`pages/BasePage.ts`** | Reusable browser actions — click, fill, navigate, wait |
| **`pages/LoginPage.ts`** | Login page specific actions — enter username, click login |
| **`pages/PlaywrightDevPage.ts`** | playwright.dev page actions — navigate tabs, switch language |
| **`utils/jira-xray/*.ts`** | Everything JIRA/XRAY — auth, fetch tests, create execution, upload results |
| **`utils/reporting/report-generator.ts`** | Builds the full HTML execution report with charts and screenshots |
| **`utils/database/test-data-manager.ts`** | Seeds and cleans up test data in your database |
| **`utils/database/db-connection.ts`** | Secure database connection wrapper |
| **`utils/email/email-verifier.ts`** | Waits for emails, extracts OTP codes and links |
| **`utils/api/api-helper.ts`** | Makes GET/POST/PUT/DELETE API calls |
| **`utils/excel/excel-reader.ts`** | Reads test data rows from Excel (.xlsx) spreadsheets |
| **`utils/excel/data-pool.ts`** | Manages data rows for parallel test execution (no conflicts) |
| **`utils/security/crypto-helper.ts`** | AES-256 encrypt/decrypt passwords and stored secrets |
| **`utils/helpers/logger.ts`** | Color-coded terminal logging |
| **`utils/helpers/enhanced-logger.ts`** | Structured data collector for the HTML report (logs, perf, a11y) + PASS/FAIL log summary |
| **`utils/helpers/test-data-loader.ts`** | Reads test input data from YAML files in `test-data/`; supports `run: yes/no` selective execution |
| **`utils/helpers/screenshot.ts`** | Captures browser screenshots |
| **`utils/index.ts`** | Barrel file — import anything from one place |
| **`test-data/ui-tests.yaml`** | UI test data: Login + Navigation (credentials, URLs, expected results, `run: yes/no` toggle) |
| **`test-data/api-tests.yaml`** | API test data: endpoints, payloads, expected status codes, `run: yes/no` toggle |
| **`logs/test-run-*.log`** | Per-run log files with PASS/FAIL summary prepended at the top |
| **`playwright.config.ts`** | Playwright settings (browsers, timeouts, retries) |
| **`.env` timeouts** | `TEST_TIMEOUT`, `EXPECT_TIMEOUT`, `ACTION_TIMEOUT`, `NAVIGATION_TIMEOUT` |
| **`.env` viewport** | `VIEWPORT_WIDTH`, `VIEWPORT_HEIGHT` |

---

## How to Enable/Disable Any Utility

Every utility is controlled by your `.env` file. Here's the master switch for each:

| Utility | How to Enable | How to Disable |
|---------|--------------|----------------|
| **Playwright (UI tests)** | Always on (it's the core) | Can't disable |
| **API Testing** | Always on (no config needed) | Can't disable |
| **HTML Report** | Always on — generated after every run | Can't disable |
| **Global Timeouts** | Set `TEST_TIMEOUT`, `ACTION_TIMEOUT`, etc. in `.env` | Uses sensible defaults (60s/10s/10s/30s) |
| **Browser Viewport** | Set `VIEWPORT_WIDTH`, `VIEWPORT_HEIGHT` in `.env` | Defaults to 1280×720 |
| **JIRA XRAY** | Set real values for `JIRA_BASE_URL`, `JIRA_USERNAME`, `JIRA_API_TOKEN` | Leave the placeholder values — tests still run |
| **Database** | Set `DB_ENABLED=true` + fill connection details | Set `DB_ENABLED=false` |
| **Email** | Set `EMAIL_ENABLED=true` + fill API key | Set `EMAIL_ENABLED=false` |
| **API Helper base URL** | Set `API_BASE_URL` (optional — defaults to `BASE_URL`) | Leave empty |
| **Encryption** | Set `ENCRYPTION_KEY` (min 16 chars) | Leave empty — passwords stay as plain text |
| **Excel** | Import `readExcelSheet` in your test — no `.env` needed | Just don't use it |
| **YAML Data-Driven** | Import `getTestData` in your test + add YAML files to `test-data/` | Just don't use it |
| **Screenshots** | Always on automatically | Can't disable |
| **Logger** | Always on automatically | Can't disable |
| **Log File PASS/FAIL** | Always on — summary prepended to log file after every run | Can't disable |
| **Accessibility scan** | Always on automatically after every UI test | Can't disable |
| **Cookie handling** | Always on automatically | Can't disable |

### The Golden Rule

> **If you don't configure it, it won't run. If it won't run, it won't crash.**
>
> Every utility checks itself before doing anything. No configuration = no action = no error.

---

*Last updated: 6 March 2026*
*Framework: Playwright AutoAgent – AI Automation Framework*
*Tests: 3 Login (UI) + 3 API (REST) + 5 Navigation (UI) = 11 total*
*Next: Read [WALKTHROUGH.md](WALKTHROUGH.md) to see the end-to-end XRAY flow, or [WRITE_A_TEST.md](WRITE_A_TEST.md) to write your first test.*
