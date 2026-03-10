// =============================================================================
// tests/login.test.ts — LOGIN FEATURE TEST SUITE
// =============================================================================
// PURPOSE:
//   This file contains automated tests for the Login feature of your application.
//
// WHAT IS A "TEST SUITE"?
//   A test suite is a collection of related tests grouped together.
//   All tests in this file are about the login functionality.
//
// HOW PLAYWRIGHT TESTS WORK:
//   - "test.describe()" groups related tests under a common name
//   - "test('test name', async ({ page }) => { ... })" is a single test
//   - "expect(...).toBe(...)" makes assertions (checks if something is true)
//   - If an assertion fails, the test fails immediately with a clear message
//
// HOW XRAY INTEGRATION WORKS HERE:
//   Instead of importing from "@playwright/test", we import from our custom
//   fixture file "xray-test-fixture". This gives us the same "test" function
//   PLUS automatic XRAY result reporting built in.
//
//   Each test has an annotation: { type: 'xray', description: 'PROJ-XXX' }
//   This links the test to a specific XRAY test case.
//   After the test runs, the result is automatically sent to XRAY.
//
// TEST STRUCTURE OVERVIEW:
//   ✅ TEST 1 (PROJ-101): Positive test — valid credentials → should log in
//   ❌ TEST 2 (PROJ-102): Negative test — wrong password → should show error
//   ❌ TEST 3 (PROJ-103): Negative test — empty fields → should show error
//
// HOW TO RUN THESE TESTS:
//   npm test                    → Run all tests
//   npm run test:login          → Run only login tests
//   npm run test:debug          → Run with browser visible (headed mode)
// =============================================================================

// =============================================================================
// IMPORT: Use our CUSTOM test function (not the default Playwright one)
// =============================================================================
// The custom "test" from xray-test-fixture provides:
//   - Everything from standard Playwright test (page, expect, etc.)
//   - xrayTestKey: The XRAY test case ID linked to this test
//   - Automatic result upload to XRAY after each test
import { test, expect } from '../utils/framework/xray-test-fixture';

// Import the LoginPage object (our POM class for the login page)
import { LoginPage } from '../pages/LoginPage';

// Import enhanced logger — every step logged here appears in the HTML report
import { enhancedLogger } from '../utils/helpers/enhanced-logger';

// Import the data-driven test data loader (reads from YAML files)
import { getTestData, getTestDataSets, isTestEnabled } from '../utils/helpers/test-data-loader';

// =============================================================================
// TEST DATA — DATA-DRIVEN (loaded from test-data/ui-tests.yaml)
// =============================================================================
// All test inputs (credentials, expected results) are stored EXTERNALLY in:
//   test-data/ui-tests.yaml
//
// Each test case reads its data using getTestData('ui-tests.yaml', 'PROJ-XXX').
// Data fields are accessed directly: td.username, td.password, etc.
//
// To update credentials or expected messages, edit test-data/ui-tests.yaml.
// To skip a test, set  run: no  next to the PROJ-XXX key in the YAML file.
// =============================================================================
const DATA_FILE = 'ui-tests.yaml';

