// =============================================================================
// tests/playwright-dev.test.ts — PLAYWRIGHT.DEV NAVIGATION TEST SUITE
// =============================================================================
//
// ┌──────────────────────────────────────────────────────────────────────────┐
// │  📖 FOR NOVICE READERS — WHAT IS THIS FILE?                             │
// │                                                                          │
// │  This is a TEST FILE. It contains 5 test cases that automatically       │
// │  open a browser, navigate to https://playwright.dev/, click on          │
// │  different tabs, and verify each page loaded correctly.                  │
// │                                                                          │
// │  EACH TEST FOLLOWS THE SAME 3-STEP PATTERN:                             │
// │    Step 1: Navigate to the website (open the homepage)                  │
// │    Step 2: Click a specific tab/link in the navigation bar              │
// │    Step 3: Verify the page title and heading are correct                │
// │                                                                          │
// │  HOW TO RUN THESE TESTS:                                                │
// │    npm run test:headed           ← see the browser (recommended first   │
// │                                    time to watch what's happening)       │
// │    npm test                      ← headless (no visible browser, faster)│
// │    npx playwright test tests/playwright-dev.test.ts  ← run ONLY this   │
// │                                                                          │
// │  TEST SCENARIOS:                                                         │
// │    TC07: Open Homepage          → verify title "Playwright"             │
// │    TC08: Click Docs tab         → verify title "Installation"           │
// │    TC09: Click API tab          → verify title "Playwright Library"     │
// │    TC10: Click Community tab    → verify title "Welcome"                │
// │    TC11: Switch to Python       → verify title "Playwright Python"      │
// │                                                                          │
// │  MAPPING TO THE USER'S ORIGINAL 5 SCENARIOS:                            │
// │    "Valid Login → Dashboard"    → TC07: Navigate to Home, verify title  │
// │    "Navigate Profile"           → TC08: Click Docs tab, verify title    │
// │    "Navigate Settings"          → TC09: Click API tab, verify title     │
// │    "Navigate Reports"           → TC10: Click Community, verify title   │
// │    "Navigate Users"             → TC11: Switch to Python, verify title  │
// │                                                                          │
// │  NOTE: playwright.dev is a public docs site — it has no login,          │
// │  profile, settings, reports, or users pages. So we map each scenario    │
// │  to a REAL navigation action on the site. The testing PATTERN is        │
// │  identical: navigate → click → verify.                                  │
// └──────────────────────────────────────────────────────────────────────────┘
//
// =============================================================================

// =============================================================================
// STEP-BY-STEP: HOW A NOVICE CREATES THIS FILE USING THE FRAMEWORK
// =============================================================================
//
//  ┌───────────────────────────────────────────────────────────────────────┐
//  │  RECIPE: ADDING A NEW TEST FILE (5 steps)                            │
//  │                                                                       │
//  │  STEP 1: CREATE THE FILE                                              │
//  │    Create a new file in tests/ folder with name ending in .test.ts    │
//  │    Example: tests/playwright-dev.test.ts                              │
//  │                                                                       │
//  │  STEP 2: ADD THE IMPORTS (copy these 3 lines)                        │
//  │    import { test, expect } from '../utils/framework/xray-test-fixture';│
//  │    import { PlaywrightDevPage } from '../pages/PlaywrightDevPage';    │
//  │    import { enhancedLogger } from '../utils/helpers/enhanced-logger';  │
//  │                                                                       │
//  │  STEP 3: CREATE A TEST GROUP                                          │
//  │    test.describe('Your Test Group Name', () => {                      │
//  │      // your tests go inside here                                     │
//  │    });                                                                │
//  │                                                                       │
//  │  STEP 4: ADD A TEST (copy this template)                             │
//  │    test('TC01: Description of what this tests',                       │
//  │      { annotation: { type: 'xray', description: 'PROJ-XXX' } },      │
//  │      async ({ page, xrayTestKey }) => {                               │
//  │        const myPage = new PlaywrightDevPage(page);                    │
//  │        // your test steps here                                        │
//  │      }                                                                │
//  │    );                                                                 │
//  │                                                                       │
//  │  STEP 5: RUN IT                                                       │
//  │    npx playwright test tests/playwright-dev.test.ts                   │
//  └───────────────────────────────────────────────────────────────────────┘
//
// =============================================================================

