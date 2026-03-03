// =============================================================================
// utils/jira-xray/xray-result-updater.ts — TEST RESULT UPDATE UTILITY
// =============================================================================
// PURPOSE:
//   This file contains functions to update test case results in XRAY after
//   Playwright tests have finished running.
//
// THE BIG PICTURE — WHY DO WE NEED THIS?
//   After Playwright runs your tests, it knows which ones passed and which failed.
//   But JIRA doesn't know anything — it's a separate system!
//   This file "bridges the gap": it takes Playwright's results and sends them
//   to XRAY so your JIRA Test Execution shows the correct statuses.
//
// WHAT HAPPENS WHEN A TEST FAILS?
//   When a test fails, we want XRAY to record:
//     1. Status: FAIL (so the team knows it failed)
//     2. Error message: WHY it failed (so the team can investigate)
//     3. Screenshot: WHAT the screen looked like when it failed (visual evidence)
//     4. Log details: Any console logs or network logs captured during the test
//
// WHAT IS "EVIDENCE" IN THIS CONTEXT?
//   Evidence in XRAY is any file attached to a test result to prove/explain
//   what happened. Common evidence types:
//     - Screenshots (PNG images of the browser at the moment of failure)
//     - Videos (recordings of the entire test run)
//     - Log files (text files with console output)
//
// XRAY TEST STATUSES:
//   - "TODO":      Test has not been run yet (default when first linked)
//   - "EXECUTING": Test is currently running
//   - "PASS":      Test ran and passed ✅
//   - "FAIL":      Test ran and failed ❌
//   - "ABORTED":   Test was stopped before completing
// =============================================================================

import * as fs from 'fs';
import * as path from 'path';
import { createJiraApiClient } from './jira-auth';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

/**
 * The possible result statuses we can report to XRAY.
 * Must match the exact strings XRAY expects.
 */
export type XrayTestStatus = 'PASS' | 'FAIL' | 'TODO' | 'ABORTED' | 'EXECUTING';

/**
 * Represents all the information we want to report for one test's result.
 * Playwright generates all of this during/after test execution.
 */
export interface TestResultPayload {
  // The JIRA key of the test case (e.g., "PROJ-101")
  testCaseKey: string;

  // The human-readable test title (e.g., "TC01: Valid credentials should log the user in")
  testName?: string;

  // Whether the test passed or failed: "PASS" or "FAIL"
  status: XrayTestStatus;

  // If the test failed, the error message explaining why
  errorMessage?: string;

  // Path to the screenshot file on disk (e.g., "/tmp/test-results/screenshot.png")
  screenshotPath?: string;

  // Any additional log text to attach (e.g., console output)
  logText?: string;

  // How long the test took to run (in milliseconds)
  durationMs?: number;

  // When the test started running
  startedAt?: string;

  // When the test finished running
  finishedAt?: string;
}

// =============================================================================
// FUNCTION: updateTestCaseResult
// =============================================================================
// PURPOSE:
//   Updates a single test case's result in a XRAY Test Execution.
//   This is called once per test case after it finishes running.
//
// HOW IT WORKS:
//   1. Updates the test status in XRAY (PASS or FAIL)
//   2. If the test failed and there's a screenshot, uploads it as evidence
//   3. If there's an error message, adds it as a comment on the test run
//
// PARAMETERS:
//   - executionKey:  The Test Execution JIRA key (e.g., "PROJ-789")
//   - resultPayload: All result data for the test (status, screenshot, etc.)
//
// RETURNS:
//   true if everything succeeded, false if something went wrong.
// =============================================================================
export async function updateTestCaseResult(
  executionKey: string,
  resultPayload: TestResultPayload
): Promise<boolean> {

  const { testCaseKey, status, errorMessage, screenshotPath, logText, durationMs } = resultPayload;
  const statusEmoji = status === 'PASS' ? '✅' : '❌';

  console.log(`\n${statusEmoji} [XRAY] Updating result for ${testCaseKey}: ${status}`);

  try {
    const jiraClient = createJiraApiClient();

    // ------------------------------------------------------------------
    // STEP 1: Update the test status in XRAY
    // ------------------------------------------------------------------
    // XRAY Server endpoint: PUT /rest/raven/1.0/api/testrun
    //
    // We need to:
    //   a) Find the "test run" record linking this test case to the execution
    //   b) Update its status
    //
    // First, find the test run ID for this test case within the execution.
    // The test run ID is not the same as the test case key — it's a separate
    // internal ID that XRAY creates when you link a test case to an execution.
    const testRunsResponse = await jiraClient.get(
      `/rest/raven/1.0/api/testexecution/${executionKey}/test`
    );

    // Find the specific test run for our test case key
    const allTestRuns: Array<{ key: string; id: number; status: string }> = testRunsResponse.data || [];
    const targetTestRun = allTestRuns.find((run) => run.key === testCaseKey);

    if (!targetTestRun) {
      console.error(`   ❌ Test case ${testCaseKey} not found in execution ${executionKey}`);
      console.error(`   💡 TIP: Make sure this test case was linked during execution creation.`);
      return false;
    }

    const testRunId = targetTestRun.id;
    console.log(`   📋 Found test run ID: ${testRunId}`);

    // ------------------------------------------------------------------
    // STEP 2: Build the update payload
    // ------------------------------------------------------------------
    // We send the new status, timing information, and optionally an error comment.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updatePayload: Record<string, any> = {
      // The new status for this test run
      status,
    };

    // Add start/end times if available (helps with execution reports)
    if (resultPayload.startedAt)  updatePayload.startedOn  = resultPayload.startedAt;
    if (resultPayload.finishedAt) updatePayload.finishedOn = resultPayload.finishedAt;

    // Add execution time comment if we have duration
    if (durationMs !== undefined) {
      const seconds = (durationMs / 1000).toFixed(2);
      updatePayload.comment = `Test completed in ${seconds} seconds.`;
    }

    // If there's an error message, add it to the comment
    if (errorMessage) {
      updatePayload.comment = (updatePayload.comment || '') +
        `\n\n❌ Failure Reason:\n${errorMessage}`;
    }

    // If there are logs, add them to the comment
    if (logText) {
      updatePayload.comment = (updatePayload.comment || '') +
        `\n\n📋 Test Logs:\n${logText}`;
    }

    // ------------------------------------------------------------------
    // STEP 3: Send the status update to XRAY
    // ------------------------------------------------------------------
    // PUT /rest/raven/1.0/api/testrun/{testRunId} updates the specific test run
    await jiraClient.put(
      `/rest/raven/1.0/api/testrun/${testRunId}`,
      updatePayload
    );

    console.log(`   ✅ Status updated to "${status}" for ${testCaseKey}`);

    // ------------------------------------------------------------------
    // STEP 4: Upload screenshot as evidence (only for failures)
    // ------------------------------------------------------------------
    // If the test failed and we have a screenshot, attach it to the test run.
    // This makes it easy for developers to see what went wrong visually.
    if (status === 'FAIL' && screenshotPath) {
      await attachEvidenceToTestRun(jiraClient, testRunId, screenshotPath, 'screenshot');
    }

    return true;

  } catch (error) {
    console.error(`   ❌ Failed to update result for ${testCaseKey}:`, error);
    return false;
  }
}

