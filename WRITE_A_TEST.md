# ✍️ How to Write a New Test Case
### A Plain-English Guide for People Who Have Never Written Code

---

> **Estimated time to write your first test: 10–15 minutes.**
> Just follow the numbered steps below. Each step tells you exactly what to type.

---

## ⚡ 60-Second Summary — What You're Going to Do

```
1. Create a new file in the "tests" folder         (30 seconds)
2. Paste a ready-made template into the file        (10 seconds)
3. Change 4 things: feature name, test name,
   XRAY ID, and the test steps                      (5–10 minutes)
4. Run: npm test                                    (30 seconds)
5. Done! Open the HTML report to see your result    ✅
```

---

## 🚫 What You Do NOT Need to Know

| You do NOT need to know | Why not |
|---|---|
| TypeScript or JavaScript | You'll copy-paste building blocks — no coding from scratch |
| What XRAY or JIRA is | It's optional. Tests work without it. See [CAPABILITIES.md](CAPABILITIES.md#-jira-xray-integration) if curious |
| What a database or API is | Not needed for writing a browser test |
| How automation works | The framework handles all the hard parts for you |

**You only need to know:**
- Which web page you want to test (a URL like `https://myapp.com/login`)
- What a person would click and type on that page
- What should appear on screen when it works correctly

---

## 📖 Step 1 — Create a New File

Open the `tests/` folder in VS Code (or any text editor).

Create a new file. Name it after the feature you're testing:

```
tests/checkout.test.ts        ← for a checkout feature
tests/registration.test.ts    ← for a registration feature
tests/search.test.ts          ← for a search feature
```

> ⚠️ **The file name MUST end in `.test.ts`** — Playwright only runs files
> with that exact ending. No `.test.ts` = your test won't run.
>
> ✅ `tests/checkout.test.ts`
> ❌ `tests/checkout.ts`
> ❌ `tests/test-checkout.ts`

---

## 📖 Step 2 — Paste This Template Into Your New File

Copy everything below and paste it into your new file.
Don't change anything yet — we'll do that in the next steps.

```typescript
import { test, expect } from './xray-test-fixture';
import { enhancedLogger } from '../utils/helpers/enhanced-logger';

test.describe('CHANGE ME: Your Feature Name', () => {

  test('CHANGE ME: TC01: What this test checks', {
    annotation: { type: 'xray', description: 'PROJ-101' },
  }, async ({ page, xrayTestKey }) => {

    enhancedLogger.step('Step 1: CHANGE ME', xrayTestKey);
    // Your action for step 1 goes here

    enhancedLogger.step('Step 2: CHANGE ME', xrayTestKey);
    // Your action for step 2 goes here

    enhancedLogger.step('Step 3: CHANGE ME', xrayTestKey);
    // Your check goes here

    enhancedLogger.pass('TC01 passed — CHANGE ME', xrayTestKey);

  });

});
```

Your file should now have exactly 22 lines. Save it.

---

## 📖 Step 3 — Change the Feature Name (Line 4)

Find this line:
```typescript
test.describe('CHANGE ME: Your Feature Name', () => {
```

Change the text inside the quotes to your feature name:
```typescript
test.describe('Checkout Feature Tests', () => {
```

**More examples:**
```
'Login Feature Tests'
'Search Feature Tests'
'Registration Feature Tests'
'Dashboard Feature Tests'
```

---

## 📖 Step 4 — Change the Test Name (Line 6)

Find this line:
```typescript
  test('CHANGE ME: TC01: What this test checks', {
```

Change it to describe what your test does:
```typescript
  test('TC01: Valid user should be able to complete checkout', {
```

**Good test names follow this pattern:**

> **TC##: [Who] should [do what] when [condition]**

| Good ✅ | Bad ❌ |
|---------|--------|
| `TC01: Guest user should see login prompt when clicking Checkout` | `test checkout` |
| `TC02: Valid payment should show Order Confirmed` | `tc2` |
| `TC03: Empty cart should show "Your cart is empty"` | `test 3 - cart` |

