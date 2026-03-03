// =============================================================================
// tests/xray-test-fixture.ts — CUSTOM PLAYWRIGHT TEST FIXTURE WITH XRAY
// =============================================================================
// PURPOSE:
//   This file creates a CUSTOM "test" function that extends Playwright's default
//   test function with automatic XRAY result reporting built in.
//
// WHAT IS A "FIXTURE" IN PLAYWRIGHT?
//   A fixture is a reusable setup/teardown piece that is automatically injected
//   into your tests. Think of it like a "smart wrapper" around your test.
//
//   Playwright's default fixtures provide things like: page, browser, context
//   Our custom fixture adds: xrayTestKey, automatic result upload to XRAY
//
// HOW TESTS USE THIS:
//   Instead of: import { test, expect } from '@playwright/test';
//   Tests use:  import { test, expect } from './xray-test-fixture';
//
//   The only difference in the test code is specifying the XRAY test key:
//     test('my test name', { tag: '@PROJ-101' }, async ({ page, xrayTestKey }) => {
//       // xrayTestKey is automatically "PROJ-101" from the tag
//       // After the test, result is automatically sent to XRAY!
//     });
//
// WHAT HAPPENS AUTOMATICALLY (you don't need to write this in every test):
//   BEFORE each test: Nothing special — just provides the xrayTestKey
//   AFTER each test:
//     - Captures screenshot if test FAILED
//     - Reads the test result (pass/fail)
//     - Saves result to shared state file (to be uploaded in global teardown)
// =============================================================================

// Import Playwright's test and expect, plus types
import { test as base, expect } from '@playwright/test';

// Import XRAY state utility to save results
import { appendTestResult } from './xray-state-helper';

// Import screenshot helper
import { captureFailureScreenshot } from '../utils/helpers/screenshot';

// Import the logger
import { logger } from '../utils/helpers/logger';

// Import enhanced logger — collects structured data for the HTML report
import { enhancedLogger } from '../utils/helpers/enhanced-logger';

// Import axe-core accessibility scanner
import AxeBuilder from '@axe-core/playwright';

// =============================================================================
// TYPE: Define what extra things our custom fixture provides
// =============================================================================
// "xrayTestKey" is a string that holds the JIRA issue key for the current test.
// It's extracted from the test's annotations.
type XrayFixtures = {
  xrayTestKey: string;
};

