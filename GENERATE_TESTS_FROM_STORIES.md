# 🔄 Generate Test Cases & Test Scripts from User Stories
### A Complete Step-by-Step Guide — From Acceptance Criteria to Running Tests

---

> **Audience**: Business Analysts, QA Leads, Product Owners, Developers — anyone who wants
> to turn User Stories into automated tests without writing code from scratch.
>
> **Time to generate your first tests**: ~5 minutes.

---

## 📖 What This Guide Covers

This framework includes an **automated pipeline** that converts User Stories (written in simple YAML)
into fully functional test cases and Playwright test scripts — with complete traceability.

```
  ┌─────────────────────┐      npm run generate      ┌────────────────────────────────────────────┐
  │  📖 USER STORY       │  ──────────────────────→   │  📋 TEST_CASES.md (traceability matrix)     │
  │  (YAML file)         │                            │  📝 manual-test-cases/*.md (manual QA TCs)  │
  │                      │                            │  📂 test-data/*.yaml (test data)             │
  │  user-stories/       │                            │  🧪 tests/*.test.ts (test scripts)           │
  │  US-XX-feature.yaml  │                            │  📄 pages/*Page.ts (page objects)            │
  └─────────────────────┘                            └────────────────────────────────────────────┘
```

**The key idea**: You write the **WHAT** (User Stories + Acceptance Criteria), and the
framework generates the **HOW** (manual test cases, test code, test data, page objects, documentation).

---

## 🗺️ End-to-End Flow Overview

```
  ╔═════════════════════════════════════════════════════════════════════════════════╗
  ║                                                                               ║
  ║   STEP 1              STEP 2               STEP 3               STEP 4        ║
  ║   Write User Story → Run Generator →  Review & Customize →  Run Tests         ║
  ║   (YAML)              (npm run             (update selectors   (npm test)      ║
  ║                        generate)            & verify data)                     ║
  ║                                                                               ║
  ║   📖 US-XX.yaml      📋 TEST_CASES.md     🔧 Fix TODOs in     ✅ PASS/FAIL    ║
  ║                       📝 manual test cases   Page Objects        📊 HTML Report ║
  ║                       📂 test data                               📎 XRAY Upload ║
  ║                       📄 page objects                                          ║
  ║                                                                               ║
  ╚═════════════════════════════════════════════════════════════════════════════════╝
```

---

## 🔗 Traceability Chain

Every generated artifact links back to the original User Story:

```
  User Story (WHY)              Acceptance Criteria (WHAT)       Generated Output (HOW)
  ─────────────────────  ───→  ────────────────────────────  ───→  ──────────────────────
  US-05: As a user,            AC-1: Search valid keyword          TC14 in search.test.ts
  I want to search...          → results appear                    → PROJ-201 (XRAY key)
                                                                   → search-tests.yaml
                               AC-2: Search empty string
                               → no results or prompt              TC15 → PROJ-202

                               AC-3: Search nonsense keyword
                               → no results found                  TC16 → PROJ-203
```

| Layer | Artifact | Purpose |
|-------|----------|---------|
| **Business** | `user-stories/US-XX-feature.yaml` | User Story + Acceptance Criteria (source of truth) |
| **Documentation** | `TEST_CASES.md` | Test cases with steps, expected results, traceability |
| **Manual QA** | `manual-test-cases/US-XX-*-test-cases.md` | Standalone manual test cases (preconditions, steps, expected results, pass/fail) |
| **Test Data** | `test-data/<feature>-tests.yaml` | YAML-driven data (keywords, URLs, expected values) |
| **Test Script** | `tests/<feature>.test.ts` | Playwright test code linked to XRAY keys |
| **Page Object** | `pages/<Feature>Page.ts` | Reusable page interaction methods |

---

# ═══════════════════════════════════════════════════════════════════════════
# STEP 1: WRITE A USER STORY (YAML)
# ═══════════════════════════════════════════════════════════════════════════

