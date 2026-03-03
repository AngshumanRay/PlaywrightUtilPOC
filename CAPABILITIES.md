# 🧰 CAPABILITIES — What Can This Framework Do?

### A Plain-English Guide for Absolute Beginners (Zero Coding Knowledge Required)

---

> **Who is this for?**
> You just joined the team. Someone told you "we use this Playwright framework."
> You opened the project and thought: *"What does this thing actually do? What's available to me?"*
>
> This document answers that question. Every capability is explained like you're 5.

---

## 📚 Table of Contents

1. [The One-Sentence Summary](#the-one-sentence-summary)
2. [All Capabilities at a Glance](#all-capabilities-at-a-glance)
3. [🌐 Browser Testing (Playwright)](#-browser-testing-playwright)
4. [📋 JIRA XRAY Integration](#-jira-xray-integration)
4. [🗃️ Database / Test Data](#️-database--test-data)
5. [📧 Email Verification](#-email-verification)
6. [🌐 API Testing Helper](#-api-testing-helper)
9. [📸 Screenshot Capture](#-screenshot-capture)
10. [📝 Logger](#-logger)
11. [🍪 Cookie & Popup Handling](#-cookie--popup-handling)
12. [How to Add Your OWN New Utility](#how-to-add-your-own-new-utility)
13. [Which File Does What (Cheat Sheet)](#which-file-does-what-cheat-sheet)
14. [How to Enable/Disable Any Utility](#how-to-enabledisable-any-utility)

---

## The One-Sentence Summary

This framework opens a web browser, tests your website like a human would,
and then tells JIRA (and optionally Database, Email) what happened.

---

## All Capabilities at a Glance

Here's everything this framework can do, at a glance:

```
┌──────────────────────────────────────────────────────────────────────────┐
│                     🧰 FRAMEWORK CAPABILITIES                            │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  🟢 ACTIVE (works out of the box):                                       │
│     ✅ Browser Testing — open Chrome, click, type, verify things         │
│     ✅ Page Objects    — organized code for each page of your website    │
│     ✅ Screenshots     — automatic photos of the browser on failure      │
│     ✅ Logger          — color-coded terminal messages with timestamps   │
│     ✅ Cookie/Popup    — auto-dismisses cookie banners and browser popups│
│     ✅ HTML Report     — beautiful visual report after every test run    │
│                                                                          │
│  🟡 READY (just add credentials in .env to activate):                    │
│     📋 JIRA XRAY      — fetch test cases, create executions, push results│
│     🗃️ Database        — seed test data before, clean up after           │
│     📧 Email           — check test mailbox for OTPs, reset links, etc. │
│     🌐 API Helper      — call your backend APIs from inside tests        │
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

### Where is the code?
- `pages/BasePage.ts` — reusable actions (click, fill, navigate, wait)
- `pages/LoginPage.ts` — login-specific actions (an example page)
- `tests/login.test.ts` — actual tests that use the page objects

---

## 📋 JIRA XRAY Integration

### What is it?
JIRA is where your team tracks work. XRAY is a plugin that adds test management.
This integration connects your automated tests to JIRA so that:
- Test cases are pulled from JIRA automatically
- A Test Execution is created in JIRA for each run
- PASS/FAIL results + screenshots are pushed back to JIRA

### What can it do?

| Action | When | What Happens |
|--------|------|-------------|
| Fetch test cases | Before tests | Reads your Test Set (e.g., PROJ-456) and gets all test case IDs |
| Create Test Execution | Before tests | Creates a new JIRA ticket (e.g., PROJ-789) to hold results |
| Save PASS/FAIL | After each test | Records whether each test passed or failed |
| Upload to JIRA | After all tests | Sends all results to JIRA so your team can see them |
| Attach screenshots | After all tests | Failed tests get their screenshot attached in JIRA |

### How to enable it?
Fill in these values in your `.env` file:

```env
JIRA_BASE_URL=https://your-company.atlassian.net
JIRA_USERNAME=your-email@company.com
JIRA_API_TOKEN=your-api-token          ← Get this from Atlassian account settings
XRAY_PROJECT_KEY=PROJ                  ← The short code in your ticket numbers
XRAY_TEST_SET_ID=PROJ-456             ← The Test Set containing your test cases
XRAY_SPRINT_NUMBER=5                   ← Current sprint number
```

### How do I link a test to an XRAY test case?
Add this one line inside your test:

```typescript
test('My test name', {
  annotation: { type: 'xray', description: 'PROJ-101' },  // ← THIS LINE
}, async ({ page }) => {
  // your test code here
});
```

That `'PROJ-101'` is the JIRA ticket ID of the test case in XRAY. Change it
to match YOUR test case ID.

### What if I DON'T configure JIRA?
Nothing breaks. You see this friendly message and tests run normally:

```
⚠️  JIRA credentials are still set to placeholder values in .env.
   Skipping JIRA/XRAY integration — Playwright tests will still run.
```

### Where is the code?
- `utils/jira-xray/jira-auth.ts` — connects to JIRA
- `utils/jira-xray/xray-test-set.ts` — fetches test cases
- `utils/jira-xray/xray-test-execution.ts` — creates test execution
- `utils/jira-xray/xray-result-updater.ts` — uploads results
- `utils/jira-xray/xray-state.ts` — shared file that passes data between phases

---

## 🗃️ Database / Test Data

### What is it?
Some tests need data to already exist in the database BEFORE the test runs.
For example:
- A test that checks "View Order History" needs orders to exist first
- A test that checks "Login" might need a specific user created first

This utility lets you:
- **SEED** (insert) test data before tests start
- **QUERY** (check) data during tests
- **CLEANUP** (delete) test data after tests finish

### What databases does it support?
It's designed to work with ANY database. You just plug in your connection code:
- PostgreSQL ✅
- MySQL ✅
- MongoDB ✅
- SQLite ✅
- Any other database with a Node.js driver ✅

### How to enable it?

```env
DB_ENABLED=true
DB_HOST=your-database-server.com
DB_PORT=5432
DB_NAME=your_test_database
DB_USER=your_db_username
DB_PASSWORD=your_db_password
```

### How to use it in code?

```typescript
// SEED: Create test data before tests
import { seedTestData } from '../utils';

await seedTestData('users', {
  username: 'testuser_automation',
  email: 'test@automation.com',
}, 'Test user for login tests');

// QUERY: Check data during tests
import { queryTestData } from '../utils';

const result = await queryTestData('orders', { userId: '12345' });

// CLEANUP happens automatically in global-teardown.ts
// (deletes everything that was seeded)
```

### What if I DON'T configure the database?
Nothing breaks. Database operations are silently skipped.

### Where is the code?
- `utils/database/test-data-manager.ts`

### ⚠️ Important: You need to add your database driver
The file has placeholder comments showing EXACTLY where to plug in your
PostgreSQL/MySQL/MongoDB code. Search for `🔌 PLUG YOUR DATABASE CLIENT HERE`
in the file.

---

## 📧 Email Verification

### What is it?
Some tests involve email. For example:
- "Forgot Password" sends a reset link via email
- "Sign Up" sends a verification code (OTP) via email
- "Two-Factor Auth" sends a 6-digit code via email

This utility lets your tests:
- **Wait for an email** to arrive at a test inbox
- **Extract a verification code** (like `482901`) from the email
- **Extract a link** (like `https://app.com/reset?token=abc`) from the email

### How does it work?
You CAN'T open Gmail/Outlook from a Playwright test. Instead, you use a
**test mailbox service** — a special email inbox with an API that code can read.

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
  // 4. Navigate to the reset link
  await page.goto(resetLink!);
}

// OR: Extract a 6-digit OTP code
const code = extractVerificationCode(result.email!.body, 6);
// code = "482901"
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

### What is it?
Sometimes your test needs to talk to the backend server directly — not through
the browser UI. This is called "API testing." Common reasons:

- **Before a test:** Create test data via API (faster than clicking through UI)
- **During a test:** Verify something happened on the server side
- **After a test:** Clean up data via API

### What can it do?

| Method | What it does | Example |
|--------|-------------|---------|
| `apiGet(url)` | Read data | "Get me the list of users" |
| `apiPost(url, data)` | Create data | "Create a new order with these items" |
| `apiPut(url, data)` | Update data | "Change this user's name to Jane" |
| `apiDelete(url)` | Delete data | "Delete test user #12345" |

### How to use it in code?

```typescript
import { apiGet, apiPost, apiDelete } from '../utils';

// GET: Fetch data from an API
const users = await apiGet('/api/users');
// users.data = [{ id: 1, name: "John" }, { id: 2, name: "Jane" }]

// POST: Create something via API
const newOrder = await apiPost('/api/orders', {
  item: 'Widget',
  quantity: 5,
  price: 9.99,
});
// newOrder.data = { id: 42, item: "Widget", status: "created" }

// DELETE: Clean up after your test
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

### Where is the code?
- `utils/api/api-helper.ts`

---

## 📸 Screenshot Capture

### What is it?
Takes a photo of what the browser is showing at any moment. Screenshots are
the #1 debugging tool — when a test fails, the screenshot shows you exactly
what the user would have seen.

### When are screenshots taken?
- **Automatically on failure** — the framework captures a screenshot whenever a
  test fails (you don't need to do anything)
- **Manually in your test** — you can capture screenshots at any point

### How to use it in code?

```typescript
import { captureScreenshot } from '../utils';

// Take a screenshot at any point in your test
await captureScreenshot(page, 'my-test', 'after-login');
// Saves to: test-results/screenshots/my-test_after-login_2026-03-01T04-55-00.png
```

### Where are screenshots saved?
`test-results/screenshots/` — this folder is created automatically.

### Where is the code?
- `utils/helpers/screenshot.ts`

---

## 📝 Logger

### What is it?
Prints formatted, color-coded messages in the terminal so you can follow
what's happening during the test run. Much better than plain `console.log()`.

### What do the messages look like?

```
[2026-03-01 04:55:10] ℹ INFO   Page loaded: The Internet        ← blue, informational
[2026-03-01 04:55:10] ▶ STEP   Clicking: Login button            ← blue, action step
[2026-03-01 04:55:10] ✅ PASS  TC01 passed — Login successful    ← green, success
[2026-03-01 04:55:10] ❌ FAIL  TC02 — Wrong error message shown  ← red, failure
[2026-03-01 04:55:10] ⚠ WARN   JIRA not configured, skipping     ← yellow, warning
```

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

### Where is the code?
- `utils/helpers/logger.ts`

---

## 🍪 Cookie & Popup Handling

### What is it?
Many websites show annoying popups that block your tests:
- Cookie consent banners ("Accept All Cookies")
- Browser alerts/confirms/prompts (JavaScript popups)

This framework handles BOTH automatically. You don't need to do anything.

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
No. This is always active automatically.

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
| **`tests/global-teardown.ts`** | Runs ONCE after tests — XRAY upload, DB cleanup |
| **`tests/xray-test-fixture.ts`** | Wraps every test with XRAY reporting + popup handling |
| **`tests/login.test.ts`** | The actual test cases (your click/type/verify steps) |
| **`pages/BasePage.ts`** | Reusable browser actions — click, fill, navigate, wait |
| **`pages/LoginPage.ts`** | Login page specific actions — enter username, click login |
| **`utils/jira-xray/*.ts`** | Everything JIRA/XRAY — auth, fetch tests, create execution, upload results |
| **`utils/database/test-data-manager.ts`** | Seeds and cleans up test data in your database |
| **`utils/email/email-verifier.ts`** | Waits for emails, extracts OTP codes and links |
| **`utils/api/api-helper.ts`** | Makes GET/POST/PUT/DELETE API calls |
| **`utils/helpers/logger.ts`** | Color-coded terminal logging |
| **`utils/helpers/screenshot.ts`** | Captures browser screenshots |
| **`utils/index.ts`** | Barrel file — import anything from one place |
| **`playwright.config.ts`** | Playwright settings (browsers, timeouts, retries) |

---

## How to Enable/Disable Any Utility

Every utility is controlled by your `.env` file. Here's the master switch for each:

| Utility | How to Enable | How to Disable |
|---------|--------------|----------------|
| **Playwright** | Always on (it's the core) | Can't disable |
| **JIRA XRAY** | Set real values for `JIRA_BASE_URL`, `JIRA_USERNAME`, `JIRA_API_TOKEN` | Leave the placeholder values |
| **Database** | Set `DB_ENABLED=true` + fill connection details | Set `DB_ENABLED=false` |
| **Email** | Set `EMAIL_ENABLED=true` + fill API key | Set `EMAIL_ENABLED=false` |
| **API Helper** | Set `API_BASE_URL` (optional — defaults to `BASE_URL`) | Leave empty |
| **Screenshots** | Always on automatically | Can't disable |
| **Logger** | Always on automatically | Can't disable |
| **Cookie handling** | Always on automatically | Can't disable |

### The Golden Rule

> **If you don't configure it, it won't run. If it won't run, it won't crash.**
>
> Every utility checks itself before doing anything. No configuration = no action = no error.

---

*Last updated: 1 March 2026*
*Framework: Playwright + JIRA XRAY + Multi-Utility Architecture*
