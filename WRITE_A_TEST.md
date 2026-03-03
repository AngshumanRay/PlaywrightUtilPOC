# ✍️ How to Write a New Test Case
### For People Who Have Never Written Code Before

---

> **You do NOT need to know:**
> - TypeScript or any programming language
> - What XRAY is or how it works
> - What a database is
> - What automation is
> - What an API is
>
> **You only need to know:**
> - What website page you want to test
> - What steps a human would do on that page
> - What the correct result should look like

---

## 📋 Before You Start — The Only 3 Things You Need

| Thing | Example | Where to find it |
|---|---|---|
| **The website page you're testing** | `https://myapp.com/login` | Ask your team lead |
| **What steps to do on that page** | Click Login, type email, click Submit | Your test case document / JIRA ticket |
| **What the correct result looks like** | "Welcome, John!" appears on screen | Your test case document / JIRA ticket |

---

## 🗺️ The Simplest Map of How a Test File Looks

Every test file looks like this. Don't panic — you only need to change the
highlighted parts. Everything else stays exactly the same.

```
┌────────────────────────────────────────────────────────────────────────┐
│  PART 1 — TOP OF FILE (don't change this — copy it as-is)             │
│  ─────────────────────────────────────────────────────────────────     │
│  import { test, expect } from './xray-test-fixture';                  │
│  import { enhancedLogger } from '../utils/helpers/enhanced-logger';   │
│                                                                        │
│                                                                        │
│  PART 2 — TEST GROUP NAME (change this to describe your feature)      │
│  ─────────────────────────────────────────────────────────────────     │
│  test.describe(' ★ YOUR FEATURE NAME HERE ★ ', () => {               │
│                                                                        │
│                                                                        │
│    PART 3 — ONE TEST (copy this block for each test case you have)    │
│    ──────────────────────────────────────────────────────────────      │
│    test(' ★ YOUR TEST NAME HERE ★ ', {                                │
│      annotation: { type: 'xray', description: ' ★ PROJ-XXX ★ ' },   │
│    }, async ({ page, xrayTestKey }) => {                              │
│                                                                        │
│      // ★ YOUR STEPS GO HERE ★                                        │
│                                                                        │
│    });  ← closing bracket for this test                               │
│                                                                        │
│  });  ← closing bracket for the group                                 │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🧱 The Building Blocks — Copy & Paste These

These are ALL the actions you'll ever need. Copy the line you need, paste it
into your test, and change the text in quotes.

---

### 🔗 Go to a web page

```typescript
await page.goto('https://your-website.com/page-name');
```

**Example:**
```typescript
await page.goto('https://the-internet.herokuapp.com/login');
```

---

### 🖱️ Click a button (by its visible text)

```typescript
await page.getByRole('button', { name: 'THE BUTTON TEXT' }).click();
```

**Examples:**
```typescript
await page.getByRole('button', { name: 'Login' }).click();
await page.getByRole('button', { name: 'Submit' }).click();
await page.getByRole('button', { name: 'Sign Up' }).click();
await page.getByRole('button', { name: 'Confirm Order' }).click();
```

---

### 🔗 Click a link (by its visible text)

```typescript
await page.getByRole('link', { name: 'THE LINK TEXT' }).click();
```

**Examples:**
```typescript
await page.getByRole('link', { name: 'Forgot Password?' }).click();
await page.getByRole('link', { name: 'Back to Home' }).click();
```

---

### ⌨️ Type text into a text box (by its label)

```typescript
await page.getByLabel('LABEL TEXT').fill('what you want to type');
```

**Examples:**
```typescript
await page.getByLabel('Email').fill('testuser@example.com');
await page.getByLabel('Password').fill('MyPassword123');
await page.getByLabel('First Name').fill('John');
await page.getByLabel('Search').fill('red shoes');
```

> **Can't find it by label?** Try by placeholder text:
> ```typescript
> await page.getByPlaceholder('Enter your email').fill('test@example.com');
> ```

---

### ✅ Check that some text IS visible on the page

```typescript
await expect(page.getByText('THE TEXT YOU EXPECT TO SEE')).toBeVisible();
```

**Examples:**
```typescript
await expect(page.getByText('Welcome back!')).toBeVisible();
await expect(page.getByText('Order confirmed')).toBeVisible();
await expect(page.getByText('Your password is invalid!')).toBeVisible();
await expect(page.getByText('You have been logged out')).toBeVisible();
```

---

### ❌ Check that some text is NOT visible on the page

```typescript
await expect(page.getByText('THE TEXT THAT SHOULD NOT APPEAR')).not.toBeVisible();
```

**Example:**
```typescript
await expect(page.getByText('Error')).not.toBeVisible();
```

---

### 🌐 Check the current URL contains something

```typescript
expect(page.url()).toContain('/the-part-you-expect');
```

**Examples:**
```typescript
expect(page.url()).toContain('/dashboard');   // after login
expect(page.url()).toContain('/login');        // redirected back to login
expect(page.url()).toContain('/checkout');     // on checkout page
```

---

### 📝 Log a step (so it appears in the report)

```typescript
enhancedLogger.step('Step 1: Describe what this step does', xrayTestKey);
```

**Examples:**
```typescript
enhancedLogger.step('Step 1: Go to the login page', xrayTestKey);
enhancedLogger.step('Step 2: Enter credentials', xrayTestKey);
enhancedLogger.step('Step 3: Click the Login button', xrayTestKey);
enhancedLogger.step('Step 4: Verify the welcome message appears', xrayTestKey);
```

---

### ✅ Log that the test passed (at the end of the test)

```typescript
enhancedLogger.pass('Short description of what passed', xrayTestKey);
```

---

## 🎓 A Complete Example — Read This First

Below is a complete, real test. Read it top to bottom. The comments explain
every single line.

**Scenario:** Test the login page — enter a valid username and password,
click Login, and check the dashboard appears.

```typescript
// ============================================================
// tests/my-login-test.ts
// ============================================================

