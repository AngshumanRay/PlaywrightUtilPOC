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

🖼️ Testing inside IFRAMES? (Salesforce, ServiceNow, etc.)
   Jump to: "Iframe Testing — A Beginner's Guide" section below
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
import { test, expect } from '../utils/framework/xray-test-fixture';
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
    await page.getByLabel('Password').fill('SuperSecretPassword!');  // or use data-driven: td.password

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
import { test, expect } from '../utils/framework/xray-test-fixture';
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

import { test, expect } from '../utils/framework/xray-test-fixture';
import { enhancedLogger } from '../utils/helpers/enhanced-logger';

test.describe('Login Feature Tests', () => {

  test('TC01: Valid credentials should log the user in successfully', {
    annotation: { type: 'xray', description: 'PROJ-101' },
  }, async ({ page, xrayTestKey }) => {

    // Step 1: Open the login page
    enhancedLogger.step('Step 1: Navigate to the login page', xrayTestKey);
    await page.goto('https://the-internet.herokuapp.com/login');

    // Step 2: Type username and password, then click Login
    // TIP: In real tests, use data-driven YAML instead of hardcoded values!
    //   const td = getTestData('ui-tests.yaml', 'PROJ-101');
    //   td.password is auto-decrypted from ${ENC:...} in YAML
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
import { test, expect } from '../utils/framework/xray-test-fixture';
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
import { test, expect } from '../utils/framework/xray-test-fixture';
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
>   password: "${ENC:U2FsdGVkX1/abc...}"  # ← encrypted! (see below)
>   expectedUrl: "/dashboard"
> ```
>
> **🔐 Encrypting Sensitive Values:**
> Never store passwords as plain text in YAML. Use `${ENC:ciphertext}` instead:
> 1. Set `ENCRYPTION_KEY` in `.env` (min 16 characters)
> 2. Run: `npm run encrypt-password`
> 3. Paste the encrypted output into your YAML: `password: "${ENC:U2FsdGVkX1/...}"`
> 4. The test-data-loader auto-decrypts at runtime — your test code stays the same!
>
> **Selective Execution:** Set `run: no` next to any test case in the YAML file
> to skip it. Set `run: yes` to include it. This lets you quickly run just the
> tests you want without modifying any TypeScript code.

---

## 🖼️ Iframe Testing — A Beginner's Guide

### What Is an Iframe? (Explained Simply)

An **iframe** is a "page inside a page." Think of it like a **picture frame on a wall** — the wall is your main web page, and the picture inside the frame is a separate mini-page with its own content.

```
┌─────────────────────────────────────────────────────────────────┐
│  MAIN PAGE (the "wall")                                         │
│                                                                  │
│  Page Title: "New Lead"    ← You CAN see this with page.locator │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐      │
│  │  IFRAME (the "picture frame")                          │      │
│  │                                                        │      │
│  │  First Name: [________]  ← You CANNOT see this with   │      │
│  │  Last Name:  [________]    page.locator!               │      │
│  │  Email:      [________]    You need iframe helpers.    │      │
│  │  [Save]                                                │      │
│  │                                                        │      │
│  └────────────────────────────────────────────────────────┘      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Why does this matter?**
- **Salesforce**, **ServiceNow**, **Workday** and many enterprise apps put their forms inside iframes
- Normal Playwright commands like `page.getByLabel('Name')` **cannot see** elements inside iframes
- You need to "enter" the iframe first — our helpers make this easy

### The Normal Test vs Iframe Test — Side by Side

| Normal Test (no iframe) | Iframe Test |
|---|---|
| `await page.getByLabel('Name').fill('John');` | `const frame = basePage.getIframe('#my-iframe');` |
| | `await basePage.fillInIframe(frame, '#name', 'John', 'Name');` |
| `await page.getByRole('button').click();` | `await basePage.clickInIframe(frame, '.btn', 'Save');` |
| `await expect(page.getByText('OK')).toBeVisible();` | `await basePage.assertTextInIframe(frame, '.msg', 'OK', 'Msg');` |

> **Key difference:** You get the iframe handle ONCE, then pass it to every helper. That's it!

### Step-by-Step: How to Write an Iframe Test

#### Step 1: Create your test file

Create a new file `tests/my-iframe-test.test.ts`. The `.test.ts` ending is required.

#### Step 2: Paste this template

```typescript
import path from 'path';
import { test, expect } from '../utils/framework/xray-test-fixture';
import { BasePage } from '../pages/BasePage';
import { enhancedLogger } from '../utils/helpers/enhanced-logger';
import { getTestData, isTestEnabled } from '../utils/helpers/test-data-loader';

const DATA_FILE = 'ui-tests.yaml';

test.describe('My Iframe Tests', () => {                                    // ← CHANGE

  test('TC14: Fill a form inside an iframe', {                              // ← CHANGE
    annotation: { type: 'xray', description: 'PROJ-114' },                 // ← CHANGE
  }, async ({ page, xrayTestKey }) => {

    const td = getTestData(DATA_FILE, 'PROJ-114');                          // ← CHANGE
    if (!isTestEnabled(DATA_FILE, 'PROJ-114')) test.skip();                 // ← CHANGE

    const basePage = new BasePage(page);

    // Step 1: Go to the page
    enhancedLogger.step('Step 1: Navigate to the page', xrayTestKey);
    await page.goto('https://your-app.com/page');                           // ← CHANGE

    // Step 2: Get the iframe handle
    enhancedLogger.step('Step 2: Get iframe handle', xrayTestKey);
    const frame = basePage.getIframe('#your-iframe-id');                    // ← CHANGE

    // Step 3: Fill fields inside the iframe
    enhancedLogger.step('Step 3: Fill fields inside iframe', xrayTestKey);
    await basePage.fillInIframe(frame, '#firstName', td.firstName as string, 'First Name');
    await basePage.fillInIframe(frame, '#lastName',  td.lastName  as string, 'Last Name');

    // Step 4: Click a button inside the iframe
    enhancedLogger.step('Step 4: Click Save inside iframe', xrayTestKey);
    await basePage.clickInIframe(frame, '#save-btn', 'Save button');

    // Step 5: Verify result inside the iframe
    enhancedLogger.step('Step 5: Verify success message', xrayTestKey);
    await basePage.assertTextInIframe(frame, '.success', 'Saved!', 'Success message');

    // Step 6: Verify main page (outside iframe — normal Playwright)
    enhancedLogger.step('Step 6: Verify main page', xrayTestKey);
    await expect(page.locator('#page-title')).toBeVisible();

    enhancedLogger.pass('TC14 passed — form filled inside iframe', xrayTestKey);
  });
});
```

#### Step 3: Add your test data to `test-data/ui-tests.yaml`

```yaml
PROJ-114:
  run: yes
  testCase: "TC14: Fill a form inside an iframe"
  firstName: "John"
  lastName: "Doe"
```

#### Step 4: Run your test

```bash
npx playwright test tests/my-iframe-test.test.ts
```

### How to Find the Iframe Selector

This is the most common question. Here's how to find it:

1. Open your app in **Chrome**
2. **Right-click** on the form/content that's inside the iframe
3. Click **"Inspect"** — Chrome DevTools opens
4. **Look upward** in the HTML tree until you see an `<iframe>` tag
5. Note down its **id**, **name**, or **title**:

```html
<!-- These are all valid iframe selectors -->
<iframe id="myFrame">           →  '#myFrame'
<iframe name="editFrame">       →  'iframe[name="editFrame"]'
<iframe title="New Lead">       →  'iframe[title="New Lead"]'
<iframe class="editor-frame">   →  'iframe.editor-frame'
```

6. Use it like this:
```typescript
const frame = basePage.getIframe('#myFrame');
// or
const frame = basePage.getIframe('iframe[name="editFrame"]');
// or
const frame = basePage.getIframe('iframe[title="New Lead"]');
```

### Iframe Action Cheat Sheet — Copy & Paste

```typescript
// ── Get an iframe ──
const frame = basePage.getIframe('#iframe-id');

// ── Get iframe inside another iframe (nested) ──
const innerFrame = basePage.getNestedIframe('#outer-iframe', '#inner-iframe');

// ── Fill a text field inside iframe ──
await basePage.fillInIframe(frame, '#field-id', 'value', 'Field Name');

// ── Click a button inside iframe ──
await basePage.clickInIframe(frame, '#button-id', 'Button Name');

// ── Select from dropdown inside iframe ──
await basePage.selectInIframe(frame, '#dropdown-id', 'Option Text', 'Dropdown Name');

// ── Type into rich text editor inside iframe (TinyMCE, CKEditor) ──
await basePage.typeInIframe(frame, '#editor-body', 'My text', 'Editor');

// ── Check text appears inside iframe ──
await basePage.assertTextInIframe(frame, '#message', 'Success!', 'Status Message');

// ── Check element is visible inside iframe ──
await basePage.assertVisibleInIframe(frame, '#save-btn', 'Save Button');

// ── Read a field value inside iframe ──
const value = await basePage.getIframeFieldValue(frame, '#field-id');

// ── Read text content inside iframe ──
const text = await basePage.getIframeTextContent(frame, '.label');
```

### Working with Multiple Iframes (Salesforce Pattern)

Salesforce record pages often have **two or more iframes** on the same page.
Here's how to work with both:

```typescript
// Get BOTH iframe handles at once
const leadFrame    = basePage.getIframe('#lead-iframe');
const contactFrame = basePage.getIframe('#contact-iframe');

// Fill fields in iframe #1
await basePage.fillInIframe(leadFrame, '#name', 'John', 'Name');
await basePage.fillInIframe(leadFrame, '#email', 'j@test.com', 'Email');

// Jump to iframe #2 — just use the other handle (NO switching needed!)
await basePage.fillInIframe(contactFrame, '#city', 'Mumbai', 'City');
await basePage.selectInIframe(contactFrame, '#country', 'India', 'Country');
await basePage.clickInIframe(contactFrame, '#save', 'Save');

// Jump BACK to iframe #1 — just use the first handle again
const name = await basePage.getIframeFieldValue(leadFrame, '#name');
expect(name).toBe('John');  // ✅ Still there!

// Main page works too — no "switch to default" needed
await expect(page.locator('#page-title')).toHaveText('My Record');
```

> **Key insight:** You NEVER need to "switch back" to the main page. Just use `page.locator()` for main page elements and `basePage.fillInIframe(frame, ...)` for iframe elements. They work side by side.

### ❌ Common Iframe Mistakes and Fixes

| Mistake | Fix |
|---|---|
| Using `page.getByLabel('Name')` for iframe content | Use `basePage.fillInIframe(frame, '#name', 'John', 'Name')` instead |
| Forgetting to get the iframe handle first | Add `const frame = basePage.getIframe('#iframe-id');` before using helpers |
| Wrong iframe selector | Right-click → Inspect → look for the `<iframe>` tag → use its id/name/title |
| Element not found inside iframe | Check that your CSS selector targets an element **inside** the iframe, not on the main page |
| Trying to "switch back" to main page | Not needed! Just use `page.locator()` directly |

### 📖 Real Examples in This Project

| File | What It Demonstrates |
|---|---|
| `tests/salesforce-iframe.test.ts` → **TC12** | Fill 7 fields inside a single iframe, read them back, verify |
| `tests/salesforce-iframe.test.ts` → **TC13** | Fill fields across TWO iframes, click Save, verify success, jump between iframes |
| `pages/SalesforceIframePage.ts` | Page Object pattern for iframe pages (optional advanced pattern) |
| `pages/BasePage.ts` → "IFRAME HELPERS" section | All 10 helper methods with full documentation |
| `test-fixtures/iframe-form.html` | Self-hosted HTML with 2 iframes and 13 form fields (used by TC12/TC13) |

---

## 🔁 Parameterized Testing — Run One Test with Multiple Data Sets

### What is Parameterized Testing?

Instead of copy-pasting the same test N times with different inputs, write it **ONCE** and let the framework run it N times automatically — each with its own data, its own name, and its own result in the report.

### When to Use It

- Testing login with multiple user types (admin, regular, guest)
- Testing forms with valid/invalid/edge-case inputs
- Testing the same flow across different environments or configurations

### Step-by-Step: How to Write a Parameterized Test

#### Step 1: Add `dataSets:` array to your YAML

```yaml
# test-data/ui-tests.yaml
PROJ-101:
  run: yes
  testCase: "TC01: Valid login"
  dataSets:
    - label: "Standard user"
      username: "tomsmith"
      password: "${ENC:U2FsdGVkX1+8pM...}"
      expectedUrlFragment: "/secure"
    - label: "Admin user"
      username: "admin"
      password: "${ENC:U2FsdGVkX1/xyz...}"
      expectedUrlFragment: "/admin/dashboard"
    - label: "Read-only user"
      username: "viewer"
      password: "${ENC:U2FsdGVkX1/abc...}"
      expectedUrlFragment: "/dashboard"
```

#### Step 2: Use `getTestDataSets()` in your test

```typescript
import { test, expect } from '../utils/framework/xray-test-fixture';
import { enhancedLogger } from '../utils/helpers/enhanced-logger';
import { getTestDataSets, isTestEnabled } from '../utils/helpers/test-data-loader';

const DATA_FILE = 'ui-tests.yaml';

test.describe('Login Feature Tests', () => {
  // Load ONCE outside the loop
  const proj101Enabled = isTestEnabled(DATA_FILE, 'PROJ-101');
  const proj101Sets    = getTestDataSets(DATA_FILE, 'PROJ-101');

  // Loop creates N tests — one per data set
  for (const ds of proj101Sets) {
    test(`TC01: Login [${ds.label}]`,
      { annotation: { type: 'xray', description: 'PROJ-101' } },
      async ({ page, xrayTestKey }) => {
        if (!proj101Enabled) test.skip();

        enhancedLogger.step(`Step 1: Navigate to login page`, xrayTestKey);
        await page.goto('https://the-internet.herokuapp.com/login');

        enhancedLogger.step(`Step 2: Enter credentials for ${ds.label}`, xrayTestKey);
        await page.getByLabel('Username').fill(ds.username as string);
        await page.getByLabel('Password').fill(ds.password as string);
        await page.getByRole('button', { name: 'Login' }).click();

        enhancedLogger.step(`Step 3: Verify redirect`, xrayTestKey);
        expect(page.url()).toContain(ds.expectedUrlFragment as string);

        enhancedLogger.pass(`TC01 passed [${ds.label}]`, xrayTestKey);
      }
    );
  }
});
```

#### Step 3: Run and see N separate tests

```bash
npm test
```

You'll see:
```
✅ PASS  TC01: Login [Standard user]
✅ PASS  TC01: Login [Admin user]
✅ PASS  TC01: Login [Read-only user]
```

### What If I Don't Have `dataSets:`?

No problem! `getTestDataSets()` is backward compatible. If your YAML has no `dataSets:` array, it returns a single-item array `[{ label: 'default', index: 0, ...allYourFields }]`. Your existing tests don't need to change.

### Key Points

| Concept | Details |
|---------|---------|
| `dataSets:` | YAML array — each item becomes a separate test run |
| `label:` | Human-readable name shown in test title (e.g., "Admin user") |
| `getTestDataSets()` | Returns `DataSetEntry[]` — always at least 1 item |
| `ds.fieldName` | Access any field from the data set (username, password, etc.) |
| `[${ds.label}]` | Put this in your test name so each run is distinguishable |

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
| **Get iframe handle** | `const frame = basePage.getIframe('#iframe-id');` |
| **Fill field in iframe** | `await basePage.fillInIframe(frame, '#field', 'val', 'Desc');` |
| **Click in iframe** | `await basePage.clickInIframe(frame, '.btn', 'Desc');` |
| **Select in iframe** | `await basePage.selectInIframe(frame, '#dd', 'Opt', 'Desc');` |
| **Check text in iframe** | `await basePage.assertTextInIframe(frame, '.msg', 'OK', 'Desc');` |
| **Read value in iframe** | `await basePage.getIframeFieldValue(frame, '#field');` |
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
  `tests/api.test.ts` (3 API tests), `tests/playwright-dev.test.ts` (5 navigation tests),
  and `tests/salesforce-iframe.test.ts` (2 iframe tests — see the [Iframe Testing Guide](#️-iframe-testing--a-beginners-guide) above).
- **Need to test inside iframes?** (Salesforce, ServiceNow, Workday) — Read the
  [Iframe Testing — A Beginner's Guide](#️-iframe-testing--a-beginners-guide) section above.
  It has a complete template, cheat sheet, and common mistakes to avoid.
- **Want a step-by-step walkthrough?** Read **[HOWTO_5_NAVIGATION_TESTS.md](HOWTO_5_NAVIGATION_TESTS.md)** — it explains exactly how the 5 playwright.dev tests were built from scratch.
- **Need to encrypt passwords in YAML?** Run `npm run encrypt-password`, paste the output as
  `password: "${ENC:U2FsdGVkX1/...}"` in your YAML file. See [CAPABILITIES.md → Encryption](CAPABILITIES.md#-security--encryption) for the full guide.

---

*Last updated: 10 March 2026*
