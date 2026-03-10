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
import { test, expect } from '../utils/framework/xray-test-fixture';
import { BasePage } from '../pages/BasePage';
import { enhancedLogger } from '../utils/helpers/enhanced-logger';
import { getTestData, getTestDataSets, isTestEnabled } from '../utils/helpers/test-data-loader';

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
  // ── Data-driven: load all data sets for PROJ-112 ──
  const proj112Enabled = isTestEnabled(DATA_FILE, 'PROJ-112');
  const proj112Sets    = getTestDataSets(DATA_FILE, 'PROJ-112');

  for (const ds of proj112Sets) {
  test(
    `TC12: Iframe — fill multiple form fields inside a single iframe [${ds.label}]`,
    {
      annotation: { type: 'xray', description: 'PROJ-112' },
    },
    async ({ page, xrayTestKey }) => {
      if (!proj112Enabled) test.skip();

      enhancedLogger.section(`▶ Running Test: TC12 [${ds.label}] | XRAY: ${xrayTestKey}`);
      enhancedLogger.info(`📂 Test data loaded from ${DATA_FILE} for ${xrayTestKey} [${ds.label}]`, xrayTestKey);

      const basePage = new BasePage(page);

      // Step 1: Navigate to the local iframe fixture page
      enhancedLogger.step('Step 1: Navigate to the iframe fixture page', xrayTestKey);
      await page.goto(FIXTURE_URL, { waitUntil: 'domcontentloaded' });
      enhancedLogger.info('✅ Page loaded', xrayTestKey);

      // Step 2: Verify main-page heading (OUTSIDE any iframe)
      enhancedLogger.step('Step 2: Verify main-page heading (outside iframe)', xrayTestKey);
      await expect(page.locator('#page-title')).toHaveText(ds.pageTitle as string);
      enhancedLogger.info('✅ Main-page heading verified', xrayTestKey);

      // Step 3: Get the Lead-Info iframe handle
      enhancedLogger.step('Step 3: Get iframe handle for Lead Information', xrayTestKey);
      const leadFrame = basePage.getIframe(ds.leadIframeSelector as string);

      // Step 4: Verify that the First Name field is visible inside iframe
      enhancedLogger.step('Step 4: Verify First Name field visible inside iframe', xrayTestKey);
      await basePage.assertVisibleInIframe(leadFrame, '#firstName', 'First Name field');
      enhancedLogger.info('✅ First Name field is visible inside iframe', xrayTestKey);

      // Step 5: Fill ALL form fields inside the Lead iframe
      enhancedLogger.step('Step 5: Fill all lead form fields inside iframe', xrayTestKey);
      await basePage.fillInIframe(leadFrame, '#firstName',   ds.firstName   as string, 'First Name');
      await basePage.fillInIframe(leadFrame, '#lastName',    ds.lastName    as string, 'Last Name');
      await basePage.fillInIframe(leadFrame, '#company',     ds.company     as string, 'Company');
      await basePage.fillInIframe(leadFrame, '#email',       ds.email       as string, 'Email');
      await basePage.fillInIframe(leadFrame, '#phone',       ds.phone       as string, 'Phone');
      await basePage.fillInIframe(leadFrame, '#description', ds.description as string, 'Description');
      await basePage.selectInIframe(leadFrame, '#leadStatus', ds.leadStatus as string, 'Lead Status');
      enhancedLogger.info('✅ All 7 lead fields filled inside iframe', xrayTestKey);

      // Step 6: Verify field values by reading them back
      enhancedLogger.step('Step 6: Read back and verify field values', xrayTestKey);
      const actualFirst = await basePage.getIframeFieldValue(leadFrame, '#firstName');
      const actualLast  = await basePage.getIframeFieldValue(leadFrame, '#lastName');
      const actualComp  = await basePage.getIframeFieldValue(leadFrame, '#company');
      const actualEmail = await basePage.getIframeFieldValue(leadFrame, '#email');
      const actualPhone = await basePage.getIframeFieldValue(leadFrame, '#phone');
      expect(actualFirst).toBe(ds.firstName);
      expect(actualLast).toBe(ds.lastName);
      expect(actualComp).toBe(ds.company);
      expect(actualEmail).toBe(ds.email);
      expect(actualPhone).toBe(ds.phone);
      enhancedLogger.info(`✅ Verified — First: ${actualFirst}, Last: ${actualLast}, Company: ${actualComp}`, xrayTestKey);

      // Step 7: Back to main page
      enhancedLogger.step('Step 7: Verify main-page heading still accessible (no switch needed)', xrayTestKey);
      await expect(page.locator('#page-title')).toBeVisible();
      enhancedLogger.info('✅ Main-page still accessible — no iframe switch-back needed', xrayTestKey);

      enhancedLogger.pass('TC12 passed — filled & verified 7 fields inside a single iframe', xrayTestKey);
    }
  );
  } // end for ds of proj112Sets


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
  // ── Data-driven: load all data sets for PROJ-113 ──
  const proj113Enabled = isTestEnabled(DATA_FILE, 'PROJ-113');
  const proj113Sets    = getTestDataSets(DATA_FILE, 'PROJ-113');

  for (const ds of proj113Sets) {
  test(
    `TC13: Iframe — fill fields across TWO iframes and verify [${ds.label}]`,
    {
      annotation: { type: 'xray', description: 'PROJ-113' },
    },
    async ({ page, xrayTestKey }) => {
      if (!proj113Enabled) test.skip();

      enhancedLogger.section(`▶ Running Test: TC13 [${ds.label}] | XRAY: ${xrayTestKey}`);
      enhancedLogger.info(`📂 Test data loaded from ${DATA_FILE} for ${xrayTestKey} [${ds.label}]`, xrayTestKey);

      const basePage = new BasePage(page);

      // Step 1: Navigate
      enhancedLogger.step('Step 1: Navigate to the iframe fixture page', xrayTestKey);
      await page.goto(FIXTURE_URL, { waitUntil: 'domcontentloaded' });

      // Step 2: Get BOTH iframe handles
      enhancedLogger.step('Step 2: Get frame handles for BOTH iframes', xrayTestKey);
      const leadFrame    = basePage.getIframe(ds.leadIframeSelector    as string);
      const contactFrame = basePage.getIframe(ds.contactIframeSelector as string);
      enhancedLogger.info('✅ Got handles for Lead iframe + Contact iframe', xrayTestKey);

      // Step 3: Fill fields in IFRAME #1 (Lead Information)
      enhancedLogger.step('Step 3: Fill lead fields in iframe #1', xrayTestKey);
      await basePage.fillInIframe(leadFrame, '#firstName', ds.firstName as string, 'First Name');
      await basePage.fillInIframe(leadFrame, '#lastName',  ds.lastName  as string, 'Last Name');
      await basePage.fillInIframe(leadFrame, '#company',   ds.company   as string, 'Company');
      enhancedLogger.info('✅ Lead fields filled in iframe #1', xrayTestKey);

      // Step 4: Jump to IFRAME #2 (Contact Details)
      enhancedLogger.step('Step 4: Fill contact fields in iframe #2', xrayTestKey);
      await basePage.fillInIframe(contactFrame, '#street',  ds.street  as string, 'Street');
      await basePage.fillInIframe(contactFrame, '#city',    ds.city    as string, 'City');
      await basePage.fillInIframe(contactFrame, '#state',   ds.state   as string, 'State');
      await basePage.fillInIframe(contactFrame, '#zip',     ds.zip     as string, 'Zip Code');
      await basePage.fillInIframe(contactFrame, '#website', ds.website as string, 'Website');
      await basePage.selectInIframe(contactFrame, '#country', ds.country as string, 'Country');
      enhancedLogger.info('✅ Contact fields filled in iframe #2', xrayTestKey);

      // Step 5: Click "Save" button INSIDE iframe #2
      enhancedLogger.step('Step 5: Click Save button inside iframe #2', xrayTestKey);
      await basePage.clickInIframe(contactFrame, '#save-btn', 'Save Contact button');
      enhancedLogger.info('✅ Save button clicked inside iframe #2', xrayTestKey);

      // Step 6: Verify success message INSIDE iframe #2
      enhancedLogger.step('Step 6: Verify success message in iframe #2', xrayTestKey);
      await basePage.assertTextInIframe(contactFrame, '#save-msg', 'Contact saved successfully', 'Save confirmation');
      enhancedLogger.info('✅ Success message verified inside iframe #2', xrayTestKey);

      // Step 7: Jump BACK to iframe #1 — verify fields still populated
      enhancedLogger.step('Step 7: Verify lead fields still populated in iframe #1', xrayTestKey);
      const actualFirst = await basePage.getIframeFieldValue(leadFrame, '#firstName');
      const actualComp  = await basePage.getIframeFieldValue(leadFrame, '#company');
      expect(actualFirst).toBe(ds.firstName);
      expect(actualComp).toBe(ds.company);
      enhancedLogger.info(`✅ Iframe #1 fields still correct — First: ${actualFirst}, Company: ${actualComp}`, xrayTestKey);

      // Step 8: Verify main-page heading (outside all iframes)
      enhancedLogger.step('Step 8: Verify main-page heading (outside iframes)', xrayTestKey);
      await expect(page.locator('#page-title')).toHaveText(ds.pageTitle as string);
      enhancedLogger.info('✅ Main-page heading verified — seamless multi-iframe test done', xrayTestKey);

      enhancedLogger.pass('TC13 passed — filled & verified fields across TWO iframes + main page', xrayTestKey);
    }
  );
  } // end for ds of proj113Sets

});
