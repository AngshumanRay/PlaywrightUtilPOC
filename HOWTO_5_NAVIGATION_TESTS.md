# 🧭 How the 5 Navigation Tests Were Built — Step by Step

### A Complete Guide From Blank Screen to 13 Passing Tests

---

> **Who is this for?**
> You want to understand *exactly* how the 5 playwright.dev navigation tests (TC07–TC11) were created.
> This document walks through every decision, every file created, and every line of code — in order.

---

## 📚 Table of Contents

| # | Section | What You'll Learn |
|---|---------|-------------------|
| 1 | The Goal | What we wanted to test and why |
| 2 | Planning | Deciding on test cases before writing any code |
| 3 | Step 1 — Create the Page Object | `pages/PlaywrightDevPage.ts` |
| 4 | Step 2 — Create the Test File | `tests/playwright-dev.test.ts` |
| 5 | Step 3 — Write TC07 (Homepage) | First test, end to end |
| 6 | Step 4 — Write TC08 (Docs Tab) | Second test, building on TC07 |
| 7 | Step 5 — Write TC09 (API Tab) | Third test |
| 8 | Step 6 — Write TC10 (Community Tab) | Fourth test |
| 9 | Step 7 — Write TC11 (Python Language) | Fifth test, language switcher |
| 10 | Step 8 — Run & Verify | Running all 13 tests |
| 11 | The Complete File Map | Every file involved |
| 12 | Lessons Learned | Patterns you can reuse |

---

## 1. The Goal

We already had **6 tests** (3 login + 3 API). We wanted to add **5 more UI tests** that:

- Navigate to a **real public website** (https://playwright.dev/)
- Click different **navigation tabs** (Docs, API, Community)
- **Switch the language** from Node.js to Python
- Verify the correct **page title and heading** after each action
- Work with the **existing XRAY integration** and **HTML report**

### The 5 Test Cases We Planned

| TC# | XRAY Key | Scenario | Expected Result |
|-----|----------|----------|-----------------|
| TC07 | PROJ-107 | Navigate to Homepage | Title contains "Playwright" |
| TC08 | PROJ-108 | Click "Docs" tab | Title contains "Installation" |
| TC09 | PROJ-109 | Click "API" tab | Title contains "Playwright Library" |
| TC10 | PROJ-110 | Click "Community" tab | Title contains "Welcome" |
| TC11 | PROJ-111 | Switch language to Python | Title contains "Playwright Python" |

---

## 2. Planning — Before Writing Any Code

### Step 2a: Open the Website and Explore

Before writing a single line, we opened https://playwright.dev/ in Chrome and noted:

```
┌─────────────────────────────────────────────────────────┐
│  [Playwright logo]   Docs   API   Community   [Node.js ▼]  │
│                                                             │
│  ┌─────────────────────────────────────────┐                │
│  │  Playwright enables reliable             │                │
│  │  end-to-end testing for modern web apps  │                │
│  └─────────────────────────────────────────┘                │
└─────────────────────────────────────────────────────────┘
```

We identified:
- **Navigation tabs**: Docs, API, Community (these are `<a>` links in the navbar)
- **Language dropdown**: "Node.js ▼" button at top right → options: Node.js, Python, Java, .NET
- **Main heading**: `<h1>` tag with the page's title text
- **Page title**: The browser tab title (e.g. "Fast and reliable end-to-end testing for modern web apps | Playwright")

### Step 2b: Decide What Files to Create

```
TWO new files needed:
  1. pages/PlaywrightDevPage.ts   ← Page Object (locators + actions)
  2. tests/playwright-dev.test.ts ← Test file (5 test cases)

NO changes needed to existing files — the framework auto-discovers any .test.ts file.
```

---

## 3. Step 1 — Create the Page Object

### Why a Page Object?

If playwright.dev changes their navigation bar tomorrow, we fix **ONE file** (`PlaywrightDevPage.ts`) and all 5 tests keep working. Without a page object, we'd fix the same locator in 5 different places.

### File: `pages/PlaywrightDevPage.ts`

#### 3a. Start with imports and class skeleton

```typescript
import { type Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { logger } from '../utils/helpers/logger';

export class PlaywrightDevPage extends BasePage {
  constructor(page: Page) {
    super(page);  // gives us all BasePage methods for free
  }
}
```

> **Why `extends BasePage`?** BasePage already has `navigate()`, `clickElement()`, `waitForElement()`, `assertElementVisible()`, `verifyPageTitle()`, `verifyUrl()` — we inherit all of them.

#### 3b. Add locators (how to find elements)

We opened Chrome DevTools (F12) and inspected each element:

```typescript
// The main heading <h1> on any page
private get mainHeading() {
  return this.page.locator('h1').first();
}

// The "Docs" link in the top navigation bar
private get docsNavLink() {
  return this.page.getByRole('link', { name: 'Docs' }).first();
}

// The "API" link in the top navigation bar
private get apiNavLink() {
  return this.page.getByRole('link', { name: 'API' }).first();
}

// The "Community" link in the top navigation bar
private get communityNavLink() {
  return this.page.getByRole('link', { name: 'Community' }).first();
}

// The Node.js dropdown button (language switcher)
private get languageDropdownButton() {
  return this.page.getByRole('link', { name: 'Node.js' }).first();
}

// The "Python" option inside the language dropdown
private get pythonLanguageLink() {
  return this.page.getByRole('link', { name: 'Python' }).first();
}
```

> **How did we find these locators?**
> 1. Open https://playwright.dev/ in Chrome
> 2. Right-click "Docs" → Inspect → see it's an `<a>` tag with text "Docs"
> 3. Use Playwright's recommended locator: `getByRole('link', { name: 'Docs' })`
> 4. Add `.first()` in case there are multiple matches

#### 3c. Add action methods

Each method does ONE thing and logs what it's doing:

```typescript
// Navigate to the playwright.dev homepage
async navigateToHomepage(): Promise<void> {
  logger.section('Navigating to Playwright.dev Homepage');
  await this.navigate('https://playwright.dev/', 'Homepage main heading', this.mainHeading);
}

// Click the "Docs" tab in the navigation bar
async clickDocsTab(): Promise<void> {
  await this.clickElement(this.docsNavLink, 'Docs navigation tab');
  await this.waitForPageLoad();
}

// Click the "API" tab
async clickApiTab(): Promise<void> {
  await this.clickElement(this.apiNavLink, 'API navigation tab');
  await this.waitForPageLoad();
}

// Click the "Community" tab
async clickCommunityTab(): Promise<void> {
  await this.clickElement(this.communityNavLink, 'Community navigation tab');
  await this.waitForPageLoad();
}

// Switch language from Node.js to Python
async switchLanguageToPython(): Promise<void> {
  logger.step('Opening language dropdown...');
  await this.clickElement(this.languageDropdownButton, 'Language dropdown (Node.js)');
  await this.clickElement(this.pythonLanguageLink, 'Python language option');
  await this.waitForPageLoad();
}

// Verify the page title contains specific text
async verifyPageTitleContains(expected: string): Promise<void> {
  await this.verifyPageTitle(expected);
}

// Verify the page heading contains specific text
async verifyMainHeadingContains(expected: string): Promise<void> {
  await this.assertElementVisible(this.mainHeading, 'Page main heading');
  await this.assertElementContainsText(this.mainHeading, expected, 'Page main heading');
}

// Verify the URL contains specific text
async verifyUrlContains(expected: string): Promise<void> {
  await this.verifyUrl(expected);
}
```

> **Key pattern:** Every method calls BasePage methods internally. If `clickElement()` or `navigate()` needs to change, it's changed in BasePage — not here.

---

## 4. Step 2 — Create the Test File

### File: `tests/playwright-dev.test.ts`

#### 4a. Start with imports

```typescript
import { test, expect } from '../utils/framework/xray-test-fixture';            // custom fixture
import { PlaywrightDevPage } from '../pages/PlaywrightDevPage'; // our page object
import { enhancedLogger } from '../utils/helpers/enhanced-logger'; // step logging
```

> **Why `../utils/framework/xray-test-fixture` instead of `@playwright/test`?**
> Our custom fixture automatically adds:
> - XRAY result reporting (PASS/FAIL → JIRA)
> - Screenshot on failure
> - Accessibility scan after each test
> - Performance metrics (page load, FCP)
> You get all this for FREE.

#### 4b. Create the test group

```typescript
test.describe('Playwright.dev Navigation Tests', () => {
  // all 5 tests go inside here
});
```

---

## 5. Step 3 — Write TC07 (Homepage)

### The simplest test: just navigate and verify

```typescript
test(
  'TC07: Navigate to Homepage and verify Playwright title',
  { annotation: { type: 'xray', description: 'PROJ-107' } },
  async ({ page, xrayTestKey }) => {
    // Create the page object
    const playwrightDev = new PlaywrightDevPage(page);

    // Step 1: Navigate
    enhancedLogger.step('Step 1: Navigate to the Playwright.dev homepage', xrayTestKey);
    await playwrightDev.navigateToHomepage();

    // Step 2: Verify title
    enhancedLogger.step('Step 2: Verify page title contains "Playwright"', xrayTestKey);
    await playwrightDev.verifyPageTitleContains('Playwright');

    // Step 3: Verify heading
    enhancedLogger.step('Step 3: Verify homepage heading text', xrayTestKey);
    await playwrightDev.verifyMainHeadingContains(
      'Playwright enables reliable end-to-end testing'
    );

    // Step 4: Verify URL
    enhancedLogger.step('Step 4: Verify URL is playwright.dev', xrayTestKey);
    await playwrightDev.verifyUrlContains('playwright.dev');

    // Log success
    enhancedLogger.pass(
      'TC07 passed — Homepage loaded with correct title and heading',
      xrayTestKey
    );
  }
);
```

### What each line does:

| Line | Purpose |
|------|---------|
| `{ annotation: { type: 'xray', description: 'PROJ-107' } }` | Links this test to JIRA XRAY test case PROJ-107 |
| `new PlaywrightDevPage(page)` | Creates our page object (gives us all the locators + methods) |
| `enhancedLogger.step(...)` | Logs a step that appears in the HTML report |
| `await playwrightDev.navigateToHomepage()` | Opens browser → goes to https://playwright.dev/ |
| `await playwrightDev.verifyPageTitleContains('Playwright')` | Checks the browser tab title contains "Playwright" |
| `enhancedLogger.pass(...)` | Logs a green success message in the HTML report |

---

## 6. Step 4 — Write TC08 (Docs Tab)

### Pattern: Navigate → Click Tab → Verify

```typescript
test(
  'TC08: Click Docs tab and verify Installation page title',
  { annotation: { type: 'xray', description: 'PROJ-108' } },
  async ({ page, xrayTestKey }) => {
    const playwrightDev = new PlaywrightDevPage(page);

    enhancedLogger.step('Step 1: Navigate to the homepage', xrayTestKey);
    await playwrightDev.navigateToHomepage();

    enhancedLogger.step('Step 2: Click the "Docs" navigation tab', xrayTestKey);
    await playwrightDev.clickDocsTab();

    enhancedLogger.step('Step 3: Verify page title contains "Installation"', xrayTestKey);
    await playwrightDev.verifyPageTitleContains('Installation');

    enhancedLogger.step('Step 4: Verify heading text is "Installation"', xrayTestKey);
    await playwrightDev.verifyMainHeadingContains('Installation');

    enhancedLogger.step('Step 5: Verify URL contains "/docs/intro"', xrayTestKey);
    await playwrightDev.verifyUrlContains('/docs/intro');

    enhancedLogger.pass(
      'TC08 passed — Docs tab navigated to Installation page',
      xrayTestKey
    );
  }
);
```

> **Notice the pattern:** Every test starts with `navigateToHomepage()` → does its unique action → verifies the result. This is the **Arrange → Act → Assert** pattern.

---

## 7. Step 5 — Write TC09 (API Tab)

```typescript
test(
  'TC09: Click API tab and verify Playwright Library page title',
  { annotation: { type: 'xray', description: 'PROJ-109' } },
  async ({ page, xrayTestKey }) => {
    const playwrightDev = new PlaywrightDevPage(page);

    enhancedLogger.step('Step 1: Navigate to the homepage', xrayTestKey);
    await playwrightDev.navigateToHomepage();

    enhancedLogger.step('Step 2: Click the "API" navigation tab', xrayTestKey);
    await playwrightDev.clickApiTab();

    enhancedLogger.step('Step 3: Verify page title contains "Playwright Library"', xrayTestKey);
    await playwrightDev.verifyPageTitleContains('Playwright Library');

    enhancedLogger.step('Step 4: Verify heading text is "Playwright Library"', xrayTestKey);
    await playwrightDev.verifyMainHeadingContains('Playwright Library');

    enhancedLogger.step('Step 5: Verify URL contains "/docs/api/class-playwright"', xrayTestKey);
    await playwrightDev.verifyUrlContains('/docs/api/class-playwright');

    enhancedLogger.pass(
      'TC09 passed — API tab navigated to Playwright Library page',
      xrayTestKey
    );
  }
);
```

---

## 8. Step 6 — Write TC10 (Community Tab)

```typescript
test(
  'TC10: Click Community tab and verify Welcome page title',
  { annotation: { type: 'xray', description: 'PROJ-110' } },
  async ({ page, xrayTestKey }) => {
    const playwrightDev = new PlaywrightDevPage(page);

    enhancedLogger.step('Step 1: Navigate to the homepage', xrayTestKey);
    await playwrightDev.navigateToHomepage();

    enhancedLogger.step('Step 2: Click the "Community" navigation tab', xrayTestKey);
    await playwrightDev.clickCommunityTab();

    enhancedLogger.step('Step 3: Verify page title contains "Welcome"', xrayTestKey);
    await playwrightDev.verifyPageTitleContains('Welcome');

    enhancedLogger.step('Step 4: Verify heading text is "Welcome"', xrayTestKey);
    await playwrightDev.verifyMainHeadingContains('Welcome');

    enhancedLogger.step('Step 5: Verify URL contains "/community/welcome"', xrayTestKey);
    await playwrightDev.verifyUrlContains('/community/welcome');

    enhancedLogger.pass(
      'TC10 passed — Community tab navigated to Welcome page',
      xrayTestKey
    );
  }
);
```

---

## 9. Step 7 — Write TC11 (Python Language Switcher)

### This test is slightly different — it uses a dropdown, not a simple tab click

```typescript
test(
  'TC11: Switch to Python language and verify Python page title',
  { annotation: { type: 'xray', description: 'PROJ-111' } },
  async ({ page, xrayTestKey }) => {
    const playwrightDev = new PlaywrightDevPage(page);

    enhancedLogger.step('Step 1: Navigate to the homepage', xrayTestKey);
    await playwrightDev.navigateToHomepage();

    enhancedLogger.step('Step 2: Open language dropdown and select "Python"', xrayTestKey);
    await playwrightDev.switchLanguageToPython();

    enhancedLogger.step('Step 3: Verify page title contains "Playwright Python"', xrayTestKey);
    await playwrightDev.verifyPageTitleContains('Playwright Python');

    enhancedLogger.step('Step 4: Verify URL contains "/python/"', xrayTestKey);
    await playwrightDev.verifyUrlContains('/python/');

    enhancedLogger.pass(
      'TC11 passed — Language switched to Python successfully',
      xrayTestKey
    );
  }
);
```

> **Key difference:** `switchLanguageToPython()` clicks TWO elements — the dropdown button first, then the "Python" option. The page object hides this complexity from the test.

---

## 10. Step 8 — Run & Verify

```bash
# Run only the new navigation tests (to verify they work)
npx playwright test tests/playwright-dev.test.ts

# Run ALL 13 tests (login + API + navigation + iframe)
npm test

# Run with visible browser to WATCH what's happening
npm run run:headed
```

### Expected terminal output:

```
✅ PASS  [PROJ-107] TC07: Navigate to Homepage and verify Playwright title
✅ PASS  [PROJ-108] TC08: Click Docs tab and verify Installation page title
✅ PASS  [PROJ-109] TC09: Click API tab and verify Playwright Library page title
✅ PASS  [PROJ-110] TC10: Click Community tab and verify Welcome page title
✅ PASS  [PROJ-111] TC11: Switch to Python language and verify Python page title

  13 passed (~50s)
```

### The HTML report automatically includes all 13 tests:

Open `reports/execution-report-YYYY-MM-DD.html` in your browser to see:
- Summary cards now showing 13 tests
- Navigation tests grouped under "🌐 Playwright.dev Navigation Tests"
- Performance metrics for each page navigation
- Accessibility scan results for each page

---

## 11. The Complete File Map

```
Files CREATED (2 new files):
──────────────────────────────────────────────────────────────
  pages/PlaywrightDevPage.ts        ← Page Object (locators + actions)
  tests/playwright-dev.test.ts      ← Test file (5 test cases)

Files NOT CHANGED:
──────────────────────────────────────────────────────────────
  utils/framework/xray-test-fixture.ts        ← Auto-discovers new tests (no change needed)
  utils/framework/global-setup.ts             ← Runs before ALL tests (no change needed)
  utils/framework/global-teardown.ts          ← Generates report for ALL tests (no change needed)
  pages/BasePage.ts                 ← Parent class (already has all common methods)
  playwright.config.ts              ← Already finds **/*.test.ts (no change needed)
  .env                              ← Only need XRAY keys for new test cases
```

### The key takeaway:

> **You only need to create 2 files** to add a whole new test suite.
> The framework's architecture (config auto-discovery, test fixtures, report generator)
> means everything else just works automatically.

---

## 12. Lessons Learned — Patterns You Can Reuse

### Pattern 1: One Page Object per Website/Feature
```
pages/LoginPage.ts           ← for login.test.ts
pages/PlaywrightDevPage.ts   ← for playwright-dev.test.ts
pages/YourNewPage.ts         ← for your-new-feature.test.ts
```

### Pattern 2: Every Test Follows Arrange → Act → Assert
```
ARRANGE: Create page object + navigate to starting page
ACT:     Perform the user action (click tab, fill form, etc.)
ASSERT:  Verify the outcome (title changed, URL changed, text visible)
```

### Pattern 3: Log Every Step for the HTML Report
```typescript
enhancedLogger.step('Step 1: Navigate to the page', xrayTestKey);
// ... action ...
enhancedLogger.step('Step 2: Click the button', xrayTestKey);
// ... action ...
enhancedLogger.pass('TC## passed — description', xrayTestKey);
```

### Pattern 4: Keep Locators in the Page Object, Not in Tests
```
❌ BAD:   await page.getByRole('link', { name: 'Docs' }).click();   ← in the test
✅ GOOD:  await playwrightDev.clickDocsTab();                        ← in the test
          (locator lives in PlaywrightDevPage.ts)
```

### Pattern 5: Use BasePage Methods — Don't Reinvent
```
❌ BAD:   await page.goto('https://...');
          await page.waitForLoadState('domcontentloaded');
          await page.locator('h1').waitFor({ state: 'visible' });

✅ GOOD:  await this.navigate(url, 'Page heading', this.mainHeading);
          (BasePage.navigate() does all 3 things in one call)
```

---

## 🚀 Your Turn — Adding a New Test Suite

Follow these exact steps to add YOUR own tests:

```
□ Step 1: Open the website you want to test in Chrome
□ Step 2: Note down: What tabs/buttons are there? What text appears?
□ Step 3: Right-click elements → Inspect → find the role/name/label
□ Step 4: Create pages/YourPage.ts (copy PlaywrightDevPage.ts as template)
□ Step 5: Add locators for the elements you noted in Step 2-3
□ Step 6: Add action methods (clickXxx, verifyXxx)
□ Step 7: Create tests/your-feature.test.ts (copy playwright-dev.test.ts as template)
□ Step 8: Add test cases using the Arrange → Act → Assert pattern
□ Step 9: Run: npx playwright test tests/your-feature.test.ts
□ Step 10: Open the HTML report and verify everything looks right
```

> 💡 **Testing a page with iframes?** (Salesforce, ServiceNow, Workday)
> See `tests/salesforce-iframe.test.ts` for working examples and
> [WRITE_A_TEST.md → Iframe Testing](WRITE_A_TEST.md#️-iframe-testing--a-beginners-guide)
> for the complete beginner's guide. The 3-step pattern:
> ```typescript
> const basePage = new BasePage(page);
> const frame = basePage.getIframe('#your-iframe');
> await basePage.fillInIframe(frame, '#field', 'value', 'My Field');
> ```

---

*Last updated: 8 March 2026*
*Framework: Playwright AutoAgent – AI Automation Framework*
*Tests: 3 Login (UI; TC01 ×2 data sets) + 3 API (REST) + 5 Navigation (UI) + 2 Iframe (UI) = 14 total executions*