## 1.1 — Copy the Template

```bash
cp user-stories/_TEMPLATE.yaml user-stories/US-06-checkout.yaml
```

> Replace `US-06-checkout` with your story ID and feature name.
> Naming convention: `US-XX-short-description.yaml`

## 1.2 — Fill In the Story Details

Open the new file and fill in these sections:

### Section A: Story Metadata

```yaml
# ─── STORY METADATA ───
storyId: "US-06"
title: "Checkout Flow"
description: "As a customer, I want to complete the checkout process, so that I can purchase items in my cart."
priority: "High"
module: "Checkout"
baseUrl: "https://myapp.com"
pagePath: "/checkout"
```

| Field | What to Put | Example |
|-------|-------------|---------|
| `storyId` | Unique ID, sequential (US-06, US-07, ...) | `"US-06"` |
| `title` | Short feature name | `"Checkout Flow"` |
| `description` | Agile user story format: As a [role], I want [action], so that [benefit] | See above |
| `priority` | `Critical`, `High`, `Medium`, or `Low` | `"High"` |
| `module` | Feature area / module name | `"Checkout"` |
| `baseUrl` | Full URL of the application under test | `"https://myapp.com"` |
| `pagePath` | Starting page path (appended to baseUrl) | `"/checkout"` |

### Section B: Output Configuration

```yaml
# ─── OUTPUT CONFIGURATION ───
output:
  dataFile: "checkout-tests.yaml"       # → test-data/checkout-tests.yaml
  testFile: "checkout.test.ts"          # → tests/checkout.test.ts
  pageObject: "CheckoutPage"            # → pages/CheckoutPage.ts
  testGroup: "Checkout Flow Tests"      # test.describe('...')
```

| Field | What to Put | Generated File |
|-------|-------------|----------------|
| `dataFile` | YAML filename for test data | `test-data/checkout-tests.yaml` |
| `testFile` | Test script filename | `tests/checkout.test.ts` |
| `pageObject` | Class name (PascalCase, ends with `Page`) | `pages/CheckoutPage.ts` |
| `testGroup` | Label for the test group (shown in reports) | Used in `test.describe(...)` |

### Section C: Acceptance Criteria (This Is the Most Important Part!)

Each acceptance criterion becomes **one test case**. Write them like you would in JIRA or any requirements tool.

```yaml
# ─── ACCEPTANCE CRITERIA ───
acceptanceCriteria:

  - id: "PROJ-301"                         # XRAY test case key
    tcId: "TC17"                           # Test case number (continue from last)
    title: "Add item to cart and proceed to checkout"
    type: "positive"                       # positive | negative | boundary | smoke
    priority: "high"                       # critical | high | medium | low
    preconditions:
      - "User is logged in"
      - "Cart has at least one item"
    steps:
      - action: "Navigate to the cart page"
        expected: "Cart page loads showing items"
      - action: "Click the checkout button"
        expected: "Checkout form appears"
      - action: "Fill in shipping address"
        expected: "Address fields are populated"
      - action: "Click the place order button"
        expected: "Order confirmation page appears"
      - action: "Verify order confirmation message"
        expected: "Message contains order number"
    testData:
      itemName: "Playwright Book"
      quantity: 1
      shippingAddress: "123 Test Street"
      expectedMessage: "Order placed successfully"

  - id: "PROJ-302"
    tcId: "TC18"
    title: "Checkout with empty cart should show error"
    type: "negative"
    priority: "medium"
    preconditions:
      - "User is logged in"
      - "Cart is empty"
    steps:
      - action: "Navigate to the cart page"
        expected: "Cart page loads showing empty message"
      - action: "Click the checkout button"
        expected: "Error message is displayed"
      - action: "Verify the error says cart is empty"
        expected: "Error message contains 'cart is empty'"
    testData:
      expectedError: "Your cart is empty"
```

#### Field Reference for Each Acceptance Criterion