// ─────────────────────────────────────────────────────────────────────────────
// IMPORT 1: Custom test function with XRAY integration
// ─────────────────────────────────────────────────────────────────────────────
// WHY NOT "@playwright/test"?
//   Our custom xray-test-fixture wraps every test with:
//     ✅ Automatic XRAY result reporting (PASS/FAIL → JIRA)
//     ✅ Automatic screenshot on failure
//     ✅ Automatic accessibility scan after each UI test
//     ✅ Performance metrics collection (page load, FCP, LCP)
//   You get all of this for FREE just by using this import.
// ─────────────────────────────────────────────────────────────────────────────
import { test, expect } from '../utils/framework/xray-test-fixture';

// ─────────────────────────────────────────────────────────────────────────────
// IMPORT 2: The Page Object for playwright.dev
// ─────────────────────────────────────────────────────────────────────────────
// This class knows HOW to interact with playwright.dev:
//   - Where the Docs/API/Community links are (locators)
//   - How to click them and verify the page changed (methods)
// ─────────────────────────────────────────────────────────────────────────────
import { PlaywrightDevPage } from '../pages/PlaywrightDevPage';

// ─────────────────────────────────────────────────────────────────────────────
// IMPORT 3: Enhanced Logger — every step logged here shows in the HTML report
// ─────────────────────────────────────────────────────────────────────────────
// enhancedLogger.step('message')   → appears as a step in the report
// enhancedLogger.pass('message')   → appears as a green pass in the report
// enhancedLogger.section('header') → creates a visual divider in the report
// ─────────────────────────────────────────────────────────────────────────────
import { enhancedLogger } from '../utils/helpers/enhanced-logger';

// ─────────────────────────────────────────────────────────────────────────────
// IMPORT 4: Data-driven test data loader (reads from YAML files)
// ─────────────────────────────────────────────────────────────────────────────
// All test inputs (expected titles, headings, URLs) are stored externally in:
//   test-data/ui-tests.yaml
// Each test reads its data using getTestData('ui-tests.yaml', 'PROJ-XXX').
// To skip a test, set  run: no  next to the PROJ-XXX key in the YAML file.
// ─────────────────────────────────────────────────────────────────────────────
import { getTestData, getTestDataSets, isTestEnabled } from '../utils/helpers/test-data-loader';

// =============================================================================
// TEST DATA FILE — DATA-DRIVEN (loaded from test-data/ui-tests.yaml)
// =============================================================================
const DATA_FILE = 'ui-tests.yaml';