// =============================================================================
// TEST GROUP: Login Feature Tests
// =============================================================================
// "test.describe()" groups tests together. The name appears in test reports
// as a section header, making the report easy to read.
// =============================================================================
test.describe('Login Feature Tests', () => {

  // ============================================================================
  // TEST 1: Successful Login with Valid Credentials (PARAMETERIZED)
  // ============================================================================
  // WHAT THIS TEST DOES:
  //   1. Opens the login page
  //   2. Enters correct username and password
  //   3. Clicks the Login button
  //   4. Verifies the user is redirected to the dashboard/home page
  //
  // ONE-TO-MANY: This test runs ONCE per dataSets entry in ui-tests.yaml.
  //   If PROJ-101 has 2 dataSets items, Playwright creates 2 separate tests:
  //     TC01 [Standard user]            → runs with data set 1
  //     TC01 [Same user — repeat]       → runs with data set 2
  //   All report to the same XRAY key PROJ-101.
  //
  // XRAY MAPPING:
  //   annotation: { type: 'xray', description: 'PROJ-101' }
  //
  // EXPECTED OUTCOME: PASS (user successfully logs in)
  // ============================================================================

  // ── Skip the whole group if run: no in YAML ──
  const proj101Enabled = isTestEnabled(DATA_FILE, 'PROJ-101');
  const proj101Data    = getTestData(DATA_FILE, 'PROJ-101');
  const proj101Sets    = getTestDataSets(DATA_FILE, 'PROJ-101');

  for (const ds of proj101Sets) {
    test(
      `TC01: Valid credentials should log the user in successfully [${ds.label}]`,
      {
        annotation: { type: 'xray', description: 'PROJ-101' },
      },
      async ({ page, xrayTestKey }) => {

        // ── Skip if run: no in YAML ──
        if (!proj101Enabled) test.skip();

        enhancedLogger.section(`▶ Running Test: ${proj101Data.testCase} [${ds.label}] | XRAY: ${xrayTestKey}`);
        enhancedLogger.info(`📂 Data set ${ds.index + 1}/${proj101Sets.length}: "${ds.label}"`, xrayTestKey);

        const loginPage = new LoginPage(page);

        // Step 1: Open the login page
        enhancedLogger.step('Step 1: Navigate to the login page', xrayTestKey);
        await loginPage.navigateToLoginPage();

        // Step 2: Perform login with credentials from this data set
        enhancedLogger.step(`Step 2: Enter credentials for "${ds.label}" and submit`, xrayTestKey);
        await loginPage.login(ds.username as string, ds.password as string);

        // Step 3: Verify login was successful
        enhancedLogger.step('Step 3: Verify user is now on the Secure Area page', xrayTestKey);
        await loginPage.verifySuccessfulLogin();

        expect(loginPage.getCurrentUrl()).toContain(ds.expectedUrlFragment as string);

        enhancedLogger.pass(`TC01 passed [${ds.label}] — User logged in successfully`, xrayTestKey);
      }
    );
  }

  // ============================================================================
  // TEST 2: Login Should Fail with Wrong Password
  // ============================================================================
  // WHAT THIS TEST DOES:
  //   1. Opens the login page
  //   2. Enters CORRECT username but WRONG password
  //   3. Clicks Login
  //   4. Verifies an error message appears (not logged in)
  //
  // WHY TEST NEGATIVE SCENARIOS?
  //   A good test suite tests not only "happy paths" (things that should work)
  //   but also "unhappy paths" (things that should fail gracefully).
  //   Testing bad credentials ensures your app:
  //     - Doesn't log in unauthorized users
  //     - Shows a clear, helpful error message
  //
  // EXPECTED OUTCOME: PASS (the test verifies the ERROR was shown correctly)
  // ============================================================================
  test(
    'TC02: Wrong password should show an error message',
    {
      annotation: { type: 'xray', description: 'PROJ-102' },
    },
    async ({ page, xrayTestKey }) => {

      // ── Load test data from YAML (data-driven) ──
      const td = getTestData(DATA_FILE, 'PROJ-102');

      // ── Skip if run: no in YAML ──
      if (!isTestEnabled(DATA_FILE, 'PROJ-102')) test.skip();

      enhancedLogger.section(`▶ Running Test: ${td.testCase} | XRAY: ${xrayTestKey}`);
      enhancedLogger.info(`📂 Test data loaded from ${DATA_FILE} for ${xrayTestKey}`, xrayTestKey);

      const loginPage = new LoginPage(page);

      enhancedLogger.step('Step 1: Navigate to the login page', xrayTestKey);
      await loginPage.navigateToLoginPage();

      enhancedLogger.step('Step 2: Enter valid username but wrong password', xrayTestKey);
      await loginPage.login(td.username as string, td.password as string);

      enhancedLogger.step('Step 3: Verify error message is displayed', xrayTestKey);
      await loginPage.verifyLoginErrorMessage(td.expectedErrorMessage as string);

      enhancedLogger.step('Step 4: Verify user is still on the login page', xrayTestKey);
      expect(loginPage.getCurrentUrl()).toContain(td.expectedUrlFragment as string);

      enhancedLogger.pass(`TC02 passed — Error message shown for wrong password`, xrayTestKey);
    }
  );

  // ============================================================================
  // TEST 3: Login Should Fail with Empty Fields
  // ============================================================================
  // WHAT THIS TEST DOES:
  //   1. Opens the login page
  //   2. Clicks Login WITHOUT entering any credentials (empty fields)
  //   3. Verifies the form shows validation errors
  //
  // WHY TEST EMPTY FIELDS?
  //   This tests client-side validation — does the form prevent submission
  //   when required fields are empty? This is important for:
  //     - User experience (clear guidance on what's required)
  //     - Security (preventing blank/incomplete requests to the server)
  //
  // EXPECTED OUTCOME: PASS (validation errors are shown)
  // ============================================================================
  test(
    'TC03: Empty credentials should show validation errors',
    {
      annotation: { type: 'xray', description: 'PROJ-103' },
    },
    async ({ page, xrayTestKey }) => {

      // ── Load test data from YAML (data-driven) ──
      const td = getTestData(DATA_FILE, 'PROJ-103');

      // ── Skip if run: no in YAML ──
      if (!isTestEnabled(DATA_FILE, 'PROJ-103')) test.skip();

      enhancedLogger.section(`▶ Running Test: ${td.testCase} | XRAY: ${xrayTestKey}`);
      enhancedLogger.info(`📂 Test data loaded from ${DATA_FILE} for ${xrayTestKey}`, xrayTestKey);

      const loginPage = new LoginPage(page);

      enhancedLogger.step('Step 1: Navigate to the login page', xrayTestKey);
      await loginPage.navigateToLoginPage();

      enhancedLogger.step('Step 2: Click login button without entering credentials', xrayTestKey);
      await loginPage.clickLoginButton();

      enhancedLogger.step('Step 3: Verify validation flash message is shown', xrayTestKey);
      await loginPage.verifyLoginErrorMessage(td.expectedErrorMessage as string);

      const currentUrl = loginPage.getCurrentUrl();
      expect(currentUrl).toContain(td.expectedUrlFragment as string);

      enhancedLogger.info(`Validation confirmed: empty credentials rejected, URL is still: ${currentUrl}`, xrayTestKey);

      enhancedLogger.pass(`TC03 passed — Empty credentials correctly rejected`, xrayTestKey);
    }
  );

});