| Field | Required | What to Put | Example |
|-------|----------|-------------|---------|
| `id` | ✅ | XRAY test case key (PROJ-XXX) | `"PROJ-301"` |
| `tcId` | ✅ | Test case number (sequential) | `"TC17"` |
| `title` | ✅ | What this test verifies (plain English) | `"Add item to cart..."` |
| `type` | ✅ | `positive`, `negative`, `boundary`, or `smoke` | `"positive"` |
| `priority` | ✅ | `critical`, `high`, `medium`, or `low` | `"high"` |
| `preconditions` | ✅ | List of things that must be true before test runs | `["User is logged in"]` |
| `steps` | ✅ | Ordered list of `action` + `expected` pairs | See examples above |
| `testData` | ✅ | Key-value pairs of data used in the test | `{ keyword: "hello" }` |

#### How to Write Good Steps

The generator reads the `action` text and intelligently maps it to code. Here are the **action keywords** it recognizes:

| Action Keyword | What It Generates | Example Action Text |
|----------------|-------------------|---------------------|
| `click`, `press`, `tap` | Click a button/link | `"Click the checkout button"` |
| `open` + modal/dialog/search | Open a modal/popup | `"Open the search modal"` |
| `submit` | Submit a form | `"Submit the order form"` |
| `type`, `enter`, `input`, `fill` | Fill a text field | `"Type 'locator' into the search field"` |
| `verify`, `assert`, `check` | Assert/validate something | `"Verify the success message appears"` |
| `navigate`, `go to`, `load`, `browse` | Navigate to a URL | `"Navigate to the cart page"` |
| `wait`, `pause` | Wait for something | `"Wait for the loading spinner to disappear"` |
| `scroll` | Scroll the page | `"Scroll to the bottom of the page"` |
| `select`, `choose`, `pick` | Select a dropdown option | `"Select 'Express' from shipping options"` |

> 💡 **Tip**: Write steps in plain English — the generator is smart enough to pick up the intent.
> If it can't figure out the action, it generates a `TODO` comment for you to customize.

---

# ═══════════════════════════════════════════════════════════════════════════
# STEP 2: RUN THE GENERATOR
# ═══════════════════════════════════════════════════════════════════════════

## 2.1 — Generate Everything (Recommended)

```bash
npm run generate
```

This single command generates **all five outputs**:
1. ✅ Appends test cases to `TEST_CASES.md`
2. ✅ Creates `manual-test-cases/US-XX-*-test-cases.md` (standalone manual QA test cases)
3. ✅ Creates `test-data/<dataFile>.yaml`
4. ✅ Creates `tests/<testFile>.test.ts`
5. ✅ Creates `pages/<PageObject>.ts`

## 2.2 — Generate Only Test Cases + Manual TCs + Data (No Scripts)

```bash
npm run generate:tc
```

Use this when you only want documentation, manual test cases, and test data — no code generation.

## 2.3 — Generate Only Manual Test Case Documents

```bash
npm run generate:manual
```

Use this when you **only** want the standalone manual test case files — no code, no traceability matrix updates.
Perfect for QA teams that execute tests manually.

## 2.4 — Generate Only Scripts + Page Objects (No Docs)

```bash
npm run generate:scripts
```

Use this when test cases are already documented and you only need the automation code.

## 2.5 — Generate for a Specific User Story Only

```bash
npm run generate -- US-06-checkout
```

> Pass the filename (without `.yaml`) to generate for just one story.

## What Gets Generated — Output Summary

After running `npm run generate` for a story like `US-06-checkout.yaml` with 2 acceptance criteria:

```
  ✅ TEST_CASES.md                                            ← Appended with US-06 section
  ✅ manual-test-cases/US-06-checkout-flow-test-cases.md       ← Manual QA test cases
  ✅ test-data/checkout-tests.yaml                             ← Test data for TC17, TC18
  ✅ tests/checkout.test.ts                                    ← Playwright test script
  ✅ pages/CheckoutPage.ts                                     ← Page Object Model
```

