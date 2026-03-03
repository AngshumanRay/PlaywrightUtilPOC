// =============================================================================
// tests/global-teardown.ts — GLOBAL TEARDOWN (RUNS ONCE AFTER ALL TESTS)
// =============================================================================
// PURPOSE:
//   This file runs ONCE after ALL tests have finished. It's the "cleanup crew".
//
// WHAT IS "GLOBAL TEARDOWN"?
//   The counterpart to globalSetup. It runs after every single test is done.
//   This is the perfect place to:
//     - Upload all collected test results to XRAY
//     - Clean up test data from the database
//     - Generate a final report
//
// UTILITIES HANDLED HERE (each one skips gracefully if not configured):
//   🔹 XRAY     — Upload PASS/FAIL results + screenshots to JIRA
//   🔹 Database — Clean up test data seeded during setup
//
// EXECUTION ORDER:
//   1. Upload results to XRAY (if configured)
//   2. Clean up database test data (if configured)
//   3. Clean up state file
// =============================================================================

// Import Playwright's FullConfig type
import { type FullConfig } from '@playwright/test';

// Import XRAY result updater and state utilities
import { updateMultipleTestResults } from '../utils/jira-xray/xray-result-updater';
import { readXrayState, clearXrayState }   from '../utils/jira-xray/xray-state';
import { getTestExecutionStatus }          from '../utils/jira-xray/xray-test-execution';

// Import optional utility functions
import { isDbConfigured, cleanupTestData }          from '../utils/database/test-data-manager';

// Import report generator (generates a beautiful HTML report with charts)
import { generateReport } from '../utils/reporting/report-generator';

// Import enhanced logger (collects structured data for the report)
import { enhancedLogger } from '../utils/helpers/enhanced-logger';

// Import logger
import { logger } from '../utils/helpers/logger';

// Import config
import { config } from '../config/environment';

// =============================================================================
// GLOBAL TEARDOWN FUNCTION
// =============================================================================
// Playwright calls this automatically after all tests finish.
// =============================================================================
export default async function globalTeardown(_config: FullConfig): Promise<void> {
  logger.section('🏁 GLOBAL TEARDOWN — Post-Run Utilities');

  // ==========================================================================
  // STEP 1: Read the Shared State
  // ==========================================================================
  // Read the state file saved by global-setup.ts.
  // This gives us: the execution key + all test results collected during the run.
  const state = readXrayState();

  if (!state) {
    logger.warn('No XRAY state found. Either setup was skipped, or it failed.');
    logger.warn('Test results will NOT be uploaded to XRAY.');
    return;
  }

  // If the execution key is "NOT_CONFIGURED", XRAY upload is skipped,
  // but we STILL want to generate the HTML report.
  if (state.executionKey === 'NOT_CONFIGURED') {
    logger.warn('XRAY was not configured (execution key is NOT_CONFIGURED).');
    logger.warn('Tests ran, but results were not uploaded to XRAY.');
    clearXrayState();

    // Still generate the HTML report even without XRAY
    await runPostRunTasks(state, _config);
    return;
  }

  logger.info(`Uploading results to Test Execution: ${state.executionKey}`);
  logger.info(`Total results to upload: ${state.results.length}`);

  // ==========================================================================
  // STEP 2: Summarize Results Before Uploading
  // ==========================================================================
  const passedTests  = state.results.filter((r) => r.status === 'PASS');
  const failedTests  = state.results.filter((r) => r.status === 'FAIL');
  const abortedTests = state.results.filter((r) => r.status === 'ABORTED');

  logger.info(`Results summary BEFORE upload:`);
  logger.info(`  ✅ Passed:  ${passedTests.length}`);
  logger.info(`  ❌ Failed:  ${failedTests.length}`);
  logger.info(`  🔶 Aborted: ${abortedTests.length}`);

  if (failedTests.length > 0) {
    logger.warn('Failed tests:');
    failedTests.forEach((r) => {
      logger.fail(r.testCaseKey, r.errorMessage || 'No error message');
    });
  }

  // ==========================================================================
  // STEP 3: Upload Results to XRAY
  // ==========================================================================
  // If there are results to upload, send them all to XRAY now.
  if (state.results.length === 0) {
    logger.warn('No test results to upload. Were any tests mapped to XRAY test cases?');
  } else {
    logger.step(`Uploading ${state.results.length} result(s) to XRAY...`);

    const { successCount, failureCount } = await updateMultipleTestResults(
      state.executionKey,
      state.results
    );

    logger.info(`Upload complete: ${successCount} succeeded, ${failureCount} failed.`);
  }

  // ==========================================================================
  // STEP 4: Fetch and Log Final Execution Status from XRAY
  // ==========================================================================
  // After uploading, fetch the execution status from XRAY to confirm
  // the results were recorded correctly.
  logger.step('Fetching final execution status from XRAY...');
  const finalStatus = await getTestExecutionStatus(state.executionKey);

  if (finalStatus) {
    logger.section(
      `📊 FINAL XRAY EXECUTION STATUS\n` +
      `   Execution: ${state.executionKey}\n` +
      `   Sprint: ${state.sprintNumber}\n` +
      `   Total:   ${finalStatus.total}\n` +
      `   ✅ Passed:  ${finalStatus.passed}\n` +
      `   ❌ Failed:  ${finalStatus.failed}\n` +
      `   ⏳ Pending: ${finalStatus.pending}\n` +
      `\n   View in JIRA: ${process.env['JIRA_BASE_URL']}/browse/${state.executionKey}`
    );
  }

  // ==========================================================================
  // STEP 5: Generate Report + DB cleanup
  // ==========================================================================
  clearXrayState();
  await runPostRunTasks(state, _config);

  logger.section('✅ GLOBAL TEARDOWN COMPLETE — All done!\n   📂 Check reports/ for the HTML execution report.');
}

