// =============================================================================
// utils/excel/data-pool.ts — EXCEL-BASED TEST DATA POOL
// =============================================================================
// PURPOSE:
//   A "data pool" is a collection of test data scenarios stored in an Excel
//   file. This utility manages loading, filtering, and serving that data to
//   your tests.
//
// WHY A DATA POOL?
//   Imagine you need to test a login form with 20 different combinations:
//     - Valid credentials (should succeed)
//     - Wrong passwords (should fail)
//     - SQL injection attempts (should be blocked)
//     - Special characters in username (should handle gracefully)
//     - Very long inputs (should be rejected)
//
//   Without a data pool: You'd write 20 separate test cases. 😰
//   With a data pool:    One test case + 20 rows in Excel. ✅
//
// EXCEL FILE STRUCTURE:
//   Put your Excel test data files in the 'data/' folder at the project root.
//   Example file: data/login-test-data.xlsx
//
//   Required columns:
//   | testId  | scenario          | username | password    | expectedResult | xrayKey  | enabled |
//   |---------|-------------------|----------|-------------|----------------|----------|---------|
//   | TC-001  | Valid login       | alice    | pass123     | success        | PROJ-101 | true    |
//   | TC-002  | Wrong password    | alice    | wrongpass   | error          | PROJ-102 | true    |
//   | TC-003  | Empty username    |          | pass123     | error          | PROJ-103 | true    |
//   | TC-004  | SKIP this one     | alice    | pass123     | success        | PROJ-104 | false   |
//
//   The "enabled" column lets you skip specific rows without deleting them.
//   The "xrayKey" column links the row to a JIRA XRAY test case.
//
// HOW TO USE IN A TEST:
//   import { DataPool } from '../utils/excel/data-pool';
//
//   const pool = new DataPool('data/login-test-data.xlsx');
//   const loginScenarios = pool.getAll();
//
//   for (const scenario of loginScenarios) {
//     test(`Login: ${scenario.scenario}`, async ({ page }) => {
//       await loginPage.login(scenario.username, scenario.password);
//       // ...
//     });
//   }
// =============================================================================

import * as path from 'path';
import * as fs   from 'fs';
import { readExcelSheet, ExcelRow } from './excel-reader';
import { logger } from '../helpers/logger';

// =============================================================================
// TYPE: TestDataRow
// =============================================================================
/**
 * A single test data row from the data pool Excel file.
 * Extends ExcelRow to add specific columns we always expect.
 */
export interface TestDataRow extends ExcelRow {
  /** Unique ID for this test scenario (e.g., TC-001) */
  testId: string;

  /** Human-readable name for this scenario (shown in test names) */
  scenario: string;

  /** Whether this row should be run. Set to 'false' to skip. */
  enabled: string;

  /** Optional: XRAY test case key (e.g., PROJ-101) */
  xrayKey: string;
}

// =============================================================================
// CLASS: DataPool
// =============================================================================
/**
 * Manages a collection of test data loaded from an Excel file.
 *
 * USAGE:
 *   const pool = new DataPool('data/login-test-data.xlsx');
 *
 *   pool.getAll()           // All enabled rows
 *   pool.getById('TC-001')  // One specific row by testId
 *   pool.getByTag('smoke')  // Filter by tag (if 'tags' column exists)
 *   pool.getCount()         // How many rows are loaded
 */
export class DataPool {
  // The loaded rows (filled when the object is created)
  private rows: TestDataRow[] = [];

  // Where the data came from (for error messages)
  private sourceFile: string;

  // ===========================================================================
  // CONSTRUCTOR
  // ===========================================================================
  /**
   * Creates a new DataPool and immediately loads data from the Excel file.
   *
   * @param excelFilePath - Path to the .xlsx file (relative to project root)
   *                        Example: 'data/login-test-data.xlsx'
   * @param sheetName     - Which sheet to read (default: first sheet)
   *
   * EXAMPLE:
   *   const pool = new DataPool('data/login-test-data.xlsx');
   *   const pool = new DataPool('data/all-tests.xlsx', 'LoginTests');
   */
  constructor(excelFilePath: string, sheetName?: string) {
    this.sourceFile = excelFilePath;

    // Resolve to absolute path
    const absolutePath = path.isAbsolute(excelFilePath)
      ? excelFilePath
      : path.resolve(process.cwd(), excelFilePath);

    // Create the data directory and a sample file if neither exists
    // (helpful on first run so users know the expected format)
    this.ensureSampleFileExists(absolutePath);

    // Read the Excel data
    const rawRows = readExcelSheet(absolutePath, { sheetName });

    // Cast to TestDataRow — add defaults for missing columns
    this.rows = rawRows.map((row, index) => ({
      testId:   row['testId']   || row['TestId']   || `TC-${String(index + 1).padStart(3, '0')}`,
      scenario: row['scenario'] || row['Scenario'] || `Scenario ${index + 1}`,
      enabled:  row['enabled']  || row['Enabled']  || 'true',
      xrayKey:  row['xrayKey']  || row['XrayKey']  || row['xray_key'] || '',
      ...row,
    }));

    logger.info(`📊 DataPool loaded: ${this.rows.length} total rows from "${path.basename(excelFilePath)}"`);
    logger.info(`   Enabled rows: ${this.getEnabledCount()} | Skipped rows: ${this.getDisabledCount()}`);
  }

  // ===========================================================================
  // PUBLIC METHODS
  // ===========================================================================