**Console output** will look like:

```
═══════════════════════════════════════════════════════════════════════
  🚀 Playwright AutoAgent — Test Generator Pipeline
═══════════════════════════════════════════════════════════════════════

  Processing: user-stories/US-06-checkout.yaml
  ✅ TEST_CASES.md section appended for US-06
  ✅ Generated: test-data/checkout-tests.yaml
  ✅ Generated: tests/checkout.test.ts
  ✅ Generated: pages/CheckoutPage.ts

  ═══════════════════════════════════════════════════════════════════
  ✅ Generation complete! 1 story processed, 4 files generated.
  ═══════════════════════════════════════════════════════════════════
```

---

# ═══════════════════════════════════════════════════════════════════════════
# STEP 3: REVIEW & CUSTOMIZE THE GENERATED CODE
# ═══════════════════════════════════════════════════════════════════════════

The generator creates working code scaffolding, but you need to **customize the selectors**
(locators) to match your actual application's UI. Here's what to look for:

## 3.1 — Review the Generated Test Data

Open `test-data/checkout-tests.yaml`:

```yaml
# ─── TC17: Add item to cart and proceed to checkout
PROJ-301:
  run: yes                                    # ← Set to "no" to skip this test
  testCase: "TC17: Add item to cart and proceed to checkout"
  type: "positive"
  baseUrl: "https://myapp.com"
  pagePath: "/checkout"
  itemName: "Playwright Book"                 # ← Your test data from the story
  quantity: 1
  shippingAddress: "123 Test Street"
  expectedMessage: "Order placed successfully"
```

**What to verify:**
- ✅ `baseUrl` and `pagePath` are correct
- ✅ Test data values match what your application expects
- ✅ `run: yes` for tests you want to execute (set `run: no` to skip)
- 🔐 Use `${ENC:...}` for passwords (run `npm run encrypt-password` to generate)

## 3.2 — Review the Generated Page Object

Open `pages/CheckoutPage.ts` — look for `TODO` markers:

```typescript
export class CheckoutPage extends BasePage {

  // ════════════════════════════════════════════════════════════
  // LOCATORS — TODO: Update these selectors to match your app
  // ════════════════════════════════════════════════════════════

  // TODO: Add specific locators for clickable elements
  // Example:
  // private get checkoutBtn() { return this.page.getByRole('button', { name: 'Checkout' }); }

  // TODO: Add locators for input fields
  // Example:
  // private get addressInput() { return this.page.getByPlaceholder('Shipping address'); }
```

**What to customize:**
1. **Add real locators** — Replace `TODO` comments with actual selectors from your app
2. **Update `performClick()`** — Map element names to real locators
3. **Update `fillField()`** — Map field names to real input locators
4. **Update `verifyMessage()`** — Add selectors for success/error messages

### Example: Before & After Customization

**Before** (auto-generated):
```typescript
async performClick(elementName: string): Promise<void> {
  // TODO: Map to actual selectors
  const el = this.page.getByRole('button', { name: new RegExp(elementName, 'i') });
  await el.click({ timeout: 10_000 });
}
```

**After** (customized for your app):
```typescript
async performClick(elementName: string): Promise<void> {
  const map: Record<string, Locator> = {
    'checkout button': this.page.getByRole('button', { name: 'Proceed to Checkout' }),
    'place order':     this.page.getByTestId('place-order-btn'),
    'continue':        this.page.getByRole('link', { name: 'Continue Shopping' }),
  };
  const el = map[elementName.toLowerCase()];
  if (!el) throw new Error(`Unknown element: ${elementName}`);
  await el.click({ timeout: 10_000 });
}
```

## 3.3 — Review the Generated Test Script

Open `tests/checkout.test.ts` — the structure is already complete:

