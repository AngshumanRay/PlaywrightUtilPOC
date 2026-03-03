// =============================================================================
// utils/index.ts — BARREL FILE (Central Export for All Utilities)
// =============================================================================
// PURPOSE:
//   This "barrel file" re-exports everything from all utility folders.
//   Instead of remembering the exact file path for each utility, you can
//   import everything from one place.
//
// WITHOUT barrel file (verbose, hard to remember):
//   import { logger } from '../utils/helpers/logger';
//   import { seedTestData } from '../utils/database/test-data-manager';
//
// WITH barrel file (simple, one import source):
//   import { logger, seedTestData } from '../utils';
//
// HOW TO ADD A NEW UTILITY:
//   1. Create your utility folder under utils/ (e.g., utils/my-new-tool/)
//   2. Create your utility file(s) inside it
//   3. Add an export line here: export { ... } from './my-new-tool/my-file';
//   4. That's it! Now anyone can import your utility from '../utils'
// =============================================================================

// Helpers (shared by all utilities)
export { logger }                         from './helpers/logger';
export { enhancedLogger }                 from './helpers/enhanced-logger';
export { captureScreenshot, captureFailureScreenshot } from './helpers/screenshot';

// JIRA XRAY
export { createJiraApiClient, testJiraConnection } from './jira-xray/jira-auth';
export { fetchTestCasesFromTestSet }               from './jira-xray/xray-test-set';
export { createTestExecution, getTestExecutionStatus } from './jira-xray/xray-test-execution';
export { updateMultipleTestResults }               from './jira-xray/xray-result-updater';
export { initializeXrayState, readXrayState, appendTestResult, clearXrayState } from './jira-xray/xray-state';

// Database — legacy manager
export { isDbConfigured, seedTestData, queryTestData, cleanupTestData } from './database/test-data-manager';

// Database — secure connection (new)
export { DbConnection, isDbEnabled }      from './database/db-connection';

// Email
export { isEmailConfigured, waitForEmail, extractVerificationCode, extractLink } from './email/email-verifier';

// API
export { createApiClient, apiGet, apiPost, apiPut, apiDelete } from './api/api-helper';

// Excel / Data Pool
export { readExcelSheet, readExcelAllSheets, getExcelSheetNames, writeExcelResults } from './excel/excel-reader';
export { DataPool }                       from './excel/data-pool';

// Security / Encryption
export { encrypt, decrypt, hashPassword, isEncryptionConfigured } from './security/crypto-helper';

// Reporting
export { generateReport }                 from './reporting/report-generator';
