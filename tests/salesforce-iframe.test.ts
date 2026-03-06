// =============================================================================
// tests/salesforce-iframe.test.ts — SALESFORCE-STYLE IFRAME TEST SUITE
// =============================================================================
//
// ┌──────────────────────────────────────────────────────────────────────────┐
// │  📖 WHAT IS THIS FILE?                                                   │
// │                                                                          │
// │  This test demonstrates how to handle IFRAMES — a common challenge      │
// │  in enterprise applications like Salesforce, ServiceNow, and Workday.   │
// │                                                                          │
// │  ★ GENERIC IFRAME PATTERN USED IN THIS TEST:                            │
// │    Our BasePage provides helpers so you NEVER manually "switch"         │
// │    in and out of frames.  Every call is a one-liner:                    │
// │                                                                          │
// │    ┌────────────────────────────────────────────────────────────────┐    │
// │    │  // 1. Get the iframe ONCE                                     │    │
// │    │  const frame = basePage.getIframe('#my-iframe');               │    │
// │    │                                                                │    │
// │    │  // 2. Interact — NO manual switch / switchBack needed         │    │
// │    │  await basePage.fillInIframe(frame, '#f', 'val', 'Name');     │    │
// │    │  await basePage.clickInIframe(frame, '.btn', 'Save');         │    │
// │    │  await basePage.selectInIframe(frame, '#d', 'Opt', 'DD');    │    │
// │    │  await basePage.assertTextInIframe(frame, '.m', 'OK', 'Msg');│    │
// │    │                                                                │    │
// │    │  // 3. Work on ANOTHER iframe — just get a new handle          │    │
// │    │  const frame2 = basePage.getIframe('#other-iframe');          │    │
// │    │  await basePage.fillInIframe(frame2, '#city', 'NYC', 'City');│    │
// │    │                                                                │    │
// │    │  // 4. Back to main page? Just use page.locator() as usual   │    │
// │    │  await expect(page.locator('#heading')).toHaveText('Hello'); │    │
// │    └────────────────────────────────────────────────────────────────┘    │
// │                                                                          │
// │  DEMO:                                                                   │
// │    Uses a self-hosted HTML fixture (test-fixtures/iframe-form.html)      │
// │    with TWO iframes containing multiple form fields — exactly like a    │
// │    Salesforce record page with Lead Info + Contact Details sections.     │
// │                                                                          │
// │  HOW TO RUN:                                                             │
// │    npm test                                       → runs ALL tests       │
// │    npx playwright test tests/salesforce-iframe.test.ts → this file only │
// └──────────────────────────────────────────────────────────────────────────┘
//
// =============================================================================

// ─────────────────────────────────────────────────────────────────────────────
// IMPORTS
// ─────────────────────────────────────────────────────────────────────────────
import path from 'path';
import { test, expect } from './xray-test-fixture';
import { BasePage } from '../pages/BasePage';
import { enhancedLogger } from '../utils/helpers/enhanced-logger';
import { getTestData, isTestEnabled } from '../utils/helpers/test-data-loader';

// ─────────────────────────────────────────────────────────────────────────────
// TEST DATA FILE
// ─────────────────────────────────────────────────────────────────────────────
const DATA_FILE = 'ui-tests.yaml';

// ─────────────────────────────────────────────────────────────────────────────
// LOCAL FIXTURE — Self-hosted HTML with two iframes full of form fields.
//   This guarantees the page never goes down (unlike external demo sites).
// ─────────────────────────────────────────────────────────────────────────────
const FIXTURE_PATH = path.resolve(__dirname, '..', 'test-fixtures', 'iframe-form.html');
const FIXTURE_URL  = `file://${FIXTURE_PATH}`;