```typescript
test.describe('Checkout Flow Tests', () => {

  // ── TC17: Add item to cart and proceed to checkout ──
  test('TC17: Add item to cart and proceed to checkout [default]', {
    annotation: { type: 'xray', description: 'PROJ-301' },
  }, async ({ page, xrayTestKey }) => {

    const checkoutPage = new CheckoutPage(page);

    // Step 1: Navigate to the cart page
    await checkoutPage.navigateTo('/checkout');

    // Step 2: Click the checkout button
    await checkoutPage.performClick('checkout button');   // ← uses your Page Object

    // Step 3: Fill in shipping address
    await checkoutPage.fillField('address', ds.shippingAddress);

    // Step 4: Click the place order button
    await checkoutPage.performClick('place order');

    // Step 5: Verify order confirmation message
    await checkoutPage.verifyMessage(ds.expectedMessage);
  });
});
```

**What to verify:**
- ✅ Step sequence matches your user story
- ✅ Page object method names make sense
- ✅ XRAY annotation has the correct key (`PROJ-301`)
- 🔧 Add additional `expect()` assertions if the generated ones aren't enough

---

# ═══════════════════════════════════════════════════════════════════════════
# STEP 4: RUN THE TESTS
# ═══════════════════════════════════════════════════════════════════════════

## 4.1 — Run All Tests

```bash
npm test                            # Run all tests (original + generated)
```

## 4.2 — Run Only the Generated Test File

```bash
npx playwright test tests/checkout.test.ts
```

## 4.3 — Run Headless and Generate HTML Report

```bash
npm run run:headless                # Runs all tests + opens HTML report
```

## 4.4 — Run in Headed Mode (See the Browser)

```bash
npm run run:headed                  # Watch the browser execute each step
```

## 4.5 — Skip Generated Tests Without Deleting Them

Set `run: no` in the test data YAML:

```yaml
PROJ-301:
  run: no              # ← This test will be skipped
  testCase: "TC17: ..."
```

---

# ═══════════════════════════════════════════════════════════════════════════
# REAL EXAMPLE: US-05 SEARCH FUNCTIONALITY
# ═══════════════════════════════════════════════════════════════════════════

Here's the complete real example that ships with the framework:

## User Story (Input)

**File**: `user-stories/US-05-search.yaml`

```yaml
storyId: "US-05"
title: "Search Functionality"
description: "As a user, I want to search for content on the website,
              so that I can quickly find relevant information."
priority: "High"
module: "Search"
baseUrl: "https://playwright.dev"
pagePath: "/docs/intro"

output:
  dataFile: "search-tests.yaml"
  testFile: "search.test.ts"
  pageObject: "SearchPage"
  testGroup: "Search Feature Tests"

acceptanceCriteria:

  - id: "PROJ-201"
    tcId: "TC14"
    title: "Search for a valid keyword and verify results appear"
    type: "positive"
    priority: "high"
    preconditions:
      - "Website is accessible"
      - "Search functionality is available on the page"
    steps:
      - action: "Navigate to the documentation page"
        expected: "Docs page loads with search icon visible"
      - action: "Click the search icon / press Ctrl+K to open search"
        expected: "Search modal opens with input field focused"
      - action: "Type 'locator' into the search field"
        expected: "Search results appear showing matches"
      - action: "Verify at least one result contains the keyword"
        expected: "Results list has items matching 'locator'"
    testData:
      searchKeyword: "locator"
      expectedMinResults: 1
      expectedUrlFragment: "/docs"

  - id: "PROJ-202"
    tcId: "TC15"
    title: "Search for an empty string should show no results or prompt"
    type: "negative"
    steps:
      - action: "Navigate to the documentation page"
        expected: "Docs page loads"
      - action: "Open the search modal"
        expected: "Search modal opens"
      - action: "Submit search with empty input"
        expected: "No results shown or a helpful prompt is displayed"
    testData:
      searchKeyword: ""
      expectedMinResults: 0

  - id: "PROJ-203"
    tcId: "TC16"
    title: "Search for a nonsense keyword should show no results"
    type: "negative"
    steps:
      - action: "Navigate to the documentation page"
        expected: "Docs page loads"
      - action: "Open the search modal"
        expected: "Search modal opens"
      - action: "Type 'xyzzynonexistent99' into the search field"
        expected: "No results found message is displayed"
    testData:
      searchKeyword: "xyzzynonexistent99"
      expectedMinResults: 0
      expectedNoResultsMessage: "No results"
```