// =============================================================================
// TEST GROUP: Playwright.dev Navigation Tests
// =============================================================================
// test.describe() groups related tests. The name shows in test reports as a
// section header, making the report easy to scan.
// =============================================================================
test.describe('Playwright.dev Navigation Tests', () => {

  // ============================================================================
  // TEST 1 (TC07): Navigate to Homepage and Verify Title
  // ============================================================================
  //
  //  ┌──────────────────────────────────────────────────────────────────────┐
  //  │  ORIGINAL SCENARIO: "Valid Login → verify Dashboard title"           │
  //  │                                                                      │
  //  │  WHAT THIS TEST DOES:                                                │
  //  │    1. Opens https://playwright.dev/ in a Chrome browser              │
  //  │    2. Waits for the page to fully load                               │
  //  │    3. Checks that the page title contains "Playwright"               │
  //  │    4. Checks that the main heading says "Playwright enables..."      │
  //  │                                                                      │
  //  │  WHY THIS MATTERS:                                                   │
  //  │    This is the most basic "smoke test" — can the site even load?     │
  //  │    If the homepage fails, everything else will fail too.              │
  //  │                                                                      │
  //  │  XRAY MAPPING:                                                       │
  //  │    annotation 'PROJ-107' → result sent to XRAY test case PROJ-107   │
  //  │    (Change this to YOUR actual XRAY test case key)                   │
  //  └──────────────────────────────────────────────────────────────────────┘
  //
  // ============================================================================
  // ── Data-driven: load all data sets for PROJ-107 ──
  const proj107Enabled = isTestEnabled(DATA_FILE, 'PROJ-107');
  const proj107Sets    = getTestDataSets(DATA_FILE, 'PROJ-107');

  for (const ds of proj107Sets) {
  test(
    `TC07: Navigate to Homepage and verify Playwright title [${ds.label}]`,
    {
      annotation: { type: 'xray', description: 'PROJ-107' },
    },
    async ({ page, xrayTestKey }) => {
      if (!proj107Enabled) test.skip();

      enhancedLogger.section(`▶ Running Test: TC07 [${ds.label}] | XRAY: ${xrayTestKey}`);
      enhancedLogger.info(`📂 Test data loaded from ${DATA_FILE} for ${xrayTestKey} [${ds.label}]`, xrayTestKey);

      const devPage = new PlaywrightDevPage(page);

      enhancedLogger.step('Step 1: Navigate to the Playwright.dev homepage', xrayTestKey);
      await devPage.navigateToHomePage();

      enhancedLogger.step(`Step 2: Verify page title contains "${ds.expectedTitle}"`, xrayTestKey);
      await devPage.verifyPageTitle(ds.expectedTitle as string);

      enhancedLogger.step(`Step 3: Verify homepage heading text`, xrayTestKey);
      await devPage.verifyHeadingText(ds.expectedHeading as string);

      enhancedLogger.step(`Step 4: Verify URL contains "${ds.expectedUrl}"`, xrayTestKey);
      await devPage.verifyUrl(ds.expectedUrl as string);

      enhancedLogger.pass(`TC07 passed — Homepage loaded with correct title and heading`, xrayTestKey);
    }
  );
  } // end for ds of proj107Sets


  // ============================================================================
  // TEST 2 (TC08): Click Docs Tab and Verify Title
  // ============================================================================
  //
  //  ┌──────────────────────────────────────────────────────────────────────┐
  //  │  ORIGINAL SCENARIO: "Navigate Profile → verify title"                │
  //  │                                                                      │
  //  │  WHAT THIS TEST DOES:                                                │
  //  │    1. Opens the homepage                                             │
  //  │    2. Clicks the "Docs" tab in the top navigation bar               │
  //  │    3. Verifies the page title changes to "Installation | Playwright" │
  //  │    4. Verifies the <h1> heading says "Installation"                 │
  //  │    5. Verifies the URL contains "/docs/intro"                       │
  //  │                                                                      │
  //  │  PATTERN USED:                                                       │
  //  │    Navigate → Click Tab → Verify Title → Verify Heading → Verify URL│
  //  │    This exact pattern repeats for ALL 5 tests. Once you understand   │
  //  │    this one, you understand them all.                                │
  //  └──────────────────────────────────────────────────────────────────────┘
  //
  // ============================================================================
  // ── Data-driven: load all data sets for PROJ-108 ──
  const proj108Enabled = isTestEnabled(DATA_FILE, 'PROJ-108');
  const proj108Sets    = getTestDataSets(DATA_FILE, 'PROJ-108');

  for (const ds of proj108Sets) {
  test(
    `TC08: Click Docs tab and verify Installation page title [${ds.label}]`,
    {
      annotation: { type: 'xray', description: 'PROJ-108' },
    },
    async ({ page, xrayTestKey }) => {
      if (!proj108Enabled) test.skip();

      enhancedLogger.section(`▶ Running Test: TC08 [${ds.label}] | XRAY: ${xrayTestKey}`);
      enhancedLogger.info(`📂 Test data loaded from ${DATA_FILE} for ${xrayTestKey} [${ds.label}]`, xrayTestKey);

      const devPage = new PlaywrightDevPage(page);

      enhancedLogger.step('Step 1: Navigate to the homepage', xrayTestKey);
      await devPage.navigateToHomePage();

      enhancedLogger.step('Step 2: Click the "Docs" navigation tab', xrayTestKey);
      await devPage.clickDocsTab();

      enhancedLogger.step(`Step 3: Verify page title contains "${ds.expectedTitle}"`, xrayTestKey);
      await devPage.verifyPageTitle(ds.expectedTitle as string);

      enhancedLogger.step(`Step 4: Verify heading text is "${ds.expectedHeading}"`, xrayTestKey);
      await devPage.verifyHeadingText(ds.expectedHeading as string);

      enhancedLogger.step(`Step 5: Verify URL contains "${ds.expectedUrl}"`, xrayTestKey);
      await devPage.verifyUrl(ds.expectedUrl as string);

      enhancedLogger.pass(`TC08 passed — Docs tab navigated to Installation page`, xrayTestKey);
    }
  );
  } // end for ds of proj108Sets


  // ============================================================================
  // TEST 3 (TC09): Click API Tab and Verify Title
  // ============================================================================
  //
  //  ┌──────────────────────────────────────────────────────────────────────┐
  //  │  ORIGINAL SCENARIO: "Navigate Settings → verify title"               │
  //  │                                                                      │
  //  │  WHAT THIS TEST DOES:                                                │
  //  │    1. Opens the homepage                                             │
  //  │    2. Clicks the "API" tab in the navbar                            │
  //  │    3. Verifies title contains "Playwright Library"                   │
  //  │    4. Verifies <h1> says "Playwright Library"                       │
  //  │    5. Verifies URL contains "/docs/api/class-playwright"            │
  //  └──────────────────────────────────────────────────────────────────────┘
  //
  // ============================================================================
  // ── Data-driven: load all data sets for PROJ-109 ──
  const proj109Enabled = isTestEnabled(DATA_FILE, 'PROJ-109');
  const proj109Sets    = getTestDataSets(DATA_FILE, 'PROJ-109');

  for (const ds of proj109Sets) {
  test(
    `TC09: Click API tab and verify Playwright Library page title [${ds.label}]`,
    {
      annotation: { type: 'xray', description: 'PROJ-109' },
    },
    async ({ page, xrayTestKey }) => {
      if (!proj109Enabled) test.skip();

      enhancedLogger.section(`▶ Running Test: TC09 [${ds.label}] | XRAY: ${xrayTestKey}`);
      enhancedLogger.info(`📂 Test data loaded from ${DATA_FILE} for ${xrayTestKey} [${ds.label}]`, xrayTestKey);

      const devPage = new PlaywrightDevPage(page);

      enhancedLogger.step('Step 1: Navigate to the homepage', xrayTestKey);
      await devPage.navigateToHomePage();

      enhancedLogger.step('Step 2: Click the "API" navigation tab', xrayTestKey);
      await devPage.clickApiTab();

      enhancedLogger.step(`Step 3: Verify page title contains "${ds.expectedTitle}"`, xrayTestKey);
      await devPage.verifyPageTitle(ds.expectedTitle as string);

      enhancedLogger.step(`Step 4: Verify heading text is "${ds.expectedHeading}"`, xrayTestKey);
      await devPage.verifyHeadingText(ds.expectedHeading as string);

      enhancedLogger.step(`Step 5: Verify URL contains "${ds.expectedUrl}"`, xrayTestKey);
      await devPage.verifyUrl(ds.expectedUrl as string);

      enhancedLogger.pass(`TC09 passed — API tab navigated to Playwright Library page`, xrayTestKey);
    }
  );
  } // end for ds of proj109Sets


  // ============================================================================
  // TEST 4 (TC10): Click Community Tab and Verify Title
  // ============================================================================
  //
  //  ┌──────────────────────────────────────────────────────────────────────┐
  //  │  ORIGINAL SCENARIO: "Navigate Reports → verify title"                │
  //  │                                                                      │
  //  │  WHAT THIS TEST DOES:                                                │
  //  │    1. Opens the homepage                                             │
  //  │    2. Clicks the "Community" tab in the navbar                      │
  //  │    3. Verifies title contains "Welcome"                             │
  //  │    4. Verifies <h1> says "Welcome"                                  │
  //  │    5. Verifies URL contains "/community/welcome"                    │
  //  └──────────────────────────────────────────────────────────────────────┘
  //
  // ============================================================================
  // ── Data-driven: load all data sets for PROJ-110 ──
  const proj110Enabled = isTestEnabled(DATA_FILE, 'PROJ-110');
  const proj110Sets    = getTestDataSets(DATA_FILE, 'PROJ-110');

  for (const ds of proj110Sets) {
  test(
    `TC10: Click Community tab and verify Welcome page title [${ds.label}]`,
    {
      annotation: { type: 'xray', description: 'PROJ-110' },
    },
    async ({ page, xrayTestKey }) => {
      if (!proj110Enabled) test.skip();

      enhancedLogger.section(`▶ Running Test: TC10 [${ds.label}] | XRAY: ${xrayTestKey}`);
      enhancedLogger.info(`📂 Test data loaded from ${DATA_FILE} for ${xrayTestKey} [${ds.label}]`, xrayTestKey);

      const devPage = new PlaywrightDevPage(page);

      enhancedLogger.step('Step 1: Navigate to the homepage', xrayTestKey);
      await devPage.navigateToHomePage();

      enhancedLogger.step('Step 2: Click the "Community" navigation tab', xrayTestKey);
      await devPage.clickCommunityTab();

      enhancedLogger.step(`Step 3: Verify page title contains "${ds.expectedTitle}"`, xrayTestKey);
      await devPage.verifyPageTitle(ds.expectedTitle as string);

      enhancedLogger.step(`Step 4: Verify heading text is "${ds.expectedHeading}"`, xrayTestKey);
      await devPage.verifyHeadingText(ds.expectedHeading as string);

      enhancedLogger.step(`Step 5: Verify URL contains "${ds.expectedUrl}"`, xrayTestKey);
      await devPage.verifyUrl(ds.expectedUrl as string);

      enhancedLogger.pass(`TC10 passed — Community tab navigated to Welcome page`, xrayTestKey);
    }
  );
  } // end for ds of proj110Sets


  // ============================================================================
  // TEST 5 (TC11): Switch to Python Language and Verify Title
  // ============================================================================
  //
  //  ┌──────────────────────────────────────────────────────────────────────┐
  //  │  ORIGINAL SCENARIO: "Navigate Users → verify title"                  │
  //  │                                                                      │
  //  │  WHAT THIS TEST DOES:                                                │
  //  │    1. Opens the homepage                                             │
  //  │    2. Opens the language dropdown (shows "Node.js")                  │
  //  │    3. Selects "Python" from the dropdown                            │
  //  │    4. Verifies the title now contains "Playwright Python"           │
  //  │    5. Verifies URL navigated to /python/                            │
  //  │                                                                      │
  //  │  WHY IS THIS TEST DIFFERENT?                                         │
  //  │    The language switcher is a DROPDOWN — not a simple link.          │
  //  │    This tests a different UI pattern: click dropdown → pick option. │
  //  └──────────────────────────────────────────────────────────────────────┘
  //
  // ============================================================================
  // ── Data-driven: load all data sets for PROJ-111 ──
  const proj111Enabled = isTestEnabled(DATA_FILE, 'PROJ-111');
  const proj111Sets    = getTestDataSets(DATA_FILE, 'PROJ-111');

  for (const ds of proj111Sets) {
  test(
    `TC11: Switch to Python language and verify Python page title [${ds.label}]`,
    {
      annotation: { type: 'xray', description: 'PROJ-111' },
    },
    async ({ page, xrayTestKey }) => {
      if (!proj111Enabled) test.skip();

      enhancedLogger.section(`▶ Running Test: TC11 [${ds.label}] | XRAY: ${xrayTestKey}`);
      enhancedLogger.info(`📂 Test data loaded from ${DATA_FILE} for ${xrayTestKey} [${ds.label}]`, xrayTestKey);

      const devPage = new PlaywrightDevPage(page);

      enhancedLogger.step('Step 1: Navigate to the homepage', xrayTestKey);
      await devPage.navigateToHomePage();

      enhancedLogger.step('Step 2: Open language dropdown and select "Python"', xrayTestKey);
      await devPage.switchToPython();

      enhancedLogger.step(`Step 3: Verify page title contains "${ds.expectedTitle}"`, xrayTestKey);
      await devPage.verifyPageTitle(ds.expectedTitle as string);

      enhancedLogger.step(`Step 4: Verify URL contains "${ds.expectedUrl}"`, xrayTestKey);
      await devPage.verifyUrl(ds.expectedUrl as string);

      enhancedLogger.pass(`TC11 passed — Language switched to Python successfully`, xrayTestKey);
    }
  );
  } // end for ds of proj111Sets

});