---

## 📖 Step 5 — Set the XRAY Test Case ID (Line 7)

Find this line:
```typescript
    annotation: { type: 'xray', description: 'PROJ-101' },
```

**If you have a JIRA XRAY test case:** Change `'PROJ-101'` to your real JIRA ticket ID:
```typescript
    annotation: { type: 'xray', description: 'PROJ-210' },
```

**If you DON'T have JIRA yet:** Leave it as `'PROJ-101'` or change it to any label:
```typescript
    annotation: { type: 'xray', description: 'TC-001' },
```

> The test runs fine either way. This ID only matters if JIRA is connected.
> When JIRA IS connected, Playwright will automatically mark this test case
> as PASS or FAIL in JIRA — no manual work needed.
>
> Want to know more? See [CAPABILITIES.md → JIRA XRAY Integration](CAPABILITIES.md#-jira-xray-integration).

---

## 📖 Step 6 — Write Your Test Steps

This is the main part. Think about what a **real person** would do on the website,
then translate each human action into one line of code.

### How to think about it:

```
WHAT A HUMAN DOES                          WHAT YOU TYPE IN THE TEST
─────────────────                          ──────────────────────────
"I go to the login page"          →        await page.goto('https://myapp.com/login');
"I type my email"                 →        await page.getByLabel('Email').fill('test@test.com');
"I type my password"              →        await page.getByLabel('Password').fill('secret123');
"I click the Login button"        →        await page.getByRole('button', { name: 'Login' }).click();
"I see 'Welcome back!' on screen" →        await expect(page.getByText('Welcome back!')).toBeVisible();
```

### Here's how your template looks BEFORE and AFTER:

**BEFORE (template with placeholders):**
```typescript
    enhancedLogger.step('Step 1: CHANGE ME', xrayTestKey);
    // Your action for step 1 goes here

    enhancedLogger.step('Step 2: CHANGE ME', xrayTestKey);
    // Your action for step 2 goes here

    enhancedLogger.step('Step 3: CHANGE ME', xrayTestKey);
    // Your check goes here

    enhancedLogger.pass('TC01 passed — CHANGE ME', xrayTestKey);
```

**AFTER (real test steps):**
```typescript
    enhancedLogger.step('Step 1: Go to the login page', xrayTestKey);
    await page.goto('https://the-internet.herokuapp.com/login');

    enhancedLogger.step('Step 2: Enter username and password', xrayTestKey);
    await page.getByLabel('Username').fill('tomsmith');
    await page.getByLabel('Password').fill('SuperSecretPassword!');

    enhancedLogger.step('Step 3: Click the Login button', xrayTestKey);
    await page.getByRole('button', { name: 'Login' }).click();

    enhancedLogger.step('Step 4: Check the success message appears', xrayTestKey);
    await expect(page.getByText('You logged into a secure area!')).toBeVisible();

    enhancedLogger.pass('TC01 passed — User logged in successfully', xrayTestKey);
```

> **Tip:** You can have as many steps as you need. Just add more
> `enhancedLogger.step(...)` lines followed by the actions.

---

## 📖 Step 7 — Run Your Test

Open a terminal and type:

```bash
npm test
```

Or to run ONLY your new file:
```bash
npx playwright test tests/checkout.test.ts
```

After it finishes, open the report in the `reports/` folder:
```
reports/execution-report-2026-03-03.html
```

Just double-click it — it opens in any browser.

---

## 📖 Step 8 — Add More Tests to the Same File (Optional)

To add a second test, copy the `test(...)` block and paste it below the first one.
Change the test name, XRAY ID, and steps.

```typescript
import { test, expect } from './xray-test-fixture';
import { enhancedLogger } from '../utils/helpers/enhanced-logger';

test.describe('Login Feature Tests', () => {

  // ── TEST 1 ──────────────────────────────────────────
  test('TC01: Valid login should show the dashboard', {
    annotation: { type: 'xray', description: 'PROJ-101' },
  }, async ({ page, xrayTestKey }) => {
    enhancedLogger.step('Step 1: Go to login page', xrayTestKey);
    await page.goto('https://myapp.com/login');

    enhancedLogger.step('Step 2: Enter valid credentials', xrayTestKey);
    await page.getByLabel('Email').fill('user@test.com');
    await page.getByLabel('Password').fill('correct-password');

    enhancedLogger.step('Step 3: Click Login', xrayTestKey);
    await page.getByRole('button', { name: 'Login' }).click();

    enhancedLogger.step('Step 4: Verify dashboard loads', xrayTestKey);
    await expect(page.getByText('Welcome back!')).toBeVisible();

    enhancedLogger.pass('TC01 passed — Login worked', xrayTestKey);
  });

  // ── TEST 2 ──────────────────────────────────────────
  test('TC02: Wrong password should show an error', {
    annotation: { type: 'xray', description: 'PROJ-102' },
  }, async ({ page, xrayTestKey }) => {
    enhancedLogger.step('Step 1: Go to login page', xrayTestKey);
    await page.goto('https://myapp.com/login');

    enhancedLogger.step('Step 2: Enter wrong password', xrayTestKey);
    await page.getByLabel('Email').fill('user@test.com');
    await page.getByLabel('Password').fill('wrong-password');

    enhancedLogger.step('Step 3: Click Login', xrayTestKey);
    await page.getByRole('button', { name: 'Login' }).click();

    enhancedLogger.step('Step 4: Verify error message appears', xrayTestKey);
    await expect(page.getByText('Invalid password')).toBeVisible();

    enhancedLogger.pass('TC02 passed — Error shown correctly', xrayTestKey);
  });

});
```

---

## 🎓 Complete Working Example

This is a **real test** from this project that actually runs
against https://the-internet.herokuapp.com/login.

```typescript
// File: tests/my-first-test.test.ts

import { test, expect } from './xray-test-fixture';
import { enhancedLogger } from '../utils/helpers/enhanced-logger';

test.describe('Login Feature Tests', () => {

  test('TC01: Valid credentials should log the user in successfully', {
    annotation: { type: 'xray', description: 'PROJ-101' },
  }, async ({ page, xrayTestKey }) => {

    // Step 1: Open the login page
    enhancedLogger.step('Step 1: Navigate to the login page', xrayTestKey);
    await page.goto('https://the-internet.herokuapp.com/login');

    // Step 2: Type username and password, then click Login
    enhancedLogger.step('Step 2: Enter valid credentials and submit', xrayTestKey);
    await page.getByLabel('Username').fill('tomsmith');
    await page.getByLabel('Password').fill('SuperSecretPassword!');
    await page.getByRole('button', { name: 'Login' }).click();

    // Step 3: Check we're logged in
    enhancedLogger.step('Step 3: Verify user is on the Secure Area page', xrayTestKey);
    await expect(page.getByText('You logged into a secure area!')).toBeVisible();
    expect(page.url()).toContain('/secure');

    // Done!
    enhancedLogger.pass('TC01 passed — User logged in successfully', xrayTestKey);

  });

});
```

---

## 🧱 Action Cheat Sheet — Copy & Paste

Here's every action you'll need. Just copy the line, paste it into your test,
and change the text inside the quotes.

---

### Go to a web page
```typescript
await page.goto('https://your-website.com/page');
```

---

### Click a button
```typescript
await page.getByRole('button', { name: 'Login' }).click();
await page.getByRole('button', { name: 'Submit' }).click();
await page.getByRole('button', { name: 'Place Order' }).click();
```

---

### Click a link
```typescript
await page.getByRole('link', { name: 'Forgot Password?' }).click();
await page.getByRole('link', { name: 'Sign Up' }).click();
```

---

### Type into a text field (by its label)
```typescript
await page.getByLabel('Email').fill('test@example.com');
await page.getByLabel('Password').fill('MyPassword123');
await page.getByLabel('First Name').fill('John');
```

> **Can't find the field by label?** Try by placeholder text instead:
> ```typescript
> await page.getByPlaceholder('Enter your email').fill('test@example.com');
> ```

---

### Pick from a dropdown
```typescript
await page.getByLabel('Country').selectOption('United Kingdom');
await page.getByLabel('Size').selectOption('Large');
```

---

### Tick a checkbox
```typescript
await page.getByLabel('I agree to the terms').check();
```

---

### Check text IS visible on the page
```typescript
await expect(page.getByText('Welcome back!')).toBeVisible();
await expect(page.getByText('Order confirmed')).toBeVisible();
await expect(page.getByText('Your password is invalid!')).toBeVisible();
```

---

### Check text is NOT on the page
```typescript
await expect(page.getByText('Error')).not.toBeVisible();
```

---

### Check the URL changed
```typescript
expect(page.url()).toContain('/dashboard');
expect(page.url()).toContain('/login');
```

---

### Wait for something to load (if the page is slow)
```typescript
await page.waitForTimeout(2000);  // wait 2 seconds
await page.waitForTimeout(5000);  // wait 5 seconds
```

---

### Log a step (so it shows in the HTML report)
```typescript
enhancedLogger.step('Step 1: Go to the login page', xrayTestKey);
enhancedLogger.step('Step 2: Enter credentials', xrayTestKey);
enhancedLogger.step('Step 3: Click Login', xrayTestKey);
```

---

### Log that the test passed (always put at the very end)
```typescript
enhancedLogger.pass('TC01 passed — Login worked correctly', xrayTestKey);
```

---

## 🔍 What If Something Goes Wrong?

### ❌ Problem: "Cannot find module" error
**What it means:** The top of your file has a typo.
**Fix:** Make sure your file starts with EXACTLY these two lines:
```typescript
import { test, expect } from './xray-test-fixture';
import { enhancedLogger } from '../utils/helpers/enhanced-logger';
```

---

### ❌ Problem: Test says it can't find a button/field
**What it means:** The text you typed doesn't match what's on the page.
**Fix:**
1. Open the website manually in Chrome
2. Look at the EXACT text on the button/label (including capitals and spaces)
3. Update your test to match exactly

```typescript
// ❌ WRONG — button says "Log In" but you typed "Login":
await page.getByRole('button', { name: 'Login' }).click();

// ✅ RIGHT — matches the button text exactly:
await page.getByRole('button', { name: 'Log In' }).click();
```

---

### ❌ Problem: Test runs but nothing happens
**What it means:** Your file name doesn't end in `.test.ts`
**Fix:** Rename it:
```
❌ tests/checkout.ts          → won't run
✅ tests/checkout.test.ts     → will run
```

---

### ❌ Problem: Test fails at the "check" step
**What it means:** The page didn't show what you expected.
**Fix:**
1. Run with a visible browser so you can watch: `npm run run:headed`
2. Look at what the page actually shows
3. Update your `expect(...)` to match the real text

---

### ❌ Problem: Test times out (takes too long)
**What it means:** The page is loading slowly or the element hasn't appeared yet.
**Fix:** Add a short wait before the step that's failing:
```typescript
await page.waitForTimeout(3000);  // wait 3 seconds
await expect(page.getByText('Welcome')).toBeVisible();
```

---

## 📋 Full Blank Template — Ready to Copy

Save this as `tests/your-feature.test.ts` and fill in the parts marked `← CHANGE`:

```typescript
import { test, expect } from './xray-test-fixture';
import { enhancedLogger } from '../utils/helpers/enhanced-logger';

test.describe('Your Feature Name', () => {                          // ← CHANGE

  test('TC01: What this test checks', {                             // ← CHANGE
    annotation: { type: 'xray', description: 'PROJ-101' },         // ← CHANGE (or leave as-is)
  }, async ({ page, xrayTestKey }) => {

    enhancedLogger.step('Step 1: Go to the page', xrayTestKey);     // ← CHANGE
    await page.goto('https://your-website.com/page');               // ← CHANGE

    enhancedLogger.step('Step 2: Do something', xrayTestKey);       // ← CHANGE
    await page.getByLabel('Field Name').fill('value');              // ← CHANGE

    enhancedLogger.step('Step 3: Click a button', xrayTestKey);     // ← CHANGE
    await page.getByRole('button', { name: 'Submit' }).click();    // ← CHANGE

    enhancedLogger.step('Step 4: Check the result', xrayTestKey);   // ← CHANGE
    await expect(page.getByText('Success!')).toBeVisible();        // ← CHANGE

    enhancedLogger.pass('TC01 passed — it worked', xrayTestKey);    // ← CHANGE

  });

});
```

> 💡 **Pro Tip — Data-Driven Tests:**
> Instead of hardcoding values like `'value'` and `'https://your-website.com'`, you can
> load test data from an external YAML file. This means QA can change test inputs
> without editing TypeScript code:
>
> ```typescript
> import { getTestData, isTestEnabled } from '../utils/helpers/test-data-loader';
>
> // In your test:
> const td = getTestData('ui-tests.yaml', 'PROJ-101');
> if (!isTestEnabled('ui-tests.yaml', 'PROJ-101')) test.skip(); // skip if run: no
> await page.getByLabel('Username').fill(td.username as string);
> await page.getByLabel('Password').fill(td.password as string);
> ```
>
> Add your data to `test-data/ui-tests.yaml` (or `test-data/api-tests.yaml`):
> ```yaml
> PROJ-101:
>   run: yes                          # ← yes = run, no = skip
>   testCase: "TC01: Your test name"
>   username: "your-value"            # ← any data fields you need
>   password: "your-password"
>   expectedUrl: "/dashboard"
> ```
>
> **Selective Execution:** Set `run: no` next to any test case in the YAML file
> to skip it. Set `run: yes` to include it. This lets you quickly run just the
> tests you want without modifying any TypeScript code.

---

## ❓ Quick-Lookup Table

| I want to... | What to type |
|---|---|
| Go to a page | `await page.goto('https://...');` |
| Click a button | `await page.getByRole('button', { name: 'Text' }).click();` |
| Click a link | `await page.getByRole('link', { name: 'Text' }).click();` |
| Type in a field | `await page.getByLabel('Label').fill('value');` |
| Type by placeholder | `await page.getByPlaceholder('hint text').fill('value');` |
| Pick from dropdown | `await page.getByLabel('Label').selectOption('value');` |
| Tick a checkbox | `await page.getByLabel('Label').check();` |
| Check text visible | `await expect(page.getByText('text')).toBeVisible();` |
| Check text NOT there | `await expect(page.getByText('text')).not.toBeVisible();` |
| Check URL changed | `expect(page.url()).toContain('/path');` |
| Wait for slow page | `await page.waitForTimeout(3000);` |
| Log a step | `enhancedLogger.step('Step 1: desc', xrayTestKey);` |
| Log test passed | `enhancedLogger.pass('TC01 passed', xrayTestKey);` |
| Run all tests | `npm test` |
| Run one file | `npx playwright test tests/my-file.test.ts` |
| Run with browser visible | `npm run run:headed` |

---

## 💬 Still Stuck?

- **First time?** Ask a developer to pair with you for 15 minutes on your first test.
  After that you'll be able to do it yourself.
- **Error you can't fix?** Copy the error text and send it to a developer.
- **Not sure what the page element is called?** Open the website in Chrome,
  right-click the button/field → "Inspect" → look at the text or label.
- **Want to see real examples?** Look at `tests/login.test.ts` (3 login tests),
  `tests/api.test.ts` (3 API tests), and `tests/playwright-dev.test.ts` (5 navigation tests).
- **Want a step-by-step walkthrough?** Read **[HOWTO_5_NAVIGATION_TESTS.md](HOWTO_5_NAVIGATION_TESTS.md)** — it explains exactly how the 5 playwright.dev tests were built from scratch.

---

*Last updated: 4 March 2026*