// =============================================================================
// CUSTOM TEST FUNCTION
// =============================================================================
// "base.extend<XrayFixtures>()" creates a new test function that includes
// everything from the base Playwright test PLUS our custom xrayTestKey fixture.
// =============================================================================
export const test = base.extend<XrayFixtures>({

  // --------------------------------------------------------------------------
  // FIXTURE: xrayTestKey
  // --------------------------------------------------------------------------
  // PURPOSE:
  //   Extracts the XRAY test case key from the test's annotations,
  //   and after the test runs, automatically saves the result to shared state.
  //
  // HOW IT WORKS:
  //   1. Before test: Reads the test's annotations to find the XRAY key ("PROJ-101")
  //   2. Handles any cookie banners / popups so they don't break tests
  //   3. "use(xrayTestKey)" → passes the key into the test function
  //   4. After test:  Reads result (pass/fail), captures screenshot if failed,
  //                   saves result to the shared state file
  //
  // In the test file, use annotations to specify the XRAY test key:
  //   test('my test', { annotation: { type: 'xray', description: 'PROJ-101' } }, async ({ xrayTestKey }) => {
  //     console.log(xrayTestKey); // "PROJ-101"
  //   });
  // --------------------------------------------------------------------------
  xrayTestKey: async ({ page }, use, testInfo) => {
    // -----------------------------------------------------------------------
    // PRE-TEST: Extract the XRAY test key from test annotations or tags
    // -----------------------------------------------------------------------
    let xrayKey = 'UNTRACKED';

    const xrayAnnotation = testInfo.annotations.find(
      (annotation) => annotation.type.toLowerCase() === 'xray'
    );

    if (xrayAnnotation?.description) {
      xrayKey = xrayAnnotation.description.trim();
      logger.info(`📎 Test linked to XRAY: ${xrayKey}`);
      enhancedLogger.info(`📎 Test linked to XRAY: ${xrayKey}`, xrayKey);
    } else {
      logger.warn(`Test "${testInfo.title}" has no XRAY annotation — results won't be uploaded.`);
    }

    const startedAt = new Date().toISOString();

    // -----------------------------------------------------------------------
    // Start performance timer for this test
    // -----------------------------------------------------------------------
    enhancedLogger.startTimer(xrayKey);

    // -----------------------------------------------------------------------
    // Intercept all network requests to count them and measure bytes
    // -----------------------------------------------------------------------
    let requestCount = 0;
    let transferBytes = 0;
    page.on('requestfinished', async (request) => {
      requestCount++;
      try {
        const response = await request.response();
        if (response) {
          const body = await response.body().catch(() => Buffer.alloc(0));
          transferBytes += body.length;
        }
      } catch { /* non-fatal */ }
    });

    // -----------------------------------------------------------------------
    // COOKIE BANNER & POPUP HANDLING
    // -----------------------------------------------------------------------
    page.on('dialog', async (dialog) => {
      logger.info(`🍪 Auto-accepting dialog: [${dialog.type()}] "${dialog.message()}"`);
      await dialog.accept();
    });

    // -----------------------------------------------------------------------
    // RUN THE TEST
    // -----------------------------------------------------------------------
    await use(xrayKey);

    // -----------------------------------------------------------------------
    // POST-TEST: Collect performance metrics
    // -----------------------------------------------------------------------
    const durationMs = testInfo.duration;

    // Collect page timing metrics (navigation performance API)
    let pageLoadMs: number | undefined;
    let fcpMs: number | undefined;
    let lcpMs: number | undefined;
    try {
      const perfTiming = await page.evaluate(() => {
        const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
        const paintEntries = performance.getEntriesByType('paint');
        const fcp = paintEntries.find(e => e.name === 'first-contentful-paint');
        const lcp = performance.getEntriesByType('largest-contentful-paint').slice(-1)[0];
        return {
          loadEventEnd:  nav?.loadEventEnd  ?? 0,
          startTime:     nav?.startTime     ?? 0,
          fcp:           fcp?.startTime     ?? 0,
          lcp:           (lcp as PerformanceEntry | undefined)?.startTime ?? 0,
        };
      });
      pageLoadMs = perfTiming.loadEventEnd > 0
        ? Math.round(perfTiming.loadEventEnd - perfTiming.startTime)
        : undefined;
      fcpMs = perfTiming.fcp > 0 ? Math.round(perfTiming.fcp) : undefined;
      lcpMs = perfTiming.lcp > 0 ? Math.round(perfTiming.lcp) : undefined;
    } catch { /* page may be closed — non-fatal */ }

    // Log collected performance data
    enhancedLogger.logPerformance(xrayKey, {
      durationMs,
      pageLoadMs,
      fcpMs,
      lcpMs,
      requestCount: requestCount > 0 ? requestCount : undefined,
      transferBytes: transferBytes > 0 ? transferBytes : undefined,
    });

    // -----------------------------------------------------------------------
    // POST-TEST: Run accessibility scan (axe-core)
    // -----------------------------------------------------------------------
    try {
      const axeResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      enhancedLogger.logAccessibility(xrayKey,
        axeResults.violations.map(v => ({
          id:          v.id,
          impact:      (v.impact ?? 'minor') as 'minor' | 'moderate' | 'serious' | 'critical',
          description: v.description,
          helpUrl:     v.helpUrl,
          nodes:       v.nodes.length,
        }))
      );
    } catch { /* axe may fail on closed/navigated page — non-fatal */ }

    // -----------------------------------------------------------------------
    // POST-TEST: Save result to shared XRAY state
    // -----------------------------------------------------------------------
    const finishedAt = new Date().toISOString();
    const playwrightStatus = testInfo.status;

    let xrayStatus: 'PASS' | 'FAIL' | 'ABORTED' = 'PASS';
    if (playwrightStatus === 'failed' || playwrightStatus === 'timedOut') {
      xrayStatus = 'FAIL';
    } else if (playwrightStatus === 'interrupted') {
      xrayStatus = 'ABORTED';
    }

    if (xrayKey !== 'UNTRACKED') {
      let screenshotPath: string | undefined;
      if (xrayStatus === 'FAIL') {
        logger.step(`Capturing failure screenshot for: ${testInfo.title}`);
        const shot = await captureFailureScreenshot(page, testInfo.title);
        if (shot) screenshotPath = shot;
      }

      let errorMessage: string | undefined;
      if (testInfo.errors.length > 0) {
        errorMessage = testInfo.errors
          .map((e) => e.message || String(e))
          .join('\n\n');
      }

      appendTestResult({
        testCaseKey:  xrayKey,
        testName:     testInfo.title,
        status:       xrayStatus,
        errorMessage,
        screenshotPath,
        durationMs,
        startedAt,
        finishedAt,
      });

      if (xrayStatus === 'PASS') {
        logger.pass(`[${xrayKey}] ${testInfo.title}`);
        enhancedLogger.pass(`[${xrayKey}] ${testInfo.title}`, xrayKey);
      } else {
        logger.fail(`[${xrayKey}] ${testInfo.title}`, errorMessage);
        enhancedLogger.fail(`[${xrayKey}] ${testInfo.title} — ${errorMessage ?? 'unknown error'}`, xrayKey);
      }
    }
  },
});

// Re-export "expect" from Playwright (tests need this for assertions)
export { expect };