  /**
   * Returns ALL enabled rows from the data pool.
   * Rows with enabled='false' are automatically excluded.
   *
   * This is what you'll use most often in your tests.
   *
   * EXAMPLE:
   *   for (const row of pool.getAll()) {
   *     // row.username, row.password, etc.
   *   }
   */
  getAll(): TestDataRow[] {
    return this.rows.filter(row =>
      row.enabled.toLowerCase() !== 'false' &&
      row.enabled.toLowerCase() !== 'no' &&
      row.enabled.toLowerCase() !== '0'
    );
  }

  /**
   * Returns a single row by its testId column.
   * Returns undefined if not found.
   *
   * EXAMPLE:
   *   const row = pool.getById('TC-001');
   *   if (row) { ... }
   */
  getById(testId: string): TestDataRow | undefined {
    return this.rows.find(row =>
      row.testId?.toLowerCase() === testId.toLowerCase()
    );
  }

  /**
   * Returns rows that contain a specific tag in the 'tags' column.
   * Tags in Excel should be comma-separated: "smoke,regression,login"
   *
   * EXAMPLE:
   *   const smokeTests = pool.getByTag('smoke');
   */
  getByTag(tag: string): TestDataRow[] {
    return this.getAll().filter(row => {
      const tags = (row['tags'] || row['Tags'] || '').split(',').map(t => t.trim().toLowerCase());
      return tags.includes(tag.toLowerCase());
    });
  }

  /**
   * Returns rows where a specific column matches a value.
   * Case-insensitive matching.
   *
   * EXAMPLE:
   *   const errorScenarios = pool.filterBy('expectedResult', 'error');
   */
  filterBy(column: string, value: string): TestDataRow[] {
    return this.getAll().filter(row =>
      String(row[column] || '').toLowerCase() === value.toLowerCase()
    );
  }

  /**
   * Returns how many rows are in the pool (including disabled).
   */
  getCount(): number {
    return this.rows.length;
  }

  /**
   * Returns how many rows are ENABLED (will actually run).
   */
  getEnabledCount(): number {
    return this.getAll().length;
  }

  /**
   * Returns how many rows are DISABLED (skipped).
   */
  getDisabledCount(): number {
    return this.rows.length - this.getEnabledCount();
  }

  /**
   * Returns the column names (from the header row).
   * Useful to verify the Excel file has the expected columns.
   *
   * EXAMPLE:
   *   const columns = pool.getColumns();
   *   // ['testId', 'scenario', 'username', 'password', 'expectedResult', 'xrayKey', 'enabled']
   */
  getColumns(): string[] {
    if (this.rows.length === 0) return [];
    return Object.keys(this.rows[0]);
  }

  /**
   * Prints a summary of the data pool to the terminal.
   * Call this in global setup to show what data is loaded.
   */
  printSummary(): void {
    logger.section(`📊 Data Pool Summary: ${path.basename(this.sourceFile)}`);
    logger.info(`   Total rows:    ${this.getCount()}`);
    logger.info(`   Enabled rows:  ${this.getEnabledCount()} (will run)`);
    logger.info(`   Disabled rows: ${this.getDisabledCount()} (skipped)`);
    logger.info(`   Columns:       ${this.getColumns().join(', ')}`);
  }

  // ===========================================================================
  // PRIVATE HELPERS
  // ===========================================================================

  /**
   * Creates a sample Excel file if the data directory/file doesn't exist.
   * This prevents confusing errors on first run and shows users the expected format.
   */
  private ensureSampleFileExists(absolutePath: string): void {
    const dir = path.dirname(absolutePath);

    // Create the data directory if it doesn't exist
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      logger.info(`📁 Created data directory: ${dir}`);
    }

    // Create a sample file if the specified file doesn't exist
    if (!fs.existsSync(absolutePath)) {
      logger.warn(`⚠️  Data file not found: ${absolutePath}`);
      logger.warn(`   Creating a sample file so you can see the expected format.`);
      logger.warn(`   Fill in your test data and re-run.`);

      // Create sample file using ExcelJS via xlsx
      const XLSX = require('xlsx');
      const sampleData = [
        {
          testId:         'TC-001',
          scenario:       'Valid login with correct credentials',
          username:       'tomsmith',
          password:       'SuperSecretPassword!',
          expectedResult: 'success',
          xrayKey:        'PROJ-101',
          tags:           'smoke,regression',
          enabled:        'true',
        },
        {
          testId:         'TC-002',
          scenario:       'Invalid login with wrong password',
          username:       'tomsmith',
          password:       'WrongPassword',
          expectedResult: 'error',
          xrayKey:        'PROJ-102',
          tags:           'smoke,regression',
          enabled:        'true',
        },
        {
          testId:         'TC-003',
          scenario:       'Login with empty credentials',
          username:       '',
          password:       '',
          expectedResult: 'error',
          xrayKey:        'PROJ-103',
          tags:           'regression',
          enabled:        'true',
        },
        {
          testId:         'TC-004',
          scenario:       'EXAMPLE: Disabled scenario (will be skipped)',
          username:       'testuser',
          password:       'testpass',
          expectedResult: 'success',
          xrayKey:        'PROJ-104',
          tags:           'wip',
          enabled:        'false',
        },
      ];

      const worksheet = XLSX.utils.json_to_sheet(sampleData);
      const workbook  = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'TestData');
      XLSX.writeFile(workbook, absolutePath);

      logger.pass(`✅ Sample data file created: ${absolutePath}`);
    }
  }
}