// =============================================================================
// TEST GROUP: Salesforce-Style Iframe Tests
// =============================================================================
test.describe('Salesforce-Style Iframe Tests', () => {

  // ===========================================================================
  // TEST 12 (TC12):  Fill multiple fields INSIDE iframe #1 (Lead Info)
  // ===========================================================================
  //
  //  SCENARIO:
  //    A Salesforce Lead record has a form inside an iframe.
  //    We fill First Name, Last Name, Company, Email, Phone, Lead Status,
  //    and Description — all inside ONE iframe — then verify them.
  //
  //  IFRAME HELPERS DEMONSTRATED:
  //    ✅ getIframe()           — get the frame handle (one-time)
  //    ✅ fillInIframe()        — fill an <input> inside the iframe
  //    ✅ selectInIframe()      — select a <select> option inside the iframe
  //    ✅ getIframeFieldValue() — read back a field value to verify
  //    ✅ assertVisibleInIframe()
  //
  //  XRAY MAPPING: PROJ-112
  // ===========================================================================
  test(
    'TC12: Iframe — fill multiple form fields inside a single iframe',
    {
      annotation: { type: 'xray', description: 'PROJ-112' },
    },
    async ({ page, xrayTestKey }) => {

      // ── Load test data ──
      const td = getTestData(DATA_FILE, 'PROJ-112');
      if (!isTestEnabled(DATA_FILE, 'PROJ-112')) test.skip();

      enhancedLogger.section(`▶ Running Test: ${td.testCase} | XRAY: ${xrayTestKey}`);
      enhancedLogger.info(`📂 Test data loaded from ${DATA_FILE} for ${xrayTestKey}`, xrayTestKey);

      // ── Create a BasePage — all iframe helpers live here ──
      const basePage = new BasePage(page);

      // ─────────────────────────────────────────────────────────────────────
      // STEP 1: Navigate to the local iframe fixture page
      // ─────────────────────────────────────────────────────────────────────
      enhancedLogger.step('Step 1: Navigate to the iframe fixture page', xrayTestKey);
      await page.goto(FIXTURE_URL, { waitUntil: 'domcontentloaded' });
      enhancedLogger.info('✅ Page loaded', xrayTestKey);

      // ─────────────────────────────────────────────────────────────────────
      // STEP 2: Verify main-page heading (OUTSIDE any iframe)
      //   → Normal page.locator() works — no iframe switching needed.
      // ─────────────────────────────────────────────────────────────────────
      enhancedLogger.step('Step 2: Verify main-page heading (outside iframe)', xrayTestKey);
      await expect(page.locator('#page-title')).toHaveText(td.pageTitle as string);
      enhancedLogger.info('✅ Main-page heading verified', xrayTestKey);

      // ─────────────────────────────────────────────────────────────────────
      // STEP 3: Get the Lead-Info iframe handle — ONE TIME, reuse everywhere
      //
      //   ★ THIS IS THE KEY GENERIC PATTERN:
      //     const frame = basePage.getIframe('<css-selector>');
      //     Now every subsequent call just passes `frame` — no switching.
      // ─────────────────────────────────────────────────────────────────────
      enhancedLogger.step('Step 3: Get iframe handle for Lead Information', xrayTestKey);
      const leadFrame = basePage.getIframe(td.leadIframeSelector as string);

      // ─────────────────────────────────────────────────────────────────────
      // STEP 4: Verify that the First Name field is visible inside iframe
      // ─────────────────────────────────────────────────────────────────────
      enhancedLogger.step('Step 4: Verify First Name field visible inside iframe', xrayTestKey);
      await basePage.assertVisibleInIframe(leadFrame, '#firstName', 'First Name field');
      enhancedLogger.info('✅ First Name field is visible inside iframe', xrayTestKey);

      // ─────────────────────────────────────────────────────────────────────
      // STEP 5: Fill ALL form fields inside the Lead iframe
      //
      //   ★ GENERIC PATTERN — just call fillInIframe() for each field.
      //     No "switchToFrame" / "switchToDefault" gymnastics needed.
      //     Every call targets the same `leadFrame` handle.
      // ─────────────────────────────────────────────────────────────────────
      enhancedLogger.step('Step 5: Fill all lead form fields inside iframe', xrayTestKey);

      await basePage.fillInIframe(leadFrame, '#firstName',   td.firstName   as string, 'First Name');
      await basePage.fillInIframe(leadFrame, '#lastName',    td.lastName    as string, 'Last Name');
      await basePage.fillInIframe(leadFrame, '#company',     td.company     as string, 'Company');
      await basePage.fillInIframe(leadFrame, '#email',       td.email       as string, 'Email');
      await basePage.fillInIframe(leadFrame, '#phone',       td.phone       as string, 'Phone');
      await basePage.fillInIframe(leadFrame, '#description', td.description as string, 'Description');

      // ── Select a dropdown value inside the iframe ──
      await basePage.selectInIframe(leadFrame, '#leadStatus', td.leadStatus as string, 'Lead Status');

      enhancedLogger.info('✅ All 7 lead fields filled inside iframe', xrayTestKey);

      // ─────────────────────────────────────────────────────────────────────
      // STEP 6: Verify field values by reading them back
      //
      //   ★ getIframeFieldValue() reads an <input>'s value inside an iframe.
      // ─────────────────────────────────────────────────────────────────────
      enhancedLogger.step('Step 6: Read back and verify field values', xrayTestKey);

      const actualFirst = await basePage.getIframeFieldValue(leadFrame, '#firstName');
      const actualLast  = await basePage.getIframeFieldValue(leadFrame, '#lastName');
      const actualComp  = await basePage.getIframeFieldValue(leadFrame, '#company');
      const actualEmail = await basePage.getIframeFieldValue(leadFrame, '#email');
      const actualPhone = await basePage.getIframeFieldValue(leadFrame, '#phone');

      expect(actualFirst).toBe(td.firstName);
      expect(actualLast).toBe(td.lastName);
      expect(actualComp).toBe(td.company);
      expect(actualEmail).toBe(td.email);
      expect(actualPhone).toBe(td.phone);

      enhancedLogger.info(`✅ Verified — First: ${actualFirst}, Last: ${actualLast}, Company: ${actualComp}`, xrayTestKey);

      // ─────────────────────────────────────────────────────────────────────
      // STEP 7: Back to main page — just use page.locator() (no switch)
      // ─────────────────────────────────────────────────────────────────────
      enhancedLogger.step('Step 7: Verify main-page heading still accessible (no switch needed)', xrayTestKey);
      await expect(page.locator('#page-title')).toBeVisible();
      enhancedLogger.info('✅ Main-page still accessible — no iframe switch-back needed', xrayTestKey);

      enhancedLogger.pass('TC12 passed — filled & verified 7 fields inside a single iframe', xrayTestKey);
    }
  );


  // ===========================================================================
  // TEST 13 (TC13):  Work across TWO different iframes + main page
  // ===========================================================================
  //
  //  SCENARIO:
  //    A Salesforce record page has TWO iframe sections:
  //      iframe #1 — Lead Information (name, company, email …)
  //      iframe #2 — Contact Details  (address, city, country …)
  //    The test fills fields in BOTH iframes AND verifies elements on the
  //    main page — demonstrating seamless multi-iframe handling.
  //
  //  IFRAME HELPERS DEMONSTRATED:
  //    ✅ getIframe() for iframe #1  AND  getIframe() for iframe #2
  //    ✅ fillInIframe() across both frames
  //    ✅ selectInIframe() for dropdowns in both frames
  //    ✅ clickInIframe() for the Save button in iframe #2
  //    ✅ assertTextInIframe() for the success message in iframe #2
  //    ✅ Main-page assertions between iframe interactions
  //
  //  XRAY MAPPING: PROJ-113
  // ===========================================================================
  test(
    'TC13: Iframe — fill fields across TWO iframes and verify',
    {
      annotation: { type: 'xray', description: 'PROJ-113' },
    },
    async ({ page, xrayTestKey }) => {

      // ── Load test data ──
      const td = getTestData(DATA_FILE, 'PROJ-113');
      if (!isTestEnabled(DATA_FILE, 'PROJ-113')) test.skip();

      enhancedLogger.section(`▶ Running Test: ${td.testCase} | XRAY: ${xrayTestKey}`);
      enhancedLogger.info(`📂 Test data loaded from ${DATA_FILE} for ${xrayTestKey}`, xrayTestKey);

      const basePage = new BasePage(page);

      // ─────────────────────────────────────────────────────────────────────
      // STEP 1: Navigate
      // ─────────────────────────────────────────────────────────────────────
      enhancedLogger.step('Step 1: Navigate to the iframe fixture page', xrayTestKey);
      await page.goto(FIXTURE_URL, { waitUntil: 'domcontentloaded' });

      // ─────────────────────────────────────────────────────────────────────
      // STEP 2: Get BOTH iframe handles up front
      //   ★ You can hold multiple frame handles at the same time.
      //     Jump between them freely — no "switch to default" needed.
      // ─────────────────────────────────────────────────────────────────────
      enhancedLogger.step('Step 2: Get frame handles for BOTH iframes', xrayTestKey);
      const leadFrame    = basePage.getIframe(td.leadIframeSelector    as string);
      const contactFrame = basePage.getIframe(td.contactIframeSelector as string);
      enhancedLogger.info('✅ Got handles for Lead iframe + Contact iframe', xrayTestKey);

      // ─────────────────────────────────────────────────────────────────────
      // STEP 3: Fill fields in IFRAME #1 (Lead Information)
      // ─────────────────────────────────────────────────────────────────────
      enhancedLogger.step('Step 3: Fill lead fields in iframe #1', xrayTestKey);
      await basePage.fillInIframe(leadFrame, '#firstName', td.firstName as string, 'First Name');
      await basePage.fillInIframe(leadFrame, '#lastName',  td.lastName  as string, 'Last Name');
      await basePage.fillInIframe(leadFrame, '#company',   td.company   as string, 'Company');
      enhancedLogger.info('✅ Lead fields filled in iframe #1', xrayTestKey);

      // ─────────────────────────────────────────────────────────────────────
      // STEP 4: Jump to IFRAME #2 (Contact Details) — just use contactFrame
      //   ★ No "switchToDefaultContent" needed — just use the other handle.
      // ─────────────────────────────────────────────────────────────────────
      enhancedLogger.step('Step 4: Fill contact fields in iframe #2', xrayTestKey);
      await basePage.fillInIframe(contactFrame, '#street',  td.street  as string, 'Street');
      await basePage.fillInIframe(contactFrame, '#city',    td.city    as string, 'City');
      await basePage.fillInIframe(contactFrame, '#state',   td.state   as string, 'State');
      await basePage.fillInIframe(contactFrame, '#zip',     td.zip     as string, 'Zip Code');
      await basePage.fillInIframe(contactFrame, '#website', td.website as string, 'Website');

      // ── Select Country dropdown inside iframe #2 ──
      await basePage.selectInIframe(contactFrame, '#country', td.country as string, 'Country');
      enhancedLogger.info('✅ Contact fields filled in iframe #2', xrayTestKey);

      // ─────────────────────────────────────────────────────────────────────
      // STEP 5: Click "Save" button INSIDE iframe #2
      // ─────────────────────────────────────────────────────────────────────
      enhancedLogger.step('Step 5: Click Save button inside iframe #2', xrayTestKey);
      await basePage.clickInIframe(contactFrame, '#save-btn', 'Save Contact button');
      enhancedLogger.info('✅ Save button clicked inside iframe #2', xrayTestKey);

      // ─────────────────────────────────────────────────────────────────────
      // STEP 6: Verify success message INSIDE iframe #2
      // ─────────────────────────────────────────────────────────────────────
      enhancedLogger.step('Step 6: Verify success message in iframe #2', xrayTestKey);
      await basePage.assertTextInIframe(contactFrame, '#save-msg', 'Contact saved successfully', 'Save confirmation');
      enhancedLogger.info('✅ Success message verified inside iframe #2', xrayTestKey);

      // ─────────────────────────────────────────────────────────────────────
      // STEP 7: Jump BACK to iframe #1 — verify the fields we filled earlier
      //   ★ No "switch" needed — just reuse the leadFrame handle.
      // ─────────────────────────────────────────────────────────────────────
      enhancedLogger.step('Step 7: Verify lead fields still populated in iframe #1', xrayTestKey);
      const actualFirst = await basePage.getIframeFieldValue(leadFrame, '#firstName');
      const actualComp  = await basePage.getIframeFieldValue(leadFrame, '#company');
      expect(actualFirst).toBe(td.firstName);
      expect(actualComp).toBe(td.company);
      enhancedLogger.info(`✅ Iframe #1 fields still correct — First: ${actualFirst}, Company: ${actualComp}`, xrayTestKey);

      // ─────────────────────────────────────────────────────────────────────
      // STEP 8: Verify main-page heading (outside all iframes)
      // ─────────────────────────────────────────────────────────────────────
      enhancedLogger.step('Step 8: Verify main-page heading (outside iframes)', xrayTestKey);
      await expect(page.locator('#page-title')).toHaveText(td.pageTitle as string);
      enhancedLogger.info('✅ Main-page heading verified — seamless multi-iframe test done', xrayTestKey);

      enhancedLogger.pass('TC13 passed — filled & verified fields across TWO iframes + main page', xrayTestKey);
    }
  );

});