// =============================================================================
// HELPER: runPostRunTasks
// =============================================================================
// Runs the report generation and DB cleanup.
// Called both in the normal XRAY path AND the NOT_CONFIGURED path so the
// HTML report is ALWAYS generated regardless of XRAY configuration.
// =============================================================================
import { type FullConfig as _FullConfig } from '@playwright/test';

async function runPostRunTasks(state: NonNullable<ReturnType<typeof readXrayState>>, _config: _FullConfig): Promise<void> {
  // Generate HTML report
  logger.section('📊 REPORT — Generating HTML Execution Report');
  try {
    const today = new Date().toISOString().split('T')[0];
    const collectedData = enhancedLogger.getCollectedData();

    await generateReport({
      runDate:      today,
      environment:  config.app.environment,
      testResults:  state.results.map(r => ({
        testCaseKey:    r.testCaseKey,
        status:         (['PASS','FAIL','ABORTED','EXECUTING'].includes(r.status)
          ? r.status
          : 'ABORTED') as 'PASS' | 'FAIL' | 'ABORTED' | 'EXECUTING',
        testName:       r.testName ?? r.testCaseKey,
        durationMs:     r.durationMs,
        errorMessage:   r.errorMessage,
        screenshotPath: r.screenshotPath,
        startedAt:      r.startedAt,
        finishedAt:     r.finishedAt,
      })),
      xrayLink:     state.executionKey !== 'NOT_CONFIGURED'
        ? `${process.env['JIRA_BASE_URL'] ?? ''}/browse/${state.executionKey}`
        : undefined,
      jiraBaseUrl:    process.env['JIRA_BASE_URL'],
      sprintNumber:   state.sprintNumber,
      runStartedAt:   state.runStartedAt,
      logEntries:   collectedData.logs,
      perfData:     collectedData.performance,
      a11yData:     collectedData.accessibility,
    });
  } catch (err) {
    logger.warn(`Could not generate HTML report: ${(err as Error).message}`);
  }

  // DB cleanup
  if (isDbConfigured()) {
    logger.section('🗃️  DATABASE — Cleaning Up Test Data');
    await cleanupTestData();
  }
}