// =============================================================================
// FUNCTION: updateMultipleTestResults
// =============================================================================
// PURPOSE:
//   Updates results for MULTIPLE test cases at once after all tests finish.
//   This is called in the global teardown hook after the entire test suite runs.
//
// HOW IT WORKS:
//   Loops through all test results and calls updateTestCaseResult() for each.
//   Provides a summary at the end showing how many updates succeeded/failed.
//
// PARAMETERS:
//   - executionKey:  The Test Execution JIRA key
//   - results:       Array of result payloads (one per test case)
//
// RETURNS:
//   An object with counts of successful and failed updates.
// =============================================================================
export async function updateMultipleTestResults(
  executionKey: string,
  results: TestResultPayload[]
): Promise<{ successCount: number; failureCount: number }> {

  console.log(`\n📊 [XRAY] Updating ${results.length} test result(s) in execution ${executionKey}...`);

  let successCount = 0;
  let failureCount = 0;

  // Process each result one by one (sequentially, not parallel)
  // We do this sequentially to avoid overwhelming the JIRA API with too many requests at once.
  for (const result of results) {
    const success = await updateTestCaseResult(executionKey, result);
    if (success) {
      successCount++;
    } else {
      failureCount++;
    }
  }

  // Print a final summary
  console.log(
    `\n📊 [XRAY] Result update summary:\n` +
    `   ✅ Successful: ${successCount}\n` +
    `   ❌ Failed:     ${failureCount}\n` +
    `   📋 Total:      ${results.length}`
  );

  return { successCount, failureCount };
}

// =============================================================================
// FUNCTION: attachEvidenceToTestRun (PRIVATE HELPER)
// =============================================================================
// PURPOSE:
//   Uploads a file (screenshot, log, etc.) to XRAY as "evidence" for a test run.
//   Evidence is displayed in the test run detail view in JIRA.
//
// PARAMETERS:
//   - jiraClient:  The pre-configured JIRA API client
//   - testRunId:   The XRAY internal test run ID
//   - filePath:    Path to the file on disk to upload
//   - fileType:    "screenshot" | "log" — used for logging purposes only
// =============================================================================
async function attachEvidenceToTestRun(
  jiraClient: ReturnType<typeof createJiraApiClient>,
  testRunId: number,
  filePath: string,
  fileType: 'screenshot' | 'log'
): Promise<void> {

  console.log(`   📎 Attaching ${fileType}: ${path.basename(filePath)}...`);

  try {
    // Check if the file actually exists before trying to read it
    if (!fs.existsSync(filePath)) {
      console.warn(`   ⚠️  ${fileType} file not found: ${filePath}`);
      return;
    }

    // Read the file into memory as a Buffer (raw binary data)
    const fileBuffer = fs.readFileSync(filePath);

    // Convert the file to Base64 so it can be sent as JSON
    // Base64 is a text encoding for binary data — all APIs can handle text
    const fileBase64 = fileBuffer.toString('base64');

    // Determine the MIME type (file format identifier)
    // MIME types tell JIRA what kind of file this is:
    //   "image/png"  → PNG screenshot
    //   "text/plain" → Plain text log file
    const mimeType = fileType === 'screenshot' ? 'image/png' : 'text/plain';
    const fileName = path.basename(filePath);

    // Send the evidence to XRAY
    // XRAY Server endpoint: POST /rest/raven/1.0/api/testrun/{id}/attachment
    await jiraClient.post(
      `/rest/raven/1.0/api/testrun/${testRunId}/attachment`,
      {
        data: fileBase64,       // The file content (Base64 encoded)
        filename: fileName,     // What to name the attachment in JIRA
        contentType: mimeType,  // What kind of file it is
      }
    );

    console.log(`   ✅ ${fileType} attached: ${fileName}`);

  } catch (error) {
    // Attachment failure is non-fatal — the status update already succeeded.
    // We log a warning but don't throw an error.
    console.warn(`   ⚠️  Could not attach ${fileType} to test run ${testRunId}:`, error);
  }
}
