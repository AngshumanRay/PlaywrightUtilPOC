# 📖 Complete Walkthrough — Playwright AutoAgent
### For Team Members With Zero Coding Experience

---

> **You don't need to understand any code to follow this guide.**
> Every concept is explained in plain English with text diagrams.
> Read it top to bottom — each section builds on the previous one.
>
> **Coming from README.md?** Good — this guide goes deeper into *how* the XRAY integration works.

---

## 📚 Table of Contents

| # | Section | What You'll Learn |
|---|---------|-------------------|
| 1 | [The Big Picture](#️-the-big-picture--what-happens-when-you-run-tests) | The 3 phases every test run goes through |
| 2 | [Understanding the Moving Parts](#️-section-1--understanding-the-moving-parts) | What JIRA, XRAY, and Playwright actually are |
| 3 | [How Authentication Works](#-section-2--how-authentication-works) | How the framework proves its identity to JIRA |
| 4 | [How Test Cases Are Fetched](#-section-3--how-test-cases-are-fetched-from-xray-test-set) | How the framework reads your test list from JIRA |
| 5 | [How a Test Execution Is Created](#-section-4--how-a-test-execution-is-created-in-jira-xray) | How the "result container" is made in JIRA |
| 6 | [How Tests Are Matched to XRAY](#-section-5--how-playwright-knows-which-tests-to-run) | The annotation that links code to JIRA tickets |
| 7 | [4 Ways to Map Tests](#-section-6--the-4-ways-to-map-tests-choose-what-fits-your-team) | Choose the mapping approach that fits your team |
| 8 | [What Happens During Execution](#️-section-7--what-happens-during-test-execution) | Step-by-step: what Playwright records per test |
| 9 | [How Results Upload to JIRA](#-section-8--how-results-are-uploaded-back-to-jira-xray) | The teardown phase — uploading PASS/FAIL + screenshots |
| 10 | [Which File Does What](#️-section-9--which-file-does-what-plain-english) | Plain-English map of every file in the project |
| 11 | [First Time Setup Checklist](#-section-10--first-time-setup-your-step-by-step-checklist) | Step-by-step checklist to get running |
| 12 | [Understanding Terminal Output](#-section-11--understanding-test-results-in-your-terminal) | What those coloured messages in the terminal mean |
| 13 | [FAQ](#-section-12--frequently-asked-questions) | Answers to the most common questions |
| 14 | [Who to Contact](#-section-13--who-to-contact-for-what) | Which person to ask for which problem |

---

## 🗺️ The Big Picture — What Happens When You Run Tests?

Think of this framework as a **three-act play**:

```
╔══════════════════════════════════════════════════════════════════════════╗
║                                                                          ║
║   ACT 1 — BEFORE TESTS (global-setup.ts)                                 ║
║   ─────────────────────────────────────                                  ║
║   1. Framework knocks on JIRA's door and proves its identity             ║
║   2. Framework asks JIRA: "Give me all test cases from Test Set PROJ-456" ║
║   3. Framework creates a new Test Execution ticket in JIRA               ║
║   4. Framework writes the Execution ID on a sticky note for later        ║
║                                                                          ║
║   ACT 2 — DURING TESTS (your .test.ts files)                             ║
║   ─────────────────────────────────────────                              ║
║   5. Playwright opens Chrome browser                                     ║
║   6. Playwright runs each test case (clicking, typing, checking)         ║
║   7. After each test: saves result (PASS/FAIL) + screenshot to a file    ║
║                                                                          ║
║   ACT 3 — AFTER TESTS (global-teardown.ts)                               ║
║   ─────────────────────────────────────────                              ║
║   8. Framework reads the sticky note (Execution ID)                      ║
║   9. Framework reads all saved results                                   ║
║  10. Framework tells JIRA: "PROJ-101 PASSED, PROJ-102 FAILED"            ║
║  11. Framework attaches failure screenshots to JIRA tickets              ║
║  12. JIRA Test Execution now shows real pass/fail results ✅              ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝
```

---

## 🏗️ Section 1 — Understanding the Moving Parts

Before we explain the flow, let's understand what each "thing" is.

### What is JIRA?
JIRA is a project management tool. Teams use it to track work — bugs, features,
tasks. Every item in JIRA is called a **ticket** or **issue**, and each ticket
has a unique ID like `PROJ-123`.

```
Example JIRA ticket:
┌────────────────────────────────────────┐
│  PROJ-123                              │
│  Title: User cannot log in             │
│  Type: Bug                             │
│  Status: In Progress                   │
│  Assigned to: Jane                     │
└────────────────────────────────────────┘
```

### What is XRAY?
XRAY is a **plugin** (add-on) for JIRA that adds testing features.
Without XRAY, JIRA has no concept of test cases or test results.
XRAY adds three new ticket types:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   TEST CASE     │    │   TEST SET      │    │ TEST EXECUTION  │
│   (PROJ-101)    │    │   (PROJ-456)    │    │   (PROJ-789)    │
│                 │    │                 │    │                 │
│ One specific    │    │ A folder/list   │    │ A report card   │
│ test scenario   │    │ grouping test   │    │ showing results │
│                 │    │ cases together  │    │ of a test run   │
│                 │    │                 │    │                 │
│ "Verify login   │    │ Contains:       │    │ PROJ-101: PASS  │
│  works with     │    │  - PROJ-101     │    │ PROJ-102: FAIL  │
│  valid creds"   │    │  - PROJ-102     │    │ PROJ-103: TODO  │
│                 │    │  - PROJ-103     │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
       ↑                      ↑                       ↑
  Created by QA          Created by QA           Created by
  MANUALLY in JIRA       MANUALLY in JIRA        PLAYWRIGHT
                                                 AUTOMATICALLY
```

> **⚠️ KEY RULE: Test Cases and Test Sets are MANUAL. Test Executions onward are AUTOMATIC.**
>
> QA creates Test Cases and Test Sets **manually in JIRA** (one-time setup).
> Playwright creates Test Executions, runs tests, marks PASS/FAIL, and uploads
> screenshots **automatically** every time you run `npm test`.
> See **[CAPABILITIES.md → JIRA XRAY Integration](CAPABILITIES.md#-jira-xray-integration)**
> for the complete step-by-step setup guide.

### What is Playwright?
Playwright is a tool that **controls a web browser like a robot**.
It can open Chrome, go to a URL, click buttons, type text, and check if
things are correct — all automatically, without a human doing it.

```
Without Playwright (manual):        With Playwright (automated):
─────────────────────────────       ──────────────────────────────
1. Human opens Chrome               1. Code opens Chrome
2. Human types the URL              2. Code types the URL
3. Human clicks "Login"             3. Code clicks "Login"
4. Human types email/password       4. Code types email/password
5. Human clicks "Submit"            5. Code clicks "Submit"
6. Human checks if it worked        6. Code checks if it worked
7. Human writes down the result     7. Code saves result automatically
                                    8. Code reports to JIRA XRAY
```

### What's Manual vs What's Automated?

```
┌──────────────────────────────────────────────────────────────────────────┐
│  ✋ MANUAL (QA does this in JIRA web UI — one time setup):               │
│                                                                          │
│     1. Create Test Cases in XRAY      (PROJ-101, PROJ-102, ...)         │
│     2. Create a Test Set in XRAY      (PROJ-456)                        │
│     3. Add Test Cases to the Test Set                                    │
│     4. Put XRAY_TEST_SET_ID=PROJ-456 in .env                           │
│                                                                          │
│  🤖 AUTOMATED (Playwright does this every time you run npm test):        │
│                                                                          │
│     5. Authenticates with JIRA                                           │
│     6. Reads Test Cases from the Test Set                                │
│     7. Creates a Test Execution ticket (PROJ-789)                        │
│     8. Links Test Cases to the Execution                                 │
│     9. Runs tests in browser (UI) or via HTTP (API)                      │
│    10. Records PASS/FAIL for each test                                   │
│    11. Uploads results + failure screenshots to JIRA                     │
│    12. Generates the HTML execution report                               │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 🔑 Section 2 — How Authentication Works

**Authentication** = "Proving who you are to JIRA before it lets you in"

Think of it like showing your employee badge at a security gate.
JIRA doesn't let just anyone access its data — you must prove you have permission.

### How our framework authenticates:

```
YOUR .env FILE                    JIRA SERVER
─────────────                     ───────────
JIRA_BASE_URL   ─────────────────→ "OK, I know this server"
JIRA_USERNAME   ──┐
JIRA_API_TOKEN  ──┴──(combined)──→ "Verified! You are John Doe.
                                    You have permission to read/write."
```

### What is an API Token?
A regular password is for humans. An **API Token** is a special password
for programs/scripts to use. It's safer because:
- You can create one specifically for this automation
- If it gets compromised, you can delete just that token
- It doesn't expose your real account password

**Where this happens in code:** `utils/jira-xray/jira-auth.ts`

**In plain English, that file does:**
1. Reads your username and API token from `.env`
2. Combines them like: `"john@company.com:mytoken123"`
3. Scrambles it into a safe format (called Base64)
4. Attaches this to every single JIRA request as proof of identity

---

## 📋 Section 3 — How Test Cases Are Fetched from XRAY Test Set

This is **ACT 1, Step 2** of the framework. Here's exactly what happens:

### Step-by-Step Walkthrough

**What you set up in `.env`:**
```
XRAY_TEST_SET_ID=PROJ-456
```

**What the framework does:**

```
FRAMEWORK                              JIRA XRAY API
─────────                              ─────────────

Step 1: "Hey JIRA, tell me about                     PROJ-456
         ticket PROJ-456"         ────────────────→  ┌───────────────────┐
                                                      │ Title: Login Tests│
                                  ←────────────────   │ Created by: Jane  │
                                                      │ Sprint: 5         │
                                                      └───────────────────┘

Step 2: "Hey XRAY, what test                         PROJ-456 contains:
         cases are IN PROJ-456?"  ────────────────→  ┌───────────────────┐
                                                      │ - PROJ-101        │
                                  ←────────────────   │ - PROJ-102        │
                                                      │ - PROJ-103        │
                                                      └───────────────────┘

Step 3: "Hey JIRA, give me full
         details of PROJ-101,
         PROJ-102, PROJ-103"      ────────────────→  Returns name, steps,
                                                      expected results for
                                  ←────────────────   each test case

Step 4: Framework builds a clean
        list in memory:
        [
          { key: "PROJ-101", name: "Valid login test", steps: [...] },
          { key: "PROJ-102", name: "Wrong password test", steps: [...] },
          { key: "PROJ-103", name: "Empty fields test", steps: [...] }
        ]
```

**Where this happens in code:** `utils/jira-xray/xray-test-set.ts`

---

## 🚀 Section 4 — How a Test Execution Is Created in JIRA XRAY

This is **ACT 1, Step 3**. A **Test Execution** is a new JIRA ticket that
acts as a "container" for the results of one complete test run.

### Why Create a Test Execution?

Think of it like an **exam result sheet**:
- The Test Set (`PROJ-456`) is the **list of subjects** on the syllabus
- The Test Execution (`PROJ-789`) is the **result sheet for one exam date**
- Each sprint gets its own result sheet, so you can compare over time

```
Sprint 3 Test Execution              Sprint 4 Test Execution
(PROJ-700, created 1-Feb-2026)       (PROJ-789, created 15-Feb-2026)
─────────────────────────────        ──────────────────────────────
PROJ-101: PASS                       PROJ-101: PASS
PROJ-102: FAIL   ← was failing       PROJ-102: PASS   ← now fixed!
PROJ-103: PASS                       PROJ-103: FAIL   ← new bug!
```

### What the Framework Creates

```
FRAMEWORK                              JIRA XRAY
─────────                              ─────────

"Create a new Test Execution
 with these details:"              ─────────────────────────────────→

 {                                     JIRA creates ticket:
   type: "Test Execution",             ┌─────────────────────────────────┐
   summary: "Sprint 5 —               │ PROJ-789                        │
     Playwright Run [28-Feb-2026]",    │ Sprint 5 — Playwright Run       │
   project: "PROJ"                     │  [28-Feb-2026]                  │
 }                                     │ Type: Test Execution            │
                                       │ Status: In Progress             │
                                   ←── │ Tests linked: (see below)       │
 "Got it! Execution key: PROJ-789"     └─────────────────────────────────┘

"Now link these test cases
 to PROJ-789:"
 ["PROJ-101", "PROJ-102",          ─────────────────────────────────→
  "PROJ-103"]
                                       PROJ-789 now shows:
                                       ┌────────────────────────────────┐
                                       │ PROJ-101: TODO (not run yet)   │
                                       │ PROJ-102: TODO (not run yet)   │
                                       │ PROJ-103: TODO (not run yet)   │
                                       └────────────────────────────────┘

Framework saves "PROJ-789" to
a file called xray-state.json
(like a sticky note for later)
```

**Where this happens in code:** `utils/jira-xray/xray-test-execution.ts`

---

## 🎭 Section 5 — How Playwright Knows Which Tests to Run

This is the **most important question** and the one with the most flexibility.

### The Core Problem

JIRA has a list of test cases (PROJ-101, PROJ-102, PROJ-103).
Playwright has test functions written in code.
**How does the framework connect these two?**

### The Answer: ANNOTATIONS (our chosen approach)

Each Playwright test function has a **label** (annotation) that says:
*"I am the automated version of XRAY test case PROJ-101"*

```typescript
// In tests/login.test.ts — look for this pattern:

test(
  'TC01: Valid credentials should log the user in successfully',
  {
    annotation: { type: 'xray', description: 'PROJ-101' }
    //                           ↑ THIS is the link to JIRA XRAY
    //                             Change this to your actual test case key
  },
  async ({ page }) => {
    // ... test code here ...
  }
);
```

Think of this like **name tags at a conference**:
- The test function is a PERSON (the automation)
- The annotation `PROJ-101` is their NAME TAG
- XRAY test case PROJ-101 is their actual IDENTITY in JIRA

```
PLAYWRIGHT TEST FUNCTION          XRAY TEST CASE
─────────────────────────         ──────────────
test('TC01: Valid login',    ←──→  PROJ-101: "Verify login
  annotation: 'PROJ-101',          with valid credentials"
  async ({ page }) => {
    // opens browser             Steps:
    // types credentials          1. Open login page
    // clicks submit              2. Enter valid email
    // checks dashboard           3. Enter valid password
  }                               4. Click Login
)                                 5. Check dashboard loads
```

---

## 🔀 Section 6 — The 4 Ways to Map Tests (Choose What Fits Your Team)

> **This is the section about flexibility** — different teams do this differently.
> Here are all four approaches explained, with pros and cons of each.

---

### 🅐 Method 1: One-to-One Annotation (RECOMMENDED for beginners)

**How it works:** Each test has one annotation with the exact XRAY test case key.

```typescript
test('Login with valid credentials',
  { annotation: { type: 'xray', description: 'PROJ-101' } },
  async ({ page }) => { /* ... */ }
);

test('Login with wrong password',
  { annotation: { type: 'xray', description: 'PROJ-102' } },
  async ({ page }) => { /* ... */ }
);
```

**Visual mapping:**
```
Playwright Test File              XRAY Test Set PROJ-456
────────────────────              ──────────────────────
test [annotation: PROJ-101]  ←→  PROJ-101: Valid login
test [annotation: PROJ-102]  ←→  PROJ-102: Wrong password
test [annotation: PROJ-103]  ←→  PROJ-103: Empty fields
```

**Pros:**
- ✅ Simplest to understand — one test = one XRAY case
- ✅ Crystal clear which code maps to which JIRA ticket
- ✅ Easy to add new tests (just add the annotation)

**Cons:**
- ❌ If XRAY test case keys change, you must update code

**Best for:** Small to medium teams, straightforward test suites

---

### 🅑 Method 2: Tags / Labels-Based Filtering

**How it works:** XRAY test cases have labels/tags. You run only tests with matching tags.
Instead of mapping by key, you tag tests in both places.

**In JIRA XRAY:** Assign labels to test cases:
```
PROJ-101 → labels: ["smoke", "login", "sprint5"]
PROJ-102 → labels: ["regression", "login", "sprint5"]
PROJ-103 → labels: ["smoke", "login", "sprint5"]
```

**In Playwright tests:**
```typescript
// Use Playwright's built-in tag system with @ prefix
test('@smoke @login TC01: Valid login', async ({ page }) => { /* ... */ });
test('@regression @login TC02: Wrong password', async ({ page }) => { /* ... */ });
```

**Run only "smoke" tests:**
```bash
npx playwright test --grep "@smoke"
```

**Run only "sprint5" tests:**
```bash
npx playwright test --grep "@sprint5"
```

**Pros:**
- ✅ Very flexible — run any subset of tests by tag
- ✅ Natural for teams that already use labels in JIRA
- ✅ Easy to run "smoke only", "regression only", "sprint5 only"

**Cons:**
- ❌ Tags can get messy over time if not managed carefully
- ❌ The connection to a specific XRAY key is less explicit

**Best for:** Teams running different test subsets per sprint/environment

---

### 🅒 Method 3: Dynamic Mapping (Test name must match XRAY summary)

**How it works:** The framework fetches test case names from XRAY at runtime,
then matches them against Playwright test names automatically — no manual annotations needed.

**In XRAY, your test case is named:**
```
PROJ-101: "TC01 - Verify user can login with valid credentials"
```

**In Playwright, your test has the SAME name:**
```typescript
test('TC01 - Verify user can login with valid credentials', async ({ page }) => {
  // No annotation needed — name matching handles it automatically
});
```

**How the matching works:**
```
XRAY Test Cases fetched:                 Playwright Test Names:
────────────────────────                 ─────────────────────
"TC01 - Verify login..."          ←──→  "TC01 - Verify login..."  ✅ MATCH
"TC02 - Wrong password..."        ←──→  "TC02 - Wrong password..." ✅ MATCH
"TC03 - Empty fields..."          ←──→  (no match)                 ❌ NO MATCH
```

**Pros:**
- ✅ No annotations needed in test code
- ✅ XRAY is the single source of truth for test names
- ✅ Renaming in XRAY auto-updates the mapping

**Cons:**
- ❌ Test names must match EXACTLY (typos break the mapping)
- ❌ Harder to debug when things don't match
- ❌ Requires more complex setup code

**Best for:** Large teams where XRAY test case names are strictly standardized

---

### 🅓 Method 4: External Mapping File

**How it works:** A separate JSON file stores the mapping between XRAY keys and test names.
Neither the test code nor JIRA carries the mapping — it lives in its own file.

**Create a file `config/test-mapping.json`:**
```json
{
  "PROJ-101": "TC01: Valid credentials should log the user in",
  "PROJ-102": "TC02: Wrong password should show an error",
  "PROJ-103": "TC03: Empty credentials should show validation errors"
}
```

**Playwright reads this mapping and filters which tests to run:**
```typescript
// Framework reads the map and only runs tests whose names appear in the map
const mapping = require('../config/test-mapping.json');
// Tests not in the mapping are skipped automatically
```

**Pros:**
- ✅ Mapping is centralized in one easy-to-edit file
- ✅ Non-developers can edit the JSON file without touching test code
- ✅ Easy to add/remove tests from a sprint without code changes

**Cons:**
- ❌ Another file to maintain
- ❌ Easy to have stale mappings (key changed in JIRA but not in JSON)

**Best for:** Teams with a dedicated QA manager who controls what runs each sprint

---

### 📊 Comparison Summary

| Method | Who edits the mapping? | Where is the link stored? | Best for |
|--------|----------------------|---------------------------|----------|
| **A: Annotation** | Developer | Inside test code | Small teams, simple cases |
| **B: Tags/Labels** | Anyone | JIRA labels + test names | Sprint-based filtering |
| **C: Name Match** | XRAY admin | XRAY test case name | Standardized naming teams |
| **D: JSON file** | QA Manager | Separate config file | Centralized control |

> **Our framework uses Method A (Annotations) as the default** because it's
> the most transparent for beginners. But you can switch to any other method
> by modifying `tests/xray-test-fixture.ts` — all the XRAY API plumbing
> stays the same regardless of which method you choose.

---

## ▶️ Section 7 — What Happens During Test Execution

Once setup is done and the Test Execution exists in JIRA, Playwright starts running tests.

### For Each Test:

```
PLAYWRIGHT                         xray-test-fixture.ts
──────────                         ────────────────────

"Starting test: TC01..."     ──→   Reads annotation: "PROJ-101"
                                   Logs: "Test linked to XRAY: PROJ-101"
                                   Records start time

[TEST RUNS]
 - Opens browser
 - Goes to /login
 - Types email
 - Types password
 - Clicks Submit
 - Checks dashboard loads

"Test finished: PASSED"      ──→   Maps Playwright "passed" → XRAY "PASS"
                                   No screenshot needed (test passed)
                                   Saves to xray-state.json:
                                   {
                                     testCaseKey: "PROJ-101",
                                     status: "PASS",
                                     duration: 3240ms
                                   }

"Starting test: TC02..."     ──→   Reads annotation: "PROJ-102"

[TEST RUNS]
 - Opens browser
 - Goes to /login
 - Types email
 - Types WRONG password
 - Clicks Submit
 - Checks for error message
 - ❌ ERROR: Expected "Invalid" but got "Error occurred"

"Test finished: FAILED"      ──→   Maps Playwright "failed" → XRAY "FAIL"
                                   Takes screenshot of browser at failure
                                   Saves to xray-state.json:
                                   {
                                     testCaseKey: "PROJ-102",
                                     status: "FAIL",
                                     errorMessage: "Expected 'Invalid'...",
                                     screenshotPath: "test-results/TC02_FAILURE.png",
                                     duration: 4100ms
                                   }
```

### What xray-state.json looks like after all tests run:

```json
{
  "executionKey": "PROJ-789",
  "sprintNumber": "5",
  "runStartedAt": "2026-03-03T10:00:00Z",
  "results": [
    {
      "testCaseKey": "PROJ-101",
      "testName": "TC01: Valid credentials should log the user in successfully",
      "status": "PASS",
      "durationMs": 3240,
      "startedAt": "2026-03-03T10:00:05Z",
      "finishedAt": "2026-03-03T10:00:08Z"
    },
    {
      "testCaseKey": "PROJ-102",
      "testName": "TC02: Wrong password should show an error message",
      "status": "FAIL",
      "errorMessage": "Expected error message to contain 'Invalid' but found 'Error occurred'",
      "screenshotPath": "/project/test-results/screenshots/TC02_FAILURE_2026-03-03.png",
      "durationMs": 4100,
      "startedAt": "2026-03-03T10:00:09Z",
      "finishedAt": "2026-03-03T10:00:13Z"
    },
    {
      "testCaseKey": "PROJ-104",
      "testName": "TC04: GET /posts/1 should return status 200 and valid post data",
      "status": "PASS",
      "durationMs": 820,
      "startedAt": "2026-03-03T10:00:14Z",
      "finishedAt": "2026-03-03T10:00:15Z"
    }
  ]
}
```

---

## 📤 Section 8 — How Results Are Uploaded Back to JIRA XRAY

This is **ACT 3 — the teardown phase**. After ALL tests finish, `global-teardown.ts` runs.

### Step-by-Step Upload Process:

```
TEARDOWN                                    JIRA XRAY
────────                                    ─────────

Step 1: Read xray-state.json
        Got: executionKey = "PROJ-789"
             3 results to upload

Step 2: For PROJ-101 (PASS):
        "Update status of PROJ-101
         in execution PROJ-789
         to: PASS"                     ─────────────→  PROJ-789
                                                        └─ PROJ-101: ✅ PASS

Step 3: For PROJ-102 (FAIL):
        "Update status of PROJ-102
         in execution PROJ-789
         to: FAIL"                     ─────────────→  PROJ-789
                                                        └─ PROJ-102: ❌ FAIL

        "Attach screenshot to
         PROJ-102's test run"          ─────────────→  PROJ-789
          [TC02_FAILURE.png]                           └─ PROJ-102: ❌ FAIL
                                                           └─ 📎 TC02_FAILURE.png

Step 4: For PROJ-103 (PASS):
        "Update PROJ-103 to: PASS"     ─────────────→  PROJ-789
                                                        └─ PROJ-103: ✅ PASS

Step 5: Final summary logged:
        ✅ Passed:  2
        ❌ Failed:  1
        View: https://company.atlassian.net/browse/PROJ-789

Step 6: Delete xray-state.json
        (cleanup for next run)
```

### What JIRA XRAY Shows After Teardown:

```
PROJ-789: "Sprint 5 — Playwright Run [03-Mar-2026]"
Status: DONE
─────────────────────────────────────────────────────
│ Test Case  │ Summary                            │ Type │ Result │
├────────────┼────────────────────────────────────┼──────┼────────┤
│ PROJ-101   │ TC01: Valid login test              │ UI   │ ✅ PASS│
│ PROJ-102   │ TC02: Wrong password test           │ UI   │ ❌ FAIL│ ← click to see screenshot
│ PROJ-103   │ TC03: Empty fields test             │ UI   │ ✅ PASS│
│ PROJ-104   │ TC04: GET /posts/1 returns 200      │ API  │ ✅ PASS│
│ PROJ-105   │ TC05: POST /posts creates resource  │ API  │ ✅ PASS│
│ PROJ-106   │ TC06: GET /users/1 returns data     │ API  │ ✅ PASS│
└────────────┴────────────────────────────────────┴──────┴────────┘
```

After the XRAY upload, the HTML execution report is automatically generated:
```
reports/execution-report-2026-03-03.html
├─ Summary: 6 tests | 5 passed | 1 failed | 3 🖥️ UI | 3 🔌 API | pass rate 83%
├─ 3D Relationship Graph: interactive force-directed graph linking tests → pages → APIs → assertions
├─ Charts: pass/fail donut, type breakdown, duration bar, a11y issues
├─ Observability: network requests, transfer size, page load, FCP/LCP
├─ Results table with per-test badges, start time, duration, screenshot
└─ Step log accordion: expand any test to see every log entry
```

---

## 🗂️ Section 9 — Which File Does What? (Plain English)

| File | What it does (no code terms) |
|------|------------------------------|
| `.env` | Your private settings file — JIRA URL, username, API token, sprint number |
| `config/environment.ts` | Reads your `.env` file and makes the settings available to the rest of the project |
| `utils/jira-xray/jira-auth.ts` | The "security guard" — creates a connection to JIRA using your credentials |
| `utils/jira-xray/xray-test-set.ts` | The "librarian" — fetches the list of test cases from a XRAY Test Set |
| `utils/jira-xray/xray-test-execution.ts` | The "reporter" — creates a new result sheet (Test Execution) in JIRA for this run |
| `utils/jira-xray/xray-result-updater.ts` | The "grader" — marks each test as PASS or FAIL in JIRA and attaches screenshots |
| `utils/jira-xray/xray-state.ts` | The "sticky note" — saves the Execution ID and results between steps |
| `utils/reporting/report-generator.ts` | The "publisher" — builds the HTML report with charts, screenshots, and step logs |
| `utils/helpers/enhanced-logger.ts` | The "data collector" — gathers structured log/perf/a11y data + PASS/FAIL log summary |
| `utils/helpers/logger.ts` | The "announcer" — prints formatted, coloured messages in the terminal |
| `utils/helpers/test-data-loader.ts` | The "librarian" — reads test input data from YAML files so tests don't hardcode values; supports `run: yes/no` toggle |
| `utils/helpers/screenshot.ts` | The "photographer" — captures a browser screenshot when a test fails |
| `test-data/*.yaml` | The "answer sheets" — 2 YAML files (`ui-tests.yaml` + `api-tests.yaml`) with test inputs, expected results, and `run: yes/no` toggle |
| `logs/test-run-*.log` | The "diary" — log file for each run, with a PASS/FAIL summary at the very top |
| `tests/global-setup.ts` | The "pre-flight checklist" — runs once before any test (auth, fetch, create execution) |
| `tests/global-teardown.ts` | The "cleanup crew" — runs once after all tests (uploads results, generates report) |
| `tests/xray-test-fixture.ts` | The "score tracker" — wraps every test to save its result automatically |
| `tests/login.test.ts` | The UI tests — 3 browser-based login tests |
| `tests/api.test.ts` | The API tests — 3 REST API tests that don't use a browser |
| `tests/playwright-dev.test.ts` | The navigation tests — 5 playwright.dev tests |
| `tests/salesforce-iframe.test.ts` | The iframe tests — 2 Salesforce-style multi-iframe tests |
| `pages/BasePage.ts` | The "toolbox" — common browser actions (click, type, navigate, **iframe helpers**) every page can use |
| `pages/LoginPage.ts` | The "login page expert" — knows exactly where the username, password, and Login button are |
| `pages/SalesforceIframePage.ts` | The "iframe expert" — demonstrates filling forms inside iframes |
| `playwright.config.ts` | The "control room" — tells Playwright which browser to use, how many tests to run in parallel, etc. |

---

## 🚶 Section 10 — First Time Setup: Your Step-by-Step Checklist

Follow these steps in order. Tick each one off before moving to the next.

```
□ Step 1: Install Node.js
          Go to https://nodejs.org → Download "LTS" → Install
          Verify: Open Terminal, type: node --version
          Should show: v18.x.x or higher

□ Step 2: Open the project folder in your Terminal
          Mac: Open Terminal → type: cd /path/to/your/project
          Windows: Open Command Prompt → type: cd C:\path\to\your\project

□ Step 3: Install project libraries
          Type: npm install
          Wait for it to finish (may take 1-2 minutes)

□ Step 4: Install the Chrome browser for Playwright
          Type: npx playwright install chromium

□ Step 5: Create your environment file
          Type: cp .env.example .env
          (This copies the template — you'll fill it in next)

□ Step 6: Fill in your .env file
          Open .env in any text editor (Notepad, TextEdit, VS Code)
          Replace each placeholder with your real values:

          JIRA_BASE_URL        → e.g. https://mycompany.atlassian.net
          JIRA_USERNAME        → e.g. john.doe@mycompany.com
          JIRA_API_TOKEN       → (generate from JIRA profile settings)
          XRAY_PROJECT_KEY     → e.g. PROJ
          XRAY_TEST_SET_ID     → e.g. PROJ-456
          XRAY_SPRINT_NUMBER   → e.g. 5
          BASE_URL             → e.g. https://myapp.staging.com

□ Step 7: In your test file (tests/login.test.ts)
          Find each annotation like:
            annotation: { type: 'xray', description: 'PROJ-101' }
          Change 'PROJ-101' to your ACTUAL XRAY test case keys

□ Step 8: Run the tests!
          Type: npm test
```

---

## 💡 Section 11 — Understanding Test Results in Your Terminal

When tests run, the terminal shows messages like this. Here's what each means:

```
──────────────────────────────────────────────────────────
  🚀 GLOBAL SETUP — Starting XRAY Integration
──────────────────────────────────────────────────────────
  ↑ The setup phase is starting

✅ [JIRA Auth] Connected successfully as: John Doe
  ↑ Your JIRA credentials worked — you're logged in

📋 [XRAY] Fetching test cases from Test Set: PROJ-456...
  ↑ Framework is asking JIRA for the list of tests to run

✅ Loaded 3 test case(s) from "Login Feature Tests"
  ↑ JIRA responded with 3 test cases

🚀 [XRAY] Creating Test Execution for Sprint 5...
  ↑ Framework is creating the result sheet in JIRA

✅ Test Execution created: PROJ-789
  ↑ JIRA created the ticket — you can open PROJ-789 in JIRA now!

──────────────────────────────────────────────────────────

📎 Test linked to XRAY: PROJ-101
  ↑ This test is about to run and is linked to JIRA ticket PROJ-101

▶ STEP   Step 1: Navigate to the login page
▶ STEP   Step 2: Enter valid credentials and submit
▶ STEP   Step 3: Verify user is now logged in
  ↑ Each step in the test (what the browser is doing right now)

✅ PASS   TC01 | XRAY: PROJ-101
  ↑ Test PASSED — PROJ-101 will be marked PASS in JIRA

──────────────────────────────────────────────────────────

❌ FAIL   TC02 | XRAY: PROJ-102
          Error: Expected text to contain 'Invalid' but found 'Error occurred'
  ↑ Test FAILED — PROJ-102 will be marked FAIL, screenshot will be attached

📸 Screenshot saved: TC02_FAILURE_2026-02-28T10-05-00.png
  ↑ A picture of what the browser showed when it failed — saved to disk

──────────────────────────────────────────────────────────
  📊 FINAL XRAY EXECUTION STATUS
  Execution: PROJ-789
  Sprint: 5
  ✅ Passed:  2
  ❌ Failed:  1
  View: https://company.atlassian.net/browse/PROJ-789
──────────────────────────────────────────────────────────
  ↑ All done! Open PROJ-789 in JIRA to see full results with evidence
```

---

## ❓ Section 12 — Frequently Asked Questions

**Q: What do I do MANUALLY vs what does Playwright do AUTOMATICALLY?**
> **You do manually (one time):**
> 1. Create Test Cases in JIRA XRAY (e.g., PROJ-101, PROJ-102)
> 2. Create a Test Set in JIRA XRAY (e.g., PROJ-456)
> 3. Add the Test Cases to the Test Set
> 4. Put the Test Set ID in `.env` (`XRAY_TEST_SET_ID=PROJ-456`)
> 5. Write the Playwright test with the annotation: `annotation: { type: 'xray', description: 'PROJ-101' }`
>
> **Playwright does automatically (every `npm test`):**
> 1. Authenticates with JIRA
> 2. Fetches test cases from the Test Set
> 3. Creates a new Test Execution ticket in JIRA
> 4. Runs all tests
> 5. Uploads PASS/FAIL results to JIRA
> 6. Attaches failure screenshots to JIRA
> 7. Generates the HTML report

---

**Q: I'm not a developer. Do I need to write code?**
> No! Once the framework is set up by a developer, your job is to:
> 1. Maintain test cases in JIRA XRAY (no code needed)
> 2. Update the `.env` file with the correct sprint number
> 3. Run `npm test` in the terminal
> The framework does everything else.

---

**Q: What if I don't have JIRA or XRAY?**
> The tests will still run! Playwright tests work independently.
> When JIRA connection fails, the framework logs a warning and skips the
> XRAY integration — tests run and results appear only in the terminal
> and the HTML report, but NOT in JIRA.

---

**Q: How do I add a new test for a new XRAY test case?**
> 1. **In JIRA (manual):** Create the test case (e.g., PROJ-110) with Issue Type = "Test"
> 2. **In JIRA (manual):** Open your Test Set (PROJ-456) and add PROJ-110 to it
> 3. **In code:** Open `tests/login.test.ts` (or create a new `.test.ts` file)
> 4. **In code:** Copy an existing test block and change:
>    - The test description (e.g., `'TC07: My new scenario'`)
>    - The annotation key to `'PROJ-110'`
>    - The test steps to match what PROJ-110 tests
> 5. **Run:** `npm test` — PROJ-110 will now report to JIRA automatically
>
> See **[CAPABILITIES.md → JIRA XRAY Integration](CAPABILITIES.md#-jira-xray-integration)**
> for the complete step-by-step guide with screenshots and best practices.

---

**Q: Can two Playwright tests map to the same XRAY test case?**
> Technically yes, but it's not recommended. The second result will
> overwrite the first in JIRA. Use one Playwright test per XRAY test case.

---

**Q: What is the HTML report and how do I see it?**
> After running tests, open the file `reports/execution-report-YYYY-MM-DD.html` in any browser.
> A new report is generated automatically after every `npm test` run.
> It shows:
> - Summary cards: total, passed, failed, pass rate, duration, UI count, API count
> - Charts: pass/fail donut, test type breakdown, duration bar, a11y issues
> - Results table with 🖥️ UI / 🔌 API badge per test, screenshots for failures (click to zoom)
> - Step log accordion: expand any test to see every single action step
> - Observability dashboard: performance metrics, network stats, page load times
> - Full XRAY integration status and links (or demo-mode explanation if JIRA not configured)
>
> See **[CAPABILITIES.md → HTML Execution Report](CAPABILITIES.md#-html-execution-report)** for full details on every report section.

---

**Q: How often should I update XRAY_SPRINT_NUMBER in .env?**
> Every sprint! Before starting a new sprint's test run, open `.env` and
> change the number. This ensures each sprint gets its own Test Execution
> in JIRA with a unique name.

---

**Q: What if JIRA is down when I run tests?**
> The global setup will fail and tests won't run. You'll see a clear error:
> `❌ GLOBAL SETUP FAILED: Cannot connect to JIRA!`
> Wait for JIRA to come back up, or temporarily disable the JIRA integration
> by setting `XRAY_TEST_SET_ID=SKIP` in `.env` (the framework detects this
> and skips XRAY entirely, letting tests run without JIRA).

---

## 📞 Section 13 — Who to Contact for What

| Problem | Who to ask |
|---------|-----------|
| Can't log into JIRA | IT / JIRA admin |
| API token not working | Generate a new one in JIRA profile settings |
| Need to create new Test Cases in XRAY | QA lead — create them in JIRA with Issue Type = "Test" |
| Need to create or update a Test Set | QA lead — create/update in JIRA with Issue Type = "Test Set" |
| Test case key is wrong in annotation | QA lead — check the JIRA ticket ID |
| Test is failing but it shouldn't be | Developer — look at screenshot in JIRA or HTML report |
| Need a new page object (new page to test) | Developer — create new file in `pages/` |
| XRAY Test Set is wrong | QA lead — check `XRAY_TEST_SET_ID` in `.env` |
| New sprint starting | QA lead — update `XRAY_SPRINT_NUMBER` in `.env` |
| Want to run only specific tests | Use `npm run test:login` or tags approach |

---

*Last updated: 4 March 2026*
*Framework: Playwright AutoAgent – AI Automation Framework v1.4.0 — 13 tests (3 Login + 3 API + 5 Navigation + 2 Iframe), full HTML report, comprehensive XRAY integration*
*Next: Read [CAPABILITIES.md](CAPABILITIES.md) to explore every feature, or [WRITE_A_TEST.md](WRITE_A_TEST.md) to write your first test.*