// LINE 1-2: These two lines must ALWAYS be at the top.
// They give you the "test" function and "enhancedLogger".
// Do not change them.
import { test, expect } from './xray-test-fixture';
import { enhancedLogger } from '../utils/helpers/enhanced-logger';


// LINE 5: This groups your tests under one name.
// Change 'My Feature Name' to the name of the feature you're testing.
test.describe('Login Feature Tests', () => {


  // ─────────────────────────────────────────────────────────────
  // LINE 9: The test() block is ONE test case.
  // 'TC01: ...' is the test name — change it to describe your test.
  // ─────────────────────────────────────────────────────────────
  test('TC01: Valid login should go to the dashboard', {

    // LINE 13: Change 'PROJ-101' to your actual JIRA/XRAY test case ID.
    // If you don't have XRAY, just use any label like 'TC-001'.
    annotation: { type: 'xray', description: 'PROJ-101' },

  }, async ({ page, xrayTestKey }) => {
    // ↑ Don't change this line. It gives you "page" (the browser)
    //   and "xrayTestKey" (the XRAY ID from the annotation above).


    // ── STEP 1 ─────────────────────────────────────────────────
    enhancedLogger.step('Step 1: Go to the login page', xrayTestKey);
    // This logs Step 1 to the report.

    await page.goto('https://the-internet.herokuapp.com/login');
    // This opens the login page in the browser.


    // ── STEP 2 ─────────────────────────────────────────────────
    enhancedLogger.step('Step 2: Enter username and password', xrayTestKey);

    await page.getByLabel('Username').fill('tomsmith');
    // Type 'tomsmith' into the field labelled 'Username'.

    await page.getByLabel('Password').fill('SuperSecretPassword!');
    // Type the password into the 'Password' field.


    // ── STEP 3 ─────────────────────────────────────────────────
    enhancedLogger.step('Step 3: Click the Login button', xrayTestKey);

    await page.getByRole('button', { name: 'Login' }).click();
    // Click the button whose text says 'Login'.


    // ── STEP 4 ─────────────────────────────────────────────────
    enhancedLogger.step('Step 4: Check the success message appears', xrayTestKey);

    await expect(page.getByText('You logged into a secure area!')).toBeVisible();
    // ↑ This is the CHECK. If this text is NOT on the page, the test FAILS.

    expect(page.url()).toContain('/secure');
    // ↑ Also check the URL changed to /secure (means we're logged in).


    // ── END ────────────────────────────────────────────────────
    enhancedLogger.pass('TC01 passed — Login worked correctly', xrayTestKey);
    // This line logs success to the report. Change the message to match your test.

  }); // ← closes this test


}); // ← closes the group
```

---

## 📝 Step-by-Step: Writing YOUR Test From Scratch

Follow these steps. Tick each one as you go.

---

### ☐ Step 1 — Copy the starter template

Create a new file in the `tests/` folder.
Name it after the feature you're testing, like: `tests/checkout.test.ts`

Paste this exact template into the file:

```typescript
import { test, expect } from './xray-test-fixture';
import { enhancedLogger } from '../utils/helpers/enhanced-logger';