## Generated Outputs

After running `npm run generate`, four files were created:

### Output 1: TEST_CASES.md (appended)

A full test case section was appended to `TEST_CASES.md` with:
- US-05 User Story description
- TC14, TC15, TC16 with steps, expected results, preconditions
- Traceability links (XRAY key → test file → data file)

### Output 2: test-data/search-tests.yaml

```yaml
PROJ-201:
  run: yes
  testCase: "TC14: Search for a valid keyword and verify results appear"
  type: "positive"
  baseUrl: "https://playwright.dev"
  pagePath: "/docs/intro"
  searchKeyword: "locator"
  expectedMinResults: 1

PROJ-202:
  run: yes
  testCase: "TC15: Search for an empty string should show no results or prompt"
  type: "negative"
  baseUrl: "https://playwright.dev"
  pagePath: "/docs/intro"
  searchKeyword: ""
  expectedMinResults: 0

PROJ-203:
  run: yes
  testCase: "TC16: Search for a nonsense keyword should show no results"
  type: "negative"
  baseUrl: "https://playwright.dev"
  pagePath: "/docs/intro"
  searchKeyword: "xyzzynonexistent99"
  expectedMinResults: 0
  expectedNoResultsMessage: "No results"
```

### Output 3: tests/search.test.ts

Auto-generated Playwright test with:
- 3 test cases (TC14, TC15, TC16)
- XRAY annotations (`PROJ-201`, `PROJ-202`, `PROJ-203`)
- Step-by-step logging matching the acceptance criteria
- Data-driven using `getTestData()` from search-tests.yaml

### Output 4: pages/SearchPage.ts

Auto-generated Page Object with:
- `navigateTo()` — navigate to any page
- `performClick()` — click buttons/icons (needs selector customization)
- `fillField()` — type into input fields (needs selector customization)
- `submitForm()` — submit forms
- `verifyMessage()` — verify success/error text
- `getResultCount()` — count search results

---

# ═══════════════════════════════════════════════════════════════════════════
# TIPS, FAQ & BEST PRACTICES
# ═══════════════════════════════════════════════════════════════════════════

## 💡 Best Practices

| Practice | Why |
|----------|-----|
| **One acceptance criterion = one test case** | Keeps tests focused and traceable |
| **Use sequential TC IDs** | `TC14, TC15, TC16...` — check `TEST_CASES.md` for the latest |
| **Use sequential PROJ keys** | `PROJ-201, PROJ-202...` — check the last used key |
| **Write steps in plain English** | The generator maps keywords to code automatically |
| **Include both positive AND negative tests** | Cover happy path + error scenarios |
| **Set `run: no` instead of deleting** | Keeps traceability intact, easy to re-enable |
| **Customize Page Objects ONCE** | After that, new tests reuse the same selectors |

## ❓ Frequently Asked Questions

### Q: What happens if I run `generate` twice for the same story?

The generator **appends** to `TEST_CASES.md` and **overwrites** the other files (test data, scripts, page objects).
If you've customized the page object, back it up first or only run `generate:tc`.

### Q: How do I know what TC number to use next?

Check `TEST_CASES.md` — the last test case shows the highest number. The sample framework
uses TC01–TC13 for built-in tests, and TC14+ for generated ones.

### Q: How do I know what PROJ key to use next?

Check the last used key in `TEST_CASES.md`. Built-in tests use `PROJ-101` to `PROJ-113`.
The sample search story uses `PROJ-201` to `PROJ-203`. You can use any numbering scheme.

### Q: Can I add parameterized tests (multiple data sets)?

Yes! After generation, add `dataSets:` to the test data YAML:

```yaml
PROJ-301:
  run: yes
  testCase: "TC17: Add item to cart"
  dataSets:
    - label: "Standard item"
      itemName: "Book"
      quantity: 1
    - label: "Bulk order"
      itemName: "Notebooks"
      quantity: 50
```

### Q: Can I use encrypted passwords in generated tests?

Yes! After generation, replace the password value in the YAML with:

```yaml
password: "${ENC:U2FsdGVkX1...your-encrypted-value}"
```

Generate the encrypted value with: `npm run encrypt-password`

### Q: Do I need to understand TypeScript to use this?

**No!** You only write YAML (the user story). The generator creates all the TypeScript code.
You only need to update **selectors** in the Page Object — and those are just CSS/HTML identifiers,
not programming logic.

### Q: How does the generator decide what code to write for each step?

It reads the `action` text and looks for keywords:

| If the action contains... | Generated code |
|---------------------------|----------------|
| `click`, `press`, `tap` | `page.click()` or `performClick()` |
| `open` + `modal`/`dialog`/`search` | `performClick()` (treated as click) |
| `submit` | `submitForm()` |
| `type`, `fill`, `enter`, `input` | `fillField()` |
| `verify`, `assert`, `check` | `verifyMessage()` or `expect()` |
| `navigate`, `go to`, `load` | `navigateTo()` |
| `wait`, `pause` | `page.waitForTimeout()` |
| `scroll` | `page.evaluate(() => window.scrollTo(...))` |
| `select`, `choose`, `pick` | `page.selectOption()` |
| *(anything else)* | `TODO` comment for manual implementation |

---

## 📋 Quick-Reference Cheat Sheet

```bash
# ─── Create a new user story ───
cp user-stories/_TEMPLATE.yaml user-stories/US-07-profile.yaml
# Edit the file, fill in acceptance criteria

# ─── Generate everything ───
npm run generate                        # Full pipeline

# ─── Generate partial ───
npm run generate:tc                     # Test cases + manual TCs + YAML data only
npm run generate:manual                 # Manual test case documents only
npm run generate:scripts                # Test scripts + page objects only
npm run generate -- US-07-profile       # One specific story only

# ─── Review generated files ───
# → manual-test-cases/US-07-*-test-cases.md (manual QA test cases — ready to use!)
# → test-data/profile-tests.yaml       (verify data)
# → pages/ProfilePage.ts               (customize selectors — fix TODOs)
# → tests/profile.test.ts              (review test structure)
# → TEST_CASES.md                       (verify documentation)

# ─── Run tests ───
npm test                                # All tests
npx playwright test tests/profile.test.ts  # Just the generated file
npm run run:headless                    # All tests + HTML report

# ─── Skip generated tests temporarily ───
# Edit test-data/profile-tests.yaml → set run: no
```

---

## 📎 Related Documentation

| Document | What You'll Learn |
|----------|-------------------|
| [README.md](README.md) | Full framework setup, all npm commands |
| [WRITE_A_TEST.md](WRITE_A_TEST.md) | Manual test writing (without the generator) |
| [TEST_CASES.md](TEST_CASES.md) | See the generated test case documentation |
| [CAPABILITIES.md](CAPABILITIES.md) | All framework features explained |
| [GETTING_STARTED.md](GETTING_STARTED.md) | First-time setup for new users |
| `user-stories/_TEMPLATE.yaml` | Blank template to copy |
| `user-stories/US-05-search.yaml` | Complete working example |

---

> **Remember**: You write the **User Story** (plain English YAML), the framework generates
> the **Test Cases** and **Test Scripts**. You just review, customize selectors, and run. 🚀