test.describe('YOUR FEATURE NAME HERE', () => {

  test('TC01: DESCRIBE WHAT THIS TEST CHECKS', {
    annotation: { type: 'xray', description: 'PROJ-101' },
  }, async ({ page, xrayTestKey }) => {

    enhancedLogger.step('Step 1: TODO — describe first action', xrayTestKey);
    // TODO: add your first action here

    enhancedLogger.step('Step 2: TODO — describe second action', xrayTestKey);
    // TODO: add your second action here

    enhancedLogger.step('Step 3: TODO — check the result', xrayTestKey);
    // TODO: add your check here

    enhancedLogger.pass('TC01 passed', xrayTestKey);

  });

});
```

---

### ☐ Step 2 — Fill in the feature name

Change `'YOUR FEATURE NAME HERE'` to the name of what you're testing.

```typescript
// BEFORE:
test.describe('YOUR FEATURE NAME HERE', () => {

// AFTER:
test.describe('Checkout Feature Tests', () => {
```

---

### ☐ Step 3 — Fill in the test name

Change `'TC01: DESCRIBE WHAT THIS TEST CHECKS'` to a clear description.

```typescript
// BEFORE:
test('TC01: DESCRIBE WHAT THIS TEST CHECKS', {

// AFTER:
test('TC01: Logged-in user should be able to complete a purchase', {
```

**Good test names follow this pattern:**
> `[WHO]` should be able to `[DO WHAT]` when `[CONDITION]`

Examples:
- `TC01: Guest user should see login prompt when clicking Checkout`
- `TC02: Valid payment details should show Order Confirmed screen`
- `TC03: Empty cart should show "Your cart is empty" message`

---

### ☐ Step 4 — Set the XRAY test case ID (or skip if not using XRAY)

Change `'PROJ-101'` to your actual JIRA test case ID.

```typescript
// BEFORE:
annotation: { type: 'xray', description: 'PROJ-101' },

// AFTER (your real JIRA ticket ID):
annotation: { type: 'xray', description: 'PROJ-210' },
```

> **Not using JIRA/XRAY yet?** Just leave it as `'PROJ-101'` or change it to
> any label like `'TC-001'`. The test will still run fine — the ID is only
> used if JIRA is connected.

---

### ☐ Step 5 — Write the steps

Replace each `// TODO` line with a real action from the building blocks above.

**Think through your test manually first:**
> "If I was a real person doing this test on the website, what would I do?"

Write it in plain English first:
```
1. Go to the checkout page
2. Enter my shipping address
3. Enter my card number
4. Click "Place Order"
5. Check the confirmation message appears
```

Then translate each line using the building blocks:

```typescript
// 1. Go to the checkout page
await page.goto('https://myapp.com/checkout');

// 2. Enter shipping address
await page.getByLabel('Street Address').fill('123 Test Street');
await page.getByLabel('City').fill('London');
await page.getByLabel('Postcode').fill('SW1A 1AA');

// 3. Enter card number
await page.getByLabel('Card Number').fill('4111111111111111');
await page.getByLabel('Expiry Date').fill('12/28');
await page.getByLabel('CVV').fill('123');

// 4. Click Place Order
await page.getByRole('button', { name: 'Place Order' }).click();

// 5. Check confirmation
await expect(page.getByText('Order Confirmed!')).toBeVisible();
```

---

### ☐ Step 6 — Add step logs around each action

Wrap each group of actions with a `enhancedLogger.step(...)` call.
This makes the HTML report easy to read.

```typescript
enhancedLogger.step('Step 1: Go to checkout page', xrayTestKey);
await page.goto('https://myapp.com/checkout');

enhancedLogger.step('Step 2: Enter shipping address', xrayTestKey);
await page.getByLabel('Street Address').fill('123 Test Street');
await page.getByLabel('City').fill('London');
await page.getByLabel('Postcode').fill('SW1A 1AA');

enhancedLogger.step('Step 3: Enter card details', xrayTestKey);
await page.getByLabel('Card Number').fill('4111111111111111');
await page.getByLabel('Expiry Date').fill('12/28');
await page.getByLabel('CVV').fill('123');

enhancedLogger.step('Step 4: Place the order', xrayTestKey);
await page.getByRole('button', { name: 'Place Order' }).click();

enhancedLogger.step('Step 5: Verify confirmation screen', xrayTestKey);
await expect(page.getByText('Order Confirmed!')).toBeVisible();

enhancedLogger.pass('TC01 passed — Order completed successfully', xrayTestKey);
```

---

### ☐ Step 7 — Add more test cases (optional)

To add a second test in the same file, copy the whole `test(...)` block
and paste it right below the first one (before the closing `});`).

Change the test name, the XRAY ID, and the steps.

```typescript
test.describe('Checkout Feature Tests', () => {

  test('TC01: Valid payment should show Order Confirmed', {
    annotation: { type: 'xray', description: 'PROJ-210' },
  }, async ({ page, xrayTestKey }) => {
    // ... TC01 steps here ...
  });


  test('TC02: Empty cart should show "Your cart is empty"', {
    annotation: { type: 'xray', description: 'PROJ-211' },
  }, async ({ page, xrayTestKey }) => {
    // ... TC02 steps here ...
  });


  test('TC03: Invalid card should show payment error', {
    annotation: { type: 'xray', description: 'PROJ-212' },
  }, async ({ page, xrayTestKey }) => {
    // ... TC03 steps here ...
  });

});
```

---

### ☐ Step 8 — Run your test

Open the terminal and type:

```
npm test
```

Or to run ONLY your new test file:

```
npx playwright test tests/checkout.test.ts
```

After it finishes, a report file is created in the `reports/` folder.
To open it:

```
npm run run:headless
```

(This runs the tests AND opens the report in one command.)

---

## 🚦 How to Know If Something Went Wrong

### The test fails immediately on a step

This usually means either:
- The text you searched for (`'Login'`, `'Submit'`, etc.) is **spelled differently** on the page
- The button/link/label doesn't exist on that page

**How to fix it:**
1. Open the website manually in your browser
2. Right-click the button/field you're targeting → "Inspect Element"
3. Look at the exact text or label name
4. Update your test to match exactly (including capital letters)

---

### "Cannot find module" error

This means something at the top of the file is wrong.

**Check:** Does your file start with exactly these two lines?
```typescript
import { test, expect } from './xray-test-fixture';
import { enhancedLogger } from '../utils/helpers/enhanced-logger';
```

---

### Test runs but nothing happens / all steps are skipped

Check that your test file name ends in `.test.ts` — Playwright only runs
files with that exact ending.

✅ `tests/checkout.test.ts`  
❌ `tests/checkout.ts`  
❌ `tests/test-checkout.ts`

---

## 🔑 XRAY Integration — What You Actually Need to Know

> **Short version:** You only need ONE number — the JIRA ticket ID of your test case.

XRAY is the part of JIRA that tracks test results. Every test case in JIRA
has an ID like `PROJ-101`. You put that ID in this one place in your test:

```typescript
annotation: { type: 'xray', description: 'PROJ-101' },
//                                         ↑
//                          This is the ONLY thing you need
//                          Change it to your ticket's ID
```

That's it. The framework handles everything else automatically:
- ✅ Connecting to JIRA
- ✅ Uploading the PASS/FAIL result
- ✅ Attaching screenshots of failures

**If JIRA is not set up yet:** Leave the ID as-is. The test still runs,
results still appear in the HTML report, nothing breaks.

---

## 📋 Full Copy-Paste Template

Below is a clean, empty template. Copy it, save it as `tests/your-feature.test.ts`,
and fill in the `★` parts.

```typescript
import { test, expect } from './xray-test-fixture';
import { enhancedLogger } from '../utils/helpers/enhanced-logger';

// ★ Change this to the name of the feature you're testing
test.describe('★ Feature Name ★', () => {

  // ══════════════════════════════════════════════════════════════
  // ★ TEST 1
  // ══════════════════════════════════════════════════════════════
  test('TC01: ★ What this test checks ★', {
    annotation: { type: 'xray', description: '★ PROJ-101 ★' },
  }, async ({ page, xrayTestKey }) => {

    enhancedLogger.step('Step 1: ★ describe action ★', xrayTestKey);
    await page.goto('★ https://your-website.com/page ★');

    enhancedLogger.step('Step 2: ★ describe action ★', xrayTestKey);
    await page.getByLabel('★ Field Label ★').fill('★ value to type ★');

    enhancedLogger.step('Step 3: ★ describe action ★', xrayTestKey);
    await page.getByRole('button', { name: '★ Button Text ★' }).click();

    enhancedLogger.step('Step 4: ★ check the result ★', xrayTestKey);
    await expect(page.getByText('★ Expected text on screen ★')).toBeVisible();

    enhancedLogger.pass('TC01 passed — ★ short success message ★', xrayTestKey);

  });


  // ══════════════════════════════════════════════════════════════
  // ★ TEST 2 (duplicate this block for each additional test)
  // ══════════════════════════════════════════════════════════════
  test('TC02: ★ What this test checks ★', {
    annotation: { type: 'xray', description: '★ PROJ-102 ★' },
  }, async ({ page, xrayTestKey }) => {

    enhancedLogger.step('Step 1: ★ describe action ★', xrayTestKey);
    await page.goto('★ https://your-website.com/page ★');

    enhancedLogger.step('Step 2: ★ describe action ★', xrayTestKey);
    // ★ add your steps here ★

    enhancedLogger.step('Step 3: ★ check the result ★', xrayTestKey);
    await expect(page.getByText('★ Expected text ★')).toBeVisible();

    enhancedLogger.pass('TC02 passed — ★ short success message ★', xrayTestKey);

  });

});
```

---

## ❓ Quick Reference — "I want to... what do I type?"

| I want to... | Code to use |
|---|---|
| Go to a page | `await page.goto('https://...');` |
| Click a button | `await page.getByRole('button', { name: 'Button Text' }).click();` |
| Click a link | `await page.getByRole('link', { name: 'Link Text' }).click();` |
| Type into a labelled field | `await page.getByLabel('Label Text').fill('my value');` |
| Type into a placeholder field | `await page.getByPlaceholder('Placeholder text').fill('my value');` |
| Check text is visible | `await expect(page.getByText('Expected Text')).toBeVisible();` |
| Check text is NOT there | `await expect(page.getByText('Bad Text')).not.toBeVisible();` |
| Check the URL | `expect(page.url()).toContain('/expected-path');` |
| Log a step | `enhancedLogger.step('Step 1: description', xrayTestKey);` |
| Log test passed | `enhancedLogger.pass('TC01 passed', xrayTestKey);` |

---

*Need more help? Ask a developer on the team to pair with you for 15 minutes
on your first test — after that, you'll be able to do it yourself.*
